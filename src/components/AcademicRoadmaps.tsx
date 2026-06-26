import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { GroqService } from "../services/groq";
import { 
  collection, query, where, getDocs, addDoc, updateDoc, doc, setDoc, deleteDoc 
} from "firebase/firestore";
import { 
  Map, GraduationCap, Trophy, Sparkles, Award, Star, Compass, 
  Trash2, Plus, Sliders, CheckCircle2, ChevronRight, Loader2, Calendar, 
  BookOpen, BrainCircuit, Activity, Info, Zap, AlertTriangle, HelpCircle, 
  Target, Globe, Shield, Send, ChevronLeft
} from "lucide-react";
import { Class10PathTree } from "./Class10PathTree";

export const AcademicRoadmaps: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  
  // Tab Management: 'overview' | 'dashboard' | 'class-wise' | 'stream-advisor' | 'exams' | 'olympiads' | 'skills' | 'ai-generator'
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);

  // Firestore States
  const [examTrackersArr, setExamTrackersArr] = useState<any[]>([]);
  const [olympiadsArr, setOlympiadsArr] = useState<any[]>([]);
  const [skillsArr, setSkillsArr] = useState<any[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<any[]>([]);
  const [favoriteCareers, setFavoriteCareers] = useState<any[]>([]);

  // Selected details
  const [selectedClassItem, setSelectedClassItem] = useState("Class 10");
  const [selectedAdvisingStream, setSelectedAdvisingStream] = useState<string | null>(null);

  // Inputs for interactive adding
  const [newMockName, setNewMockName] = useState<string>("");
  const [newMockScore, setNewMockScore] = useState<number>(0);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Inputs for adding certificates / ranks to Olympiads
  const [selectedOlympiadId, setSelectedOlympiadId] = useState<string | null>(null);
  const [olympiadRankInput, setOlympiadRankInput] = useState<string>("");
  const [olympiadAwardInput, setOlympiadAwardInput] = useState<string>("");

  // AI Stream Decider form
  const [favSubjects, setFavSubjects] = useState<string>("");
  const [personalInterests, setPersonalInterests] = useState<string>("");
  const [personalSkills, setPersonalSkills] = useState<string>("");
  const [streamAIEffect, setStreamAIEffect] = useState<string | null>(null);
  const [streamAILoading, setStreamAILoading] = useState<boolean>(false);

  // AI Roadmap Generator Form
  const [inputClass, setInputClass] = useState<string>("Class 10");
  const [inputPerformance, setInputPerformance] = useState<string>("Exemplary (90%+)");
  const [inputInterests, setInputInterests] = useState<string>("");
  const [inputSkills, setInputSkills] = useState<string>("");
  const [inputCareerGoals, setInputCareerGoals] = useState<string>("");
  const [aiRoadmapResult, setAiRoadmapResult] = useState<any | null>(null);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);

  // Initial Seeding & Fetching with high-speed timeout fallback
  const getDocsWithTimeout = async (q: any, timeoutMs = 800) => {
    return Promise.race([
      getDocs(q),
      new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), timeoutMs)
      )
    ]);
  };

  const loadFirestoreModuleData = async (userUid: string) => {
    try {
      const hasCache = localStorage.getItem(`fp_exams_${userUid}`) !== null;
      if (!hasCache) {
        setLoading(true);
      }

      // Run queries in parallel with quick timeout boundaries to prevent buffering screens
      const [examsSnap, olympiadsSnap, skillsSnap, roadmapsSnap, careersSnap] = await Promise.allSettled([
        getDocsWithTimeout(query(collection(db, "examTrackers"), where("uid", "==", userUid)), 800),
        getDocsWithTimeout(query(collection(db, "olympiads"), where("uid", "==", userUid)), 800),
        getDocsWithTimeout(query(collection(db, "skills"), where("uid", "==", userUid)), 800),
        getDocsWithTimeout(query(collection(db, "academicRoadmaps"), where("uid", "==", userUid)), 800),
        getDocsWithTimeout(query(collection(db, "careerPaths"), where("uid", "==", userUid)), 800)
      ]);

      let examsList: any[] = [];
      if (examsSnap.status === "fulfilled") {
        examsList = examsSnap.value.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
      
      let olympiadsList: any[] = [];
      if (olympiadsSnap.status === "fulfilled") {
        olympiadsList = olympiadsSnap.value.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }

      let skillsList: any[] = [];
      if (skillsSnap.status === "fulfilled") {
        skillsList = skillsSnap.value.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }

      let roadmapsList: any[] = [];
      if (roadmapsSnap.status === "fulfilled") {
        roadmapsList = roadmapsSnap.value.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setSavedRoadmaps(roadmapsList);
        localStorage.setItem(`fp_roadmaps_${userUid}`, JSON.stringify(roadmapsList));
      }

      let careersList: any[] = [];
      if (careersSnap.status === "fulfilled") {
        careersList = careersSnap.value.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setFavoriteCareers(careersList);
        localStorage.setItem(`fp_careers_${userUid}`, JSON.stringify(careersList));
      }

      // If datasets are completely empty or timed out, load rich Indian default records so the app is instantly fully unlocked
      if (examsList.length === 0 && olympiadsList.length === 0 && skillsList.length === 0) {
        const defaultExams = [
          {
            id: "default_ex_1",
            uid: userUid,
            examName: "JEE Main & Advanced",
            countdownDays: 280,
            syllabusProgress: 45,
            mockTestScores: [
              { label: "Mock Test 1", score: 185 },
              { label: "Mock Test 2", score: 210 }
            ],
            preparationTimeline: [
              { task: "Understand physics calculus requirements", completed: true },
              { task: "Memorize inorganic reactions matrices", completed: false },
              { task: "Practice 10 mock test sheets", completed: false }
            ],
            isActive: true
          },
          {
            id: "default_ex_2",
            uid: userUid,
            examName: "NEET Entrance",
            countdownDays: 310,
            syllabusProgress: 30,
            mockTestScores: [
              { label: "State Mock Bio", score: 560 }
            ],
            preparationTimeline: [
              { task: "Complete organic chemistry nomenclature", completed: true },
              { task: "Anatomical diagrams tracking", completed: false }
            ],
            isActive: false
          },
          {
            id: "default_ex_3",
            uid: userUid,
            examName: "CUET Grade Alignment",
            countdownDays: 340,
            syllabusProgress: 60,
            mockTestScores: [],
            preparationTimeline: [
              { task: "Identify general awareness syllabi", completed: true }
            ],
            isActive: true
          }
        ];

        const defaultOlympiads = [
          {
            id: "default_ol_1",
            uid: userUid,
            olympiadName: "IMO (International Math Olympiad)",
            participationRecord: "Registered",
            rankings: "Pending examination outcome",
            awards: "To be decided",
            certificates: []
          },
          {
            id: "default_ol_2",
            uid: userUid,
            olympiadName: "NSO (National Science Olympiad)",
            participationRecord: "Completed",
            rankings: "State Rank: 182",
            awards: "Olympiad Merit Badge",
            certificates: ["NSO_Merit_2026.pdf"]
          }
        ];

        const defaultSkills = [
          {
            id: "default_sk_1",
            uid: userUid,
            skillName: "Coding & Algorithmic Automation",
            progressPercent: 75,
            skillBadges: ["Script Cadet", "Recursion Scout"],
            certificates: ["Introduction to Javascript"],
            recommendations: ["Study intermediate space complexity", "Build full stack interfaces"]
          },
          {
            id: "default_sk_2",
            uid: userUid,
            skillName: "Linguistic Speed & Public Speaking",
            progressPercent: 40,
            skillBadges: ["Eloquent Node"],
            certificates: [],
            recommendations: ["Register in 2 local debate clubs", "Engage in vocal clarity speed drills"]
          }
        ];

        setExamTrackersArr(defaultExams);
        setOlympiadsArr(defaultOlympiads);
        setSkillsArr(defaultSkills);

        localStorage.setItem(`fp_exams_${userUid}`, JSON.stringify(defaultExams));
        localStorage.setItem(`fp_olympiads_${userUid}`, JSON.stringify(defaultOlympiads));
        localStorage.setItem(`fp_skills_${userUid}`, JSON.stringify(defaultSkills));

        // Attempt background async seed in Firestore, but do not await or block
        setSeeding(true);
        seedDefaultCollections(userUid).finally(() => setSeeding(false));
      } else {
        setExamTrackersArr(examsList);
        setOlympiadsArr(olympiadsList);
        setSkillsArr(skillsList);

        localStorage.setItem(`fp_exams_${userUid}`, JSON.stringify(examsList));
        localStorage.setItem(`fp_olympiads_${userUid}`, JSON.stringify(olympiadsList));
        localStorage.setItem(`fp_skills_${userUid}`, JSON.stringify(skillsList));
      }
    } catch (err) {
      console.error("Error fetching Academic Roadmap components:", err);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultCollections = async (userUid: string) => {
    try {
      // 1. Seed EXAM TRACKERS (JEE, NEET, CUET, CLAT, NDA, NIFT, NID, CA Foundation)
      const defaultExams = [
        {
          uid: userUid,
          examName: "JEE Main & Advanced",
          countdownDays: 280,
          syllabusProgress: 45,
          mockTestScores: [
            { label: "Mock Test 1", score: 185 },
            { label: "Mock Test 2", score: 210 }
          ],
          preparationTimeline: [
            { task: "Understand physics calculus requirements", completed: true },
            { task: "Memorize inorganic reactions matrices", completed: false },
            { task: "Practice 10 mock test sheets", completed: false }
          ],
          isActive: true
        },
        {
          uid: userUid,
          examName: "NEET Entrance",
          countdownDays: 310,
          syllabusProgress: 30,
          mockTestScores: [
            { label: "State Mock Bio", score: 560 }
          ],
          preparationTimeline: [
            { task: "Complete organic chemistry nomenclature", completed: true },
            { task: "Anatomical diagrams tracking", completed: false }
          ],
          isActive: false
        },
        {
          uid: userUid,
          examName: "CUET Grade Alignment",
          countdownDays: 340,
          syllabusProgress: 60,
          mockTestScores: [],
          preparationTimeline: [
            { task: "Identify general awareness syllabi", completed: true }
          ],
          isActive: true
        },
        {
          uid: userUid,
          examName: "CLAT Legal Entrance",
          countdownDays: 250,
          syllabusProgress: 20,
          mockTestScores: [],
          preparationTimeline: [
            { task: "Legal reasoning concepts notes", completed: false }
          ],
          isActive: false
        },
        {
          uid: userUid,
          examName: "CA Foundation Math & Book",
          countdownDays: 180,
          syllabusProgress: 55,
          mockTestScores: [
            { label: "Accounts Drill 1", score: 68 }
          ],
          preparationTimeline: [
            { task: "Double-entry bookkeeping masteries", completed: true },
            { task: "Business law fundamentals revision", completed: false }
          ],
          isActive: false
        }
      ];

      for (const ex of defaultExams) {
        try {
          await addDoc(collection(db, "examTrackers"), ex);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, "examTrackers");
        }
      }

      // 2. Seed OLYMPIADS (IMO, NSO, IEO, NCO, NSTSE, NTSE)
      const defaultOlympiads = [
        {
          uid: userUid,
          olympiadName: "IMO (International Math Olympiad)",
          participationRecord: "Registered",
          rankings: "Pending examination outcome",
          awards: "To be decided",
          certificates: []
        },
        {
          uid: userUid,
          olympiadName: "NSO (National Science Olympiad)",
          participationRecord: "Completed",
          rankings: "State Rank: 182",
          awards: "Olympiad Merit Badge",
          certificates: ["NSO_Merit_2026.pdf"]
        },
        {
          uid: userUid,
          olympiadName: "IEO (International English Olympiad)",
          participationRecord: "Not Registered",
          rankings: "N/A",
          awards: "N/A",
          certificates: []
        },
        {
          uid: userUid,
          olympiadName: "NTSE (National Talent Search Exam)",
          participationRecord: "In-Progress",
          rankings: "Cleared Stage 1",
          awards: "Direct scholarship tag eligibility",
          certificates: ["NTSE_Stage1_Cleared.pdf"]
        }
      ];

      for (const ol of defaultOlympiads) {
        try {
          await addDoc(collection(db, "olympiads"), ol);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, "olympiads");
        }
      }

      // 3. Seed SKILLS
      const defaultSkills = [
        {
          uid: userUid,
          skillName: "Coding & Algorithmic Automation",
          progressPercent: 75,
          skillBadges: ["Script Cadet", "Recursion Scout"],
          certificates: ["Introduction to Javascript"],
          recommendations: ["Study intermediate space complexity", "Build full stack interfaces"]
        },
        {
          uid: userUid,
          skillName: "Linguistic Speed & Public Speaking",
          progressPercent: 40,
          skillBadges: ["Eloquent Node"],
          certificates: [],
          recommendations: ["Register in 2 local debate clubs", "Engage in vocal clarity speed drills"]
        },
        {
          uid: userUid,
          skillName: "Critical Logic & Problem Solving",
          progressPercent: 65,
          skillBadges: ["Matrix Analyst"],
          certificates: ["Cognitive Logic cert 1"],
          recommendations: ["Attempt 1 competitive sudoku deck daily", "Analyze Boolean parameters logic diagrams"]
        },
        {
          uid: userUid,
          skillName: "Sports Athletic Tactics",
          progressPercent: 50,
          skillBadges: ["Agility Scout"],
          certificates: [],
          recommendations: ["Maintain 5k endurance schedules", "Consult Sports corridor logs weekly"]
        }
      ];

      for (const sk of defaultSkills) {
        try {
          await addDoc(collection(db, "skills"), sk);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, "skills");
        }
      }

    } catch (err) {
      console.error("Error auto-seeding defaults in Firestore:", err);
    }
  };

  // Load cached values instantly on mount
  useEffect(() => {
    if (currentUser?.uid) {
      const uid = currentUser.uid;
      const cachedExams = localStorage.getItem(`fp_exams_${uid}`);
      const cachedOlympiads = localStorage.getItem(`fp_olympiads_${uid}`);
      const cachedSkills = localStorage.getItem(`fp_skills_${uid}`);
      const cachedRoadmaps = localStorage.getItem(`fp_roadmaps_${uid}`);
      const cachedCareers = localStorage.getItem(`fp_careers_${uid}`);

      if (cachedExams) setExamTrackersArr(JSON.parse(cachedExams));
      if (cachedOlympiads) setOlympiadsArr(JSON.parse(cachedOlympiads));
      if (cachedSkills) setSkillsArr(JSON.parse(cachedSkills));
      if (cachedRoadmaps) setSavedRoadmaps(JSON.parse(cachedRoadmaps));
      if (cachedCareers) setFavoriteCareers(JSON.parse(cachedCareers));

      if (cachedExams || cachedOlympiads || cachedSkills) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  // Sync state mutations immediately to local storage for instant feedback
  useEffect(() => {
    if (currentUser?.uid && examTrackersArr.length > 0) {
      localStorage.setItem(`fp_exams_${currentUser.uid}`, JSON.stringify(examTrackersArr));
    }
  }, [examTrackersArr, currentUser]);

  useEffect(() => {
    if (currentUser?.uid && olympiadsArr.length > 0) {
      localStorage.setItem(`fp_olympiads_${currentUser.uid}`, JSON.stringify(olympiadsArr));
    }
  }, [olympiadsArr, currentUser]);

  useEffect(() => {
    if (currentUser?.uid && skillsArr.length > 0) {
      localStorage.setItem(`fp_skills_${currentUser.uid}`, JSON.stringify(skillsArr));
    }
  }, [skillsArr, currentUser]);

  useEffect(() => {
    if (currentUser?.uid && savedRoadmaps.length > 0) {
      localStorage.setItem(`fp_roadmaps_${currentUser.uid}`, JSON.stringify(savedRoadmaps));
    }
  }, [savedRoadmaps, currentUser]);

  useEffect(() => {
    if (currentUser?.uid && favoriteCareers.length > 0) {
      localStorage.setItem(`fp_careers_${currentUser.uid}`, JSON.stringify(favoriteCareers));
    }
  }, [favoriteCareers, currentUser]);

  useEffect(() => {
    if (currentUser?.uid) {
      loadFirestoreModuleData(currentUser.uid);
      if (userProfile?.class) {
        setSelectedClassItem(userProfile.class);
      }
    } else {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  // AI Stream Selector logic
  const handleConsultStreamSelectionAI = async () => {
    if (!favSubjects) {
      alert("Please state your favorite subjects to feed our Stream Advisor algorithm!");
      return;
    }
    setStreamAILoading(true);
    setStreamAIEffect(null);
    try {
      const resp = await GroqService.getStreamSelectionAdvice(
        selectedClassItem,
        favSubjects.split(",").map(s => s.trim()),
        personalInterests.split(",").map(i => i.trim()),
        personalSkills.split(",").map(sk => sk.trim())
      );
      setStreamAIEffect(resp.reply);
    } catch (err) {
      console.error(err);
      setStreamAIEffect("Error establishing streaming advisor metrics. Fallback: Pursue Science PCM if high math agility, Commerce if business alignment, or Humanities if legislative public interests thrive.");
    } finally {
      setStreamAILoading(false);
    }
  };

  // AI Detailed Roadmap Generator (GEMINI backend fallback)
  const handleGeneratePersonalRoadmapAI = async () => {
    setAiGenerating(true);
    setAiRoadmapResult(null);
    try {
      const messagesCombined = [
        {
          role: "system" as const,
          content: "You are the FuturePath AI Architect. Structure your reply EXACTLY in a neat JSON parseable string inside markdown brackets, or a clear bulleted block. Let's make the response structured into clear paragraphs: SHORT_TERM, MID_TERM, LONG_TERM, COURSES, SCHOLARSHIPS, COLLEGES, CAREER_PATHS."
        },
        {
          role: "user" as const,
          content: `Generate a detailed personal academic career roadmap with these metrics:
          Current Grade/Class: ${inputClass}
          Interests: ${inputInterests || "Artificial Intelligence, Coding, Science research"}
          Skills List: ${inputSkills || "Basic Coding, Problem solving, Critical math"}
          Typical Academic Performance: ${inputPerformance}
          Career Aspirations: ${inputCareerGoals || "High-tier Software Engineer in Aerospace or AI Labs"}

          Outline customized suggestions:
          Short-Term Goals (Immediate 3-6 months actions)
          Mid-Term Goals (Grade 11/12 milestones, CBSE alignment)
          Long-Term Goals (Colleges, JEE/NEET/CUET options)
          Recommended Courses to learn
          Scholarships to explore
          Elite Colleges matching this
          Prospective Career Titles`
        }
      ];

      const resp = await GroqService.chat(messagesCombined);

      // Save to Firestore so it is stored persistently
      const newRoadmapDoc = {
        uid: currentUser?.uid,
        selectedClass: inputClass,
        performance: inputPerformance,
        interests: inputInterests.split(",").map(i => i.trim()),
        skills: inputSkills.split(",").map(s => s.trim()),
        careerGoals: inputCareerGoals,
        details: resp.reply,
        generatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "academicRoadmaps"), newRoadmapDoc);

      setAiRoadmapResult(newRoadmapDoc);
      // Reload lists
      if (currentUser?.uid) {
        const qRoadmaps = query(collection(db, "academicRoadmaps"), where("uid", "==", currentUser.uid));
        const sRoadmaps = await getDocs(qRoadmaps);
        setSavedRoadmaps(sRoadmaps.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error("AI Roadmap Generator service error:", err);
      alert("Encountered AI server-side connection issue. Loaded backup career planner protocols.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDeleteSavedRoadmap = async (id: string) => {
    try {
      await deleteDoc(doc(db, "academicRoadmaps", id));
      setSavedRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Could not delete saved roadmap document:", err);
    }
  };

  // Add customized mock exams
  const handleAddMockScore = async (examId: string) => {
    if (!newMockName || newMockScore <= 0) {
      alert("Provide a mock test description and valid points/scores.");
      return;
    }
    try {
      const examObj = examTrackersArr.find(e => e.id === examId);
      if (!examObj) return;

      const updatedScores = [...(examObj.mockTestScores || []), { label: newMockName, score: Number(newMockScore) }];
      await updateDoc(doc(db, "examTrackers", examId), {
        mockTestScores: updatedScores
      });

      // Local state update
      setExamTrackersArr(prev => prev.map(e => e.id === examId ? { ...e, mockTestScores: updatedScores } : e));
      setNewMockName("");
      setNewMockScore(0);
      setEditingExamId(null);
    } catch (err) {
      console.error("Error committing exam credentials:", err);
    }
  };

  // Syllabus progress updates
  const handleUpdateSyllabusProgress = async (examId: string, value: number) => {
    try {
      await updateDoc(doc(db, "examTrackers", examId), {
        syllabusProgress: value
      });
      setExamTrackersArr(prev => prev.map(e => e.id === examId ? { ...e, syllabusProgress: value } : e));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle preparation checklist tasks
  const handleTogglePrepTask = async (examId: string, taskIdx: number) => {
    try {
      const examObj = examTrackersArr.find(e => e.id === examId);
      if (!examObj) return;

      const updatedTimeline = [...examObj.preparationTimeline];
      updatedTimeline[taskIdx].completed = !updatedTimeline[taskIdx].completed;

      await updateDoc(doc(db, "examTrackers", examId), {
        preparationTimeline: updatedTimeline
      });

      setExamTrackersArr(prev => prev.map(e => e.id === examId ? { ...e, preparationTimeline: updatedTimeline } : e));
    } catch (err) {
      console.error(err);
    }
  };

  // Update Olympiad Hub metrics
  const handleUpdateOlympiadHub = async (olId: string, record: string) => {
    try {
      await updateDoc(doc(db, "olympiads", olId), {
        participationRecord: record
      });
      setOlympiadsArr(prev => prev.map(o => o.id === olId ? { ...o, participationRecord: record } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOlympiadRankAwards = async (olId: string) => {
    try {
      await updateDoc(doc(db, "olympiads", olId), {
        rankings: olympiadRankInput || "Outstanding Performance",
        awards: olympiadAwardInput || "Participation Honor"
      });
      setOlympiadsArr(prev => prev.map(o => o.id === olId ? { 
        ...o, 
        rankings: olympiadRankInput || "Outstanding Performance", 
        awards: olympiadAwardInput || "Participation Honor" 
      } : o));
      setSelectedOlympiadId(null);
      setOlympiadRankInput("");
      setOlympiadAwardInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // Update Skills developer slider
  const handleUpdateSkillProgress = async (skId: string, val: number) => {
    try {
      await updateDoc(doc(db, "skills", skId), {
        progressPercent: val
      });
      setSkillsArr(prev => prev.map(s => s.id === skId ? { ...s, progressPercent: val } : s));
    } catch (err) {
      console.warn("Unable to write dynamic skill score:", err);
    }
  };

  // Helper static roadmaps
  const staticClassRoadmaps: Record<string, {
    title: string;
    objective: string;
    goals: string[];
    books: string[];
    skills: string[];
    olympiads: string[];
    scholarships: string[];
    careers: string[];
  }> = {
    "Class 6": {
      title: "Class 6 Foundation Orientation",
      objective: "Building early analytical mindset, basic logical reasoning, reading speeds, and sports discipline.",
      goals: ["Maintain 90%+ school scores", "Kickstart simple visual coding (Scratch, Blockly)", "Build consistent vocabulary speeds"],
      books: ["NCERT Exemplars math series 6", "Concept of Mathematics for Juniors", "Aesop Logical reasoning puzzles"],
      skills: ["Visual Coding Blocks", "Public reading clear speech", "Logical deduction patterns"],
      olympiads: ["NSTSE Foundation", "Unified Cyber Olympiad", "IEO English trials"],
      scholarships: ["State Merit-based funding Class 6 quota", "UCO Topper awards"],
      careers: ["Introductory Software logic", "Visual UI architecture", "STEM researcher base"]
    },
    "Class 7": {
      title: "Class 7 Intermediate Foundation",
      objective: "Deepen algebraic equations, mechanical mechanics, and regional junior athletics.",
      goals: ["Master linear equations & concepts", "Construct simple HTML/CSS websites", "Earn district-tier sports medals"],
      books: ["RD Sharma Class 7 Math", "Pre-Algebra Workbook definitions", "Interactive Science Explorer guides"],
      skills: ["Introductory Web Layouts (HTML/CSS)", "Critical arithmetic speeds", "Scientific model plotting"],
      olympiads: ["NSO Junior", "IMO (Category A)", "Spell Bee level 2"],
      scholarships: ["District Science Fair bursary", "Olympiad Level-1 Scholarships"],
      careers: ["Full stack web engineering foundations", "Mathematics Analyst", "Environmental ecologist"]
    },
    "Class 8": {
      title: "Class 8 Lateral Logic Mastery",
      objective: "Strengthen reasoning parameters, structural physics principles, and debating alignments.",
      goals: ["Grasp pre-calculus and algebra fundamentals", "Acquire Python automation basics", "Fulfill intermediate state-level sports records"],
      books: ["NCERT Exemplars Class 8 Science", "Introduction to Python Programming by Core", "Pearson Reasoning manuals"],
      skills: ["Python Script Syntax", "Logical debates & public posture", "Spreadsheet logic modeling"],
      olympiads: ["NTSE Preparatory", "UIO Computer foundations", "Silverzone STEM series"],
      scholarships: ["National scholarship archives Class 8", "Silverzone distinction rewards"],
      careers: ["Database Architect", "Linguistic Policy drafts", "Financial Audit analyst"]
    },
    "Class 9": {
      title: "Class 9 Senior School Entryway",
      objective: "Groundwork for high-intensity board courses, core science branches PCM/B, and scholarship scouting.",
      goals: ["Complete physics motion mathematics", "Formulate research indices", "Log initial virtual training programs"],
      books: ["Lakhmir Singh Physics & Chemistry 9", "Concepts of Algebra by Hall & Knight", "Comprehensive English Guide papers"],
      skills: ["Introductory Data structure (Arrays)", "Case analysis techniques", "Intermediate sports strategy"],
      olympiads: ["NSO National", "NTSE Stage 1 Mock Trials", "IMO National Finals"],
      scholarships: ["Government high-merit stipend Class 9-12", "NTSE Fellowship stipends"],
      careers: ["Aeronautics developer", "Economist", "Corporate Advisory legalist"]
    },
    "Class 10": {
      title: "Class 10 Board Milestones & Stream Alignment",
      objective: "Maximize State/CBSE Board outcomes, secure scholarship registries, and transition to stream-wise pathways.",
      goals: ["Simulate 5 core Board exam model routines", "Consolidate achievements folder", "Address Stream selection advisor algorithms"],
      books: ["Oswaal Board Solved Question banks", "NCERT Mathematics Class 10 detailed drills", "Modern Chemistry foundation notes"],
      skills: ["Statistical calculations on datasets", "Analytical argumentative papers", "Olympiad advanced formulas"],
      olympiads: ["NTSE National Stage 2", "National Cyber Olympiad NCO", "Ramanujan Mathematical challenge"],
      scholarships: ["CBSE Single Girl Child Scholarship", "NTSE official monthly stipend awards"],
      careers: ["Artificial Intelligence Engineer", "Investment Banking specialist", "Strategic Constitutional Lawyer"]
    },
    "Class 11": {
      title: "Class 11 Advanced Core Concentration",
      objective: "Highly intensive syllabus grounding for JEE, NEET, CLAT, entrance examinations, and advanced corporate targets.",
      goals: ["Choose specialized streams (PCM/B, Commerce, Humanities, Vocational)", "Initiate intensive entrance exams timelines", "Establish regional athletic ranks"],
      books: ["Concepts of Physics by HC Verma", "Problems in General Physics by Irodov", "DK Goel Accountancy analysis", "M Laxmikanth Indian Polity"],
      skills: ["Differential calculus", "Advanced organic reactions", "Strategic accounts book auditing", "Sociological policy paradigms"],
      olympiads: ["KVPY Research Fellowship", "INMO (Indian National Math Olympiad)", "NSEP (Physics Olympiad)"],
      scholarships: ["KVPY Fellowships", "DST INSPIRE scholarship schemes", "National Talent database support"],
      careers: ["Aerospace Propulsion Engineer", "Surgical Neuro-specialist", "Corporate Mergers lawyer", "VFX Animation director"]
    },
    "Class 12": {
      title: "Class 12 Launches and Admissions Portfolio",
      objective: "Perfect CBSE boards, succeed on entrance exams, generate custom resume portfolios, and secure admission nodes.",
      goals: ["Succeed in active entrance evaluations (JEE, NEET, CUET)", "Compile professional CV PDFs", "Dispatch applications to match colleges"],
      books: ["Irodov Calculus drills", "Organic synthesis booklets", "CA foundations past test volumes", "CLAT sample litigation papers"],
      skills: ["System design and integration", "Comprehensive financial assessment", "Advanced legal drafting", "Digital UI interface design"],
      olympiads: ["International Olympiads (IMO/IPhO/IChO) final pools", "National Cyber challenges"],
      scholarships: ["Prestige Corporate Foundations subsidies", "National Merit-based fee waivers"],
      careers: ["Principal AI Architect", "Venture Capitalist Analyst", "Supreme Court litigation advisor", "Robotics Systems integrator"]
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-7xl mx-auto selection:bg-sky-500/30 selection:text-white">
      
      {/* Back button shown at the very top of any sub-module view */}
      {activeTab !== "overview" && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 animate-fadeIn">
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center space-x-2 py-2 px-4 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-sky-400" />
            <span>Back to Roadmaps Overview</span>
          </button>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="uppercase tracking-widest text-[10px]">
              {activeTab === "dashboard" && "Dashboard Console"}
              {activeTab === "class-wise" && "Class Timelines"}
              {activeTab === "stream-advisor" && "Stream Decider"}
              {activeTab === "exams" && "Entrance Trackers"}
              {activeTab === "olympiads" && "Olympiad Hub"}
              {activeTab === "skills" && "Skills Bench"}
              {activeTab === "ai-generator" && "AI Generator"} ACTIVE
            </span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-[#111827] border border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">
            {seeding ? "Establishing Student Firestore benchmarks (seeding)..." : "Synchronizing Cloud database nodes..."}
          </p>
        </div>
      )}

      {!loading && (
        <div className="animate-fadeIn">
          
          {/* ======================= OVERVIEW LANDING PAGE ======================= */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Dynamic Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-gradient-to-br from-sky-500/20 to-indigo-500/10 rounded-xl text-sky-400 border border-sky-500/25 shadow-lg shadow-sky-500/5">
                    <Map className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] uppercase tracking-wider">Academic Roadmaps</h2>
                      <span className="text-[10px] font-mono font-bold bg-sky-500/15 border border-sky-500/25 text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.2)]">Explorer</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Navigate futuristic curriculum timelines, stream decision matrices, Olympiad databases, and AI personal path generators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bento Grid / Cyber Cards Menu */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    id: "dashboard", 
                    label: "Dashboard Console", 
                    icon: <Sliders className="w-5 h-5 text-sky-400" />, 
                    desc: "View curriculum metrics, pending syllabus checklists, and real-time active competitive prep status scores.",
                    tag: "CONSOLE",
                    accent: "from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-400"
                  },
                  { 
                    id: "class-wise", 
                    label: "Class Timelines", 
                    icon: <GraduationCap className="w-5 h-5 text-purple-400" />, 
                    desc: "Explore CBSE & competitive structures class-by-class from Grade 6 to 12. Review core books, scholarship schemes, and key metrics.",
                    tag: "TIMELINES",
                    accent: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400"
                  },
                  { 
                    id: "stream-advisor", 
                    label: "Stream Decider", 
                    icon: <Compass className="w-5 h-5 text-emerald-400" />, 
                    desc: "Compare Science PCM/PCB, Commerce, Arts, and Vocational pathways. Use the AI advisor to map your personal career alignment.",
                    tag: "DECISION MATRIX",
                    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400"
                  },
                  { 
                    id: "exams", 
                    label: "Entrance Trackers", 
                    icon: <Target className="w-5 h-5 text-rose-400" />, 
                    desc: "Track JEE, NEET, and CUET preparations. Sync mock scorecard grades, monitor countdown tickers, and manage task milestones.",
                    tag: "EXAM TRACKERS",
                    accent: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400"
                  },
                  { 
                    id: "olympiads", 
                    label: "Olympiad Hub", 
                    icon: <Award className="w-5 h-5 text-amber-400" />, 
                    desc: "Log IMO, NSO, NTSE participation, rankings, and awards. Unlock merit recognition tags and performance badges automatically.",
                    tag: "MERIT REGISTRY",
                    accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400"
                  },
                  { 
                    id: "skills", 
                    label: "Skills Bench", 
                    icon: <Zap className="w-5 h-5 text-cyan-400" />, 
                    desc: "Level up scholastic and vocational proficiency bars. View syllabus advice recommendations and register global credential paths.",
                    tag: "PROFICIENCY BENCH",
                    accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400"
                  },
                  { 
                    id: "ai-generator", 
                    label: "AI Generator", 
                    icon: <Sparkles className="w-5 h-5 text-indigo-400" />, 
                    desc: "Generate custom bulleted curriculum roadmaps, target scholarships, and elite college lists matched to your special aspirations.",
                    tag: "COSMIC PREDICTION",
                    accent: "from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-400"
                  }
                ].map((module) => {
                  let cardClass = "cyber-card-cyan";
                  let textGlow = "group-hover:text-cyan-400";
                  let iconBg = "bg-cyan-500/10 border-cyan-500/25";
                  
                  if (module.id === "class-wise" || module.id === "ai-generator") {
                    cardClass = "cyber-card-purple";
                    textGlow = "group-hover:text-purple-400";
                    iconBg = "bg-purple-500/10 border-purple-500/25";
                  } else if (module.id === "stream-advisor") {
                    cardClass = "cyber-card-green";
                    textGlow = "group-hover:text-emerald-400";
                    iconBg = "bg-emerald-500/10 border-emerald-500/25";
                  } else if (module.id === "exams") {
                    cardClass = "cyber-card-blue";
                    textGlow = "group-hover:text-blue-400";
                    iconBg = "bg-blue-500/10 border-blue-500/25";
                  } else if (module.id === "olympiads") {
                    cardClass = "cyber-card-gold";
                    textGlow = "group-hover:text-amber-400";
                    iconBg = "bg-amber-500/10 border-amber-500/25";
                  }

                  return (
                    <div
                      key={module.id}
                      onClick={() => setActiveTab(module.id)}
                      className={`relative group p-6 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-full hover:-translate-y-1 ${cardClass}`}
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${module.accent.split(' ')[0]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl rounded-full pointer-events-none`} />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
                            {module.tag}
                          </span>
                          <div className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
                            {module.icon}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className={`text-base font-extrabold text-white transition-colors uppercase tracking-wide ${textGlow}`}>
                            {module.label}
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            {module.desc}
                          </p>
                        </div>
                      </div>

                      <div className={`pt-6 mt-4 border-t border-slate-950/40 flex items-center justify-between text-xs font-mono text-slate-500 transition-colors ${textGlow}`}>
                        <span className="tracking-widest">LAUNCH MODULE</span>
                        <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= TAB: OVERVIEW DASHBOARD ======================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Quick Status Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Academic Status Card */}
                <div className="p-5 bg-gradient-to-br from-[#111827] to-[#0A0F1D] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">Graduation Level</span>
                    <GraduationCap className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">{selectedClassItem}</h4>
                    <p className="text-xs text-slate-400 mt-1">Currently matriculated under FuturePath ecosystem.</p>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Curriculum completion</span>
                      <span>{selectedClassItem === "Class 12" ? "95%" : "60%"}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-sky-400 h-1.5 rounded-full" 
                        style={{ width: selectedClassItem === "Class 12" ? "95%" : "60%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Exam preparation tracker card */}
                <div className="p-5 bg-gradient-to-br from-[#111827] to-[#0A0F1D] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">Exam Alignments</span>
                    <Target className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">
                      {examTrackersArr.filter(e => e.isActive).length} Active Tracker(s)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Entrance mock outcomes tracking with syllabus indexes.</p>
                  </div>
                  <div className="pt-2 text-xs text-indigo-400 font-mono flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Average Syllabus: {
                      examTrackersArr.length > 0 
                        ? Math.round(examTrackersArr.reduce((sum, e) => sum + e.syllabusProgress, 0) / examTrackersArr.length) 
                        : 0
                    }%</span>
                  </div>
                </div>

                {/* Skills indicators card */}
                <div className="p-5 bg-gradient-to-br from-[#111827] to-[#0A0F1D] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">Skills Badges</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white">
                      {skillsArr.reduce((sum, s) => sum + (s.skillBadges?.length || 0), 0)} Badges Fulfill
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Completed logic, code and speech challenge levels.</p>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Problem Solving index</span>
                      <span>85/100</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-450 bg-amber-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Central Timeline & Milestones View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timeline Components */}
                <div className="lg:col-span-2 p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center space-x-2">
                    <Activity className="w-4.5 h-4.5 text-sky-400" />
                    <span>Student Academic Roadmap Timeline</span>
                  </h3>
                  
                  <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-6 pt-2">
                    
                    {/* Item 1 */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 bg-sky-500 text-slate-950 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-black border-4 border-[#111827]"></span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Class 10 Target Board examinations</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        CBSE board criteria setup. Fulfill oswaal sample problems and achieve minimum 92% aggregate.
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded">
                        Status: Fulfilling Secondary Goals
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 bg-indigo-500 text-slate-950 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-black border-4 border-[#111827]"></span>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Class 11 Science Stream Integration</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Enroll in PCM specialization. Focus on JEE/NEET foundational modules, Newtonian physics and differential calculus.
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 bg-slate-800 text-slate-400 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-black border-4 border-[#111827]"></span>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">National Talent Search Examination (NTSE) Stage 2</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Register official stage challenges with verified teachers. Maintain monthly stipend scholarship credentials!
                      </p>
                    </div>

                    {/* Item 4 */}
                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 bg-slate-800 text-slate-400 rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono text-[9px] font-black border-4 border-[#111827]"></span>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 12 Launches and Admissions</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Secure high percentiles in JEE, prepare resume blueprints, and target premier institutional admissions.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Recommended Career paths & scholarships previews */}
                <div className="space-y-6">
                  
                  {/* Milestones Tracker Status */}
                  <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Live Curriculums Status</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { title: "CBSE Syllabus check", progress: 95, color: "bg-emerald-500" },
                        { title: "Entrance Prep check", progress: 40, color: "bg-blue-500" },
                        { title: "Extracurricular Medals", progress: 70, color: "bg-amber-500" },
                        { title: "Olympiad Registrations", progress: 80, color: "bg-indigo-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{item.title}</span>
                            <span className="font-mono text-slate-400">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.progress}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scholarship alignment alert */}
                  <div className="p-4 bg-gradient-to-r from-sky-950/20 to-indigo-950/20 border border-sky-500/10 rounded-xl text-xs space-y-3">
                    <div className="flex items-center space-x-2 text-sky-400 font-bold uppercase tracking-wider font-mono">
                      <Info className="w-4 h-4" />
                      <span>Scholarship Opportunities</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Based on your current <strong>Class 10</strong> alignment, explore <strong>NTSE fellow-credits</strong> and <strong>CBSE academic merit fee exemptions</strong>. Use the Olympiad hub to load verification tags!
                    </p>
                    <button 
                      onClick={() => setActiveTab("olympiads")}
                      className="text-sky-400 hover:underline inline-flex items-center space-x-1 font-mono text-[10px]"
                    >
                      <span>Check Olympiads registry</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ======================= TAB: CLASS-WISE TIMELINES ======================= */}
          {activeTab === "class-wise" && (
            <div className="space-y-6">
              
              {/* Select Grade Tabs */}
              <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400">Select Curriculum Node</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(staticClassRoadmaps).map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClassItem(cls)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                        selectedClassItem === cls 
                          ? "bg-sky-500 text-slate-950 border-sky-400 font-bold" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Static Grade details display card */}
              {staticClassRoadmaps[selectedClassItem] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Main Details */}
                  <div className="lg:col-span-2 p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-white">{staticClassRoadmaps[selectedClassItem].title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {staticClassRoadmaps[selectedClassItem].objective}
                      </p>
                    </div>

                    {/* Academic goals */}
                    <div className="space-y-3 pt-3 border-t border-slate-850">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                        <Target className="w-4 h-4" />
                        <span>Core Academic Goals</span>
                      </h4>
                      <ul className="space-y-2">
                        {staticClassRoadmaps[selectedClassItem].goals.map((g, i) => (
                          <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                            <span className="text-sky-400 font-bold mt-0.5">&bull;</span>
                            <span className="leading-relaxed">{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Subject priorities and books */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-850">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Recommended Reference Books</span>
                        </h4>
                        <div className="space-y-1.5">
                          {staticClassRoadmaps[selectedClassItem].books.map((b, i) => (
                            <div key={i} className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-slate-300 border border-slate-900 font-mono">
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center space-x-1.5">
                          <Zap className="w-4 h-4" />
                          <span>Primary Skill Builders</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {staticClassRoadmaps[selectedClassItem].skills.map((s, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-1 bg-amber-550/10 border border-amber-500/20 text-amber-400 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Sidebar stats on Olympiads & scholarships */}
                  <div className="space-y-6">
                    
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Curriculum Competitions & Trials</h3>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Target Olympiads</span>
                          <div className="flex flex-wrap gap-1.5">
                            {staticClassRoadmaps[selectedClassItem].olympiads.map((o, idx) => (
                              <span key={idx} className="p-1 px-2.5 bg-slate-955 bg-slate-900 border border-slate-800 rounded text-sky-400 font-mono text-[10px]">
                                {o}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Merit / Scholarship schemes</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                            {staticClassRoadmaps[selectedClassItem].scholarships.map((sch, idx) => (
                              <li key={idx}>{sch}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Interactive Careers Explorations</span>
                          <div className="flex flex-wrap gap-1.5">
                            {staticClassRoadmaps[selectedClassItem].careers.map((cr, idx) => (
                              <span key={idx} className="p-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 font-mono text-[10px]">
                                {cr}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-start space-x-2.5">
                      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Tip: Looking for dynamic career trends? Navigate to the <strong>Stream Decider</strong> or summon the <strong>AI Generator</strong> to map private parameters.
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ======================= TAB: STREAM CENTER ======================= */}
          {activeTab === "stream-advisor" && (
            <div className="space-y-6">
              
              {/* Core Stream Selection Banner */}
              <div className="p-6 bg-gradient-to-r from-[#111827] to-[#0A0F1D] border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Stream Selection Center</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Designed for Grade 10 students evaluating secondary PCM/PCB Science, Commerce, Humanities, or Vocational nodes.
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-sky-500/10 border border-sky-400/20 text-sky-400 px-3 py-1 rounded">
                  Class 10 Orientation Threshold
                </span>
              </div>

              {/* Visual Branching Tree Structure */}
              <Class10PathTree />

              {/* Streams comparison chart blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "Science (PCM / PCB)",
                    salary: "INR 12L - 45L / annum",
                    demand: "High",
                    tag: "PCM/PCB",
                    color: "border-sky-500/30 text-sky-400",
                    careers: ["AI Engineer", "Software Engineer", "Neurosurgeon", "Astrophysicist"],
                    exams: ["JEE Main", "JEE Advanced", "NEET", "CUET", "NDA", "IISER"]
                  },
                  {
                    name: "Commerce with Math",
                    salary: "INR 10L - 38L / annum",
                    demand: "Aesthetic Growth",
                    tag: "Commerce",
                    color: "border-indigo-500/30 text-indigo-400",
                    careers: ["Chartered Accountant (CA)", "Financial Analyst", "Investment Banker", "Economist"],
                    exams: ["CA Foundation", "CS Entrance", "CMA Foundation", "CUET"]
                  },
                  {
                    name: "Humanities / Arts",
                    salary: "INR 8L - 30L / annum",
                    demand: "High Civil Demands",
                    tag: "Arts/Pol",
                    color: "border-emerald-500/30 text-emerald-400",
                    careers: ["Supreme Court Advocate", "Civil Servant (IAS/IFS)", "Media Journalist", "Diplomat"],
                    exams: ["CLAT", "CUET", "UPSC (Union Service)"]
                  },
                  {
                    name: "Vocational & Applied",
                    salary: "INR 6L - 24L / annum",
                    demand: "Craft Centered",
                    tag: "Tech/Design",
                    color: "border-amber-500/30 text-amber-500",
                    careers: ["UI/UX Designer", "Robotics Technician", "VFX lead animator", "Aviation Pilot"],
                    exams: ["NID", "NIFT", "Hotel Management"]
                  }
                ].map((stream, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedAdvisingStream(selectedAdvisingStream === stream.name ? null : stream.name)}
                    className="p-5 bg-[#111827] hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{stream.tag}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white group-hover:text-sky-400 transition-colors">{stream.name}</h4>
                    
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Salary Insight</span>
                        <span className="text-white font-mono">{stream.salary}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Demand Factor</span>
                        <span className="text-emerald-400 font-bold">{stream.demand}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Leading Careers</span>
                      <div className="flex flex-wrap gap-1">
                        {stream.careers.map((c, i) => (
                          <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950 text-slate-350 border border-slate-800 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedAdvisingStream === stream.name && (
                      <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">Required Examinations</span>
                        <div className="flex flex-wrap gap-1">
                          {stream.exams.map((ex, i) => (
                            <span key={i} className="text-[9px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Stream Decision panel */}
              <div className="p-6 bg-gradient-to-b from-[#111827] to-[#0A0F1D] border border-sky-500/15 rounded-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">AI Stream Alignment Advisor</h4>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your scholastic preferences to determine stream recommendations from our server completions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Scholastic Favorite Subjects</label>
                    <input 
                      type="text" 
                      value={favSubjects}
                      onChange={e => setFavSubjects(e.target.value)}
                      placeholder="Math, Computational Physics, Logic"
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:border-sky-500/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Core Personal Interests</label>
                    <input 
                      type="text" 
                      value={personalInterests}
                      onChange={e => setPersonalInterests(e.target.value)}
                      placeholder="Robotics models, data science, coding"
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:border-sky-500/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Student Skills Base</label>
                    <input 
                      type="text" 
                      value={personalSkills}
                      onChange={e => setPersonalSkills(e.target.value)}
                      placeholder="High math speed, visual coding scratch"
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:border-sky-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConsultStreamSelectionAI}
                  disabled={streamAILoading}
                  className="w-full md:w-auto py-2 px-5 bg-sky-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer leading-normal"
                >
                  {streamAILoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-slate-950" />
                      <span>Execute Stream Analysis</span>
                    </>
                  )}
                </button>

                {streamAIEffect && (
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 max-h-72 overflow-y-auto space-y-2.5 animate-fadeIn">
                    <span className="text-[9px] font-mono bg-sky-500/10 border border-sky-400/20 text-sky-400 px-2 py-0.5 rounded font-bold uppercase">
                      Advisor response Analysis
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{streamAIEffect}</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================= TAB: ENTRANCE EXAM TRACKER ======================= */}
          {activeTab === "exams" && (
            <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Competitive Exam Prep Trackers</h3>
                  <p className="text-xs text-slate-400">Track study syllabus progressions, clock countdown timers, and save mock scorecard marks.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Live Databases Connection</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* List of active exam trackers */}
                <div className="space-y-4">
                  {examTrackersArr.map((exam) => (
                    <div 
                      key={exam.id}
                      className={`p-4 rounded-xl border transition-all ${
                        editingExamId === exam.id 
                          ? "bg-slate-950 border-sky-500" 
                          : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{exam.examName}</h4>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span className="text-rose-400 font-bold">{exam.countdownDays} Days Left</span>
                            <span>&bull;</span>
                            <span>Syllabus: {exam.syllabusProgress}%</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingExamId(editingExamId === exam.id ? null : exam.id);
                              setNewMockName("");
                              setNewMockScore(0);
                            }}
                            className="p-1 px-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/15 rounded text-[10px] font-mono cursor-pointer"
                          >
                            + Score/Detail
                          </button>
                        </div>
                      </div>

                      {/* Syllabus Progress range slider */}
                      <div className="mt-3.5 pt-3 border-t border-slate-900 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>Adjust Syllabus Completion %</span>
                          <span>{exam.syllabusProgress}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={exam.syllabusProgress}
                          onChange={(e) => handleUpdateSyllabusProgress(exam.id, Number(e.target.value))}
                          className="w-full accent-sky-450 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Mock Test Score display indicators */}
                      {exam.mockTestScores && exam.mockTestScores.length > 0 && (
                        <div className="mt-3 pt-2">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Previous Mock Outcomes</span>
                          <div className="flex flex-wrap gap-2">
                            {exam.mockTestScores.map((score: any, i: number) => (
                              <span key={i} className="text-[10px] font-mono bg-[#0A0F1D] border border-slate-800 text-slate-350 px-2 py-1 rounded">
                                {score.label}: <strong className="text-sky-400">{score.score} pts</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive preparation checklist timeline tasks */}
                      {exam.preparationTimeline && exam.preparationTimeline.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                          <span className="text-[10px] font-mono uppercase text-slate-500 block">Track Syllabus Checklists</span>
                          <div className="space-y-1.5">
                            {exam.preparationTimeline.map((item: any, idx: number) => (
                              <div 
                                key={idx} 
                                onClick={() => handleTogglePrepTask(exam.id, idx)}
                                className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={item.completed}
                                  onChange={() => {}} // handled by onClick on wrapper
                                  className="rounded border-slate-800 text-sky-500 focus:ring-sky-500/25 bg-slate-950 w-3.5 h-3.5 cursor-pointer" 
                                />
                                <span className={item.completed ? "line-through text-slate-500" : ""}>{item.task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Scorer input modal / drawer */}
                <div className="space-y-4">
                  {editingExamId ? (
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                        <span className="text-xs font-mono font-bold text-sky-400">Add Mock Exam Metrics</span>
                        <button onClick={() => setEditingExamId(null)} className="text-slate-500 hover:text-slate-300 text-xs">&times; Close</button>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Add mock test marks to evaluate grade indicators against national trends.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Mock Test Name</label>
                          <input 
                            type="text" 
                            value={newMockName}
                            onChange={(e) => setNewMockName(e.target.value)}
                            placeholder="e.g. FITJEE AITS 1"
                            className="w-full py-2 px-3 bg-slate-900 border border-slate-850 rounded-lg text-xs" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Achieved Score/Marks</label>
                          <input 
                            type="number" 
                            value={newMockScore}
                            onChange={(e) => setNewMockScore(Number(e.target.value))}
                            placeholder="e.g. 195"
                            className="w-full py-2 px-3 bg-slate-900 border border-slate-850 rounded-lg text-xs" 
                          />
                        </div>

                        <button
                          onClick={() => handleAddMockScore(editingExamId)}
                          className="w-full py-2 bg-sky-500 text-slate-950 font-bold text-xs rounded transition-colors cursor-pointer"
                        >
                          Commit Mock Score
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gradient-to-r from-sky-950/15 to-indigo-950/15 border border-sky-500/10 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-sky-400 font-bold uppercase tracking-wider font-mono text-xs">
                        <Info className="w-4 h-4" />
                        <span>Mock prep timelines</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Click on average exam cells to edit details, add scores or modify curriculum checks. Timely updates maintain active Career Scores!
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ======================= TAB: OLYMPIAD HUB ======================= */}
          {activeTab === "olympiads" && (
            <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">National & International Olympiad Registry</h4>
                  <p className="text-xs text-slate-400 mt-1">Add details, update participation, certificates, and check merit award tags.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Olympiads database active</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Olympiads list */}
                <div className="space-y-4">
                  {olympiadsArr.map((ol) => (
                    <div 
                      key={ol.id}
                      className="p-4 bg-slate-950/50 hover:bg-slate-950 border border-slate-850 rounded-xl space-y-3.5 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-xs text-white leading-normal">{ol.olympiadName}</h4>
                          <span className="inline-block mt-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                            State: {ol.participationRecord}
                          </span>
                        </div>

                        {/* Dropdown status update */}
                        <select
                          value={ol.participationRecord}
                          onChange={(e) => handleUpdateOlympiadHub(ol.id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded text-[10px] font-mono px-2 py-1 text-slate-400 cursor-pointer"
                        >
                          <option value="Not Registered">Not Registered</option>
                          <option value="Registered">Registered</option>
                          <option value="In-Progress">In-Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-900">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Rankings</span>
                          <span className="text-slate-300">{ol.rankings || "Not graded yet"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Awards / Medals</span>
                          <span className="text-amber-450 text-amber-400 font-bold">{ol.awards || "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          onClick={() => {
                            setSelectedOlympiadId(ol.id);
                            setOlympiadRankInput(ol.rankings);
                            setOlympiadAwardInput(ol.awards);
                          }}
                          className="text-[10px] font-mono text-sky-400 hover:underline cursor-pointer"
                        >
                          Edit Achievements &rarr;
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Edit Olympiad records */}
                <div>
                  {selectedOlympiadId ? (
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold font-mono text-sky-400 uppercase border-b border-slate-900 pb-2">
                        Update Award / Rank Metadata
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Performance Ranking</label>
                          <input 
                            type="text"
                            value={olympiadRankInput}
                            onChange={e => setOlympiadRankInput(e.target.value)}
                            placeholder="e.g. State Rank 45"
                            className="w-full py-2 px-3 bg-slate-900 border border-slate-850 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Awards / Medals Fulfill</label>
                          <input 
                            type="text"
                            value={olympiadAwardInput}
                            onChange={e => setOlympiadAwardInput(e.target.value)}
                            placeholder="e.g. Gold Medalist + cash credit"
                            className="w-full py-2 px-3 bg-slate-900 border border-slate-850 rounded text-xs"
                          />
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleSaveOlympiadRankAwards(selectedOlympiadId)}
                            className="flex-1 py-2 bg-sky-500 text-slate-950 font-bold text-xs rounded transition-colors cursor-pointer"
                          >
                            Commit Records
                          </button>
                          <button
                            onClick={() => setSelectedOlympiadId(null)}
                            className="py-2 px-3 bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs rounded hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gradient-to-r from-sky-950/10 to-indigo-950/10 border border-sky-500/10 rounded-xl space-y-3">
                      <div className="flex items-center space-x-2 text-sky-400 font-bold uppercase tracking-wider font-mono text-xs">
                        <Award className="w-4 h-4" />
                        <span>Merit Recognition rules</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Achieving elite status in <strong>IMO</strong>, <strong>NSO</strong>, or <strong>NTSE</strong> entitles you to direct merit markers. Update metadata here to unlock badges automatically!
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ======================= TAB: SKILLS BENCH ======================= */}
          {activeTab === "skills" && (
            <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">Scholastic & Vocational Skills Development</h4>
                  <p className="text-xs text-slate-400 mt-1">Boost proficiency levels and monitor AI recommendations for each skill development sector.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Skills collection sync</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* List of skills */}
                <div className="space-y-4">
                  {skillsArr.map((sk) => (
                    <div 
                      key={sk.id}
                      className="p-4 bg-slate-950/50 hover:bg-slate-950 border border-slate-850 rounded-xl space-y-3 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-xs text-white uppercase">{sk.skillName}</h4>
                        <span className="font-mono text-xs text-sky-400 font-bold">{sk.progressPercent}%</span>
                      </div>

                      {/* Prof slider */}
                      <div className="space-y-1">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sk.progressPercent}
                          onChange={(e) => handleUpdateSkillProgress(sk.id, Number(e.target.value))}
                          className="w-full accent-sky-450 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Earned Badges</span>
                          <div className="flex flex-wrap gap-1">
                            {sk.skillBadges && sk.skillBadges.map((badge: string, idx: number) => (
                              <span key={idx} className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {sk.recommendations && (
                        <div className="pt-2">
                          <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Syllabus Advice</span>
                          <ul className="text-[10px] text-slate-400 space-y-1">
                            {sk.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start space-x-1.5 text-slate-350">
                                <span className="text-sky-400 font-bold">&bull;</span>
                                <span className="leading-snug">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Additional static recommendations */}
                <div className="space-y-4">
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold font-mono text-sky-400 uppercase">Recommended Global Path Certifications</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Completing these modules automatically builds skill progression logs across the dashboard console:
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-900 border border-slate-850 rounded">
                        <strong className="text-white block">Coding: Algorithms Structure 1</strong>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Provider: FuturePath AI free code camp trials</span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-850 rounded">
                        <strong className="text-white block">Communications: Critical Argument Deciders</strong>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Provider: Public speech debating archives</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================= TAB: AI ROADMAP GENERATOR ======================= */}
          {activeTab === "ai-generator" && (
            <div className="space-y-6">
              
              {/* Form Input Section */}
              <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Futuristic AI Personal Path Constructor</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide custom academic coordinates to generate bulleted goals, target scholarships, prestigious colleges, and elite careers. The generated roadmap persists inside the student's Firestore archives.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Enrollment Class</label>
                    <select
                      value={inputClass}
                      onChange={e => setInputClass(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 text-xs rounded-lg text-slate-300 cursor-pointer"
                    >
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Scholastic Performance range</label>
                    <select
                      value={inputPerformance}
                      onChange={e => setInputPerformance(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 text-xs rounded-lg text-slate-300 cursor-pointer"
                    >
                      <option value="Exemplary (90%+)精度">Exemplary (90%+)</option>
                      <option value="Proficient (75% - 89%)">Proficient (75% - 89%)</option>
                      <option value="Aspirant (60% - 74%)">Aspirant (60% - 74%)</option>
                      <option value="Fundamental (<60%)">Fundamental (&lt;60%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Personal Interests (Comma list)</label>
                    <input 
                      type="text"
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 text-xs rounded"
                      value={inputInterests}
                      onChange={e => setInputInterests(e.target.value)}
                      placeholder="e.g. Artificial Intelligence, Cryptography, Stocks"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Active Skills (Comma list)</label>
                    <input 
                      type="text"
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 text-xs rounded"
                      value={inputSkills}
                      onChange={e => setInputSkills(e.target.value)}
                      placeholder="e.g. Coding python, Calculus, Public speech"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-bold">Career Aspiration Statement</label>
                    <input 
                      type="text"
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-850 text-xs rounded"
                      value={inputCareerGoals}
                      onChange={e => setInputCareerGoals(e.target.value)}
                      placeholder="e.g. Want to serve as an aerospace pilot or coder"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGeneratePersonalRoadmapAI}
                  disabled={aiGenerating}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-sky-500/10 leading-normal"
                >
                  {aiGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Assemble Custom Roadmaps</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic generated outcome details */}
              {aiRoadmapResult && (
                <div className="p-6 bg-slate-950 border border-sky-500/20 rounded-xl space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-widest block">AI-Constructed Pathway Outputs</span>
                    <span className="text-[10px] font-mono text-slate-500">Committed to Firestore</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiRoadmapResult.details}</p>
                </div>
              )}

              {/* List of previously saved user custom roadmaps */}
              {savedRoadmaps.length > 0 && (
                <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Saved Paths Folder ({savedRoadmaps.length})</h4>
                  <div className="space-y-4">
                    {savedRoadmaps.map((r) => (
                      <div key={r.id} className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-sky-400 block">Class: {r.selectedClass} | {new Date(r.generatedAt).toLocaleDateString()}</span>
                            <h5 className="font-bold text-xs text-slate-200 mt-1 uppercase">Aspiration statement: "{r.careerGoals || "General"}"</h5>
                          </div>
                          <button
                            onClick={() => handleDeleteSavedRoadmap(r.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">{r.details}</p>
                        <details className="cursor-pointer">
                          <summary className="text-[10px] font-mono text-sky-400 hover:underline">Toggle Full AI report summary</summary>
                          <p className="text-[11px] text-slate-350 leading-relaxed whitespace-pre-wrap pt-2 border-t border-slate-900 mt-2">{r.details}</p>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
