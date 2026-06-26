import { apiUrl } from "./apiBase";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class GroqService {
  /**
   * General text chat with the AI counselor
   */
  static async chat(messages: ChatMessage[]): Promise<{ reply: string; model: string }> {
    try {
      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        reply: data.reply,
        model: data.model || "ai-service"
      };
    } catch (e: any) {
      console.error("AI chat client error:", e);
      return {
        reply: "Apologies, your career advisor terminal experienced a connection glitch. Let's try querying our local backup matrices. What would you like to plan today?",
        model: "offline-error-handler"
      };
    }
  }

  /**
   * Stream Selection advice generator
   */
  static async getStreamSelectionAdvice(
    selectedClass: string,
    subjects: string[],
    interests: string[],
    skills: string[]
  ): Promise<{ reply: string; model: string }> {
    const prompt = `Class: ${selectedClass}
Favorite Subjects: ${subjects.join(", ")}
Interests: ${interests.join(", ")}
Skills: ${skills.join(", ")}

Provide detailed analysis for Stream Selection (Science vs Commerce vs Humanities vs Vocational). Outline potential subjects, high-demand career targets, and immediate skill builder objectives.`;

    const messages = [
      { role: "system" as const, content: "You are the FuturePath AI Stream Selection Advisor, selecting optimal tracks (Science, Commerce, Humanities, or Vocational) for secondary students." },
      { role: "user" as const, content: prompt }
    ];

    return this.chat(messages);
  }

  /**
   * Sports Career Roadmap advisor
   */
  static async getSportsCareerGuidance(
    sport: string,
    medals: string,
    ranking: string,
    currentAgeGroup: string
  ): Promise<{ reply: string; model: string }> {
    const prompt = `Sport Sector: ${sport}
Total Medals/Achievements: ${medals}
State/National Level Ranking: ${ranking}
Age bracket: ${currentAgeGroup}

Develop a professional athlete and sports manager pathway. Outline dual-career options (how to balance sports with academic degrees), collegiate training clubs, eligibility steps, and corporate pathways.`;

    const messages = [
      { role: "system" as const, content: "You are the FuturePath AI Sports Corridor Director. Help student-athletes construct double-achievement profiles (Sports excellence + Academic backup)." },
      { role: "user" as const, content: prompt }
    ];

    return this.chat(messages);
  }

  /**
   * College Alignment recommendations
   */
  static async getCollegeAlignmentGuidance(
    fieldOfInterest: string,
    academicPercentage: string,
    examScores: string,
    locationPreference: string
  ): Promise<{ reply: string; model: string }> {
    const prompt = `Academic Fields: ${fieldOfInterest}
Average Grade Percentages: ${academicPercentage}%
Entrance Exam Scores: ${examScores}
Target Territory: ${locationPreference}

Formulate an application portfolio. Present the top 3 match colleges, eligibility criteria, admission routes, scholarship options, and specific course strategies.`;

    const messages = [
      { role: "system" as const, content: "You are the FuturePath College Counselor, advising students on higher education admissions, exam cut-offs, and scholarship criteria." },
      { role: "user" as const, content: prompt }
    ];

    return this.chat(messages);
  }
}
