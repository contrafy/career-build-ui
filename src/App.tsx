import { useEffect, useState } from "react";
import JobGrid from "./components/ui/JobGrid";
import FiltersForm from "./components/ui/FiltersForm";
import ResumeUpload from "./components/ui/ResumeUpload"

// import jobsData from "../example_responses/fetch_jobs.json";
// import ycData from "../example_responses/fetch_yc_jobs.json";
// import internData from "../example_responses/fetch_internships.json";

import { fetchJobs }  from "@/lib/api";
import type { JobListing } from "./components/ui/JobCard";
import type { JobFilters } from "./components/ui/FiltersForm";

import AuthContainer from "./components/ui/AuthContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

const DEFAULT_FILTERS: JobFilters = {
  title: "",
  description: "",
  location: "",
  remote: null,
  roleType: "ALL",
  limit: null,
};

function App() {
  const [filters, setFilters] = useState<JobFilters | null>(null);
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /* fetch whenever filters change */
  useEffect(() => {
    if (!filters) return;                 // first mount
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        setAllJobs(await fetchJobs(filters, ctrl.signal));
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? "Network error");
      } finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, [filters]);

  /* Merge GPT-generated hints */
  const handleResumeDone = (payload: any) => { /* … unchanged … */ };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <main className="mx-auto max-w-6xl p-6 space-y-10">
        {/* Google account button (top‑right) */}
        <AuthContainer />

        <h1 className="text-3xl font-bold tracking-tight">
          Intelligent Job‑Match
        </h1>

        {/* Toolbar */}
        <FiltersForm
          value={filters ?? DEFAULT_FILTERS}
          onSubmit={setFilters}   // lifts draft → filters state
        />

        {/* Resume (pdf) upload*/}
        <ResumeUpload onParsed={handleResumeDone} />

        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Results grid (shows all jobs) */}
        <JobGrid items={allJobs} />
      </main>
    </GoogleOAuthProvider>
  );
}

export default App;
