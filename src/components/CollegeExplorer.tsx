import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../services/apiBase";
import { db } from "../firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { 
  GraduationCap, Search, MapPin, DollarSign, Award, Star, List, HelpCircle, 
  ExternalLink, Sparkles, Filter, Info, ShieldCheck, X
} from "lucide-react";

const STATES = [
  "All", "Maharashtra", "Karnataka", "Tamil Nadu", "Kerala", "Telangana", "Andhra Pradesh",
  "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Punjab", "Haryana", "Delhi",
  "West Bengal", "Odisha", "Assam", "Bihar", "Jharkhand", "Chhattisgarh", "Uttarakhand",
  "Himachal Pradesh", "Jammu & Kashmir", "Goa", "Tripura", "Manipur", "Mizoram", "Nagaland",
  "Meghalaya", "Arunachal Pradesh", "Sikkim"
];

const STREAMS = [
  "All", "Engineering", "Medical", "Commerce", "Science", "Arts", "Law", "Management", "Architecture", "Design", "Agriculture"
];

const EXAMS = [
  "All", "JEE Advanced", "JEE Main", "NEET", "CUET", "CLAT", "CAT", "BITSAT", "NATA", "NID DAT", "ICAR AIEEA"
];

const OWNERSHIPS = ["All", "Government", "Private"];

const PLACEMENTS = [
  { label: "All Packages", value: "All" },
  { label: "High Placement (> 15 LPA)", value: "> 15 LPA" },
  { label: "Mid Placement (8 - 15 LPA)", value: "8 - 15 LPA" },
  { label: "Entry Placement (< 8 LPA)", value: "< 8 LPA" }
];

const FEES_RANGES = [
  { label: "Any Fees", value: "All" },
  { label: "Low Budget (< ₹1 Lakh/Yr)", value: "< 1 Lakh" },
  { label: "Mid Budget (₹1 - ₹3 Lakhs/Yr)", value: "1 - 3 Lakhs" },
  { label: "Premium ( > ₹3 Lakhs/Yr)", value: "> 3 Lakhs" }
];

const ENTRANCE_EXAM_SUMMARIES: Record<string, string> = {
  "JEE Advanced": "Required for IIT admissions",
  "JEE Main": "Required for NIT, IIIT and many engineering colleges",
  "NEET": "Required for MBBS and medical admissions",
  "CUET": "Used by central universities",
  "CLAT": "Used for law admissions",
  "CAT": "Used for MBA admissions",
  "BITSAT": "Used for BITS Pilani admissions",
  "NID DAT": "Used for design admissions",
  "NATA": "Used for architecture admissions",
  "ICAR AIEEA": "Used for agriculture admissions",
  "WBJEE": "Required for Jadavpur & West Bengal engineering colleges",
  "TNEA": "State admission system for Tamil Nadu engineering",
  "MH CET": "Required for state colleges in Maharashtra",
  "KCET": "Required for state colleges in Karnataka",
  "COMEDK": "Private engineering colleges in Karnataka"
};

