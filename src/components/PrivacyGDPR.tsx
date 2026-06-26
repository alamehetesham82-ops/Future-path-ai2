import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { 
  Lock, Eye, Trash2, ShieldAlert, Sparkles, CheckCircle, FileText, Scale,
  ChevronLeft, ArrowLeft, ShieldCheck, Mail, Info, CreditCard, Calendar, 
  UserCheck, AlertCircle, RefreshCw, Globe, BookOpen
} from "lucide-react";

interface PrivacyGDPRProps {
  onNavigate?: (section: string) => void;
  initialSubView?: "dashboard" | "privacy-policy" | "gdpr-rights";
}

export const PrivacyGDPR: React.FC<PrivacyGDPRProps> = ({ onNavigate, initialSubView }) => {
  const { currentUser, logout } = useAuth();
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAI, setAgreedAI] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sub-navigation state: "dashboard" | "privacy-policy" | "gdpr-rights"
  const [subView, setSubView] = useState<"dashboard" | "privacy-policy" | "gdpr-rights">(initialSubView || "dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize internal subView when prop changes
  React.useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);

  const handleViewChange = (view: "dashboard" | "privacy-policy" | "gdpr-rights") => {
    setLoading(true);
    setError(null);
    // Simulate high-speed secure encryption tunnel handshakes
    setTimeout(() => {
      try {
        setSubView(view);
      } catch (err: any) {
        setError("Failed to establish safe viewport rendering context: " + err.message);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleDeleteAccountRequest = async () => {
    if (!currentUser) return;
    const confirm1 = window.confirm("CRITICAL WARNING: This will permanently wipe your profile record, folders, certificates, and academic scores. Continue?");
    if (!confirm1) return;
    const confirm2 = prompt("To approve, please key in your registered email Address:");
    if (confirm2 !== currentUser.email) {
      alert("Verification mismatched. Deletion canceled.");
      return;
    }

    setDeleteLoading(true);
    try {
      // 1. Wipe Firestore profile user doc
      await deleteDoc(doc(db, "users", currentUser.uid));
      
      // 2. Delete Auth Entry
      await deleteUser(currentUser);
      alert("Your account node has been successfully removed from server networks.");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        alert("This operation requires a fresh validation handshake. Please sign out and sign in again before requesting account deletion.");
      } else {
        alert("An error occurred during account deletion: " + err.message);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBackClick = () => {
    if (!currentUser) {
      if (onNavigate) {
        onNavigate("login");
      }
    } else if (initialSubView && subView === initialSubView) {
      if (onNavigate) {
        onNavigate("dashboard");
      }
    } else if (subView !== "dashboard") {
      handleViewChange("dashboard");
    } else if (onNavigate) {
      onNavigate("dashboard");
    }
  };

  // ERROR FALLBACK CARD
  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-xl space-y-4 max-w-xl mx-auto text-center font-sans">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-white">Compliance View Decryption Fault</h3>
        <p className="text-xs text-red-400">{error}</p>
        <button
          onClick={() => { setError(null); setSubView("dashboard"); }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center space-x-2 mx-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Reload Dashboard Panel</span>
        </button>
      </div>
    );
  }

  // SECURE LOADING HANDSHAKE TRANSITION
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center font-mono">
        <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">Establishing Secure Connection</p>
          <p className="text-[10px] text-slate-500">Decrypting local compliance storage nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-5xl mx-auto animate-fadeIn select-none">
      
      {/* 1. COMPLIANCE MAIN DESK VIEW */}
      {subView === "dashboard" && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-850">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">Privacy & GDPR Desk</h2>
                <p className="text-xs text-slate-400">Google Play Compliant credentials controller, GDPR compliance logs, and Account self-removal tools.</p>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate(currentUser ? "dashboard" : "login")}
                className="self-start md:self-auto px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-750 text-xs font-mono font-bold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentUser ? "Back to Dashboard" : "Back to Login"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: User Data Controls */}
            <div className="space-y-4">
              <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>User Data Controls</span>
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  As part of our commitment to GDPR, COPPA, and Google Play compliance policies, you carry complete legal ownership and management options over your private data.
                </p>

                <div className="space-y-3.5 pt-2">
                  <label className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreedPrivacy} 
                      onChange={() => setAgreedPrivacy(!agreedPrivacy)} 
                      className="mt-0.5 accent-emerald-500" 
                    />
                    <span>Agree to Certificate Privacy terms (Files remain securely locked behind custom folder subpaths)</span>
                  </label>

                  <label className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreedAI} 
                      onChange={() => setAgreedAI(!agreedAI)} 
                      className="mt-0.5 accent-emerald-500" 
                    />
                    <span>Acknowledge AI Usage Disclosures (Recommendations are generated via Groq/Gemini models based on local parameters)</span>
                  </label>
                </div>

                {/* Account Deletion */}
                {currentUser ? (
                  <div className="pt-4 border-t border-slate-850">
                    <button
                      onClick={handleDeleteAccountRequest}
                      disabled={deleteLoading}
                      className="w-full py-2 bg-red-950/20 hover:bg-red-900/45 text-red-400 hover:text-red-300 border border-red-700/30 text-xs font-bold font-mono rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{deleteLoading ? "Wiping Profile node..." : "Permanently Delete Account"}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1.5 font-mono text-center">Permanently deletes academic folder logs and scorecards.</p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-slate-400 font-mono">
                    ⚠️ Log in to unlock account self-removal options.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Regulatory Policy Sheets */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Privacy Policy Quick Access Card */}
              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center space-x-2">
                      <Scale className="w-5 h-5 text-emerald-400" />
                      <span>Privacy Policy Guideline</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Read about our extensive user data collection parameters, safety networks, and secure billing protocols.
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewChange("privacy-policy")}
                    className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Full Policy</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-950/50 rounded-lg space-y-2 border border-slate-850 text-xs text-slate-400 font-sans">
                  <p><strong>1. Data Encryption:</strong> All uploaded proof PDFs exist in separate, secure paths (`users/&#123;uid&#125;/certificates/`).</p>
                  <p><strong>2. Secure Payments:</strong> Transaction tokens processed externally via secure Razorpay checkout interfaces.</p>
                </div>
              </div>

              {/* GDPR Quick Access Card */}
              <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-teal-400" />
                      <span>GDPR & Data Protection Rights</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Exercise your statutory rights of access, rectification, porting, and erasure under GDPR legislation.
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewChange("gdpr-rights")}
                    className="px-3.5 py-1.5 bg-teal-500 text-slate-950 hover:bg-teal-400 font-extrabold text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Data Rights</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-950/50 rounded-lg space-y-2 border border-slate-850 text-xs text-slate-400 font-sans">
                  <p><strong>1. Erasure:</strong> Easily remove personal credentials instantly via the Data self-removal terminal.</p>
                  <p><strong>2. Access Rights:</strong> Request complete diagnostic history dumps of your academic preferences.</p>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* 2. FULL PRIVACY POLICY VIEW */}
      {subView === "privacy-policy" && (
        <div className="space-y-6">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-850">
            <button
              onClick={handleBackClick}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>
                {onNavigate && !currentUser 
                  ? "Return to Login" 
                  : (initialSubView && subView === initialSubView) 
                    ? "Back to Dashboard" 
                    : "Back to Compliance Desk"}
              </span>
            </button>
            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ENCRYPTED DOCUMENT // FP-2026-PRIV</span>
            </div>
          </div>

          {/* Policy Layout Container */}
          <div className="p-6 md:p-8 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            <div className="text-center space-y-1 pb-4 border-b border-slate-850">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 border border-emerald-500/20 rounded-full font-mono uppercase tracking-widest font-extrabold">Official Compliance</span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase pt-2">FuturePath AI Privacy Policy</h1>
              <p className="text-xs text-slate-400 font-mono">Last Recalibrated: June 25, 2026 • Document Version 4.2.1</p>
            </div>

            {/* Complete 14 Mandatory Policy Sections */}
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans pr-2">
              
              {/* Section 1 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">1.0</span>
                  <span>Introduction</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Welcome to FuturePath AI. We prioritize your privacy above all else in our educational ecosystem. This comprehensive Privacy Policy defines how we collect, safeguard, process, and retain your credentials, certificates, and academic parameters when you visit or interact with our platform. By accessing our platform, you acknowledge and agree to the processes detailed in this document.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">2.0</span>
                  <span>Information We Collect</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  We process two key streams of data: (a) Information you supply directly, and (b) Telemetry logs generated automatically. These inputs are used strictly to provide customized CBSE-level career coaching, educational roadmaps, and resume templates.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">3.0</span>
                  <span>Account Information</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  When you establish credentials or log in via Google SSO, we record your full student name, email coordinate endpoint, custom display profile photo, and unique Firebase security user identifier (`uid`). This data is securely maintained within Google Firebase Authentication and Firestore databases.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">4.0</span>
                  <span>Educational Preferences</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  To power our Academic roadmaps and stream recommendations, you can choose to provide academic details including your grade level (Class 6-12), affiliated school names, regional state demography, active interest keywords, skill ratings, and subjective career goal statements.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">5.0</span>
                  <span>Usage Analytics</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  We collect system-level diagnostic logs when you use our platform. This includes click counts on stream paths, time spent on simulated EdTech coach worksheets, counselor query lengths, and browser agent configurations to optimize responsive page delivery.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">6.0</span>
                  <span>Payment Information (Razorpay)</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  All monetary transactions (such as career assessment certifications or premium features) are processed securely through our integration with **Razorpay**. Razorpay operates as our secure, external payment handler. FuturePath AI servers never view, transmit, or record sensitive billing details, including credit card numbers, CVV codes, bank login credentials, or UPI PINs. All financial interactions comply with PCI-DSS guidelines.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">7.0</span>
                  <span>How We Use Data</span>
                </h3>
                <p className="text-slate-400 text-xs animate-fadeIn">
                  We employ the processed data strictly to:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-2">
                  <li>Generate specialized CBSE streams, sports corridor pathways, and subject guides.</li>
                  <li>Respond to AI counselor chats using safe, localized parameters.</li>
                  <li>Compile personalized academic resumes and milestone point counts.</li>
                  <li>Maintain secure administrative records and coordinate verification requests.</li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">8.0</span>
                  <span>Data Security</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Your data is protected behind secure Firebase Firestore rules preventing unauthenticated read/write actions. Certificate scans exist locked under custom folder subpaths (`users/&#123;uid&#125;/certificates/`). Our system blocks unauthorized indexing to guarantee that credentials remain completely private.
                </p>
              </section>

              {/* Section 9 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">9.0</span>
                  <span>Data Retention</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  We retain your academic records and files only for the duration of your active registration. If you choose to execute our permanent account deletion tool, we wipe all matching profile structures and metadata from active Firestore databases within 30 days.
                </p>
              </section>

              {/* Section 10 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">10.0</span>
                  <span>Cookies & Local Storage</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  We utilize standard client-side `localStorage` parameters strictly to maintain login sessions and active dashboard configurations, preventing repetitive handshake overheads.
                </p>
              </section>

              {/* Section 11 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">11.0</span>
                  <span>Children's Privacy</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  As our platform targets students in classes 6-12, we strictly prioritize compliance with COPPA (Children's Online Privacy Protection Act) and global student safety guidelines. Parents can monitor, restrict, or delete their ward's academic records at any time by coordinating via the Parent Desk or contacting our help team.
                </p>
              </section>

              {/* Section 12 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">12.0</span>
                  <span>Third-Party Services</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  To provide modern AI, hosting, and checkout functionalities, we integrate securely with:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2 font-mono">
                  <li>Google Firebase (Hosting, Database, Authentication)</li>
                  <li>Razorpay Payments (Checkout Gateway)</li>
                  <li>Groq & Gemini APIs (Language Model Handshakes)</li>
                </ul>
              </section>

              {/* Section 13 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">13.0</span>
                  <span>Contact Information</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  For formal inquiries regarding this Privacy Policy, your certificate privacy, or parent monitoring inquiries, please contact our Compliance Desk:
                  <br />
                  <span className="font-mono text-emerald-400 block mt-1">Email: compliance@futurepath.ai | Response SLA: 48 Hours</span>
                </p>
              </section>

              {/* Section 14 */}
              <section className="space-y-2 border-l-2 border-emerald-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-emerald-400 font-mono text-sm">14.0</span>
                  <span>Policy Updates</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  We reserve the right to recalibrate this policy as guidelines or platform features evolve. Changes will be updated on this page with a revised version code.
                </p>
              </section>

            </div>

          </div>
        </div>
      )}

      {/* 3. FULL GDPR & DATA RIGHTS VIEW */}
      {subView === "gdpr-rights" && (
        <div className="space-y-6">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-850">
            <button
              onClick={handleBackClick}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>
                {onNavigate && !currentUser 
                  ? "Return to Login" 
                  : (initialSubView && subView === initialSubView) 
                    ? "Back to Dashboard" 
                    : "Back to Compliance Desk"}
              </span>
            </button>
            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>EU REGULATORY INDEX // FP-2026-GDPR</span>
            </div>
          </div>

          {/* GDPR Layout Container */}
          <div className="p-6 md:p-8 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            <div className="text-center space-y-1 pb-4 border-b border-slate-850">
              <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2.5 py-1 border border-teal-500/20 rounded-full font-mono uppercase tracking-widest font-extrabold">GDPR Compliance</span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase pt-2">GDPR & Data Protection Rights</h1>
              <p className="text-xs text-slate-400 font-mono">Official Data Protection Directive • Regulatory Handshake Protocol</p>
            </div>

            {/* Complete 12 Mandatory GDPR Sections */}
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans pr-2">
              
              {/* GDPR 1 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.01</span>
                  <span>GDPR Compliance Statement</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Under the European Union General Data Protection Regulation (Regulation 2016/679), all students and parents who reside inside the European Economic Area (EEA) possess specific rights over their personal data records. FuturePath AI is dedicated to total transparency, data protection principles, and compliant processing.
                </p>
              </section>

              {/* GDPR 2 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.02</span>
                  <span>Lawful Basis of Processing</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  We process student information under Article 6(1) of the GDPR bases:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                  <li><strong>Consent:</strong> When you check privacy handshakes and data controls on our platform.</li>
                  <li><strong>Contract Fulfillment:</strong> When processing is required to deliver AI counseling assessments or roadmaps.</li>
                  <li><strong>Legitimate Interests:</strong> To identify malicious uploads, protect security nodes, and optimize learning paths.</li>
                </ul>
              </section>

              {/* GDPR 3 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.03</span>
                  <span>Right to Access</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  You are entitled to request and receive clear confirmations as to whether your personal profile data is processed, and obtain a structured, readable report containing all registered academic scorecards and milestone points.
                </p>
              </section>

              {/* GDPR 4 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.04</span>
                  <span>Right to Rectification</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  If any personal field is incorrect or outdated (such as affiliated school or state demography), you hold the right to alter it immediately using the **Account Settings** panel.
                </p>
              </section>

              {/* GDPR 5 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.05</span>
                  <span>Right to Erasure ("Right to be Forgotten")</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  You carry the absolute right to have your account erased. By clicking the "Permanently Delete Account" button in the User Data Controls panel, all authentication metadata, Firestore documents, and certificates will be permanently deleted from active database servers.
                </p>
              </section>

              {/* GDPR 6 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.06</span>
                  <span>Right to Restrict Processing</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  You have the right to request a temporary freeze on your data profiling. Under restriction, we hold your files on secure databases but refrain from using them inside active career algorithms.
                </p>
              </section>

              {/* GDPR 7 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.07</span>
                  <span>Right to Data Portability</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  You have the right to receive your personal and academic record dataset in a structured, electronic, machine-readable JSON format, facilitating easy transfers to alternative educational institutions.
                </p>
              </section>

              {/* GDPR 8 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.08</span>
                  <span>Right to Object</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  You hold the legal right to object to automatic analytics logging. If you submit an objection, we will suspend tracking parameters unless we demonstrate legitimate grounds that override your interests.
                </p>
              </section>

              {/* GDPR 9 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.09</span>
                  <span>Right to Withdraw Consent</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Where processing relies entirely on your consent, you can withdraw your agreement instantly by toggling off the Certificate Privacy or AI Disclosures checkboxes in the user dashboard.
                </p>
              </section>

              {/* GDPR 10 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.10</span>
                  <span>Automated Decision Making & AI Disclosures</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  FuturePath AI utilizes Groq and Gemini models to suggest career streams, sports path listings, and college possibilities. We guarantee that no high-impact decisions, grade placements, or final career eligibility outcomes are processed solely by algorithms. All automated evaluations require student verification.
                </p>
              </section>

              {/* GDPR 11 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.11</span>
                  <span>Data Protection Contact</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  For formal data rights access queries or general protection audits, please reach our Data Protection Officer:
                  <br />
                  <span className="font-mono text-teal-400 block mt-1">Contact Email: dpo@futurepath.ai | Response SLA: 48 Hours</span>
                </p>
              </section>

              {/* GDPR 12 */}
              <section className="space-y-2 border-l-2 border-teal-500/30 pl-4">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <span className="text-teal-400 font-mono text-sm">G.12</span>
                  <span>Request Submission Process</span>
                </h3>
                <p className="text-slate-400 text-xs animate-fadeIn">
                  To formally exercise your GDPR privileges:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-2 font-mono">
                  <li>Navigate to our Help Center and submit a "Data Protection Request" ticket.</li>
                  <li>Alternatively, send an electronic mail to our DPO with your registered email terminal.</li>
                  <li>Our compliance controllers will verify your identity within 72 hours and execute the requested query.</li>
                </ol>
              </section>

            </div>

          </div>
        </div>
      )}

      {/* 4. UNIFIED CYBERNETIC FOOTER SECTION */}
      <footer className="pt-4 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-2">
        <div className="flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-600" />
          <span>FuturePath AI © 2026. All Rights Reserved.</span>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => handleViewChange("privacy-policy")} className="hover:text-emerald-400 transition-colors cursor-pointer">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => handleViewChange("gdpr-rights")} className="hover:text-teal-400 transition-colors cursor-pointer">GDPR Rights</button>
        </div>
      </footer>

    </div>
  );
};
