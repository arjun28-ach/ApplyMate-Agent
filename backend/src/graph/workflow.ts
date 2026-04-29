import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";

const ProjectSchema = z.object({
  name: z.string(),
  summary: z.string(),
  skills: z.array(z.string())
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectsSchema = z.array(ProjectSchema);

const AdviceLevelSchema = z.enum(["strong", "medium", "low"]);

const ApplicationState = Annotation.Root({
  jobDescription: Annotation<string>,
  cvText: Annotation<string>,
  projects: Annotation<Project[]>,
  extractedSkills: Annotation<string[]>,
  matchedSkills: Annotation<string[]>,
  missingSkills: Annotation<string[]>,
  matchScore: Annotation<number>,
  finalReport: Annotation<string>,
  candidateSkills: Annotation<string[]>,
  candidateStrengths: Annotation<string[]>,
  improvementAdvice: Annotation<string[]>,
  reportLevel: Annotation<z.infer<typeof AdviceLevelSchema>>
});

type ApplyMateState = typeof ApplicationState.State;
type ApplyMateUpdate = typeof ApplicationState.Update;

export type RunApplyMateAgentInput = {
  cvText: string;
  jobDescription: string;
  projects?: Project[];
};

export type RunApplyMateAgentResult = Pick<
  ApplyMateState,
  "extractedSkills" | "matchedSkills" | "missingSkills" | "matchScore" | "finalReport"
>;

const canonicalSkills = [
  "TypeScript",
  "JavaScript",
  "Node.js",
  "REST APIs",
  "API Integration",
  "LangChain",
  "LangGraph",
  "Prompt Engineering",
  "AI Applications",
  "PostgreSQL",
  "Data Modelling",
  "Docker",
  "CI/CD",
  "Cloud Deployment",
  "AWS",
  "Analytics",
  "Mentoring",
  "Stakeholder Collaboration",
  "Technical Communication"
] as const;

const skillMatchers: Record<(typeof canonicalSkills)[number], RegExp[]> = {
  TypeScript: [/\btypescript\b/i],
  JavaScript: [/\bjavascript\b/i],
  "Node.js": [/\bnode(?:\.js)?\b/i],
  "REST APIs": [/\brest api?s?\b/i, /\bapi\b/i],
  "API Integration": [/\bapi integration\b/i, /\bintegrat(?:e|ing|ion)s?\b/i],
  LangChain: [/\blangchain\b/i],
  LangGraph: [/\blanggraph\b/i],
  "Prompt Engineering": [/\bprompt engineering\b/i, /\bprompt patterns?\b/i],
  "AI Applications": [/\bai-powered\b/i, /\bai application\b/i, /\bai-assisted\b/i],
  PostgreSQL: [/\bpostgres(?:ql)?\b/i],
  "Data Modelling": [/\bdata modell?ing\b/i],
  Docker: [/\bdocker\b/i],
  "CI/CD": [/\bci\/cd\b/i, /\bcontinuous integration\b/i, /\bcontinuous delivery\b/i],
  "Cloud Deployment": [/\bcloud deployment\b/i, /\bdeployment\b/i],
  AWS: [/\baws\b/i],
  Analytics: [/\banalytics\b/i, /\bdashboard\b/i],
  Mentoring: [/\bmentor(?:ing)?\b/i, /\bjunior developers?\b/i],
  "Stakeholder Collaboration": [/\bstakeholder\b/i, /\bcollaboration\b/i],
  "Technical Communication": [/\bcommunication\b/i, /\btechnical writing\b/i]
};

function detectSkills(text: string): string[] {
  const found = canonicalSkills.filter((skill) =>
    skillMatchers[skill].some((pattern) => pattern.test(text))
  );

  return [...new Set(found)];
}

function titleCaseLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

const extractJobSkills = (state: ApplyMateState): ApplyMateUpdate => {
  const extractedSkills = detectSkills(state.jobDescription);
  return { extractedSkills };
};

const parseCandidateProfile = (state: ApplyMateState): ApplyMateUpdate => {
  const projectText = state.projects
    .map((project) => `${project.name}\n${project.summary}\n${project.skills.join(", ")}`)
    .join("\n\n");

  const candidateSkills = detectSkills(`${state.cvText}\n${projectText}`);

  const candidateStrengths = [
    state.cvText.includes("7+ years") ? "Seasoned engineering background" : "",
    candidateSkills.includes("TypeScript") && candidateSkills.includes("Node.js")
      ? "Strong backend TypeScript foundation"
      : "",
    state.projects.some((project) => project.skills.includes("LangGraph"))
      ? "Hands-on graph orchestration exposure"
      : "",
    candidateSkills.includes("Stakeholder Collaboration")
      ? "Cross-functional collaboration evidence"
      : ""
  ].filter(Boolean);

  return {
    candidateSkills,
    candidateStrengths
  };
};

const matchProfile = (state: ApplyMateState): ApplyMateUpdate => {
  const matchedSkills = state.extractedSkills.filter((skill) =>
    state.candidateSkills.includes(skill)
  );

  const missingSkills = state.extractedSkills.filter(
    (skill) => !state.candidateSkills.includes(skill)
  );

  const coverage = state.extractedSkills.length === 0
    ? 0
    : (matchedSkills.length / state.extractedSkills.length) * 100;

  const projectBonus = Math.min(
    10,
    state.projects.filter((project) =>
      project.skills.some((skill) => matchedSkills.includes(skill))
    ).length * 2
  );

  const communicationBonus = state.candidateSkills.includes("Technical Communication") ? 4 : 0;
  const matchScore = clampScore(coverage + projectBonus + communicationBonus);

  return {
    matchedSkills,
    missingSkills,
    matchScore
  };
};

const analyseGaps = (state: ApplyMateState): ApplyMateUpdate => {
  const improvementAdvice = state.missingSkills.length === 0
    ? [
        "Use quantified outcomes in the application to reinforce the fit.",
        "Lead with the most relevant TypeScript, Node.js, and delivery examples."
      ]
    : state.missingSkills.map((skill) => {
        switch (skill) {
          case "LangChain":
          case "LangGraph":
            return "Add a short case study that explains your AI workflow or orchestration experiments.";
          case "Prompt Engineering":
          case "AI Applications":
            return "Include a concise example of how you designed prompts, evaluation loops, or AI-assisted features.";
          case "Cloud Deployment":
          case "Docker":
          case "CI/CD":
            return "Highlight one production delivery example that covers deployment, release flow, and operational ownership.";
          case "PostgreSQL":
          case "Data Modelling":
            return "Mention a project where you designed schemas, queries, or data structures to support product features.";
          case "Mentoring":
            return "Add one sentence about coaching, onboarding, or review support for teammates.";
          default:
            return `Strengthen evidence for ${titleCaseLabel(skill)} with one concrete outcome-focused example.`;
        }
      });

  return { improvementAdvice };
};

const generateApplicationAdvice = (state: ApplyMateState): ApplyMateUpdate => {
  const reportLevel = state.matchScore >= 75 ? "strong" : state.matchScore >= 50 ? "medium" : "low";
  return { reportLevel };
};

function buildReport(state: ApplyMateState, heading: string, summary: string, nextSteps: string[]): string {
  const projectHighlights = state.projects
    .filter((project) => project.skills.some((skill) => state.matchedSkills.includes(skill)))
    .slice(0, 3)
    .map((project) => `- **${project.name}**: ${project.summary}`)
    .join("\n");

  const adviceList = state.improvementAdvice.map((item) => `- ${item}`).join("\n");
  const nextStepList = nextSteps.map((item) => `- ${item}`).join("\n");

  return [
    "# ApplyMate Agent Report",
    "",
    "## Match Outcome",
    `- **Level:** ${heading}`,
    `- **Match Score:** ${state.matchScore}/100`,
    `- **Summary:** ${summary}`,
    "",
    "## Skills Snapshot",
    `- **Extracted job skills:** ${state.extractedSkills.join(", ") || "None detected"}`,
    `- **Matched skills:** ${state.matchedSkills.join(", ") || "None matched"}`,
    `- **Missing skills:** ${state.missingSkills.join(", ") || "No major gaps"}`,
    "",
    "## Candidate Strengths",
    ...(state.candidateStrengths.length > 0
      ? state.candidateStrengths.map((item) => `- ${item}`)
      : ["- The profile is valid, but strengths were not strongly signalled in the sample input."]),
    "",
    "## Project Evidence",
    projectHighlights || "- No highly aligned project evidence was detected.",
    "",
    "## Application Advice",
    adviceList,
    "",
    "## Next Steps",
    nextStepList
  ].join("\n");
}

const buildStrongMatchReport = (state: ApplyMateState): ApplyMateUpdate => {
  return {
    finalReport: buildReport(
      state,
      "Strong Match",
      "The candidate covers most of the required skills and has credible supporting project evidence.",
      [
        "Open the application with direct alignment to the role's TypeScript, Node.js, and workflow tooling needs.",
        "Use two quantified project bullets to show implementation impact.",
        "Keep the cover note focused on immediate value rather than broad background."
      ]
    )
  };
};

const buildMediumMatchReport = (state: ApplyMateState): ApplyMateUpdate => {
  return {
    finalReport: buildReport(
      state,
      "Medium Match",
      "The candidate is directionally aligned but should strengthen missing or weakly evidenced areas before applying.",
      [
        "Tune the CV summary so it mirrors the most relevant skills from the job description.",
        "Add one project bullet that fills the highest-priority missing requirement.",
        "Use the cover note to address how adjacent experience transfers into the role."
      ]
    )
  };
};

const buildLowMatchReport = (state: ApplyMateState): ApplyMateUpdate => {
  return {
    finalReport: buildReport(
      state,
      "Low Match",
      "There are several gaps between the role requirements and the candidate profile, so the best move is a targeted gap-closing plan.",
      [
        "Prioritise learning or demonstrating the top missing skills before applying broadly to similar roles.",
        "Create or expand one portfolio project that directly maps to the missing requirements.",
        "Reassess the role after updating the CV with fresher, more relevant evidence."
      ]
    )
  };
};

function routeByScore(
  state: ApplyMateState
): "buildStrongMatchReport" | "buildMediumMatchReport" | "buildLowMatchReport" {
  if (state.matchScore >= 75) {
    return "buildStrongMatchReport";
  }

  if (state.matchScore >= 50) {
    return "buildMediumMatchReport";
  }

  return "buildLowMatchReport";
}

export const applyMateGraph = new StateGraph(ApplicationState)
  .addNode("extractJobSkills", extractJobSkills)
  .addNode("parseCandidateProfile", parseCandidateProfile)
  .addNode("matchProfile", matchProfile)
  .addNode("analyseGaps", analyseGaps)
  .addNode("generateApplicationAdvice", generateApplicationAdvice)
  .addNode("buildStrongMatchReport", buildStrongMatchReport)
  .addNode("buildMediumMatchReport", buildMediumMatchReport)
  .addNode("buildLowMatchReport", buildLowMatchReport)
  .addEdge(START, "extractJobSkills")
  .addEdge("extractJobSkills", "parseCandidateProfile")
  .addEdge("parseCandidateProfile", "matchProfile")
  .addEdge("matchProfile", "analyseGaps")
  .addEdge("analyseGaps", "generateApplicationAdvice")
  .addConditionalEdges("generateApplicationAdvice", routeByScore)
  .addEdge("buildStrongMatchReport", END)
  .addEdge("buildMediumMatchReport", END)
  .addEdge("buildLowMatchReport", END)
  .compile();

export async function runApplyMateAgent(
  input: RunApplyMateAgentInput
): Promise<RunApplyMateAgentResult> {
  const state = await applyMateGraph.invoke({
    jobDescription: input.jobDescription.trim(),
    cvText: input.cvText.trim(),
    projects: ProjectsSchema.parse(input.projects ?? []),
    extractedSkills: [],
    matchedSkills: [],
    missingSkills: [],
    matchScore: 0,
    finalReport: "",
    candidateSkills: [],
    candidateStrengths: [],
    improvementAdvice: [],
    reportLevel: "low"
  });

  return {
    extractedSkills: state.extractedSkills,
    matchedSkills: state.matchedSkills,
    missingSkills: state.missingSkills,
    matchScore: state.matchScore,
    finalReport: state.finalReport
  };
}
