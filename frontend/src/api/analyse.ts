import type { AnalyseResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json() as unknown;

    if (isObject(data) && typeof data.error === "string") {
      return data.error;
    }

    return JSON.stringify(data);
  }

  const text = await response.text();
  return text || `Request failed with status ${response.status}`;
}

export async function analyseApplication(input: {
  cvFile: File;
  jobDescription: string;
}): Promise<AnalyseResponse> {
  const formData = new FormData();
  formData.append("cv", input.cvFile);
  formData.append("jobDescription", input.jobDescription);

  try {
    const response = await fetch(`${API_URL}/api/analyse`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return await response.json() as AnalyseResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to fetch analysis result.");
  }
}
