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
  internships?: Record<string, any>;
  jobs?: Record<string, any>;
  yc_jobs?: Record<string, any>;
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
  const [filters, setFilters] = useState<JobFilters | null>(null);
  const [allJobs, setAllJobs] = useState<JobListing[]>(
    () => sampleJobs as unknown as JobListing[]   // lazy init, one‑time cast
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resumeId, setResumeId] = useState<string | null>(null);
  
  // abort controller stored across calls so we can cancel previous fetch
  const abortRef = useRef<AbortController | null>(null);
  
  // Track filters for each job type separately to support role-type switching
  const [resumeFilters, setResumeFilters] = useState<{
    internships?: Record<string, any>;
    jobs?: Record<string, any>;
    yc_jobs?: Record<string, any>;
  }>({});
 
  /*──────── applyFilters: runs ONLY when user hits "Apply" ────────*/
  const applyFilters = (draft: JobFilters) => {
    // inject default limit based on roleType
    const filtersWithLimit: JobFilters = {
    ...draft,
    limit: draft.limit ?? (draft.roleType === "FT" ? 30 : 10),
    resumeId,
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

  /* Apply resume-based filters to the current form */
  const handleResumeDone = (payload: LLMGeneratedFilters & { resume_id?: string }) => {
    console.log("Resume analyzed successfully:", payload);
    if (payload.resume_id) setResumeId(payload.resume_id);

    // Store all filter sets for future role type switching
    setResumeFilters(payload);

    // Select appropriate filters based on current roleType
    let activeFilters: Record<string, any> | undefined;
    const currentRoleType = filters?.roleType || DEFAULT_FILTERS.roleType;

    if (currentRoleType === "INTERN" && payload.internships) {
      activeFilters = payload.internships;
    } else if (currentRoleType === "YC" && payload.yc_jobs) {
      activeFilters = payload.yc_jobs;
    } else if ((currentRoleType === "FT") && payload.jobs) {
      activeFilters = payload.jobs;
    } else if (payload.jobs) {
      // Default to regular jobs if we can't match
      activeFilters = payload.jobs;
      console.log("Using jobs filters as fallback");
    }

    if (activeFilters) {
      // Map backend filter names to our frontend form fields
      const newFilters: JobFilters = { ...filters || DEFAULT_FILTERS };
      // inject default limit here too
      newFilters.limit = newFilters.limit ?? (newFilters.roleType === "FT" ? 30 : 10);

      // Apply mappings for fields we know exist in our form
      if (activeFilters.title_filter) {
        newFilters.title = activeFilters.title_filter;
      }

      if (activeFilters.advanced_title_filter) {
        newFilters.advancedTitle = activeFilters.advanced_title_filter;
      }

      if (activeFilters.description_filter) {
        newFilters.description = activeFilters.description_filter;
      }

      if (activeFilters.location_filter) {
        newFilters.location = activeFilters.location_filter;
      }

      if (activeFilters.remote !== undefined) {
        newFilters.remote = activeFilters.remote;
      }

      // Log any filters that were ignored (for future implementation)
      const mappedFields = ['title_filter', 'advanced_title_filter', 'description_filter', 'location_filter', 'remote'];
      Object.keys(activeFilters).forEach(key => {
        if (!mappedFields.includes(key) && activeFilters[key] !== undefined) {
          console.log(`Ignored filter '${key}' with value:`, activeFilters[key]);
        }
      });

      // Apply the new filters
      setFilters(newFilters);
    }
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
        <FiltersForm value={filters ?? DEFAULT_FILTERS} onSubmit={applyFilters} />

        {/* Resume upload */}
        <div className="flex flex-wrap gap-6 justify-center">
          <FileUpload
            kind="resume"
            onParsed={handleResumeDone}
            onFile={() => {}}
          />
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