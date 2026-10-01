import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { SocialPost, UserLocationSettings } from "../types";

export const GOOGLE_WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/user.addresses.read",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"
];

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Attach Google People & Contacts scopes
GOOGLE_WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});
googleProvider.setCustomParameters({
  prompt: "consent"
});

export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// In-memory access token caching per Workspace guidelines
let cachedGoogleAccessToken: string | null = null;

export function setCachedGoogleAccessToken(token: string | null) {
  cachedGoogleAccessToken = token;
}

export function getCachedGoogleAccessToken(): string | null {
  return cachedGoogleAccessToken;
}

// Clear token on sign out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedGoogleAccessToken = null;
  }
});

// Standard Firestore Error Handler according to Firebase skill requirements
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore connection check: client is offline or database initializing.");
    }
  }
}

// User Saved Bookmarked Posts
export async function savePostToFirestore(userId: string, post: SocialPost) {
  try {
    const postRef = doc(db, "users", userId, "savedPosts", post.id);
    await setDoc(postRef, {
      ...post,
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Failed to save post to Firestore:", err);
  }
}

export async function removeSavedPostFromFirestore(userId: string, postId: string) {
  try {
    const postRef = doc(db, "users", userId, "savedPosts", postId);
    await deleteDoc(postRef);
  } catch (err) {
    console.warn("Failed to remove saved post from Firestore:", err);
  }
}

export async function fetchSavedPostsFromFirestore(userId: string): Promise<SocialPost[]> {
  try {
    const colRef = collection(db, "users", userId, "savedPosts");
    const snapshot = await getDocs(colRef);
    const list: SocialPost[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as SocialPost);
    });
    return list;
  } catch (err) {
    console.warn("Failed to fetch saved posts:", err);
    return [];
  }
}

// User Location Preferences
export async function saveUserLocationToFirestore(userId: string, location: UserLocationSettings) {
  try {
    const locRef = doc(db, "users", userId, "settings", "location");
    await setDoc(locRef, {
      ...location,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Failed to save location settings to Firestore:", err);
  }
}

export async function fetchUserLocationFromFirestore(userId: string): Promise<UserLocationSettings | null> {
  try {
    const locRef = doc(db, "users", userId, "settings", "location");
    const snapshot = await getDocFromServer(locRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserLocationSettings;
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch location settings from Firestore:", err);
    return null;
  }
}

// Public community posts created by users
export async function createCommunityPostInFirestore(post: SocialPost) {
  try {
    const postRef = doc(db, "community_posts", post.id);
    await setDoc(postRef, {
      ...post,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Failed to create community post in Firestore:", err);
  }
}

export async function fetchCommunityPostsFromFirestore(): Promise<SocialPost[]> {
  try {
    const postsCol = collection(db, "community_posts");
    const q = query(postsCol, orderBy("timestamp", "desc"), limit(30));
    const snapshot = await getDocs(q);
    const posts: SocialPost[] = [];
    snapshot.forEach((d) => {
      posts.push(d.data() as SocialPost);
    });
    return posts;
  } catch (err) {
    console.warn("Failed to fetch community posts from Firestore:", err);
    return [];
  }
}

// -------------------------------------------------------------
// Live Locations (Google Account Contacts & Live Beacon Presence)
// -------------------------------------------------------------
import { LiveUserLocation } from "../types";

export async function publishLiveLocationToFirestore(userId: string, loc: LiveUserLocation) {
  const path = `live_locations/${userId}`;
  try {
    const locRef = doc(db, "live_locations", userId);
    await setDoc(locRef, {
      ...loc,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeLiveLocationFromFirestore(userId: string) {
  const path = `live_locations/${userId}`;
  try {
    const locRef = doc(db, "live_locations", userId);
    await deleteDoc(locRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToLiveLocationsFromFirestore(
  onUpdate: (locations: LiveUserLocation[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, "live_locations");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: LiveUserLocation[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as LiveUserLocation);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn("Live locations snapshot error:", err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "live_locations");
    }
  );
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
};
export type { User };

