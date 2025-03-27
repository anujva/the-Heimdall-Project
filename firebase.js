// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Posts collection operations
export async function createPost(title, content) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      title: title,
      content: content,
      timestamp: serverTimestamp(),
      comments: [] // Initialize with empty comments array
    });
    console.log("Post created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post: ", error);
    throw error;
  }
}

export async function getPosts() {
  try {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(postsQuery);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        timestamp: data.timestamp?.toMillis() || Date.now(),
        comments: data.comments || []
      });
    });
    
    return posts;
  } catch (error) {
    console.error("Error getting posts: ", error);
    throw error;
  }
}

export async function deletePost(postId) {
  try {
    // Delete the post document
    await deleteDoc(doc(db, "posts", postId));
    
    // Delete all comments associated with this post
    const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    const deletePromises = [];
    commentsSnapshot.forEach((commentDoc) => {
      deletePromises.push(deleteDoc(doc(db, "comments", commentDoc.id)));
    });
    
    await Promise.all(deletePromises);
    console.log("Post and its comments deleted successfully");
  } catch (error) {
    console.error("Error deleting post: ", error);
    throw error;
  }
}

// Comments collection operations
export async function addComment(postId, text) {
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      postId: postId,
      text: text,
      timestamp: serverTimestamp()
    });
    console.log("Comment added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment: ", error);
    throw error;
  }
}

export async function getComments(postId) {
  try {
    const commentsQuery = query(
      collection(db, "comments"), 
      where("postId", "==", postId),
      orderBy("timestamp", "asc")
    );
    
    const querySnapshot = await getDocs(commentsQuery);
    
    const comments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        text: data.text,
        timestamp: data.timestamp?.toMillis() || Date.now()
      });
    });
    
    return comments;
  } catch (error) {
    console.error("Error getting comments: ", error);
    throw error;
  }
}

export async function deleteComment(commentId) {
  try {
    await deleteDoc(doc(db, "comments", commentId));
    console.log("Comment deleted successfully");
  } catch (error) {
    console.error("Error deleting comment: ", error);
    throw error;
  }
}

// Subscribers collection operations
export async function addSubscriber(email) {
  try {
    // Check if subscriber already exists
    const subscribersQuery = query(collection(db, "subscribers"), where("email", "==", email));
    const querySnapshot = await getDocs(subscribersQuery);
    
    if (!querySnapshot.empty) {
      console.log("Subscriber already exists");
      return { success: true, message: "You are already subscribed!" };
    }
    
    const docRef = await addDoc(collection(db, "subscribers"), {
      email: email,
      subscribedAt: serverTimestamp()
    });
    
    console.log("Subscriber added with ID: ", docRef.id);
    return { success: true, message: "Subscription successful!" };
  } catch (error) {
    console.error("Error adding subscriber: ", error);
    return { success: false, message: "Subscription failed. Please try again." };
  }
}

// Migration function to move data from localStorage to Firestore
export async function migrateLocalStorageToFirestore() {
  try {
    // Get posts from localStorage
    const localPosts = JSON.parse(localStorage.getItem("posts")) || [];
    
    if (localPosts.length === 0) {
      console.log("No posts to migrate from localStorage");
      return;
    }
    
    // Migrate each post and its comments to Firestore
    for (const post of localPosts) {
      // Create post in Firestore
      const postRef = await addDoc(collection(db, "posts"), {
        title: post.title,
        content: post.content,
        timestamp: new Date(post.timestamp)
      });
      
      // Migrate comments if they exist
      if (post.comments && post.comments.length > 0) {
        for (const comment of post.comments) {
          await addDoc(collection(db, "comments"), {
            postId: postRef.id,
            text: comment.text,
            timestamp: new Date(comment.id) // Using comment.id as timestamp since it was created using Date.now()
          });
        }
      }
    }
    
    console.log("Migration from localStorage to Firestore completed successfully");
  } catch (error) {
    console.error("Error during migration: ", error);
    throw error;
  }
}

// Function to notify subscribers about new posts
export async function notifySubscribersAboutNewPost(title, content) {
  try {
    const notifyFunction = httpsCallable(functions, 'sendNewPostNotification');
    const result = await notifyFunction({ title, content });
    return result.data;
  } catch (error) {
    console.error("Error notifying subscribers: ", error);
    throw error;
  }
}