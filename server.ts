import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";

dotenv.config({ override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Allow the frontend (which may now live on a different domain, e.g. Vercel)
// to call this API. Set FRONTEND_ORIGIN to your exact Vercel URL in production
// for tighter security; defaults to "*" so things keep working out of the box.
app.use((req, res, next) => {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Initialize Razorpay
console.log("--- RAZORPAY BACKEND DIAGNOSIS ---");

// Check if raw environment variables exist before parsing/defaulting
const rawEnvKeyIdExists = process.env.RAZORPAY_KEY_ID !== undefined;
const rawEnvKeySecretExists = process.env.RAZORPAY_KEY_SECRET !== undefined;

console.log("process.env.RAZORPAY_KEY_ID exists?:", rawEnvKeyIdExists);
console.log("process.env.RAZORPAY_KEY_SECRET exists?:", rawEnvKeySecretExists);

let rawKeyId = process.env.RAZORPAY_KEY_ID || "rzp_live_T5ovSvf1uYzivo";
let rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "J7v5I53Mv4ffndlqt61uIKK";

// Detect if the platform merged the keys in a single env variable
if (rawKeyId && rawKeyId.includes("RAZORPAY_KEY_SECRET=")) {
  console.log("Detected merged environment variable bug! Parsing and separating...");
  const parts = rawKeyId.split("RAZORPAY_KEY_SECRET=");
  rawKeyId = parts[0].trim();
  rawKeySecret = parts[1].trim();
}

const keyId = rawKeyId.replace(/['"]/g, "").trim();
const keySecret = rawKeySecret.replace(/['"]/g, "").trim();

// Specific user-requested prints
console.log("KEY_ID:", keyId);
console.log("SECRET_LENGTH:", keySecret.length);
console.log("key id length:", keyId ? keyId.length : 0);
console.log("secret length:", keySecret ? keySecret.length : 0);
console.log("first 6 chars of key id:", keyId ? keyId.substring(0, 6) : "none");
console.log("first 4 chars of secret:", keySecret ? keySecret.substring(0, 4) : "none");
console.log("whether values contain quotes:", /['"]/.test(keyId) || /['"]/.test(keySecret));
console.log("whether values contain whitespace:", /\s/.test(keyId) || /\s/.test(keySecret));

let RazorpayClass: any;
if (typeof Razorpay === "function") {
  RazorpayClass = Razorpay;
} else if (Razorpay && typeof (Razorpay as any).default === "function") {
  RazorpayClass = (Razorpay as any).default;
} else if (Razorpay && typeof (Razorpay as any).Razorpay === "function") {
  RazorpayClass = (Razorpay as any).Razorpay;
} else {
  RazorpayClass = Razorpay;
}

let razorpay: any;
try {
  razorpay = new RazorpayClass({
    key_id: keyId,
    key_secret: keySecret
  });
  console.log("Razorpay instance initialized successfully.");
  
  // Make a direct test call on startup and print results
  (async () => {
    try {
      console.log("[STARTUP TEST] Initiating direct Razorpay order creation check...");
      const testOrder = await razorpay.orders.create({
        amount: 100,
        currency: "INR",
        receipt: "startup_test_" + Date.now()
      });
      console.log("[STARTUP TEST SUCCESS] Direct order created. ID:", testOrder.id);
    } catch (testErr: any) {
      console.error("[STARTUP TEST FAILURE] Direct test order creation failed with error:");
      console.error("- error.message:", testErr.message);
      console.error("- error.code:", testErr.code);
      console.error("- error.description:", testErr.description || (testErr.error && testErr.error.description));
      console.error("- error.statusCode:", testErr.statusCode);
      console.error("- stack trace:", testErr.stack);
      console.error("- raw error object:", JSON.stringify(testErr, null, 2));
    }
  })();
} catch (initErr: any) {
  console.error("CRITICAL: Failed to initialize Razorpay constructor:", initErr);
}
console.log("----------------------------------");

// Initialize Groq backend fallback or dependencies if needed. Since we use fetch directly for Groq, no SDK initialization is needed here.

// ==========================================
// CENTRALIZED AI FAILOVER ROUTER & MONITORING
// ==========================================
interface AIRouterParams {
  systemInstruction?: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

const apiHealth = {
  gemini: { status: "healthy", lastChecked: Date.now(), consecutiveFailures: 0 },
  groq: { status: "healthy", lastChecked: Date.now(), consecutiveFailures: 0 },
  openai: { status: "healthy", lastChecked: Date.now(), consecutiveFailures: 0 },
  ollama: { status: "healthy", lastChecked: Date.now(), consecutiveFailures: 0 }
};

const aiCache = new Map<string, { reply: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

function getCacheKey(params: AIRouterParams): string {
  const str = JSON.stringify({
    prompt: params.prompt || "",
    systemInstruction: params.systemInstruction || "",
    messages: params.messages || [],
    responseFormat: params.responseFormat || "text"
  });
  return crypto.createHash("sha256").update(str).digest("hex");
}

function getGroqKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GROQ_API_KEY) {
    keys.push(process.env.GROQ_API_KEY);
  }
  for (const [envName, envVal] of Object.entries(process.env)) {
    const upperName = envName.toUpperCase();
    if (upperName.startsWith("GROQ_API_KEY") && upperName !== "GROQ_API_KEY" && envVal) {
      keys.push(envVal);
    }
  }
  return Array.from(new Set(keys.map(k => k.trim()))).filter(Boolean);
}

async function callAIRouter(params: AIRouterParams): Promise<{ reply: string; model: string; source: string }> {
  const cacheKey = getCacheKey(params);
  const cached = aiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log("[AI ROUTER] Returning cached response.");
    return { reply: cached.reply, model: "cached", source: "cache" };
  }

  // Fallback chain: Gemini -> Groq -> OpenAI -> Ollama
  const providers = ["gemini", "groq", "openai", "ollama"];
  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`[AI ROUTER] Attempting provider: ${provider}...`);
      let reply = "";
      let modelUsed = "";

      if (provider === "gemini") {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("No GEMINI_API_KEY defined in environment.");
        }
        
        console.log("[AI ROUTER] Initializing Gemini client...");
        const aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const model = "gemini-3.5-flash";
        let contents: any;

        if (params.messages && params.messages.length > 0) {
          contents = params.messages.map(msg => ({
            role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.content }]
          }));
        } else if (params.prompt) {
          contents = params.prompt;
        } else {
          throw new Error("No prompt or messages provided for Gemini.");
        }

        const config: any = {
          temperature: params.temperature ?? 0.7,
        };

        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        if (params.responseFormat === "json") {
          config.responseMimeType = "application/json";
        }

        const response = await aiClient.models.generateContent({
          model,
          contents,
          config,
        });

        reply = response.text || "";
        if (!reply) {
          throw new Error("Received empty response from Gemini.");
        }
        modelUsed = model;

      } else if (provider === "groq") {
        const groqKeys = getGroqKeys();
        if (groqKeys.length === 0) {
          throw new Error("No Groq API keys defined in environment.");
        }

        let succeeded = false;
        for (let i = 0; i < groqKeys.length; i++) {
          const key = groqKeys[i];
          try {
            console.log(`[AI ROUTER] Trying Groq Key ${i + 1} of ${groqKeys.length}...`);

            const formattedMessages: any[] = [];
            if (params.systemInstruction) {
              formattedMessages.push({ role: "system", content: params.systemInstruction });
            }
            if (params.messages && params.messages.length > 0) {
              params.messages.forEach(msg => {
                let role = msg.role;
                if (role === "model" || role === "assistant") role = "assistant";
                else if (role === "system") role = "system";
                else role = "user";
                formattedMessages.push({ role, content: msg.content });
              });
            } else if (params.prompt) {
              formattedMessages.push({ role: "user", content: params.prompt });
            }

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: formattedMessages,
                temperature: params.temperature ?? 0.7,
                response_format: params.responseFormat === "json" ? { type: "json_object" } : undefined
              })
            });

            if (!response.ok) {
              const errText = await response.text();
              throw new Error(`Groq API returned status ${response.status}: ${errText}`);
            }

            const data = await response.json();
            reply = data.choices?.[0]?.message?.content || "";
            if (!reply) {
              throw new Error("Received empty response from Groq.");
            }

            modelUsed = "llama-3.3-70b-versatile";
            succeeded = true;
            break;
          } catch (keyErr: any) {
            console.error(`[AI ROUTER] Groq Key ${i + 1} failed:`, keyErr.message || keyErr);
            lastError = keyErr;
          }
        }

        if (!succeeded) {
          throw new Error("All provided Groq API keys failed or were exhausted.");
        }

      } else if (provider === "openai") {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error("No OPENAI_API_KEY defined in environment.");
        }

        const formattedMessages: any[] = [];
        if (params.systemInstruction) {
          formattedMessages.push({ role: "system", content: params.systemInstruction });
        }
        if (params.messages && params.messages.length > 0) {
          params.messages.forEach(msg => {
            let role = msg.role;
            if (role === "model" || role === "assistant") role = "assistant";
            else if (role === "system") role = "system";
            else role = "user";
            formattedMessages.push({ role, content: msg.content });
          });
        } else if (params.prompt) {
          formattedMessages.push({ role: "user", content: params.prompt });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: formattedMessages,
            temperature: params.temperature ?? 0.7,
            response_format: params.responseFormat === "json" ? { type: "json_object" } : undefined
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI API returned status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || "";
        if (!reply) {
          throw new Error("Received empty response from OpenAI.");
        }
        modelUsed = "gpt-4o-mini";

      } else if (provider === "ollama") {
        const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
        const formattedMessages: any[] = [];
        if (params.systemInstruction) {
          formattedMessages.push({ role: "system", content: params.systemInstruction });
        }
        if (params.messages && params.messages.length > 0) {
          params.messages.forEach(msg => {
            let role = msg.role;
            if (role === "model" || role === "assistant") role = "assistant";
            else if (role === "system") role = "system";
            else role = "user";
            formattedMessages.push({ role, content: msg.content });
          });
        } else if (params.prompt) {
          formattedMessages.push({ role: "user", content: params.prompt });
        }

        const response = await fetch(`${ollamaHost}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3",
            messages: formattedMessages,
            stream: false,
            options: {
              temperature: params.temperature ?? 0.7
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama returned status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        reply = data.message?.content || "";
        if (!reply) {
          throw new Error("Received empty response from Ollama.");
        }
        modelUsed = "llama3";
      }

      const h = apiHealth[provider as keyof typeof apiHealth];
      if (h) {
        h.status = "healthy";
        h.consecutiveFailures = 0;
        h.lastChecked = Date.now();
      }

      aiCache.set(cacheKey, { reply, timestamp: Date.now() });

      console.log(`[AI ROUTER] Call succeeded using provider ${provider}. Model: ${modelUsed}`);
      return { reply, model: modelUsed, source: provider };

    } catch (err: any) {
      console.error(`[AI ROUTER ERROR] Provider ${provider} failed:`, err.message || err);
      lastError = err;
      
      const h = apiHealth[provider as keyof typeof apiHealth];
      if (h) {
        h.consecutiveFailures += 1;
        if (h.consecutiveFailures >= 2) {
          h.status = "unhealthy";
        } else {
          h.status = "degraded";
        }
        h.lastChecked = Date.now();
      }
    }
  }

  console.warn("[AI ROUTER CRITICAL] All providers failed! Returning safe offline fallback...");
  const offlineText = "### [Offline Academic System Online]\n\nOur advanced cloud-level AI coordinators are currently undergoing regular syncs. Here is your local FuturePath blueprint summary:\n\n*   **Stream Recommendation**: Focus on Science (for technical, medical, and analytical roles), Commerce (for finance, corporate structures, and economic systems), or Humanities (for administrative, law, creative, and human resources lines).\n*   **Formula Tip**: Maintain strong stepwise proof formats on board answers. Double check all signs and variable assignments before applying algebraic limits.\n*   **Exam Readiness**: Complete your weekly mock drills, catalog previous year papers, and register daily study plans via your custom FuturePath dossier scheduler to maximize score gains!\n\n*Configure your GEMINI_API_KEY or GROQ_API_KEY inside the Settings panel to unlock dynamic AI responses.*";
  return { reply: offlineText, model: "offline-failover-safe-mode", source: "offline-fallback" };
}

// API: AI Health Check
app.get("/api/ai/health", (req, res) => {
  res.json({
    success: true,
    health: apiHealth,
    cacheSize: aiCache.size,
    timestamp: new Date().toISOString()
  });
});

// API: AI Counselor proxy endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid messages array provided." });
    return;
  }

  try {
    const response = await callAIRouter({
      messages: messages,
      systemInstruction: "You are FuturePath AI Counselor, an expert in educational paths, career alignment, CBSE streams, state options, vocational roadmaps, scholarship strategies, and sports corridors. Provide structural, motivational guidance. Use bulleted summaries and professional milestones."
    });
    res.json({ reply: response.reply, model: response.model, source: response.source });
  } catch (err: any) {
    console.error("AI Router chat error:", err);
    res.status(500).json({ error: "counselor processing failure", details: err.message });
  }
});

// API: AI-Powered EdTech Lesson Generator (BYJU'S, PW, Khan Academy Pedagogy)
app.post("/api/compete/ai-coach", async (req, res) => {
  const { chapterName, subjectName, queryType, grade } = req.body;

  if (!chapterName) {
    res.status(400).json({ error: "Missing chapterName. Try again." });
    return;
  }

  const defaultGrade = grade || "Class 10 CBSE";
  const defaultSubjectName = subjectName || "Mathematics";
  const keyType = queryType || "theory"; // theory | ncert | hots | mindmap | pyq | test

  let prompt = "";
  if (keyType === "theory") {
    prompt = `Create an exhaustive, multi-section Educational Textbook Chapter for ${defaultGrade} - ${defaultSubjectName}. 
    Chapter Name: "${chapterName}".
    Pedagogy: Mirror Unacademy, BYJU'S, and Physics Wallah detailed booklets.
    CRITICAL: DO NOT WRITE SHORT SUMMARIES. Provide exhaustive page-long details, complete derivations, definitions, real-world examples, and underlying axioms.
    Format using elegant Markdown headings (###), bold fonts, bullet points, and LaTeX style formulas where appropriate.
    Ensure you include:
    1. Chapter Detailed Introduction & Real-world Relevance
    2. Complete Step-by-Step Fundamental Theory with detailed concept breakdown
    3. Core Principles & Mathematical/Scientific formulas with complete sign conventions (if applicable)
    4. Two detailed Solved Examples with explicit logical steps`;
  } else if (keyType === "ncert") {
    prompt = `Generate a complete list of 4 highly detailed NCERT textbook solutions & model questions for ${defaultGrade} - ${defaultSubjectName} Chapter: "${chapterName}".
    Pedagogy: Mirror Allen Digital and Khan Academy styles. Ensure step-by-step explanations mapping the logic: Formula used -> Parameter mapping -> Linear substitutions -> Detailed calculation -> Final Answer with units.
    Ensure questions represent typical board-pattern high-weightage queries. Write extensive, non-trivial solutions.`;
  } else if (keyType === "hots") {
    prompt = `Generate 3 high-weightage HOTS (High Order Thinking Skills), Case-Based practical scenarios, and Assertion-Reason questions with detailed evaluations for ${defaultGrade} - ${defaultSubjectName} Chapter: "${chapterName}".
    For each HOTS question, provide:
    1. The scenario or advanced question.
    2. Deep concept explanation of the physical/mathematical limits.
    3. Standard model logical solution.
    Include one full Assertion-Reason style board query.`;
  } else if (keyType === "mindmap") {
    prompt = `Create a highly structured Academic Mind Map and Revision Master Note deck for ${defaultGrade} - ${defaultSubjectName} Chapter: "${chapterName}".
    Include:
    - Central underlying theme (Core Hub node)
    - 4 main connecting thematic branches with detailed functional notes for each
    - 3 extremely crucial Common Mistakes students make during board exams and how to correct them
    - Elite quick mnemonic shortcuts for formulas or definitions. Make it highly structured using bulleted hierarchy.`;
  } else {
    prompt = `Generate a realistic 5-item CBSE board-pattern Practice Set and Mock evaluation test for ${defaultGrade} - ${defaultSubjectName} Chapter: "${chapterName}".
    Each item must contain:
    - High-quality question text (with numerical or conceptual depth)
    - 4 fully fleshed distinct options
    - Correct Option clearly specified
    - Rich step-by-step explanatory feedback.`;
  }

  try {
    const response = await callAIRouter({
      prompt: prompt,
      systemInstruction: "You are an elite Senior EdTech Curriculum Architect & CBSE Board Exam Evaluator. You provide exhaustive, granular textbook-level material, avoiding short overviews or summaries."
    });
    res.json({ content: response.reply, model: response.model, source: response.source });
  } catch (err: any) {
    console.error("AI Coach endpoint error:", err);
    res.status(500).json({ error: "AI tutor failed", details: err.message });
  }
});

// API: AI-Powered Topic Analyzer for Compete to Crush
app.post("/api/compete/topic-analyzer", async (req, res) => {
  const { topic, difficulty, subjectName, examName } = req.body;

  if (!topic) {
    res.status(400).json({ error: "Missing topic. Please enter a topic to analyze." });
    return;
  }

  const diff = (difficulty || "medium").toUpperCase();
  const subject = subjectName || "General Academic";
  const exam = examName || "General Competitive Exam";

  const prompt = `Deconstruct the educational topic: "${topic}" for the subject "${subject}" in the context of the exam "${exam}".
Target difficulty level: "${diff}".

Provide a comprehensive, highly-structured study and learning dossier conforming EXACTLY to the "${diff}" difficulty level (Basic, Medium, Advanced, or Expert).
Include detailed explanations, definitions, everyday analogies, real-life examples, formulas, diagram relationship structures, mind map trees, high-impact facts, CBSE/Board style questions, competitive-pattern questions, solved Previous Year Questions (PYQs), common mistakes, and rapid-fire revision notes.

You MUST format your entire response using the following tag sections exactly. Do NOT use markdown style wrappers outside these tags, and ensure each tag is on its own line:

[OVERVIEW]
(Write a rich, detailed overview deconstructing the topic for this level.)

[DEFINITION]
(Provide a pristine, precise definition of the topic and its associated coefficients or mathematical variables.)

[DETAILED_EXPLANATION]
(Write a rigorous, formal academic explanation featuring the core scientific, theoretical, or mathematical concepts.)

[EXAMPLES]
(Provide 3 distinct real-life examples or practical engineering/scientific use-cases.)

[DIAGRAM]
(An elegant ASCII text-based process diagram, flow chart, or structural table mapping the relationship of the concepts.)

[MIND_MAP]
(Construct a hierarchical text-based mind map showing the core nodes and subordinate connections.)

[FACTS]
- Fact 1: An important, high-yield fact or historical context.
- Fact 2: Another important fact, statistic, or experimental constant.

[BOARD_QUESTIONS]
- Q1: CBSE/Board pattern question with model answer steps.
- Q2: Another board pattern descriptive question with answers.

[COMPETITIVE_QUESTIONS]
- Q1: Competitive MCQ pattern (JEE/NEET/UPSC style) with options, correct answer, and detailed shortcut tricks.
- Q2: Another competitive pattern analytical question with answer.

[PYQS]
- Year: 2024 | Exam: ${exam} | Marks: 5
Question: (Advanced Board/Competitive style question)
Step-by-step Solution: (Detailed multi-stage proof, calculation, or logical derivation)
Explanation: (In-depth underlying conceptual rationale)
Concepts Used: (Comma-separated keywords)

- Year: 2022 | Exam: ${exam} | Marks: 4
Question: (Another relevant board/competitive style question)
Step-by-step Solution: (Step-by-step solution matching toppers' answer sheets)
Explanation: (Conceptual tips and board-pattern guidelines)
Concepts Used: (Comma-separated keywords)

[COMMON_MISTAKES]
- Mistake 1: Common error made by candidates and how to avoid it
- Mistake 2: Common error made by candidates and how to avoid it

[REVISION_NOTES]
- Key Revision Point 1: Rapid-fire formula or principle summary.
- Key Revision Point 2: Essential summary point for last-minute revision.`;

  try {
    const response = await callAIRouter({
      prompt: prompt,
      systemInstruction: "You are the supreme Senior Academic Syllabus Decompressor & Exam Evaluator. Generate exhaustive, structured textbook material and accurate Previous Year Questions with full solutions. Do not include introductory conversational text or markdown wrappers."
    });
    res.json({ content: response.reply, model: response.model, source: response.source });
  } catch (err: any) {
    console.error("Topic Analyzer endpoint error:", err);
    res.status(500).json({ error: "AI topic analysis failed", details: err.message });
  }
});

// API: PYQ Multi-Source Auto Fallback System
app.post("/api/compete/fetch-pyqs", async (req, res) => {
  const { classNum, subject, chapter, topic } = req.body;

  if (!subject || !chapter || !topic) {
    res.status(400).json({ error: "Missing required parameters: subject, chapter, topic." });
    return;
  }

  const cls = classNum || "Class 10";
  console.log(`[PYQ ENGINE] Fetch request received for ${cls}, ${subject}, ${chapter} -> ${topic}`);

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[PYQ ENGINE] GEMINI_API_KEY missing. Falling back to curated preseeded database.");
      const fallbackQuestions = getOfflineCBSEQuestions(cls, subject, chapter, topic);
      res.json({ questions: fallbackQuestions, sourceUsed: "Curated Preseeded Database" });
      return;
    }

    const aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const searchPrompt = `Search the web for genuine CBSE previous year board exam questions (PYQs) for Class ${cls}, Subject: ${subject}, Chapter: ${chapter}, Topic: ${topic}.
Priority Sources to crawl and extract from:
1. cbse.gov.in (sample papers, actual board question papers)
2. ncert.nic.in
3. openschools.space
4. pyq.sarkaritool.com
5. exam-support.in

Extract up to 4 genuine previous year questions. For each question, provide:
- question: The full text of the question
- year: The actual year of the board exam (e.g., 2023, 2022, 2020)
- marks: Marks allotment (e.g., 2, 3, 5)
- source: The domain name you extracted it from (e.g., "cbse.gov.in")
- sourceUrl: The exact URL from your search grounding or the priority source
- solution: A complete, step-by-step topper-quality explanation
- explanation: A detailed marking scheme and conceptual walkthrough

Format the output strictly as a JSON object containing a "questions" key with an array of objects matching this structure.
If no genuine questions are found on these sources, return a JSON with "questions" as an empty array: {"questions": []}. Do not fabricate or invent fake question text.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const reply = response.text || "";
    let resultJson: any = { questions: [] };
    try {
      resultJson = JSON.parse(reply);
    } catch (parseErr) {
      console.warn("[PYQ ENGINE] Failed to parse JSON reply, extracting using regex", parseErr);
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultJson = JSON.parse(jsonMatch[0]);
      }
    }

    const finalQuestions: any[] = [];
    const seenQuestions = new Set<string>();

    if (resultJson.questions && Array.isArray(resultJson.questions)) {
      resultJson.questions.forEach((q: any) => {
        if (!q.question || q.question.length < 10) return;
        const normalized = q.question.toLowerCase().replace(/\s+/g, "");
        if (seenQuestions.has(normalized)) return;
        seenQuestions.add(normalized);

        finalQuestions.push({
          question: q.question,
          year: q.year || "2023",
          marks: q.marks || "3",
          source: q.source || "CBSE Official Portal",
          sourceUrl: q.sourceUrl || "https://www.cbse.gov.in",
          solution: q.solution || "Complete derivation or proof steps.",
          explanation: q.explanation || "CBSE Board marking guidelines."
        });
      });
    }

    if (finalQuestions.length === 0) {
      console.log("[PYQ ENGINE] Search Grounding returned no results. Checking Firestore or preseeded database...");
      const localQs = getOfflineCBSEQuestions(cls, subject, chapter, topic);
      res.json({ questions: localQs, sourceUsed: "Offline Preseeded Dossiers" });
    } else {
      res.json({ questions: finalQuestions, sourceUsed: "Google Search Grounded Official Portals" });
    }

  } catch (err: any) {
    console.error("[PYQ ENGINE] Error fetching live PYQs:", err);
    const localQs = getOfflineCBSEQuestions(cls, subject, chapter, topic);
    res.json({ questions: localQs, sourceUsed: "Offline Fallback Cache" });
  }
});

// Helper for preseeded or offline fallback questions
function getOfflineCBSEQuestions(classVal: string, subjectVal: string, chapterVal: string, topicVal: string) {
  return [
    {
      question: `Explain the core mechanism, properties, and CBSE board pattern questions for "${topicVal}". Derive key formulas where appropriate.`,
      year: "2023",
      marks: "5",
      source: "ncert.nic.in",
      sourceUrl: "https://ncert.nic.in/textbook.php",
      solution: "1. State the fundamental definitions and draw ray diagrams or layout setups.\n2. Apply governing formulas and step-by-step linear algebra to solve.\n3. Formulate the final conclusion clearly.",
      explanation: "Ensure units and step-by-step formulas are fully written to maximize CBSE scoring scheme marks."
    }
  ];
}

// -------------------------------------------------------------
// DYNAMIC LIVE COLLEGE DISCOVERY PLATFORM ENGINE
// -------------------------------------------------------------
const PRESEEDED_COLLEGES = [
  {
    id: "col_iitb",
    name: "Indian Institute of Technology (IIT), Bombay",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    stream: "Engineering",
    courses: ["B.Tech Computer Science", "B.Tech Aerospace Engineering", "M.Tech Robotics", "Dual Degree Electrical Engineering"],
    exams: ["JEE Advanced"],
    cutoff: "JEE Advanced rank in top 60-350 for CSE",
    avgPackage: "₹23.5 LPA",
    highestPackage: "₹1.68 CPA",
    fees: "₹2.2 Lakhs / Year",
    rating: 4.9,
    accreditation: "NIRF #3, NAAC A++",
    ranking: "NIRF #3 (Overall)",
    ownership: "Government",
    website: "https://www.iitb.ac.in"
  },
  {
    id: "col_iitd",
    name: "Indian Institute of Technology (IIT), Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    stream: "Engineering",
    courses: ["B.Tech Computer Science", "B.Tech Mathematics & Computing", "B.Tech Electrical Engineering", "M.Tech VLSI"],
    exams: ["JEE Advanced"],
    cutoff: "JEE Advanced rank in top 100-400",
    avgPackage: "₹21.9 LPA",
    highestPackage: "₹2.0 CPA",
    fees: "₹2.2 Lakhs / Year",
    rating: 4.9,
    accreditation: "NIRF #2, NAAC A++",
    ranking: "NIRF #2 (Engineering)",
    ownership: "Government",
    website: "https://www.iitd.ac.in"
  },
  {
    id: "col_nitt",
    name: "National Institute of Technology (NIT), Trichy",
    location: "Tiruchirappalli, Tamil Nadu",
    state: "Tamil Nadu",
    stream: "Engineering",
    courses: ["B.Tech Computer Science", "B.Tech Electronics & Communication", "B.Tech Mechanical Engineering"],
    exams: ["JEE Main"],
    cutoff: "JEE Main rank top 1000-5000",
    avgPackage: "₹12.5 LPA",
    highestPackage: "₹52 LPA",
    fees: "₹1.4 Lakhs / Year",
    rating: 4.7,
    accreditation: "NIRF #9, NAAC A+",
    ranking: "NIRF #9 (Engineering)",
    ownership: "Government",
    website: "https://www.nitt.edu"
  },
  {
    id: "col_bits",
    name: "Birla Institute of Technology and Science (BITS), Pilani",
    location: "Pilani, Rajasthan",
    state: "Rajasthan",
    stream: "Engineering",
    courses: ["B.E. Computer Science", "B.E. Mechanical Engineering", "B.E. Electronics & Instrumentation"],
    exams: ["BITSAT"],
    cutoff: "BITSAT exam score > 325 for CS",
    avgPackage: "₹21.5 LPA",
    highestPackage: "₹60.7 LPA",
    fees: "₹4.5 Lakhs / Year",
    rating: 4.8,
    accreditation: "NAAC A++",
    ranking: "NIRF #25 (Engineering)",
    ownership: "Private",
    website: "https://www.bits-pilani.ac.in"
  },
  {
    id: "col_aiims",
    name: "All India Institute of Medical Sciences (AIIMS), Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    stream: "Medical",
    courses: ["MBBS", "B.Sc Nursing", "M.Ch Neurosurgery", "MD General Medicine"],
    exams: ["NEET"],
    cutoff: "NEET Rank in Top 50 AIR",
    avgPackage: "₹18 LPA",
    highestPackage: "₹35 LPA",
    fees: "₹1,628 / Year",
    rating: 4.9,
    accreditation: "MCI Approved, NIRF #1",
    ranking: "NIRF #1 (Medical)",
    ownership: "Government",
    website: "https://www.aiims.edu"
  },
  {
    id: "col_srcc",
    name: "Shri Ram College of Commerce (SRCC)",
    location: "New Delhi, Delhi",
    state: "Delhi",
    stream: "Commerce",
    courses: ["B.Com (Hons.)", "B.A. Economics (Hons.)", "M.Com"],
    exams: ["CUET"],
    cutoff: "CUET Score > 780/800",
    avgPackage: "₹10.5 LPA",
    highestPackage: "₹35 LPA",
    fees: "₹30,000 / Year",
    rating: 4.8,
    accreditation: "NAAC A++",
    ranking: "NIRF #11 (Colleges)",
    ownership: "Government",
    website: "https://www.srcc.edu"
  },
  {
    id: "col_nlsiu",
    name: "National Law School of India University (NLSIU)",
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    stream: "Law",
    courses: ["B.A. LL.B. (Hons.)", "LL.M.", "Ph.D. Law"],
    exams: ["CLAT"],
    cutoff: "CLAT Rank in Top 100",
    avgPackage: "₹16 LPA",
    highestPackage: "₹32 LPA",
    fees: "₹2.8 Lakhs / Year",
    rating: 4.9,
    accreditation: "BCI Approved, NIRF #1",
    ranking: "NIRF #1 (Law)",
    ownership: "Government",
    website: "https://www.nls.ac.in"
  },
  {
    id: "col_iima",
    name: "Indian Institute of Management (IIM), Ahmedabad",
    location: "Ahmedabad, Gujarat",
    state: "Gujarat",
    stream: "Management",
    courses: ["PGP (MBA)", "PGPX (Executive MBA)", "ePGD in Advanced Analytics"],
    exams: ["CAT"],
    cutoff: "CAT percentile > 99.5%",
    avgPackage: "₹32.8 LPA",
    highestPackage: "₹1.15 CPA",
    fees: "₹12.5 Lakhs / Year",
    rating: 5.0,
    accreditation: "EQUIS Accredited, NIRF #1",
    ranking: "NIRF #1 (Management)",
    ownership: "Government",
    website: "https://www.iima.ac.in"
  },
  {
    id: "col_nid",
    name: "National Institute of Design (NID)",
    location: "Ahmedabad, Gujarat",
    state: "Gujarat",
    stream: "Design",
    courses: ["B.Des Product Design", "B.Des Animation Film Design", "M.Des Interaction Design"],
    exams: ["NID DAT"],
    cutoff: "NID DAT score > 65% in finals",
    avgPackage: "₹8.5 LPA",
    highestPackage: "₹28 LPA",
    fees: "₹2.1 Lakhs / Year",
    rating: 4.8,
    accreditation: "DPIIT Recognized",
    ranking: "NIRF #1 (Design)",
    ownership: "Government",
    website: "https://www.nid.edu"
  },
  {
    id: "col_spa",
    name: "School of Planning and Architecture (SPA)",
    location: "New Delhi, Delhi",
    state: "Delhi",
    stream: "Architecture",
    courses: ["B.Arch", "B.Plan", "M.Arch Landscape Architecture"],
    exams: ["JEE Main", "NATA"],
    cutoff: "JEE Main Paper 2 rank in top 200-1000",
    avgPackage: "₹7.2 LPA",
    highestPackage: "₹18 LPA",
    fees: "₹1.2 Lakhs / Year",
    rating: 4.6,
    accreditation: "CoA Approved, NIRF #5",
    ranking: "NIRF #5 (Architecture)",
    ownership: "Government",
    website: "http://spa.ac.in"
  },
  {
    id: "col_kmc",
    name: "Kasturba Medical College (KMC)",
    location: "Manipal, Karnataka",
    state: "Karnataka",
    stream: "Medical",
    courses: ["MBBS", "MD Paediatrics", "MS Orthopaedics"],
    exams: ["NEET"],
    cutoff: "NEET Score > 560",
    avgPackage: "₹12.0 LPA",
    highestPackage: "₹24 LPA",
    fees: "₹17.8 Lakhs / Year",
    rating: 4.7,
    accreditation: "MCI Approved, NIRF #10",
    ranking: "NIRF #10 (Medical)",
    ownership: "Private",
    website: "https://manipal.edu/kmc-manipal.html"
  },
  {
    id: "col_ju",
    name: "Jadavpur University",
    location: "Kolkata, West Bengal",
    state: "West Bengal",
    stream: "Engineering",
    courses: ["B.E. Computer Science & Eng", "B.E. Electronics", "B.E. Power Engineering"],
    exams: ["WBJEE"],
    cutoff: "WBJEE rank in top 50-200",
    avgPackage: "₹14.8 LPA",
    highestPackage: "₹1.1 CPA",
    fees: "₹2,400 / Year",
    rating: 4.8,
    accreditation: "NAAC A+++, NIRF #4 (Universities)",
    ranking: "NIRF #10 (Engineering)",
    ownership: "Government",
    website: "http://www.jaduniv.edu.in"
  },
  {
    id: "col_pau",
    name: "Punjab Agricultural University (PAU)",
    location: "Ludhiana, Punjab",
    state: "Punjab",
    stream: "Agriculture",
    courses: ["B.Sc. (Hons) Agriculture", "B.Tech Biotechnology", "M.Sc. Agronomy"],
    exams: ["ICAR AIEEA", "PAU Entrance"],
    cutoff: "PAU MET Entrance Score > 60%",
    avgPackage: "₹6.5 LPA",
    highestPackage: "₹15 LPA",
    fees: "₹85,000 / Year",
    rating: 4.5,
    accreditation: "ICAR Accredited, NIRF #1 (Agriculture)",
    ranking: "NIRF #1 (Agriculture)",
    ownership: "Government",
    website: "https://www.pau.edu"
  },
  {
    id: "col_lsr",
    name: "Lady Shri Ram College for Women (LSR)",
    location: "New Delhi, Delhi",
    state: "Delhi",
    stream: "Arts",
    courses: ["B.A. Psychology (Hons)", "B.A. Economics (Hons)", "B.A. Journalism"],
    exams: ["CUET"],
    cutoff: "CUET Score > 775/800",
    avgPackage: "₹9.8 LPA",
    highestPackage: "₹40 LPA",
    fees: "₹21,000 / Year",
    rating: 4.7,
    accreditation: "NAAC A++",
    ranking: "NIRF #9 (Colleges)",
    ownership: "Government",
    website: "https://lsr.edu.in"
  }
];

const collegeSearchCache = new Map<string, any[]>();

app.post("/api/colleges/search", async (req, res) => {
  const { 
    searchQuery = "", 
    state = "All", 
    stream = "All", 
    course = "", 
    exam = "All", 
    ownership = "All", 
    placementRange = "All", 
    feesRange = "All" 
  } = req.body;

  const cacheKey = JSON.stringify({ searchQuery, state, stream, course, exam, ownership, placementRange, feesRange });
  
  if (collegeSearchCache.has(cacheKey)) {
    console.log("Serving college search from in-memory cache...");
    res.json({ success: true, colleges: collegeSearchCache.get(cacheKey) });
    return;
  }

  // Define static fallback filter function for preseeded data
  const filterPreseeded = () => {
    return PRESEEDED_COLLEGES.filter(col => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = col.name.toLowerCase().includes(q);
        const matchesLocation = col.location.toLowerCase().includes(q);
        const matchesCourses = col.courses.some(c => c.toLowerCase().includes(q));
        const matchesExams = col.exams.some(e => e.toLowerCase().includes(q));
        const matchesStream = col.stream.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation && !matchesCourses && !matchesExams && !matchesStream) {
          return false;
        }
      }

      // State Filter
      if (state !== "All" && col.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }

      // Stream Filter
      if (stream !== "All" && col.stream.toLowerCase() !== stream.toLowerCase()) {
        return false;
      }

      // Course Search
      if (course.trim() && !col.courses.some(c => c.toLowerCase().includes(course.toLowerCase()))) {
        return false;
      }

      // Exam Filter
      if (exam !== "All" && !col.exams.some(e => e.toLowerCase().includes(exam.toLowerCase()))) {
        return false;
      }

      // Ownership Filter
      if (ownership !== "All" && col.ownership.toLowerCase() !== ownership.toLowerCase()) {
        return false;
      }

      // Placement Range Filter
      if (placementRange !== "All") {
        const avgNum = parseFloat(col.avgPackage.replace(/[^0-9.]/g, ""));
        if (placementRange === "> 15 LPA" && avgNum < 15) return false;
        if (placementRange === "8 - 15 LPA" && (avgNum < 8 || avgNum > 15)) return false;
        if (placementRange === "< 8 LPA" && avgNum >= 8) return false;
      }

      // Fees Range Filter
      if (feesRange !== "All") {
        const feesClean = col.fees.toLowerCase();
        // Extract numbers
        let feesNum = 0;
        const matches = feesClean.match(/([0-9.,]+)/);
        if (matches) {
          feesNum = parseFloat(matches[1].replace(/,/g, ""));
          if (feesClean.includes("lakh")) {
            feesNum = feesNum * 100000;
          }
        }
        if (feesRange === "< 1 Lakh" && feesNum >= 100000) return false;
        if (feesRange === "1 - 3 Lakhs" && (feesNum < 100000 || feesNum > 300000)) return false;
        if (feesRange === "> 3 Lakhs" && feesNum <= 300000) return false;
      }

      return true;
    });
  };

  // Optimization: If search inputs are empty, skip Gemini and return instantly
  if (searchQuery.trim() === "" && course.trim() === "") {
    const filtered = filterPreseeded();
    collegeSearchCache.set(cacheKey, filtered);
    res.json({ success: true, colleges: filtered, source: "offline-local-cache" });
    return;
  }

  // Dynamic live search with failover router
  try {
    console.log(`Routing live college search query to Failover Router. Query: "${searchQuery}"...`);

    const response = await callAIRouter({
      prompt: prompt,
      responseFormat: "json",
      systemInstruction: "You are a real-time high-fidelity database API for accredited Indian universities, providing exact admission parameters, fees, real placement stats, and correct URLs."
    });

    const responseText = response.reply?.trim() || "[]";
    let dynamicColleges: any[] = [];
    try {
      dynamicColleges = JSON.parse(responseText);
    } catch (pe) {
      console.error("Router JSON parse failure. Retrying cleanup parse.", pe);
      let cleanText = responseText;
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      dynamicColleges = JSON.parse(cleanText);
    }

    if (Array.isArray(dynamicColleges) && dynamicColleges.length > 0) {
      // Validate structure and fill in defaults
      dynamicColleges = dynamicColleges.map((col, idx) => {
        return {
          id: col.id || `col_dyn_${Date.now()}_${idx}`,
          name: col.name || "Unknown University",
          location: col.location || "India",
          state: col.state || (state !== "All" ? state : "Delhi"),
          stream: col.stream || (stream !== "All" ? stream : "Engineering"),
          courses: Array.isArray(col.courses) ? col.courses : ["Undergraduate Studies"],
          exams: Array.isArray(col.exams) ? col.exams : ["Entrance Exams"],
          cutoff: col.cutoff || "Merit criteria applicable",
          avgPackage: col.avgPackage || "₹5.5 LPA",
          highestPackage: col.highestPackage || "₹12 LPA",
          fees: col.fees || "₹1.5 Lakhs / Year",
          rating: Number(col.rating) || 4.5,
          accreditation: col.accreditation || "UGC Approved",
          ranking: col.ranking || "Top Ranked Institution",
          ownership: col.ownership === "Private" ? "Private" : "Government",
          website: col.website || "https://www.education.gov.in"
        };
      });

      collegeSearchCache.set(cacheKey, dynamicColleges);
      res.json({ success: true, colleges: dynamicColleges, source: `live-${response.source}` });
    } else {
      console.warn("Router returned empty college array. Falling back to preseeded filtered dataset.");
      const filtered = filterPreseeded();
      res.json({ success: true, colleges: filtered, source: "offline-fallback" });
    }
  } catch (err: any) {
    console.error("Router Live College search failed. Falling back to preseeded dataset.", err);
    const filtered = filterPreseeded();
    res.json({ success: true, colleges: filtered, source: "offline-fallback-error", error: err.message });
  }
});

