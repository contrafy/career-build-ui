import { useEffect, useState } from "react";
import JobGrid from "./components/ui/JobGrid";

import jobsData from "../example_responses/fetch_jobs.json";
import ycData from "../example_responses/fetch_yc_jobs.json";
import internData from "../example_responses/fetch_internships.json";

import type { JobListing } from "./components/ui/JobCard";

function App() {
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);

  useEffect(() => {
    // mock “backend” merge
    setAllJobs([
      ...(jobsData as JobListing[]),
      ...(ycData as JobListing[]),
      ...(internData as JobListing[]),
    ]);
  }, []);

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="py-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Intelligent Job‑Match MVP
        </h1>
        <p className="text-muted-foreground">
          {allJobs.length} opportunities loaded from sample data
        </p>
      </header>

      <JobGrid items={allJobs} />
    </main>
  );
}

export default App;
