export type AnalyseResponse = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  finalReport: string;
};