// -------------------------------------------------------------
// DYNAMIC LIVE CAREER INTELLIGENCE ENGINE
// -------------------------------------------------------------
const PRESEEDED_CAREERS = [
  {
    id: "car_1",
    title: "Machine Learning (ML) Engineer",
    stream: "Artificial Intelligence & Data Science",
    industry: "Information Technology",
    demand: "High",
    outlook: "Exceptional Future",
    salary: "₹18 Lakhs – ₹45 Lakhs / Year",
    entrySalary: "₹8.5 LPA",
    midSalary: "₹22.0 LPA",
    seniorSalary: "₹45.0 LPA",
    topRecruiters: ["Google", "Microsoft", "OpenAI", "Meta", "NVIDIA"],
    skills: ["Python", "Tensorflow", "Calculus & Stochastics", "Machine Learning models", "NLP", "CUDA"],
    degrees: ["B.Tech Computer Science", "M.Tech AI/ML", "Ph.D. Data Science"],
    certifications: ["TensorFlow Developer Certificate", "Google Cloud Professional ML Engineer"],
    growthProjection: "+32% growth projection over next 5 years",
    fiveYearTrend: [100, 118, 138, 162, 190],
    description: "Build robust machine learning algorithms, deep neural platforms, and deploy server-side AI products."
  },
  {
    id: "car_2",
    title: "Chartered Accountant (CA)",
    stream: "Chartered Accountancy",
    industry: "Financial Services",
    demand: "High",
    outlook: "Steady Growth",
    salary: "₹10 Lakhs – ₹30 Lakhs / Year",
    entrySalary: "₹7.0 LPA",
    midSalary: "₹15.0 LPA",
    seniorSalary: "₹30.0 LPA",
    topRecruiters: ["Deloitte", "EY", "KPMG", "PwC", "Aditya Birla Group"],
    skills: ["Auditing", "Corporate Taxation", "Corporate Law", "Balance sheets", "Finance strategy", "IFRS"],
    degrees: ["Chartered Accountancy (ICAI Member)", "B.Com"],
    certifications: ["DISA (ICAI)", "CFA (Chartered Financial Analyst)"],
    growthProjection: "+14% CAGR expected in auditing & compliance sector",
    fiveYearTrend: [100, 108, 116, 125, 135],
    description: "Administer financial statements, ensure compliance with government tax laws, and consult corporate boards."
  },
  {
    id: "car_3",
    title: "Cloud DevOps Architect",
    stream: "Engineering & Technology",
    industry: "Software Engineering",
    demand: "High",
    outlook: "Excellent Expansion",
    salary: "₹15 Lakhs – ₹35 Lakhs / Year",
    entrySalary: "₹6.8 LPA",
    midSalary: "₹18.0 LPA",
    seniorSalary: "₹35.0 LPA",
    topRecruiters: ["Amazon Web Services", "Microsoft", "TCS", "Accenture", "Cognizant"],
    skills: ["AWS/Azure", "Docker", "Kubernetes", "CI/CD Pipelines", "Linux architecture", "Terraform"],
    degrees: ["B.Tech Computer Science", "B.Tech Information Technology"],
    certifications: ["AWS Certified DevOps Engineer", "Certified Kubernetes Administrator (CKA)"],
    growthProjection: "+28% YoY expansion in cloud migration roles",
    fiveYearTrend: [100, 112, 128, 145, 165],
    description: "Shield ecosystem servers, deploy automated pipelines, manage cloud clusters, and orchestrate containerization."
  },
  {
    id: "car_4",
    title: "Corporate Litigation Partner",
    stream: "Law",
    industry: "Legal Services",
    demand: "Medium",
    outlook: "High Demand",
    salary: "₹12 Lakhs – ₹40 Lakhs / Year",
    entrySalary: "₹6.0 LPA",
    midSalary: "₹16.0 LPA",
    seniorSalary: "₹40.0 LPA",
    topRecruiters: ["Shardul Amarchand Mangaldas", "Khaitan & Co", "AZB & Partners", "Trilegal"],
    skills: ["Litigation logic", "Case studies", "Linguistic agility", "Contract Drafting", "Arbitration"],
    degrees: ["B.A. LL.B (Hons)", "LL.M. Corporate Law"],
    certifications: ["Bar Council of India Certification", "Corporate Secretary (CS)"],
    growthProjection: "+18% growth due to cross-border mergers & compliance mandates",
    fiveYearTrend: [100, 107, 115, 124, 134],
    description: "Defend strategic business models before Supreme and High Courts, advise on mergers, and settle contracts."
  },
  {
    id: "car_5",
    title: "Investment Banker & Analyst",
    stream: "Commerce & Finance",
    industry: "Banking",
    demand: "High",
    outlook: "Strong Expansion",
    salary: "₹20 Lakhs – ₹60 Lakhs / Year",
    entrySalary: "₹12.0 LPA",
    midSalary: "₹28.0 LPA",
    seniorSalary: "₹60.0 LPA",
    topRecruiters: ["Goldman Sachs", "JP Morgan Chase", "Morgan Stanley", "ICICI Securities"],
    skills: ["Financial Modeling", "Valuations", "M&A Advisory", "Excel", "Strategic Pitching"],
    degrees: ["MBA Finance", "B.Com (Hons)", "BBA Finance"],
    certifications: ["CFA Charterholder", "FRM (Financial Risk Manager)"],
    growthProjection: "+22% growth driven by retail investments and IPO spikes",
    fiveYearTrend: [100, 115, 130, 148, 168],
    description: "Engineer strategic investment logic, structure mergers and acquisitions, and underwrite capital markets."
  },
  {
    id: "car_6",
    title: "Consultant Cardiologist",
    stream: "Medical & Healthcare",
    industry: "Healthcare",
    demand: "High",
    outlook: "Constant Demand",
    salary: "₹24 Lakhs – ₹70 Lakhs / Year",
    entrySalary: "₹15.0 LPA",
    midSalary: "₹35.0 LPA",
    seniorSalary: "₹70.0 LPA",
    topRecruiters: ["Apollo Hospitals", "Fortis Healthcare", "Max Healthcare", "Medanta"],
    skills: ["Echocardiography", "Interventional Cardiology", "Patient diagnosis", "Clinical Research"],
    degrees: ["MBBS", "MD Internal Medicine", "DM Cardiology"],
    certifications: ["Medical Council of India License", "Fellowship in Interventional Cardiology"],
    growthProjection: "+15% YoY growth due to evolving cardiovascular diagnostics",
    fiveYearTrend: [100, 106, 114, 122, 132],
    description: "Diagnose cardiovascular anomalies, prescribe clinical therapies, perform angioplasties, and consult on post-op health."
  },
  {
    id: "car_7",
    title: "Actuarial Risk Analyst",
    stream: "Banking & Insurance",
    industry: "Insurance",
    demand: "High",
    outlook: "Highly Specialized",
    salary: "₹12 Lakhs – ₹32 Lakhs / Year",
    entrySalary: "₹6.5 LPA",
    midSalary: "₹15.0 LPA",
    seniorSalary: "₹32.0 LPA",
    topRecruiters: ["LIC of India", "HDFC Standard Life", "ICICI Prudential", "Swiss Re"],
    skills: ["Probability theory", "Statistical modeling", "R/Python", "Risk evaluation", "Mortality tables"],
    degrees: ["B.Sc. Actuarial Science", "M.Sc. Statistics", "B.Sc. Mathematics"],
    certifications: ["Institute of Actuaries of India (IAI) Exams", "Fellow of Institute of Actuaries (FIA)"],
    growthProjection: "+25% expected demand for insurance underwriting & climate risk models",
    fiveYearTrend: [100, 110, 122, 136, 152],
    description: "Assess underwriting risk vectors, model longevity & accident rates, and advise insurers on minimum capital reserves."
  },
  {
    id: "car_8",
    title: "Indian Administrative Service (IAS) Officer",
    stream: "Civil Services",
    industry: "Government Administration",
    demand: "High",
    outlook: "Prestigious Stability",
    salary: "₹9 Lakhs – ₹28 Lakhs / Year",
    entrySalary: "₹7.2 LPA",
    midSalary: "₹14.0 LPA",
    seniorSalary: "₹28.0 LPA",
    topRecruiters: ["Government of India", "State Governments", "Public Sector Undertakings"],
    skills: ["Public Policy Formulation", "Crisis Administration", "Interdepartmental coordination", "Linguistic Command"],
    degrees: ["Any Undergraduate Degree (B.A., B.Sc., B.Tech, etc.)"],
    certifications: ["UPSC Civil Services Examination clearance", "LBSNAA Training Completion"],
    growthProjection: "+10% steady admin command expansion across digital government infrastructures",
    fiveYearTrend: [100, 104, 108, 112, 116],
    description: "Supervise regional development initiatives, implement Union/State welfare programs, and orchestrate district operations."
  },
  {
    id: "car_9",
    title: "Fighter Pilot (IAF)",
    stream: "Defence",
    industry: "Military / Defence Services",
    demand: "Medium",
    outlook: "High Rigor & Duty",
    salary: "₹12 Lakhs – ₹26 Lakhs / Year",
    entrySalary: "₹9.5 LPA",
    midSalary: "₹16.0 LPA",
    seniorSalary: "₹26.0 LPA",
    topRecruiters: ["Indian Air Force (IAF)", "Ministry of Defence"],
    skills: ["Aviation navigation", "Spatial orientation", "Tactical weapon deployment", "High-G endurance"],
    degrees: ["B.Sc. Aviation", "B.Tech Aeronautical Engineering"],
    certifications: ["NDA / AFCAT clearance", "Military Pilot Wings License"],
    growthProjection: "+12% strategic command modernization focus with smart multirole fighters",
    fiveYearTrend: [100, 105, 110, 116, 122],
    description: "Operate supersonic defense fighters, shield airspace boundaries, and perform search, rescue, and combat exercises."
  },
  {
    id: "car_10",
    title: "Strategy Consultant",
    stream: "Management & MBA",
    industry: "Management Consulting",
    demand: "High",
    outlook: "Outstanding Growth",
    salary: "₹18 Lakhs – ₹45 Lakhs / Year",
    entrySalary: "₹12.0 LPA",
    midSalary: "₹24.0 LPA",
    seniorSalary: "₹45.0 LPA",
    topRecruiters: ["McKinsey & Company", "Boston Consulting Group (BCG)", "Bain & Company", "Accenture Strategy"],
    skills: ["Market-entry strategy", "Operations optimization", "Executive presentation", "B2B Negotiations"],
    degrees: ["MBA (IIMs, ISB)", "Masters in Economics", "B.Tech"],
    certifications: ["Lean Six Sigma Black Belt", "PMP (Project Management Professional)"],
    growthProjection: "+20% growth driven by global business transformations and enterprise cost restructuring",
    fiveYearTrend: [100, 114, 128, 144, 162],
    description: "Provide strategic advice to Fortune 500 boards, structure mergers, restructure failing operations, and audit efficiencies."
  },
  {
    id: "car_11",
    title: "Lead UI/UX Architect",
    stream: "Design & Animation",
    industry: "Creative Tech",
    demand: "High",
    outlook: "Fast-Paced Expansion",
    salary: "₹10 Lakhs – ₹28 Lakhs / Year",
    entrySalary: "₹5.5 LPA",
    midSalary: "₹14.0 LPA",
    seniorSalary: "₹28.0 LPA",
    topRecruiters: ["Adobe", "Apple", "Flipkart", "Razorpay", "Zomato"],
    skills: ["Figma Design", "User empathy mapping", "Prototyping", "A/B Testing", "CSS/JS interactions"],
    degrees: ["B.Des Interaction Design", "B.Sc. Animation & Multimedia"],
    certifications: ["Google UX Design Certificate", "Interaction Design Foundation Master Membership"],
    growthProjection: "+30% growth due to high focus on customer-centric digital products",
    fiveYearTrend: [100, 116, 134, 154, 178],
    description: "Design elegant digital product layouts, optimize user checkout conversions, and conduct usability tests on interactive mockups."
  },
  {
    id: "car_12",
    title: "Sustainable Urban Architect",
    stream: "Architecture",
    industry: "Real Estate & Infrastructure",
    demand: "Medium",
    outlook: "Evolving Green Sector",
    salary: "₹8 Lakhs – ₹22 Lakhs / Year",
    entrySalary: "₹4.8 LPA",
    midSalary: "₹11.0 LPA",
    seniorSalary: "₹22.0 LPA",
    topRecruiters: ["L&T Construction", "DLF", "Tata Projects", "Gensler"],
    skills: ["AutoCAD", "Revit BIM", "LEED metrics", "Structural layout design", "Green materials"],
    degrees: ["B.Arch", "M.Arch Urban Design", "B.Plan"],
    certifications: ["IGBC AP (Indian Green Building Council)", "LEED Green Associate"],
    growthProjection: "+15% YoY increase as smart cities embrace green building bylaws",
    fiveYearTrend: [100, 107, 115, 124, 135],
    description: "Draft architectural blue-prints for high-rise residential properties, configure natural solar grids, and optimize water treatment systems."
  },
  {
    id: "car_13",
    title: "Investigative Broadcast Journalist",
    stream: "Media & Journalism",
    industry: "Media / News Broadcasting",
    demand: "Medium",
    outlook: "Dynamic Media Sector",
    salary: "₹6 Lakhs – ₹18 Lakhs / Year",
    entrySalary: "₹3.8 LPA",
    midSalary: "₹8.5 LPA",
    seniorSalary: "₹18.0 LPA",
    topRecruiters: ["NDTV", "India Today", "Network18", "The Hindu", "BBC India"],
    skills: ["Investigative research", "Public interviewing", "On-camera presentation", "Copywriting", "Media Law"],
    degrees: ["B.A. Journalism", "M.A. Mass Communication"],
    certifications: ["Creative Commons Copyright License Course", "Digital Journalism Certification"],
    growthProjection: "+10% growth with high demand in video documentary formats and digital channels",
    fiveYearTrend: [100, 105, 111, 118, 125],
    description: "Track geopolitical activities, conduct hard-hitting on-camera interviews, audit public policies, and write editorial reviews."
  },
  {
    id: "car_14",
    title: "Assistant Professor & Researcher",
    stream: "Education & Teaching",
    industry: "Higher Education",
    demand: "Medium",
    outlook: "Academic Stability",
    salary: "₹8 Lakhs – ₹20 Lakhs / Year",
    entrySalary: "₹6.0 LPA",
    midSalary: "₹11.5 LPA",
    seniorSalary: "₹20.0 LPA",
    topRecruiters: ["Delhi University", "IISc Bangalore", "BITS Pilani", "Amity University"],
    skills: ["Curriculum design", "Academic Research publishing", "Public speech", "Pedagogy strategies"],
    degrees: ["Ph.D. in Specialization", "Master's Degree"],
    certifications: ["UGC NET Clearance", "CSIR NET License"],
    growthProjection: "+12% growth driven by central research grants and new private campuses",
    fiveYearTrend: [100, 106, 112, 119, 126],
    description: "Deliver comprehensive lectures to undergrad batches, publish thesis outcomes in international journals, and evaluate exams."
  },
  {
    id: "car_15",
    title: "Precision Agriculture Specialist",
    stream: "Agriculture",
    industry: "AgriTech",
    demand: "Medium",
    outlook: "Agri-Tech Revolution",
    salary: "₹6 Lakhs – ₹16 Lakhs / Year",
    entrySalary: "₹4.2 LPA",
    midSalary: "₹8.8 LPA",
    seniorSalary: "₹16.0 LPA",
    topRecruiters: ["DeHaat", "CropIn", "ITC Agri-Business", "UPL Limited"],
    skills: ["IoT Soil Sensors", "Drone telemetry", "Agronomy analytics", "Organic yield cycles"],
    degrees: ["B.Sc. Agriculture", "M.Sc. Agronomy", "B.Tech Agricultural Engineering"],
    certifications: ["Commercial Drone Pilot License", "Organic Soil Assessor Certificate"],
    growthProjection: "+26% YoY surge in smart drone agricultural services",
    fiveYearTrend: [100, 112, 126, 142, 160],
    description: "Deploy automated IoT devices to measure nitrogen levels, analyze satellite crop patterns, and improve harvest volume yields."
  },
  {
    id: "car_16",
    title: "Luxury Resort General Manager",
    stream: "Hospitality & Tourism",
    industry: "Hospitality",
    demand: "Medium",
    outlook: "Luxury Market Rebound",
    salary: "₹10 Lakhs – ₹25 Lakhs / Year",
    entrySalary: "₹5.0 LPA",
    midSalary: "₹12.0 LPA",
    seniorSalary: "₹25.0 LPA",
    topRecruiters: ["Taj Hotels", "The Oberoi Group", "ITC Hotels", "Marriott India"],
    skills: ["Guest operations", "Revenue Management", "Corporate banquets", "Culinary inventory logistics"],
    degrees: ["B.Sc. Hospitality & Hotel Administration", "MBA Hospitality"],
    certifications: ["CHE (Certified Hospitality Educator)", "Revenue Management certification"],
    growthProjection: "+18% growth driven by domestic luxury spiritual tourism expansion",
    fiveYearTrend: [100, 108, 117, 128, 140],
    description: "Direct elite luxury operations, manage staff hospitality protocols, audit food & beverage costs, and ensure client satisfaction."
  },
  {
    id: "car_17",
    title: "Sports Physiotherapist",
    stream: "Sports & Fitness",
    industry: "Athletics & Health",
    demand: "Medium",
    outlook: "Athletic Expansion",
    salary: "₹7 Lakhs – ₹18 Lakhs / Year",
    entrySalary: "₹4.5 LPA",
    midSalary: "₹9.2 LPA",
    seniorSalary: "₹18.0 LPA",
    topRecruiters: ["BCCI (Cricket Board)", "Sports Authority of India (SAI)", "Elite IPL Franchises", "Pro Kabaddi leagues"],
    skills: ["Injury rehabilitation", "Kinesiology taping", "Biomechanical analysis", "Therapeutic massage"],
    degrees: ["Bachelor of Physiotherapy (BPT)", "Master of Sports Physiotherapy (MPT)"],
    certifications: ["Certified Strength & Conditioning Specialist (CSCS)", "Dry Needling Practitioner"],
    growthProjection: "+22% growth as domestic athletic leagues scale up commercial operations",
    fiveYearTrend: [100, 109, 120, 132, 146],
    description: "Diagnose muscle fatigues, construct workout programs for high-performance players, and oversee field triage protocols."
  },
  {
    id: "car_18",
    title: "Venture-Backed Startup Founder",
    stream: "Entrepreneurship",
    industry: "Tech Startup",
    demand: "High",
    outlook: "High Risk, Ultra High Reward",
    salary: "₹12 Lakhs – ₹80 Lakhs / Year",
    entrySalary: "₹6.0 LPA",
    midSalary: "₹25.0 LPA",
    seniorSalary: "₹80.0 LPA",
    topRecruiters: ["Y Combinator", "Sequoia India / Peak XV", "Accel Partners", "Self-Employed (SaaS)"],
    skills: ["Pitch Deck construction", "Minimum Viable Product (MVP) development", "Equity cap-table management", "Recruitment"],
    degrees: ["Any Degree (B.Tech, B.Com, MBA etc. - Passion and grit are primary)"],
    certifications: ["Stanford Venture Capital Course", "SaaS Growth Academy Certificate"],
    growthProjection: "+35% CAGR expansion in fintech, climate tech, and AI SaaS sectors",
    fiveYearTrend: [100, 120, 148, 185, 230],
    description: "Identify market gaps, secure angel or venture capital funding, draft long-term product roadmaps, and hire key architects."
  },
  {
    id: "car_19",
    title: "Advanced CNC Robotics Machinist",
    stream: "Skilled Trades",
    industry: "Industrial Manufacturing",
    demand: "Medium",
    outlook: "Automation Centric Trade",
    salary: "₹5 Lakhs – ₹12 Lakhs / Year",
    entrySalary: "₹3.2 LPA",
    midSalary: "₹6.5 LPA",
    seniorSalary: "₹12.0 LPA",
    topRecruiters: ["Tata Motors", "Bharat Heavy Electricals (BHEL)", "L&T Heavy Engineering", "Mahindra & Mahindra"],
    skills: ["G-code/M-code programming", "Hydraulic alignment", "Micrometer calibrations", "Safety protocols"],
    degrees: ["Diploma in Mechanical Engineering", "ITI Certification in Machinist/Tool & Die"],
    certifications: ["Siemens CNC Controller Operator License", "OSHA Safety Standard course"],
    growthProjection: "+14% growth driven by the 'Make in India' smart manufacturing wave",
    fiveYearTrend: [100, 106, 113, 120, 128],
    description: "Write coordinates for robotic lathes, perform structural calibrations on metallic engine casings, and audit machine safety tolerances."
  },
  {
    id: "car_20",
    title: "Quantum Computing Research Scientist",
    stream: "Research & Academia",
    industry: "Deep Tech / Science",
    demand: "High",
    outlook: "Exceptional Frontiers",
    salary: "₹18 Lakhs – ₹55 Lakhs / Year",
    entrySalary: "₹11.0 LPA",
    midSalary: "₹26.0 LPA",
    seniorSalary: "₹55.0 LPA",
    topRecruiters: ["IISc Bangalore", "TIFR", "IBM Quantum Research", "Microsoft Quantum", "Intel Labs"],
    skills: ["Qiskit SDK", "Quantum superposition theory", "Cryogenic hardware operations", "Mathematical modeling"],
    degrees: ["Ph.D. in Physics / Quantum Computing", "M.Tech Nanotechnology"],
    certifications: ["IBM Quantum Developer Certification", "Advanced Supercomputing Scholar License"],
    growthProjection: "+38% growth on research budgets for futuristic sovereign computing capabilities",
    fiveYearTrend: [100, 122, 150, 184, 226],
    description: "Engineer superconducting quantum processors, research noise-decoherence prevention, and formulate quantum error correction codes."
  }
];

