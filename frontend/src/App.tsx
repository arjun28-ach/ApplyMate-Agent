import { useState } from "react";

import { analyseApplication } from "./api/analyse";
import { ResultCard } from "./components/ResultCard";
import { UploadForm } from "./components/UploadForm";
import type { AnalyseResponse } from "./types";

export default function App() {
  const [result, setResult] = useState<AnalyseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyse(input: { cvFile: File; jobDescription: string }) {
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyseApplication(input);
      setResult(data);
    } catch (submissionError) {
      setResult(null);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to fetch analysis result."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <main className="grid gap-8">
          <UploadForm error={error} isLoading={isLoading} onSubmit={handleAnalyse} />

          {isLoading ? (
            <section className="glass-panel rounded-[32px] border border-white/70 p-8 shadow-halo">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-ink/10 border-t-moss" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate">
                    Working
                  </p>
                  <h2 className="font-display text-2xl text-ink">
                    ApplyMate is reading your CV and mapping it to the role.
                  </h2>
                </div>
              </div>
            </section>
          ) : null}

          {result ? <ResultCard result={result} /> : null}
        </main>
      </div>
    </div>
  );
}
