import React from "react";
import { HelpCircle, ChevronRight, BookOpen, MessageSquare, Shield, Settings } from "lucide-react";

export const HelpCenter: React.FC = () => {
  const faqs = [
    {
      q: "How does the AI Counselor analyze my child’s career outlook?",
      a: "Our core AI compiles your child's student profile (interests, skills, class, target goals) alongside secure academic grader logs and certified milestones to provide customized, CBSE-compliant guidelines."
    },
    {
      q: "Is my uploaded Certificate data secure?",
      a: "Absolutely. Under our Google Play and GDPR security compliance architectures, all certificate scans and board outcomes exist locked behind isolated storage subdirectories (`users/{uid}/certificates/`), preventing unauthorized indexing."
    },
    {
      q: "How can I update my target Career and Skills tags?",
      a: "Simply browse to the Settings console under the main dashboard, edit your skills, state tags, target school, and career benchmarks, then commit changes to update your profile automatically."
    },
    {
      q: "Can I print or download my generated resume as a PDF?",
      a: "Yes! The Resume Builder pulls verified results and certifications directly from your database, structuring them on a clean, modern layout. Simply click 'Export Resume PDF' to trigger standard print options on your browser."
    }
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-505/20 animate-pulse">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">Help Center</h2>
          <p className="text-xs text-slate-400">Read setup guides, search answers, review FAQ boards, or contact school administrators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FAQ panels */}
        <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg space-y-1">
                <span className="font-bold text-xs text-slate-205 block">{faq.q}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guides & Resources Column */}
        <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl space-y-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Setup Handbooks & Guides</h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start space-x-3.5 p-3.5 bg-slate-950 rounded-lg border border-slate-850">
              <BookOpen className="w-5 h-5 text-yellow-450 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block">Student Roadmap Handbook</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Understand stream definitions (Science, Commerce, Humanities, Vocational), Olympiad cutoffs, and collegiate training clubs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 bg-slate-950 rounded-lg border border-slate-850">
              <Shield className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block">Parent Verification Guide</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  A step-by-step walkthrough explaining to parents how to review audit checklists, track children's grades, and access counselor charts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 bg-slate-950 rounded-lg border border-slate-850">
              <MessageSquare className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block">Groq AI Terminal Setup</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Details about Groq's high-speed completions API, explaining how to securely configure cloud secrets keys.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
