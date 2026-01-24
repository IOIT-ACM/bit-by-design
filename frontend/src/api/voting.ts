import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, getStoredToken } from "./client";
import type { SubmissionResponse } from "./submissions";

// --- Types ---

/**
 * A vote assignment linking a user to a submission they need to vote on
 */
export interface VoteAssignment {
    id: number;
    user_id: number;
    submission_id: number;
    created_at: string;
    updated_at: string;
}

/**
 * Vote scores for a submission (all 0-5)
 */
export interface VoteParams {
    submission_id: number;
    problem_fit_score: number;
    clarity_score: number;
    style_interpretation_score: number;
    originality_score: number;
    overall_quality_score: number;
}

/**
 * Vote response from the API
 */
export interface VoteResponse {
    id: number;
    user_id: number;
    submission_id: number;
    problem_fit_score: number;
    clarity_score: number;
    style_interpretation_score: number;
    originality_score: number;
    overall_quality_score: number;
    created_at: string;
    updated_at: string;
}

/**
 * Assignment with full submission data for display
 */
export interface AssignmentWithSubmission {
    assignment: VoteAssignment;
    submission: SubmissionResponse;
    existingVote?: VoteResponse;
}

// --- API Functions ---

/**
 * Get all vote assignments for the current user
 * GET /api/vote_assignments/mine
 */
async function fetchMyAssignments(): Promise<VoteAssignment[]> {
    return apiFetch("/vote_assignments/mine", { method: "GET" });
}

/**
 * Get a submission by ID
 * GET /api/submissions/:id
 */
async function fetchSubmission(id: number): Promise<SubmissionResponse> {
    return apiFetch(`/submissions/${id}`, { method: "GET" });
}

/**
 * Submit a vote for a submission
 * POST /api/votes/
 */
async function submitVote(params: VoteParams): Promise<VoteResponse> {
    return apiFetch("/votes", {
        method: "POST",
        data: params,
    });
}

/**
 * Get all votes by the current user
 * This helps us know which submissions they've already voted on
 * GET /api/votes/mine
 */
async function fetchMyVotes(): Promise<VoteResponse[]> {
    try {
        return await apiFetch("/votes/mine", { method: "GET" });
    } catch {
        // If no votes endpoint or user has no votes, return empty array
        return [];
    }
}

// --- Query Keys ---
export const votingKeys = {
    all: ["voting"] as const,
    assignments: () => [...votingKeys.all, "assignments"] as const,
    myVotes: () => [...votingKeys.all, "myVotes"] as const,
    submission: (id: number) => [...votingKeys.all, "submission", id] as const,
};

// --- Hooks ---

/**
 * Fetch user's vote assignments
 */
export function useMyAssignments() {
    const hasToken = !!getStoredToken();
    return useQuery({
        queryKey: votingKeys.assignments(),
        queryFn: fetchMyAssignments,
        retry: 1,
        enabled: hasToken,
    });
}

/**
 * Fetch user's existing votes
 */
export function useMyVotes() {
    const hasToken = !!getStoredToken();
    return useQuery({
        queryKey: votingKeys.myVotes(),
        queryFn: fetchMyVotes,
        retry: false,
        enabled: hasToken,
    });
}

/**
 * Fetch a single submission by ID
 */
export function useSubmission(id: number) {
    return useQuery({
        queryKey: votingKeys.submission(id),
        queryFn: () => fetchSubmission(id),
        enabled: id > 0,
    });
}

/**
 * Fetch all assigned submissions with their full data
 * Combines assignments with submission details and existing votes
 */
export function useAssignedSubmissions() {
    const {
        data: assignments,
        isLoading: assignmentsLoading,
        error: assignmentsError,
    } = useMyAssignments();
    const { data: myVotes, isLoading: votesLoading } = useMyVotes();

    // For each assignment, we'll also fetch the submission
    const { data: submissions, isLoading: submissionsLoading } = useQuery({
        queryKey: [
            ...votingKeys.assignments(),
            "withSubmissions",
            assignments?.map((a) => a.submission_id),
        ],
        queryFn: async () => {
            if (!assignments || assignments.length === 0) return [];

            // Fetch all submissions in parallel
            const submissionPromises = assignments.map((a) =>
                fetchSubmission(a.submission_id)
            );
            return Promise.all(submissionPromises);
        },
        enabled: !!assignments && assignments.length > 0,
    });

    // Combine assignments with submissions and votes
    const assignedSubmissions: AssignmentWithSubmission[] = [];

    if (assignments && submissions) {
        for (let i = 0; i < assignments.length; i++) {
            const assignment = assignments[i];
            const submission = submissions[i];
            const existingVote = myVotes?.find((v) =>
                v.submission_id === assignment.submission_id
            );

            if (submission) {
                assignedSubmissions.push({
                    assignment,
                    submission,
                    existingVote,
                });
            }
        }
    }

    return {
        data: assignedSubmissions,
        isLoading: assignmentsLoading || submissionsLoading || votesLoading,
        error: assignmentsError,
    };
}

/**
 * Submit a vote mutation
 */
export function useSubmitVote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submitVote,
        onSuccess: () => {
            // Invalidate votes to refetch
            queryClient.invalidateQueries({ queryKey: votingKeys.myVotes() });
        },
    });
}
