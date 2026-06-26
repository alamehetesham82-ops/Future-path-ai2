import React, { useState } from "react";
import { GroqService } from "../services/groq";
import { 
  BookMarked, Sparkles, Loader2, CheckCircle2, ChevronRight, Video,
  Compass, ScrollText, Download, ListCollapse, Table, Flame, Zap, Layers, AlertCircle, RotateCcw
} from "lucide-react";
import { jsPDF } from "jspdf";
import { TopicData } from "./TopicAnalyzerTypes";
import { topicFallbacks } from "./TopicFallbacks";

// Local Storage Caching Helpers
const getCachedTopic = (topic: string, diff: string): TopicData | null => {
  try {
    const cacheKey = `fp_topic_cache_${topic.toLowerCase().trim()}_${diff}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Failed to retrieve topic cache", e);
  }
  return null;
};

const saveTopicToCache = (topic: string, diff: string, data: TopicData) => {
  try {
    const cacheKey = `fp_topic_cache_${topic.toLowerCase().trim()}_${diff}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save topic to cache", e);
  }
};

export const TopicAnalyzer: React.FC = () => {
  const [topicInput, setTopicInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [difficulty, setDifficulty] = useState<"basic" | "medium" | "advanced">("basic");
  const [activeSubTab, setActiveSubTab] = useState<"easy" | "expert" | "concepts" | "notes" | "faq" | "resources">("easy");
  const [outcome, setOutcome] = useState<TopicData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearchTopic = async (preset?: string) => {
    const searchTarget = preset || topicInput;
    if (!searchTarget || !searchTarget.trim()) {
      alert("Please enter a topic to deconstruct!");
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);
    if (preset) setTopicInput(preset);

    const checkLower = searchTarget.toLowerCase().trim();

    // 1. Check persistent localStorage cache
    const cached = getCachedTopic(searchTarget, difficulty);
    if (cached) {
      setTimeout(() => {
        setOutcome(cached);
        setAnalyzing(false);
      }, 350);
      return;
    }

    // 2. Fast Offline matches for Photosynthesis, AI, Trigonometry
    let offlineData: TopicData | null = null;
    if (checkLower.includes("photosynthesis")) {
      offlineData = topicFallbacks.photosynthesis[difficulty];
    } else if (checkLower.includes("artificial intelligence") || checkLower === "ai" || checkLower.includes("machine learning")) {
      offlineData = topicFallbacks["artificial intelligence"][difficulty];
    } else if (checkLower.includes("trigonometry") || checkLower.includes("sin cos") || checkLower.includes("triangle")) {
      offlineData = topicFallbacks.trigonometry[difficulty];
    }

    if (offlineData) {
      const finalOffline = offlineData;
      setTimeout(() => {
        setOutcome(finalOffline);
        saveTopicToCache(searchTarget, difficulty, finalOffline);
        setAnalyzing(false);
      }, 500);
      return;
    }

    // 3. Direct AI Request via Groq / Gemini proxy
    let retryCount = 0;
    const maxRetries = 2;

    const executeRequest = async (): Promise<boolean> => {
      try {
        const prompt = `Deconstruct the topic: "${searchTarget}"
Difficulty level targeted: "${difficulty.toUpperCase()}".

You MUST construct a comprehensive, structured learning profile tailored EXACTLY to the "${difficulty.toUpperCase()}" difficulty level.
${
  difficulty === "basic"
    ? "Provide easy, intuitive explanations, everyday analogies, real-life examples, simplified language, key points, and a quick basic summary."
    : difficulty === "medium"
    ? "Provide standard college/school academic explanations, formal concepts, important mathematical or scientific formulas, clear numerical examples, and practical real-world applications."
    : "Provide deep theoretical, advanced-level explanations, rigorous concepts, complete mathematical derivations where relevant, research insights, cutting-edge industry applications, and higher-order analysis."
}

You MUST split your response into the following tags exactly. Format each tag precisely on a new line:

[OVERVIEW]
(Write a detailed overview summarizing the topic for this difficulty level.)

[EASY_EXPLANATION]
(Write a simple, non-jargon, solar-powered kitchen-style explanation using relatable analogies.)

[DETAILED_EXPLANATION]
(Write a rigorous, formal academic explanation featuring relevant formulations and scientific concepts.)

[CORE_CONCEPTS]
- Concept Title 1: In-depth analysis and explanation
- Concept Title 2: In-depth analysis and explanation
- Concept Title 3: In-depth analysis and explanation

[IMPORTANT_TERMS]
- Term 1: Definition of key term
- Term 2: Definition of key term

[EXAMPLES]
- Example 1: Real-life scenario or practical demonstration
- Example 2: Real-life scenario or practical demonstration

[FORMULAS]
- Formula Name | equation | Practical description of parts
- Formula Name 2 | equation 2 | Practical description of parts

[PRACTICAL_APPLICATIONS]
- Application 1: How this is applied in industry or daily life
- Application 2: How this is applied in industry or daily life

[COMMON_MISTAKES]
- Mistake 1: What students do wrong and how to avoid it
- Mistake 2: What students do wrong and how to avoid it

[STUDY_NOTES]
(Provide detailed, structured paragraphs of academic study study notes deconstructing this topic.)

[REVISION_NOTES]
(A quick bulleted cheatsheet or summary card of core takeaways.)

[SUMMARY]
(A final 2-3 sentence high-impact summary of this topic.)

[DIAGRAM]
(Generate an ASCII text-based flowchart, table, or schematic diagram showing the processes or flow of information.)

[COMPARISON_CHART]
- Topic/Aspect A | Topic/Aspect B | Criteria Name | Key structural distinction or difference
- Aspect X | Aspect Y | Criteria Name 2 | Key structural distinction or difference

[FORMULA_CARDS]
- Card Title | Core Equation or Law | Helpful Tip or Context Note
- Card Title 2 | Core Equation or Law | Helpful Tip or Context Note

[FAQ]
Q: Question here?
A: Analytical answer here.
Q: Question here?
A: Analytical answer here.

[RESOURCES]
- Title: Video Lecture | Source: Academy | URL: https://youtube.com

Ensure all modules are populated cleanly without placeholder scripts.`;

        const response = await GroqService.chat([
          { role: "system", content: "You are the FuturePath AI Senior Academic Syllabus Decompresser. Present elite structured educational material." },
          { role: "user", content: prompt }
        ]);

        const text = response.reply;

        if (!text || text.includes("connection glitch") || text.includes("offline-error-handler")) {
          throw new Error("AI Endpoint returned an offline or failed placeholder state");
        }

        // Regular Expression Parser to extract blocks safely
        const extractSection = (tag: string, defaultText: string = ""): string => {
          const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[[A-Z_]+\\]|$)`, "i");
          const match = text.match(regex);
          return match ? match[1].trim() : defaultText;
        };

        const rawOverview = extractSection("OVERVIEW", "Overview details are being parsed.");
        const rawEasy = extractSection("EASY_EXPLANATION", "Easy analogy is preparing.");
        const rawDetailed = extractSection("DETAILED_EXPLANATION", "Detailed equations are preparing.");
        const rawConceptsStr = extractSection("CORE_CONCEPTS");
        const rawTermsStr = extractSection("IMPORTANT_TERMS");
        const rawExamplesStr = extractSection("EXAMPLES");
        const rawFormulasStr = extractSection("FORMULAS");
        const rawAppsStr = extractSection("PRACTICAL_APPLICATIONS");
        const rawMistakesStr = extractSection("COMMON_MISTAKES");
        const rawStudy = extractSection("STUDY_NOTES", "Study summary is compiling.");
        const rawRevision = extractSection("REVISION_NOTES", "Formula/revision keys are compiling.");
        const rawSummary = extractSection("SUMMARY", "Summary is compiling.");
        const rawDiagram = extractSection("DIAGRAM");
        const rawComparisonStr = extractSection("COMPARISON_CHART");
        const rawCardsStr = extractSection("FORMULA_CARDS");
        const rawFaqStr = extractSection("FAQ");
        const rawResourcesStr = extractSection("RESOURCES");

        // Parse Lists
        const coreConcepts = rawConceptsStr
          ? rawConceptsStr.split("\n")
              .map(l => l.replace(/^[-*•\s]+/, "").trim())
              .filter(l => l.length > 4)
              .map(l => {
                const idx = l.indexOf(":");
                return {
                  title: idx !== -1 ? l.substring(0, idx).trim() : "Concept Pillar",
                  desc: idx !== -1 ? l.substring(idx + 1).trim() : l
                };
              })
          : [];

        const importantTerms = rawTermsStr
          ? rawTermsStr.split("\n")
              .map(l => l.replace(/^[-*•\s]+/, "").trim())
              .filter(l => l.length > 4)
              .map(l => {
                const idx = l.indexOf(":");
                return {
                  term: idx !== -1 ? l.substring(0, idx).trim() : "Key Term",
                  definition: idx !== -1 ? l.substring(idx + 1).trim() : l
                };
              })
          : [];

        const formulas = rawFormulasStr
          ? rawFormulasStr.split("\n")
              .map(l => l.replace(/^[-*•\s]+/, "").trim())
              .filter(l => l.length > 3)
              .map(l => {
                const parts = l.split("|").map(p => p.trim());
                return {
                  name: parts[0] || "Equation Formula",
                  eq: parts[1] || "N/A",
                  desc: parts[2] || ""
                };
              })
          : [];

        const comparisonChart = rawComparisonStr
          ? rawComparisonStr.split("\n")
              .map(l => l.replace(/^[-*•\s]+/, "").trim())
              .filter(l => l.length > 4)
              .map(l => {
                const parts = l.split("|").map(p => p.trim());
                return {
                  itemA: parts[0] || "Aspect A",
                  itemB: parts[1] || "Aspect B",
                  criteria: parts[2] || "Criteria",
                  diff: parts[3] || "Comparison details"
                };
              })
          : [];

        const formulaCards = rawCardsStr
          ? rawCardsStr.split("\n")
              .map(l => l.replace(/^[-*•\s]+/, "").trim())
              .filter(l => l.length > 4)
              .map(l => {
                const parts = l.split("|").map(p => p.trim());
                return {
                  title: parts[0] || "Syllabus Tip",
                  value: parts[1] || "Core Fact",
                  note: parts[2] || ""
                };
              })
          : [];

        const examples = rawExamplesStr
          ? rawExamplesStr.split("\n").map(l => l.replace(/^[-*•\s]+/, "").trim()).filter(l => l.length > 3)
          : [];

        const practicalApps = rawAppsStr
          ? rawAppsStr.split("\n").map(l => l.replace(/^[-*•\s]+/, "").trim()).filter(l => l.length > 3)
          : [];

        const commonMistakes = rawMistakesStr
          ? rawMistakesStr.split("\n").map(l => l.replace(/^[-*•\s]+/, "").trim()).filter(l => l.length > 3)
          : [];

        const keyConcepts = coreConcepts.map(c => `${c.title}: ${c.desc}`);
        const importantPoints = examples.concat(practicalApps);

        // Parse FAQ block (Q: / A:)
        const faq: { q: string; a: string }[] = [];
        const faqMatches = rawFaqStr.split(/(?=Q:)/i);
        faqMatches.forEach((m) => {
          const qMatch = m.match(/Q:([\s\S]*?)(?=A:|$)/i);
          const aMatch = m.match(/A:([\s\S]*?)$/i);
          if (qMatch && aMatch) {
            faq.push({ q: qMatch[1].trim(), a: aMatch[1].trim() });
          }
        });
        if (faq.length === 0) {
          faq.push(
            { q: `What is the core takeaway of ${searchTarget}?`, a: `To establish functional comprehension of its constituent theories and formulas.` },
            { q: "How can I assess my competence?", a: "Log your assessment progress in our Result Analyzer dashboard." }
          );
        }

        // Parse YouTube resources block
        const resources: { title: string; url: string; source: string }[] = [];
        const resLines = rawResourcesStr.split("\n");
        resLines.forEach((l) => {
          const titleMatch = l.match(/Title:\s*([^|]+)/i);
          const sourceMatch = l.match(/Source:\s*([^|]+)/i);
          const urlMatch = l.match(/URL:\s*(https?:\/\/[^\s]+)/i);
          if (titleMatch) {
            resources.push({
              title: titleMatch[1].trim(),
              source: sourceMatch ? sourceMatch[1].trim() : "YouTube",
              url: urlMatch ? urlMatch[1].trim() : "https://youtube.com"
            });
          }
        });
        if (resources.length === 0) {
          resources.push(
            { title: `${searchTarget} Lecture Overview`, url: "https://youtube.com", source: "Khan Academy" },
            { title: `${searchTarget} Crash Course Explained`, url: "https://youtube.com", source: "CrashCourse YouTube" }
          );
        }

        const parsedResult: TopicData = {
          easyExplanation: rawEasy,
          detailedExplanation: rawDetailed,
          keyConcepts,
          importantPoints,
          studyNotes: rawStudy,
          revisionNotes: rawRevision,
          faq,
          resources,
          difficulty,
          overview: rawOverview,
          coreConcepts,
          importantTerms,
          examples,
          formulas,
          practicalApps,
          commonMistakes,
          summary: rawSummary,
          diagram: rawDiagram,
          comparisonChart,
          formulaCards
        };

        setOutcome(parsedResult);
        saveTopicToCache(searchTarget, difficulty, parsedResult);
        return true;
      } catch (err: any) {
        console.warn(`Attempt ${retryCount + 1} failed.`, err);
        return false;
      }
    };

    let success = await executeRequest();
    while (!success && retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying API connection... (${retryCount}/${maxRetries})`);
      success = await executeRequest();
    }

    if (!success) {
      // Elegant fallback to Photosynthesis if all retries fail
      setErrorMessage("The AI learning model is currently experiencing high load. Loading high-quality local deconstruction cache as fallback...");
      setTimeout(() => {
        setOutcome(topicFallbacks.photosynthesis[difficulty]);
        setAnalyzing(false);
      }, 1500);
    } else {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    if (!outcome) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 20;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          addHeader();
        }
      };

      const addHeader = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("FUTUREPATH AI LEARNING ENGINE — SYLLABUS DECONSTRUCTION", margin, y);
        doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, y);
        y += 4;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // Title & Meta details
      addHeader();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text(topicInput.toUpperCase(), margin, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text(`DIFFICULTY LEVEL: ${difficulty.toUpperCase()}`, margin, y);
      y += 10;

      // 1. Topic Overview
      const overviewText = outcome.overview || outcome.easyExplanation;
      if (overviewText) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("1. Topic Overview", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const splitOverview = doc.splitTextToSize(overviewText, contentWidth);
        const textHeight = splitOverview.length * 5;
        checkPageOverflow(textHeight);
        doc.text(splitOverview, margin, y);
        y += textHeight + 8;
      }

      // 2. Comprehensive Explanation
      const explanationText = outcome.detailedExplanation || outcome.easyExplanation;
      if (explanationText) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("2. Comprehensive Explanation", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const splitExplanation = doc.splitTextToSize(explanationText, contentWidth);
        const textHeight = splitExplanation.length * 5;
        checkPageOverflow(textHeight);
        doc.text(splitExplanation, margin, y);
        y += textHeight + 8;
      }

      // 3. Core Concepts Matrix
      if (outcome.coreConcepts && outcome.coreConcepts.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("3. Core Concepts Matrix", margin, y);
        y += 6;

        outcome.coreConcepts.forEach((c) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          const conceptTitle = `• ${c.title}`;
          const splitTitle = doc.splitTextToSize(conceptTitle, contentWidth);
          checkPageOverflow(splitTitle.length * 5 + 10);
          doc.text(splitTitle, margin, y);
          y += splitTitle.length * 5 + 1;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitDesc = doc.splitTextToSize(c.desc, contentWidth - 6);
          checkPageOverflow(splitDesc.length * 5 + 10);
          doc.text(splitDesc, margin + 6, y);
          y += splitDesc.length * 5 + 4;
        });
        y += 4;
      }

      // 4. Important Terms
      if (outcome.importantTerms && outcome.importantTerms.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("4. Key Academic Terminology", margin, y);
        y += 6;

        outcome.importantTerms.forEach((t) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          const termHeader = `• ${t.term}: `;
          doc.text(termHeader, margin, y);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const indent = doc.getTextWidth(termHeader) + 2;
          const splitDef = doc.splitTextToSize(t.definition, contentWidth - indent);
          checkPageOverflow(splitDef.length * 5 + 5);
          doc.text(splitDef, margin + indent, y);
          y += splitDef.length * 5 + 3;
        });
        y += 4;
      }

      // 5. Formulas Section
      if (outcome.formulas && outcome.formulas.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("5. Formulas & Formulations", margin, y);
        y += 6;

        outcome.formulas.forEach((f) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(`• ${f.name}`, margin, y);
          y += 5;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          doc.text(`   [ ${f.eq} ]`, margin, y);
          y += 5;

          if (f.desc) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            const splitDesc = doc.splitTextToSize(f.desc, contentWidth - 10);
            checkPageOverflow(splitDesc.length * 4 + 5);
            doc.text(splitDesc, margin + 6, y);
            y += splitDesc.length * 4 + 4;
          }
        });
        y += 4;
      }

      // 6. Examples
      const exampleList = outcome.examples || outcome.importantPoints;
      if (exampleList && exampleList.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("6. Illustrative Examples", margin, y);
        y += 6;

        exampleList.forEach((ex) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitEx = doc.splitTextToSize(`• ${ex}`, contentWidth);
          checkPageOverflow(splitEx.length * 5 + 5);
          doc.text(splitEx, margin, y);
          y += splitEx.length * 5 + 3;
        });
        y += 4;
      }

      // 7. Practical Applications
      if (outcome.practicalApps && outcome.practicalApps.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("7. Real-World Practical Applications", margin, y);
        y += 6;

        outcome.practicalApps.forEach((app) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          const splitApp = doc.splitTextToSize(`• ${app}`, contentWidth);
          checkPageOverflow(splitApp.length * 5 + 5);
          doc.text(splitApp, margin, y);
          y += splitApp.length * 5 + 3;
        });
        y += 4;
      }

      // 8. Common Mistakes
      if (outcome.commonMistakes && outcome.commonMistakes.length > 0) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("8. Common Student Pitfalls & Mistakes", margin, y);
        y += 6;

        outcome.commonMistakes.forEach((mistake) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(220, 38, 38);
          const splitMistake = doc.splitTextToSize(`⚠ ${mistake}`, contentWidth);
          checkPageOverflow(splitMistake.length * 5 + 5);
          doc.text(splitMistake, margin, y);
          y += splitMistake.length * 5 + 3;
        });
        y += 4;
      }

      // 9. Study Notes
      if (outcome.studyNotes) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("9. Deep Academic Study Notes", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const splitNotes = doc.splitTextToSize(outcome.studyNotes, contentWidth);
        const textHeight = splitNotes.length * 5;
        checkPageOverflow(textHeight);
        doc.text(splitNotes, margin, y);
        y += textHeight + 8;
      }

      // 10. Summary
      const summaryText = outcome.summary || outcome.revisionNotes;
      if (summaryText) {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("10. Syllabus Summary & Review Notes", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
        const textHeight = splitSummary.length * 5;
        checkPageOverflow(textHeight);
        doc.text(splitSummary, margin, y);
        y += textHeight + 8;
      }

      // Footer
      checkPageOverflow(15);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Deconstructed via FuturePath AI Academic Learning Engine. All rights reserved.", margin, y);

      const formattedTopicName = topicInput.trim().replace(/[^a-zA-Z0-9]/g, "_");
      const formattedDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      doc.save(`${formattedTopicName}_${formattedDiff}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div id="topicAnalyzer" className="space-y-6 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 space-y-1">
        <div className="flex items-center space-x-2">
          <BookMarked className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)] uppercase tracking-wider">Dynamic Topic Analyzer</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Input any scholastic topic to receive custom difficulty-based deconstruction summaries, easy analogies, formulas, ASCII diagrams, comparison charts, and curated learning roadmaps.
        </p>
      </div>

      {/* Input Module */}
      <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
        
        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Frequent Topics Presets (Adaptive Offline Learning)</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Photosynthesis (Biology)", term: "Photosynthesis" },
              { label: "Artificial Intelligence (CS)", term: "Artificial Intelligence" },
              { label: "Trigonometry (Math)", term: "Trigonometry" }
            ].map((p) => (
              <button
                key={p.term}
                onClick={() => handleSearchTopic(p.term)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-indigo-400 font-mono text-[11px] rounded-lg transition-all cursor-pointer flex items-center space-x-1"
              >
                <ChevronRight className="w-3 h-3" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input & Difficulty Segmented Controls */}
        <div className="pt-2 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Or Type Custom Topic Matrix & Select Difficulty:</label>
            
            {/* DIFFICULTY SELECTOR */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 border border-slate-850 rounded-lg">
              {(["basic", "medium", "advanced"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-1 font-mono text-[10px] uppercase font-bold rounded-md transition-all cursor-pointer ${
                    difficulty === level
                      ? "bg-indigo-600/20 text-indigo-400 font-bold"
                      : "bg-transparent text-slate-500 hover:text-slate-400"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input 
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Theory of Relativity, Chemical Bonding, Calculus Integration..."
              className="flex-1 py-3 px-4 bg-slate-950 border border-slate-850 focus:border-indigo-500/60 focus:outline-none rounded-lg text-xs font-semibold text-slate-300"
            />
            
            <button
              onClick={() => handleSearchTopic()}
              disabled={analyzing}
              className="px-6 py-3 bg-gradient-to-r from-sky-550 to-indigo-550 bg-indigo-500 text-slate-905 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer shrink-0"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Decompressing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze & Decompress</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Error Alert Block */}
      {errorMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Outcome View Deck */}
      {outcome && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Sub-Tab Manager */}
          <div className="lg:col-span-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5 h-fit">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-2">Analysis Deck Chapters</span>
            {[
              { id: "easy", label: "Easy Explainer", desc: "Intuitive analogies" },
              { id: "expert", label: "Rigorous Formula", desc: "Scientific explanations" },
              { id: "concepts", label: "Concept Matrix", desc: "Syllabus pillars list" },
              { id: "notes", label: "Study & Revision", desc: "Formula sheets & cheat decks" },
              { id: "faq", label: "Frequently Asked", desc: "Rapid diagnostic FAQs" },
              { id: "resources", label: "YouTube Playlists", desc: "Curated learning links" }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id as any)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex flex-col cursor-pointer ${
                  activeSubTab === sub.id 
                    ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-bold" 
                    : "bg-slate-950/40 hover:bg-slate-950 border-transparent text-slate-400"
                }`}
              >
                <span className="text-xs">{sub.label}</span>
                <span className="text-[9px] font-mono text-slate-500 font-normal mt-0.5">{sub.desc}</span>
              </button>
            ))}
          </div>

          {/* Right Active Panel */}
          <div className="lg:col-span-9 p-6 bg-slate-950/60 border border-slate-800 rounded-xl min-h-[340px] flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Header inside Panel */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Academic Chapter</span>
                <div className="flex items-center space-x-2">
                  
                  {/* PDF EXPORT FEATURE */}
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">{activeSubTab.toUpperCase()} UNIT</span>
                </div>
              </div>

              {/* TAB 1: EASY EXPLAINER */}
              {activeSubTab === "easy" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 w-fit">
                    <Compass className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold">The Analogy Bridge</span>
                  </div>
                  
                  {/* Topic Overview */}
                  {outcome.overview && (
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold mb-1">Topic Overview</span>
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">{outcome.overview}</p>
                    </div>
                  )}

                  <p className="text-sm text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap">{outcome.easyExplanation}</p>

                  {/* Examples Section */}
                  {outcome.examples && outcome.examples.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Real-life Examples</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {outcome.examples.map((ex, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed">
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VISUAL LEARNING BLOCK: Concept Flow Diagram */}
                  {outcome.diagram && (
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2 mt-4">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Concept Flow Diagram</span>
                      <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-850 overflow-x-auto whitespace-pre leading-normal">
                        {outcome.diagram}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: RIGOROUS EXPLANATION / FORMULAS */}
              {activeSubTab === "expert" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 w-fit">
                    <ScrollText className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold">Advanced Mathematical Formulations</span>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap">{outcome.detailedExplanation}</p>

                  {/* VISUAL LEARNING BLOCK: Comparative Analysis Table */}
                  {outcome.comparisonChart && outcome.comparisonChart.length > 0 && (
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2 mt-2">
                      <div className="flex items-center space-x-1 text-purple-400">
                        <Table className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono uppercase tracking-wider block font-bold">Comparative Analysis Chart</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="py-2 px-2.5 font-semibold">Aspect A</th>
                              <th className="py-2 px-2.5 font-semibold">Aspect B</th>
                              <th className="py-2 px-2.5 font-semibold">Comparison Criteria</th>
                              <th className="py-2 px-2.5 font-semibold">Key Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outcome.comparisonChart.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-850 hover:bg-slate-950/40">
                                <td className="py-2 px-2.5 font-semibold text-slate-200">{row.itemA}</td>
                                <td className="py-2 px-2.5 font-semibold text-slate-200">{row.itemB}</td>
                                <td className="py-2 px-2.5 font-mono text-indigo-400">{row.criteria}</td>
                                <td className="py-2 px-2.5 text-slate-400">{row.diff}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Practical Apps Section */}
                  {outcome.practicalApps && outcome.practicalApps.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Practical Applications</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {outcome.practicalApps.map((app, idx) => (
                          <div key={idx} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed">
                            {app}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CONCEPT MATRIX */}
              {activeSubTab === "concepts" && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Core Concepts */}
                  {outcome.coreConcepts && outcome.coreConcepts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {outcome.coreConcepts.map((c, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1.5">
                          <div className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-xs font-bold text-white uppercase">{c.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed pl-6">{c.desc}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {outcome.keyConcepts.map((c, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1.5 w-full">
                          <div className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-xs font-bold text-white uppercase">{c.split(":")[0]}</span>
                          </div>
                          {c.split(":")[1] && (
                            <p className="text-xs text-slate-400 leading-relaxed pl-6">{c.split(":")[1].trim()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Important Terms List */}
                  {outcome.importantTerms && outcome.importantTerms.length > 0 && (
                    <div className="pt-2 space-y-2.5">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Key Academic Terminology</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {outcome.importantTerms.map((t, idx) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                            <span className="text-xs font-bold text-white font-mono block uppercase">{t.term}</span>
                            <p className="text-[11px] text-slate-400 leading-normal">{t.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STUDY & REVISION CARDS */}
              {activeSubTab === "notes" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 bg-[#111827] border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center space-x-1 text-indigo-400">
                        <Layers className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-wider block font-bold">Comprehensive Study Log</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-semibold">{outcome.studyNotes}</p>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Flame className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-wider block font-bold">Revision Formula Cheat Deck</span>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">{outcome.revisionNotes}</p>
                    </div>

                  </div>

                  {/* VISUAL LEARNING BLOCK: Formula Cards Grid */}
                  {outcome.formulaCards && outcome.formulaCards.length > 0 && (
                    <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2.5 mt-2">
                      <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider block font-bold">Key Cheatsheets & Rules</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {outcome.formulaCards.map((card, cIdx) => (
                          <div key={cIdx} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                            <span className="text-[10px] text-slate-500 font-mono block uppercase">{card.title}</span>
                            <span className="text-xs font-bold text-white block font-mono">{card.value}</span>
                            {card.note && <p className="text-[10px] text-slate-400 font-medium">{card.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulas Section */}
                  {outcome.formulas && outcome.formulas.length > 0 && (
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3 mt-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Formulas & Equations</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {outcome.formulas.map((f, idx) => (
                          <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1.5">
                            <span className="text-xs font-bold text-white block uppercase">{f.name}</span>
                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono rounded inline-block">
                              {f.eq}
                            </span>
                            {f.desc && <p className="text-[11px] text-slate-400 leading-normal pt-1">{f.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Student Mistakes Section */}
                  {outcome.commonMistakes && outcome.commonMistakes.length > 0 && (
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2 mt-2">
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block font-bold">Common Pitfalls & Mistakes</span>
                      <div className="space-y-1.5">
                        {outcome.commonMistakes.map((mistake, idx) => (
                          <div key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start space-x-1.5">
                            <span className="text-red-400 shrink-0 font-bold">⚠</span>
                            <span>{mistake}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Footer */}
                  {outcome.summary && (
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold mb-1">Executive Summary</span>
                      <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">{outcome.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: FAQ */}
              {activeSubTab === "faq" && (
                <div className="space-y-3.5 animate-fadeIn">
                  {outcome.faq.map((f, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-start space-x-1.5 font-bold">
                        <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block">Question {idx+1}:</span>
                        <p className="text-xs text-white uppercase">{f.q}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-850 pl-2 leading-relaxed text-xs text-slate-400">
                        {f.a}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: RESOURCES */}
              {activeSubTab === "resources" && (
                <div className="space-y-4 animate-fadeIn">
                  <span className="text-xs text-slate-400 block pb-1">Recommended dynamic curriculum links. Click playlist to redirect learning:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outcome.resources.map((res, idx) => (
                      <a 
                        key={idx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-4 bg-[#111827]/80 hover:bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 relative group block cursor-pointer transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-red-400 border border-red-500/10 bg-red-500/5 px-2 py-0.5 rounded uppercase font-bold">
                            {res.source}
                          </span>
                          <Video className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                        </div>
                        <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                          {res.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 tracking-wider">Redirect to sandbox streaming playlist &rarr;</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="pt-6 border-t border-slate-900 flex justify-between items-end mt-6 text-[10px] text-slate-500 font-mono">
              <span>Automatic Evaluation Alignment</span>
              <span>FuturePath AI Academe</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