const careerSearchCache = new Map<string, any[]>();

app.post("/api/careers/search", async (req, res) => {
  const { 
    searchQuery = "", 
    stream = "All", 
    bypassCache = false 
  } = req.body;

  const cacheKey = JSON.stringify({ searchQuery, stream });

  if (!bypassCache && careerSearchCache.has(cacheKey)) {
    console.log("Serving career discovery from cache...");
    res.json({ success: true, careers: careerSearchCache.get(cacheKey), source: "offline-local-cache" });
    return;
  }

  const filterPreseeded = () => {
    return PRESEEDED_CAREERS.filter(car => {
      // Stream Filter
      if (stream !== "All" && car.stream.toLowerCase() !== stream.toLowerCase()) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = car.title.toLowerCase().includes(q);
        const matchesSkills = car.skills.some(sk => sk.toLowerCase().includes(q));
        const matchesIndustry = car.industry.toLowerCase().includes(q);
        const matchesStream = car.stream.toLowerCase().includes(q);
        const matchesDegrees = car.degrees.some(dg => dg.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSkills && !matchesIndustry && !matchesStream && !matchesDegrees) {
          return false;
        }
      }

      return true;
    });
  };

  // Optimization: If search text is empty and bypassCache is false, serve instantly from preseeded filtration
  if (!bypassCache && searchQuery.trim() === "") {
    const filtered = filterPreseeded();
    careerSearchCache.set(cacheKey, filtered);
    res.json({ success: true, careers: filtered, source: "offline-local-cache" });
    return;
  }

  // Dynamic live search with failover router
  try {
    console.log(`Routing live career intelligence query to Failover Router. Query: "${searchQuery}", Stream: "${stream}"...`);

    const response = await callAIRouter({
      prompt: prompt,
      responseFormat: "json",
      systemInstruction: "You are a real-time high-fidelity job market database and career intelligence API for the Indian corporate sector, providing correct placement statistics, salary indices, top recruiters, and required skills."
    });

    const responseText = response.reply?.trim() || "[]";
    let dynamicCareers: any[] = [];
    try {
      dynamicCareers = JSON.parse(responseText);
    } catch (pe) {
      console.error("Router JSON parse failure. Retrying cleanup parse.", pe);
      let cleanText = responseText;
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      dynamicCareers = JSON.parse(cleanText);
    }

    if (Array.isArray(dynamicCareers) && dynamicCareers.length > 0) {
      // Validate structure and fill in defaults
      dynamicCareers = dynamicCareers.map((car, idx) => {
        return {
          id: car.id || `car_dyn_${Date.now()}_${idx}`,
          title: car.title || "Career Path Option",
          stream: car.stream || (stream !== "All" ? stream : "Engineering & Technology"),
          industry: car.industry || "Professional Sector",
          demand: car.demand === "Low" ? "Low" : car.demand === "Medium" ? "Medium" : "High",
          outlook: car.outlook || "Steady Growth Sector",
          salary: car.salary || "₹8 Lakhs – ₹22 Lakhs / Year",
          entrySalary: car.entrySalary || "₹4.5 LPA",
          midSalary: car.midSalary || "₹10.0 LPA",
          seniorSalary: car.seniorSalary || "₹22.0 LPA",
          topRecruiters: Array.isArray(car.topRecruiters) ? car.topRecruiters : ["Leading Enterprises"],
          skills: Array.isArray(car.skills) ? car.skills : ["Key Analytical Skills"],
          degrees: Array.isArray(car.degrees) ? car.degrees : ["Undergraduate Degree"],
          certifications: Array.isArray(car.certifications) ? car.certifications : ["Industry Standard Credentials"],
          growthProjection: car.growthProjection || "+12% Growth Projection",
          fiveYearTrend: Array.isArray(car.fiveYearTrend) && car.fiveYearTrend.length === 5 ? car.fiveYearTrend : [100, 108, 116, 126, 138],
          description: car.description || "Exciting trajectory involving operations administration and strategic growth planning."
        };
      });

      careerSearchCache.set(cacheKey, dynamicCareers);
      res.json({ success: true, careers: dynamicCareers, source: `live-${response.source}` });
    } else {
      console.warn("Router returned empty career list. Using offline fallback.");
      const filtered = filterPreseeded();
      res.json({ success: true, careers: filtered, source: "offline-fallback" });
    }
  } catch (err: any) {
    console.error("Router Live Career Intelligence failed. Falling back to preseeded dataset.", err);
    const filtered = filterPreseeded();
    res.json({ success: true, careers: filtered, source: "offline-fallback-error", error: err.message });
  }
});

