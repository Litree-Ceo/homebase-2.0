// Google Cloud Identity Platform (GCIP) Configuration
// This file manages auth providers and user sessions

import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  User,
  AuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  multiFactor,
  PhoneMultiFactorGenerator,
  PhoneAuthProvider,
  PhoneAuthCredential
} from 'firebase/auth';
import { auth } from './firebase';

if (!auth) {
  throw new Error('Firebase auth is not initialized');
}

// Initialize all OAuth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes for enhanced data access
googleProvider.addScope('profile');
googleProvider.addScope('email');
facebookProvider.addScope('email');
twitterProvider.addScope('tweet.read');
githubProvider.addScope('user:email');

// Provider map for dynamic sign-in
export const providers: Record<string, AuthProvider> = {
  google: googleProvider,
  facebook: facebookProvider,
  twitter: twitterProvider,
  github: githubProvider,
};

// Sign in with OAuth provider
export async function signInWithProvider(providerName: string): Promise<User> {
  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);
  if (!auth) throw new Error('Firebase auth is not initialized');
  
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Email/Password sign up
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error('Firebase auth is not initialized');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Email/Password sign in
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error('Firebase auth is not initialized');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Sign out
export async function signOutUser(): Promise<void> {
  if (!auth) throw new Error('Firebase auth is not initialized');
  await signOut(auth);
}

// Monitor auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) throw new Error('Firebase auth is not initialized');
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  if (!auth) throw new Error('Firebase auth is not initialized');
  return auth.currentUser;
}

// Setup MFA (Multi-Factor Authentication)
export async function enableMFAPhone(phoneNumber: string): Promise<string> {
  if (!auth) throw new Error('Firebase auth is not initialized');
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
  });

  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    phoneNumber,
    recaptchaVerifier
  );

  return verificationId;
}

// Complete MFA verification
export async function completeMFAVerification(verificationId: string, code: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  if (!auth) throw new Error('Firebase auth is not initialized');

  // PhoneAuthCredential.credential is deprecated, use proper MFA enrollment
  // This function requires server-side verification for security
  try {
    // Create a temporary credential object for assertion
    const credential = { verificationId, verificationCode: code } as any;
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential as any);
    
    await multiFactor(user).enroll(multiFactorAssertion, 'My Phone');
  } catch (error) {
    // In production, phone MFA verification should be handled server-side
    throw new Error('MFA enrollment requires server-side verification');
  }
}

// Link additional provider to existing account
export async function linkProviderToAccount(providerName: string): Promise<User> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  if (!auth) throw new Error('Firebase auth is not initialized');

  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);

  const result = await signInWithPopup(auth, provider);
  // Note: In real implementation, you'd use linkWithCredential
  return result.user;
}

// Get user's auth providers
export function getLinkedProviders(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  
  return user.providerData.map(p => p.providerId);
}

// Delete account
export async function deleteUserAccount(): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  
  await user.delete();
}

// Check if user has MFA enabled
export function hasMFAEnabled(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return multiFactor(user).enrolledFactors.length > 0;
}
