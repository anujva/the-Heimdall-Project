const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to send email notifications when a new post is created
 * Triggered by new document creation in the 'posts' collection
 */
exports.sendNewPostNotification = functions.firestore
  .document("posts/{postId}")
  .onCreate(async (snapshot, context) => {
    try {
      // Get SendGrid API key from environment config
      const sendgridApiKey = functions.config().sendgrid?.key;
      
      if (!sendgridApiKey) {
        console.error("SendGrid API key not configured");
        return null;
      }
      
      // Set SendGrid API key
      sgMail.setApiKey(sendgridApiKey);
      
      // Get post data
      const postData = snapshot.data();
      const postId = context.params.postId;
      
      if (!postData.title || !postData.content) {
        console.log("Post data incomplete, skipping notification");
        return null;
      }
      
      // Get all subscribers
      const subscribersSnapshot = await admin.firestore()
        .collection("subscribers")
        .get();
        
      if (subscribersSnapshot.empty) {
        console.log("No subscribers to notify");
        return null;
      }
      
      // Extract email addresses
      const emails = [];
      subscribersSnapshot.forEach(doc => {
        const email = doc.data().email;
        if (email) {
          emails.push(email);
        }
      });
      
      if (emails.length === 0) {
        console.log("No valid subscriber emails found");
        return null;
      }
      
      // Prepare email content
      const msg = {
        to: emails,
        from: "notifications@heimdall-project.com", // Replace with your verified sender
        subject: `New Post: ${postData.title}`,
        text: `A new post has been published on The Heimdall Project!\n\nTitle: ${postData.title}\n\n${postData.content}\n\nVisit the forum to join the discussion: https://your-domain.com/pagetwo.html`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">New Post on The Heimdall Project</h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007BFF;">${postData.title}</h3>
              <p style="color: #555; line-height: 1.5;">${postData.content}</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://your-domain.com/pagetwo.html" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join the Discussion</a>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              You received this email because you subscribed to notifications from The Heimdall Project.<br>
              To unsubscribe, please reply to this email with "UNSUBSCRIBE" in the subject line.
            </p>
          </div>
        `
      };
      
      // Send email
      await sgMail.sendMultiple(msg);
      console.log(`Notification emails sent to ${emails.length} subscribers`);
      
      return null;
    } catch (error) {
      console.error("Error sending notification emails:", error);
      return null;
    }
  });

/**
 * Cloud Function to send email notifications when a new comment is added
 * Triggered by new document creation in the 'comments' collection
 */
exports.sendNewCommentNotification = functions.firestore
  .document("comments/{commentId}")
  .onCreate(async (snapshot, context) => {
    try {
      // Get SendGrid API key from environment config
      const sendgridApiKey = functions.config().sendgrid?.key;
      
      if (!sendgridApiKey) {
        console.error("SendGrid API key not configured");
        return null;
      }
      
      // Set SendGrid API key
      sgMail.setApiKey(sendgridApiKey);
      
      // Get comment data
      const commentData = snapshot.data();
      const commentId = context.params.commentId;
      
      if (!commentData.postId || !commentData.text) {
        console.log("Comment data incomplete, skipping notification");
        return null;
      }
      
      // Get the post data
      const postDoc = await admin.firestore()
        .collection("posts")
        .doc(commentData.postId)
        .get();
        
      if (!postDoc.exists) {
        console.log("Post not found, skipping notification");
        return null;
      }
      
      const postData = postDoc.data();
      
      // Get all subscribers
      const subscribersSnapshot = await admin.firestore()
        .collection("subscribers")
        .get();
        
      if (subscribersSnapshot.empty) {
        console.log("No subscribers to notify");
        return null;
      }
      
      // Extract email addresses
      const emails = [];
      subscribersSnapshot.forEach(doc => {
        const email = doc.data().email;
        if (email) {
          emails.push(email);
        }
      });
      
      if (emails.length === 0) {
        console.log("No valid subscriber emails found");
        return null;
      }
      
      // Prepare email content
      const msg = {
        to: emails,
        from: "notifications@heimdall-project.com", // Replace with your verified sender
        subject: `New Comment on: ${postData.title}`,
        text: `A new comment has been added to a post on The Heimdall Project!\n\nPost: ${postData.title}\n\nComment: ${commentData.text}\n\nVisit the forum to join the discussion: https://your-domain.com/pagetwo.html`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">New Comment on The Heimdall Project</h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #007BFF;">Post: ${postData.title}</h3>
              <p style="color: #555; line-height: 1.5;"><strong>New Comment:</strong> ${commentData.text}</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://your-domain.com/pagetwo.html" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Join the Discussion</a>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              You received this email because you subscribed to notifications from The Heimdall Project.<br>
              To unsubscribe, please reply to this email with "UNSUBSCRIBE" in the subject line.
            </p>
          </div>
        `
      };
      
      // Send email
      await sgMail.sendMultiple(msg);
      console.log(`Comment notification emails sent to ${emails.length} subscribers`);
      
      return null;
    } catch (error) {
      console.error("Error sending comment notification emails:", error);
      return null;
    }
  });