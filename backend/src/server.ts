import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "node:url";

import { runApplyMateAgent } from "./graph/workflow.js";
import { parseUploadedFile } from "./services/fileParser.js";

const currentModulePath = fileURLToPath(import.meta.url);
const entryModulePath = process.argv[1];

export const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.post("/api/analyse", upload.single("cv"), async (req, res) => {
  try {
    console.log("Analyse route called");

    const cvFile = req.file;
    const jobDescription = typeof req.body.jobDescription === "string"
      ? req.body.jobDescription.trim()
      : "";

    console.log("uploaded file name", cvFile?.originalname ?? "none");
    console.log("jobDescription length", jobDescription.length);

    if (!cvFile) {
      return res.status(400).json({ error: "Missing CV file. Use multipart field 'cv'." });
    }

    if (!jobDescription) {
      return res.status(400).json({ error: "Missing job description text field." });
    }

    const cvText = await parseUploadedFile(cvFile);

    const result = await runApplyMateAgent({
      cvText,
      jobDescription
    });

    return res.json({
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      finalReport: result.finalReport
    });
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes("Unsupported CV format")
      || error.message.includes("uploaded .txt file is empty")
      || error.message.includes("uploaded .pdf file did not contain extractable text")
      || error.message.includes("Failed to parse the uploaded PDF file")
    )) {
      return res.status(400).json({ error: error.message });
    }

    console.error("ApplyMate API failed.");
    console.error(error instanceof Error ? error.message : error);

    return res.status(500).json({
      error: "Internal server error."
    });
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "CV file is too large. Maximum allowed size is 5MB."
    });
  }

  console.error("ApplyMate API middleware failed.");
  console.error(error instanceof Error ? error.message : error);

  return res.status(500).json({
    error: "Internal server error."
  });
});

export function startServer(port = Number(process.env.PORT ?? 4000)) {
  return app.listen(port, () => {
    console.log(`ApplyMate Express server listening on port ${port}`);
  });
}

if (entryModulePath && currentModulePath === entryModulePath) {
  startServer();
}
