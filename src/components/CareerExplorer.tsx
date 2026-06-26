import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../services/apiBase";
import { 
  Compass, Search, Star, HelpCircle, Target, TrendingUp, Sparkles, Loader2,
  TrendingDown, Briefcase, Award, GraduationCap, CheckCircle2, RotateCw, BarChart3, ChevronRight
} from "lucide-react";

const STREAMS_CATEGORIES = [
  "All",
  "Engineering & Technology",
  "Artificial Intelligence & Data Science",
  "Medical & Healthcare",
  "Commerce & Finance",
  "Chartered Accountancy",
  "Banking & Insurance",
  "Law",
  "Civil Services",
  "Defence",
  "Management & MBA",
  "Design & Animation",
  "Architecture",
  "Media & Journalism",
  "Education & Teaching",
  "Agriculture",
  "Hospitality & Tourism",
  "Sports & Fitness",
  "Entrepreneurship",
  "Skilled Trades",
  "Research & Academia"
];

export const CareerExplorer: React.FC = () => {
  const [careersList, setCareersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");
  const [dataSource, setDataSource] = useState("offline-local-cache");

  const fetchCareersData = async (bypassCache = false) => {
    if (bypassCache) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(apiUrl("/api/careers/search"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          searchQuery,
          stream: selectedStream,
          bypassCache
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.careers)) {
        setCareersList(data.careers);
        setDataSource(data.source || "offline-local-cache");
      }
    } catch (err) {
      console.error("Failed to load career intelligence dynamically:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const isFirstMount = React.useRef(true);

  // Automatically fetch when query or stream category selection changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchCareersData(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchCareersData(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedStream]);

  const handleRefreshIntelligence = () => {
    fetchCareersData(true);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fade-in" id="career-explorer-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] uppercase tracking-wider flex items-center gap-2">
              Career Explorer
              {dataSource === "live-gemini-api" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/15 border border-blue-500/25 text-blue-400 uppercase animate-pulse font-bold shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                  ⚡ Live Market Data
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-slate-500/15 border border-slate-500/25 text-slate-400 uppercase font-bold">
                  ✓ Cached Index
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300">Examine trending career trajectories, dynamic compensation charts, industry growth outlooks, and certified skill matrices.</p>
          </div>
        </div>

        <button 
          onClick={handleRefreshIntelligence}
          disabled={loading || refreshing}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCw className="w-3.5 h-3.5" />
          )}
          <span>Refresh Career Intelligence</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-850/80 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Main search input */}
          <div className="md:col-span-6 relative">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">Search Intelligence Registry</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                placeholder="Search matching careers, skills, industries, or degrees..."
              />
            </div>
          </div>

          {/* Stream Selector */}
          <div className="md:col-span-6">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">Filter Professional Stream</span>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer focus:outline-none focus:border-emerald-500/50 font-mono"
            >
              {STREAMS_CATEGORIES.map((str) => (
                <option key={str} value={str}>{str === "All" ? "All Streams (20 Categories)" : str}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Categories Pills Bar */}
        <div className="pt-1.5">
          <span className="text-[9px] font-mono text-slate-500 uppercase block mb-2">Quick Category Jumps</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {STREAMS_CATEGORIES.slice(1).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedStream(cat)}
                className={`px-2.5 py-1 text-[10px] rounded-md font-mono border transition-all cursor-pointer ${
                  selectedStream === cat 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" 
                    : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 bg-slate-900/10 border border-slate-850/60 rounded-xl">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block font-bold animate-pulse">
              Consulting Job Market Index...
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">
              Fetching salary brackets, required credentials & future outlook matrices
            </span>
          </div>
        </div>
      ) : careersList.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/20 rounded-xl border border-dashed border-slate-800 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">No matching trajectories discovered</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our live market database didn't locate career tracks matching your combination of filters. Try updating your key skills or resetting streams.
            </p>
          </div>
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedStream("All");
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-[10px] font-mono border border-slate-800 rounded-lg text-slate-300 transition-colors uppercase cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {careersList.map((car, idx) => {
            
            // Clean up numbers for salary growth calculation
            const parseLPA = (val: string) => {
              if (!val) return 5;
              const matches = val.match(/([0-9.]+)/);
              if (matches) {
                return parseFloat(matches[1]);
              }
              return 5;
            };

            const entryVal = parseLPA(car.entrySalary);
            const midVal = parseLPA(car.midSalary);
            const seniorVal = parseLPA(car.seniorSalary);
            const maxVal = Math.max(entryVal, midVal, seniorVal, 10);

            return (
              <div 
                key={idx} 
                className="p-5 bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition-all flex flex-col justify-between space-y-4 shadow-md group relative hover:shadow-emerald-500/5"
              >
                {/* Header Information */}
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-black border ${
                      car.demand === "High" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                        : "bg-yellow-500/10 text-yellow-450 border-yellow-500/25"
                    }`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>DEMAND: {car.demand}</span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
                      {car.stream}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-snug">
                      {car.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-slate-400 text-xs mt-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>{car.industry || "Professional Sector"}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">{car.outlook || "High Growth Trajectory"}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {car.description}
                    </p>
                  </div>

                  {/* Requirements Sections */}
                  <div className="space-y-3 pt-3 border-t border-slate-900">
                    
                    {/* Skills Checklist */}
                    {car.skills && car.skills.length > 0 && (
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">Prerequisite Core Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {car.skills.map((sk: string, i: number) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-350 rounded flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Minimum Degrees Required */}
                    {car.degrees && car.degrees.length > 0 && (
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">Recommended Degrees</span>
                        <div className="flex flex-wrap gap-1">
                          {car.degrees.map((dg: string, i: number) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950/60 border border-slate-850 text-slate-400 rounded flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-500" />
                              {dg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Certifications */}
                    {car.certifications && car.certifications.length > 0 && (
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">Elite Global Certifications</span>
                        <div className="flex flex-wrap gap-1">
                          {car.certifications.map((cert: string, i: number) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/15 text-emerald-450 rounded flex items-center gap-1">
                              <Award className="w-3 h-3 text-emerald-500/70" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Hiring Enterprises */}
                    {car.topRecruiters && car.topRecruiters.length > 0 && (
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block mb-1">Key Recruiters in India</span>
                        <div className="flex flex-wrap gap-1.5">
                          {car.topRecruiters.map((rec: string, i: number) => (
                            <span key={i} className="text-[10px] font-sans px-2 py-0.5 bg-slate-950/80 border border-slate-850 text-slate-300 rounded font-semibold">
                              {rec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Growth Projection Stats Card */}
                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850/80 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-mono uppercase text-slate-500 block">Growth Forecast</span>
                        <span className="text-[10px] text-emerald-400 font-black block">{car.growthProjection || "+18% CAGR"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-mono uppercase text-slate-500 block">Typical Salary Range</span>
                        <span className="text-[11px] text-white font-mono font-bold block">{car.salary}</span>
                      </div>
                    </div>

                    {/* ----------------- GRAPHS SECTION ----------------- */}
                    <div className="pt-3 border-t border-slate-900 space-y-3">
                      
                      {/* Salary Growth Graph */}
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1.5">
                          <span className="font-bold uppercase">1. Compensation Progressive Growth</span>
                          <span className="text-emerald-400">Fresher → Senior</span>
                        </div>
                        <div className="space-y-1.5 bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/60">
                          {/* Fresher */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>Fresher (Entry)</span>
                              <span className="text-slate-300 font-bold">{car.entrySalary || "₹4.5 LPA"}</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                              <div 
                                className="bg-slate-600 h-full rounded transition-all duration-1000"
                                style={{ width: `${(entryVal / maxVal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Mid-Level */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>Mid-Level</span>
                              <span className="text-emerald-400 font-bold">{car.midSalary || "₹10.0 LPA"}</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                              <div 
                                className="bg-emerald-650 h-full rounded transition-all duration-1000"
                                style={{ width: `${(midVal / maxVal) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Senior */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span>Senior (Experienced)</span>
                              <span className="text-emerald-300 font-bold">{car.seniorSalary || "₹22.0 LPA"}</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded transition-all duration-1000"
                                style={{ width: `${(seniorVal / maxVal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Demand Level & Growth Trend Graphs */}
                      <div className="grid grid-cols-2 gap-3">
                        
                        {/* Industry Demand Graph */}
                        <div className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/60 flex flex-col justify-between">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">2. Industry Demand Gauge</span>
                          <div className="flex items-center space-x-1 mt-2 mb-1">
                            <div className={`h-4 flex-1 rounded text-center text-[8px] font-mono flex items-center justify-center font-bold border ${
                              car.demand === "Low" 
                                ? "bg-red-500/25 border-red-500/40 text-red-400" 
                                : "bg-slate-900 border-slate-800 text-slate-600"
                            }`}>
                              LOW
                            </div>
                            <div className={`h-4 flex-1 rounded text-center text-[8px] font-mono flex items-center justify-center font-bold border ${
                              car.demand === "Medium" 
                                ? "bg-yellow-500/25 border-yellow-500/40 text-yellow-500" 
                                : "bg-slate-900 border-slate-800 text-slate-600"
                            }`}>
                              MID
                            </div>
                            <div className={`h-4 flex-1 rounded text-center text-[8px] font-mono flex items-center justify-center font-bold border ${
                              car.demand === "High" 
                                ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-400" 
                                : "bg-slate-900 border-slate-800 text-slate-600"
                            }`}>
                              HIGH
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            {car.demand === "High" ? "✓ Accelerated Hiring" : "✓ Steady Replacements"}
                          </span>
                        </div>

                        {/* Future Growth Trend Graph */}
                        <div className="bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/60 flex flex-col justify-between">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">3. 5-Year Trajectory Trend</span>
                          <div className="flex items-end justify-between h-7 mt-2 mb-1 px-1">
                            {(car.fiveYearTrend || [100, 110, 120, 130, 140]).map((pt: number, pIdx: number) => {
                              const minPt = 80;
                              const maxPt = 250;
                              const heightPercent = Math.min(Math.max(((pt - minPt) / (maxPt - minPt)) * 100, 15), 100);
                              return (
                                <div key={pIdx} className="flex flex-col items-center flex-1 space-y-1">
                                  <div 
                                    className="w-1.5 bg-emerald-500 rounded-t transition-all duration-1000"
                                    style={{ height: `${heightPercent}%` }}
                                    title={`Year ${pIdx + 1}: Index ${pt}`}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-[7px] text-slate-500 font-mono mt-1">
                            <span>Year 1</span>
                            <span>Year 5</span>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="pt-2">
                  <div className="text-[9px] font-mono text-slate-500 uppercase flex items-center justify-between">
                    <span>SECTOR CLASSIFICATION: CR_{idx + 101}</span>
                    <span className="text-emerald-500/80">Active Hiring Zone</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
