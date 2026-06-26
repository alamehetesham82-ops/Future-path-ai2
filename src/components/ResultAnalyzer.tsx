import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  Calculator, Sparkles, Plus, Trash2, Award, ArrowUpRight, TrendingUp, HelpCircle, 
  RefreshCw, CheckCircle2, AlertTriangle, BookOpen, Star, Info, MessageSquare, Lightbulb
} from "lucide-react";

interface SubjectMarks {
  id: string;
  subjectName: string;
  obtained: number;
  maximum: number;
}

export const ResultAnalyzer: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectMarks[]>([
    { id: "1", subjectName: "Mathematics", obtained: 88, maximum: 100 },
    { id: "2", subjectName: "Physics", obtained: 76, maximum: 100 },
    { id: "3", subjectName: "Chemistry", obtained: 82, maximum: 100 },
    { id: "4", subjectName: "English Literature", obtained: 92, maximum: 100 },
    { id: "5", subjectName: "Computer Science", obtained: 95, maximum: 100 }
  ]);

  const [inputSubject, setInputSubject] = useState("");
  const [inputObtained, setInputObtained] = useState<number | "">("");
  const [inputMax, setInputMax] = useState<number>(100);

  // Load from local storage on mount
  useEffect(() => {
    const cached = localStorage.getItem("futurepath_results_cache");
    if (cached) {
      try {
        setSubjects(JSON.parse(cached));
      } catch (e) {
        console.error("Local records parse glitch", e);
      }
    }
  }, []);

  // Save to local storage on mutation
  const persistSubjects = (list: SubjectMarks[]) => {
    setSubjects(list);
    localStorage.setItem("futurepath_results_cache", JSON.stringify(list));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSubject.trim()) return;
    if (inputObtained === "" || inputObtained < 0) {
      alert("Please enter valid marks obtained!");
      return;
    }
    if (inputMax <= 0 || inputObtained > inputMax) {
      alert("Marks obtained cannot exceed maximum marks!");
      return;
    }

    const item: SubjectMarks = {
      id: Date.now().toString(),
      subjectName: inputSubject.trim(),
      obtained: Number(inputObtained),
      maximum: Number(inputMax)
    };

    const updated = [...subjects, item];
    persistSubjects(updated);
    setInputSubject("");
    setInputObtained("");
    setInputMax(100);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    persistSubjects(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Verify: Reload system standard grades benchmarks?")) {
      const standard = [
        { id: "1", subjectName: "Mathematics", obtained: 88, maximum: 100 },
        { id: "2", subjectName: "Physics", obtained: 76, maximum: 100 },
        { id: "3", subjectName: "Chemistry", obtained: 82, maximum: 100 },
        { id: "4", subjectName: "English Literature", obtained: 92, maximum: 100 },
        { id: "5", subjectName: "Computer Science", obtained: 95, maximum: 100 }
      ];
      persistSubjects(standard);
    }
  };

  // Metrical calculations
  const totalObtained = subjects.reduce((sum, s) => sum + s.obtained, 0);
  const totalMax = subjects.reduce((sum, s) => sum + s.maximum, 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  // Grade calculation
  const getLetterGrade = (percent: number): string => {
    if (percent >= 90) return "A+ (Excellent)";
    if (percent >= 80) return "A (Very Good)";
    if (percent >= 70) return "B (Good)";
    if (percent >= 60) return "C (Satisfactory)";
    if (percent >= 50) return "D (Average)";
    if (percent >= 40) return "E (Pass)";
    return "F (Needs Improvement)";
  };

  const gradeText = getLetterGrade(overallPercentage);

  // Performance summaries
  const getPerformanceSummaryText = (percent: number): string => {
    if (percent >= 90) return "Outstanding! You demonstrate superior academic integration. Eligible for premier scholarship pipelines and direct Ivy League stream-selections.";
    if (percent >= 80) return "Excellent scholastic consistency. Keep refining your computational practices; your marks open most stream priorities easily.";
    if (percent >= 70) return "Steady performance of strong repute. You have secure foundations, but optimizing subject focus will bypass competitive thresholds.";
    if (percent >= 60) return "Satisfactory baseline standards. Focus on bridging conceptual gaps in key scientific or communicative modules immediately.";
    return "Initial fundamental level. Core study discipline adjustments and revision schedules are required to rebuild progress scores.";
  };

  const performanceSummary = getPerformanceSummaryText(overallPercentage);

  // Strong vs Weak subjects mapping
  const subjectPercentages = subjects.map(s => ({
    ...s,
    percentage: s.maximum > 0 ? (s.obtained / s.maximum) * 100 : 0
  }));

  const strongSubjects = subjectPercentages.filter(s => s.percentage >= 85);
  const weakSubjects = subjectPercentages.filter(s => s.percentage < 75);

  // Recharts Chart formats
  const chartData = subjects.map(s => ({
    name: s.subjectName,
    "Marks Obtained": s.obtained,
    "Max Marks": s.maximum,
    Percentage: parseFloat((s.maximum > 0 ? (s.obtained / s.maximum) * 100 : 0).toFixed(1))
  }));

  return (
    <div id="resultAnalyzer" className="space-y-6 text-slate-100 font-sans">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Dynamic Result Analyzer</h2>
            <p className="text-xs text-slate-400 mt-1">
              Audit scorecards, analyze subject-wise variance, identify conceptual leakage points, and assemble visual charts.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-xs font-mono transition-transform active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Grades</span>
        </button>
      </div>

      {/* Main Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input form & Subject catalog list (4/12 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Add Subject form */}
          <div className="p-5 bg-[#111827] border border-slate-850 rounded-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-850 pb-2">
              <Plus className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-450 text-slate-300 font-bold">Log Evaluation Metric</h3>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={inputSubject}
                  onChange={(e) => setInputSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Inorganic Chem, History"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500/60 focus:outline-none rounded-lg text-xs text-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-405 text-slate-400 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    value={inputObtained}
                    onChange={(e) => setInputObtained(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 85"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500/60 focus:outline-none rounded-lg text-xs text-white"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-405 text-slate-400 mb-1">Max Marks Scale</label>
                  <input
                    type="number"
                    value={inputMax}
                    onChange={(e) => setInputMax(Number(e.target.value))}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500/60 focus:outline-none rounded-lg text-xs"
                    min="1"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-550 to-indigo-500 bg-sky-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-95 shadow-lg shadow-sky-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Upload Report Grade</span>
              </button>
            </form>
          </div>

          {/* Current Evaluation Roster */}
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider">Evaluation Roster</h4>
            {subjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded bg-slate-950/20">
                No subjects registered. Clear the metrics above.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const pct = sub.maximum > 0 ? (sub.obtained / sub.maximum) * 100 : 0;
                  return (
                    <div 
                      key={sub.id} 
                      className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex justify-between items-center transition-all hover:bg-slate-950/80"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{sub.subjectName}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Marks: {sub.obtained} / {sub.maximum}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`text-xs font-mono font-extrabold ${
                          pct >= 85 ? "text-emerald-400" : pct >= 65 ? "text-sky-400" : "text-red-400"
                        }`}>
                          {pct.toFixed(0)}%
                        </span>
                        
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Calculations, Analytics cards & Recharts (8/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key calculation metrics tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-1.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Aggregate Score</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-white">{totalObtained}</span>
                <span className="text-xs text-slate-500">/ {totalMax}</span>
              </div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Sum total registration</span>
            </div>

            <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-1.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Overall Percentage</span>
              <span className="text-2xl font-black text-sky-400 font-mono tracking-tight">{overallPercentage.toFixed(1)}%</span>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-sky-450 bg-sky-550 bg-sky-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, overallPercentage)}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-1.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Assigned Grade</span>
              <span className="text-sm font-black text-emerald-400 uppercase tracking-wide block pt-1">{gradeText}</span>
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Class 10 benchmark standard</span>
            </div>

          </div>

          {/* Performance statement summary advice box */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
            <div className="flex items-center space-x-1.5 text-sky-455 text-sky-400">
              <Sparkles className="w-4 h-4 fill-current animate-pulse text-sky-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold">Automatic Performance Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{performanceSummary}</p>
          </div>

          {/* Recharts Graphical stats panel */}
          {subjects.length > 0 && (
            <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
              <span className="text-[10px] font-mono text-slate-405 text-slate-400 uppercase tracking-widest block font-bold">Scholastic Performance Variance</span>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: "11px" }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                    <Bar name="Grade Obtained (%)" dataKey="Percentage" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Strong vs Weak sectors comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strong modules cards */}
            <div className="p-5 bg-gradient-to-br from-emerald-950/15 to-transparent border border-emerald-500/10 rounded-xl space-y-3">
              <div className="flex items-center space-x-1.5 text-emerald-450 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Strong Pillars (&gt;= 85%)</span>
              </div>
              
              {strongSubjects.length === 0 ? (
                <p className="text-xs text-slate-500 italic pb-2">No subjects currently exceeding the 85% peak threshold.</p>
              ) : (
                <div className="space-y-1.5">
                  {strongSubjects.map(s => (
                    <div key={s.id} className="flex justify-between text-xs font-mono text-slate-300 p-1.5 bg-slate-950/40 rounded border border-emerald-950/30">
                      <span>{s.subjectName}</span>
                      <span className="text-emerald-400 font-bold">{s.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-emerald-950/45 flex items-start space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-400 leading-snug">
                  Excellent foundations. Leverage these fields for high-weightage college applications and scholarship entrance strategies.
                </span>
              </div>
            </div>

            {/* Help/Weak modules cards */}
            <div className="p-5 bg-gradient-to-br from-red-950/15 to-transparent border border-red-500/10 rounded-xl space-y-3">
              <div className="flex items-center space-x-1.5 text-red-450 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Conceptual Leakage (&lt; 75%)</span>
              </div>
              
              {weakSubjects.length === 0 ? (
                <p className="text-xs text-slate-500 italic pb-2">All subjects are comfortably positioned above baseline boundaries!</p>
              ) : (
                <div className="space-y-1.5">
                  {weakSubjects.map(s => (
                    <div key={s.id} className="flex justify-between text-xs font-mono text-slate-350 p-1.5 bg-slate-950/40 rounded border border-red-950/30">
                      <span>{s.subjectName}</span>
                      <span className="text-red-400 font-bold">{s.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-red-950/45 flex items-start space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-400 leading-snug">
                  Schedule active revision cycles (30m daily) and self-evaluations to repair these conceptual leakages before board thresholds.
                </span>
              </div>
            </div>

          </div>

          {/* Actionable Improvement Suggestions */}
          <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold block">Scientific Learning Optimization Prescriptions:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
              
              <div className="space-y-1 p-3 bg-slate-950 rounded border border-slate-850">
                <strong className="text-slate-200 block font-bold">1. Spaced Repititions</strong>
                <p className="text-[10px] text-slate-400 leading-relaxed">Divide weakest modules into flashcards and recall twice weekly. Re-evaluate every 14 days.</p>
              </div>

              <div className="space-y-1 p-3 bg-slate-950 rounded border border-slate-850">
                <strong className="text-slate-200 block font-bold">2. Feynman Techniques</strong>
                <p className="text-[10px] text-slate-400 leading-relaxed">Force explain complex topics (e.g. mechanics) in extremely simplistic terms. Repairs underlying gaps.</p>
              </div>

              <div className="space-y-1 p-3 bg-slate-950 rounded border border-slate-850">
                <strong className="text-slate-200 block font-bold">3. Mock Integrity</strong>
                <p className="text-[10px] text-slate-400 leading-relaxed">Simulate authentic exam settings with strict countdown timers. Minimizes exam-room distress.</p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
