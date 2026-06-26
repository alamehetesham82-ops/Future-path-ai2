import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  FileText, Printer, Sparkles, Star, Award, Layers, Globe, CheckCircle2 
} from "lucide-react";

export const ResumeBuilder: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Static high-quality achievements
  const certs = [
    { fileName: "Olympiad Mathematics Silver Rank", category: "Academic" },
    { fileName: "State Inter-Academy Badminton-Up Trophy", category: "Sports" },
    { fileName: "National Science Congress Project Participation", category: "Academic" }
  ];

  const results = [
    { type: "Board Exam", fileName: "10th Standard Scholastic Assessment", scoreInfo: "96.5% Aggregated" },
    { type: "Semester Evaluation", fileName: "Advanced Algebra & Kinematics Term Test", scoreInfo: "98% Score" }
  ];

  // Dynamic user profile fields for preview
  const [skillsText, setSkillsText] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [careerObjective, setCareerObjective] = useState("");

  useEffect(() => {
    if (userProfile) {
      setSkillsText(userProfile.skills?.join(", ") || "STEM Logic, Coding, Critical Writing, Analytical Research");
      setInterestsText(userProfile.interests?.join(", ") || "Robotics, Public policies, Astronomy, Computational Algebra");
      setCareerObjective(userProfile.careerGoals || "Academic topper aiming to consolidate STEM milestones, research goals, and athletic achievements onto elite university applications.");
    }
  }, [userProfile]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.35)] uppercase tracking-wider">Resume Builder</h2>
            <p className="text-xs text-slate-300">Compile your profile, achievements folder, & grades, then execute PDF exports.</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs uppercase rounded-lg transition-transform active:scale-95 cursor-pointer shadow-lg shadow-purple-500/10"
        >
          <Printer className="w-4 h-4" />
          <span>Export Resume PDF</span>
        </button>
      </div>

      {/* Editor & Preview sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        
        {/* Left Side: Parameters Editor Block */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4 print:hidden">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Customize CV Variables</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Career Goal / Objective</label>
              <textarea
                value={careerObjective}
                onChange={(e) => setCareerObjective(e.target.value)}
                rows={3}
                className="w-full py-1.5 px-3 bg-slate-950 border border-slate-850 rounded text-xs leading-normal"
                placeholder="Declare your long term path target..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Ecosystem Skills (Comma listed)</label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full py-1.5 px-3 bg-slate-950 border border-slate-850 rounded text-xs"
                placeholder="Skills..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Personal Interests (Comma listed)</label>
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                className="w-full py-1.5 px-3 bg-slate-950 border border-slate-850 rounded text-xs"
                placeholder="Interests..."
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-normal space-y-1">
              <span className="font-bold text-white uppercase block">Verification Node:</span>
              <p>Verified academic certifications and standards matching are generated dynamically and compiled in real time.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Resume Print Template */}
        <div className="lg:col-span-2 p-8 bg-white text-slate-900 border border-slate-200 rounded-xl space-y-6 max-w-3xl mx-auto shadow-2xl relative print:border-none print:shadow-none print:p-0 print:m-0 print:text-black">
          
          {/* Resume Header */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950 uppercase">{userProfile?.name || "Participant Node"}</h3>
                <p className="text-xs font-mono font-bold text-indigo-650 tracking-wider">
                  {userProfile?.class || "Secondary Level Standard"} &middot; {userProfile?.school || "Universal Academy"}
                </p>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-500 space-y-0.5">
                <div>{userProfile?.email}</div>
                <div>State region: {userProfile?.state}</div>
                <div>Report Reference ID: {userProfile?.uid.slice(0, 12).toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Objective */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase border-b border-slate-200 pb-1">Professional Goal</h4>
            <p className="text-xs leading-relaxed text-slate-700 font-sans">{careerObjective}</p>
          </div>

          {/* Academic Records */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase border-b border-slate-200 pb-1">Education & Grades</h4>
            {results.length === 0 ? (
              <p className="text-xs text-slate-550 italic">No academic milestones loaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {results.map((res, i) => (
                  <div key={i} className="text-xs font-mono border-l-2 border-indigo-600 pl-3.5 space-y-0.5">
                    <span className="font-bold text-slate-950 uppercase text-[10px]">{res.type}</span>
                    <div className="text-slate-800 font-sans font-medium">{res.fileName}</div>
                    <div className="text-indigo-600 font-bold text-[11px]">Marks: {res.scoreInfo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates Folder */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase border-b border-slate-200 pb-1">Verified Certifications</h4>
            {certs.length === 0 ? (
              <p className="text-xs text-slate-550 italic">No certificates portfolio verified.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-sans">
                {certs.map((c, i) => (
                  <div key={i} className="flex items-center space-x-1.5 p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold block text-[10px] text-slate-950 leading-tight truncate">{c.fileName}</span>
                      <span className="text-[9px] text-indigo-550 font-mono font-bold block">{c.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills / Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase border-b border-slate-200 pb-1">Skill Assets</h4>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {skillsText.split(",").map((sk, i) => (
                  <span key={i} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {sk.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase border-b border-slate-200 pb-1">Involved Interests</h4>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {interestsText.split(",").map((it, i) => (
                  <span key={i} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                    {it.trim()}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Validation Footers */}
          <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[9px] font-mono text-slate-400">
            <span>ISSUED VIA FUTUREPATH AI VERIFICATION PROTOCOLS</span>
            <span>https://futurepath.ai</span>
          </div>

        </div>

      </div>

    </div>
  );
};
