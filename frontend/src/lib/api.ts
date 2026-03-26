const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request<{ username: string }>("/api/auth/me"),
};

// ── Projects ──────────────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string;
  case_study: string | null;
  category: string;
  status: string;
  stack_tags: string[];
  demo_url: string | null;
  github_url: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const projectsApi = {
  getPublished: (category?: string, featuredOnly?: boolean) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (featuredOnly) params.set("featured_only", "true");
    return request<Project[]>(`/api/projects?${params}`);
  },
  getAll: () => request<Project[]>("/api/projects/all"),
  create: (data: Partial<Project>) =>
    request<Project>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    request<Project>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/api/projects/${id}`, { method: "DELETE" }),
  reorder: (projects: { id: string; sort_order: number }[]) =>
    request("/api/projects/reorder", { method: "POST", body: JSON.stringify({ projects }) }),
};

// ── Contact ───────────────────────────────────────────────────────────
export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

export const contactApi = {
  submit: (data: ContactSubmission) =>
    request("/api/contact", { method: "POST", body: JSON.stringify(data) }),
};

// ── GitHub ────────────────────────────────────────────────────────────
export interface GithubStats {
  total_commits: number | null;
  languages: Record<string, number> | null;
  activity_graph: Record<string, number> | null;
  last_updated: string | null;
}

export interface GithubPinned {
  pinned_repos: Array<{
    name: string;
    description: string | null;
    url: string;
    stars: number;
    last_commit: string | null;
    languages: string[];
  }> | null;
  last_updated: string | null;
}

export const githubApi = {
  getStats: () => request<GithubStats>("/api/github/stats"),
  getPinned: () => request<GithubPinned>("/api/github/pinned"),
};

// ── Settings ──────────────────────────────────────────────────────────
export interface ThemeSettings {
  active_theme: string;
  last_theme_changed: string;
}

export interface ResumeSettings {
  resume_url: string | null;
  resume_uploaded_at: string | null;
}

export const settingsApi = {
  getTheme: () => request<ThemeSettings>("/api/settings/theme"),
  getResume: () => request<ResumeSettings>("/api/settings/resume"),
};

// ── Analytics ─────────────────────────────────────────────────────────
export const analyticsApi = {
  getPublicCount: () =>
    request<{ visitor_count: number }>("/api/analytics/public"),
};
