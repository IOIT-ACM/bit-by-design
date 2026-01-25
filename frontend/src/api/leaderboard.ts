import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { SubmissionResponse } from "./submissions";

// --- Types ---
export interface LeaderboardEntry {
    id: number;
    submission_id: number;
    problem_fit_score: number;
    visual_clarity_score: number;
    style_interpretation_score: number;
    originality_score: number;
    overall_quality_score: number;
    final_score: number;
    user_name: string;
    created_at: string;
    updated_at: string;
}

export interface LeaderboardEntryWithSubmission {
    score: LeaderboardEntry;
    submission: SubmissionResponse;
}

// --- API Functions ---
async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    return apiFetch("/scores", {
        method: "GET",
    });
}

async function fetchSubmission(id: number): Promise<SubmissionResponse> {
    return apiFetch(`/submissions/${id}`, { method: "GET" });
}

// --- Query Keys ---
export const leaderboardKeys = {
    all: ["leaderboard"] as const,
    list: () => [...leaderboardKeys.all, "list"] as const,
    withSubmissions: () => [...leaderboardKeys.all, "withSubmissions"] as const,
};

// --- Hooks ---
export function useLeaderboard(enabled: boolean = true) {
    return useQuery({
        queryKey: leaderboardKeys.list(),
        queryFn: fetchLeaderboard,
        enabled,
        retry: false,
    });
}

/**
 * Fetch leaderboard with full submission data for each entry
 */
export function useLeaderboardWithSubmissions(enabled: boolean = true) {
    const { data: scores, isLoading: scoresLoading, error: scoresError } = useLeaderboard(enabled);

    const { data: submissions, isLoading: submissionsLoading } = useQuery({
        queryKey: [...leaderboardKeys.withSubmissions(), scores?.map(s => s.submission_id)],
        queryFn: async () => {
            if (!scores || scores.length === 0) return [];
            const submissionPromises = scores.map(s => fetchSubmission(s.submission_id));
            return Promise.all(submissionPromises);
        },
        enabled: !!scores && scores.length > 0,
    });

    // Combine scores with submissions
    const leaderboardWithSubmissions: LeaderboardEntryWithSubmission[] = [];

    if (scores && submissions) {
        for (let i = 0; i < scores.length; i++) {
            const score = scores[i];
            const submission = submissions[i];
            if (submission) {
                leaderboardWithSubmissions.push({ score, submission });
            }
        }
    }

    return {
        data: leaderboardWithSubmissions,
        isLoading: scoresLoading || submissionsLoading,
        error: scoresError,
    };
}
