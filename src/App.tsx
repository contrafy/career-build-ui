// src/App.tsx
import { useRef, useState } from "react";
import JobGrid from "./components/JobGrid";
import FiltersForm from "./components/FiltersForm";
import FileUpload from "./components/FileUpload";
import { fetchJobs } from "@/lib/api";
import type { JobListing } from "./components/JobCard";
import type { JobFilters } from "./components/FiltersForm";
import { ModeToggle } from "./components/ModeToggle";
import { ErrorBanner, showError } from "./components/ErrorBanner";

import sampleJobs from "@/assets/example_responses/fetch_jobs.json";

// Filters returned from resume parsing service
interface LLMGeneratedFilters {
  internships?: Record<string, any>;
  jobs?: Record<string, any>;
  yc_jobs?: Record<string, any>;
}

import AuthContainer from "./components/AuthContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

// Default values for the filters form
const DEFAULT_FILTERS: JobFilters = {
  // ───── Shared
  title: "",
  advancedTitle: "",
  description: "",
  location: "",
  remote: null,
  roleType: "ADZUNA",
  limit: null,
};

function App() {
  // Current form filters
  const [filters, setFilters] = useState<JobFilters | null>(null);
  // All job listings to display, initialized with sample data
  const [allJobs, setAllJobs] = useState<JobListing[]>(
    () => sampleJobs as unknown as JobListing[]   // lazy init, one‑time cast
  );
  // Loading state for fetch requests
  const [loading, setLoading] = useState(false);

  // Ref to cancel ongoing fetch
  const abortRef = useRef<AbortController | null>(null);

  // Apply filters when user clicks "Apply"
  const applyFilters = (newFilters: JobFilters) => {
    // Ensure a default limit based on roleType
    const filtersWithLimit: JobFilters = {
      ...newFilters,
      limit: newFilters.limit ??
             (newFilters.roleType === "FT" ? 30 :
             newFilters.roleType === "ADZUNA" ? 50 : 10),
    };

    setFilters(filtersWithLimit); // Update current filters
    abortRef.current?.abort(); // Cancel previous request
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        setLoading(true);
        setAllJobs(await fetchJobs(filtersWithLimit, ctrl.signal));
      } catch (e: any) {
        if (e.name !== "AbortError") showError(e.message ?? "Network error"); // Show error if not aborted
      } finally {
        setLoading(false);
      }
    })();
  };

  // Process resume parser output
  const handleResumeDone = (payload: LLMGeneratedFilters) => {
    console.log("Resume analyzed successfully:", payload);

    // Determine which parsed filters to use
    let activeFilters: Record<string, any> | undefined;
    const currentRoleType = filters?.roleType || DEFAULT_FILTERS.roleType;
    if (currentRoleType === "INTERN" && payload.internships) {
      activeFilters = payload.internships;
    } else if (currentRoleType === "YC" && payload.yc_jobs) {
      activeFilters = payload.yc_jobs;
    } else if ((currentRoleType === "FT") && payload.jobs) {
      activeFilters = payload.jobs;
    } else if (payload.jobs) {
      activeFilters = payload.jobs;
      console.log("Using jobs filters as fallback");
    }

    if (activeFilters) {
      // Map backend fields to form fields
      const newFilters: JobFilters = { ...filters || DEFAULT_FILTERS };
      // Inject default limit here too
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

      // Log any extra fields we didn't map
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
      <ErrorBanner />
      <main className="mx-auto max-w-6xl p-6 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Career Builder</h1>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <AuthContainer />
          </div>
        </div>

        {/* Filters form */}
        <FiltersForm value={filters ?? DEFAULT_FILTERS} onSubmit={applyFilters} />

        {/* Resume and cover letter upload */}
        <div className="flex flex-wrap gap-6 justify-center">
          <FileUpload kind="resume" onParsed={handleResumeDone} />
          <FileUpload kind="cover-letter" />
        </div>

        {loading && <p>Loading…</p>}

        {/* Job listings grid */}
        <JobGrid items={allJobs} />
      </main>
    </GoogleOAuthProvider>
  );
}

export default App;