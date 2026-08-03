export interface CareerProfile {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  summary?: string;
}

export interface CareerFact {
  category: string;
  key: string;
  value: string;
  details?: string;
  confidence: string;
  source: string;
  allowedInCv: boolean;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string;
  tools?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface JobRequirement {
  skill: string;
  level: "required" | "nice_to_have" | "preferred";
  yearsRequired?: number;
}

export interface JobPosting {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  requirements: string[];
  niceToHave: string[];
  summary: string;
}

export interface Question {
  text: string;
  context: string;
  factKey: string;
}

export interface MatchResult {
  overallScore: number;
  strengths: string[];
  gaps: string[];
  questions: Question[];
  recommendation:
    | "strong_match"
    | "good_match"
    | "possible"
    | "long_shot";
}

export interface ResumeSection {
  title: string;
  content: string;
}

export interface GeneratedResume {
  sections: ResumeSection[];
  factsUsed: string[];
}
