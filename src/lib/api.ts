// career-build-ui/src/lib/api.ts
//--------------------------------------------------------------
// Centralised helper for talking to FastAPI via HTTP.
//--------------------------------------------------------------

import type { JobFilters } from "../components/ui/FiltersForm";
import type { JobListing } from "../components/ui/JobCard";

const API = "/api";        // vite proxy will forward this

/* --------------------------------- */
/* shared query-string builder       */
/* --------------------------------- */
function qs(f: JobFilters) {
    const p = new URLSearchParams();
    if (f.title) p.set("title_filter", f.title);
    if (f.description) p.set("description_filter", f.description);
    if (f.location) p.set("location_filter", f.location);
    if (f.remote !== null) p.set("remote", String(f.remote));

    // Translate roleType → backend enum WHEN NEEDED
    if (f.roleType !== "ALL" && f.roleType !== "YC") {      // YC handled by endpoint
        const map: Record<JobFilters["roleType"], string> = {
            ALL: "",
            FT: "FULL_TIME",
            YC: "",
            INTERN: "INTERN",
        };
        p.set("ai_employment_type_filter", map[f.roleType]);
    }
    p.set("limit", "50");
    return p.toString();
}

/* --------------------------------- */
/* endpoint-specific helpers         */
/* --------------------------------- */
async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${url}: ${res.statusText}`);
    return res.json() as Promise<T>;
}

const fetchATSJobs = (f: JobFilters, signal?: AbortSignal) =>
    getJSON<JobListing[]>(`${API}/fetch_jobs?${qs(f)}`, signal);

const fetchInternships = (f: JobFilters, signal?: AbortSignal) =>
    getJSON<JobListing[]>(`${API}/fetch_internships?${qs(f)}`, signal);

const fetchYCJobs = (f: JobFilters, signal?: AbortSignal) =>
    getJSON<JobListing[]>(`${API}/fetch_yc_jobs?${qs(f)}`, signal);

/* --------------------------------- */
/* ONE public dispatcher             */
/* --------------------------------- */
export async function fetchJobs(f: JobFilters, signal?: AbortSignal): Promise<JobListing[]> {
    switch (f.roleType) {
        case "INTERN":
            return fetchInternships(f, signal);

        case "FT":
            return fetchATSJobs(f, signal);

        case "YC":
            return fetchYCJobs(f);

        case "ALL":
        default: {
            // parallel requests, then flatten
            const [ats, internships, yc] = await Promise.all([
                fetchATSJobs(f, signal),
                fetchInternships(f, signal),
                fetchYCJobs(f, signal),
            ]);
            return [...ats, ...internships, ...yc];
        }
    }
  }
  