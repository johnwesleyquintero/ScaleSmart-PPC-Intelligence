/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize single firebase instance
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Enable spreadsheet full access scope
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== "undefined" ? localStorage.getItem("scale_smart_access_token") : null;

// Initialize auth session monitor
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Look up token from localStorage just in case it's in storage but not variable memory
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("scale_smart_access_token") : null;
        if (storedToken) {
          cachedAccessToken = storedToken;
          if (onAuthSuccess) onAuthSuccess(user, storedToken);
        } else {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in via Google popup to get sheets tokens
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google Sheets accessToken from Auth");
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== "undefined" && cachedAccessToken) {
      localStorage.setItem("scale_smart_access_token", cachedAccessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("ScaleSmart Auth Flow Crash:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("scale_smart_access_token");
  }
};
