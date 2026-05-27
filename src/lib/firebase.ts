import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we have complete credentials to run real Firebase Auth
const hasCredentials = 
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const useMock = !hasCredentials;

let auth: any = null;
let provider: any = null;

if (!useMock) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to mock auth:", error);
  }
}

/**
 * Triggers Google Sign-In.
 * Automatically falls back to Mock Google Sign-In if real credentials aren't present.
 */
export const signInWithGoogle = async (): Promise<{
  idToken: string;
  user: {
    name: string | null;
    email: string | null;
    photoURL: string | null;
  };
  isMock: boolean;
}> => {
  if (useMock || !auth || !provider) {
    console.warn("⚠️ Using Mock Google Sign-In. Add Firebase env variables to .env.local to enable real Firebase.");
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return a mock payload representing Google Sign-In success
    return {
      idToken: "mock-google-id-token-rahul",
      user: {
        name: "Rahul Verma",
        email: "rahul@example.com",
        photoURL: "/avatars/rahul.jpg",
      },
      isMock: true,
    };
  }

  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return {
      idToken,
      user: {
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      },
      isMock: false,
    };
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
};
