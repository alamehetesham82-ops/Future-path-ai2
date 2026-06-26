import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface ForgotPasswordProps {
  onSwitchToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchToLogin }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please specify the account identity destination (email).");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess("Despatch complete! A credential repair instructions link has been successfully issued to your email inbox. Please check your junk/spam folder as well if you do not receive it shortly.");
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const isOperationNotAllowed = error && (
    error.includes("auth/operation-not-allowed") ||
    error.includes("operation-not-allowed")
  );

  const isUserNotFound = error && (
    error.includes("auth/user-not-found") ||
    error.includes("user-not-found")
  );

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl shadow-emerald-950/20 text-slate-100 font-sans">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/20 text-cyan-400 mb-3 animate-pulse">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Recover <span className="text-cyan-400">Security Key</span>
        </h2>
        <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">
          Autonomous Validation Retrieval
        </p>
      </div>

      {error && (
        <div className="space-y-4 mb-5">
          <div className="flex items-start space-x-2.5 p-3.5 bg-[#450a0a]/40 border border-red-500/20 rounded-xl text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>

          {isOperationNotAllowed && (
            <div className="p-4 bg-slate-950 border border-amber-500/20 rounded-xl space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Enable Password Provider in Firebase</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Firebase is refusing to send password reset emails because the <strong>Email/Password</strong> sign-in provider is disabled in your Firebase console. To resolve this:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-350">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Firebase Console</a></li>
                <li>Navigate to <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong></li>
                <li>Click <strong>Add new provider</strong> (or edit existing) and select <strong>Email/Password</strong></li>
                <li>Enable the provider, click <strong>Save</strong>, and try again here!</li>
              </ol>
            </div>
          )}

          {isUserNotFound && (
            <div className="p-4 bg-slate-950 border border-sky-500/20 rounded-xl space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-sky-400 font-bold font-mono">
                <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <span>No Account Registered</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                This email address doesn't match any registered student or advisor accounts on the system. Please verify you wrote the correct email or create a new student account first.
              </p>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="flex items-start space-x-2.5 p-3.5 mb-5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-normal">{success}</span>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              NODE EMAIL ENDPOINT
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-11 pr-4 bg-slate-950 border border-slate-800 focus:border-cyan-500/65 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-700"
                placeholder="student@school.edu"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Despatch Recovery Packet</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center border-t border-slate-800/85 pt-4">
        <button
          onClick={onSwitchToLogin}
          className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Terminal Lobby</span>
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-center space-x-3 text-[10px] text-slate-500 font-mono">
        <a href="#privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
        <span>•</span>
        <a href="#gdpr" className="hover:text-teal-400 transition-colors">GDPR Rights</a>
      </div>
    </div>
  );
};
