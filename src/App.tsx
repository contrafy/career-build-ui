// src/App.tsx
import { useEffect, useState } from "react";
import JobGrid from "./components/ui/JobGrid";
import FiltersForm from "./components/ui/FiltersForm";
import ResumeUpload from "./components/ui/ResumeUpload";
import { fetchJobs } from "@/lib/api";
import type { JobListing } from "./components/ui/JobCard";
import type { JobFilters } from "./components/ui/FiltersForm";
import sampleJobs from "@/assets/example_responses/fetch_jobs.json";

// Define a type that represents the response from the resume parsing API
interface LLMGeneratedFilters {
  internships?: Record<string, any>;
  jobs?: Record<string, any>;
  yc_jobs?: Record<string, any>;
}

import AuthContainer from "./components/ui/AuthContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

const DEFAULT_FILTERS: JobFilters = {
  // ───── Shared
  title: "",
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
  
  // Track filters for each job type separately to support role-type switching
  const [resumeFilters, setResumeFilters] = useState<{
    internships?: Record<string, any>;
    jobs?: Record<string, any>;
    yc_jobs?: Record<string, any>;
  }>({});
 
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

  /* Apply resume-based filters to the current form */
  const handleResumeDone = (payload: LLMGeneratedFilters) => {
    console.log("Resume analyzed successfully:", payload);
    
    // Store all filter sets for future role type switching
    setResumeFilters(payload);
    
    // Select appropriate filters based on current roleType
    let activeFilters: Record<string, any> | undefined;
    const currentRoleType = filters?.roleType || DEFAULT_FILTERS.roleType;
    
    if (currentRoleType === "INTERN" && payload.internships) {
      activeFilters = payload.internships;
    } else if (currentRoleType === "YC" && payload.yc_jobs) {
      activeFilters = payload.yc_jobs;
    } else if ((currentRoleType === "FT" || currentRoleType === "ALL") && payload.jobs) {
      activeFilters = payload.jobs;
    } else if (payload.jobs) {
      // Default to regular jobs if we can't match
      activeFilters = payload.jobs;
      console.log("Using jobs filters as fallback");
    }
    
    if (activeFilters) {
      // Map backend filter names to our frontend form fields
      const newFilters: JobFilters = { ...filters || DEFAULT_FILTERS };
      
      // Apply mappings for fields we know exist in our form
      if (activeFilters.title_filter) {
        newFilters.title = activeFilters.title_filter;
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
      
      if (activeFilters.limit && typeof activeFilters.limit === 'number') {
        newFilters.limit = activeFilters.limit;
      }
      
      // Log any filters that were ignored (for future implementation)
      const mappedFields = ['title_filter', 'description_filter', 'location_filter', 'remote', 'limit'];
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
        {/* Google account button (top‑right) */}
        <AuthContainer />

        <h1 className="text-3xl font-bold tracking-tight">
          Intelligent Job-Match
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