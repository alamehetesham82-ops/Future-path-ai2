export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profilePhoto: string;
  class: string;
  school: string;
  state: string;
  interests: string[];
  skills: string[];
  careerGoals: string;
  role: "student" | "parent" | "admin";
  createdAt: string;
  premiumUnlocked?: boolean;
  purchaseDate?: string | null;
  amountPaid?: number;
}

export type CertificateCategory = 
  | "Academic" 
  | "Sports" 
  | "Cultural" 
  | "Olympiads" 
  | "Competitions" 
  | "Skill Courses";

export interface CertificateDoc {
  id: string;
  uid: string;
  fileName: string;
  category: CertificateCategory;
  fileUrl: string;
  uploadedAt: string;
  verified?: boolean;
}

export type ResultType = 
  | "Report Cards"
  | "Board Results"
  | "Entrance Scores"
  | "Semester Results";

export interface ResultDoc {
  id: string;
  uid: string;
  fileName: string;
  type: ResultType;
  fileUrl: string;
  scoreInfo?: string;
  uploadedAt: string;
}

export interface ScholarshipDoc {
  id: string;
  title: string;
  eligibility: string;
  amount: string;
  deadline: string;
  category: string;
  applicationLink: string;
}

export interface CollegeDoc {
  id: string;
  name: string;
  courses: string[];
  eligibility: string;
  fees: string;
  placement: string;
  location: string;
  rating?: number;
}

export interface CareerDoc {
  id: string;
  title: string;
  salary: string;
  skills: string[];
  demand: "High" | "Medium" | "Low";
  description: string;
}

export interface SportsMilestone {
  sportName: string;
  achievements: string;
  medalsCount: number;
  nationalRank?: string;
}