// -------------------------------------------------------------
// DYNAMIC LIVE SCHOLARSHIP INTELLIGENCE PLATFORM
// -------------------------------------------------------------
const PRESEEDED_SCHOLARSHIPS = [
  {
    id: "sch_1",
    title: "CBSE Single Girl Child Scholarship",
    category: "Girls",
    amount: "₹6,000 / Year",
    amountValue: 6000,
    deadline: "2026-10-15",
    eligibility: "Single girl child studying in CBSE Class 10/11 scoring > 60% in board exam.",
    classEligibility: "Class 10",
    incomeCriteria: "None",
    stateEligibility: "All India",
    applicationLink: "https://cbse.gov.in",
    status: "Open",
    provider: "Central Board of Secondary Education (CBSE)"
  },
  {
    id: "sch_2",
    title: "National Talent Search Examination (NTSE)",
    category: "Olympiads",
    amount: "₹15,000 / Year",
    amountValue: 15000,
    deadline: "2026-11-30",
    eligibility: "Students qualifying through state-level talent search selection.",
    classEligibility: "Class 10",
    incomeCriteria: "None",
    stateEligibility: "All India",
    applicationLink: "https://ncert.nic.in",
    status: "Upcoming",
    provider: "National Council of Educational Research and Training (NCERT)"
  },
  {
    id: "sch_3",
    title: "SGFI National Athlete Fellowship",
    category: "Sports",
    amount: "₹25,000 / Year",
    amountValue: 25000,
    deadline: "2026-09-10",
    eligibility: "Student-athletes participating and earning medals in National School Games.",
    classEligibility: "Class 11",
    incomeCriteria: "None",
    stateEligibility: "All India",
    applicationLink: "https://sgfibharat.com",
    status: "Open",
    provider: "School Games Federation of India (SGFI)"
  },
  {
    id: "sch_4",
    title: "Kishore Vaigyanik Protsahan Yojana (KVPY)",
    category: "Research",
    amount: "₹60,000 / Year",
    amountValue: 60000,
    deadline: "2026-08-25",
    eligibility: "Class 11/12 Science students pursuing high-clearance research fields.",
    classEligibility: "Class 12",
    incomeCriteria: "None",
    stateEligibility: "All India",
    applicationLink: "https://kvpy.iisc.ac.in",
    status: "Closed",
    provider: "Department of Science and Technology (DST)"
  },
  {
    id: "sch_5",
    title: "AICTE Pragati Scholarship for Girl Students",
    category: "Girls",
    amount: "₹50,000 / Year",
    amountValue: 50000,
    deadline: "2026-10-31",
    eligibility: "Girl students admitted to first year of degree/diploma course in AICTE approved institutions.",
    classEligibility: "Undergraduate",
    incomeCriteria: "Family income < ₹8 Lakhs/Yr",
    stateEligibility: "All India",
    applicationLink: "https://www.aicte-india.org",
    status: "Open",
    provider: "AICTE"
  },
  {
    id: "sch_6",
    title: "National Means Cum Merit Scholarship (NMMS)",
    category: "Need-Based",
    amount: "₹12,000 / Year",
    amountValue: 12000,
    deadline: "2026-10-30",
    eligibility: "EWS and eligible category students studying in recognized institutions.",
    classEligibility: "Class 8/9",
    incomeCriteria: "Family income < ₹3.5 Lakhs/Yr",
    stateEligibility: "All India",
    applicationLink: "https://scholarships.gov.in",
    status: "Open",
    provider: "Ministry of Education"
  },
  {
    id: "sch_7",
    title: "Post Matric Scholarship for SC Students",
    category: "SC/ST",
    amount: "₹18,000 / Year",
    amountValue: 18000,
    deadline: "2026-12-15",
    eligibility: "Scheduled Caste students studying in recognized post-matriculation or higher courses.",
    classEligibility: "Undergraduate",
    incomeCriteria: "Family income < ₹2.5 Lakhs/Yr",
    stateEligibility: "All India",
    applicationLink: "https://scholarships.gov.in",
    status: "Open",
    provider: "Ministry of Social Justice & Empowerment"
  },
  {
    id: "sch_8",
    title: "Pre-Matric Scholarship Scheme for Minorities",
    category: "Minority",
    amount: "₹5,000 / Year",
    amountValue: 5000,
    deadline: "2026-09-30",
    eligibility: "Minority community students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) scoring > 50%.",
    classEligibility: "Class 9/10",
    incomeCriteria: "Family income < ₹1 Lakh/Yr",
    stateEligibility: "All India",
    applicationLink: "https://scholarships.gov.in",
    status: "Open",
    provider: "Ministry of Minority Affairs"
  },
  {
    id: "sch_9",
    title: "Raman Charpak Fellowship",
    category: "International",
    amount: "₹1,20,000 / Year",
    amountValue: 120000,
    deadline: "2026-07-15",
    eligibility: "Indian and French PhD students willing to carry out research in each other's countries.",
    classEligibility: "Research",
    incomeCriteria: "None",
    stateEligibility: "International",
    applicationLink: "https://www.cefipra.org",
    status: "Upcoming",
    provider: "CEFIPRA"
  },
  {
    id: "sch_10",
    title: "ONGC Merit Scholarship for OBC Students",
    category: "OBC",
    amount: "₹48,000 / Year",
    amountValue: 48000,
    deadline: "2026-05-10",
    eligibility: "Meritorious OBC students pursuing professional courses in engineering or medicine.",
    classEligibility: "Undergraduate",
    incomeCriteria: "Family income < ₹4.5 Lakhs/Yr",
    stateEligibility: "All India",
    applicationLink: "https://ongcindia.com",
    status: "Closed",
    provider: "ONGC"
  }
];

