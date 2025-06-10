// src/App.tsx
import { useRef, useState } from "react";
import JobGrid from "./components/JobGrid";
import FiltersForm from "./components/FiltersForm";
import FileUpload from "./components/FileUpload";
import { fetchJobs } from "@/lib/api";
import type { JobListing } from "./components/JobCard";
import type { JobFilters } from "./components/FiltersForm";
import { ModeToggle } from "./components/ModeToggle";

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
  roleType: "ADZUNA",
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

  // abort controller stored across calls so we can cancel previous fetch
  const abortRef = useRef<AbortController | null>(null);

  // Track filters for each job type separately to support role-type switching
  const [resumeFilters, setResumeFilters] = useState<{
    internships?: Record<string, any>;
    jobs?: Record<string, any>;
    yc_jobs?: Record<string, any>;
  }>({});

  /*──────── applyFilters: runs ONLY when user hits "Apply" ────────*/
  const applyFilters = (newFilters: JobFilters) => {
    // inject default limit based on roleType
    const filtersWithLimit: JobFilters = {
      ...newFilters,
      limit: newFilters.limit ??
             (newFilters.roleType === "FT" ? 30 :
             newFilters.roleType === "ADZUNA" ? 50 : 10),
    };

    // save latest filters for UI / future edits
    setFilters(filtersWithLimit);

    // cancel any inflight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        // use our filtersWithLimit here
        setAllJobs(await fetchJobs(filtersWithLimit, ctrl.signal));
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? "Network error");
      } finally {
        setLoading(false);
      }
    })();
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
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <AuthContainer />
          </div>
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