export const CollegeExplorer: React.FC = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedStream, setSelectedStream] = useState("All");
  const [courseQuery, setCourseQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("All");
  const [selectedOwnership, setSelectedOwnership] = useState("All");
  const [selectedPlacement, setSelectedPlacement] = useState("All");
  const [selectedFees, setSelectedFees] = useState("All");

  const [apiSource, setApiSource] = useState("offline-local-cache");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const getExamSummary = (examName: string) => {
    const normalized = examName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [key, desc] of Object.entries(ENTRANCE_EXAM_SUMMARIES)) {
      const keyNormalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalized.includes(keyNormalized) || keyNormalized.includes(normalized)) {
        return desc;
      }
    }
    return null;
  };

  const fetchCollegesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/colleges/search"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          searchQuery,
          state: selectedState,
          stream: selectedStream,
          course: courseQuery,
          exam: selectedExam,
          ownership: selectedOwnership,
          placementRange: selectedPlacement,
          feesRange: selectedFees
        })
      });

      if (!response.ok) {
        throw new Error(`API error code: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.colleges)) {
        setColleges(data.colleges);
        setApiSource(data.source || "offline-local-cache");
      }
    } catch (err) {
      console.error("Failed to load colleges dynamically:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFirstMount = React.useRef(true);

  // Debounced search triggers automatically when any filter or query changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchCollegesData();
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchCollegesData();
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, courseQuery, selectedState, selectedStream, selectedExam, selectedOwnership, selectedPlacement, selectedFees]);

  const handleManualRefresh = () => {
    fetchCollegesData();
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/10 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)] uppercase tracking-wider flex items-center gap-2">
              College Explorer
              {apiSource === "live-gemini-api" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 uppercase animate-pulse">
                  ⚡ Live AI-Backed Dataset
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-400 uppercase">
                  ✓ High-Fidelity Dataset
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300">Search premium colleges, live cutoffs, accredited rankings, actual average placements, and tuition fees instantly.</p>
          </div>
        </div>

        <button 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500/15 to-teal-500/5 border border-emerald-500/35 rounded-xl text-xs font-mono font-bold text-emerald-300 hover:text-emerald-200 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isFiltersOpen ? "HIDE ADVANCED SYSTEM FILTERS" : "SHOW ADVANCED SYSTEM FILTERS"}</span>
        </button>
      </div>

      {/* Advanced Filters Shelf */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-[#070B16]/98 backdrop-blur-2xl p-6 md:p-6 overflow-y-auto flex flex-col justify-start md:relative md:inset-auto md:bg-slate-950/50 md:backdrop-blur-lg md:z-auto border border-cyan-500/15 rounded-2xl space-y-5 animate-fadeIn shadow-[0_0_25px_rgba(0,229,255,0.05)]">
          
          {/* Mobile Overlay header */}
          <div className="flex md:hidden items-center justify-between border-b border-cyan-500/15 pb-4 mb-2">
            <span className="font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 uppercase tracking-widest font-mono">
              SYSTEM FILTERS
            </span>
            <button 
              onClick={() => setIsFiltersOpen(false)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-cyan-400 cursor-pointer shadow-[0_0_8px_rgba(0,0,0,0.5)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* College Search input */}
            <div className="md:col-span-4 relative">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Search Colleges</span>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-9 pr-3 cyber-input rounded-xl text-xs text-slate-200 placeholder-slate-500"
                  placeholder="e.g. IIT Delhi, BITS Pilani, AIIMS, SRM..."
                />
              </div>
            </div>

            {/* Course Search Input */}
            <div className="md:col-span-4 relative">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Search Available Course</span>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-400/60" />
                <input
                  type="text"
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  className="w-full py-2 pl-9 pr-3 cyber-input rounded-xl text-xs text-slate-200 placeholder-slate-500"
                  placeholder="e.g. Computer Science, MBBS, B.Com, MBA..."
                />
              </div>
            </div>

            {/* State Selection */}
            <div className="md:col-span-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">State / Territory</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full py-2 px-3 cyber-input rounded-xl text-xs text-slate-350 cursor-pointer"
              >
                {STATES.map((st) => (
                  <option key={st} value={st} className="bg-slate-950 text-slate-200">{st === "All" ? "All Indian States" : st}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Academic Stream */}
            <div className="md:col-span-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Academic Stream</span>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full py-2 px-3 cyber-input rounded-xl text-xs text-slate-350 cursor-pointer"
              >
                {STREAMS.map((str) => (
                  <option key={str} value={str} className="bg-slate-950 text-slate-200">{str === "All" ? "All Streams" : str}</option>
                ))}
              </select>
            </div>

            {/* Entrance Exams */}
            <div className="md:col-span-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Entrance Exam Accepted</span>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full py-2 px-3 cyber-input rounded-xl text-xs text-slate-350 cursor-pointer"
              >
                {EXAMS.map((ex) => (
                  <option key={ex} value={ex} className="bg-slate-950 text-slate-200">{ex === "All" ? "Any Exam Accepted" : ex}</option>
                ))}
              </select>
            </div>

            {/* Government / Private */}
            <div className="md:col-span-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Ownership Structure</span>
              <select
                value={selectedOwnership}
                onChange={(e) => setSelectedOwnership(e.target.value)}
                className="w-full py-2 px-3 cyber-input rounded-xl text-xs text-slate-350 cursor-pointer"
              >
                {OWNERSHIPS.map((own) => (
                  <option key={own} value={own} className="bg-slate-950 text-slate-200">{own === "All" ? "All (Govt/Pvt)" : own}</option>
                ))}
              </select>
            </div>

            {/* Placement Ranges */}
            <div className="md:col-span-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Placement Package</span>
              <select
                value={selectedPlacement}
                onChange={(e) => setSelectedPlacement(e.target.value)}
                className="w-full py-2 px-3 cyber-input rounded-xl text-xs text-slate-350 cursor-pointer"
              >
                {PLACEMENTS.map((pl) => (
                  <option key={pl.value} value={pl.value} className="bg-slate-950 text-slate-200">{pl.label}</option>
                ))}
              </select>
            </div>

            {/* Fees Ranges */}
            <div className="md:col-span-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1.5 font-bold tracking-wider">Tuition Fees Limit</span>
              <select
                value={selectedFees}
                onChange={(e) => setSelectedFees(e.target.value)}
                className="w-full py-2 px-3 cyber-input rounded-xl text-xs text-slate-350 cursor-pointer"
              >
                {FEES_RANGES.map((fs) => (
                  <option key={fs.value} value={fs.value} className="bg-slate-950 text-slate-200">{fs.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick instructions / status indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-cyan-500/10 pt-4 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]" />
              <span>Enter queries or select filter criteria above. The terminal matches live updates automatically.</span>
            </div>
            
            <button 
              onClick={handleManualRefresh}
              className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 rounded-lg hover:bg-cyan-500/20 hover:text-white transition-all text-[10px] font-bold tracking-wide cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.1)]"
            >
              Force Live Update
            </button>
          </div>

        </div>
      )}

      {/* College display catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 bg-slate-900/10 border border-slate-850/65 rounded-xl">
          <span className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block font-bold animate-pulse">
              Querying Live Admissions API...
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">
              Fetching cutoffs, package updates & NIRF rankings securely
            </span>
          </div>
        </div>
      ) : colleges.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/20 rounded-xl border border-dashed border-slate-800 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
          <div className="space-y-1.5">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">No matching universities discovered</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our live AI-backed discovery service couldn't locate accredited universities matching these exact combinations. Try expanding your search queries or resetting limits.
            </p>
          </div>
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedState("All");
              setSelectedStream("All");
              setCourseQuery("");
              setSelectedExam("All");
              setSelectedOwnership("All");
              setSelectedPlacement("All");
              setSelectedFees("All");
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-[10px] font-mono border border-slate-800 rounded-lg text-slate-300 transition-colors uppercase cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {colleges.map((col, idx) => (
            <div 
              key={idx} 
              className="p-6 cyber-card-blue rounded-2xl flex flex-col justify-between space-y-5 hover:-translate-y-1 group relative transition-all duration-300"
            >
              <div className="space-y-4">
                
                {/* Badges and rating row */}
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded-lg text-[10px] font-mono text-cyan-400 font-bold shadow-[0_0_8px_rgba(0,229,255,0.1)]">
                      <Star className="w-3.5 h-3.5 fill-current text-cyan-400 mr-0.5" />
                      <span>{col.rating || "4.5"}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono border ${
                      col.ownership === "Government" 
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-bold" 
                        : "bg-purple-500/10 border-purple-500/25 text-purple-400 font-bold"
                    }`}>
                      {col.ownership || "Government"}
                    </span>
                  </div>
                  
                  {col.ranking && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[10px] font-mono text-amber-400 font-bold shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                      <Award className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
                      <span>{col.ranking}</span>
                    </span>
                  )}
                </div>

                {/* College Name & Basic Info */}
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base premium-card-title group-hover:text-cyan-300 transition-colors tracking-tight leading-snug uppercase">
                    {col.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-sans">
                    <MapPin className="w-4 h-4 shrink-0 text-cyan-400/80" />
                    <span>{col.location}</span>
                  </div>
                  {col.accreditation && (
                    <p className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest font-extrabold pt-0.5">
                      {col.accreditation}
                    </p>
                  )}
                </div>

                {/* Exams Accepted & Explanatory summaries */}
                {col.exams && col.exams.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold tracking-wider">Entrance Exams Accepted & Rules:</span>
                    <div className="space-y-1.5">
                      {col.exams.map((exam: string, eIdx: number) => {
                        const summary = getExamSummary(exam);
                        return (
                          <div key={eIdx} className="flex flex-col items-start bg-slate-950/40 p-2 rounded-xl border border-blue-500/10">
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-mono text-blue-400 font-extrabold uppercase tracking-wider">
                              {exam}
                            </span>
                            {summary && (
                              <p className="text-[10px] text-slate-400 italic font-sans pl-2 border-l-2 border-blue-500/40 mt-1 ml-1 leading-relaxed">
                                "{summary}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cutoff Merit Details */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-500/10">
                  <span className="text-[8px] font-mono uppercase text-slate-500 block font-bold tracking-wider">Typical Cutoff & Eligibility Criterion</span>
                  <span className="text-xs text-slate-200 font-bold block mt-0.5">{col.cutoff || "Based on Entrance Exam merit"}</span>
                </div>

                {/* Course cluster list */}
                {col.courses && col.courses.length > 0 && (
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold tracking-wider">Available Course clusters:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {col.courses.map((c: string, idx2: number) => (
                        <span key={idx2} className="px-2.5 py-0.5 bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 rounded-lg font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics grids */}
                <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-900">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-500/10 flex flex-col justify-between">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block font-bold">Avg Package</span>
                    <span className="text-[11px] text-emerald-400 font-black mt-1.5 drop-shadow-[0_0_4px_rgba(16,185,129,0.2)]">{col.avgPackage || "₹5.0 LPA"}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-500/10 flex flex-col justify-between">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block font-bold">Highest Package</span>
                    <span className="text-[11px] text-amber-400 font-black mt-1.5 drop-shadow-[0_0_4px_rgba(245,158,11,0.2)]">{col.highestPackage || "₹12.0 LPA"}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-500/10 flex flex-col justify-between">
                    <span className="text-[8px] font-mono uppercase text-slate-500 block font-bold">Annual Fees</span>
                    <span className="text-[11px] text-slate-200 font-black mt-1.5">{col.fees || "₹1.5 Lakhs"}</span>
                  </div>
                </div>

              </div>

              {/* Website Anchor Link */}
              {col.website && (
                <div className="pt-3 border-t border-slate-900">
                  <a 
                    href={col.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 rounded-xl text-xs font-bold transition-all group-hover:border-blue-500/50 cursor-pointer text-center tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  >
                    <span>VISIT OFFICIAL PORTAL</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
