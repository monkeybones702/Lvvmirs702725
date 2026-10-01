import {
  OAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signOut,
  linkWithPopup,
  User
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export type SupportedOAuthProviderKey = "google" | "x" | "apple" | "facebook" | "microsoft";

export interface OAuthProviderConfig {
  key: SupportedOAuthProviderKey;
  name: string;
  brandColor: string;
  textColor: string;
  iconName: string;
  description: string;
  providerId: string;
}

export const SUPPORTED_OAUTH_PROVIDERS: OAuthProviderConfig[] = [
  {
    key: "google",
    name: "Google",
    brandColor: "#4285F4",
    textColor: "#ffffff",
    iconName: "google",
    description: "Official Google Workspace & personal account login",
    providerId: "google.com"
  },
  {
    key: "x",
    name: "X (Twitter)",
    brandColor: "#000000",
    textColor: "#ffffff",
    iconName: "x",
    description: "Connect your @handle for social feeds & verified dispatches",
    providerId: "twitter.com"
  },
  {
    key: "apple",
    name: "Apple",
    brandColor: "#000000",
    textColor: "#ffffff",
    iconName: "apple",
    description: "Sign in with Apple ID and iCloud keychain security",
    providerId: "apple.com"
  },
  {
    key: "facebook",
    name: "Facebook",
    brandColor: "#1877F2",
    textColor: "#ffffff",
    iconName: "facebook",
    description: "Connect neighborhood groups & local community pages",
    providerId: "facebook.com"
  },
  {
    key: "microsoft",
    name: "Microsoft",
    brandColor: "#00a4ef",
    textColor: "#ffffff",
    iconName: "microsoft",
    description: "Sign in with Outlook, Office 365, or Xbox Live account",
    providerId: "microsoft.com"
  }
];

// Helper to create the correct Firebase Auth provider instance
export function createAuthProviderInstance(key: SupportedOAuthProviderKey) {
  switch (key) {
    case "google":
      return googleProvider;
    case "x":
      return new TwitterAuthProvider();
    case "apple":
      return new OAuthProvider("apple.com");
    case "facebook":
      return new FacebookAuthProvider();
    case "microsoft":
      return new OAuthProvider("microsoft.com");
    default:
      throw new Error(`Unsupported provider: ${key}`);
  }
}

// Interlink or sign in through the selected provider
export async function authenticateWithProvider(key: SupportedOAuthProviderKey): Promise<User> {
  const provider = createAuthProviderInstance(key);
  
  // If user is already signed in, attempt to link the account so they are interlinked!
  if (auth.currentUser) {
    try {
      const cred = await linkWithPopup(auth.currentUser, provider);
      return cred.user;
    } catch (err: any) {
      // If already linked or credential already in use by another account, sign in directly with popup
      if (err?.code === "auth/credential-already-in-use" || err?.code === "auth/provider-already-linked") {
        const cred = await signInWithPopup(auth, provider);
        return cred.user;
      }
      // If error is configuration/not enabled yet, throw for UI handling
      throw err;
    }
  }

  // Not signed in: execute popup sign-in
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Check which providers are linked to the current user
export function getLinkedProviderKeys(user: User | null): SupportedOAuthProviderKey[] {
  if (!user || !user.providerData) return [];
  const linked: SupportedOAuthProviderKey[] = [];
  
  for (const item of user.providerData) {
    if (item.providerId === "google.com") linked.push("google");
    else if (item.providerId === "twitter.com") linked.push("x");
    else if (item.providerId === "apple.com") linked.push("apple");
    else if (item.providerId === "facebook.com") linked.push("facebook");
    else if (item.providerId === "microsoft.com") linked.push("microsoft");
  }
  return linked;
}
