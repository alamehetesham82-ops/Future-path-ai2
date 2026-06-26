import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../services/apiBase";
import { db } from "../firebase";
import { 
  collection, getDocs, setDoc, doc, addDoc, query, where, deleteDoc 
} from "firebase/firestore";
import { 
  Star, Search, Award, Calendar, HelpCircle, ExternalLink, Loader2, Sparkles, 
  AlertCircle, RotateCw, BarChart3, Filter, MapPin, GraduationCap, DollarSign, Clock
} from "lucide-react";

export const ScholarshipHub: React.FC = () => {
  const { currentUser } = useAuth();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and Advanced Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [amountRangeFilter, setAmountRangeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [dataSource, setDataSource] = useState("offline-local-cache");

  const isFirstMount = useRef(true);

  // Categories list per requirements
  const CATEGORIES = [
    "All",
    "Academic",
    "Merit-Based",
    "Need-Based",
    "Sports",
    "Olympiads",
    "Government",
    "Minority",
    "SC/ST",
    "OBC",
    "Girls",
    "Research",
    "International"
  ];

  // Class list per requirements
  const CLASSES = [
    "All",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
    "Undergraduate",
    "Postgraduate",
    "Research"
  ];

  // States list per requirements
  const STATES = [
    "All",
    "All India",
    "National",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "International"
  ];

  // Sync bookmark states initially from firebase & cache
  useEffect(() => {
    const cachedScholarships = localStorage.getItem("fp_scholarships_global");
    if (cachedScholarships) {
      setScholarships(JSON.parse(cachedScholarships));
      setLoading(false);
    }
    if (currentUser) {
      const cachedBookmarks = localStorage.getItem(`fp_scholarship_bookmarks_${currentUser.uid}`);
      if (cachedBookmarks) {
        setBookmarks(JSON.parse(cachedBookmarks));
      }
    }
  }, [currentUser]);

  // Sync bookmark mutations to local storage
  useEffect(() => {
    if (currentUser?.uid) {
      localStorage.setItem(`fp_scholarship_bookmarks_${currentUser.uid}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, currentUser]);

  // Fetch from our newly created express service layer API
  const fetchScholarships = async (bypassCache = false) => {
    if (bypassCache) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(apiUrl("/api/scholarships/search"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          searchQuery,
          classFilter,
          stateFilter,
          categoryFilter,
          amountRangeFilter,
          statusFilter,
          bypassCache
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.scholarships)) {
        setScholarships(data.scholarships);
        setDataSource(data.source || "offline-local-cache");
        localStorage.setItem("fp_scholarships_global", JSON.stringify(data.scholarships));
        
        // Sync to cloud Firestore as a cache-seeding mechanism
        try {
          data.scholarships.forEach((sch: any) => {
            setDoc(doc(db, "scholarships", sch.id), sch).catch(e => console.warn("Firestore seed warn:", e));
          });
        } catch (fError) {
          console.warn("Firestore offline warning:", fError);
        }
      }
    } catch (err) {
      console.error("Failed to load scholarship intelligence:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounced search on filter and query modifications
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchScholarships(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchScholarships(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, categoryFilter, classFilter, stateFilter, amountRangeFilter, statusFilter]);

  // Manual Refresh Handler
  const handleRefreshLatest = () => {
    fetchScholarships(true);
  };

  // Sync bookmark list with Firebase collection
  useEffect(() => {
    const syncBookmarksFromFirebase = async () => {
      if (!currentUser) return;
      try {
        const bq = query(collection(db, "scholarship_bookmarks"), where("uid", "==", currentUser.uid));
        const bSnap = await getDocs(bq);
        const bMarks = bSnap.docs.map(doc => doc.data().scholarshipId);
        setBookmarks(bMarks);
        localStorage.setItem(`fp_scholarship_bookmarks_${currentUser.uid}`, JSON.stringify(bMarks));
      } catch (err) {
        console.warn("Could not load bookmarks from cloud, using cached records.", err);
      }
    };
    syncBookmarksFromFirebase();
  }, [currentUser]);

  const handleToggleBookmark = async (schId: string) => {
    if (!currentUser) return;
    
    try {
      if (bookmarks.includes(schId)) {
        // Remove bookmark
        const q = query(
          collection(db, "scholarship_bookmarks"), 
          where("uid", "==", currentUser.uid), 
          where("scholarshipId", "==", schId)
        );
        const snap = await getDocs(q);
        for (const bDoc of snap.docs) {
          await deleteDoc(doc(db, "scholarship_bookmarks", bDoc.id));
        }
        setBookmarks(prev => prev.filter(id => id !== schId));
      } else {
        // Create bookmark
        await addDoc(collection(db, "scholarship_bookmarks"), {
          uid: currentUser.uid,
          scholarshipId: schId,
          savedAt: new Date().toISOString()
        });
        setBookmarks(prev => [...prev, schId]);
      }
    } catch (err) {
      console.error("Error updating scholarship bookmark state:", err);
    }
  };

  // Compute analytics dynamically based on current filtered list
  const getAnalytics = () => {
    const categoriesMap: { [key: string]: number } = {};
    const classMap: { [key: string]: number } = {};
    const stateMap: { [key: string]: number } = {};

    scholarships.forEach(sch => {
      const cat = sch.category || "Academic";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;

      const cls = sch.classEligibility || "Class 10";
      classMap[cls] = (classMap[cls] || 0) + 1;

      const st = sch.stateEligibility || "All India";
      stateMap[st] = (stateMap[st] || 0) + 1;
    });

    const categoriesList = Object.entries(categoriesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const classList = Object.entries(classMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const stateList = Object.entries(stateMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return { categoriesList, classList, stateList };
  };

  const { categoriesList, classList, stateList } = getAnalytics();

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fade-in" id="scholarship-hub-root">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)] uppercase tracking-wider flex items-center gap-2">
              Scholarship Intelligence Hub
              {dataSource === "live-gemini-api" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/15 border border-blue-500/25 text-blue-400 uppercase animate-pulse font-bold shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                  ⚡ Live Data Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-slate-500/15 border border-slate-500/25 text-slate-400 uppercase font-bold">
                  ✓ Cached Index
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300">Locate live Indian & global scholarship registries, filter target eligibility matrices, verify criteria, and apply on portal.</p>
          </div>
        </div>

        <button 
          onClick={handleRefreshLatest}
          disabled={loading || refreshing}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-800 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCw className="w-3.5 h-3.5" />
          )}
          <span>Refresh Latest Scholarships</span>
        </button>
      </div>

      {/* Advanced Dynamic Search & Filters Shelf */}
      <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-850/80 space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative">
          <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">Search Scholarship Registries</span>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              placeholder="Search by scholarship name, eligibility keywords, provider, state, class..."
            />
          </div>
        </div>

        {/* Dynamic Multi-Filter Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          
          {/* Category Filter */}
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-semibold">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300 cursor-pointer focus:outline-none focus:border-blue-500/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-semibold">Class level</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300 cursor-pointer focus:outline-none focus:border-blue-500/50"
            >
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls === "All" ? "All Classes" : cls}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-semibold">State eligibility</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300 cursor-pointer focus:outline-none focus:border-blue-500/50"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>{st === "All" ? "All States" : st}</option>
              ))}
            </select>
          </div>

          {/* Stipend Range Filter */}
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-semibold">Stipend Amount</span>
            <select
              value={amountRangeFilter}
              onChange={(e) => setAmountRangeFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300 cursor-pointer focus:outline-none focus:border-blue-500/50"
            >
              <option value="All">All Stipends</option>
              <option value="< 10000">Below ₹10,000</option>
              <option value="10000 - 50000">₹10,000 - ₹50,000</option>
              <option value="> 50000">Above ₹50,000</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1 font-semibold">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-300 cursor-pointer focus:outline-none focus:border-blue-500/50"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

        </div>

        {/* Quick Reset Label */}
        {(searchQuery || categoryFilter !== "All" || classFilter !== "All" || stateFilter !== "All" || amountRangeFilter !== "All" || statusFilter !== "All") && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
                setClassFilter("All");
                setStateFilter("All");
                setAmountRangeFilter("All");
                setStatusFilter("All");
              }}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline uppercase cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>

      {/* Dynamic Graph / Analytics Small Widgets Section */}
      {scholarships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/20 p-4 rounded-xl border border-slate-850/60">
          
          {/* Category Distribution chart */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Scholarships by Category</span>
            </span>
            <div className="space-y-1.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/40">
              {categoriesList.length === 0 ? (
                <div className="text-[10px] text-slate-500 font-mono py-2 text-center">No data for filters</div>
              ) : (
                categoriesList.map((item, idx) => {
                  const maxCount = Math.max(...categoriesList.map(i => i.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>{item.name}</span>
                        <span className="text-blue-400 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Class Distribution chart */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>By Class Eligibility</span>
            </span>
            <div className="space-y-1.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/40">
              {classList.length === 0 ? (
                <div className="text-[10px] text-slate-500 font-mono py-2 text-center">No data for filters</div>
              ) : (
                classList.map((item, idx) => {
                  const maxCount = Math.max(...classList.map(i => i.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>{item.name}</span>
                        <span className="text-emerald-400 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* State Distribution chart */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>By State Jurisdiction</span>
            </span>
            <div className="space-y-1.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850/40">
              {stateList.length === 0 ? (
                <div className="text-[10px] text-slate-500 font-mono py-2 text-center">No data for filters</div>
              ) : (
                stateList.map((item, idx) => {
                  const maxCount = Math.max(...stateList.map(i => i.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>{item.name}</span>
                        <span className="text-purple-400 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* Main Results Listing Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3 bg-slate-900/10 border border-slate-850/60 rounded-xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block font-bold animate-pulse">
              Consulting National Scholarship Registry...
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase block">
              Acquiring stipend numbers, criteria levels, state filters & official deadlines
            </span>
          </div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/20 rounded-xl border border-dashed border-slate-800 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">No scholarships discovered</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our dynamic intelligence database didn't locate active scholarships matching your exact criteria parameters. Try relaxing your filters.
            </p>
          </div>
          <button 
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("All");
              setClassFilter("All");
              setStateFilter("All");
              setAmountRangeFilter("All");
              setStatusFilter("All");
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-[10px] font-mono border border-slate-800 rounded-lg text-slate-300 transition-colors uppercase cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch) => {
            const isBookmarked = bookmarks.includes(sch.id);
            
            // Format dynamic criteria tags elegantly
            const classText = sch.classEligibility || "All Levels";
            const stateText = sch.stateEligibility || "All India";
            const incomeText = sch.incomeCriteria && sch.incomeCriteria !== "None" ? sch.incomeCriteria : "No Limit";
            const statusLabel = sch.status || "Open";

            return (
              <div 
                key={sch.id} 
                className="p-5 bg-slate-900/30 border border-slate-855 hover:border-blue-500/30 rounded-xl transition-all flex flex-col justify-between space-y-4 shadow-lg group relative"
              >
                {/* Header info row */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] uppercase rounded font-bold">
                      {sch.category}
                    </span>

                    <div className="flex items-center space-x-2">
                      {/* Status Tag */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                        statusLabel.toLowerCase() === "open"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : statusLabel.toLowerCase() === "upcoming"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                      }`}>
                        <span className={`w-1 h-1 rounded-full mr-1 ${
                          statusLabel.toLowerCase() === "open"
                            ? "bg-emerald-400 animate-pulse"
                            : statusLabel.toLowerCase() === "upcoming"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}></span>
                        {statusLabel}
                      </span>

                      {/* Bookmark Icon */}
                      <button 
                        onClick={() => handleToggleBookmark(sch.id)}
                        className="p-1 px-1.5 focus:outline-none hover:bg-slate-800 rounded group transition-all text-slate-500 cursor-pointer"
                      >
                        <Star className={`w-4 h-4 transition-transform group-hover:scale-110 ${isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-slate-500 hover:text-white"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors tracking-tight leading-snug">
                      {sch.title}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      Provided by: <span className="text-slate-400 font-semibold">{sch.provider || "Education Board"}</span>
                    </span>
                  </div>

                  {/* Eligibility Student-Friendly Summary */}
                  <p className="text-xs text-slate-350 leading-relaxed font-sans">
                    {sch.eligibility}
                  </p>

                  {/* Criteria Tags Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 pb-1">
                    
                    {/* Class Tag */}
                    <div className="flex items-center space-x-1.5 p-1.5 bg-slate-950/60 border border-slate-850 rounded text-[10px] text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400/80 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-500 block text-[7px] uppercase font-mono font-bold">Class Eligibility</span>
                        <span className="font-semibold truncate">{classText}</span>
                      </div>
                    </div>

                    {/* State Tag */}
                    <div className="flex items-center space-x-1.5 p-1.5 bg-slate-950/60 border border-slate-850 rounded text-[10px] text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-purple-400/80 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-500 block text-[7px] uppercase font-mono font-bold">State Scope</span>
                        <span className="font-semibold truncate">{stateText}</span>
                      </div>
                    </div>

                    {/* Income Tag */}
                    <div className="flex items-center space-x-1.5 p-1.5 bg-slate-950/60 border border-slate-850 rounded text-[10px] text-slate-300">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400/80 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-500 block text-[7px] uppercase font-mono font-bold">Income Criteria</span>
                        <span className="font-semibold truncate">{incomeText}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Info and action line */}
                <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">STIPEND REWARD</span>
                    <span className="text-emerald-400 font-extrabold font-mono text-[13px]">{sch.amount}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block text-[9px] uppercase flex items-center justify-end space-x-1 font-bold">
                      <Calendar className="w-3 h-3 text-red-400 mr-1" />
                      <span>DEADLINE</span>
                    </span>
                    <span className="text-slate-300 font-extrabold text-[12px]">{sch.deadline}</span>
                  </div>
                </div>

                {/* Apply Link CTA Button */}
                <div className="pt-1">
                  <a
                    href={sch.applicationLink || "https://scholarships.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-950 border border-slate-800 text-blue-400 text-xs font-extrabold font-mono rounded flex items-center justify-center space-x-1.5 hover:bg-slate-900 hover:border-blue-500/20 transition-all cursor-pointer shadow-sm uppercase tracking-wide"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3 h-3 text-blue-400" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
