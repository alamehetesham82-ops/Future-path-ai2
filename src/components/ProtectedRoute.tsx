import React from "react";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"student" | "parent" | "admin">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-emerald-400 font-mono">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">DECRYPTING PROTOCOLS...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Return login page or trigger sign-in view
    return <RedirectToLogin />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-red-400 font-mono p-6">
        <div className="bg-slate-900 border border-red-900/40 rounded-xl p-8 max-w-md text-center shadow-lg shadow-red-950/20">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wider">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your clearance level ({userProfile.role.toUpperCase()}) is insufficient for this directory. Needs auth clearance for {allowedRoles.join(" / ").toUpperCase()}.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 font-medium border border-red-700/30 rounded-lg transition-colors cursor-pointer"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Helper component that triggers standard custom router change or shows quick login overlay fallback
const RedirectToLogin: React.FC = () => {
  React.useEffect(() => {
    // If we're fully loaded and have no user, rewrite window location hash or global route state.
    // To facilitate iframe navigation, setting a custom event or hash route tells our main React tree which login panel to render.
    window.location.hash = "#login";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-mono">
      <div className="text-center space-y-3">
        <p className="text-emerald-500">AUTHORIZING AUTH CHANNEL...</p>
        <p className="text-xs text-slate-500">Redirecting to terminal login portal...</p>
      </div>
    </div>
  );
};
