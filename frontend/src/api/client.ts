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
    /** HTTP status codes for which error toasts should be suppressed */
    suppressToastOn?: number[];
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
    const {
        method = "POST",
        data,
        token = getStoredToken(),
        headers = {},
        suppressToastOn = [],
    } = options;

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
        if (!response.ok) {
            const status = response.status;
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.message ||
                errorData.error ||
                `Request failed with status ${status}`;

            // Only show toast if status is not in suppressToastOn list
            if (!suppressToastOn.includes(status)) {
                toast.error(message);
            }

            throw new Error(message);
        }

        // Handle empty responses
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
        // Network errors (not HTTP errors) still show toast
        if (error instanceof TypeError) {
            toast.error("Network error. Please check your connection.");
        }
        throw error;
    }
}
