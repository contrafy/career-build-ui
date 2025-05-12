// career-build-ui/src/lib/api.ts
//--------------------------------------------------------------
// Centralised helper for talking to FastAPI via HTTP.
//--------------------------------------------------------------

import type { JobFilters } from "../components/ui/FiltersForm";
import type { JobListing } from "../components/ui/JobCard";

const API = "/api";        // vite proxy will forward this

function qs(f: JobFilters) {
    const p = new URLSearchParams();
    if (f.title) p.set("title_filter", f.title);
    if (f.description) p.set("description_filter", f.description);
    if (f.location) p.set("location_filter", f.location);
    if (f.remote !== null) p.set("remote", String(f.remote));

    if (f.roleType !== "ALL") {
        const map: Record<JobFilters["roleType"], string> = {
            ALL: "",
            FT: "FULL_TIME",
            YC: "YC_ONLY",
            INTERN: "INTERN",
        };
        p.set("ai_employment_type_filter", map[f.roleType]);
    }
    p.set("limit", "50");
    return p.toString();
}

export async function fetchInternships(f: JobFilters) {
    const p = new URLSearchParams();
    if (f.title) p.set("title_filter", f.title);
    if (f.description) p.set("description_filter", f.description);
    if (f.location) p.set("location_filter", f.location);
    if (f.remote !== null) p.set("remote", String(f.remote));
    p.set("limit", "50");

    const res = await fetch(`${API}/fetch_internships?${p.toString()}`);
    if (!res.ok) throw new Error(`Internships API: ${res.statusText}`);
    return (await res.json()) as JobListing[];
  }

/** Pull listings from all three endpoints and flatten them */
export async function fetchAllJobs(f: JobFilters) {
    const q = qs(f);
    const [ats, internships, yc] = await Promise.all([
        fetch(`${API}/fetch_jobs?${q}`).then(r => r.json()),
        fetch(`${API}/fetch_internships?${q}`).then(r => r.json()),
        fetch(`${API}/fetch_yc_jobs?${q}`).then(r => r.json()),
    ]);
    return [...ats, ...internships, ...yc] as JobListing[];
}
  