const scholarshipSearchCache = new Map<string, any[]>();

app.post("/api/scholarships/search", async (req, res) => {
  const { 
    searchQuery = "", 
    classFilter = "All",
    stateFilter = "All",
    categoryFilter = "All",
    amountRangeFilter = "All",
    statusFilter = "All",
    bypassCache = false 
  } = req.body;

  const cacheKey = JSON.stringify({ searchQuery, classFilter, stateFilter, categoryFilter, amountRangeFilter, statusFilter });

  if (!bypassCache && scholarshipSearchCache.has(cacheKey)) {
    console.log("Serving scholarship intelligence from cache...");
    res.json({ success: true, scholarships: scholarshipSearchCache.get(cacheKey), source: "offline-local-cache" });
    return;
  }

  const filterPreseeded = () => {
    return PRESEEDED_SCHOLARSHIPS.filter(sch => {
      // Category Filter
      if (categoryFilter !== "All" && sch.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Class Filter
      if (classFilter !== "All") {
        const q = classFilter.toLowerCase();
        const matchesClass = sch.classEligibility.toLowerCase().includes(q) || q.includes(sch.classEligibility.toLowerCase());
        if (!matchesClass) return false;
      }

      // State Filter
      if (stateFilter !== "All") {
        const q = stateFilter.toLowerCase();
        const matchesState = sch.stateEligibility.toLowerCase().includes(q) || q.includes(sch.stateEligibility.toLowerCase());
        if (!matchesState) return false;
      }

      // Status Filter
      if (statusFilter !== "All" && sch.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Amount Range Filter
      if (amountRangeFilter !== "All") {
        if (amountRangeFilter === "< 10000" && sch.amountValue >= 10000) return false;
        if (amountRangeFilter === "10000 - 50000" && (sch.amountValue < 10000 || sch.amountValue > 50000)) return false;
        if (amountRangeFilter === "> 50000" && sch.amountValue <= 50000) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sch.title.toLowerCase().includes(q);
        const matchesElig = sch.eligibility.toLowerCase().includes(q);
        const matchesClassElig = sch.classEligibility.toLowerCase().includes(q);
        const matchesProvider = sch.provider.toLowerCase().includes(q);
        const matchesStateElig = sch.stateEligibility.toLowerCase().includes(q);
        const matchesCategory = sch.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesElig && !matchesClassElig && !matchesProvider && !matchesStateElig && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  };

  // Optimization: If search inputs are empty, skip Gemini and return instantly
  if (!bypassCache && searchQuery.trim() === "" && classFilter === "All" && stateFilter === "All" && categoryFilter === "All" && amountRangeFilter === "All" && statusFilter === "All") {
    const filtered = filterPreseeded();
    scholarshipSearchCache.set(cacheKey, filtered);
    res.json({ success: true, scholarships: filtered, source: "offline-local-cache" });
    return;
  }

  // Dynamic live search with failover router
  try {
    console.log(`Routing live scholarship query to Failover Router. Query: "${searchQuery}", Class: "${classFilter}", Category: "${categoryFilter}", State: "${stateFilter}"...`);

    const response = await callAIRouter({
      prompt: prompt,
      responseFormat: "json",
      systemInstruction: "You are a real-time high-fidelity scholarship intelligence API for the Indian educational sector, providing correct stipend numbers, state filters, class brackets, eligibility criteria, and correct official government portals (e.g. scholarships.gov.in)."
    });

    const responseText = response.reply?.trim() || "[]";
    let dynamicScholarships: any[] = [];
    try {
      dynamicScholarships = JSON.parse(responseText);
    } catch (pe) {
      console.error("Router JSON parse failure. Retrying cleanup parse.", pe);
      let cleanText = responseText;
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      dynamicScholarships = JSON.parse(cleanText);
    }

    if (Array.isArray(dynamicScholarships) && dynamicScholarships.length > 0) {
      // Validate structure and fill in defaults
      dynamicScholarships = dynamicScholarships.map((sch, idx) => {
        return {
          id: sch.id || `sch_dyn_${Date.now()}_${idx}`,
          title: sch.title || "Elite Academic Grant",
          category: sch.category || (categoryFilter !== "All" ? categoryFilter : "Academic"),
          amount: sch.amount || "₹12,000 / Year",
          amountValue: Number(sch.amountValue) || 12000,
          deadline: sch.deadline || "2026-11-30",
          eligibility: sch.eligibility || "Students satisfying standard merit and performance ratios.",
          classEligibility: sch.classEligibility || (classFilter !== "All" ? classFilter : "Class 10/11/12"),
          incomeCriteria: sch.incomeCriteria || "None",
          stateEligibility: sch.stateEligibility || (stateFilter !== "All" ? stateFilter : "All India"),
          applicationLink: sch.applicationLink || "https://scholarships.gov.in",
          status: sch.status === "Closed" ? "Closed" : sch.status === "Upcoming" ? "Upcoming" : "Open",
          provider: sch.provider || "Government of India Portal"
        };
      });

      scholarshipSearchCache.set(cacheKey, dynamicScholarships);
      res.json({ success: true, scholarships: dynamicScholarships, source: `live-${response.source}` });
    } else {
      console.warn("Router returned empty scholarship list. Using offline fallback.");
      const filtered = filterPreseeded();
      res.json({ success: true, scholarships: filtered, source: "offline-fallback" });
    }
  } catch (err: any) {
    console.error("Router Live Scholarship failed. Falling back to preseeded dataset.", err);
    const filtered = filterPreseeded();
    res.json({ success: true, scholarships: filtered, source: "offline-fallback-error", error: err.message });
  }
});

// API: Create Razorpay Order
app.post("/api/create-order", async (req, res) => {
  console.log("[DIAGNOSIS] POST /api/create-order called with body:", req.body);
  const { amount, receipt } = req.body;

  // 6. Print runtime values
  const currentKeyId = keyId;
  const currentKeySecret = keySecret;
  
  console.log("[DIAGNOSIS RUNTIME VALUES]");
  console.log("- keyId is undefined:", currentKeyId === undefined);
  console.log("- keyId value length:", currentKeyId ? currentKeyId.length : 0);
  console.log("- keySecret is undefined:", currentKeySecret === undefined);
  console.log("- keySecret value length:", currentKeySecret ? currentKeySecret.length : 0);

  // 5. Verify credentials and parameters
  const errors: string[] = [];
  if (!currentKeyId) {
    errors.push("RAZORPAY_KEY_ID does not exist or is empty.");
  } else {
    if (/['"]/.test(currentKeyId)) {
      errors.push("RAZORPAY_KEY_ID contains quotes.");
    }
    if (/\s/.test(currentKeyId)) {
      errors.push("RAZORPAY_KEY_ID contains whitespace.");
    }
  }

  if (!currentKeySecret) {
    errors.push("RAZORPAY_KEY_SECRET does not exist or is empty.");
  } else {
    if (/['"]/.test(currentKeySecret)) {
      errors.push("RAZORPAY_KEY_SECRET contains quotes.");
    }
    if (/\s/.test(currentKeySecret)) {
      errors.push("RAZORPAY_KEY_SECRET contains whitespace.");
    }
  }

  if (!razorpay) {
    errors.push("Razorpay client is not initialized.");
  }

  if (amount === undefined || amount === null) {
    errors.push("Amount is missing.");
  } else {
    if (typeof amount !== "number") {
      errors.push("Amount is not a number.");
    } else {
      if (!Number.isInteger(amount)) {
        errors.push("Amount is not an integer.");
      }
      if (amount < 100) {
        errors.push("Amount is less than 100 paise.");
      }
    }
  }

  if (errors.length > 0) {
    console.error("[DIAGNOSIS VALIDATION FAILURE]", errors);
    res.status(400).json({
      success: false,
      error: "Validation failed: " + errors.join(" ")
    });
    return;
  }

  console.log("[DIAGNOSIS] Before Razorpay SDK create-order request. Key ID used:", currentKeyId);
  try {
    const order = await razorpay.orders.create({
      amount: amount, // in paise
      currency: "INR",
      receipt: receipt || `receipt_order_${Date.now()}`
    });

    console.log("[DIAGNOSIS] After Razorpay SDK create-order response (SUCCESS):", order);
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err: any) {
    // 3. Log the FULL error object
    console.error("[DIAGNOSIS] Exact exception causing HTTP 500 in create-order:");
    if (err) {
      console.error("- error.message:", err.message);
      console.error("- error.code:", err.code);
      console.error("- error.description:", err.description || (err.error && err.error.description));
      console.error("- error.statusCode:", err.statusCode);
      console.error("- stack trace:", err.stack);
      console.error("- raw error object:", JSON.stringify(err, null, 2));
    } else {
      console.error("- err is null or undefined");
    }

    // 4. Return { success: false, error: actual_error_message }
    const actual_error_message = err ? (err.description || (err.error && err.error.description) || err.message || "Failed to create Razorpay order") : "Unknown Razorpay error";
    res.status(500).json({
      success: false,
      error: actual_error_message
    });
  }
});

// API: Verify Razorpay Payment Signature
app.post("/api/verify-payment", async (req, res) => {
  console.log("[DIAGNOSIS] POST /api/verify-payment called with body:", req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error("[DIAGNOSIS] Missing required verification parameters in body:", req.body);
    res.status(400).json({ error: "Missing required verification parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." });
    return;
  }

  console.log("[DIAGNOSIS] Before Razorpay signature verification process...");
  try {
    const key_secret = keySecret;
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    console.log("[DIAGNOSIS] Generated signature:", generated_signature);
    console.log("[DIAGNOSIS] Received signature:", razorpay_signature);

    if (generated_signature === razorpay_signature) {
      console.log("[DIAGNOSIS] Signature verification (SUCCESS)");
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      console.error("[DIAGNOSIS] Signature verification (FAILURE): Mismatch");
      res.status(400).json({ success: false, error: "Signature verification failed" });
    }
  } catch (err: any) {
    console.error("[DIAGNOSIS] Signature verification exception:", err);
    res.status(500).json({ error: "Signature verification failed", details: err.message });
  }
});

// -------------------------------------------------------------
// DYNAMIC PARENT MONITORING & MONITOR PROGRESS INTELLIGENCE
// -------------------------------------------------------------
app.post("/api/parent/send-report", async (req, res) => {
  const {
    guardianEmail,
    studentName = "Active Scholar",
    reportPeriod = "Bi-Weekly",
    totalStudyHours = 52,
    timeSpentBySubject = {
      "Mathematics": 18,
      "Science": 14,
      "English": 9,
      "Social Science": 11
    },
    skillGrowth = {
      "Communication": 85,
      "Analytical Thinking": 90,
      "Problem Solving": 88,
      "Leadership": 72,
      "Technical Skills": 80,
      "Creativity": 78
    },
    academicSummary = {
      highestSubject: "Computer Science",
      lowestSubject: "Physics",
      mostImprovedSubject: "Mathematics",
      recommendedFocusArea: "Physics Mock Assessments"
    }
  } = req.body;

  if (!guardianEmail || !guardianEmail.includes("@")) {
    res.status(400).json({ success: false, error: "A valid Parent/Guardian email address is required." });
    return;
  }

  // Generate dynamic AI summary from Gemini
  let aiSummary = "Student has demonstrated strong growth in Mathematics and analytical reasoning over the last two weeks. Consistency in Science and English practice is recommended to maintain balanced academic development.";
  try {
    console.log(`Generating live Parent progress summary for ${studentName} via Failover Router...`);
    const response = await callAIRouter({
      prompt: `
      You are a brilliant AI Educational Academic Counselor. Generate a professional, highly encouraging 2-sentence or 3-sentence Student Progress Summary for a report sent to a parent/guardian.
      
      Parameters:
      - Student Name: ${studentName}
      - Highest Performing Subject: ${academicSummary.highestSubject}
      - Lowest Performing Subject: ${academicSummary.lowestSubject}
      - Most Improved Subject: ${academicSummary.mostImprovedSubject}
      - Recommended Focus Area: ${academicSummary.recommendedFocusArea}
      - Total Study Hours: ${totalStudyHours} hours
      - Core Skills: ${Object.entries(skillGrowth).map(([k, v]) => `${k} (${v}%)`).join(", ")}

      Make the summary feel constructive, authentic, cyber-futuristic, and supportive. Emphasize their strengths and politely highlight where focus is needed. Avoid general boilerplate.
      `
    });
    if (response.reply) {
      aiSummary = response.reply.trim();
    }
  } catch (gErr: any) {
    console.warn("Router dynamic summary failed, falling back to preloaded counselor template.", gErr);
  }

  // Construct Email HTML template with futuristic cyberpunk FuturePath styling
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FuturePath AI - Progress Audit</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #020617;
        color: #e2e8f0;
      }
      .wrapper {
        background-color: #020617;
        padding: 24px;
        max-width: 600px;
        margin: 0 auto;
        border: 1px solid #1e293b;
        border-radius: 12px;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .logo {
        text-align: center;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #ffffff;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .logo-span {
        color: #38bdf8;
      }
      .subtitle {
        text-align: center;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #64748b;
        margin-bottom: 30px;
      }
      .section-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #38bdf8;
        border-bottom: 1px solid #334155;
        padding-bottom: 8px;
        margin-top: 0;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
      }
      .hero-grid {
        display: table;
        width: 100%;
        margin-bottom: 10px;
      }
      .hero-cell {
        display: table-cell;
        width: 50%;
        padding: 8px;
      }
      .stat-number {
        font-size: 26px;
        font-weight: 900;
        color: #10b981;
      }
      .stat-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #64748b;
        letter-spacing: 0.5px;
      }
      .subject-row {
        margin-bottom: 10px;
      }
      .subject-name {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
      }
      .subject-hours {
        float: right;
        font-size: 12px;
        font-weight: bold;
        color: #f1f5f9;
      }
      .clear {
        clear: both;
      }
      .bar-outer {
        background-color: #020617;
        height: 6px;
        border-radius: 3px;
        width: 100%;
        margin-top: 4px;
      }
      .bar-inner {
        height: 6px;
        border-radius: 3px;
        background-color: #3b82f6;
      }
      .counselor-box {
        background: rgba(59, 130, 246, 0.05);
        border-left: 4px solid #3b82f6;
        padding: 14px;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.5;
        color: #cbd5e1;
      }
      .flex-summary {
        font-size: 12px;
        margin-bottom: 8px;
      }
      .flex-summary-label {
        color: #64748b;
        font-weight: bold;
      }
      .flex-summary-val {
        color: #cbd5e1;
        font-weight: bold;
      }
      .footer {
        text-align: center;
        font-size: 10px;
        color: #475569;
        margin-top: 30px;
        border-t: 1px solid #1e293b;
        padding-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="logo">FuturePath<span class="logo-span">AI</span></div>
      <div class="subtitle">Guardian Progress & Performance Intelligence Report</div>

      <div class="section-card">
        <div class="section-title">📊 Report Metadata</div>
        <div class="hero-grid">
          <div class="hero-cell">
            <div class="stat-label">Student Name</div>
            <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 4px;">${studentName}</div>
          </div>
          <div class="hero-cell" style="text-align: right;">
            <div class="stat-label">Reporting Period</div>
            <div style="font-size: 16px; font-weight: bold; color: #38bdf8; margin-top: 4px;">${reportPeriod} Report</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">⏱️ Weekly Learning Intensity</div>
        <div class="stat-number">${totalStudyHours} Hours</div>
        <div class="stat-label">Total platform engagement recorded during current audit</div>
        
        <div style="margin-top: 20px;">
          <div class="stat-label" style="margin-bottom: 10px;">Platform Engagement by Subject:</div>
          ${Object.entries(timeSpentBySubject).map(([sub, hours]) => {
            const maxHrs = Math.max(...Object.values(timeSpentBySubject) as number[]);
            const percent = maxHrs > 0 ? ((hours as number) / maxHrs) * 100 : 0;
            return `
              <div class="subject-row">
                <span class="subject-name">${sub}</span>
                <span class="subject-hours">${hours} Hours</span>
                <div class="clear"></div>
                <div class="bar-outer">
                  <div class="bar-inner" style="width: ${percent}%;"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">🎓 Academic Performance Audit</div>
        <div class="flex-summary">
          <span class="flex-summary-label">Highest Performing Subject:</span>
          <span class="flex-summary-val" style="color: #10b981;"> ${academicSummary.highestSubject}</span>
        </div>
        <div class="flex-summary">
          <span class="flex-summary-label">Lowest Performing Subject:</span>
          <span class="flex-summary-val" style="color: #f43f5e;"> ${academicSummary.lowestSubject}</span>
        </div>
        <div class="flex-summary">
          <span class="flex-summary-label">Most Improved Subject:</span>
          <span class="flex-summary-val" style="color: #38bdf8;"> ${academicSummary.mostImprovedSubject}</span>
        </div>
        <div class="flex-summary" style="margin-bottom: 0;">
          <span class="flex-summary-label">Recommended Remedial Area:</span>
          <span class="flex-summary-val" style="color: #fbbf24;"> ${academicSummary.recommendedFocusArea}</span>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">🚀 Skill Development Index</div>
        ${Object.entries(skillGrowth).map(([skill, val]) => `
          <div class="subject-row">
            <span class="subject-name">${skill}</span>
            <span class="subject-hours" style="color: #38bdf8;">${val}%</span>
            <div class="clear"></div>
            <div class="bar-outer">
              <div class="bar-inner" style="width: ${val}%; background-color: #a855f7;"></div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="section-card">
        <div class="section-title">🤖 AI-Generated Progress Guidance</div>
        <div class="counselor-box">
          "${aiSummary}"
        </div>
      </div>

      <div class="footer">
        This automated bi-weekly monitoring audit was issued securely to ${guardianEmail} according to the verified settings in the FuturePath AI Student Portal.<br>
        © 2026 FuturePath AI Inc. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  // Dispatch Email
  try {
    let transporter;
    let isTestAccount = false;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log("Using custom SMTP credentials found in environmental configuration.");
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log("No custom SMTP credentials found. Initializing real-time Ethereal SMTP test account.");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isTestAccount = true;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"FuturePath AI Counseling" <noreply@futurepath-ai.edu>',
      to: guardianEmail,
      subject: `[Progress Intelligence] Dynamic Performance Summary: ${studentName}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Progress Report Email dispatched successfully! Message ID:", info.messageId);

    let previewUrl = "";
    if (isTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
      console.log("Ethereal testing preview URL:", previewUrl);
    }

    res.json({
      success: true,
      message: "Bi-Weekly Progress Report delivered successfully!",
      messageId: info.messageId,
      previewUrl: previewUrl,
      aiSummary: aiSummary
    });
  } catch (error: any) {
    console.error("Email dispatch failure:", error);
    res.status(500).json({
      success: false,
      error: "Failed to dispatch email. Please verify SMTP config. Fallback message: " + error.message,
      aiSummary: aiSummary
    });
  }
});

// Setup Vite & Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FuturePath AI Server live on http://localhost:${PORT}`);
  });
}

startServer();
