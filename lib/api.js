"use client";
// Fetch wrapper client-side: tu dong gui cookie (credentials include) va bao loi
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
    body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.blob();
  if (!res.ok) throw new Error(data?.message || `Loi ${res.status}`);
  return data;
}
