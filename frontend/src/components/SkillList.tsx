type SkillListProps = {
  title: string;
  skills: string[];
  tone: "success" | "danger";
  emptyMessage?: string;
};

const toneClasses = {
  success: "border-moss/20 bg-moss/10 text-moss",
  danger: "border-ember/20 bg-ember/10 text-ember"
};

const iconClasses = {
  success: "bg-moss/12 text-moss",
  danger: "bg-ember/12 text-ember"
};

export function SkillList({ title, skills, tone, emptyMessage }: SkillListProps) {
  return (
    <section className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconClasses[tone]}`}>
          {tone === "success" ? "✓" : "!"}
        </div>
        <div>
          <h3 className="font-display text-xl text-ink">{title}</h3>
          <p className="text-sm text-slate">
            {skills.length} {skills.length === 1 ? "skill" : "skills"} highlighted
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${toneClasses[tone]}`}
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-ink/10 bg-ink/[0.03] px-4 py-4 text-sm leading-7 text-slate">
            {emptyMessage ?? "None highlighted yet."}
          </p>
        )}
      </div>
    </section>
  );
}
