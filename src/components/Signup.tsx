import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Sparkles, Loader2, Compass, AlertCircle } from "lucide-react";

interface SignupProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [state, setState] = useState("");
  const [userClass, setUserClass] = useState("Class 10");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !school || !state) {
      setError("Please key in all credential validation details.");
      return;
    }
    if (password.length < 6) {
      setError("Security keys must exceed 6 cryptographic characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, name, userClass, school, state);
      onSignupSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Credential configuration failed or terminal already initialized.");
    } finally {
      setLoading(false);
    }
  };

  const CLASSES_LIST = [
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
  ];

  return (
    <div className="w-full max-w-lg p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-950/20 text-slate-100 font-sans">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 mb-3 animate-pulse">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Enlist in <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">FuturePath AI</span>
        </h2>
        <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">
          New Student Profile Node Initialization
        </p>
      </div>

      {error && (
        <div className="space-y-4 mb-5">
          <div className="flex items-start space-x-2.5 p-3.5 bg-[#450a0a]/40 border border-red-500/20 rounded-xl text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>

          {(error.includes("auth/email-already-in-use") || error.includes("email-already-in-use")) && (
            <div className="p-4 bg-slate-900 border border-amber-500/20 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Account Already Exists</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                This email endpoint is already registered in our career ecosystem. You can proceed directly to the authentication portal:
              </p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="mt-1 px-4 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded border border-indigo-500/30 font-semibold cursor-pointer text-[11px] transition-all"
              >
                Go to login handshake &rarr;
              </button>
            </div>
          )}

          {(error.includes("auth/operation-not-allowed") || error.includes("operation-not-allowed")) && (
            <div className="p-4 bg-slate-900 border border-amber-500/20 rounded-xl space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Enable Sign-In Providers in Firebase</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                The sign-in providers (Email/Password or Google) are currently disabled in your Firebase project. To enable them:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                <li>Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Firebase Console</a></li>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              FULL NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-indigo-500/65 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
              placeholder="Elon Cooper"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-indigo-500/65 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
              placeholder="student@outlook.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              SECURITY KEY (6+ CHARS)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-indigo-500/65 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              ACADEMIC GRADE LEVEL
            </label>
            <select
              value={userClass}
              onChange={(e) => setUserClass(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-indigo-500/65 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm text-slate-200 transition-all cursor-pointer"
            >
              {CLASSES_LIST.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-950">
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              SCHOOL OR UNIVERSITY
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-indigo-500/65 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
              placeholder="Delhi Public School"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 tracking-wide">
              STATE / TERRITORY
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-indigo-500/65 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-sm text-slate-200 transition-all placeholder:text-slate-500"
              placeholder="Maharashtra"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] mt-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Initialize Node Profile</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-xs">
          Already registered in terminal archives?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-400 hover:text-indigo-300 transition-all font-semibold cursor-pointer"
          >
            Terminal Handshake
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
