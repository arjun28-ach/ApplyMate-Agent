import type { AnalyseResponse } from "../types";
import { TechnicalAnalysis } from "./TechnicalAnalysis";
import { downloadPdfReport } from "../utils/downloadPdf";
import { ScoreBadge } from "./ScoreBadge";
import { SkillList } from "./SkillList";

type ResultCardProps = {
  result: AnalyseResponse;
};

function buildSuggestedCvBullets(result: AnalyseResponse): string[] {
  const bullets: string[] = [];

  if (result.matchedSkills.includes("LangGraph")) {
    bullets.push("Built a LangGraph-based application assistant that matched CVs against role requirements and generated structured fit reports.");
  }

  if (result.matchedSkills.includes("API Integration") || result.matchedSkills.includes("REST APIs")) {
    bullets.push("Designed API-driven workflows that connected user input, backend services, and structured recommendation outputs.");
  }

  if (result.matchedSkills.includes("TypeScript") || result.matchedSkills.includes("Node.js")) {
    bullets.push("Delivered production-ready TypeScript backend features with clear request handling, validation, and reusable service boundaries.");
  }

  if (result.missingSkills.includes("LangGraph")) {
    bullets.push("Designed conditional agent routing patterns and stateful workflow orchestration for AI-assisted application tooling.");
  }

  return bullets.slice(0, 3).length > 0
    ? bullets.slice(0, 3)
    : [
        "Built a tailored application-matching workflow that converted resume input into role-fit insights.",
        "Translated hiring requirements into concrete, outcome-focused CV positioning for better application relevance."
      ];
}

function buildCoverLetterAngle(result: AnalyseResponse): string {
  const strongestSkills = result.matchedSkills.slice(0, 3).join(", ");
  const missingFocus = result.missingSkills[0];

  if (strongestSkills && missingFocus) {
    return `I am particularly interested in this role because it aligns strongly with my experience in ${strongestSkills}, while also giving me the opportunity to deepen my impact in ${missingFocus} within a production setting.`;
  }

  if (strongestSkills) {
    return `I am particularly interested in this role because it closely matches my background in ${strongestSkills}, and I can contribute value quickly from day one.`;
  }

  return "I am particularly interested in this role because it combines product impact, technical ownership, and the opportunity to contribute to thoughtful AI-powered tooling.";
}

function getMatchLevel(score: number): {
  label: "Strong Match" | "Medium Match" | "Low Match";
  badgeClass: string;
  panelClass: string;
  summary: string;
} {
  if (score >= 75) {
    return {
      label: "Strong Match",
      badgeClass: "border-moss/20 bg-moss/12 text-moss",
      panelClass: "from-moss/10 to-white",
      summary: "Strong alignment across the most important requirements with clear signals for recruiter-facing positioning."
    };
  }

  if (score >= 50) {
    return {
      label: "Medium Match",
      badgeClass: "border-gold/25 bg-gold/15 text-amber-700",
      panelClass: "from-gold/12 to-white",
      summary: "Good directional fit with a few gaps that can be addressed through stronger framing and sharper evidence."
    };
  }

  return {
    label: "Low Match",
    badgeClass: "border-ember/20 bg-ember/12 text-ember",
    panelClass: "from-ember/10 to-white",
    summary: "Limited overlap so far. The best next step is to refine the CV around adjacent strengths and close the top gaps."
  };
}

export function ResultCard({ result }: ResultCardProps) {
  const suggestedCvBullets = buildSuggestedCvBullets(result);
  const coverLetterAngle = buildCoverLetterAngle(result);
  const matchLevel = getMatchLevel(result.matchScore);

  function handleDownloadReport() {
    downloadPdfReport({
      result,
      matchLevel: matchLevel.label,
      suggestedCvBullets,
      coverLetterAngle
    });
  }

  return (
    <section className="glass-panel rounded-[32px] border border-white/70 p-6 shadow-halo sm:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-slate">
            Analysis Result
          </p>
          <h2 className="font-display text-3xl text-ink md:text-4xl">Recruiter-ready fit snapshot</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate">
            A cleaner view of role alignment, missing signals, and the strongest talking points to carry into your CV and cover letter.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:-translate-y-0.5 hover:border-moss/30 hover:text-moss"
          onClick={handleDownloadReport}
          type="button"
        >
          Download PDF Report
        </button>
      </div>

      <div className={`mb-6 grid gap-6 rounded-[28px] border border-ink/10 bg-gradient-to-br ${matchLevel.panelClass} p-6 lg:grid-cols-[auto_1fr] lg:items-center`}>
        <div className="flex justify-center lg:justify-start">
          <ScoreBadge score={result.matchScore} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${matchLevel.badgeClass}`}>
              {matchLevel.label}
            </span>
            <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate">
              Match Score: {result.matchScore}%
            </span>
          </div>

          <h3 className="font-display text-2xl text-ink">Application fit overview</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate">
            {matchLevel.summary}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate">
              <span>Alignment</span>
              <span>{result.matchScore}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/80">
              <div
                className={`h-full rounded-full ${
                  result.matchScore >= 75 ? "bg-moss" : result.matchScore >= 50 ? "bg-gold" : "bg-ember"
                }`}
                style={{ width: `${Math.max(6, result.matchScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SkillList
          emptyMessage="No matched skills detected yet. Try uploading a more detailed CV."
          title="Matched Skills"
          skills={result.matchedSkills}
          tone="success"
        />
        <SkillList title="Missing Skills" skills={result.missingSkills} tone="danger" />
      </div>

      <section className="mt-6 rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-moss/12 text-moss">
            ✓
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">Suggested CV Bullets</h3>
            <p className="text-sm text-slate">Use these as sharper, recruiter-friendly evidence points.</p>
          </div>
        </div>
        <ul className="space-y-3 text-sm leading-7 text-slate">
          {suggestedCvBullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-3 rounded-2xl border border-ink/8 bg-white/95 px-4 py-4 shadow-sm"
            >
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-moss/12 text-xs font-bold text-moss">
                ✓
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-[28px] border border-gold/20 bg-gold/10 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-amber-700">
            ✦
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">Cover Letter Angle</h3>
            <p className="text-sm text-slate">A concise narrative direction for the application message.</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate">{coverLetterAngle}</p>
      </section>

      <details className="mt-6 rounded-[28px] border border-ink/10 bg-white/75 p-6 shadow-sm">
        <summary className="cursor-pointer list-none font-display text-xl text-ink">
          <div className="flex items-center justify-between gap-4">
            <span>View full technical analysis</span>
            <span className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate">
              Structured View
            </span>
          </div>
        </summary>
        <div className="mt-5">
          <TechnicalAnalysis report={result.finalReport} />
        </div>
      </details>
    </section>
  );
}
