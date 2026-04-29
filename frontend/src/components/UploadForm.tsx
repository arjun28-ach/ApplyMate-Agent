import { useState, type FormEvent } from "react";

type UploadFormProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (input: { cvFile: File; jobDescription: string }) => Promise<void>;
};

export function UploadForm({ isLoading, error, onSubmit }: UploadFormProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!cvFile) {
      setLocalError("Upload a CV in .txt or .pdf format.");
      return;
    }

    if (!jobDescription.trim()) {
      setLocalError("Paste a job description before running analysis.");
      return;
    }

    await onSubmit({
      cvFile,
      jobDescription: jobDescription.trim()
    });
  }

  return (
    <form
      className="glass-panel rounded-[32px] border border-white/70 p-8 shadow-halo"
      onSubmit={handleSubmit}
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">ApplyMate Agent</h1>
        <p className="mt-3 text-base leading-7 text-slate">
          AI-powered CV and job description matcher
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-3 block text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate lg:text-left">
            Upload CV
          </span>
          <div className="flex min-h-56 flex-col justify-center rounded-[28px] border border-dashed border-ink/20 bg-white/60 p-5 transition hover:border-moss/40 hover:bg-white/90">
            <input
              className="block w-full cursor-pointer text-sm text-slate file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-3 file:font-semibold file:text-mist hover:file:bg-moss"
              type="file"
              accept=".txt,.pdf,text/plain,application/pdf"
              onChange={(event) => {
                setLocalError(null);
                setCvFile(event.target.files?.[0] ?? null);
              }}
            />
            <p className="mt-3 text-sm text-slate">
              Supports plain text and PDF resumes up to 5MB.
            </p>
            {cvFile ? (
              <p className="mt-3 text-sm font-semibold text-ink">{cvFile.name}</p>
            ) : null}
          </div>
        </label>

        <label className="block">
          <span className="mb-3 block text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate lg:text-left">
            Paste Job Description
          </span>
          <textarea
            className="min-h-56 w-full rounded-[28px] border border-ink/10 bg-white/80 px-5 py-4 text-base leading-7 text-ink outline-none transition placeholder:text-slate/70 focus:border-moss/40 focus:ring-4 focus:ring-moss/10"
            placeholder="Paste the role requirements, team expectations, and must-have skills here..."
            value={jobDescription}
            onChange={(event) => {
              setLocalError(null);
              setJobDescription(event.target.value);
            }}
          />
        </label>
      </div>

      {(localError || error) ? (
        <div className="mt-6 rounded-[24px] border border-ember/20 bg-ember/10 px-4 py-3 text-sm font-medium text-ember">
          {localError || error}
        </div>
      ) : null}

      <div className="mt-8 flex justify-center">
        <button
          className="inline-flex min-w-56 items-center justify-center rounded-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-mist transition hover:-translate-y-0.5 hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Analysing..." : "Analyse"}
        </button>
      </div>
    </form>
  );
}
