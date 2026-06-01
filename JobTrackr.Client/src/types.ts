export type JobStatus =
  | "Applied"
  | "InReview"
  | "Interview"
  | "TechnicalTest"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type AuthResponse = {
  token: string;
  email: string;
  fullName: string;
};

export type JobApplication = {
  id: string;
  companyName: string;
  position: string;
  jobUrl?: string | null;
  status: JobStatus;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  appliedDate: string;
  interviewDate?: string | null;
};

export type JobApplicationPayload = {
  companyName: string;
  position: string;
  jobUrl?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  interviewDate?: string | null;
};

export type JobApplicationUpdatePayload = Partial<JobApplicationPayload> & {
  status?: JobStatus;
};

export type Note = {
  id: string;
  jobApplicationId: string;
  content: string;
  noteType: string;
  createdAt: string;
  updatedAt?: string | null;
};

export type NotePayload = {
  content: string;
  noteType: string;
};
