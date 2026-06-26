import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from "recharts";
import { 
  Sparkles, Award, Shield, FileText, LayoutGrid, CheckCircle2, TrendingUp, LineChart, 
  Map, Trophy, Users, Star, ArrowRight, Activity, Compass, GraduationCap, Globe, Calculator, BookOpen, Crown
} from "lucide-react";

interface DashboardConsoleProps {
  onNavigate: (section: string) => void;
}

export const DashboardConsole: React.FC<DashboardConsoleProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();

  // Custom premium calculations
  const achievementPoints = 450 + (userProfile?.skills.length || 0) * 75;
  const careerScore = Math.min(100, 45 + (userProfile?.skills.length || 0) * 8);
  const skillsScore = Math.min(100, 30 + (userProfile?.skills.length || 0) * 12);
  const portfolioCompletion = Math.min(100, 50 + (userProfile?.interests.length || 0) * 10);
  const resumeCompletion = userProfile?.skills?.length && userProfile?.interests?.length && userProfile?.careerGoals ? 100 : 60;

  // Recharts metric arrays
  const skillsData = [
    { name: "STEM", value: 45, average: 30 },
    { name: "Logic", value: 65, average: 40 },
    { name: "Sports", value: userProfile?.role === "student" ? 55 : 35, average: 45 },
    { name: "Creativity", value: 50, average: 35 },
    { name: "Vocational", value: 70, average: 50 },
    { name: "Analytics", value: 80, average: 55 }
  ];

  const consoleModules = [
    {
      id: "roadmaps",
      title: "Academic Roadmaps",
      subtitle: "CLASS PATHWAYS & MILESTONES",
      desc: "Class-wise milestones, board targets, exam trackers, and CBSE blueprints.",
      icon: Map,
      gradient: "from-[#B388FF] to-[#7C4DFF]",
      glowColor: "rgba(124, 77, 255, 0.4)",
      iconBg: "bg-purple-500/10 border-purple-500/20 text-[#B388FF]",
      textColor: "text-purple-400",
      themeVariables: {
        "--theme-border-dim": "rgba(180, 136, 255, 0.22)",
        "--theme-border-bright": "rgba(180, 136, 255, 0.45)",
        "--theme-border-hover": "rgba(180, 136, 255, 0.85)",
        "--theme-shadow-dim": "rgba(124, 77, 255, 0.08)",
        "--theme-shadow-bright": "rgba(124, 77, 255, 0.25)",
        "--theme-shadow-hover": "rgba(124, 77, 255, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "ACADEMICS"
    },
    {
      id: "ai-counselor",
      title: "AI Career Counselor",
      subtitle: "AI ASSISTED COUNSELING",
      desc: "Acquire CBSE recommendations, personalized guidance, and college advice.",
      icon: Compass,
      gradient: "from-[#00E5FF] to-[#4FC3F7]",
      glowColor: "rgba(0, 229, 255, 0.4)",
      iconBg: "bg-cyan-500/10 border-cyan-500/20 text-[#00E5FF]",
      textColor: "text-cyan-400",
      themeVariables: {
        "--theme-border-dim": "rgba(0, 229, 255, 0.22)",
        "--theme-border-bright": "rgba(0, 229, 255, 0.45)",
        "--theme-border-hover": "rgba(0, 229, 255, 0.85)",
        "--theme-shadow-dim": "rgba(0, 229, 255, 0.08)",
        "--theme-shadow-bright": "rgba(0, 229, 255, 0.25)",
        "--theme-shadow-hover": "rgba(0, 229, 255, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "CORE AI"
    },
    {
      id: "sports",
      title: "Sports Corridor",
      subtitle: "ATHLETIC EXCELLENCE TRACK",
      desc: "Log athletic tournaments, medals, and generate dual sports resumes.",
      icon: Trophy,
      gradient: "from-[#FF9100] to-[#FF3D00]",
      glowColor: "rgba(255, 61, 0, 0.4)",
      iconBg: "bg-orange-500/10 border-orange-500/20 text-[#FF9100]",
      textColor: "text-orange-400",
      themeVariables: {
        "--theme-border-dim": "rgba(255, 145, 0, 0.22)",
        "--theme-border-bright": "rgba(255, 145, 0, 0.45)",
        "--theme-border-hover": "rgba(255, 145, 0, 0.85)",
        "--theme-shadow-dim": "rgba(255, 61, 0, 0.08)",
        "--theme-shadow-bright": "rgba(255, 61, 0, 0.25)",
        "--theme-shadow-hover": "rgba(255, 61, 0, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "SPORTS"
    },
    {
      id: "resume",
      title: "Resume Builder",
      subtitle: "ACADEMIC CV ARCHITECT",
      desc: "Create high-impact resumes tailored for colleges, internships & jobs.",
      icon: FileText,
      gradient: "from-[#00E676] to-[#059669]",
      glowColor: "rgba(0, 230, 118, 0.4)",
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-[#00E676]",
      textColor: "text-emerald-400",
      themeVariables: {
        "--theme-border-dim": "rgba(0, 230, 118, 0.22)",
        "--theme-border-bright": "rgba(0, 230, 118, 0.45)",
        "--theme-border-hover": "rgba(0, 230, 118, 0.85)",
        "--theme-shadow-dim": "rgba(0, 230, 118, 0.08)",
        "--theme-shadow-bright": "rgba(0, 230, 118, 0.25)",
        "--theme-shadow-hover": "rgba(0, 230, 118, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "CAREERS"
    },
    {
      id: "college-explorer",
      title: "College Explorer",
      subtitle: "HIGHER EDUCATION PORTAL",
      desc: "Admissions cut-offs, fee schedules, and matching scores for top colleges.",
      icon: GraduationCap,
      gradient: "from-[#D500F9] to-[#7C4DFF]",
      glowColor: "rgba(213, 0, 249, 0.4)",
      iconBg: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400",
      textColor: "text-fuchsia-400",
      themeVariables: {
        "--theme-border-dim": "rgba(213, 0, 249, 0.22)",
        "--theme-border-bright": "rgba(213, 0, 249, 0.45)",
        "--theme-border-hover": "rgba(213, 0, 249, 0.85)",
        "--theme-shadow-dim": "rgba(213, 0, 249, 0.08)",
        "--theme-shadow-bright": "rgba(213, 0, 249, 0.25)",
        "--theme-shadow-hover": "rgba(213, 0, 249, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "COLLEGES"
    },
    {
      id: "career-explorer",
      title: "Career Explorer",
      subtitle: "PROFESSION NAVIGATION",
      desc: "Navigate diverse global professions and required modern metrics.",
      icon: Globe,
      gradient: "from-[#42A5F5] to-[#1E88E5]",
      glowColor: "rgba(30, 136, 229, 0.4)",
      iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      textColor: "text-blue-400",
      themeVariables: {
        "--theme-border-dim": "rgba(66, 165, 245, 0.22)",
        "--theme-border-bright": "rgba(66, 165, 245, 0.45)",
        "--theme-border-hover": "rgba(66, 165, 245, 0.85)",
        "--theme-shadow-dim": "rgba(30, 136, 229, 0.08)",
        "--theme-shadow-bright": "rgba(30, 136, 229, 0.25)",
        "--theme-shadow-hover": "rgba(30, 136, 229, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "EXPLORE"
    },
    {
      id: "scholarships",
      title: "Scholarship Hub",
      subtitle: "GRANT & SCHOLARSHIP ARCHIVE",
      desc: "Search, bookmark, and fulfill elite national/global scholarship applications.",
      icon: Award,
      gradient: "from-[#FFD54F] to-[#FFB300]",
      glowColor: "rgba(255, 179, 0, 0.4)",
      iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      textColor: "text-amber-400",
      themeVariables: {
        "--theme-border-dim": "rgba(255, 213, 79, 0.22)",
        "--theme-border-bright": "rgba(255, 213, 79, 0.45)",
        "--theme-border-hover": "rgba(255, 213, 79, 0.85)",
        "--theme-shadow-dim": "rgba(255, 179, 0, 0.08)",
        "--theme-shadow-bright": "rgba(255, 179, 0, 0.25)",
        "--theme-shadow-hover": "rgba(255, 179, 0, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "GRANTS"
    },
    {
      id: "parent-desk",
      title: "Parent Desk",
      subtitle: "GUARDIAN REPORT TERMINAL",
      desc: "Audit progress cards, grade cards, and schedule direct email reports.",
      icon: Users,
      gradient: "from-[#00BFA5] to-[#00796B]",
      glowColor: "rgba(0, 191, 165, 0.4)",
      iconBg: "bg-teal-500/10 border-teal-500/20 text-teal-400",
      textColor: "text-teal-400",
      themeVariables: {
        "--theme-border-dim": "rgba(0, 191, 165, 0.22)",
        "--theme-border-bright": "rgba(0, 191, 165, 0.45)",
        "--theme-border-hover": "rgba(0, 191, 165, 0.85)",
        "--theme-shadow-dim": "rgba(0, 191, 165, 0.08)",
        "--theme-shadow-bright": "rgba(0, 191, 165, 0.25)",
        "--theme-shadow-hover": "rgba(0, 191, 165, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "PARENTS"
    },
    {
      id: "result-analyzer",
      title: "Result Analyzer",
      subtitle: "GRADE TRACKING MODULE",
      desc: "Forecast target grades, CGPA milestones, and mock examination splits.",
      icon: Calculator,
      gradient: "from-[#FF4081] to-[#F50057]",
      glowColor: "rgba(245, 0, 87, 0.4)",
      iconBg: "bg-pink-500/10 border-pink-500/20 text-pink-400",
      textColor: "text-pink-400",
      themeVariables: {
        "--theme-border-dim": "rgba(255, 64, 129, 0.22)",
        "--theme-border-bright": "rgba(255, 64, 129, 0.45)",
        "--theme-border-hover": "rgba(255, 64, 129, 0.85)",
        "--theme-shadow-dim": "rgba(245, 0, 87, 0.08)",
        "--theme-shadow-bright": "rgba(245, 0, 87, 0.25)",
        "--theme-shadow-hover": "rgba(245, 0, 87, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "FORECAST"
    },
    {
      id: "topic-analyzer",
      title: "Topic Analyzer",
      subtitle: "DEEP LEARNING SEARCH",
      desc: "Extract detailed study questions and previous year board papers with ease.",
      icon: BookOpen,
      gradient: "from-[#3F51B5] to-[#303F9F]",
      glowColor: "rgba(63, 81, 181, 0.4)",
      iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      textColor: "text-indigo-400",
      themeVariables: {
        "--theme-border-dim": "rgba(63, 81, 181, 0.22)",
        "--theme-border-bright": "rgba(63, 81, 181, 0.45)",
        "--theme-border-hover": "rgba(63, 81, 181, 0.85)",
        "--theme-shadow-dim": "rgba(63, 81, 181, 0.08)",
        "--theme-shadow-bright": "rgba(63, 81, 181, 0.25)",
        "--theme-shadow-hover": "rgba(63, 81, 181, 0.55)",
      } as React.CSSProperties,
      isPremium: false,
      badge: "SYLLABUS"
    },
    {
      id: "compete-crush",
      title: "Compete to Crush",
      subtitle: "BOARD MOCKS & ELITE EXAMS",
      desc: "Syllabus checklists, weekly schedules, mock engines, & UPSC prep with elite AI.",
      icon: Trophy,
      gradient: "from-[#FFD700] to-[#FFA000]",
      glowColor: "rgba(255, 160, 0, 0.55)",
      iconBg: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/35 text-yellow-400",
      textColor: "text-amber-400",
      themeVariables: {
        "--theme-border-dim": "rgba(255, 215, 0, 0.35)",
        "--theme-border-bright": "rgba(255, 215, 0, 0.65)",
        "--theme-border-hover": "rgba(255, 215, 0, 0.95)",
        "--theme-shadow-dim": "rgba(255, 160, 0, 0.15)",
        "--theme-shadow-bright": "rgba(255, 160, 0, 0.45)",
        "--theme-shadow-hover": "rgba(255, 160, 0, 0.85)",
      } as React.CSSProperties,
      isPremium: true,
      badge: "👑 PREMIUM"
    }
  ];

  return (
    <div className="relative space-y-8 text-slate-100 font-sans animate-fadeIn min-h-screen pb-10">
      
      {/* Background Ambient Aesthetics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 rounded-3xl">
        {/* Futuristic Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{
            backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Floating Particles & Neon Glowing Orbs */}
        <div className="absolute top-[5%] left-[-15%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        <div className="absolute top-[35%] right-[-15%] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: "16s" }} />
        <div className="absolute bottom-[5%] left-[15%] w-[350px] h-[350px] rounded-full bg-yellow-500/5 blur-[110px] pointer-events-none" />

        {/* Animated Cyber Light Streaks */}
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-2/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/15 to-transparent animate-pulse" style={{ animationDuration: "9s" }} />
      </div>
      
      {/* Top Banner greeting with Cyberglass styling */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0B1121]/90 backdrop-blur-lg p-5 sm:p-6 md:p-8 shadow-[0_0_35px_rgba(0,229,255,0.15)] sweep-container sweep-glow animate-fadeIn">
        <div className="absolute top-0 right-0 p-8 opacity-25 pointer-events-none">
          <Sparkles className="w-24 h-24 sm:w-40 sm:h-40 text-cyan-400 rotate-12 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(0,229,255,0.3)] font-bold">
            <span>Core Ecosystem Online</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse drop-shadow-[0_0_6px_rgba(0,229,255,0.9)]"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#4FACFE] to-[#00F5D4] drop-shadow-[0_0_25px_rgba(0,229,255,0.6)] leading-tight">
            GREETINGS, <span className="username-hero-gradient">{userProfile?.name?.toUpperCase() || "SCHOLAR"}</span>!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
            Welcome to the terminal control of your academic and professional path. Configure your digital folders, consult with our AI counselor, and map collegiate pathways.
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-[9px] sm:text-[10px] font-mono font-bold">
            <span className="bg-cyan-950/60 px-2.5 py-1.5 rounded-lg border border-cyan-500/25 text-cyan-400">NODE: {userProfile?.school || "Universal Academy"}</span>
            <span className="bg-blue-950/60 px-2.5 py-1.5 rounded-lg border border-blue-500/25 text-blue-400">CLASS: {userProfile?.class || "10th Standard"}</span>
            <span className="bg-indigo-950/60 px-2.5 py-1.5 rounded-lg border border-indigo-500/25 text-indigo-400">REGION: {userProfile?.state || "State Centric"}</span>
          </div>
        </div>
      </div>

      {/* Quick stats board with breathing pulse borders - fluid grid columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
        
        {/* Points */}
        <div className="p-4 sm:p-5 cyber-card-gold flex flex-col justify-between space-y-3 rounded-xl min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Milestone Points</span>
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono stat-gold-glow">{achievementPoints}</div>
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">Accumulated metrics</p>
          </div>
        </div>

        {/* Career Score */}
        <div className="p-4 sm:p-5 cyber-card-cyan flex flex-col justify-between space-y-3 rounded-xl min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Career Suitability</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono stat-purple-glow">{careerScore}%</div>
            <div className="w-full bg-slate-950/80 h-1.5 sm:h-2 rounded-full mt-2 overflow-hidden border border-cyan-500/15">
              <div className="bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] h-full transition-all duration-500 shadow-[0_0_8px_rgba(0,229,255,0.6)]" style={{ width: `${careerScore}%` }}></div>
            </div>
          </div>
        </div>

        {/* Skills Index */}
        <div className="p-4 sm:p-5 cyber-card-purple flex flex-col justify-between space-y-3 rounded-xl min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Skills Quotient</span>
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono stat-blue-glow">{skillsScore}%</div>
            <div className="w-full bg-slate-950/80 h-1.5 sm:h-2 rounded-full mt-2 overflow-hidden border border-indigo-500/15">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" style={{ width: `${skillsScore}%` }}></div>
            </div>
          </div>
        </div>

        {/* Portfolio Completion */}
        <div className="p-4 sm:p-5 cyber-card-green flex flex-col justify-between space-y-3 rounded-xl min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Portfolio Status</span>
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono stat-green-glow">{Math.round(portfolioCompletion)}%</div>
            <div className="w-full bg-slate-950/80 h-1.5 sm:h-2 rounded-full mt-2 overflow-hidden border border-emerald-500/15">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" style={{ width: `${portfolioCompletion}%` }}></div>
            </div>
          </div>
        </div>

        {/* Resume Progress */}
        <div className="p-4 sm:p-5 cyber-card-blue flex flex-col justify-between space-y-3 col-span-1 sm:col-span-2 lg:col-span-1 rounded-xl min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Resume Progress</span>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono stat-gold-glow">{resumeCompletion}%</div>
            <div className="w-full bg-slate-950/80 h-1.5 sm:h-2 rounded-full mt-2 overflow-hidden border border-amber-500/15">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" style={{ width: `${resumeCompletion}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts block with Glassmorphism */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Skills Radar / Bar comparison */}
        <div className="p-4 sm:p-6 bg-slate-950/50 backdrop-blur-lg border border-cyan-500/15 rounded-2xl space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LineChart className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]" />
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]">Skills Growth Index</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/15">Live Analytics</span>
          </div>
          
          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ backgroundColor: "#070B16", borderColor: "rgba(0,229,255,0.2)", color: "#f8fafc" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="value" name="My Score" stroke="#00E5FF" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="average" name="National Peer Average" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorAvg)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quick Navigation Widgets - Redesigned 2-Column Mobile Grid, 3-Column Tablet, 4/5-Column Large screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {consoleModules.map((mod) => {
          const IconComp = mod.icon;
          return (
            <div 
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className={`relative overflow-hidden rounded-[20px] border cursor-pointer group p-4 sm:p-5 flex flex-col justify-between select-none animated-glow-module ${
                mod.isPremium ? "shadow-[0_0_30px_rgba(255,160,0,0.2)] hover:-translate-y-2" : ""
              }`}
              style={{
                ...mod.themeVariables,
                minHeight: "190px",
                ...(mod.isPremium ? {
                  background: "linear-gradient(135deg, rgba(24, 18, 5, 0.88) 0%, rgba(12, 10, 5, 0.9) 100%)",
                } : {})
              }}
            >
              {/* Soft neon background halo matching color identity */}
              <div 
                className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-15 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: mod.glowColor }}
              />

              {/* Shimmer light sweep animation */}
              <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />

              {/* Premium Background Circuit Line effect for extra cyberpunk flair */}
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                {/* Header: Icon Container & Badge */}
                <div className="flex items-center justify-between">
                  <div 
                    className="p-3 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 relative overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at center, ${mod.glowColor.replace("0.4", "0.22")} 0%, transparent 75%)`,
                      borderColor: mod.isPremium ? "rgba(255, 215, 0, 0.45)" : mod.glowColor.replace("0.4", "0.3"),
                      boxShadow: `0 0 15px ${mod.glowColor.replace("0.4", "0.15")}`,
                    }}
                  >
                    {/* Glowing inner dot/orb */}
                    <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <IconComp className={`w-5 h-5 relative z-10 ${mod.textColor}`} />
                  </div>
                  
                  <span className={`text-[8px] sm:text-[9px] px-2.5 py-1 font-mono font-black rounded-full tracking-wider border ${
                    mod.isPremium 
                      ? "border-yellow-500/40 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 shadow-[0_0_12px_rgba(255,215,0,0.35)] animate-pulse" 
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}>
                    {mod.badge}
                  </span>
                </div>

                {/* Text Information block */}
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm tracking-tight text-white transition-all duration-300 flex items-center gap-1.5">
                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${mod.gradient} font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]`}>
                      {mod.title}
                    </span>
                    {mod.isPremium && <Crown className="w-3.5 h-3.5 text-yellow-400 animate-bounce shrink-0" />}
                  </h4>
                  <p className={`text-[8px] sm:text-[9px] font-mono font-semibold tracking-widest uppercase truncate ${mod.textColor}`}>
                    {mod.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-200 transition-colors duration-300">
                  {mod.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

