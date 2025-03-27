# The Heimdall Project - Firebase Implementation

This document provides instructions for setting up and deploying The Heimdall Project using Firebase services.

## Project Overview

The Heimdall Project is an anonymous forum platform with the following features:
- Anonymous posting and commenting
- Cloud storage using Firebase Firestore
- Email notifications using Firebase Cloud Functions and SendGrid
- Hosting on Firebase Hosting

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. A Firebase account
4. A SendGrid account for email notifications

## Setup Instructions

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Firestore database in your project
4. Set up Firebase Hosting

### 2. Configure Firebase in the Project

1. In the Firebase console, go to Project Settings
2. Scroll down to "Your apps" section and click the web app icon
3. Register your app and copy the Firebase configuration
4. Replace the placeholder configuration in the following files:
   - `firebase.js`
   - `index.html`
   - `pagetwo.html`
   - `contacts.html`

### 3. Set Up SendGrid

1. Create a [SendGrid account](https://sendgrid.com/)
2. Create an API key with mail sending permissions
3. Verify a sender email address in SendGrid
4. Update the sender email in `functions/index.js`

### 4. Configure Firebase CLI

1. Login to Firebase CLI:
   ```
   firebase login
   ```

2. Initialize your project:
   ```
   firebase init
   ```
   - Select Firestore, Functions, and Hosting
   - Use existing project and select your Firebase project
   - Accept the default options for Firestore rules and indexes
   - Select JavaScript for Functions
   - Choose "." as your public directory for Hosting
   - Configure as a single-page app: No

3. Set up SendGrid API key in Firebase Functions config:
   ```
   firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
   ```

### 5. Deploy to Firebase

Deploy everything to Firebase:
```
firebase deploy
```

Or deploy individual services:
```
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy --only functions
```

## Project Structure

- `firebase.js`: Firebase configuration and Firestore operations
- `index.html`: Landing page
- `pagetwo.html`: Forum page with posts and comments
- `contacts.html`: Contact information
- `functions/`: Firebase Cloud Functions for email notifications
- `firebase.json`: Firebase configuration
- `firestore.rules`: Security rules for Firestore
- `firestore.indexes.json`: Indexes for Firestore queries

## Local Development

1. Start Firebase emulators:
   ```
   firebase emulators:start
   ```

2. Access the local development server at `http://localhost:5000`

## Free Tier Usage Considerations

### Firebase Firestore
- Free tier: 1GB storage, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- Optimization: Implement pagination for posts to reduce read operations

### Firebase Hosting
- Free tier: 10GB storage, 360MB/day data transfer
- Optimization: Optimize images and assets

### Firebase Cloud Functions
- Free tier: 2M invocations/month, 400,000 GB-seconds, 200,000 CPU-seconds
- Optimization: Implement batching for notifications

### SendGrid
- Free tier: 100 emails/day
- Optimization: Implement rate limiting for notifications

## Troubleshooting

### Common Issues

1. **Firebase initialization error**
   - Check that your Firebase configuration is correct in all files

2. **Cloud Functions deployment fails**
   - Ensure you're using a compatible Node.js version (check `engines` in `functions/package.json`)
   - Check for syntax errors in your functions code

3. **SendGrid emails not sending**
   - Verify your SendGrid API key is correctly set in Firebase Functions config
   - Ensure your sender email is verified in SendGrid

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [SendGrid Documentation](https://sendgrid.com/docs)