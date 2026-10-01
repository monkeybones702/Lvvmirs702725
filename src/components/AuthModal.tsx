import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  UserCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  User,
  Link2,
  Globe,
  Check,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "../lib/firebase";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  authenticateWithProvider,
  getLinkedProviderKeys,
  SupportedOAuthProviderKey
} from "../lib/authProviders";
import type { User as FirebaseUser } from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onOpenSourcesRegistry?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenSourcesRegistry
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("monkeybones702@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const linkedProviders = getLinkedProviderKeys(currentUser);

  const handleOAuthSignIn = async (providerKey: SupportedOAuthProviderKey) => {
    setLoading(true);
    setLoadingProvider(providerKey);
    setErrorMessage(null);
    setSuccessMessage(null);

    const providerObj = SUPPORTED_OAUTH_PROVIDERS.find((p) => p.key === providerKey);
    const providerName = providerObj?.name || providerKey;

    try {
      const user = await authenticateWithProvider(providerKey);
      setSuccessMessage(
        currentUser
          ? `Successfully interlinked ${providerName} to your profile (${user.email || user.displayName || "Account"})!`
          : `Signed in successfully with ${providerName}!`
      );
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setErrorMessage(`Sign in popup was closed. Please try connecting ${providerName} again.`);
      } else if (err?.code === "auth/operation-not-allowed") {
        setErrorMessage(
          `${providerName} authentication needs to be enabled in Firebase Console Auth Providers. You can sign in using Google or email credentials in the meantime.`
        );
      } else if (err?.code === "auth/account-exists-with-different-credential") {
        setErrorMessage(
          `An account already exists with the same email from a different provider. Sign in with Google or your primary provider first to interlink this ${providerName} account.`
        );
      } else {
        setErrorMessage(err?.message || `Failed to authenticate with ${providerName}.`);
      }
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password || "LitmusAgent2026!Secure";

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        setSuccessMessage(`Account successfully created for ${cleanEmail}!`);
        setTimeout(() => onClose(), 1200);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        setSuccessMessage(`Signed in as ${cleanEmail}!`);
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      if (isSignUp && err?.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          setSuccessMessage(`Welcome back! Signed in as ${cleanEmail}.`);
          setTimeout(() => onClose(), 1200);
          return;
        } catch (signInErr: any) {
          setErrorMessage(
            "Account already exists. Please enter your password to sign in, or choose a different password."
          );
        }
      } else if (err?.code === "auth/weak-password") {
        setErrorMessage("Password should be at least 6 characters.");
      } else if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
        setErrorMessage("Invalid email or password. Please verify credentials.");
      } else {
        setErrorMessage(err?.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPresetSignUp = async () => {
    setEmail("monkeybones702@gmail.com");
    setPassword("Litmus2026#SecureResearch");
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createUserWithEmailAndPassword(
        auth,
        "monkeybones702@gmail.com",
        "Litmus2026#SecureResearch"
      );
      setSuccessMessage("Account created & authenticated for monkeybones702@gmail.com!");
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(
            auth,
            "monkeybones702@gmail.com",
            "Litmus2026#SecureResearch"
          );
          setSuccessMessage("Signed in as monkeybones702@gmail.com!");
          setTimeout(() => onClose(), 1200);
        } catch {
          setErrorMessage("Account exists. Enter password to sign in.");
        }
      } else {
        setErrorMessage(err?.message || "Failed to register account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSuccessMessage("Signed out successfully.");
    setTimeout(() => onClose(), 1000);
  };

  const renderProviderIcon = (key: SupportedOAuthProviderKey) => {
    switch (key) {
      case "google":
        return (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        );
      case "x":
        return (
          <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case "apple":
        return (
          <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.64-.78 1.08-1.86.96-2.95-1 .04-2.12.67-2.77 1.45-.58.67-1.1 1.77-.96 2.83 1.12.09 2.18-.58 2.77-1.33z" />
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-4 h-4 shrink-0 fill-current text-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case "microsoft":
        return (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        );
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-mono">
      <div className="bg-black/95 text-cyan-100 rounded-xl max-w-xl w-full border border-cyan-500/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 flex items-start justify-between gap-3 bg-cyan-950/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-mono shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                IDENTITY_ROUTER // MULTI-OAUTH
              </span>
              <span className="font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px]">
                5 PROVIDERS ENABLED
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {currentUser ? "Interlinked Accounts & Authentication" : "Sign In & Connect Accounts"}
            </h2>
            <p className="text-xs text-stone-400">
              Interlink through X, Google, Apple, Facebook, or Microsoft for real-time alert broadcasts and research state synchronization.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg hover:bg-black/80 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged in state with Interlink Hub */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-cyan-400 uppercase font-mono block">
                      ACTIVE SESSION
                    </span>
                    <span className="text-sm font-bold text-white block truncate">
                      {currentUser.displayName || currentUser.email || "Neighbor Account"}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono block truncate">
                      UID: {currentUser.uid}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 bg-red-950/80 border border-red-500/40 hover:bg-red-900 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>SIGN OUT</span>
                </button>
              </div>

              {/* Interlink Providers Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>INTERLINKED IDENTITY PROVIDERS</span>
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {linkedProviders.length} of 5 linked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
                    const isLinked = linkedProviders.includes(provider.key);
                    const isCurrentLoading = loadingProvider === provider.key;

                    return (
                      <button
                        key={provider.key}
                        type="button"
                        onClick={() => handleOAuthSignIn(provider.key)}
                        disabled={loading}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                          isLinked
                            ? "bg-emerald-950/40 border-emerald-500/50 text-white"
                            : "bg-black/60 border-white/10 hover:border-cyan-400 hover:bg-cyan-950/30 text-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center shrink-0">
                            {renderProviderIcon(provider.key)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {provider.name}
                            </span>
                            <span className="text-[10px] text-stone-400 block truncate">
                              {isLinked ? "Interlinked & Active" : "Click to Interlink"}
                            </span>
                          </div>
                        </div>

                        {isCurrentLoading ? (
                          <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                        ) : isLinked ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Research & Sync Notice */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-stone-300 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Cross-Platform Threat Audit & Synchronization</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Interlinking these accounts connects your verified neighbor badges, CCTV detection alerts, and community posts across X, Facebook, and Google identity services.
                </p>
              </div>
            </div>
          ) : (
            /* Logged out state: 5 OAuth provider buttons + Email credentials */
            <div className="space-y-4">
              {/* Preset quick sign in */}
              <button
                type="button"
                onClick={handleQuickPresetSignUp}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-amber-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-white">
                      Instant Sign In as monkeybones702@gmail.com
                    </span>
                    <span className="text-[10px] text-amber-300/80 block">
                      1-click instant session & research authorization
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>

              {/* Multi-OAuth Providers Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="uppercase font-bold text-cyan-400">
                    SIGN IN THROUGH CONNECTED PROVIDERS
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
                    const isCurrentLoading = loadingProvider === provider.key;

                    return (
                      <button
                        key={provider.key}
                        type="button"
                        onClick={() => handleOAuthSignIn(provider.key)}
                        disabled={loading}
                        className="p-2.5 px-3 rounded-xl border border-white/15 bg-black/60 hover:bg-white/10 hover:border-cyan-400/50 text-white text-xs font-bold flex items-center justify-between gap-2 transition-all group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-black/80 flex items-center justify-center">
                            {renderProviderIcon(provider.key)}
                          </div>
                          <span>Continue with {provider.name}</span>
                        </div>
                        {isCurrentLoading ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email / Password fallback */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="uppercase">Or Email & Password</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="flex bg-black/80 p-0.5 rounded-lg text-xs border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      !isSignUp ? "bg-cyan-500 text-black font-bold" : "text-stone-400"
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-1 rounded-md transition-all ${
                      isSignUp ? "bg-cyan-500 text-black font-bold" : "text-stone-400"
                    }`}
                  >
                    CREATE ACCOUNT
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cyan-500/40 bg-black text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-300 mb-1">PASSWORD</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Default password applied if empty"
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cyan-500/40 bg-black text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 rounded-xl text-xs font-bold text-black bg-cyan-500 hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                  >
                    {loading
                      ? "PROCESSING..."
                      : isSignUp
                      ? `CREATE ACCOUNT (${email})`
                      : `SIGN IN TO ACCOUNT`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer with link to all data sources */}
        <div className="p-3 border-t border-cyan-500/30 bg-black/90 flex items-center justify-between text-xs">
          {onOpenSourcesRegistry && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSourcesRegistry();
              }}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>VIEW ALL 12 DATA SOURCES</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-colors ml-auto"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
