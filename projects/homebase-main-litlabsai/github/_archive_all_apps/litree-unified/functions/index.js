import functions from 'firebase-functions';
import admin from 'firebase-admin';

admin.initializeApp();

// Example function: Add user to database when they sign up
exports.addUserToDatabase = functions.auth.user().onCreate(user => {
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// Example function: Send welcome email
exports.sendWelcomeEmail = functions.auth.user().onCreate(user => {
  // Add your email service integration here
  console.log('Welcome email sent to:', user.email);
  return null;
});
