import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, Loader2, Compass, AlertCircle, Globe } from "lucide-react";

interface LoginProps {
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onSwitchToForgot, onLoginSuccess }) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Authorization requires both terminals (email & password).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish validation handshake with our servers.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Single Sign-On authentication aborted.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const isUnauthorizedDomain = error && (
    error.includes("auth/unauthorized-domain") || 
    error.includes("unauthorized-domain") ||
    error.includes("unauthorized")
  );

  const isOperationNotAllowed = error && (
    error.includes("auth/operation-not-allowed") ||
    error.includes("operation-not-allowed")
  );

  return (
    <div className="w-full max-w-md p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl shadow-sky-950/20 text-slate-100 font-sans">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="p-3 bg-sky-500/10 rounded-full border border-sky-500/20 text-sky-400 mb-3 animate-pulse">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">FuturePath AI</span>
        </h2>
        <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">
          Decentralized Career Intelligence Desk
        </p>
      </div>

      {error && (
        <div className="space-y-4 mb-5">
          <div className="flex items-start space-x-2.5 p-3.5 bg-red-950/40 border border-red-500/20 rounded-xl text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span className="leading-normal">{error}</span>
          </div>

          {isUnauthorizedDomain && (
            <div className="p-4 bg-slate-900 border border-sky-500/20 rounded-xl space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-sky-400 font-bold font-mono">
                <Globe className="w-4 h-4" />
                <span>Fix Authorize Domain in Firebase</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Firebase Authentication has blocked Google Sign-In because your preview hosting domain has not been whitelisted. To resolve this:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Firebase Console</a></li>
                <li>Open <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized Domains</strong></li>
                <li>Click <strong>Add Domain</strong> and add your current hostname:
                  <div className="bg-slate-950 p-2 rounded mt-1 font-mono text-[9px] text-emerald-400 select-all border border-slate-800 break-all">
                    {window.location.hostname}
                  </div>
                </li>
                <li>Once added, reload this page & try again!</li>
              </ol>
              <div className="pt-1 text-[10px] text-amber-400/90 italic">
                Tip: You can use Email/Password credentials (by signing up above) to log in instantly without domain restrictions!
              </div>
            </div>
          )}

          {isOperationNotAllowed && (
            <div className="p-4 bg-slate-900 border border-amber-500/20 rounded-xl space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Enable Sign-In Providers in Firebase</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                The sign-in providers (Email/Password or Google) are currently disabled in your Firebase project. To enable them:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                <li>Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Firebase Console</a></li>
                <li>Go to <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong></li>
                <li>Click on <strong>Add new provider</strong> (or enable existing ones)</li>
                <li>Enable both <strong>Email/Password</strong> and <strong>Google</strong></li>
                <li>Click <strong>Save</strong>, then reload this interface to try again!</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
            EMAIL ENDPOINT
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-sky-500/65 focus:outline-none focus:ring-1 focus:ring-sky-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
            placeholder="student@school.edu"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-mono uppercase text-slate-400 tracking-wide">
              SECURITY KEY (PASSWORD)
            </label>
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer font-medium"
            >
              Reset Terminal?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-sky-500/65 focus:outline-none focus:ring-1 focus:ring-sky-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-450 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer hover:shadow-lg hover:shadow-sky-500/10 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Initialize Handshake</span>
            </>
          )}
        </button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <span className="relative px-3 bg-[#111827] text-xs font-mono text-slate-500 uppercase tracking-widest">
          OR SECURE LINK
        </span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full py-2.5 bg-[#0A0F1D] text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed font-medium text-sm border border-slate-800 hover:border-slate-700/80 rounded-lg flex items-center justify-center space-x-2.5 transition-all cursor-pointer select-none"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63yz" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Auth via Google Portal</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-xs">
          New student in our ecosystem?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-sky-400 hover:text-sky-305 transition-colors font-semibold cursor-pointer"
          >
            Create Credentials
          </button>
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-center space-x-3 text-[10px] text-slate-500 font-mono">
        <a href="#privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
        <span>•</span>
        <a href="#gdpr" className="hover:text-teal-400 transition-colors">GDPR Rights</a>
      </div>
    </div>
  );
};
