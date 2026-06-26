/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { ForgotPassword } from "./components/ForgotPassword";

// Modular page imports
import { DashboardConsole } from "./components/DashboardConsole";
import { AcademicRoadmaps } from "./components/AcademicRoadmaps";
import { AICounselor } from "./components/AICounselor";
import { SportsCorridor } from "./components/SportsCorridor";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { CollegeExplorer } from "./components/CollegeExplorer";
import { CareerExplorer } from "./components/CareerExplorer";
import { ScholarshipHub } from "./components/ScholarshipHub";
import { ParentDesk } from "./components/ParentDesk";
import { AdminDesk } from "./components/AdminDesk";
import { PrivacyGDPR } from "./components/PrivacyGDPR";
import { HelpCenter } from "./components/HelpCenter";
import { ResultAnalyzer } from "./components/ResultAnalyzer";
import { TopicAnalyzer } from "./components/TopicAnalyzer";
import { CompeteToCrush } from "./components/CompeteToCrush";

import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Icon imports
import { 
  Compass, LayoutGrid, Map, Trophy, Target, Award, FileText, Star, 
  GraduationCap, Globe, Users, ShieldAlert, Settings, HelpCircle, Lock, 
  LogOut, Menu, X, ChevronLeft, ChevronRight, User, CheckCircle2, Plus,
  Calculator, BookOpen, Flame
} from "lucide-react";

