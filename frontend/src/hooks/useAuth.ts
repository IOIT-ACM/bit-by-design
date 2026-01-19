import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";

export interface User {
    pid: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
}

const TOKEN_KEY = "auth_token";

// Get token from localStorage
function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

// Store token in localStorage
function setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

// Remove token from localStorage
function removeStoredToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// Fetch current user from token using the API
async function fetchCurrentUser(): Promise<AuthState> {
    const token = getStoredToken();

    if (!token) {
        return { user: null, token: null };
    }

    try {
        const userData = await getCurrentUser(token);
        return {
            user: {
                pid: userData.pid,
                email: userData.email,
                name: userData.name,
            },
            token,
        };
    } catch {
        // Token is invalid or expired
        removeStoredToken();
        return { user: null, token: null };
    }
}

// Logout function (just removes token, no server endpoint needed)
async function logoutUser(): Promise<void> {
    removeStoredToken();
}

export const authKeys = {
    user: ["auth", "user"] as const,
};

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: authState, isLoading } = useQuery({
        queryKey: authKeys.user,
        queryFn: fetchCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });

    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.setQueryData(authKeys.user, {
                user: null,
                token: null,
            });
        },
    });

    // Function to set auth state after login (called from login flow)
    const setAuth = (token: string, user: User) => {
        setStoredToken(token);
        queryClient.setQueryData(authKeys.user, { user, token });
    };

    return {
        user: authState?.user ?? null,
        token: authState?.token ?? null,
        isAuthenticated: !!authState?.user,
        isLoading,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
        setAuth,
    };
}
