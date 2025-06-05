const BASE_URL = "http://localhost:3000";

type Options = {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    token?: string;
};
export async function apiFetch(endpoint: string, { method = "GET", headers = {}, body, token }: Options = {}) {
    const opts: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        } as Record<string, string>,
    };
    if (token) (opts.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    if (body) opts.body = typeof body === "string" ? body : JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido");
    }
    return res.json();
}
