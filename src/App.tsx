import { useEffect, useState } from "react";
import JobGrid from "./components/ui/JobGrid";
import FiltersForm from "./components/ui/FiltersForm";
import ResumeUpload from "./components/ui/ResumeUpload"

// import jobsData from "../example_responses/fetch_jobs.json";
// import ycData from "../example_responses/fetch_yc_jobs.json";
// import internData from "../example_responses/fetch_internships.json";

import { fetchAllJobs, fetchInternships }  from "@/lib/api";
import type { JobListing } from "./components/ui/JobCard";
import type { JobFilters } from "./components/ui/FiltersForm";


const DEFAULT_FILTERS: JobFilters = {
  title: "",
  description: "",
  location: "",
  remote: null,
  roleType: "ALL",
};

function App() {
  const [filters, setFilters] = useState<JobFilters | null>(null);
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pull real listings whenever user presses <Apply>
  useEffect(() => {
    if (!filters) return;             // ← guard the first mount
    if (filters.roleType !== "INTERN") {
      setAllJobs([]);
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        setAllJobs(await fetchInternships(filters));
      } catch (e: any) {
        setError(e.message ?? "Network error");
      } finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, [filters]);

  // Handle GPT-generated hints from ResumeUpload (optional, keep simple)
  const handleResumeDone = (payload: any) => {
    if (!payload?.jobs) return;
    const h = payload.jobs;
    setFilters(prev => {
      const base = prev ?? DEFAULT_FILTERS;   // ← fallback when prev === null
      return {
        ...base,
        title: base.title || h.title_filter || "",
        location: base.location || h.location_filter || "",
        remote:
          base.remote !== null
            ? base.remote
            : typeof h.remote === "boolean"
              ? h.remote
              : null,
      };
    });
  };

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Intelligent Job-Match</h1>

      {/* ➊ New toolbar */}
      <FiltersForm
        value={filters ?? DEFAULT_FILTERS}
        onSubmit={setFilters}   // lifts draft → filters state
      />

      {/* Resume (pdf) upload*/}
      <ResumeUpload onParsed={handleResumeDone} />

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* ➋ Existing results grid (shows all jobs) */}
      <JobGrid items={allJobs} />
    </main>
  );
}

export default App;
