import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { GroqService, ChatMessage } from "../services/groq";
import { 
  Sparkles, Send, Bot, User, Trash2, ArrowRight, Loader2, Compass, 
  HelpCircle, GraduationCap, Trophy, Cpu 
} from "lucide-react";

export const AICounselor: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick Action form parameters
  const [qaTopic, setQaTopic] = useState<"counsel" | "college" | "dual-sport">("counsel");
  
  // College parameters
  const [field, setField] = useState("");
  const [grades, setGrades] = useState("");
  const [location, setLocation] = useState("");

  // Sports parameters
  const [sport, setSport] = useState("");
  const [medals, setMedals] = useState("");
  const [rank, setRank] = useState("");

  useEffect(() => {
    // Welcome message based on user profile
    setMessages([
      {
        role: "assistant",
        content: `Greetings ${userProfile?.name || "Scholar"}! I am your autonomous AI Career Advisor.

I am connected directly with our cloud processors to resolve:
1. Optimal Academic Stream paths (Science vs Humanities vs CA Tracks)
2. Dual-Career roadmaps for competitive athletes (Sports rankings along college metrics)
3. Higher education matches, criteria, and scholarship triggers.

How may I map your future path today? Use the sidebar preset calculators or trigger natural talks below!`
      }
    ]);
  }, [userProfile]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    if (!textToSend) setInputText("");

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await GroqService.chat(newMessages);
      setMessages([...newMessages, { role: "assistant" as const, content: resp.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant" as const, content: "My processors timed out. Please execute a terminal reload or check your local console logs." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Perform hard wipe of terminal memory state?")) {
      setMessages([
        {
          role: "assistant",
          content: "System memory flushed. Terminal connection re-established with Groq matrices. What shall we design?"
        }
      ]);
    }
  };

  const triggerCollegeAudit = async () => {
    if (!field || !grades) {
      alert("Please configure study fields and academic grades!");
      return;
    }
    setLoading(true);
    const initialText = `Generate College guidance report:\n- Fields: ${field}\n- Grade Percentages: ${grades}%\n- Location target: ${location || "Anywhere"}`;
    
    // Add user note
    const currentMsgs = [...messages, { role: "user" as const, content: initialText }];
    setMessages(currentMsgs);

    try {
      const resp = await GroqService.getCollegeAlignmentGuidance(field, grades, "Standard Entry", location || "All Regions");
      setMessages([...currentMsgs, { role: "assistant" as const, content: resp.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDualSportAudit = async () => {
    if (!sport || !medals) {
      alert("Please specify the athletic sports category and achievements!");
      return;
    }
    setLoading(true);
    const initialText = `Generate Dual-Career Sports route map:\n- Athletics: ${sport}\n- Achievements / Medals: ${medals}\n- Rank / Level: ${rank || "State Level"}`;

    const currentMsgs = [...messages, { role: "user" as const, content: initialText }];
    setMessages(currentMsgs);

    try {
      const resp = await GroqService.getSportsCareerGuidance(sport, medals, rank || "State Rank", "15-18 Age bracket");
      setMessages([...currentMsgs, { role: "assistant" as const, content: resp.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20 animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)] uppercase tracking-wider">AI Career Counselor</h2>
            <p className="text-xs text-slate-300">Powered by high-clearance Groq & Gemini cloud backends.</p>
          </div>
        </div>

        <button 
          onClick={clearChat}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/50 text-red-400 hover:text-red-300 text-xs font-mono border border-red-900/30 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Wipe Memory</span>
        </button>
      </div>

      {/* Main chat structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Widget forms / configuration calculators */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Advisor Presets</h3>
            
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => setQaTopic("counsel")}
                className={`py-2 px-3 text-left rounded-lg text-xs font-mono transition-colors flex items-center space-x-2 ${
                  qaTopic === "counsel" 
                    ? "bg-sky-500/10 border-l-2 border-sky-500 text-sky-400" 
                    : "hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>General Career Q&A</span>
              </button>

              <button
                onClick={() => setQaTopic("college")}
                className={`py-2 px-3 text-left rounded-lg text-xs font-mono transition-colors flex items-center space-x-2 ${
                  qaTopic === "college" 
                    ? "bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-400" 
                    : "hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>College Matcher</span>
              </button>

              <button
                onClick={() => setQaTopic("dual-sport")}
                className={`py-2 px-3 text-left rounded-lg text-xs font-mono transition-colors flex items-center space-x-2 ${
                  qaTopic === "dual-sport" 
                    ? "bg-amber-500/10 border-l-2 border-amber-500 text-amber-500" 
                    : "hover:bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Sports Corridor Dual-Plan</span>
              </button>
            </div>

            {/* Sub-panels based on selection */}
            {qaTopic === "college" && (
              <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Study Field</label>
                  <input 
                    type="text" 
                    value={field} 
                    onChange={(e) => setField(e.target.value)} 
                    className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs" 
                    placeholder="Data science, Medicine..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Average Marks (%)</label>
                  <input 
                    type="number" 
                    value={grades} 
                    onChange={(e) => setGrades(e.target.value)} 
                    className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs" 
                    placeholder="e.g. 92"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Location targets</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs" 
                    placeholder="e.g. Mumbai, Canada..."
                  />
                </div>
                <button
                  onClick={triggerCollegeAudit}
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  Match Admissions
                </button>
              </div>
            )}

            {qaTopic === "dual-sport" && (
              <div className="pt-3 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Athletic Discipline</label>
                  <input 
                    type="text" 
                    value={sport} 
                    onChange={(e) => setSport(e.target.value)} 
                    className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs" 
                    placeholder="Cricket, Football, Chess..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">State / Medals logged</label>
                  <input 
                    type="text" 
                    value={medals} 
                    onChange={(e) => setMedals(e.target.value)} 
                    className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs" 
                    placeholder="Gold SGFI, CBSE cluster..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Current Ranking</label>
                  <input 
                    type="text" 
                    value={rank} 
                    onChange={(e) => setRank(e.target.value)} 
                    className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded text-xs" 
                    placeholder="e.g. Under-17 State Rank 5"
                  />
                </div>
                <button
                  onClick={triggerDualSportAudit}
                  disabled={loading}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  Generate Dual Roadmap
                </button>
              </div>
            )}

            {qaTopic === "counsel" && (
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-normal space-y-2">
                <span className="font-bold text-slate-200">Suggested Inquiries:</span>
                <p 
                  onClick={() => handleSendMessage("What computer science branches pay high salary figures?")}
                  className="hover:text-sky-400 transition-colors cursor-pointer p-1.5 bg-slate-950 rounded border border-slate-800/80"
                >
                  &rarr; What computing fields pay the best?
                </p>
                <p 
                  onClick={() => handleSendMessage("Suggest high-demand career targets for Commerce with Applied Math.")}
                  className="hover:text-sky-400 transition-colors cursor-pointer p-1.5 bg-slate-950 rounded border border-slate-800/80"
                >
                  &rarr; High-demand Commerce targets
                </p>
                <p 
                  onClick={() => handleSendMessage("How can I prepare for administrative IAS examinations from Class 10?")}
                  className="hover:text-sky-400 transition-colors cursor-pointer p-1.5 bg-slate-950 rounded border border-slate-800/80"
                >
                  &rarr; Plan civil services prep early
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Right column: Main messaging panel */}
        <div className="lg:col-span-3 flex flex-col h-[520px] bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex space-x-3 max-w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot Icon */}
                {msg.role !== "user" && (
                  <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg shrink-0 w-9 h-9 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                {/* Bubble content */}
                <div 
                  className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-3xl whitespace-pre-wrap border ${
                    msg.role === "user" 
                      ? "bg-slate-950 text-slate-100 border-slate-850 rounded-tr-none" 
                      : "bg-[#0A0F1D] border-slate-800/85 text-slate-350 rounded-tl-none shadow-sm shadow-sky-950/5"
                  }`}
                >
                  {msg.content}
                </div>

                {/* User Icon */}
                {msg.role === "user" && (
                  <div className="p-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg shrink-0 w-9 h-9 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex space-x-3 items-center">
                <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg shrink-0 w-9 h-9 flex items-center justify-center">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-[11px] font-mono text-slate-500 animate-pulse">
                  SUMMONING DEEP INTELLIGENCE...
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>

          {/* Chat input panel */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-[#0A0F1D] border border-slate-800 focus:border-sky-500/70 focus:outline-none focus:ring-1 focus:ring-sky-500/25 rounded-lg text-xs placeholder:text-slate-650 text-slate-100"
              placeholder="Query any CBSE streams, athlete pathways, or college requirements..."
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={loading}
              className="p-2.5 bg-sky-500 hover:bg-sky-450 disabled:opacity-50 text-white rounded-lg transition-transform active:scale-95 cursor-pointer shadow-md shadow-sky-500/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
