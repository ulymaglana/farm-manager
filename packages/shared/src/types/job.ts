export type JobStatus = "pending" | "processing" | "done" | "failed";

export interface Job {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobInput {
  type: string;
  payload?: Record<string, unknown>;
}
