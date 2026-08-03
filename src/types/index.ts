export type Profile = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  createdAt: Date;
};

export type MatchResult = {
  id: string;
  profileId: string;
  jobId: string;
  score: number;
  analysis: string;
};

export type Resume = {
  id: string;
  profileId: string;
  jobId?: string;
  content: string;
  createdAt: Date;
};
