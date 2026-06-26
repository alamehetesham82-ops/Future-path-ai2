import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  Trophy, Award, CreditCard, CheckCircle2, Calendar, ChevronRight, Plus, Trash2, 
  Sparkles, Star, TrendingUp, Info, ShieldCheck, Flame, BookOpen, Clock, BarChart4,
  RefreshCw, Play, Check, Lock, User, FileText, Lightbulb, AlertTriangle, ChevronDown, CheckSquare, ListPlus,
  HelpCircle, Loader2, XCircle, Download, FileSpreadsheet, Activity, Mic, Volume2, ExternalLink, Globe,
  Cpu, Briefcase, Scale, Building2, Wrench, Shield, GraduationCap, ChevronLeft
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { apiUrl } from "../services/apiBase";
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { 
  generateExamsCatalog, PREP_CATEGORIES, UPSC_INTERVIEW_PREP_DATA, 
  ExamProfile, SubjectDetail, ChapterDetail, TopicDetail, SubtopicDetail, InterviewTopic 
} from "../data/competeData";
import { getStaticChapterDetailedData, BOARD_EXAM_STRATEGIES } from "../data/class10Curriculum";
import { useAuth } from "../context/AuthContext";

// Curated playlists for extra reference
const YOUTUBE_LEARNING_PLAYLISTS: Record<string, Record<string, {
  subjectName: string;
  title: string;
  url: string;
  desc: string;
  thumbnail: string;
  videoCount: string;
  topicsCovered: string[];
}>> = {
  "class-10": {
    "mathematics": {
      subjectName: "MATHEMATICS",
      title: "Class 10 Maths Magnet Brains Playlist",
      url: "https://www.youtube.com/results?search_query=Class+10+Maths+Magnet+Brains+Playlist",
      desc: "Comprehensive Class 10 CBSE Mathematics lectures with NCERT solutions.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      videoCount: "125",
      topicsCovered: ["Real Numbers", "Polynomials", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Trigonometry"]
    },
    "science": {
      subjectName: "SCIENCE",
      title: "Class 10 Physics & Chemistry Magnet Lecture series",
      url: "https://www.youtube.com/results?search_query=Class+10+Science+Magnet+Brains+Playlist",
      desc: "Visual diagrams, chemical balance steps, and physical formula guides.",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      videoCount: "110",
      topicsCovered: ["Chemical Reactions", "Acids, Bases & Salts", "Metals & Non-metals", "Carbon & its Compounds", "Life Processes", "Light - Reflection & Refraction"]
    }
  },
  "class-11-pcm": {
    "physics": {
      subjectName: "PHYSICS",
      title: "Class 11 Physics Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+11+Physics+Playlist+Magnet+Brains",
      desc: "Full comprehensive Class 11 Physics syllabus deconstruction, covering physical world, vectors, kinematics, laws of motion, gravitation, and thermodynamics.",
      thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
      videoCount: "148 lectures",
      topicsCovered: ["Kinematics & Force Systems", "Rotational Inertia & Waves", "Electrostatics & Magnetism", "Optics & Nuclear Physics"]
    },
    "chemistry": {
      subjectName: "CHEMISTRY",
      title: "Class 11 Chemistry Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+11+Chemistry+Playlist+Magnet+Brains",
      desc: "Step-by-step master lessons for CBSE Class 11 Chemistry, chemical principles, molecular structures, and organic fundamentals.",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      videoCount: "135 lectures",
      topicsCovered: ["Atomic Structure & Bonding", "Chemical Equilibrium & Ideal Gas", "Organics & Functional Reactions", "Coordination & Polymers"]
    },
    "mathematics": {
      subjectName: "MATHEMATICS",
      title: "Class 11 Maths Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+11+Maths+Playlist+Magnet+Brains",
      desc: "Full course Class 11 Mathematics core CBSE modules solved, covering coordinate geometry, sets, relations, functions, and calculus elements.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      videoCount: "165 lectures",
      topicsCovered: ["Sets, Relations & Functions", "Algebra & Matrix Determinants", "Limits & Integral Calculus", "3D Geometry & Vectors"]
    }
  },
  "class-11-pcb": {
    "physics": {
      subjectName: "PHYSICS",
      title: "Class 11 Physics Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+11+Physics+Playlist+Magnet+Brains",
      desc: "Full comprehensive Class 11 Physics syllabus deconstruction, covering physical world, vectors, kinematics, laws of motion, gravitation, and thermodynamics.",
      thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
      videoCount: "148 lectures",
      topicsCovered: ["Kinematics & Force Systems", "Rotational Inertia & Waves", "Electrostatics & Magnetism", "Optics & Nuclear Physics"]
    },
    "chemistry": {
      subjectName: "CHEMISTRY",
      title: "Class 11 Chemistry Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+11+Chemistry+Playlist+Magnet+Brains",
      desc: "Step-by-step master lessons for CBSE Class 11 Chemistry, chemical principles, molecular structures, and organic fundamentals.",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      videoCount: "135 lectures",
      topicsCovered: ["Atomic Structure & Bonding", "Chemical Equilibrium & Ideal Gas", "Organics & Functional Reactions", "Coordination & Polymers"]
    },
    "biology": {
      subjectName: "BIOLOGY",
      title: "Class 11 Biology Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+11+Biology+Playlist+Magnet+Brains",
      desc: "Detailed Class 11 Biology lecture series covering plant morphology, anatomy, human physiology, cell structures, and metabolic loops.",
      thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80",
      videoCount: "172 lectures",
      topicsCovered: ["Plant Anatomy & Taxonomy", "Cell Division & Genetics", "Human Metabolism Systems", "Ecology & Organic Evolution"]
    }
  },
  "class-11-commerce": {
    "accountancy": {
      subjectName: "ACCOUNTANCY",
      title: "Class 11 Accountancy Playlist - Rajat Arora",
      url: "https://www.youtube.com/results?search_query=Class+11+Accountancy+Playlist+Rajat+Arora",
      desc: "Learn CBSE Class 11 Financial Accounting, double-entry bookkeeping, ledger reconciliation, trial balance, and final statements.",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      videoCount: "92 lectures",
      topicsCovered: ["Accounting Fundamentals", "Partnership Capital Deeds", "Corporate Stocks & Share ledger", "Cash Flow Statements"]
    },
    "business-studies": {
      subjectName: "BUSINESS STUDIES",
      title: "Class 11 Business Studies Playlist - Rajat Arora",
      url: "https://www.youtube.com/results?search_query=Class+11+Business+Studies+Playlist+Rajat+Arora",
      desc: "Comprehensive CBSE Class 11 Business Studies covering trade channels, forms of business, finance, and marketing systems.",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      videoCount: "74 lectures",
      topicsCovered: ["Principles of management", "Business Finance Options", "Marketing Management Decisions", "Consumer Protection Acts"]
    },
    "economics": {
      subjectName: "ECONOMICS",
      title: "Class 11 Economics Playlist - Rajat Arora",
      url: "https://www.youtube.com/results?search_query=Class+11+Economics+Playlist+Rajat+Arora",
      desc: "CBSE Class 11 Introductory Microeconomics and Statistics for Economics. Essential concepts with graphs.",
      thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80",
      videoCount: "85 lectures",
      topicsCovered: ["Microeconomics Consumer demand", "National Income Accounting", "Banking & Fiscal Budgets", "Dynamic Economics Models"]
    }
  },
  "class-12-pcm": {
    "physics": {
      subjectName: "PHYSICS",
      title: "Class 12 Physics Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+12+Physics+Playlist+Magnet+Brains",
      desc: "Centralized Class 12 Boards Physics lectures deconstructed. Comprehensive coverage of electrostatics, current, optics, magnetics, and modern physics.",
      thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
      videoCount: "155 lectures",
      topicsCovered: ["Kinematics & Force Systems", "Rotational Inertia & Waves", "Electrostatics & Magnetism", "Optics & Nuclear Physics"]
    },
    "chemistry": {
      subjectName: "CHEMISTRY",
      title: "Class 12 Chemistry Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+12+Chemistry+Playlist+Magnet+Brains",
      desc: "CBSE Class 12 board preparation for Physical, Inorganic, and Organic Chemistry with NCERT solution guides.",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      videoCount: "142 lectures",
      topicsCovered: ["Atomic Structure & Bonding", "Chemical Equilibrium & Ideal Gas", "Organics & Functional Reactions", "Coordination & Polymers"]
    },
    "mathematics": {
      subjectName: "MATHEMATICS",
      title: "Class 12 Maths Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+12+Maths+Playlist+Magnet+Brains",
      desc: "Centralized Class 12 board-level Mathematics series. Deeply covers calculus, linear programming, matrices, and vectors.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      videoCount: "180 lectures",
      topicsCovered: ["Sets, Relations & Functions", "Algebra & Matrix Determinants", "Limits & Integral Calculus", "3D Geometry & Vectors"]
    }
  },
  "class-12-pcb": {
    "physics": {
      subjectName: "PHYSICS",
      title: "Class 12 Physics Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+12+Physics+Playlist+Magnet+Brains",
      desc: "Centralized Class 12 Boards Physics lectures deconstructed. Comprehensive coverage of electrostatics, current, optics, magnetics, and modern physics.",
      thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
      videoCount: "155 lectures",
      topicsCovered: ["Kinematics & Force Systems", "Rotational Inertia & Waves", "Electrostatics & Magnetism", "Optics & Nuclear Physics"]
    },
    "chemistry": {
      subjectName: "CHEMISTRY",
      title: "Class 12 Chemistry Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+12+Chemistry+Playlist+Magnet+Brains",
      desc: "CBSE Class 12 board preparation for Physical, Inorganic, and Organic Chemistry with NCERT solution guides.",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      videoCount: "142 lectures",
      topicsCovered: ["Atomic Structure & Bonding", "Chemical Equilibrium & Ideal Gas", "Organics & Functional Reactions", "Coordination & Polymers"]
    },
    "biology": {
      subjectName: "BIOLOGY",
      title: "Class 12 Biology Playlist - Magnet Brains",
      url: "https://www.youtube.com/results?search_query=Class+12+Biology+Playlist+Magnet+Brains",
      desc: "Supreme Class 12 Board Biology series covering genetics, molecular reproduction, human ecology, biotechnology, and health.",
      thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80",
      videoCount: "160 lectures",
      topicsCovered: ["Plant Anatomy & Taxonomy", "Cell Division & Genetics", "Human Metabolism Systems", "Ecology & Organic Evolution"]
    }
  },
  "class-12-commerce": {
    "accountancy": {
      subjectName: "ACCOUNTANCY",
      title: "Class 12 Accountancy Playlist - Rajat Arora",
      url: "https://www.youtube.com/results?search_query=Class+12+Accountancy+Playlist+Rajat+Arora",
      desc: "Complete Class 12 partnership accounting, company shares/debentures, financial ratios, and Cash Flow ledger formulations.",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      videoCount: "115 lectures",
      topicsCovered: ["Accounting Fundamentals", "Partnership Capital Deeds", "Corporate Stocks & Share ledger", "Cash Flow Statements"]
    },
    "business-studies": {
      subjectName: "BUSINESS STUDIES",
      title: "Class 12 Business Studies Playlist - Rajat Arora",
      url: "https://www.youtube.com/results?search_query=Class+12+Business+Studies+Playlist+Rajat+Arora",
      desc: "CBSE Class 12 Principles & Functions of management and business finance directories by Rajat Arora.",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      videoCount: "88 lectures",
      topicsCovered: ["Principles of management", "Business Finance Options", "Marketing Management Decisions", "Consumer Protection Acts"]
    },
    "economics": {
      subjectName: "ECONOMICS",
      title: "Class 12 Economics Playlist - Rajat Arora",
      url: "https://www.youtube.com/results?search_query=Class+12+Economics+Playlist+Rajat+Arora",
      desc: "CBSE Class 12 introductory Macroeconomics and Indian Economic Development board guidelines.",
      thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80",
      videoCount: "94 lectures",
      topicsCovered: ["Microeconomics Consumer demand", "National Income Accounting", "Banking & Fiscal Budgets", "Dynamic Economics Models"]
    }
  }
};

export function CompeteToCrush({ userProfile, user: initialUser }: { userProfile: any; user: any }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "verifying" | "success" | "failed">("idle");
  const [paymentError, setPaymentError] = useState<string>("");
  const { user, authLoading, updateProfile } = useAuth();

  const examsList = generateExamsCatalog();

  // Active exam / subject / topic tracking states
  const [selectedExamId, setSelectedExamId] = useState<string>("class-10");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("mathematics");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("real-numbers");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("euclid-lemma");
  const [selectedSubtopic, setSelectedSubtopic] = useState<SubtopicDetail | null>(null);

  // Checked syllabus status database tracker
  const [checkedTopics, setCheckedTopics] = useState<Record<string, "Not Started" | "In Progress" | "Completed">>({});
  const [scoresList, setScoresList] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(false);

  // Tab systems
  const [cbseActiveTab, setCbseActiveTab] = useState<string>("videos");
  const [upscActiveInterviewId, setUpscActiveInterviewId] = useState<string>("national-security");

  // AI Topic Analyzer States
  const [topicAnalyzerInput, setTopicAnalyzerInput] = useState<string>("");
  const [topicAnalyzerDifficulty, setTopicAnalyzerDifficulty] = useState<"basic" | "medium" | "advanced" | "expert">("basic");
  const [topicAnalyzerLoading, setTopicAnalyzerLoading] = useState<boolean>(false);
  const [topicAnalyzerResult, setTopicAnalyzerResult] = useState<any | null>(null);
  const [topicAnalyzerError, setTopicAnalyzerError] = useState<string | null>(null);
  const [topicAnalyzerActiveSubTab, setTopicAnalyzerActiveSubTab] = useState<
    "overview" | "definition" | "detailed" | "examples" | "diagram" | "mindmap" | "facts" | "board" | "competitive" | "pyqs" | "mistakes" | "revision"
  >("overview");
  const [expandedExamId, setExpandedExamId] = useState<string | null>("class-10");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // PYQ Discussion Hub States
  const [pyqHubYear, setPyqHubYear] = useState<string>("2024");
  const [pyqHubChat, setPyqHubChat] = useState<Array<{ role: "user" | "assistant", content: string }>>([
    { role: "assistant", content: "Greetings! Welcome to the PYQ Discussion Hub. Select any year or click a preloaded question, or ask any conceptual doubt about previous year exams! I can provide step-by-step toppers' solutions, short tricks, and error-prevention tips." }
  ]);
  const [pyqHubInput, setPyqHubInput] = useState<string>("");
  const [pyqHubLoading, setPyqHubLoading] = useState<boolean>(false);

  // Live PYQ Engine States
  const [livePyqs, setLivePyqs] = useState<any[]>([]);
  const [livePyqsLoading, setLivePyqsLoading] = useState<boolean>(false);
  const [livePyqsSource, setLivePyqsSource] = useState<string>("");

  // Ollama AI Coach States
  const [ollamaActiveCategory, setOllamaActiveCategory] = useState<"interview" | "guidance" | "soft-skills" | "strategy">("interview");
  const [ollamaSelectedRole, setOllamaSelectedRole] = useState<string>("Software Engineer");
  const [ollamaChat, setOllamaChat] = useState<Array<{ role: "user" | "assistant", content: string }>>([
    { role: "assistant", content: "Hello! I am your local Ollama AI Coach. Select the 'Mock Interview' mode, choose your target career role, and click 'Start Mock Interview' to practice realistic questions with real-time feedback!" }
  ]);
  const [ollamaInput, setOllamaInput] = useState<string>("");
  const [ollamaLoading, setOllamaLoading] = useState<boolean>(false);
  const [ollamaConfidenceScore, setOllamaConfidenceScore] = useState<number>(85);
  const [ollamaFeedback, setOllamaFeedback] = useState<string>("");
  const [ollamaSpeechActive, setOllamaSpeechActive] = useState<boolean>(false);
  const [ollamaListening, setOllamaListening] = useState<boolean>(false);

  // Jarvis Mentor Agent States
  const [jarvisChat, setJarvisChat] = useState<Array<{ role: "user" | "assistant", content: string }>>([
    { role: "assistant", content: "System online. Hey! I am Jarvis, your autonomous study mentor. I can generate study plans, monitor your curriculum progress, trigger study commands, and calculate your live Exam Readiness Score. Try saying 'explain photosynthesis' or 'start mock test'!" }
  ]);
  const [jarvisInput, setJarvisInput] = useState<string>("");
  const [jarvisLoading, setJarvisLoading] = useState<boolean>(false);
  const [jarvisSpeechActive, setJarvisSpeechActive] = useState<boolean>(false);
  const [jarvisListening, setJarvisListening] = useState<boolean>(false);
  const [jarvisPlannerTab, setJarvisPlannerTab] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Custom interactive user tasks for study tracking
  const [jarvisDailyTasks, setJarvisDailyTasks] = useState<string[]>([
    "Revise Class 11 Physics Formulas",
    "Review NCERT Chemistry Chapter 2 Exercises",
    "Complete Trigonometry MCQs Mock Drill"
  ]);
  const [jarvisWeeklyTasks, setJarvisWeeklyTasks] = useState<string[]>([
    "Conduct weekly mock assessment for Math units",
    "Resolve previous 5 years JEE Main mechanics questions",
    "Re-evaluate weak areas dossier in Chemistry"
  ]);
  const [jarvisMonthlyTasks, setJarvisMonthlyTasks] = useState<string[]>([
    "Reach 85% score consistency on chemistry trials",
    "Prepare handwritten mind maps for entire Unit 1 calculus",
    "Simulate board practical logs viva files"
  ]);

  // Soft Skills Hub States
  const [softSkillsSelectedId, setSoftSkillsSelectedId] = useState<string | null>(null);
  const [softSkillsPracticeResponse, setSoftSkillsPracticeResponse] = useState<string>("");
  const [softSkillsFeedback, setSoftSkillsFeedback] = useState<string>("");
  const [softSkillsLoading, setSoftSkillsLoading] = useState<boolean>(false);

  // Interactive Quiz state
  const [quizTimer, setQuizTimer] = useState<number>(600);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);

  // Preset topics lists
  const PRESET_TOPICS = [
    "Photosynthesis", "Thermodynamics", "Artificial Intelligence", "Machine Learning",
    "Trigonometry", "Neural Networks", "Quantum Physics", "Calculus", "Chemical Bonding"
  ];

  // Sync premium unlock state from userProfile (Firestore)
  useEffect(() => {
    const profile = userProfile || (user as any)?.profile;
    if (profile) {
      setIsUnlocked(!!profile.premiumUnlocked);
    } else {
      setIsUnlocked(false);
    }
  }, [userProfile, user]);

  // Load and fetch user details
  useEffect(() => {
    const localScores = localStorage.getItem("futurepath_compete_scores");
    if (localScores) {
      try {
        setScoresList(JSON.parse(localScores));
      } catch (e) {
        console.error("Scores cache parser error", e);
      }
    }
    fetchFirestoreUserData();
  }, []);

  const fetchFirestoreUserData = async () => {
    const activeU = auth.currentUser;
    if (!activeU) return;
    setDbLoading(true);
    try {
      const getDocsWithTimeout = async (q: any, timeoutMs = 1200) => {
        return Promise.race([
          getDocs(q),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
        ]);
      };

      // Progress Tracker Fetch
      const qProg = query(collection(db, "competeTopicStatus"), where("uid", "==", activeU.uid));
      const progSnap = await getDocsWithTimeout(qProg);
      const tempProg: Record<string, any> = {};
      progSnap.forEach((doc: any) => {
        const d = doc.data();
        tempProg[d.topicId] = d.status;
      });
      setCheckedTopics(tempProg);

      // Scorecard Logs Fetch
      const qScores = query(collection(db, "competeTestScores"), where("uid", "==", activeU.uid));
      const scoreSnap = await getDocsWithTimeout(qScores);
      const tempScores: any[] = [];
      scoreSnap.forEach((doc: any) => {
        tempScores.push(doc.data());
      });
      if (tempScores.length > 0) {
        setScoresList(tempScores.sort((a, b) => b.id.localeCompare(a.id)));
      }
    } catch (err) {
      console.warn("Firestore sync fallback to local caching", err);
    } finally {
      setDbLoading(false);
    }
  };

  const handleUpdateTopicStatus = async (topicId: string, newStatus: "Not Started" | "In Progress" | "Completed") => {
    const nextStatus = { ...checkedTopics, [topicId]: newStatus };
    setCheckedTopics(nextStatus);

    const activeU = auth.currentUser;
    if (activeU) {
      try {
        await setDoc(doc(db, "competeTopicStatus", `${activeU.uid}_${topicId}`), {
          uid: activeU.uid,
          topicId,
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore progress save failed", err);
      }
    }
  };

  const handleFetchLivePyqs = async () => {
    const activeExam = examsList.find(e => e.id === selectedExamId) || examsList[0];
    const activeSub = activeExam.subjects.find(s => s.id === selectedSubjectId) || activeExam.subjects[0];
    const activeChapter = activeSub?.chapters.find(c => c.id === selectedChapterId);
    const activeTopic = activeChapter?.topics.find(t => t.id === selectedTopicId);

    if (!activeSub || !activeChapter || !activeTopic) {
      alert("Please select a subject, chapter, and topic first!");
      return;
    }

    setLivePyqsLoading(true);
    setLivePyqs([]);
    setLivePyqsSource("");

    const cacheKey = `pyq_cache_${selectedSubjectId}_${selectedChapterId}_${selectedTopicId}`;
    
    try {
      const docSnap = await getDoc(doc(db, "pyq_cache", cacheKey));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Date.now() - data.timestamp < 30 * 24 * 60 * 60 * 1000) {
          console.log("[PYQ CACHE] Found fresh questions in Firestore!");
          setLivePyqs(data.questions);
          setLivePyqsSource(`${data.sourceUsed} (Firestore Cloud Cache)`);
          setLivePyqsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("[PYQ CACHE] Firestore cache look up error:", err);
    }

    try {
      const response = await fetch(apiUrl("/api/compete/fetch-pyqs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classNum: userProfile?.class || "Class 10",
          subject: activeSub.name,
          chapter: activeChapter.name,
          topic: activeTopic.name
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned code: ${response.status}`);
      }

      const data = await response.json();
      const questions = data.questions || [];
      const sourceUsed = data.sourceUsed || "Live official portals";

      setLivePyqs(questions);
      setLivePyqsSource(sourceUsed);

      if (questions.length > 0) {
        try {
          await setDoc(doc(db, "pyq_cache", cacheKey), {
            questions,
            sourceUsed,
            timestamp: Date.now()
          });
          console.log("[PYQ CACHE] Cached fresh questions to Firestore!");
        } catch (fErr) {
          console.warn("[PYQ CACHE] Failed to write cache to Firestore:", fErr);
        }
      }

    } catch (err: any) {
      console.error("[PYQ LIVE] Live fetch exception:", err);
      alert("Failed to fetch live PYQs. Using offline fallback curated CBSE dossier.");
      setLivePyqs([
        {
          question: `Explain the core mechanism, properties, and CBSE board pattern questions for "${activeTopic.name}". Derive key formulas where appropriate.`,
          year: "2023",
          marks: "5",
          source: "ncert.nic.in",
          sourceUrl: "https://ncert.nic.in/textbook.php",
          solution: "1. State the fundamental definitions and draw ray diagrams or layout setups.\n2. Apply governing formulas and step-by-step linear algebra to solve.\n3. Formulate the final conclusion clearly.",
          explanation: "Ensure units and step-by-step formulas are fully written to maximize CBSE scoring scheme marks."
        }
      ]);
      setLivePyqsSource("Curated NCERT Reference (Offline fallback)");
    } finally {
      setLivePyqsLoading(false);
    }
  };

  const handleDeconstructTopic = async (topicStr: string) => {
    const targetTopic = topicStr || topicAnalyzerInput;
    if (!targetTopic || !targetTopic.trim()) {
      alert("Please enter a topic to deconstruct!");
      return;
    }

    setTopicAnalyzerLoading(true);
    setTopicAnalyzerError(null);
    setTopicAnalyzerResult(null);
    if (topicStr) setTopicAnalyzerInput(topicStr);

    try {
      const activeExam = examsList.find(e => e.id === selectedExamId) || examsList[0];
      const activeSub = activeExam.subjects.find(s => s.id === selectedSubjectId) || activeExam.subjects[0];

      const response = await fetch(apiUrl("/api/compete/topic-analyzer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: targetTopic,
          difficulty: topicAnalyzerDifficulty,
          subjectName: activeSub?.name || "General Academic",
          examName: activeExam?.name || "Competitive Exams"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned code: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content;

      const extractSection = (tag: string, defaultText: string = ""): string => {
        const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[[A-Z_]+\\]|$)`, "i");
        const match = text.match(regex);
        return match ? match[1].trim() : defaultText;
      };

      const rawOverview = extractSection("OVERVIEW", "Overview compilation in progress.");
      const rawDefinition = extractSection("DEFINITION", "Definition in progress.");
      const rawDetailed = extractSection("DETAILED_EXPLANATION", "Detailed explanation in progress.");
      const rawExamples = extractSection("EXAMPLES", "Real-life examples in progress.");
      const rawDiagram = extractSection("DIAGRAM", "");
      const rawMindMap = extractSection("MIND_MAP", "");
      const rawFactsStr = extractSection("FACTS");
      const rawBoardStr = extractSection("BOARD_QUESTIONS");
      const rawCompetitiveStr = extractSection("COMPETITIVE_QUESTIONS");
      const rawPyqsStr = extractSection("PYQS");
      const rawMistakesStr = extractSection("COMMON_MISTAKES");
      const rawRevisionStr = extractSection("REVISION_NOTES");

      // Parse Facts
      const facts = rawFactsStr
        ? rawFactsStr.split("\n")
            .map(l => l.replace(/^[-*•\s]+/, "").trim())
            .filter(l => l.length > 3)
        : ["Standard physical parameters are maintained.", "Derivations follow board marking standards."];

      // Parse Board Questions
      const boardQuestions = rawBoardStr
        ? rawBoardStr.split(/(?=Q\d+:)/gi)
            .map(q => q.trim())
            .filter(q => q.length > 5)
        : ["Verify boundary conditions carefully.", "Write stepwise formula proofs to secure complete credit."];

      // Parse Competitive Questions
      const competitiveQuestions = rawCompetitiveStr
        ? rawCompetitiveStr.split(/(?=Q\d+:)/gi)
            .map(q => q.trim())
            .filter(q => q.length > 5)
        : ["Analyze limiting states first.", "Leverage perfect-unity shortcuts to speed up calculations."];

      // Parse PYQs
      const pyqs: any[] = [];
      if (rawPyqsStr) {
        const pyqBlocks = rawPyqsStr.split(/(?=Year:)/gi);
        pyqBlocks.forEach(block => {
          if (!block.trim()) return;
          const yearMatch = block.match(/Year:\s*(\d+)/i);
          const examMatch = block.match(/Exam:\s*([^|\n]+)/i);
          const marksMatch = block.match(/Marks:\s*(\d+)/i);
          const questionMatch = block.match(/Question:\s*([\s\S]*?)(?=Step-by-step Solution:|$)/i);
          const solutionMatch = block.match(/Step-by-step Solution:\s*([\s\S]*?)(?=Explanation:|$)/i);
          const expMatch = block.match(/Explanation:\s*([\s\S]*?)(?=Concepts Used:|$)/i);
          const conceptsMatch = block.match(/Concepts Used:\s*([\s\S]*?)$/i);

          if (questionMatch && solutionMatch) {
            pyqs.push({
              year: yearMatch ? yearMatch[1].trim() : "2024",
              exam: examMatch ? examMatch[1].trim() : activeExam.name,
              marks: marksMatch ? marksMatch[1].trim() : "5",
              question: questionMatch[1].trim(),
              solution: solutionMatch[1].trim(),
              explanation: expMatch ? expMatch[1].trim() : "",
              conceptsUsed: conceptsMatch ? conceptsMatch[1].trim() : ""
            });
          }
        });
      }

      // Parse Common Mistakes
      const commonMistakes = rawMistakesStr
        ? rawMistakesStr.split("\n")
            .map(l => l.replace(/^[-*•\s]+/, "").trim())
            .filter(l => l.length > 4)
            .map(l => {
              const idx = l.indexOf(":");
              return {
                mistake: idx !== -1 ? l.substring(0, idx).trim() : "Common Pitfall",
                correction: idx !== -1 ? l.substring(idx + 1).trim() : l
              };
            })
        : [
            { mistake: "Incorrect sign conventions", correction: "Always verify physical directions to prevent coefficient failures." }
          ];

      // Parse Revision Notes
      const revisionNotes = rawRevisionStr
        ? rawRevisionStr.split("\n")
            .map(l => l.replace(/^[-*•\s]+/, "").trim())
            .filter(l => l.length > 3)
        : ["Always double check boundary signs.", "Stepwise proof layouts should be prioritized."];

      setTopicAnalyzerResult({
        topic: targetTopic,
        difficulty: topicAnalyzerDifficulty,
        overview: rawOverview,
        definition: rawDefinition,
        detailedExplanation: rawDetailed,
        examples: rawExamples,
        diagram: rawDiagram,
        mindMap: rawMindMap,
        facts,
        boardQuestions,
        competitiveQuestions,
        pyqs: pyqs.length > 0 ? pyqs : [
          {
            year: "2024",
            exam: activeExam.name,
            marks: "5",
            question: `Derive the core baseline equations or dynamic state formulations for "${targetTopic}" under normal conditions.`,
            solution: "1. State the fundamental principles. 2. Outline step-by-step formulas. 3. Derive the final state equilibrium mathematically.",
            explanation: "Review marking schemes which award steps heavily.",
            conceptsUsed: `${targetTopic}, conservation`
          }
        ],
        commonMistakes,
        revisionNotes
      });
      setTopicAnalyzerActiveSubTab("overview");
    } catch (err: any) {
      console.error("AI Topic Analyzer failure", err);
      setTopicAnalyzerError(err.message || "An unexpected error occurred during topic deconstruction.");
    } finally {
      setTopicAnalyzerLoading(false);
    }
  };

  // Interactive Chat Handlers for Upgraded Modules
  const handlePyqDiscussionSubmit = async (customText?: string) => {
    const text = customText || pyqHubInput;
    if (!text.trim()) return;
    
    const newUserMsg = { role: "user" as const, content: text };
    const updatedChat = [...pyqHubChat, newUserMsg];
    setPyqHubChat(updatedChat);
    if (!customText) setPyqHubInput("");
    setPyqHubLoading(true);

    try {
      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `You are the PYQ Expert on the FuturePath educational portal. Provide step-by-step toppers' solutions, short calculation tricks, marking scheme hints, and error-avoidance strategies for student previous year exam questions. Topic under discussion: ${activeTopic?.name || "Academic curriculum"}` },
            ...updatedChat
          ]
        })
      });
      const data = await response.json();
      setPyqHubChat([...updatedChat, { role: "assistant", content: data.reply || "Unable to get guidance response." }]);
    } catch (err) {
      console.error("PYQ discussion failure", err);
      setPyqHubChat([...updatedChat, { role: "assistant", content: "AI network failure. Please verify your connection or try again." }]);
    } finally {
      setPyqHubLoading(false);
    }
  };

  const handleOllamaSubmit = async () => {
    if (!ollamaInput.trim()) return;

    const newUserMsg = { role: "user" as const, content: ollamaInput };
    const updatedChat = [...ollamaChat, newUserMsg];
    setOllamaChat(updatedChat);
    setOllamaInput("");
    setOllamaLoading(true);

    try {
      const systemInstruction = `You are a professional local AI Coach (mimicking Ollama/llama3.3) for career readiness. Mode: ${ollamaActiveCategory}. Target role: ${ollamaSelectedRole}. Ask realistic questions, evaluate answers critically, and suggest specific soft-skills and strategic corrections. Provide a professional, encouraging, and critical performance evaluation.`;
      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemInstruction },
            ...updatedChat
          ]
        })
      });
      const data = await response.json();
      const reply = data.reply || "Coach evaluation unavailable.";
      setOllamaChat([...updatedChat, { role: "assistant", content: reply }]);
      
      // Calculate a dynamic confidence score based on keyword match
      let score = 75 + Math.floor(Math.random() * 20);
      if (ollamaInput.toLowerCase().includes("fail") || ollamaInput.toLowerCase().includes("don't know")) {
        score = Math.max(40, score - 25);
      }
      setOllamaConfidenceScore(score);
      
      // Parse brief feedback
      const feedbackLine = reply.split("\n").filter((l: string) => l.trim().length > 10)[0] || "Answer submitted and reviewed.";
      setOllamaFeedback(feedbackLine);

    } catch (err) {
      console.error("Ollama coach failure", err);
      setOllamaChat([...updatedChat, { role: "assistant", content: "Unable to reach the Ollama feedback engine. Please check your system." }]);
    } finally {
      setOllamaLoading(false);
    }
  };

  const handleJarvisSubmit = async (customCommand?: string) => {
    const cmd = customCommand || jarvisInput;
    if (!cmd.trim()) return;

    const newUserMsg = { role: "user" as const, content: cmd };
    const updatedChat = [...jarvisChat, newUserMsg];
    setJarvisChat(updatedChat);
    if (!customCommand) setJarvisInput("");
    setJarvisLoading(true);

    // Local parser for commands
    const lowercaseCmd = cmd.toLowerCase();
    let localEffectFeedback = "";
    if (lowercaseCmd.includes("explain")) {
      localEffectFeedback = " Jarvis Command Triggered: [DEEP CONSTRUCTIVE ANALYSIS OF TOPIC]";
    } else if (lowercaseCmd.includes("mock") || lowercaseCmd.includes("test")) {
      localEffectFeedback = " Jarvis Command Triggered: [ASSESSMENT INITIATOR SEQUENCE]";
      setQuizActive(true);
    } else if (lowercaseCmd.includes("task") || lowercaseCmd.includes("schedule") || lowercaseCmd.includes("add")) {
      const taskText = cmd.replace(/^(add task|add|schedule)\s*/i, "").trim() || "Complete custom learning module";
      setJarvisDailyTasks(prev => [...prev, taskText]);
      localEffectFeedback = ` Jarvis Command Triggered: [REGISTERED DAILY LEARNING TASK: "${taskText}"]`;
    } else if (lowercaseCmd.includes("score") || lowercaseCmd.includes("status")) {
      localEffectFeedback = " Jarvis Command Triggered: [CURRICULUM METRIC RE-CALCULATION ACTIVE]";
    }

    try {
      const systemInstruction = `You are Jarvis, an advanced autonomous study mentor. Speak in a sophisticated, clear, and slightly futuristic tone. You can monitor progress, suggest curriculum steps, and trigger tasks. Current Subject: ${activeSubject?.name || "General study"}. Custom Event Triggered: ${localEffectFeedback || "None"}.`;
      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemInstruction },
            ...updatedChat
          ]
        })
      });
      const data = await response.json();
      setJarvisChat([...updatedChat, { role: "assistant", content: `${localEffectFeedback ? `***${localEffectFeedback}***\n\n` : ""}${data.reply || "Systems standard response offline."}` }]);
    } catch (err) {
      console.error("Jarvis failure", err);
      setJarvisChat([...updatedChat, { role: "assistant", content: "Jarvis link offline. Systems running under local power." }]);
    } finally {
      setJarvisLoading(false);
    }
  };

  const handleSoftSkillsPracticeSubmit = async (exerciseId: string, exerciseQuestion: string) => {
    if (!softSkillsPracticeResponse.trim()) return;
    setSoftSkillsLoading(true);
    setSoftSkillsFeedback("");

    try {
      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are an expert Soft Skills Coach and Communications specialist. Evaluate the student's vocal response to the following interview question. Grade on: Sentence flow, professional vocabulary, confidence tone, and structure. Provide a clear Score (out of 10), Pros, and Areas for Improvement in a beautiful bulleted feedback block." },
            { role: "user", content: `Question: ${exerciseQuestion}\n\nStudent Response: ${softSkillsPracticeResponse}` }
          ]
        })
      });
      const data = await response.json();
      setSoftSkillsFeedback(data.reply || "Communication assessment computed successfully.");
    } catch (err) {
      console.error("Soft skills practice failure", err);
      setSoftSkillsFeedback("Vocal feedback engine encountered a transient interruption. Please retry your speech attempt.");
    } finally {
      setSoftSkillsLoading(false);
    }
  };

  const handleExportTopicPDF = (result: any) => {
    if (!result) return;
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 20;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          addHeader();
        }
      };

      const addHeader = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("FUTUREPATH AI COGNITIVE STUDY ENGINE — TOPIC ANALYSIS", margin, y);
        doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, y);
        y += 4;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      addHeader();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text(result.topic.toUpperCase(), margin, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(217, 119, 6);
      doc.text(`DIFFICULTY LEVEL: ${result.difficulty.toUpperCase()}`, margin, y);
      y += 10;

      // Definition
      checkPageOverflow(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("1. DEFINITION", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitDef = doc.splitTextToSize(result.definition || "", contentWidth);
      const defHeight = splitDef.length * 5;
      checkPageOverflow(defHeight);
      doc.text(splitDef, margin, y);
      y += defHeight + 8;

      // Overview
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("2. CONCEPT OVERVIEW", margin, y);
      y += 6;

      const splitOverview = doc.splitTextToSize(result.overview || "", contentWidth);
      const overviewHeight = splitOverview.length * 5;
      checkPageOverflow(overviewHeight);
      doc.text(splitOverview, margin, y);
      y += overviewHeight + 8;

      // Detailed Explanation
      checkPageOverflow(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("3. DETAILED TECHNICAL DISCUSSION", margin, y);
      y += 6;

      const splitDetailed = doc.splitTextToSize(result.detailedExplanation || "", contentWidth);
      const detailedHeight = splitDetailed.length * 5;
      checkPageOverflow(detailedHeight);
      doc.text(splitDetailed, margin, y);
      y += detailedHeight + 8;

      // Examples
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("4. REAL-LIFE EXAMPLES & USE CASES", margin, y);
      y += 6;

      const splitEx = doc.splitTextToSize(result.examples || "", contentWidth);
      const exHeight = splitEx.length * 5;
      checkPageOverflow(exHeight);
      doc.text(splitEx, margin, y);
      y += exHeight + 8;

      // Diagram
      if (result.diagram) {
        checkPageOverflow(40);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("5. CONCEPT PROCESS DIAGRAM", margin, y);
        y += 6;

        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        const splitDiag = doc.splitTextToSize(result.diagram, contentWidth);
        const diagHeight = splitDiag.length * 4.5;
        checkPageOverflow(diagHeight);
        doc.text(splitDiag, margin, y);
        y += diagHeight + 8;
        doc.setFont("helvetica", "normal");
      }

      // Mind Map
      if (result.mindMap) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("6. HIERARCHICAL MIND MAP", margin, y);
        y += 6;

        doc.setFont("courier", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const splitMM = doc.splitTextToSize(result.mindMap, contentWidth);
        const mmHeight = splitMM.length * 4.5;
        checkPageOverflow(mmHeight);
        doc.text(splitMM, margin, y);
        y += mmHeight + 8;
        doc.setFont("helvetica", "normal");
      }

      // Facts
      if (result.facts && result.facts.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("7. IMPORTANT HIGH-YIELD FACTS", margin, y);
        y += 6;

        result.facts.forEach((fact: string) => {
          checkPageOverflow(15);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitFact = doc.splitTextToSize(`• ${fact}`, contentWidth);
          const factHeight = splitFact.length * 5;
          doc.text(splitFact, margin, y);
          y += factHeight + 3;
        });
        y += 5;
      }

      // Board Questions
      if (result.boardQuestions && result.boardQuestions.length > 0) {
        checkPageOverflow(35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("8. BOARD EXAM BLUEPRINT QUESTIONS", margin, y);
        y += 6;

        result.boardQuestions.forEach((bq: string) => {
          checkPageOverflow(20);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitBQ = doc.splitTextToSize(`- ${bq}`, contentWidth);
          const bqHeight = splitBQ.length * 5;
          doc.text(splitBQ, margin, y);
          y += bqHeight + 4;
        });
        y += 4;
      }

      // Competitive Questions
      if (result.competitiveQuestions && result.competitiveQuestions.length > 0) {
        checkPageOverflow(35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("9. COMPETITIVE PRACTICE DRILLS", margin, y);
        y += 6;

        result.competitiveQuestions.forEach((cq: string) => {
          checkPageOverflow(20);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitCQ = doc.splitTextToSize(`- ${cq}`, contentWidth);
          const cqHeight = splitCQ.length * 5;
          doc.text(splitCQ, margin, y);
          y += cqHeight + 4;
        });
        y += 4;
      }

      // PYQs
      if (result.pyqs && result.pyqs.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("10. SOLVED PREVIOUS YEAR QUESTIONS (PYQS)", margin, y);
        y += 6;

        result.pyqs.forEach((q: any, idx: number) => {
          checkPageOverflow(45);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(`Question ${idx + 1} [Year: ${q.year} | Marks: ${q.marks}]`, margin, y);
          y += 5;

          const splitQ = doc.splitTextToSize(q.question, contentWidth);
          const qHeight = splitQ.length * 5;
          checkPageOverflow(qHeight);
          doc.text(splitQ, margin, y);
          y += qHeight + 4;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(16, 185, 129);
          doc.text("Topper Model Solution:", margin, y);
          y += 5;

          const splitSol = doc.splitTextToSize(q.solution, contentWidth - 5);
          const solHeight = splitSol.length * 5;
          checkPageOverflow(solHeight);
          doc.text(splitSol, margin + 5, y);
          y += solHeight + 6;
        });
      }

      // Revision Notes
      if (result.revisionNotes && result.revisionNotes.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("11. LAST-MINUTE REVISION NOTES", margin, y);
        y += 6;

        result.revisionNotes.forEach((rn: string) => {
          checkPageOverflow(15);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitRN = doc.splitTextToSize(`• ${rn}`, contentWidth);
          const rnHeight = splitRN.length * 5;
          doc.text(splitRN, margin, y);
          y += rnHeight + 3;
        });
      }

      doc.save(`FuturePath_Dossier_${result.topic.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation exception", err);
      alert("PDF generation failed. Please try again.");
    }
  };

  const getExamProgressMetrics = (examId: string) => {
    const currentExam = examsList.find(e => e.id === examId) || examsList[0];
    let totalTopics = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    currentExam.subjects.forEach(sub => {
      sub.chapters.forEach(ch => {
        ch.topics.forEach(top => {
          totalTopics++;
          const status = checkedTopics[top.id] || "Not Started";
          if (status === "Completed") completedCount++;
          if (status === "In Progress") inProgressCount++;
        });
      });
    });

    const scoreLogs = scoresList.filter(s => s.examId === examId);
    const averageScore = scoreLogs.length > 0 
      ? Math.round(scoreLogs.reduce((acc, cr) => acc + cr.scoreObtained, 0) / scoreLogs.length) 
      : 0;

    const overallComp = totalTopics > 0 
      ? Math.round(((completedCount + inProgressCount * 0.5) / totalTopics) * 100) 
      : 0;

    return {
      total: totalTopics,
      completed: completedCount,
      inProgress: inProgressCount,
      averageScore,
      percentage: overallComp,
      attempts: scoreLogs.length
    };
  };

  const getCategoryProgressMetrics = (categoryId: string) => {
    const catExams = examsList.filter(e => e.category === categoryId);
    let totalTopics = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    catExams.forEach(currentExam => {
      currentExam.subjects.forEach(sub => {
        sub.chapters.forEach(ch => {
          ch.topics.forEach(top => {
            totalTopics++;
            const status = checkedTopics[top.id] || "Not Started";
            if (status === "Completed") completedCount++;
            if (status === "In Progress") inProgressCount++;
          });
        });
      });
    });

    const overallComp = totalTopics > 0 
      ? Math.round(((completedCount + inProgressCount * 0.5) / totalTopics) * 100) 
      : 0;

    return {
      totalExams: catExams.length,
      percentage: overallComp,
    };
  };

  const handleStartMockQuiz = () => {
    setQuizTimer(600);
    setQuizActive(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleSubmitMockQuiz = () => {
    setQuizActive(false);
    setQuizSubmitted(true);

    // Dynamic grading evaluation
    let score = 0;
    const mockQs = getMockQuestions();
    mockQs.forEach(q => {
      if (quizAnswers[q.id] === q.answer) {
        score += 25;
      }
    });

    const finalScore = Math.min(100, score);
    const accuracy = finalScore;
    const computedRank = Math.max(12, Math.round(1500 - (finalScore * 14.5)));

    const resultPayload = {
      score: finalScore,
      max: 100,
      rank: computedRank,
      accuracy,
      duration: 180 + Math.round(Math.random() * 120)
    };
    setQuizResult(resultPayload);

    const newScoreLog = {
      id: `score_${Date.now()}`,
      uid: auth.currentUser?.uid || "anonymous",
      examId: selectedExamId,
      scoreObtained: finalScore,
      maxScore: 100,
      accuracy,
      type: "Topic Quiz Assessment",
      date: new Date().toLocaleDateString()
    };

    const updatedScores = [newScoreLog, ...scoresList];
    setScoresList(updatedScores);
    localStorage.setItem("futurepath_compete_scores", JSON.stringify(updatedScores));

    const user = auth.currentUser;
    if (user) {
      setDoc(doc(db, "competeTestScores", newScoreLog.id), newScoreLog).catch(err => {
        console.warn("Could not save to Firestore", err);
      });
    }
  };

  const handleClearScoreHistory = async () => {
    if (!window.confirm("Do you want to clear your local and cloud assessment scorecard logs?")) return;
    const user = auth.currentUser;
    if (user) {
      try {
        const querySnap = await getDocs(query(collection(db, "competeTestScores"), where("uid", "==", user.uid)));
        querySnap.forEach(async d => {
          await deleteDoc(doc(db, "competeTestScores", d.id));
        });
      } catch (e) {
        console.warn("Firestore scoreboard clear fallback", e);
      }
    }
    setScoresList([]);
    localStorage.removeItem("futurepath_compete_scores");
  };

  const getMockQuestions = () => {
    return [
      {
        id: "q1",
        question: `Which fundamental principle or theorem provides the baseline proof constraints for ${selectedTopicId.replace(/-/g, " ")}?`,
        options: ["A) The law of conservation coefficients", "B) Boundary conservation parameters", "C) Fundamental uniqueness conditions", "D) Standard thermodynamic limits"],
        answer: "C"
      },
      {
        id: "q2",
        question: "When deploying multi-tier state evaluations, which condition represents an unstable equilibrium limit?",
        options: ["A) Zero margin coefficients", "B) Negative dynamic multipliers", "C) Boundary coordinate parity", "D) Infinite convergence speed"],
        answer: "B"
      },
      {
        id: "q3",
        question: "What is the primary formula metric used to grade step-wise accuracy in board examinations?",
        options: ["A) Absolute value accuracy", "B) Precision mapping algorithms", "C) Concept-wise proof steps layout", "D) Cumulative formula checks"],
        answer: "C"
      },
      {
        id: "q4",
        question: "How do toppers structure answers to complex physical or mathematical proofs?",
        options: ["A) Bullet definitions first", "B) Writing equations sequentially with boundary state annotations", "C) Jumping directly to coordinate derivations", "D) Copying entire textbook structures"],
        answer: "B"
      }
    ];
  };

  if (authLoading || dbLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        <p className="text-xs font-mono text-slate-400">Synchronizing academic data with Firestore...</p>
      </div>
    );
  }

  const activeExam = examsList.find(e => e.id === selectedExamId) || examsList[0];
  const activeSubject = activeExam.subjects.find(s => s.id === selectedSubjectId) || activeExam.subjects[0];
  const activeChapter = activeSubject?.chapters?.find(c => c.id === selectedChapterId) || activeSubject?.chapters?.[0];
  const activeTopic = activeChapter?.topics?.find(t => t.id === selectedTopicId) || activeChapter?.topics?.[0];

  const DASHBOARD_CATEGORIES = [
    {
      id: "school",
      name: "Primary & Middle School",
      subtitle: "(Class 1-10)",
      badge: "👑 PREMIUM",
      icon: BookOpen,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
      glowColor: "rgba(0, 229, 255, 0.4)",
      accentGlow: "rgba(0, 229, 255, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(0,229,255,0.4)] hover:border-cyan-400",
      progressColor: "bg-cyan-500",
      textColor: "text-cyan-400",
      desc: "Comprehensive syllabus checkpoints, step-by-step toppers' answer sheets, and textbook solutions for Class 1 through 10."
    },
    {
      id: "high-school",
      name: "Senior Secondary",
      subtitle: "(Class 11-12)",
      badge: "👑 PREMIUM",
      icon: GraduationCap,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/30",
      glowColor: "rgba(168, 85, 247, 0.4)",
      accentGlow: "rgba(168, 85, 247, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] hover:border-purple-400",
      progressColor: "bg-purple-500",
      textColor: "text-purple-400",
      desc: "Elite curriculum trackers, board exam strategies, and dossier resources for Science, Commerce, and Humanities."
    },
    {
      id: "engineering",
      name: "Engineering Entrances",
      subtitle: "(JEE & State)",
      badge: "👑 PREMIUM",
      icon: Cpu,
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/30",
      glowColor: "rgba(249, 115, 22, 0.4)",
      accentGlow: "rgba(249, 115, 22, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(249,115,22,0.4)] hover:border-orange-400",
      progressColor: "bg-orange-500",
      textColor: "text-orange-450",
      desc: "Advanced solver dossiers, previous year board matrices, and conceptual checklists for JEE Main, Advanced, and state mock trials."
    },
    {
      id: "medical",
      name: "Medical Competitions",
      subtitle: "(NEET & AIIMS)",
      badge: "👑 PREMIUM",
      icon: Activity,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      glowColor: "rgba(16, 185, 129, 0.4)",
      accentGlow: "rgba(16, 185, 129, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:border-emerald-400",
      progressColor: "bg-emerald-500",
      textColor: "text-emerald-400",
      desc: "Syllabi milestones, high-yield biological diagrams deconstructors, and chemistry formula sheets for NEET preparation."
    },
    {
      id: "commerce",
      name: "Commerce Professional",
      subtitle: "(CA, CS & CMA)",
      badge: "👑 PREMIUM",
      icon: Briefcase,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/30",
      glowColor: "rgba(59, 130, 246, 0.4)",
      accentGlow: "rgba(59, 130, 246, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] hover:border-blue-400",
      progressColor: "bg-blue-500",
      textColor: "text-blue-400",
      desc: "Dossiers covering CA Foundation, Intermediate, and finance modules with dynamic study guides."
    },
    {
      id: "arts-law",
      name: "Arts & Law Entrances",
      subtitle: "(CLAT & Humanities)",
      badge: "👑 PREMIUM",
      icon: Scale,
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/10 border-pink-500/30",
      glowColor: "rgba(236, 72, 153, 0.4)",
      accentGlow: "rgba(236, 72, 153, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(236,72,153,0.4)] hover:border-pink-400",
      progressColor: "bg-pink-500",
      textColor: "text-pink-400",
      desc: "CLAT, humanities, and constitutional logic trackers with exam pattern guidelines."
    },
    {
      id: "government",
      name: "Government Recruitment",
      subtitle: "(SSC, Bank, RRB)",
      badge: "👑 PREMIUM",
      icon: Shield,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/10 border-indigo-500/30",
      glowColor: "rgba(99, 102, 241, 0.4)",
      accentGlow: "rgba(99, 102, 241, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] hover:border-indigo-400",
      progressColor: "bg-indigo-500",
      textColor: "text-indigo-400",
      desc: "Staff Selection Commission (SSC) CGL, Banking PO, Railways, and central recruitment exam syllabus trackers."
    },
    {
      id: "upsc",
      name: "UPSC Civil Services",
      subtitle: "(Mains & Prelims)",
      badge: "👑 PREMIUM",
      icon: Building2,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/10 border-yellow-500/30",
      glowColor: "rgba(234, 179, 8, 0.4)",
      accentGlow: "rgba(234, 179, 8, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(234,179,8,0.4)] hover:border-yellow-400",
      progressColor: "bg-yellow-500",
      textColor: "text-yellow-400",
      desc: "UPSC CSE Mains, Prelims general studies trackers, and AI personality coach rehearsals."
    },
    {
      id: "vocational",
      name: "Vocational & Polytechnic",
      subtitle: "(Diplomas & Practical)",
      badge: "👑 PREMIUM",
      icon: Wrench,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/10 border-teal-500/30",
      glowColor: "rgba(20, 184, 166, 0.4)",
      accentGlow: "rgba(20, 184, 166, 0.15)",
      glowStyle: "hover:shadow-[0_0_35px_rgba(20,184,166,0.4)] hover:border-teal-400",
      progressColor: "bg-teal-500",
      textColor: "text-teal-400",
      desc: "Practical engineering diplomas, state polytechnic entry tests, and vocational syllabi benchmarks."
    }
  ];

  // ── RAZORPAY PAYMENT HANDLER ──────────────────────────────────────────────
  const handleUnlockPremium = async () => {
    const activeProfile = userProfile || (user as any)?.profile;
    if (!activeProfile) {
      setPaymentError("You must be logged in to proceed with the purchase.");
      setPaymentStatus("failed");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError("");

    // Dynamically load Razorpay checkout.js if not present
    if (!(window as any).Razorpay) {
      try {
        const loadScript = () => new Promise<boolean>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
        const loaded = await loadScript();
        if (!loaded || !(window as any).Razorpay) throw new Error("Razorpay script load failure.");
      } catch {
        setPaymentError("Razorpay SDK failed to load. Please check your internet connection.");
        setPaymentStatus("failed");
        return;
      }
    }

    const keyId = (import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_T5Ua1KRsVJZPIr").replace(/['"]/g, "").trim();

    try {
      const res = await fetch(apiUrl("/api/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 4900, // ₹49 in paise
          receipt: `receipt_compete_${activeProfile.uid?.substring(0, 10) || "user"}_${Date.now().toString().slice(-6)}`
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create order on the server.");
      }

      const orderData = await res.json();

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FuturePath AI",
        description: "Compete To Crush Premium Access",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          setPaymentStatus("verifying");
          try {
            const verifyRes = await fetch(apiUrl("/api/verify-payment"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await updateProfile({
                premiumUnlocked: true,
                amountPaid: 49,
                purchaseDate: new Date().toISOString(),
                paymentId: response.razorpay_payment_id
              });
              setPaymentStatus("success");
              setIsUnlocked(true);
            } else {
              setPaymentStatus("failed");
              setPaymentError(verifyData.error || "Signature verification failed.");
            }
          } catch {
            setPaymentStatus("failed");
            setPaymentError("Could not complete verification. Please contact support.");
          }
        },
        prefill: {
          name: activeProfile.name || "",
          email: activeProfile.email || "",
        },
        theme: { color: "#EAB308" },
        modal: {
          ondismiss: function () {
            setPaymentStatus("failed");
            setPaymentError("Payment process cancelled by user.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (r: any) {
        setPaymentStatus("failed");
        setPaymentError(r.error?.description || "Payment transaction failed.");
      });
      rzp.open();
    } catch (err: any) {
      setPaymentStatus("failed");
      setPaymentError(err.message || "Failed to start checkout. Please try again.");
    }
  };

  // ── PAYWALL SCREEN (shown if not unlocked) ────────────────────────────────
  if (!isUnlocked) {
    if (paymentStatus === "processing" || paymentStatus === "verifying") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[450px] py-12 text-slate-100 space-y-6">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">
            {paymentStatus === "processing" ? "Initialising Secure Checkout…" : "Verifying Payment…"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 text-slate-100 font-sans select-none animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#0F172A] p-8 md:p-12 text-center max-w-3xl mx-auto my-8 space-y-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy className="w-64 h-64 text-yellow-500 rotate-12" />
          </div>

          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 flex items-center justify-center animate-bounce">
              <Lock className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 font-mono text-[10px] uppercase tracking-wider mx-auto">
              <span>One Time Purchase</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase mt-2">
              Unlock Compete To Crush — ₹49
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Supercharge your competitive exam preparations with FuturePath AI's supreme educational dashboard. Gain permanent access to extensive trackers, historical catalogs, and interactive analysis systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              { title: "Full Compete To Crush Access", desc: "Gain total, unlocked access to all competitive study engines." },
              { title: "PYQ Solutions", desc: "Step-by-step solved previous year board & competitive papers." },
              { title: "Weekly Tests", desc: "Chapter-wise assessments with instant diagnostic reporting." },
              { title: "Mock Tests", desc: "Unlimited custom CBT mocks with real-time analytics." },
              { title: "Video Learning Links", desc: "Curated premium video streams mapped to your curriculum." },
              { title: "Progress Tracking", desc: "Interactive checklists tracking subtopic completion." }
            ].map((feat, i) => (
              <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-yellow-500 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs uppercase tracking-wider font-mono">{feat.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {paymentStatus === "failed" && paymentError && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-xs font-mono max-w-xs mx-auto">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          <div className="pt-4 max-w-xs mx-auto space-y-4">
            <button
              onClick={handleUnlockPremium}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer hover:shadow-2xl"
            >
              {paymentStatus === "failed" ? "Try Again →" : "Unlock Premium Access →"}
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              ₹49 secure checkout · One-time fee · Lifetime access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 font-sans relative select-none">
      
      {/* Dynamic Futuristic Header */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-slate-950 via-[#1a0f1d] to-[#0d0912] p-6 md:p-8 shadow-[0_0_30px_rgba(236,72,153,0.08)]">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Flame className="w-48 h-48 text-pink-500 rotate-12" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-pink-500/10 border border-pink-500/25 text-pink-500 text-[10px] font-mono rounded-full uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(236,72,153,0.1)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 fill-current text-pink-400" />
            <span>Competitive Intelligence Terminal</span>
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-600 drop-shadow-[0_0_15px_rgba(236,72,153,0.45)] tracking-tight uppercase">
            COMPETE TO CRUSH PLATFORM
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Acquire multi-tier syllabi trackers, interactive AI topic deconstructors, previous year papers, and complete trial scorecards to dominate any competitive board or placement assessment.
          </p>
        </div>
      </div>

      {/* CAT-BASED NAVIGATION SYSTEM */}
      {!activeCategory ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Dashboard Intro Text */}
          <div className="p-4 bg-[#0a0f1d]/60 border border-slate-800/80 rounded-2xl flex items-center space-x-3.5 text-xs text-slate-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            <span>Select an elite exam category below to unlock its dynamic tracking sheets, smart deconstructors, real-time board exams PYQs, and toppers' guides.</span>
          </div>

          {/* Cards Grid - World Class 2-Column Mobile Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {DASHBOARD_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const metrics = getCategoryProgressMetrics(cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    // Automatically expand first exam of selected category to keep UI highly intuitive
                    const firstExam = examsList.find(e => e.category === cat.id);
                    if (firstExam) {
                      setExpandedExamId(firstExam.id);
                      setSelectedExamId(firstExam.id);
                    }
                  }}
                  className={`rounded-2xl border p-4 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-5 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group relative overflow-hidden active:scale-[0.98] select-none ${cat.glowStyle}`}
                  style={{
                    backgroundColor: "rgba(10, 15, 30, 0.8)",
                    borderColor: cat.accentGlow,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {/* Glowing background halo */}
                  <div 
                    className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: cat.accentGlow }}
                  />

                  {/* Shimmer shining light sweep effect */}
                  <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />

                  {/* Header: Icon, Badge and Category Title */}
                  <div className="space-y-3 sm:space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 sm:p-2.5 rounded-xl border ${cat.iconBg} ${cat.iconColor} shadow-[0_0_15px_rgba(255,255,255,0.03)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 font-mono font-black rounded-full border border-pink-500/25 bg-pink-500/10 text-pink-400 tracking-wider animate-pulse`}>
                        {cat.badge}
                      </span>
                    </div>

                    <div className="space-y-0.5 sm:space-y-1">
                      <h3 className="text-xs sm:text-base font-black tracking-tight block">
                        <span className="text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors duration-300">
                          {cat.name}
                        </span>
                      </h3>
                      <p className={`text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider ${cat.textColor}`}>
                        {cat.subtitle}
                      </p>
                    </div>

                    <p className="text-[10px] sm:text-[11.5px] text-slate-400 leading-relaxed min-h-[40px] sm:min-h-[50px] line-clamp-2 sm:line-clamp-3 group-hover:text-slate-300 transition-colors duration-300">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Real-time completion progress indicator */}
                  <div className="relative z-10 pt-3 border-t border-slate-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] sm:text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Dossiers</span>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300">
                          {metrics.totalExams} {metrics.totalExams === 1 ? 'Exam' : 'Exams'}
                        </span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[8px] sm:text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Progress</span>
                        <span className={`text-[10px] sm:text-xs font-mono font-black ${cat.textColor} flex items-center space-x-1 justify-end`}>
                          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 fill-current animate-pulse shrink-0" />
                          <span>{metrics.percentage}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 sm:h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                      <div 
                        className={`h-full ${cat.progressColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${metrics.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Hover visual cue border overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#00E5FF] via-[#7C4DFF] to-[#FF4FD8] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Dynamic Category Screen Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
            <button
              onClick={() => {
                setActiveCategory(null);
                setExpandedExamId(null);
              }}
              className="px-5 py-2.5 bg-slate-950/95 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/35 hover:border-cyan-500 text-cyan-400 font-mono text-[11px] uppercase font-black tracking-wider rounded-xl flex items-center space-x-2.5 transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>← Back to Categories</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Active Category Screen</span>
              <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 uppercase tracking-tight">
                {DASHBOARD_CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {PREP_CATEGORIES.filter(cat => cat.id === activeCategory).map(cat => {
          const catExams = examsList.filter(e => e.category === cat.id);
          if (catExams.length === 0) return null;

          return (
            <div key={cat.id} className="cyber-glass-card border border-fuchsia-500/10 p-6 rounded-2xl space-y-5 shadow-[0_0_20px_rgba(236,72,153,0.02)]">
              <div className="flex items-center space-x-3.5 border-b border-slate-900 pb-4">
                <div className="p-2.5 bg-fuchsia-500/10 rounded-xl text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_8px_rgba(236,72,153,0.15)] animate-pulse">
                  <Trophy className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tracking-tight uppercase">{cat.name}</h2>
                  <p className="text-[11px] text-slate-400">{cat.id === "school" ? "Syllabus tracking and toppers' solutions for Class 1 to 10." : "Elite trackers for pre-professional assessments."}</p>
                </div>
              </div>

              {/* Grid of Exams in Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {catExams.map(ex => {
                  const isExpanded = expandedExamId === ex.id;
                  const metrics = getExamProgressMetrics(ex.id);

                  return (
                    <div 
                      key={ex.id} 
                      className={`border rounded-2xl transition-all duration-300 transform cursor-pointer hover:scale-[1.01] overflow-hidden group ${
                        isExpanded 
                          ? "bg-slate-950/80 border-blue-500/40 col-span-1 md:col-span-2 shadow-[0_0_25px_rgba(59,130,246,0.18)]" 
                          : "bg-slate-900/40 border-slate-900/60 hover:border-blue-500/35 col-span-1 shadow-[0_0_15px_rgba(59,130,246,0.04)]"
                      }`}
                    >
                      {/* Accordion Toggle */}
                      <button
                        onClick={() => {
                          setExpandedExamId(isExpanded ? null : ex.id);
                          setSelectedExamId(ex.id);
                          if (ex.subjects.length > 0) {
                            setSelectedSubjectId(ex.subjects[0].id);
                            if (ex.subjects[0].chapters.length > 0) {
                              setSelectedChapterId(ex.subjects[0].chapters[0].id);
                              if (ex.subjects[0].chapters[0].topics.length > 0) {
                                setSelectedTopicId(ex.subjects[0].chapters[0].topics[0].id);
                              }
                            }
                          }
                        }}
                        className="w-full text-left p-5 flex items-start justify-between cursor-pointer focus:outline-none relative"
                      >
                        {/* Animated shine sweep effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-extrabold text-slate-100 group-hover:text-blue-300 transition-colors uppercase tracking-wider">{ex.name}</span>
                            <span className="text-[9px] px-2.5 py-0.5 bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 text-amber-400 font-extrabold font-mono rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                              {ex.id === "class-10" ? "CHAMPION CORE" : "PREMIUM TIER"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-350 max-w-xl leading-relaxed">
                            {ex.eligibility} Formulate chapter-by-chapter mastery files and previous year question strategies.
                          </p>
                          <div className="flex items-center space-x-4 pt-1.5 text-[10px] font-mono text-slate-400">
                            <span>{ex.subjects.length} Major Syllabus Subjects</span>
                            <span>•</span>
                            <span>Completion: <strong className="text-emerald-400 font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{metrics.percentage}%</strong></span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}`} />
                      </button>

                      {/* WORKSPACE DETAILED DESK (Only shown when expanded) */}
                      {isExpanded && (
                        <div className="border-t border-slate-850 p-5 space-y-6 bg-slate-950/30 rounded-b-xl">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left Column: Subject and Topic selectors */}
                            <div className="lg:col-span-4 space-y-4">
                              
                              {/* Subject Selector */}
                              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Select Subject</span>
                                <div className="flex md:grid md:grid-cols-1 overflow-x-auto whitespace-nowrap md:whitespace-normal md:overflow-visible gap-2 md:gap-1.5 pb-2 md:pb-0 scrollbar-none shrink-0">
                                  {ex.subjects.map(sub => (
                                    <button
                                      key={sub.id}
                                      onClick={() => {
                                        setSelectedSubjectId(sub.id);
                                        if (sub.chapters.length > 0) {
                                          setSelectedChapterId(sub.chapters[0].id);
                                          if (sub.chapters[0].topics.length > 0) {
                                            setSelectedTopicId(sub.chapters[0].topics[0].id);
                                          }
                                        }
                                      }}
                                      className={`shrink-0 md:shrink-1 w-auto md:w-full text-left p-2.5 px-4 md:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                        selectedSubjectId === sub.id 
                                          ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/10" 
                                          : "bg-slate-900 text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      <span>{sub.name}</span>
                                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>

                            {/* Right Column: Workspaces Tabs and active view panel */}
                            <div className="lg:col-span-8 space-y-4">
                              
                              {/* Tab Headers: Video Academy → AI Topic Analyzer → Theory & Solutions → Revision & Mind Maps → PYQ Papers → Weekly & Mock Tests */}
                              <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
                                <button
                                  onClick={() => setCbseActiveTab("videos")}
                                  className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                                    cbseActiveTab === "videos"
                                      ? "bg-slate-800 text-yellow-500 border border-yellow-500/30"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Video Academy
                                </button>
                                <button
                                  onClick={() => setCbseActiveTab("analyzer")}
                                  className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                                    cbseActiveTab === "analyzer"
                                      ? "bg-slate-800 text-yellow-500 border border-yellow-500/30 font-extrabold"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  AI Topic Analyzer
                                </button>
                                <button
                                  onClick={() => setCbseActiveTab("study")}
                                  className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                                    cbseActiveTab === "study"
                                      ? "bg-slate-800 text-yellow-500 border border-yellow-500/30"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Theory & Solutions
                                </button>
                                <button
                                  onClick={() => setCbseActiveTab("revision")}
                                  className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                                    cbseActiveTab === "revision"
                                      ? "bg-slate-800 text-yellow-500 border border-yellow-500/30"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Revision & Mind Maps
                                </button>
                                <button
                                  onClick={() => setCbseActiveTab("pyqs")}
                                  className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                                    cbseActiveTab === "pyqs"
                                      ? "bg-slate-800 text-yellow-500 border border-yellow-500/30"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  PYQ Papers
                                </button>
                                <button
                                  onClick={() => setCbseActiveTab("exams")}
                                  className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                                    cbseActiveTab === "exams"
                                      ? "bg-slate-800 text-yellow-500 border border-yellow-500/30"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Weekly & Mock Tests
                                </button>
                              </div>

                              {/* Workspace Panel */}
                              <div className="bg-slate-950/40 p-5 border border-slate-850 rounded-xl min-h-[350px]">
                                
                                {/* 1. Video Academy Workspace */}
                                {cbseActiveTab === "videos" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-white uppercase font-mono">Curated Playlist lectures</h4>
                                        <p className="text-[11px] text-slate-400">Class toppers' recommended conceptual videos lists.</p>
                                      </div>
                                      <Play className="w-5 h-5 text-yellow-500" />
                                    </div>

                                    {YOUTUBE_LEARNING_PLAYLISTS[ex.id]?.[selectedSubjectId] ? (
                                      (() => {
                                        const pl = YOUTUBE_LEARNING_PLAYLISTS[ex.id][selectedSubjectId];
                                        return (
                                          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col md:flex-row gap-4">
                                            <img src={pl.thumbnail} className="w-full md:w-36 h-24 object-cover rounded-lg border border-slate-800" alt="playlist thumbnail" referrerPolicy="no-referrer" />
                                            <div className="space-y-2 flex-1">
                                              <span className="text-[9px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded uppercase font-bold">{pl.subjectName}</span>
                                              <h5 className="text-xs font-bold text-white">{pl.title}</h5>
                                              <p className="text-[11px] text-slate-400 leading-relaxed">{pl.desc}</p>
                                              <div className="flex items-center justify-between pt-1">
                                                <span className="text-[10px] text-slate-500 font-mono">{pl.videoCount} core topic lectures</span>
                                                <a href={pl.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-yellow-500 hover:underline font-bold">Launch Video Academy &rarr;</a>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      <div className="p-6 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-2">
                                        <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                                        <p className="text-xs text-slate-400">No static YouTube playlist mapped for this subject level.</p>
                                        <a 
                                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " " + (activeSubject?.name || "") + " lectures")}`} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="inline-block mt-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-yellow-500 text-[10px] font-mono uppercase font-bold rounded hover:bg-slate-800"
                                        >
                                          Search video playlists on YouTube &rarr;
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 2. Theory & Solutions Workspace */}
                                {cbseActiveTab === "study" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] font-mono text-yellow-500 uppercase font-bold">{activeSubject?.name} &bull; {activeChapter?.name}</span>
                                        <h4 className="text-sm font-bold text-white">{activeTopic?.name || "Select a topic from left sidebar"}</h4>
                                      </div>
                                      <FileText className="w-5 h-5 text-yellow-500" />
                                    </div>

                                    {activeTopic ? (
                                      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                                        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                                          <span className="text-[10px] font-mono text-yellow-500 uppercase font-black block">Core concept introduction</span>
                                          <p>{activeTopic.description || "Establish baseline proofs and physical boundary coefficients."}</p>
                                        </div>

                                        {activeTopic.subtopics && activeTopic.subtopics.length > 0 && (
                                          <div className="space-y-3">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Detailed Subtopics</span>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {activeTopic.subtopics.map((sub, idx) => (
                                                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg space-y-1">
                                                  <h5 className="font-bold text-white">{sub.title}</h5>
                                                  <p className="text-[11px] text-slate-400">{sub.desc}</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400">Please select an active syllabus topic from the progress tracker sidebar.</p>
                                    )}
                                  </div>
                                )}

                                {/* 3. Revision & Mind Maps Workspace */}
                                {cbseActiveTab === "revision" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                      <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-white uppercase font-mono">Micro concept Revision summaries</h4>
                                        <p className="text-[11px] text-slate-400">High-yield revision pointers for board assessments.</p>
                                      </div>
                                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    </div>

                                    <div className="space-y-3">
                                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl space-y-2">
                                        <span className="text-[10px] font-mono text-yellow-500 uppercase font-black block">Rapid Revision Pillars</span>
                                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                                          <li>Verify absolute numerical coefficients before solving proofs.</li>
                                          <li>Board exams award score parameters based on linear step progressions.</li>
                                          <li>Always state assumptions, unit conversions, and formula symbols clearly.</li>
                                        </ul>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Formula Deck</span>
                                          <span className="text-xs font-bold text-white block">Flashcards</span>
                                        </div>
                                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Visual Tree</span>
                                          <span className="text-xs font-bold text-white block">Mind Map</span>
                                        </div>
                                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Boards Checklist</span>
                                          <span className="text-xs font-bold text-white block">High Yield</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                 {/* 4. PYQ Papers Workspace (Interactive Discussion Hub) */}
                                 {cbseActiveTab === "pyqs" && (
                                   <div className="space-y-4">
                                     <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                                       <div className="space-y-0.5">
                                         <h4 className="text-sm font-bold text-white uppercase font-mono">PYQ Interactive Discussion Hub</h4>
                                         <p className="text-[11px] text-slate-400">Select year, click prep questions, or chat with our Expert board mentor.</p>
                                       </div>
                                       <FileSpreadsheet className="w-5 h-5 text-yellow-500" />
                                     </div>

                                     {/* Year Selector */}
                                     <div className="flex items-center space-x-2 bg-slate-900/60 p-1.5 border border-slate-850 rounded-lg">
                                       <span className="text-[10px] font-mono text-slate-500 uppercase font-black pl-1">Target Exam Year:</span>
                                       {["2024", "2023", "2022", "2021"].map(yr => (
                                         <button
                                           key={yr}
                                           onClick={() => setPyqHubYear(yr)}
                                           className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                                             pyqHubYear === yr
                                               ? "bg-yellow-500 text-slate-950 font-black shadow"
                                               : "bg-slate-950 text-slate-450 border border-slate-850 hover:text-white"
                                           }`}
                                         >
                                           {yr}
                                         </button>
                                       ))}
                                     </div>

                                     {/* Preloaded Curated Doubts */}
                                     <div className="space-y-2">
                                       <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Recommended doubts to analyze:</span>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                         {[
                                           `Give a detailed 5-marks step-by-step topper solution for ${activeTopic?.name || "this topic"} question from CBSE Class 12 board.`,
                                           `What are the most common algebraic or sign pitfalls in solving ${activeTopic?.name || "this topic"} exercises?`,
                                           `Provide a 2-minute short-trick formula list to solve ${activeTopic?.name || "this topic"} MCQ questions fast.`,
                                           `Explain the physical derivation parameters and standard marking scheme guidelines.`
                                         ].map((qText, qIdx) => (
                                           <button
                                             key={qIdx}
                                             onClick={() => {
                                               setPyqHubInput(qText);
                                               handlePyqDiscussionSubmit(qText);
                                             }}
                                             className="p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-[11px] text-slate-300 rounded-lg text-left leading-normal cursor-pointer transition-colors block"
                                           >
                                             {qText}
                                           </button>
                                         ))}
                                       </div>
                                     </div>

                                     {/* Chat Area */}
                                     <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col h-[280px]">
                                       {/* Messages */}
                                       <div className="p-3.5 space-y-3 overflow-y-auto flex-1 scrollbar-none">
                                         {pyqHubChat.map((msg, idx) => (
                                           <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                             <div className={`p-3 rounded-xl text-[11.5px] max-w-[85%] leading-relaxed ${
                                               msg.role === "user"
                                                 ? "bg-yellow-500 text-slate-950 font-medium rounded-tr-none"
                                                 : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none whitespace-pre-line"
                                             }`}>
                                               <span className="text-[9px] font-bold block mb-1 opacity-75 uppercase font-mono">
                                                 {msg.role === "user" ? "Student" : "Board Expert Guide"}
                                               </span>
                                               {msg.content}
                                             </div>
                                           </div>
                                         ))}
                                         {pyqHubLoading && (
                                           <div className="flex justify-start">
                                             <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl rounded-tl-none text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                                               <span className="animate-pulse w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                               <span className="animate-pulse w-1.5 h-1.5 bg-yellow-500 rounded-full delay-75"></span>
                                               <span className="animate-pulse w-1.5 h-1.5 bg-yellow-500 rounded-full delay-150"></span>
                                               <span>AI Expert is formulating stepwise solutions...</span>
                                             </div>
                                           </div>
                                         )}
                                       </div>

                                       {/* Input Bar */}
                                       <div className="p-2.5 bg-slate-900 border-t border-slate-850 flex items-center space-x-2">
                                         <input
                                           type="text"
                                           value={pyqHubInput}
                                           onChange={(e) => setPyqHubInput(e.target.value)}
                                           onKeyDown={(e) => {
                                             if (e.key === "Enter" && !pyqHubLoading) handlePyqDiscussionSubmit();
                                           }}
                                           placeholder={`Ask a doubt or write a topic parameter to solve...`}
                                           className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500/50 text-[11px] text-slate-300 rounded px-3 py-2 outline-none"
                                           disabled={pyqHubLoading}
                                         />
                                         <button
                                           onClick={() => handlePyqDiscussionSubmit()}
                                           disabled={pyqHubLoading || !pyqHubInput.trim()}
                                           className="px-4 py-2 bg-yellow-500 hover:bg-yellow-450 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono text-[10px] uppercase font-black tracking-wider rounded cursor-pointer transition-colors"
                                         >
                                           Discuss
                                         </button>
                                       </div>
                                     </div>

                                      {/* Verified CBSE & Board Resource Directory */}
                                      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                          <div className="flex items-center space-x-2">
                                            <Globe className="w-4 h-4 text-yellow-500 animate-pulse" />
                                            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Verified Official CBSE & Board Portals</span>
                                          </div>
                                          <span className="text-[9px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 font-bold font-mono rounded">
                                            Priority Direct Directories
                                          </span>
                                        </div>

                                        <p className="text-[11.5px] text-slate-350 leading-relaxed">
                                          Access official Previous Year Question Papers (PYQs), topper answers, evaluation schemes, and sample models directly from authentic repositories:
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                          {[
                                            {
                                              name: "CBSE Official Portal",
                                              domain: "cbse.gov.in",
                                              url: "https://www.cbse.gov.in",
                                              description: "Official board exam repository hosting genuine Sample Question Papers, marking schemes, and topper answer sheets for Class 10 and 12.",
                                              badge: "#1 Board Authority",
                                              badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                            },
                                            {
                                              name: "NCERT Official Archive",
                                              domain: "ncert.nic.in",
                                              url: "https://ncert.nic.in",
                                              description: "The core curriculum framework database. Access digital textbooks, exemplar solutions, and state-recommended test frameworks.",
                                              badge: "#2 Syllabus Root",
                                              badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                                            },
                                            {
                                              name: "OpenSchools Space",
                                              domain: "openschools.space",
                                              url: "https://openschools.space",
                                              description: "An open repository dedicated to academic guides, curriculum maps, and chapter-wise board-level revision dossiers.",
                                              badge: "#3 Open Database",
                                              badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                            },
                                            {
                                              name: "PYQ Sarkari Tool",
                                              domain: "pyq.sarkaritool.com",
                                              url: "https://pyq.sarkaritool.com",
                                              description: "A comprehensive digital index of past papers, sorted systematically by subject and chapter to aid revision goals.",
                                              badge: "#4 Smart Indexer",
                                              badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                                            },
                                            {
                                              name: "Exam Support Portal",
                                              domain: "exam-support.in",
                                              url: "https://www.exam-support.in",
                                              description: "A community-focused support site compiling verified solutions, study notes, and marking scheme PDFs for quick offline reference.",
                                              badge: "#5 Reference Hub",
                                              badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                                            },
                                          ].map((portal, pIdx) => (
                                            <div
                                              key={pIdx}
                                              className="p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col justify-between transition-all group"
                                            >
                                              <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                  <div className="space-y-0.5">
                                                    <h5 className="text-[12.5px] font-bold text-white group-hover:text-yellow-500 transition-colors">
                                                      {portal.name}
                                                    </h5>
                                                    <p className="text-[10px] text-slate-400 font-mono">{portal.domain}</p>
                                                  </div>
                                                  <span className={`text-[8.5px] px-2 py-0.5 font-mono font-bold rounded-full border ${portal.badgeColor}`}>
                                                    {portal.badge}
                                                  </span>
                                                </div>
                                                <p className="text-[11px] text-slate-450 leading-relaxed">
                                                  {portal.description}
                                                </p>
                                              </div>
                                              <div className="mt-3.5 pt-2.5 border-t border-slate-900 flex justify-end">
                                                <a
                                                  href={portal.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="px-3 py-1.5 bg-slate-900 hover:bg-yellow-500 hover:text-slate-950 border border-slate-800 hover:border-yellow-500 text-slate-300 font-mono text-[10px] uppercase font-black tracking-wide rounded-lg flex items-center space-x-1.5 transition-all"
                                                >
                                                  <span>Explore Directory</span>
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {/* 5. Timed Mock Assessment Workspace */}
                                {cbseActiveTab === "exams" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                                      <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-white uppercase font-mono">Simulated practice diagnostics</h4>
                                        <p className="text-[11px] text-slate-400">Practice questions to build speed and reduce exam-day errors.</p>
                                      </div>
                                      <Clock className="w-5 h-5 text-yellow-500" />
                                    </div>

                                    {!quizActive && !quizSubmitted && (
                                      <div className="p-6 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-4">
                                        <BarChart4 className="w-10 h-10 text-yellow-500 mx-auto" />
                                        <div className="space-y-1">
                                          <h5 className="text-sm font-bold text-white">Interactive Assessment Session Ready</h5>
                                          <p className="text-xs text-slate-400">4 multiple-choice items based on the active curriculum topic.</p>
                                        </div>
                                        <button 
                                          onClick={handleStartMockQuiz}
                                          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-450 text-slate-950 font-mono text-xs uppercase font-black tracking-wider rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
                                        >
                                          Activate Quiz Arena &rarr;
                                        </button>
                                      </div>
                                    )}

                                    {quizActive && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                          <span className="text-xs font-mono text-yellow-500 font-bold">Assessment timer active...</span>
                                          <span className="text-xs font-mono text-white font-bold">10:00 remaining</span>
                                        </div>

                                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                          {getMockQuestions().map((q, idx) => (
                                            <div key={q.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5">
                                              <span className="text-[9px] font-mono text-slate-500 uppercase font-black block">Question 0{idx + 1}</span>
                                              <p className="text-xs font-bold text-white leading-relaxed">{q.question}</p>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {q.options.map((opt, oIdx) => {
                                                  const val = ["A", "B", "C", "D"][oIdx];
                                                  const isSel = quizAnswers[q.id] === val;
                                                  return (
                                                    <button
                                                      key={oIdx}
                                                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: val })}
                                                      className={`w-full text-left p-2.5 rounded border text-[11px] font-bold transition-all cursor-pointer ${
                                                        isSel 
                                                          ? "bg-yellow-500 border-yellow-500/40 text-slate-950" 
                                                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                                                      }`}
                                                    >
                                                      {opt}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        <button 
                                          onClick={handleSubmitMockQuiz}
                                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-black tracking-wider rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
                                        >
                                          Submit Scorecard Parameters &rarr;
                                        </button>
                                      </div>
                                    )}

                                    {quizSubmitted && quizResult && (
                                      <div className="p-5 bg-gradient-to-br from-[#111827] to-[#1E293B] border border-slate-800 rounded-xl space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                          <div className="flex items-center space-x-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            <span className="text-xs font-black text-white uppercase font-mono">Assessment complete</span>
                                          </div>
                                          <button 
                                            onClick={handleStartMockQuiz}
                                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-yellow-500 text-[10px] font-mono uppercase font-bold rounded cursor-pointer hover:bg-slate-800"
                                          >
                                            Retry Trial
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                                            <span className="text-[9px] text-slate-500 block uppercase font-mono">Obtained Score</span>
                                            <span className="text-xl font-bold font-mono text-yellow-500">{quizResult.score}%</span>
                                          </div>
                                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                                            <span className="text-[9px] text-slate-500 block uppercase font-mono">accuracy rate</span>
                                            <span className="text-xl font-bold font-mono text-emerald-400">{quizResult.accuracy}%</span>
                                          </div>
                                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                                            <span className="text-[9px] text-slate-500 block uppercase font-mono">Predicted Rank</span>
                                            <span className="text-xl font-bold font-mono text-amber-500">#{quizResult.rank}</span>
                                          </div>
                                          <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                                            <span className="text-[9px] text-slate-500 block uppercase font-mono">Time Spent</span>
                                            <span className="text-xl font-bold font-mono text-indigo-400">{quizResult.duration}s</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                )}

                                {/* 6. AI Topic Analyzer Workspace */}
                                {cbseActiveTab === "analyzer" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                                      <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-white uppercase font-mono">AI Cognitive Topic deconstructor</h4>
                                        <p className="text-[11px] text-slate-400">Complete curriculum analysis with solver algorithms and diagrams.</p>
                                      </div>
                                      <Sparkles className="w-5 h-5 text-yellow-500" />
                                    </div>

                                    {/* Difficulty Selector */}
                                    <div className="space-y-2">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Select Analysis Difficulty</span>
                                      <div className="flex space-x-2">
                                        {["basic", "medium", "advanced"].map((d) => (
                                          <button
                                            key={d}
                                            onClick={() => setTopicAnalyzerDifficulty(d as any)}
                                            className={`flex-1 py-2 text-xs font-mono uppercase font-bold rounded-lg transition-all border cursor-pointer ${
                                              topicAnalyzerDifficulty === d
                                                ? "bg-yellow-500 text-slate-950 border-yellow-500 font-extrabold shadow-lg"
                                                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                                            }`}
                                          >
                                            {d}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Topic Inputs */}
                                    <div className="space-y-2.5">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Enter Topic or Deconstruct Syllabus Node</span>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="e.g. Thermodynamics, Photosynthesis, Trigonometry..."
                                          value={topicAnalyzerInput}
                                          onChange={(e) => setTopicAnalyzerInput(e.target.value)}
                                          className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-yellow-550/60"
                                        />
                                        <button
                                          onClick={() => handleDeconstructTopic("")}
                                          disabled={topicAnalyzerLoading}
                                          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-450 disabled:bg-slate-800 text-slate-950 font-mono text-xs uppercase font-black tracking-wider rounded-lg shadow-lg active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                                        >
                                          {topicAnalyzerLoading ? (
                                            <>
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span>Analyzing...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Activity className="w-4 h-4" />
                                              <span>Deconstruct</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Preset Topics */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Preset topics deck</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {PRESET_TOPICS.map((pt) => (
                                          <button
                                            key={pt}
                                            onClick={() => handleDeconstructTopic(pt)}
                                            disabled={topicAnalyzerLoading}
                                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white text-[10px] font-medium rounded-md cursor-pointer transition-colors"
                                          >
                                            {pt}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Results Deck */}
                                    {topicAnalyzerError && (
                                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-400">{topicAnalyzerError}</p>
                                      </div>
                                    )}

                                    {topicAnalyzerResult && (
                                      <div className="space-y-4 pt-2">
                                        {/* Result Header */}
                                        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                          <div className="flex items-center space-x-1.5">
                                            <Sparkles className="w-4 h-4 text-yellow-500" />
                                            <span className="text-xs font-bold text-white uppercase">{topicAnalyzerResult.topic} DOSSIER</span>
                                          </div>
                                          <button
                                            onClick={() => handleExportTopicPDF(topicAnalyzerResult)}
                                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-yellow-500 border border-slate-800 text-[10px] font-mono uppercase font-bold rounded flex items-center space-x-1 cursor-pointer"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Export PDF</span>
                                          </button>
                                        </div>

                                        {/* Sub-tabs */}
                                        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
                                          {[
                                            { id: "overview", label: "Overview" },
                                            { id: "definition", label: "Definition" },
                                            { id: "detailed", label: "Technical Detailed" },
                                            { id: "examples", label: "Real-Life Examples" },
                                            { id: "diagram", label: "Process Diagram" },
                                            { id: "mindmap", label: "Mind Map" },
                                            { id: "facts", label: "High-Yield Facts" },
                                            { id: "board", label: "Board Blueprint" },
                                            { id: "competitive", label: "Competitive Practice" },
                                            { id: "pyqs", label: "Solved PYQs" },
                                            { id: "mistakes", label: "Common Mistakes" },
                                            { id: "revision", label: "Revision Notes" }
                                          ].map((tab) => (
                                            <button
                                              key={tab.id}
                                              onClick={() => setTopicAnalyzerActiveSubTab(tab.id as any)}
                                              className={`px-3 py-1.5 text-[10px] font-bold rounded uppercase cursor-pointer shrink-0 ${
                                                topicAnalyzerActiveSubTab === tab.id
                                                  ? "bg-slate-800 text-yellow-500 border border-yellow-500/20"
                                                  : "text-slate-400 hover:text-slate-200"
                                              }`}
                                            >
                                              {tab.label}
                                            </button>
                                          ))}
                                        </div>

                                        {/* Sub-tab Content Panels */}
                                        <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed min-h-[220px]">
                                          {topicAnalyzerActiveSubTab === "overview" && (
                                            <div className="space-y-2">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase">Concept Overview</span>
                                              <p className="text-slate-300 leading-relaxed text-[13px]">{topicAnalyzerResult.overview}</p>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "definition" && (
                                            <div className="space-y-2">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase">Standard Definition</span>
                                              <p className="text-slate-300 leading-relaxed text-[13px]">{topicAnalyzerResult.definition}</p>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "detailed" && (
                                            <div className="space-y-2">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase">Technical Discussion & Derivations</span>
                                              <div className="text-slate-300 whitespace-pre-line leading-relaxed text-[13px] font-sans">{topicAnalyzerResult.detailedExplanation}</div>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "examples" && (
                                            <div className="space-y-2">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase">Real-Life Application & Analogy Case studies</span>
                                              <p className="text-slate-300 leading-relaxed text-[13px]">{topicAnalyzerResult.examples}</p>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "diagram" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">Process Flowchart Diagram</span>
                                              {topicAnalyzerResult.diagram ? (
                                                <pre className="p-4 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-emerald-400 font-mono overflow-x-auto leading-normal whitespace-pre">
                                                  {topicAnalyzerResult.diagram}
                                                </pre>
                                              ) : (
                                                <p className="text-slate-400 font-mono">No structural flowchart generated for this topic yet.</p>
                                              )}
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "mindmap" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">Hierarchical Concept Mind Map</span>
                                              {topicAnalyzerResult.mindMap ? (
                                                <pre className="p-4 bg-slate-950 border border-slate-850 rounded-lg text-[11px] text-amber-500 font-mono overflow-x-auto leading-normal whitespace-pre">
                                                  {topicAnalyzerResult.mindMap}
                                                </pre>
                                              ) : (
                                                <p className="text-slate-400 font-mono">No mind map generated for this topic yet.</p>
                                              )}
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "facts" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">High-Yield Essential Facts</span>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {topicAnalyzerResult.facts?.map((fact: string, idx: number) => (
                                                  <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-lg flex items-start space-x-2">
                                                    <span className="text-yellow-500 font-bold font-mono">#{idx+1}</span>
                                                    <p className="text-slate-300 text-[12px]">{fact}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "board" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">Board Blueprint & Long Answer Questions</span>
                                              <div className="space-y-2">
                                                {topicAnalyzerResult.boardQuestions?.map((bq: string, idx: number) => (
                                                  <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1">
                                                    <div className="text-slate-300 font-bold text-[12px]">{bq}</div>
                                                    <p className="text-[11px] text-slate-500">Suggested board format answer length: 150-200 words containing stepwise formulas.</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "competitive" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">Competitive Practice (JEE / NEET / CLAT Drills)</span>
                                              <div className="space-y-2">
                                                {topicAnalyzerResult.competitiveQuestions?.map((cq: string, idx: number) => (
                                                  <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-lg space-y-1">
                                                    <div className="text-slate-300 font-semibold text-[12px]">{cq}</div>
                                                    <p className="text-[11px] text-slate-500">Shortcut recommendation: Solve by elimination or dimensional balance checks.</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "pyqs" && (
                                            <div className="space-y-4">
                                              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                                <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase">Previous Year Questions Solved</span>
                                                <span className="text-[10px] text-slate-500 font-mono">Corrected Marking Scheme Guidelines</span>
                                              </div>
                                              {topicAnalyzerResult.pyqs.map((q: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-bold text-white">Question {idx + 1} (Year: {q.year} &bull; Marks: {q.marks})</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{q.exam}</span>
                                                  </div>
                                                  <p className="text-slate-300 font-medium">{q.question}</p>
                                                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded text-emerald-400">
                                                    <p className="font-bold mb-1">Topper Model Solution:</p>
                                                    <p className="text-slate-350">{q.solution}</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "mistakes" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">Toppers' Warning: Common Pitfalls</span>
                                              {topicAnalyzerResult.commonMistakes.map((m: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                                                  <span className="font-bold text-red-400">Common Mistake: {m.mistake}</span>
                                                  <p className="text-emerald-400">Corrective Step: {m.correction}</p>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {topicAnalyzerActiveSubTab === "revision" && (
                                            <div className="space-y-3">
                                              <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-black uppercase block w-max">Last-Minute Exam Day Revision Notes</span>
                                              <ul className="space-y-2">
                                                {topicAnalyzerResult.revisionNotes?.map((rn: string, idx: number) => (
                                                  <li key={idx} className="flex items-start space-x-2 text-[12px] text-slate-300">
                                                    <span className="text-yellow-500 mt-1 font-mono">&bull;</span>
                                                    <span>{rn}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                )}

                              </div>

                            </div>

                          </div>

                          {/* Syllabus Progress Tracker - Moved completely out of the grid, below the Video Academy/Workspace section */}
                          {activeSubject && (
                            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest font-bold">SYLLABUS STUDY PROGRESS TRACKER</span>
                                  <h4 className="text-xs font-bold text-slate-350">Track and update individual topics' preparation status</h4>
                                </div>
                                <span className="text-[9px] px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 font-bold font-mono rounded">
                                  {activeSubject.name} Syllabus
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
                                {activeSubject.chapters.map(ch => (
                                  <div key={ch.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2.5">
                                    <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                                      <span className="text-[11px] font-black text-slate-200 truncate max-w-[180px]" title={ch.name}>{ch.name}</span>
                                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Unit Tracker</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {ch.topics.map(top => {
                                        const status = checkedTopics[top.id] || "Not Started";
                                        return (
                                          <div 
                                            key={top.id}
                                            className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all duration-200 ${
                                              selectedTopicId === top.id 
                                                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 font-bold" 
                                                : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-300 hover:border-slate-800"
                                            }`}
                                            onClick={() => setSelectedTopicId(top.id)}
                                          >
                                            <span className="truncate max-w-[150px]" title={top.name}>{top.name}</span>
                                            <select
                                              value={status}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                handleUpdateTopicStatus(top.id, e.target.value as any);
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                              className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded font-bold px-1.5 py-0.5 focus:outline-none cursor-pointer"
                                            >
                                              <option value="Not Started">Not Started</option>
                                              <option value="In Progress">In Progress</option>
                                              <option value="Completed">Completed</option>
                                            </select>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* REPOSITIONED PROGRESS ANALYTICS BENTO BOARD AT THE BOTTOM OF THE SECTION */}
                          <div className="border-t border-slate-850 pt-5 mt-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Progress Analytics & Scores History</span>
                              <Award className="w-5 h-5 text-yellow-500" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono">Exam Syllabus Complete</span>
                                <span className="text-xl font-bold font-mono text-yellow-500">{metrics.percentage}%</span>
                              </div>
                              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono">Average Assessment Score</span>
                                <span className="text-xl font-bold font-mono text-emerald-400">{metrics.averageScore}%</span>
                              </div>
                              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono">Attempted Tests Logs</span>
                                <span className="text-xl font-bold font-mono text-indigo-400">{metrics.attempts} sessions</span>
                              </div>
                              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-1">
                                <span className="text-[9px] text-slate-500 block uppercase font-mono">Selected Topic Checklist</span>
                                <span className="text-xs font-mono text-slate-300 block pt-1">{checkedTopics[selectedTopicId] || "Not Started"}</span>
                              </div>
                            </div>

                            {/* Scores Chart and Logs */}
                            {scoresList.filter(s => s.examId === selectedExamId).length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                                
                                {/* Score Tracker Log Table */}
                                <div className="md:col-span-5 bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Past scorecard logbooks</span>
                                    <button 
                                      onClick={handleClearScoreHistory}
                                      className="text-[9px] font-mono text-red-400 uppercase font-black hover:underline cursor-pointer"
                                    >
                                      Clear Logs
                                    </button>
                                  </div>

                                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {scoresList.filter(s => s.examId === selectedExamId).map((sc: any) => (
                                      <div key={sc.id} className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between text-[11px] font-mono">
                                        <div>
                                          <span className="text-white font-bold block">{sc.type}</span>
                                          <span className="text-slate-500 text-[9px]">{sc.date}</span>
                                        </div>
                                        <span className={`font-bold ${sc.scoreObtained >= 75 ? "text-emerald-400" : "text-yellow-500"}`}>{sc.scoreObtained}/{sc.maxScore}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Score Area Chart */}
                                <div className="md:col-span-7 h-52 min-w-0">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-2">Performance Curve</span>
                                  <ResponsiveContainer width="100%" height="85%">
                                    <AreaChart data={[...scoresList].filter(s => s.examId === selectedExamId).reverse()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                                      <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                                      <Tooltip contentStyle={{ backgroundColor: "#0A0F1D", borderColor: "#1e293b" }} />
                                      <Area type="monotone" dataKey="scoreObtained" name="Score" stroke="#f59e0b" fillOpacity={1} fill="url(#scoreColor)" strokeWidth={2} />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>

                              </div>
                            )}

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      )}

      {/* UPSC PERSONALITY Interview Coach panel (Only shown under upsc active category state) */}
      {activeCategory === "upsc" && selectedExamId === "upsc-cse" && (
        <div className="border border-slate-800 bg-[#0A0F1D] rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">UPSC Personality Coach Rehearsal Playground</h2>
              <p className="text-[11px] text-slate-400">Interactive personality assessment and boards etiquette rehearsals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Select Module</span>
              <div className="space-y-1.5">
                {UPSC_INTERVIEW_PREP_DATA.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setUpscActiveInterviewId(topic.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      upscActiveInterviewId === topic.id 
                        ? "bg-yellow-500 text-slate-950 shadow-lg" 
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{topic.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 bg-slate-950 p-5 border border-slate-850 rounded-xl space-y-4">
              {(() => {
                const topicObj = UPSC_INTERVIEW_PREP_DATA.find(t => t.id === upscActiveInterviewId) || UPSC_INTERVIEW_PREP_DATA[0];
                return (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase">{topicObj.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{topicObj.description}</p>
                    
                    <div className="p-3.5 bg-slate-900 border border-slate-850 rounded-lg space-y-2">
                      <span className="text-[9px] font-mono text-yellow-500 uppercase font-black block">Board representative tips</span>
                      <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                        {topicObj.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      {topicObj.mockQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5 text-xs text-slate-300">
                          <p className="font-bold text-white">Q. {q.question}</p>
                          <div className="p-2.5 bg-slate-900 border border-slate-850 rounded">
                            <span className="text-[9px] font-mono text-emerald-400 uppercase font-black block mb-1">Key Checklist Points</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-slate-400">
                              {q.pointsToMention.map((pt, pIdx) => (
                                <div key={pIdx} className="flex items-center space-x-1.5">
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeCategory && (
        <button
          onClick={() => {
            setActiveCategory(null);
            setExpandedExamId(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-slate-950/95 text-cyan-400 hover:text-slate-950 hover:bg-cyan-400 border border-cyan-500/30 hover:border-cyan-400 font-mono text-[11px] uppercase font-black tracking-widest rounded-full flex items-center space-x-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Back to Dashboard</span>
        </button>
      )}

    </div>
  );
}
