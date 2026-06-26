import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  collection, query, where, getDocs, addDoc, deleteDoc, doc 
} from "firebase/firestore";
import { SportsMilestone } from "../types";
import { 
  Trophy, Medal, Plus, Trash2, FileText, Star, Loader2, Sparkles, 
  ChevronRight, Compass, Shield, Activity, DollarSign, Dumbbell, Play, Tablet, Target, Flame
} from "lucide-react";
import { OUTDOOR_SPORTS, INDOOR_SPORTS, ESPORTS, SportPathway } from "./SportsPathCatalog";

export const SportsCorridor: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Tab control: 'ledger' | 'outdoor' | 'indoor' | 'esports'
  const [activeSegment, setActiveSegment] = useState<"ledger" | "outdoor" | "indoor" | "esports">("ledger");

  // Ledger States
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportName, setSportName] = useState("Cricket");
  const [achievements, setAchievements] = useState("");
  const [medalsCount, setMedalsCount] = useState(1);
  const [nationalRank, setNationalRank] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSportsResume, setShowSportsResume] = useState(false);

  // Roadmaps selected items
  const [selectedOutdoorSportId, setSelectedOutdoorSportId] = useState<string>("cricket");
  const [selectedIndoorSportId, setSelectedIndoorSportId] = useState<string>("chess");
  const [selectedEsportId, setSelectedEsportId] = useState<string>("bgmi");

  useEffect(() => {
    if (currentUser?.uid) {
      const cachedSports = localStorage.getItem(`fp_sports_${currentUser.uid}`);
      if (cachedSports) {
        setMilestones(JSON.parse(cachedSports));
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchMilestones = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const hasCache = localStorage.getItem(`fp_sports_${currentUser.uid}`) !== null;
    if (!hasCache) {
      setLoading(true);
    }
    try {
      const q = query(collection(db, "sports"), where("uid", "==", currentUser.uid));
      
      // Promise race with 800ms timeout fallback
      const snap = await Promise.race([
        getDocs(q),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 800)
        )
      ]);

      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMilestones(list);
      localStorage.setItem(`fp_sports_${currentUser.uid}`, JSON.stringify(list));
    } catch (err) {
      console.error("Error reading sports stats:", err);
      handleFirestoreError(err, OperationType.GET, "sports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [currentUser]);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!achievements) {
      alert("Please specify the medal structure or event level!");
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        uid: currentUser.uid,
        sportName,
        achievements,
        medalsCount: Number(medalsCount),
        nationalRank: nationalRank || "N/A",
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "sports"), data);
      setAchievements("");
      setNationalRank("");
      await fetchMilestones();
    } catch (err) {
      console.error("Error saving sports metric:", err);
      handleFirestoreError(err, OperationType.CREATE, "sports");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!window.confirm("Verify: Purge this tournament medal card from archives?")) return;
    try {
      await deleteDoc(doc(db, "sports", id));
      await fetchMilestones();
    } catch (err) {
      console.error("Error deleting sports metric:", err);
      handleFirestoreError(err, OperationType.DELETE, `sports/${id}`);
    }
  };

  const handlePrintSportsResume = () => {
    window.print();
  };

  const SPORTS_CATEGORIES = [
    "Cricket", "Football", "Hockey", "Kabaddi", "Volleyball", "Basketball", "Tennis", "Athletics", "Archery", "Shooting", "Wrestling", "Boxing", "Chess", "Table Tennis", "Badminton"
  ];

  // Pick active pathways based on sport IDs
  const activeOutdoorSport = OUTDOOR_SPORTS.find(s => s.id === selectedOutdoorSportId) || OUTDOOR_SPORTS[0];
  const activeIndoorSport = INDOOR_SPORTS.find(s => s.id === selectedIndoorSportId) || INDOOR_SPORTS[0];
  const activeEsport = ESPORTS.find(s => s.id === selectedEsportId) || ESPORTS[0];

  return (
    <div className="space-y-6 text-slate-100 font-sans selection:bg-yellow-500/30 selection:text-white">
      
      {/* Top Main Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-xl text-yellow-500 border border-yellow-500/25 shadow-lg shadow-yellow-500/5">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.35)] uppercase tracking-wider">Sports & Athletic Corridor</h2>
              <span className="text-[10px] font-mono font-bold bg-yellow-500/15 border border-yellow-500/25 text-yellow-500 uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.2)] animate-pulse">Pro</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dual-career academy selection routes, level-by-level athletic flowcharts, and electronic verified sports resumes.
            </p>
          </div>
        </div>

        {/* Modular Segment Selectors */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ledger", label: "My Sports Ledger", icon: <Medal className="w-3.5 h-3.5" /> },
            { id: "outdoor", label: "Outdoor Roadmaps", icon: <Activity className="w-3.5 h-3.5" /> },
            { id: "indoor", label: "Indoor Roadmaps", icon: <Target className="w-3.5 h-3.5" /> },
            { id: "esports", label: "Esports Arena", icon: <Play className="w-3.5 h-3.5" /> }
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => {
                setActiveSegment(seg.id as any);
                setShowSportsResume(false);
              }}
              className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                activeSegment === seg.id && !showSportsResume
                  ? "bg-yellow-500 text-slate-950 border-yellow-405 font-bold shadow-md shadow-yellow-500/20" 
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {seg.icon}
              <span>{seg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================= PAGE: MY SPORTS LEDGER (EXISTING FEATURES) ======================= */}
      {activeSegment === "ledger" && (
        <div className="animate-fadeIn">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowSportsResume(!showSportsResume)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-450 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95 cursor-pointer shadow-md shadow-yellow-500/10"
            >
              <FileText className="w-4 h-4" />
              <span>{showSportsResume ? "Hide Ledger Resume" : "Generate Sports Resume"}</span>
            </button>
          </div>

          {!showSportsResume ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left panel: Log tournament achievement formulation */}
              <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4 h-fit">
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Log Tournament Achievement
                  </h3>
                </div>

                <form onSubmit={handleAddMilestone} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Sport Discipline
                    </label>
                    <select
                      value={sportName}
                      onChange={(e) => setSportName(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-350 focus:border-yellow-500/60 focus:outline-none cursor-pointer"
                    >
                      {SPORTS_CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Medal & Event Description
                    </label>
                    <input
                      type="text"
                      value={achievements}
                      onChange={(e) => setAchievements(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-yellow-500/60 focus:outline-none rounded-lg text-xs text-slate-300"
                      placeholder="e.g. Gold medal CBSE Regional Track event (100m sprint)"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Medals / Trophy Count
                      </label>
                      <input
                        type="number"
                        value={medalsCount}
                        onChange={(e) => setMedalsCount(Math.max(1, Number(e.target.value)))}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 focus:border-yellow-500/60 focus:outline-none rounded-lg text-xs"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        State / National Rank
                      </label>
                      <input
                        type="text"
                        value={nationalRank}
                        onChange={(e) => setNationalRank(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 focus:border-yellow-500/60 focus:outline-none rounded-lg text-xs"
                        placeholder="e.g. Under-16 No. 4 State"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-450 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-lg shadow-yellow-500/10 leading-normal"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-slate-950" />
                        <span>Upload Milestone Entry</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Panel: Display Logged Athletic Medallions Table */}
              <div className="lg:col-span-2 p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Medal className="w-4 h-4 text-yellow-405 text-yellow-550" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Logged Athletic Medallions
                  </h3>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Decompressing records...</span>
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-52 p-4 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
                    <Trophy className="w-8 h-8 text-slate-700 mb-2" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No Athletic entries logged yet</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Enforce target scores to calibrate dual-career recommendation matrices.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-slate-500 text-[10px] uppercase tracking-wider">
                          <th className="py-2.5 px-3">Discipline</th>
                          <th className="py-2.5 px-3">Medal description</th>
                          <th className="py-2.5 px-3 text-center">Count</th>
                          <th className="py-2.5 px-3">Rank Level</th>
                          <th className="py-2.5 px-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {milestones.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-900/35 transition-colors">
                            <td className="py-3 px-3 font-semibold text-white">{m.sportName}</td>
                            <td className="py-3 px-3 text-slate-350">{m.achievements}</td>
                            <td className="py-3 px-3 text-center font-mono text-yellow-405 text-yellow-400 font-bold">{m.medalsCount}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] font-mono whitespace-nowrap">
                                {m.nationalRank}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleDeleteMilestone(m.id)}
                                className="p-1 px-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/30 hover:border-red-500/30 rounded transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Sports Resume Printable Template (Aesthetic Slate Frame) */
            <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl space-y-6 max-w-4xl mx-auto shadow-2xl relative print:border-none print:shadow-none print:bg-white print:text-black">
              <div className="absolute top-0 right-0 p-8 text-yellow-500/5 mix-blend-screen pointer-events-none">
                <Trophy className="w-48 h-48 rotate-12" />
              </div>

              <div className="border-b border-slate-800 pb-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-widest uppercase mb-1">ATHLETIC DUAL RESUME</h3>
                    <p className="text-xs text-yellow-500 tracking-wider font-mono">FuturePath AI Certified Athletic Ledger</p>
                  </div>
                  <button 
                    onClick={handlePrintSportsResume}
                    className="px-4 py-2 bg-yellow-500 text-slate-950 font-bold text-xs uppercase rounded hover:bg-yellow-450 print:hidden cursor-pointer"
                  >
                    Print Ledger
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs font-mono text-slate-350">
                  <div><span className="text-slate-500">ATHLETE:</span> <span className="font-bold text-white">{currentUser?.displayName || "Node Participant"}</span></div>
                  <div><span className="text-slate-500">CLEARANCE:</span> <span className="text-emerald-400">Class 10 Standard</span></div>
                  <div><span className="text-slate-500">ACADEME:</span> <span className="text-white">India Central Board</span></div>
                  <div><span className="text-slate-500">LEDGER DATE:</span> <span className="text-white">{new Date().toLocaleDateString()}</span></div>
                </div>
              </div>

              {/* Verified Achievements lists */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase text-slate-500 tracking-widest border-b border-slate-900 pb-1">Verified Competition Milestones:</h4>
                {milestones.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No verified milestones in ledger archives.</p>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-start p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm text-yellow-400 uppercase tracking-wide flex items-center space-x-1.5">
                            <Star className="w-3.5 h-3.5 fill-current text-yellow-550" />
                            <span>{m.sportName}</span>
                          </h5>
                          <p className="text-xs text-slate-300">{m.achievements}</p>
                        </div>
                        
                        <div className="text-right text-xs font-mono">
                          <div><span className="text-slate-500">RANK:</span> <span className="text-white font-bold">{m.nationalRank}</span></div>
                          <div><span className="text-slate-500">GOLD/MEDALS:</span> <span className="text-white font-bold">{m.medalsCount}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic advice */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-450" />
                  <span>Career Path Compatibility Matrix</span>
                </h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Based on listed athletic parameters, matches indicate eligibility for specialized athletic scholarship tracks, Sports Management degree paths, or professional sports leagues. Action advice: sync with regional sports authority combines.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= PAGE: OUTDOOR SPORTS ROADMAPS ======================= */}
      {activeSegment === "outdoor" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Picker Tab list */}
          <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Select Outdoor Athletic Track:</span>
            <div className="flex flex-wrap gap-1.5">
              {OUTDOOR_SPORTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedOutdoorSportId(s.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono transition-all border cursor-pointer ${
                    selectedOutdoorSportId === s.id 
                      ? "bg-yellow-500 border-yellow-405 text-slate-950 font-bold" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Sport details */}
          <RenderSportRoadmap sport={activeOutdoorSport} />
        </div>
      )}

      {/* ======================= PAGE: INDOOR SPORTS ROADMAPS ======================= */}
      {activeSegment === "indoor" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Picker Tab list */}
          <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Select Indoor Athletic Track:</span>
            <div className="flex flex-wrap gap-1.5">
              {INDOOR_SPORTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedIndoorSportId(s.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono transition-all border cursor-pointer ${
                    selectedIndoorSportId === s.id 
                      ? "bg-yellow-500 border-yellow-405 text-slate-950 font-bold" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Sport details */}
          <RenderSportRoadmap sport={activeIndoorSport} />
        </div>
      )}

      {/* ======================= PAGE: ESPORTS ARENA ======================= */}
      {activeSegment === "esports" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Picker Tab list */}
          <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Select Global Esport Discipline:</span>
            <div className="flex flex-wrap gap-1.5">
              {ESPORTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedEsportId(s.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono transition-all border cursor-pointer ${
                    selectedEsportId === s.id 
                      ? "bg-yellow-500 border-yellow-405 text-slate-950 font-bold" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Esport details */}
          <RenderSportRoadmap sport={activeEsport} isEsport={true} />
        </div>
      )}

    </div>
  );
};

// HELPER RENDER SUB-COMPONENT: SPORTS ROADMAP RENDERER (FLOWCHART & STAT CARDS)
const RenderSportRoadmap: React.FC<{ sport: SportPathway; isEsport?: boolean }> = ({ sport, isEsport }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      
      {/* 1. VISUAL STEP-BY-STEP PROGRESSION FLOWCHART (Lg: 5/12 cols) */}
      <div className="lg:col-span-5 p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-5">
        <div className="flex items-center space-x-1.5 text-yellow-400">
          <Activity className="w-4.5 h-4.5 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Level-by-Level Progression Flow</span>
        </div>

        {/* Vertical tree flowchart layout */}
        <div className="relative pl-6 border-l-2 border-slate-800/80 space-y-4 pt-1">
          {sport.progression.map((step, idx) => {
            const isLast = idx === sport.progression.length - 1;
            const isFirst = idx === 0;
            return (
              <div key={idx} className="relative group">
                {/* Visual node indicator */}
                <span className={`absolute -left-[30px] top-1 rounded-full w-4 h-4 flex items-center justify-center font-mono text-[9px] font-black border-2 transition-all ${
                  isLast 
                    ? "bg-yellow-500 text-slate-950 border-yellow-400 scale-110 shadow-md shadow-yellow-500/25" 
                    : isFirst 
                      ? "bg-emerald-500 text-slate-950 border-emerald-400" 
                      : "bg-slate-900 text-slate-300 border-slate-700"
                }`}>
                  {idx + 1}
                </span>

                <div className="p-3 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-lg group-hover:bg-[#0A0F1D] transition-all">
                  <h5 className={`text-xs font-extrabold uppercase ${isLast ? "text-yellow-400 font-black" : "text-white"}`}>
                    {step}
                  </h5>
                  <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5 block">
                    {idx === 0 ? "Entry Phase" : isLast ? "Apex Tier" : `Sub-Level Representative ${idx}`}
                  </span>
                </div>
                
                {/* Connecting arrow indicator */}
                {!isLast && (
                  <div className="flex justify-center w-4 absolute -left-[30px] top-6 z-10 text-slate-600 animate-pulse text-[10px] font-bold">
                    &darr;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. STATS, METHODOLOGY & REQUIREMENTS CARDS (Lg: 7/12 cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Title plate */}
        <div className="p-5 bg-gradient-to-r from-[#111827] to-[#0A0F1D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-slate-800/10">
            <Flame className="w-16 h-16" />
          </div>
          <span className="text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {isEsport ? "Digital Esport Path" : "Athletic Pathway"}
          </span>
          <h3 className="text-xl font-black text-white mt-1.5 uppercase tracking-wide">{sport.name} Career Pipeline</h3>
        </div>

        {/* Info grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Selection processes */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 shadow-md">
            <div className="flex items-center space-x-1.5 text-yellow-500 text-[10px] font-mono uppercase tracking-wider font-bold">
              <Compass className="w-4 h-4" />
              <span>Selection Framework</span>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed">{sport.selectionProcess}</p>
          </div>

          {/* Fitness standards */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 shadow-md">
            <div className="flex items-center space-x-1.5 text-red-400 text-[10px] font-mono uppercase tracking-wider font-bold">
              <Dumbbell className="w-4 h-4" />
              <span>{isEsport ? "Reflex & Physical Standards" : "Fitness benchmarks"}</span>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed">{sport.fitnessStandards}</p>
          </div>

        </div>

        {/* Skills needed & training advice */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Required Skills Matrix</span>
          <div className="flex flex-wrap gap-1.5">
            {sport.requiredSkills.map((sk, idx) => (
              <span 
                key={idx} 
                className="text-[11px] font-mono px-2.5 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300 font-semibold"
              >
                &bull; {sk}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-850 space-y-1.5">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold block">Routine Training Guidance</span>
            <p className="text-xs text-slate-400 leading-relaxed">{sport.trainingGuidance}</p>
          </div>
        </div>

        {/* ESPORTS SPECIFIC DETAILS CARDS */}
        {isEsport && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {sport.hardwareRequirements && (
              <div className="p-4 bg-slate-905/60 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block font-bold flex items-center space-x-1">
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Hardware Requirements</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">{sport.hardwareRequirements}</p>
              </div>
            )}

            {sport.practicePlans && (
              <div className="p-4 bg-slate-905/60 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>Routine Practice Plans</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">{sport.practicePlans}</p>
              </div>
            )}

            {sport.teamSelection && (
              <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-1.5 md:col-span-2">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block font-bold">Professional Team Selection & Scouting</span>
                <p className="text-xs text-slate-400 leading-relaxed">{sport.teamSelection}</p>
              </div>
            )}
          </div>
        )}

        {/* Career possibilities */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Leading Career Possibilities</span>
          <div className="flex flex-wrap gap-1.5">
            {sport.careerOpportunities.map((opp, idx) => (
              <span 
                key={idx} 
                className="text-[10px] font-mono px-2 py-1 bg-slate-950 border border-slate-850 rounded text-slate-300"
              >
                {opp}
              </span>
            ))}
          </div>
        </div>

        {/* Earnings potential card */}
        <div className="p-5 bg-gradient-to-r from-yellow-950/20 to-amber-950/20 border border-yellow-500/10 rounded-xl space-y-1.5">
          <div className="flex items-center space-x-1.5 text-yellow-405 text-yellow-400">
            <DollarSign className="w-4.5 h-4.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Earning Insights & Revenue Potential</span>
          </div>
          <p className="text-xs text-white font-mono font-extrabold">{sport.earningsPotential}</p>
        </div>

      </div>

    </div>
  );
};
export default SportsCorridor;
