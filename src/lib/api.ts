// src/lib/api.ts
//--------------------------------------------------------------
// Centralised helper for talking to FastAPI via HTTP.
//--------------------------------------------------------------

import type { JobFilters } from "../components/FiltersForm";
import type { JobListing } from "../components/JobCard";

const API = "/api";  // vite proxy will forward this

/* --------------------------------- */
/* shared query-string builder       */
/* --------------------------------- */
function qs(f: JobFilters, offset = 0, limitOverride?: number) {
    const p = new URLSearchParams();
    if (f.title) p.set("title_filter", f.title);
    if (f.advancedTitle) p.set("advanced_title_filter", f.advancedTitle);
    if (f.description) p.set("description_filter", f.description);
    if (f.location) p.set("location_filter", f.location);
    if (f.remote !== null) p.set("remote", String(f.remote));
    if (offset) p.set("offset", String(offset));
    if (limitOverride) p.set("limit", String(limitOverride));
    return p.toString();
}

function toArray(data: unknown): JobListing[] {
  if (Array.isArray(data)) return data; 

   if (data && typeof data === "object" && "code" in data) {
    throw new Error(
      (data as any).message ??
      "Server returned an error while parsing your query"
    );
  }
                 // already an array
  if (data && typeof data === "object") {
    for (const k of ["jobs", "yc_jobs", "internships", "results", "data"]) {
      const v = (data as any)[k];
      if (Array.isArray(v)) return v;                  // unwrap first match
    }
  }
  console.warn("Unexpected jobs payload:", data);
  return [];
}

/* --------------------------------- */
/* main fetch exported to App.tsx    */
/* --------------------------------- */
export async function fetchJobs(
    f: JobFilters,
    signal?: AbortSignal
): Promise<JobListing[]> {
    // decide route(s), per-role defaults & caps
    const config = {
        FT: { route: "fetch_jobs", default: 100, step: 100, apiCap: 100 },
        YC: { route: "fetch_yc_jobs", default: 10, step: 10, apiCap: 10 },
        INTERN: { route: "fetch_internships", default: 10, step: 10, apiCap: 10 },
        ADZUNA: { route: "fetch_adzuna_jobs", default: 50, step: 50, apiCap: 50 },
    } as const;

    // ===== Specific roleType selected
    const cfg = config[f.roleType];
    const limit = f.limit ?? cfg.default;

    // FT uses single call; YC/Intern might need paging
    /*
    if (f.roleType === "FT") {
        return doSingle(cfg, limit, f, signal);
    }
        */
    return doSingle(cfg, limit, f, signal);
    // return doPaged(cfg, limit, f, signal);
}

/* ---------- helpers ---------- */

/** One-and-done call (active jobs supports up to 100 rows at once) */
async function doSingle(
    cfg: { route: string },
    limit: number,
    f: JobFilters,
    signal?: AbortSignal
) {
    const res = await fetch(
        `${API}/${cfg.route}?${qs(f, 0, limit)}`,
        { signal }
    );
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const raw  = await res.json();
    return toArray(raw).slice(0, limit);
}

/** Repeated calls in 10-row pages until we gather `limit` or the API dries up
async function doPaged(
    cfg: { route: string; step: number; apiCap: number },
    limit: number,
    f: JobFilters,
    signal?: AbortSignal
) {
    const all: JobListing[] = [];
    for (let offset = 0; offset < limit; offset += cfg.step) {
        const res = await fetch(
            `${API}/${cfg.route}?${qs(f, offset)}`,
            { signal }
        );
        if (!res.ok) throw new Error(`Server ${res.status}`);
        const chunk: JobListing[] = await res.json();
        all.push(...chunk);
        // stop early if server ran out of records
        if (chunk.length < cfg.apiCap) break;
    }
    return all.slice(0, limit);   // trim any accidental over-fetch
}
    */
