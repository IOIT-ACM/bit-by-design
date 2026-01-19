import { useMutation } from "@tanstack/react-query";

// --- Configuration ---
const CONFIG = {
    useMock: false,
    mockDelay: 1500,
    validOtp: "123456",
    apiBaseUrl: import.meta.env.PUBLIC_API_URL || "",
} as const;

// --- Types ---
export interface SendOtpRequest {
    email: string;
}

// Backend returns empty JSON on success
export type SendOtpResponse = Record<string, never>;

export interface LoginRequest {
    email: string;
    otp: string;
}

export interface LoginResponse {
    token: string;
    pid: string;
    name: string;
    email: string;
}

export interface ResendOtpRequest {
    email: string;
}

// Backend returns empty JSON on success
export type ResendOtpResponse = Record<string, never>;

export interface CurrentUserResponse {
    pid: string;
    name: string;
    email: string;
}

// --- Utilities ---
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiFetch<T>(
    endpoint: string,
    options: {
        method?: "GET" | "POST";
        data?: unknown;
        token?: string;
    } = {},
): Promise<T> {
    const { method = "POST", data, token } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${CONFIG.apiBaseUrl}/api${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || "Request failed");
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
        return {} as T;
    }

    return JSON.parse(text);
}

// --- API Functions ---

/**
 * Send OTP to user's email
 * POST /api/auth/send-otp
 */
async function sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    if (CONFIG.useMock) {
        await delay(CONFIG.mockDelay);
        if (!data.email.includes("@")) {
            throw new Error("Please enter a valid email address");
        }
        console.log(
            `[Mock] OTP sent to ${data.email}. Use OTP: ${CONFIG.validOtp}`,
        );
        return {};
    }

    return apiFetch("/auth/send-otp", { data });
}

// Create a mock JWT token with user data
function createMockJwt(email: string): string {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        pid: `mock-pid-${Date.now()}`,
        email,
        name: email.split("@")[0],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const signature = "mock-signature";

    return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Login with OTP
 * POST /api/auth/login
 */
async function login(data: LoginRequest): Promise<LoginResponse> {
    if (CONFIG.useMock) {
        await delay(CONFIG.mockDelay);
        if (data.otp === CONFIG.validOtp) {
            const token = createMockJwt(data.email);
            return {
                token,
                pid: `mock-pid-${Date.now()}`,
                name: data.email.split("@")[0],
                email: data.email,
            };
        }
        throw new Error("Invalid OTP. Please try again.");
    }

    return apiFetch("/auth/login", { data });
}

/**
 * Resend OTP to user's email
 * POST /api/auth/send-otp (same endpoint as initial send)
 */
async function resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    if (CONFIG.useMock) {
        await delay(CONFIG.mockDelay);
        console.log(
            `[Mock] OTP resent to ${data.email}. Use OTP: ${CONFIG.validOtp}`,
        );
        return {};
    }

    return apiFetch("/auth/send-otp", { data });
}

/**
 * Get current authenticated user
 * GET /api/auth/current
 */
export async function getCurrentUser(
    token: string,
): Promise<CurrentUserResponse> {
    if (CONFIG.useMock) {
        // In mock mode, decode the token directly
        try {
            const payload = token.split(".")[1];
            const decoded = JSON.parse(atob(payload));
            return {
                pid: decoded.pid,
                name: decoded.name,
                email: decoded.email,
            };
        } catch {
            throw new Error("Invalid token");
        }
    }

    return apiFetch("/auth/current", { method: "GET", token });
}

// --- Query Keys ---
export const authApiKeys = {
    all: ["auth"] as const,
    otp: () => [...authApiKeys.all, "otp"] as const,
};

// --- Hooks ---
export function useRequestOtp() {
    return useMutation({
        mutationFn: sendOtp,
        mutationKey: authApiKeys.otp(),
    });
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: login,
        mutationKey: authApiKeys.otp(),
    });
}

export function useResendOtp() {
    return useMutation({
        mutationFn: resendOtp,
        mutationKey: authApiKeys.otp(),
    });
}
