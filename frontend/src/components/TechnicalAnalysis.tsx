type TechnicalSection = {
  title: string;
  items: string[];
};

type TechnicalAnalysisProps = {
  report: string;
};

function cleanMarkdownLine(line: string): string {
  return line
    .replace(/^\s*-\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function parseTechnicalAnalysis(report: string): TechnicalSection[] {
  const wantedSections = new Set([
    "Match Outcome",
    "Skills Snapshot",
    "Candidate Strengths",
    "Project Evidence",
    "Application Advice",
    "Next Steps"
  ]);

  const lines = report.split("\n");
  const sections: TechnicalSection[] = [];
  let currentSection: TechnicalSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("## ")) {
      const title = line.replace("## ", "").trim();

      if (wantedSections.has(title)) {
        currentSection = { title, items: [] };
        sections.push(currentSection);
      } else {
        currentSection = null;
      }

      continue;
    }

    if (!currentSection || line.startsWith("# ")) {
      continue;
    }

    currentSection.items.push(cleanMarkdownLine(line));
  }

  return sections.filter((section) => section.items.length > 0);
}

const iconMap: Record<string, string> = {
  "Match Outcome": "◎",
  "Skills Snapshot": "◌",
  "Candidate Strengths": "↑",
  "Project Evidence": "▣",
  "Application Advice": "✦",
  "Next Steps": "→"
};

function AnalysisCard({ section }: { section: TechnicalSection }) {
  return (
    <section className="rounded-[24px] border border-ink/10 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink/5 text-sm font-bold text-ink">
          {iconMap[section.title] ?? "•"}
        </div>
        <div>
          <h4 className="font-display text-xl text-ink">{section.title}</h4>
          <p className="text-sm text-slate">{section.items.length} insight{section.items.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="space-y-3">
        {section.items.map((item) => (
          <div key={item} className="rounded-2xl border border-ink/8 bg-ink/[0.025] px-4 py-3 text-sm leading-7 text-slate">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TechnicalAnalysis({ report }: TechnicalAnalysisProps) {
  const sections = parseTechnicalAnalysis(report);

  if (sections.length === 0) {
    return (
      <section className="rounded-[24px] border border-ink/10 bg-white/90 p-5 shadow-sm">
        <h4 className="mb-4 font-display text-xl text-ink">Technical Analysis</h4>
        <div className="rounded-2xl border border-ink/8 bg-ink/[0.025] px-4 py-4 text-sm leading-7 text-slate">
          {report
            .replace(/^#+\s*/gm, "")
            .replace(/\*\*/g, "")
            .trim()}
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map((section) => (
        <AnalysisCard key={section.title} section={section} />
      ))}
    </div>
  );
}

export { parseTechnicalAnalysis, type TechnicalSection };
