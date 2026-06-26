import React, { useState } from "react";
import { 
  GitFork, Compass, Award, BookOpen, Star, TrendingUp, Info, 
  MapPin, CheckCircle2, DollarSign, ChevronRight, GraduationCap, Laptop, Sparkles, Layers
} from "lucide-react";

interface PathNode {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  subjects: string[];
  exams: string[];
  skills: string[];
  opportunities: string[];
  growth: string;
  salary: string;
}

export const Class10PathTree: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>("pcm");
  const [activeStream, setActiveStream] = useState<"science" | "commerce" | "arts" | "diploma" | "iti">("science");

  const pathData: Record<string, PathNode> = {
    // SCIENCE PCM
    pcm: {
      id: "pcm",
      name: "PCM (Physics, Chemistry, Mathematics)",
      description: "The primary non-medical trajectory focusing on physical science, analytical algorithms, and logic systems.",
      eligibility: "Completed Class 10 with strong grades in Math and Science.",
      subjects: ["Physics", "Chemistry", "Mathematics", "English", "Informatics Practices / Computer Science (Optional)"],
      exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "COMEDK", "State Engineering Entrances (MHT CET, WBJEE, etc.)"],
      skills: ["Mathematical problem-solving", "Quantitative logic", "Algorithmic thinking", "Physics mechanics models"],
      opportunities: ["Software Engineer", "AI/ML Scientist", "Aerospace Specialist", "Data Engineer", "Quant Trader"],
      growth: "Exponentially high with AI Automation, space expansion startups, and hyper-scale cloud operations.",
      salary: "₹6 LPA to ₹12 LPA (Entry), ₹15 LPA to ₹35 LPA (Mid-Career), ₹40+ LPA (Lead / Partner)"
    },
    // SCIENCE PCB
    pcb: {
      id: "pcb",
      name: "PCB (Physics, Chemistry, Biology)",
      description: "The medical and life sciences track tailored towards molecular biology, human anatomy, and organic chemistry.",
      eligibility: "Completed Class 10 with strong grades in Science.",
      subjects: ["Physics", "Chemistry", "Biology", "English", "Psychology / Biotechnology (Optional)"],
      exams: ["NEET-UG (National Eligibility-cum-Entrance Test)", "AIIMS B.Sc Nursing", "CUET (for Biotech & Agriculture)", "IISER Aptitude Test (Research)"],
      skills: ["Complex anatomical taxonomic memorization", "Laboratory analysis", "Medical ethics", "Diagnostic deduction"],
      opportunities: ["Doctor (MBBS/MD)", "Dentist (BDS)", "Biotechnologist", "Pharmacologist", "Clinical Research Associate", "Geneticist"],
      growth: "Very high with aging populations, gene-editing therapy, clinical diagnostics, and vaccine biotechnology.",
      salary: "₹5 LPA to ₹9 LPA (Entry), ₹12 LPA to ₹28 LPA (Mid-Career), ₹30+ LPA (Consultant Specialists)"
    },
    // SCIENCE PCMB
    pcmb: {
      id: "pcmb",
      name: "PCMB (Physics, Chemistry, Math, Biology)",
      description: "The dual-science elite track that offers flexibility to shift between medical, engineering, or bioinformatics.",
      eligibility: "Completed Class 10 with exceptionally high cumulative performance in Math and Science.",
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
      exams: ["Both JEE Main & NEET-UG", "IISER IAT", "National Entrance Screening Test (NEST)", "ICAR AIEEA"],
      skills: ["High operational focus", "Simultaneous mathematical calculus and biology memorization", "Research methodology"],
      opportunities: ["Biomedical Engineer", "Bioinformatics Scientist", "Neuro-Robotics Developer", "Medical Technology Advisor"],
      growth: "Synergistic growth in health-tech, computational biology, bio-computation, and medical engineering.",
      salary: "₹7 LPA to ₹14 LPA (Entry), ₹18 LPA to ₹40 LPA (Mid-Career)"
    },
    // COMMERCE
    commerce: {
      id: "commerce",
      name: "Commerce & Business Management",
      description: "Focused on business statistics, accountancy registries, financial laws, investment banking, and taxation models.",
      eligibility: "Completed Class 10 with an interest in business management and quantitative systems.",
      subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics (Core/Applied) or Informatics Practices", "English"],
      exams: ["CA Foundation", "CSEET (CS Entrance)", "CMA Foundation", "CUET (B.Com/BBA)", "NPAT", "IPMAT"],
      skills: ["Financial account bookkeeping", "Audit procedures", "Macroeconomics modeling", "Corporate compliance logic"],
      opportunities: ["Chartered Accountant (CA)", "Investment Banker", "Corporate Secretary (CS)", "Financial Analyst", "Portfolio Manager"],
      growth: "Steady growth backed by startup expansions, corporate governance compliance, and international auditing standards.",
      salary: "₹6 LPA to ₹15 LPA (Entry), ₹16 LPA to ₹35 LPA (Mid-Career), ₹50+ LPA (CA Partner / CXO)"
    },
    // HUMANITIES
    arts: {
      id: "arts",
      name: "Humanities & Liberal Arts",
      description: "Focused on political sociology, historical patterns, regulatory policy drafts, psychology, and structural litigation.",
      eligibility: "Completed Class 10 with reading speeds and critical reasoning interest.",
      subjects: ["History", "Political Science", "Sociology", "Psychology", "Geography", "Economics", "English"],
      exams: ["CLAT (Common Law Admission Test)", "AILET (Law)", "CUET (BA/BSOC)", "UPSC civil trials (Post-Graduation Stage)"],
      skills: ["Critical comprehensive reading", "Analytical descriptive argumentation", "Policy analysis", "Public advocacy"],
      opportunities: ["Corporate advocate", "Civil Servant (IAS/IFS/IPS)", "Media Journalist", "International Policy Consultant", "Clinical Psychologist"],
      growth: "Strong growth in public policy institutes, litigation law firms, content agencies, and governmental operations.",
      salary: "₹4 LPA to ₹8 LPA (Entry), ₹10 LPA to ₹22 LPA (Mid-Career), ₹25+ LPA (Senior Counsel / Officer)"
    },
    // DIPLOMA
    diploma: {
      id: "diploma",
      name: "Technical Diploma (Polytechnic)",
      description: "A fast-track vocational engineering course that bypasses Class 11/12 to start practical technical work early.",
      eligibility: "Completed Class 10 with standard pass grades.",
      subjects: ["Applied Mathematics", "Applied Physics", "Workshop Engineering", "CAD Drafting", "Electrical/Mechanical Trade Theory"],
      exams: ["State POLYCET", "JEXPO", "DET", "PAT"],
      skills: ["Technical schematic analysis", "CNC/Machine troubleshooting", "Structural CAD blueprints", "Hands-on engineering"],
      opportunities: ["Junior Mechanical Engineer", "Site Supervisor", "Technical Draftsman", "Testing Supervisor"],
      growth: "Enables lateral entry into the 2nd year of B.Tech / BE Engineering courses without appearing for JEE Main.",
      salary: "₹2.5 LPA to ₹4.5 LPA (Entry), ₹5 LPA to ₹9 LPA (Mid-Career), ₹10+ LPA (Senior Trade Captain)"
    },
    // ITI
    iti: {
      id: "iti",
      name: "ITI (Industrial Training Institutes)",
      description: "Short-term hands-on training focusing solely on trade-level manual mechanics, electrical fitment, and trades.",
      eligibility: "Completed Class 10 / Class 8 depending on the specific trade division.",
      subjects: ["Trade Practicals", "Workshop Science & Mathematics", "Engineering Drawing", "Employability Trade Skills"],
      exams: ["AITT (All India Trade Test) under NCVT", "State ITI Entrance Exams"],
      skills: ["Troubleshooting electrical grids", "Precision metal fitting", "High-temperature welding", "Practical machinery repair"],
      opportunities: ["Railway Technician", "Grid Electrician", "Fitter Machinist", "Industrial Welder", "Technician Contractor"],
      growth: "Immediate placement in federal enterprises (Railways, Indian Army, state grids, BHEL, SAIL) or local trades.",
      salary: "₹1.8 LPA to ₹3 LPA (Entry), ₹4 LPA to ₹7 LPA (Mid-Career), ₹8+ LPA (Independent Contractor)"
    }
  };

  const selectedData = pathData[selectedNode] || pathData.pcm;

  return (
    <div id="class10PathTree" className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-6">
      
      {/* Visual Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-sky-400 rotate-90" />
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Class 10 Strategic Path Tree</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Navigate the interactive post-Class 10 branching tree structure. Click on any path to decompress curriculum metrics, exams, and salary.
          </p>
        </div>

        {/* Categories selector tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80 self-start">
          {[
            { id: "science", label: "Science Branches" },
            { id: "commerce", label: "Commerce" },
            { id: "arts", label: "Humanities" },
            { id: "diploma", label: "Diploma / ITI" }
          ].map((stream) => (
            <button
              key={stream.id}
              onClick={() => {
                setActiveStream(stream.id as any);
                if (stream.id === "science") setSelectedNode("pcm");
                else if (stream.id === "commerce") setSelectedNode("commerce");
                else if (stream.id === "arts") setSelectedNode("arts");
                else setSelectedNode("diploma");
              }}
              className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
                activeStream === stream.id 
                  ? "bg-sky-500 text-slate-950 font-bold" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {stream.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main split dashboard: Tree View on Left, Details Visualizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE VISUAL HIERARCHICAL TREE (Lg: 5/12 cols) */}
        <div className="lg:col-span-6 p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Interactive Schematic</span>
          
          <div className="flex flex-col space-y-3 relative pl-4 border-l-2 border-slate-800 pb-2">
            
            {/* Root: CLASS 10 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg max-w-xs relative -left-8">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></div>
                <strong className="text-white text-xs tracking-wider uppercase font-mono">ROOT Node: Class 10</strong>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Core secondary evaluation point</p>
            </div>

            {/* Science branch tree branch */}
            <div className={`${activeStream === "science" ? "opacity-100" : "opacity-60"} transition-all space-y-2`}>
              <div className="text-sky-400 text-[10px] font-mono font-bold uppercase tracking-wider mt-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded bg-sky-450 bg-sky-500"></span>
                <span>Science Stream Options (Grade 11/12)</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pl-4">
                {[
                  { id: "pcm", label: "Science - PCM Route", desc: "Non-medical engineering track" },
                  { id: "pcb", label: "Science - PCB Route", desc: "Medical and biotech sciences track" },
                  { id: "pcmb", label: "Science - PCMB Route", desc: "Dual analytical generalist elite track" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedNode(item.id);
                      setActiveStream("science");
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group cursor-pointer ${
                      selectedNode === item.id 
                        ? "bg-sky-505/10 bg-sky-500/10 border-sky-550/40 border-sky-400/40 text-sky-400 font-bold" 
                        : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-350"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{item.label}</span>
                      <span className="text-[9px] font-mono text-slate-500 font-normal">{item.desc}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedNode === item.id ? "text-sky-400 translate-x-1" : "text-slate-600 group-hover:translate-x-1"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Commerce branch tree */}
            <div className={`${activeStream === "commerce" ? "opacity-100" : "opacity-60"} transition-all space-y-2`}>
              <div className="text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider mt-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded bg-indigo-500"></span>
                <span>Commerce Stream Options (Grade 11/12)</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pl-4">
                <button
                  onClick={() => {
                    setSelectedNode("commerce");
                    setActiveStream("commerce");
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group cursor-pointer ${
                    selectedNode === "commerce" 
                      ? "bg-indigo-550/10 bg-indigo-500/10 border-indigo-455/40 border-indigo-500/40 text-indigo-400 font-bold" 
                      : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-350"
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold block">Commerce with/without Math</span>
                    <span className="text-[9px] font-mono text-slate-500 font-normal">Finance management and ledger sciences</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Arts branch tree */}
            <div className={`${activeStream === "arts" ? "opacity-100" : "opacity-60"} transition-all space-y-2`}>
              <div className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider mt-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded bg-emerald-500"></span>
                <span>Humanities / Arts Stream Options (Grade 11/12)</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pl-4">
                <button
                  onClick={() => {
                    setSelectedNode("arts");
                    setActiveStream("arts");
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group cursor-pointer ${
                    selectedNode === "arts" 
                      ? "bg-emerald-550/10 bg-emerald-500/10 border-emerald-455/40 border-emerald-500/40 text-emerald-400 font-bold" 
                      : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-350"
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold block">Humanities & Liberal Arts</span>
                    <span className="text-[9px] font-mono text-slate-500 font-normal">Geopolitical laws, literature, and social sciences</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Diploma / ITI tree */}
            <div className={`${activeStream === "diploma" ? "opacity-100" : "opacity-60"} transition-all space-y-2`}>
              <div className="text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider mt-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded bg-amber-500"></span>
                <span>Vocational & Technical Trades (Class 10 Direct Entry)</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pl-4">
                {[
                  { id: "diploma", label: "3-Year Engineering Diploma", desc: "Polytechnic applied structural studies" },
                  { id: "iti", label: "ITI Trades Certifications", desc: "Industrial apprenticeships and trades" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedNode(item.id);
                      setActiveStream("diploma");
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group cursor-pointer ${
                      selectedNode === item.id 
                        ? "bg-amber-550/10 bg-amber-500/10 border-amber-455/40 border-amber-500/40 text-amber-400 font-bold" 
                        : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-350"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{item.label}</span>
                      <span className="text-[9px] font-mono text-slate-500 font-normal">{item.desc}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PATH STATISTICS DECRYPTER SHEET (Lg: 7/12 cols) */}
        <div className="lg:col-span-6 p-6 bg-slate-950/60 border border-slate-800 rounded-xl space-y-5 animate-fadeIn">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-900">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Information Ledger</span>
            <div className="flex items-center space-x-1 text-sky-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{selectedData.id.toUpperCase()} MODULE</span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black text-white">{selectedData.name}</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{selectedData.description}</p>
          </div>

          {/* Core Info list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Eligibility */}
            <div className="p-3 bg-slate-900/40 border border-slate-850/80 rounded-lg space-y-1">
              <span className="text-[9px] font-mono text-slate-550 text-slate-500 uppercase block font-bold">Eligibility Standards</span>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{selectedData.eligibility}</p>
            </div>

            {/* Growth */}
            <div className="p-3 bg-slate-900/40 border border-slate-850/80 rounded-lg space-y-1">
              <span className="text-[9px] font-mono text-slate-555 text-slate-500 uppercase block font-bold">Future Growth Outlook</span>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{selectedData.growth}</p>
            </div>

          </div>

          {/* Subjects and exams list */}
          <div className="space-y-4">
            
            {/* Subjects required */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block font-bold">Required Subjects List</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedData.subjects.map((sub, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-mono px-2 py-1 bg-slate-900 border border-slate-850 rounded text-slate-300 font-medium"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Exams list */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Entrance Examinations</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedData.exams.map((ex, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-mono px-2 py-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 rounded font-bold"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills Needed */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block font-bold">Recommended Skills to Build</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedData.skills.map((sk, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-mono px-2 py-1 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Expected Career Opportunities</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedData.opportunities.map((opp, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-mono px-2 py-1 bg-slate-900/60 border border-slate-850 rounded text-slate-300"
                  >
                    {opp}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Salary estimation bracket */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/10 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Expected Growth & Salary Insights (India Scale)</span>
            </span>
            <p className="text-xs text-white font-mono font-extrabold">{selectedData.salary}</p>
          </div>

        </div>

      </div>

    </div>
  );
};
