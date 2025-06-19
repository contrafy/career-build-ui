// src/lib/api.ts
//--------------------------------------------------------------
// Centralised helper for talking to FastAPI via HTTP.
//--------------------------------------------------------------

import type { JobFilters } from "../components/FiltersForm";
import type { JobListing } from "../components/JobCard";
import { showError } from "../components/ErrorBanner";

const API = "/api";  // vite proxy will forward this

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
    resume?: File,
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

    return doSingle(cfg, limit, f, resume, signal);
}

/* ---------- helpers ---------- */

/** One-and-done call (active jobs supports up to 100 rows at once) */
async function doSingle(
    cfg: { route: string },
    limit: number,
    f: JobFilters,
    resume?: File,
    signal?: AbortSignal
) {
    let body: BodyInit;
    let headers: HeadersInit | undefined;

    if (resume) {
        const fd = new FormData();
        fd.append("filters", JSON.stringify(f));
        fd.append("resume", resume, resume.name);
        body = fd;                        // browser sets multipart header
        headers = undefined;
    } else {
        body = JSON.stringify({ filters: f });
        headers = { "Content-Type": "application/json" };
    }

    const res = await fetch(`/api/${cfg.route}`, {
        method: "POST",
        body,
        headers,
        signal,
    });

    if (!res.ok) throw new Error(`Server ${res.status}`);

    const raw = await res.json();
    return toArray(raw).slice(0, limit);
}
