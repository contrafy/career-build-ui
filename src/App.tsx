// src/App.tsx
import { useRef, useState } from "react";
import JobGrid from "./components/JobGrid";
import FiltersForm from "./components/FiltersForm";
import FileUpload from "./components/FileUpload";
import { fetchJobs } from "@/lib/api";
import type { JobListing } from "./components/JobCard";
import type { JobFilters } from "./components/FiltersForm";
import sampleJobs from "@/assets/example_responses/fetch_jobs.json";

// Define a type that represents the response from the resume parsing API
interface LLMGeneratedFilters {
  // both are returned as comma separated lists
  advanced_title_filter?: string;
  location_filter?: string;
}

import AuthContainer from "./components/AuthContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

const DEFAULT_FILTERS: JobFilters = {
  // ───── Shared
  title: "",
  advancedTitle: "",
  description: "",
  location: "",
  remote: null,
  roleType: "YC",
  limit: null,

  // ───── FT & Intern
  includeAI: false,
  aiWork: "",

  // ───── Internships
  agency: false,

  // ───── Full-time
  org: "",
  source: "",
  aiEmployment: "",
  aiHasSalary: null,
  aiExperience: "",
  aiVisa: null,
  includeLI: false,
  liOrg: "",
  liOrgExclude: "",
  liIndustry: "",
  liSpec: "",
  liOrgDesc: "",
};

function App() {
  // seed arrays pushed down to FiltersForm after résumé upload
  const [titleSeed, setTitleSeed] = useState<string[]>([]);
  const [locationSeed, setLocationSeed] = useState<string[]>([]);

  const [allJobs, setAllJobs] = useState<JobListing[]>(
    () => sampleJobs as unknown as JobListing[]   // lazy init, one‑time cast
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /** Called by FiltersForm when a search completes (or fails) */
  const handleSearchComplete = (jobs: JobListing[] | null, err?: string) => {
    if (err) {
      setError(err);
    } else if (jobs) {
      setAllJobs(jobs);
      setError(null);
    }
    setLoading(false);
  };

  /* Apply résumé‑based filters */
  const handleResumeDone = (payload: LLMGeneratedFilters) => {
    const titles =
      payload.advanced_title_filter?.split(/\s*,\s*/).filter(Boolean) ?? [];
    const locs =
      payload.location_filter?.split(/\s*,\s*/).filter(Boolean) ?? [];

    setTitleSeed(titles);
    setLocationSeed(locs);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <main className="mx-auto max-w-6xl p-6 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Career Builder</h1>
          <AuthContainer />
        </div>

        {/* Filters */}

        {/* Toolbar */}
        <FiltersForm
          baseFilters={DEFAULT_FILTERS}
          onSearchComplete={handleSearchComplete}
          initialTitleKeywords={titleSeed}
          initialLocationKeywords={locationSeed}
          setLoading={setLoading}
        />

        {/* Resume upload */}
        <div className="flex flex-wrap gap-6 justify-center">
          <FileUpload kind="resume" onParsed={handleResumeDone} />
          <FileUpload kind="cover-letter" />
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <JobGrid items={allJobs} />
      </main>
    </GoogleOAuthProvider>
  );
}

export default App;