function MainDashboardShell() {
  const { userProfile, logout, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [streakCount, setStreakCount] = useState<number>(4);

  // Profile Form Edit state (Settings page)
  const [editName, setColName] = useState("");
  const [editSchool, setColSchool] = useState("");
  const [editState, setColState] = useState("");
  const [editClass, setColClass] = useState("Class 10");
  const [editSkills, setColSkills] = useState("");
  const [editInterests, setColInterests] = useState("");
  const [editGoals, setColGoals] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.uid) {
      const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      const streakKey = `fp_streak_${userProfile.uid}`;
      const lastActiveKey = `fp_last_active_${userProfile.uid}`;

      const savedStreak = localStorage.getItem(streakKey);
      const savedLastActive = localStorage.getItem(lastActiveKey);

      if (savedStreak && savedLastActive) {
        const streak = parseInt(savedStreak, 10);
        
        if (todayStr === savedLastActive) {
          setStreakCount(streak);
        } else {
          const lastActiveDate = new Date(savedLastActive);
          const todayDate = new Date(todayStr);
          const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            const newStreak = streak + 1;
            localStorage.setItem(streakKey, newStreak.toString());
            localStorage.setItem(lastActiveKey, todayStr);
            setStreakCount(newStreak);
          } else {
            localStorage.setItem(streakKey, "1");
            localStorage.setItem(lastActiveKey, todayStr);
            setStreakCount(1);
          }
        }
      } else {
        localStorage.setItem(streakKey, "4"); // Start with a nice baseline streak
        localStorage.setItem(lastActiveKey, todayStr);
        setStreakCount(4);
      }
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    if (userProfile) {
      setColName(userProfile.name || "");
      setColSchool(userProfile.school || "");
      setColState(userProfile.state || "");
      setColClass(userProfile.class || "Class 10");
      setColSkills(userProfile.skills?.join(", ") || "");
      setColInterests(userProfile.interests?.join(", ") || "");
      setColGoals(userProfile.careerGoals || "");
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateProfile({
        name: editName,
        school: editSchool,
        state: editState,
        class: editClass,
        skills: editSkills.split(",").map(s => s.trim()).filter(Boolean),
        interests: editInterests.split(",").map(i => i.trim()).filter(Boolean),
        careerGoals: editGoals
      });
      alert("Executive settings update accepted and committed to Cloud nodes!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSidebarClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  const categories = [
    { id: "dashboard", label: "Dashboard Console", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "roadmaps", label: "Academic Roadmaps", icon: <Map className="w-4 h-4" /> },
    { id: "ai-counselor", label: "AI Career Counselor", icon: <Compass className="w-4 h-4" /> },
    { id: "sports", label: "Sports Corridor", icon: <Trophy className="w-4 h-4" /> },
    { id: "resume", label: "Resume Builder", icon: <Star className="w-4 h-4" /> },
    { id: "college-explorer", label: "College Explorer", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "career-explorer", label: "Career Explorer", icon: <Globe className="w-4 h-4" /> },
    { id: "scholarships", label: "Scholarship Hub", icon: <Award className="w-4 h-4 text-cyan-400" /> },
    { id: "parent-desk", label: "Parent Desk", icon: <Users className="w-4 h-4" /> },
    { id: "result-analyzer", label: "Result Analyzer", icon: <Calculator className="w-4 h-4 text-sky-400" /> },
    { id: "topic-analyzer", label: "Topic Analyzer", icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
    { id: "compete-crush", label: "COMPETE TO CRUSH", icon: <Trophy className="w-4 h-4 text-yellow-500 fill-current" /> },
    { id: "admin-desk", label: "Admin Desk", icon: <ShieldAlert className="w-4 h-4" />, role: "admin" },
    { id: "privacy", label: "Privacy & GDPR", icon: <Lock className="w-4 h-4" /> },
    { id: "help", label: "Help Center", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  const achievementPoints = 450 + (userProfile?.skills.length || 0) * 100;
  const careerScore = Math.min(100, 45 + (userProfile?.skills.length || 0) * 8);

  const activeGradClass = [
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
  ];

  return (
    <div className="flex h-screen bg-[#0A0F1D] text-slate-100 font-sans overflow-hidden">
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex flex-col bg-slate-950/75 backdrop-blur-xl border-r border-cyan-500/15 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}>
        {/* Sidebar Brand header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10 shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              <span className="font-extrabold text-sm tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#3B82F6] to-[#8B5CF6] drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                FuturePath AI
              </span>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-all text-slate-400 cursor-pointer ml-auto"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Sidebar navigation selections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {categories.map((cat) => {
            // Check clearance role access rules
            if (cat.role === "admin" && userProfile?.role !== "admin") return null;

            const isActive = activeSection === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSidebarClick(cat.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer border group relative ${
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/5 border-cyan-500/40 text-[#00E5FF] font-bold shadow-[0_0_15px_rgba(0,229,255,0.18)]" 
                    : "border-transparent text-[#B8C4D6] hover:text-[#00E5FF] hover:bg-slate-900/80 hover:border-cyan-500/15"
                }`}
              >
                {/* Glowing Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-[#00E5FF] to-[#3B82F6] rounded-r-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                )}
                
                <div className={`shrink-0 transition-all duration-300 ${
                  isActive 
                    ? "scale-110 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.75)]" 
                    : "text-slate-400 group-hover:text-[#00E5FF] group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
                }`}>
                  {React.cloneElement(cat.icon as React.ReactElement, { className: "w-4 h-4" })}
                </div>
                {!sidebarCollapsed && (
                  <span className={`truncate tracking-wide transition-colors duration-300 ${
                    isActive 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)] font-extrabold" 
                      : "text-[#B8C4D6] group-hover:text-[#00E5FF]"
                  }`}>
                    {cat.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer user summary */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-cyan-500/10 text-xs font-mono space-y-2.5 shrink-0 bg-slate-950/90">
            <div className="flex justify-between items-center text-slate-500 text-[10px]">
              <span className="tracking-widest">SECURE NODE GATE</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]"></span>
            </div>
            <div>
              <div className="font-bold text-slate-200 truncate tracking-wide">{userProfile?.name}</div>
              <div className="text-[10px] text-cyan-400/80 truncate uppercase tracking-wider">{userProfile?.role} clearance</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0A0F1D] bg-radial-gradient">
        
        {/* Top Header */}
        <header className="h-16 border-b border-cyan-500/10 bg-slate-950/65 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 select-none">
          
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Metrics display */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex flex-col">
              <span className="text-slate-500 uppercase text-[9px] font-mono tracking-widest">Institution Link</span>
              <span className="text-sm font-semibold text-slate-200">{userProfile?.school || "St. Xavier's International"}</span>
            </div>
            <div className="h-8 w-[1px] bg-cyan-500/10"></div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-[9px] uppercase text-slate-500 font-mono tracking-widest">Milestone Points</p>
                <p className="text-sm font-bold glow-text-cyan">{achievementPoints} pts</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase text-slate-500 font-mono tracking-widest">Career Fit Rating</p>
                <p className="text-sm font-bold glow-text-green">{careerScore}%</p>
              </div>
            </div>

            {/* Neon Gold Learning Streak Counter */}
            <div className="h-8 w-[1px] bg-cyan-500/10"></div>
            <div className="flex items-center space-x-2 px-3.5 py-1 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/50 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] group relative select-none">
              <Flame className="w-4.5 h-4.5 text-amber-400 fill-current animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.7)] group-hover:scale-110 transition-transform duration-300" />
              <div className="text-left">
                <p className="text-[8px] uppercase text-amber-500/80 font-mono tracking-widest font-black leading-none mb-0.5">STREAK</p>
                <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] leading-none">
                  {streakCount} DAYS
                </p>
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
          </div>

          {/* User profile dropdown triggers */}
          <div className="flex items-center space-x-4">
            {/* Mobile streak counter */}
            <div className="flex lg:hidden items-center space-x-1.5 px-2.5 py-1 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-400/40 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.05] hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] group relative">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
              <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">{streakCount}D</span>
            </div>

            <div className="text-right hidden sm:block">
              <div className="font-extrabold text-xs text-slate-100 leading-normal">{userProfile?.name}</div>
              <p className="text-[10px] text-cyan-400/80 tracking-wider font-mono">{userProfile?.school}</p>
            </div>
            
            <img 
              src={userProfile?.profilePhoto} 
              alt="Profile" 
              className="w-9 h-9 rounded-full border border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all duration-300 cursor-pointer"
              onClick={() => setActiveSection("settings")}
            />

            <button
              onClick={logout}
              className="p-1.5 px-3 rounded-md bg-slate-900 border border-red-500/20 hover:bg-red-950/30 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all uppercase font-mono text-[9px] flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </header>

        {/* Collaborative Mobile navigation drawer/modal with premium glassmorphism and bento grids */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex flex-col md:hidden animate-fadeIn p-6 pb-24 overflow-y-auto">
            <div className="w-full max-w-md mx-auto space-y-6">
              
              {/* Header inside the drawer */}
              <div className="flex items-center justify-between border-b border-cyan-500/15 pb-4">
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                  <span className="font-black text-sm tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#4FACFE] to-[#00F5D4] drop-shadow-[0_0_15px_rgba(0,229,255,0.85)] animate-pulse">
                    🚀 FUTUREPATH CONSOLE
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-400 hover:text-cyan-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Navigation Categories - Touch Optimized (min 48px target height) */}
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  if (cat.role === "admin" && userProfile?.role !== "admin") return null;
                  const isActive = activeSection === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSidebarClick(cat.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border text-center min-h-[82px] cursor-pointer group relative ${
                        isActive 
                          ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/5 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
                          : "bg-slate-900/40 border-slate-850 text-slate-350 hover:text-cyan-400 hover:border-cyan-500/20"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                      )}
                      <div className={`mb-2 p-1 rounded transition-transform duration-300 ${isActive ? "scale-110 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]" : "text-slate-400 group-hover:text-cyan-400 group-hover:scale-115"}`}>
                        {cat.icon}
                      </div>
                      <span className="text-[10px] font-bold tracking-wide uppercase truncate w-full">{cat.label.replace(" Console", "").replace(" Hub", "")}</span>
                    </button>
                  );
                })}
              </div>

              {/* User quick badge in drawer footer */}
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-2 text-center">
                <p className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">ACTIVE TERMINAL SESSION</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="text-xs text-slate-300 font-bold font-mono uppercase">{userProfile?.name}</span>
                </div>
                <p className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">{userProfile?.role} CLEARANCE</p>
              </div>

            </div>
          </div>
        )}

        {/* Dynamic page container viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8">
          
          {activeSection === "dashboard" && (
            <DashboardConsole 
              onNavigate={(s) => setActiveSection(s)} 
            />
          )}

          {activeSection === "roadmaps" && <AcademicRoadmaps />}
          {activeSection === "ai-counselor" && <AICounselor />}
          {activeSection === "sports" && <SportsCorridor />}
          {activeSection === "resume" && <ResumeBuilder />}
          {activeSection === "college-explorer" && <CollegeExplorer />}
          {activeSection === "career-explorer" && <CareerExplorer />}
          {activeSection === "scholarships" && <ScholarshipHub />}
          {activeSection === "parent-desk" && <ParentDesk />}
          {activeSection === "result-analyzer" && <ResultAnalyzer />}
          {activeSection === "topic-analyzer" && <TopicAnalyzer />}
          {activeSection === "compete-crush" && <CompeteToCrush />}
          
          {activeSection === "admin-desk" && userProfile?.role === "admin" && <AdminDesk />}
          
          {activeSection === "privacy" && <PrivacyGDPR onNavigate={(s) => setActiveSection(s)} />}
          {activeSection === "help" && <HelpCenter />}

          {/* Core Settings template */}
          {activeSection === "settings" && (
            <div className="space-y-6 text-slate-100 max-w-2xl font-sans animate-fadeIn">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Settings className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">Account Settings</h2>
                  <p className="text-xs text-slate-400">Map customizable profile fields, school settings, and capability tags.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Full Student Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setColName(e.target.value)} 
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:outline-none rounded-lg text-xs" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Enrollment Class</label>
                    <select
                      value={editClass}
                      onChange={e => setColClass(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 rounded-lg text-xs cursor-pointer"
                    >
                      {activeGradClass.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Affiliated School Name</label>
                    <input 
                      type="text" 
                      value={editSchool} 
                      onChange={e => setColSchool(e.target.value)} 
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:outline-none rounded-lg text-xs" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">State Demography</label>
                    <input 
                      type="text" 
                      value={editState} 
                      onChange={e => setColState(e.target.value)} 
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:outline-none rounded-lg text-xs" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Ecosystem Interests (Comma separated)</label>
                  <input 
                    type="text" 
                    value={editInterests} 
                    onChange={e => setColInterests(e.target.value)} 
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:outline-none rounded-lg text-xs" 
                    placeholder="Robotics, Astrophysics, Public policies"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Active Skills Index (Comma separated)</label>
                  <input 
                    type="text" 
                    value={editSkills} 
                    onChange={e => setColSkills(e.target.value)} 
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:outline-none rounded-lg text-xs" 
                    placeholder="Coding, Algebra, Logic mathematics"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">Career Goal Statement</label>
                  <input 
                    type="text" 
                    value={editGoals} 
                    onChange={e => setColGoals(e.target.value)} 
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:outline-none rounded-lg text-xs" 
                    placeholder="Aiming to consolidate research metrics and sports credentials..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 font-extrabold text-xs rounded transition-colors cursor-pointer"
                >
                  {saveLoading ? "Recalibrating profile values..." : "Commit Profile Recalibrations"}
                </button>

              </form>
            </div>
          )}

        </main>

        {/* Floating, Glassmorphic Bottom Navigation Bar for Mobile-First Experience */}
        <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden bg-slate-950/85 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-1 px-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_15px_rgba(0,229,255,0.1)] flex items-center justify-around pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5">
          <button
            onClick={() => { setActiveSection("dashboard"); setMobileMenuOpen(false); }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative cursor-pointer ${
              activeSection === "dashboard" ? "text-cyan-400 font-black scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className={`w-5 h-5 mb-0.5 ${activeSection === "dashboard" ? "drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]" : ""}`} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Console</span>
            {activeSection === "dashboard" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>

          <button
            onClick={() => { setActiveSection("ai-counselor"); setMobileMenuOpen(false); }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative cursor-pointer ${
              activeSection === "ai-counselor" ? "text-cyan-400 font-black scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${activeSection === "ai-counselor" ? "drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]" : ""}`} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Counselor</span>
            {activeSection === "ai-counselor" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>

          <button
            onClick={() => { setActiveSection("compete-crush"); setMobileMenuOpen(false); }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative cursor-pointer ${
              activeSection === "compete-crush" ? "text-cyan-400 font-black scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className={`w-5 h-5 mb-0.5 ${activeSection === "compete-crush" ? "drop-shadow-[0_0_8px_rgba(0,229,255,0.7)] text-yellow-500 fill-yellow-500/20" : ""}`} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Compete</span>
            {activeSection === "compete-crush" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>

          <button
            onClick={() => { setActiveSection("college-explorer"); setMobileMenuOpen(false); }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative cursor-pointer ${
              activeSection === "college-explorer" ? "text-cyan-400 font-black scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className={`w-5 h-5 mb-0.5 ${activeSection === "college-explorer" ? "drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]" : ""}`} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Colleges</span>
            {activeSection === "college-explorer" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative cursor-pointer ${
              mobileMenuOpen ? "text-[#00E5FF] font-black scale-105" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Menu className={`w-5 h-5 mb-0.5 ${mobileMenuOpen ? "drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]" : ""}`} />
            <span className="text-[9px] uppercase tracking-wider font-bold">More</span>
            {mobileMenuOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            )}
          </button>
        </nav>
      </div>

    </div>
  );
}

// Subordinate wrapper routing Auth versus dashboard access
function RoutingContainer() {
  const { currentUser } = useAuth();
  
  // Custom hash tracking to load login/signup/forgot panels inside SPA wrapper
  const [authView, setAuthView] = useState<"login" | "signup" | "forgot" | "privacy" | "gdpr">("login");
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      if (window.location.hash === "#signup") {
        setAuthView("signup");
      } else if (window.location.hash === "#forgot") {
        setAuthView("forgot");
      } else if (window.location.hash === "#privacy") {
        setAuthView("privacy");
      } else if (window.location.hash === "#gdpr") {
        setAuthView("gdpr");
      } else {
        setAuthView("login");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Trigger initial on load
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateToHash = (hash: string) => {
    window.location.hash = hash;
  };

  // If user is authenticated, route immediately to Protected Dashboard Console
  if (currentUser) {
    return (
      <ProtectedRoute>
        <MainDashboardShell />
      </ProtectedRoute>
    );
  }

  // Otherwise, render full screen portal with futuristic visual space-themed backdrops
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden font-sans">
      
      {/* Decorative cyber grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0"></div>

      <div className="relative z-10 w-full flex justify-center py-10">
        {authView === "login" && (
          <Login 
            onSwitchToSignup={() => navigateToHash("#signup")}
            onSwitchToForgot={() => navigateToHash("#forgot")}
            onLoginSuccess={() => { window.location.hash = ""; }}
          />
        )}

        {authView === "signup" && (
          <Signup 
            onSwitchToLogin={() => navigateToHash("#login")}
            onSignupSuccess={() => { window.location.hash = ""; }}
          />
        )}

        {authView === "forgot" && (
          <ForgotPassword 
            onSwitchToLogin={() => navigateToHash("#login")}
          />
        )}

        {authView === "privacy" && (
          <div className="w-full max-w-4xl p-6 md:p-8 bg-[#111827]/90 border border-slate-800 rounded-2xl shadow-2xl shadow-sky-950/20 text-slate-100">
            <PrivacyGDPR 
              onNavigate={(s) => { navigateToHash("#login"); }}
              initialSubView="privacy-policy"
            />
          </div>
        )}

        {authView === "gdpr" && (
          <div className="w-full max-w-4xl p-6 md:p-8 bg-[#111827]/90 border border-slate-800 rounded-2xl shadow-2xl shadow-sky-950/20 text-slate-100">
            <PrivacyGDPR 
              onNavigate={(s) => { navigateToHash("#login"); }}
              initialSubView="gdpr-rights"
            />
          </div>
        )}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RoutingContainer />
    </AuthProvider>
  );
}
