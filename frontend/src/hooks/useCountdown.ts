import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CountdownTime {
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
}

// Mock config - replace with actual API endpoint
const CONFIG = {
    useMock: true,
    // Set target date to 11 hours from now for demo purposes
    mockTargetDate: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString(),
};

// Simulates fetching the submission deadline from API
async function fetchSubmissionDeadline(): Promise<string> {
    if (CONFIG.useMock) {
        return CONFIG.mockTargetDate;
    }

    const response = await fetch("/api/submissions/deadline");
    if (!response.ok) {
        throw new Error("Failed to fetch deadline");
    }
    const data = await response.json();
    return data.deadline;
}

function calculateTimeRemaining(targetDate: string): CountdownTime {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isExpired: false };
}

export const countdownKeys = {
    deadline: ["submissions", "deadline"] as const,
    time: ["submissions", "countdown"] as const,
};

export function useCountdown() {
    const queryClient = useQueryClient();

    // Fetch the deadline once
    const { data: targetDate } = useQuery({
        queryKey: countdownKeys.deadline,
        queryFn: fetchSubmissionDeadline,
        staleTime: Number.POSITIVE_INFINITY, // Deadline doesn't change
    });

    // Update countdown every second
    const { data: time } = useQuery({
        queryKey: countdownKeys.time,
        queryFn: () => calculateTimeRemaining(targetDate ?? ""),
        enabled: !!targetDate,
        refetchInterval: 1000,
        staleTime: 0,
    });

    return {
        hours: time?.hours ?? 0,
        minutes: time?.minutes ?? 0,
        seconds: time?.seconds ?? 0,
        isExpired: time?.isExpired ?? false,
        isLoading: !targetDate,
    };
}
