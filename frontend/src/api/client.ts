import { toast } from "react-hot-toast";

// --- Configuration ---
const CONFIG = {
    // Check for Rsbuild/Vite env vars
    apiBaseUrl: import.meta.env.PUBLIC_API_URL || "",
    authTokenKey: "auth_token",
} as const;

// --- Types ---
interface ApiOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    data?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
}

// --- Utilities ---
export const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CONFIG.authTokenKey);
};

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {},
): Promise<T> {
    console.log("Reached this point.");
    const { method = "POST", data, token = getStoredToken(), headers = {} } = options;

    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/api${endpoint}`, {
            method,
            headers: requestHeaders,
            body: data ? JSON.stringify(data) : undefined,
        });
        console.log(response);

        if (response.status === 401) {
            // Optional: Handle unauthorized globally (e.g., redirect to login)
            // For now, just throw error
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
        }

        // Handle empty responses
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);

    } catch (error) {
        // Log error or show toast?
        toast.error(error instanceof Error ? error.message : "An error occurred");
        throw error;
    }
}
