import "dotenv/config";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ProjectsSchema, runApplyMateAgent } from "./graph/workflow.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resolveDataDir() {
  const candidateDirs = [
    path.resolve(__dirname, "data"),
    path.resolve(process.cwd(), "backend", "src", "data")
  ];
  const requiredFiles = ["job-description.txt", "cv.txt", "projects.json"];

  for (const dir of candidateDirs) {
    try {
      await Promise.all(requiredFiles.map((file) => access(path.join(dir, file))));
      return dir;
    } catch {
      // Try the next known location.
    }
  }

  throw new Error("Unable to locate CLI sample data in backend/src/data.");
}

async function loadInputFiles() {
  const dataDir = await resolveDataDir();

  const [jobDescription, cvText, projectsRaw] = await Promise.all([
    readFile(path.join(dataDir, "job-description.txt"), "utf8"),
    readFile(path.join(dataDir, "cv.txt"), "utf8"),
    readFile(path.join(dataDir, "projects.json"), "utf8")
  ]);

  return {
    jobDescription,
    cvText,
    projects: ProjectsSchema.parse(JSON.parse(projectsRaw))
  };
}

async function main() {
  const input = await loadInputFiles();
  const result = await runApplyMateAgent(input);
  console.log(result.finalReport);
}

main().catch((error) => {
  console.error("ApplyMate Agent failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
