import { useEffect, useState } from "react";
import JobGrid from "./components/ui/JobGrid";
import FiltersForm from "./components/ui/FiltersForm";
import ResumeUpload from "./components/ui/ResumeUpload"

import jobsData from "../example_responses/fetch_jobs.json";
import ycData from "../example_responses/fetch_yc_jobs.json";
import internData from "../example_responses/fetch_internships.json";

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
  // State that *will* drive real API calls later
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);

  // Your existing “all jobs” state + mock merge
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
  useEffect(() => {
    // pretend these came from a backend
    setAllJobs([
      ...(jobsData as JobListing[]),
      ...(ycData as JobListing[]),
      ...(internData as JobListing[]),
    ]);
  }, []);

  // ------------ 2️⃣ New: placeholder effect that will host the fetch -------- //
  //
  // At the moment it just logs the filters so you can see the plumbing work.
  //
  useEffect(() => {
    console.info("[Filters changed] → Ready to fetch with:", filters);
    // TODO: swap this console.log for a real fetch:
    // fetch(`/api/jobs?keyword=${filters.keyword}&location=${filters.location}&roleType=${filters.roleType}`)
    //   .then(r => r.json())
    //   .then(setAllJobs);
  }, [filters]);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Intelligent Job-Match</h1>

      {/* ➊ New toolbar */}
      <FiltersForm
        value={filters}
        onSubmit={setFilters}   // lifts draft → filters state
      />

      {/* Resume (pdf) upload*/}
      <ResumeUpload />

      {/* ➋ Existing results grid (shows all jobs) */}
      <JobGrid items={allJobs} />
    </main>
  );
}

export default App;
