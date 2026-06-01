import type {
  AuthResponse,
  JobApplication,
  JobApplicationPayload,
  JobApplicationUpdatePayload,
  Note,
  NotePayload
} from "./types";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const API_BASE_URL = configuredBaseUrl ?? "";
const statusValues = [
  "Applied",
  "InReview",
  "Interview",
  "TechnicalTest",
  "Offer",
  "Rejected",
  "Withdrawn"
] as const;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.title ?? payload?.message ?? "Istek tamamlanamadi.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const api = {
  register: (payload: { fullName: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: payload
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload
    }),
  getApplications: (token: string) =>
    request<JobApplication[]>("/api/jobapplications", { token }),
  createApplication: (token: string, payload: JobApplicationPayload) =>
    request<JobApplication>("/api/jobapplications", {
      method: "POST",
      token,
      body: payload
    }),
  updateApplication: (
    token: string,
    id: string,
    payload: JobApplicationUpdatePayload
  ) => {
    const body = {
      ...payload,
      status:
        payload.status === undefined
          ? undefined
          : statusValues.indexOf(payload.status)
    };

    return request<JobApplication>(`/api/jobapplications/${id}`, {
      method: "PUT",
      token,
      body
    });
  },
  deleteApplication: (token: string, id: string) =>
    request<void>(`/api/jobapplications/${id}`, {
      method: "DELETE",
      token
    }),
  getNotes: (token: string, jobApplicationId: string) =>
    request<Note[]>(`/api/jobapplications/${jobApplicationId}/notes`, { token }),
  createNote: (token: string, jobApplicationId: string, payload: NotePayload) =>
    request<Note>(`/api/jobapplications/${jobApplicationId}/notes`, {
      method: "POST",
      token,
      body: payload
    }),
  updateNote: (
    token: string,
    jobApplicationId: string,
    noteId: string,
    payload: Partial<NotePayload>
  ) =>
    request<Note>(`/api/jobapplications/${jobApplicationId}/notes/${noteId}`, {
      method: "PUT",
      token,
      body: payload
    }),
  deleteNote: (token: string, jobApplicationId: string, noteId: string) =>
    request<void>(`/api/jobapplications/${jobApplicationId}/notes/${noteId}`, {
      method: "DELETE",
      token
    })
};
