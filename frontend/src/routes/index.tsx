import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../components/layouts";
import { SubmissionsBackground, Spinner } from "../components/ui";
import {
	CountdownView,
	CompetitionOverView,
	SubmissionsOpenView,
	SubmissionsClosedView,
	VotingGalleryView,
	CompetitionInstructionsButton,
	CompetitionInstructionsModal,
} from "../components/views";
import type { VoteScores } from "../components/views";
import { useCountdown } from "../hooks";
import { useMySubmission } from "../api/submissions";
import { useAssignedSubmissions, useSubmitVote } from "../api/voting";
import { formatTimeRemaining } from "../utils";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { hours, minutes, seconds, isLoading, state, label } = useCountdown();
	const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

	// Fetch user's submission to know if they submitted
	const { data: mySubmission } = useMySubmission();
	const hasSubmission = !!mySubmission;

	// Fetch assigned submissions for voting
	const { data: assignedSubmissions, isLoading: assignmentsLoading } =
		useAssignedSubmissions();

	// Vote submission mutation
	const submitVoteMutation = useSubmitVote();

	// Handle vote submission
	const handleSubmitVote = (submissionId: number, scores: VoteScores) => {
		submitVoteMutation.mutate(
			{
				submission_id: submissionId,
				problem_fit_score: scores.problemFitScore,
				clarity_score: scores.clarityScore,
				style_interpretation_score: scores.styleInterpretationScore,
				originality_score: scores.originalityScore,
				overall_quality_score: scores.overallQualityScore,
			},
			{
				onSuccess: () => {
					toast.success("Vote submitted successfully!");
				},
				onError: (error) => {
					toast.error(error.message || "Failed to submit vote");
				},
			},
		);
	};

	// Determine background based on state
	const showSubmissionsBackground =
		state === "submissions_open" || state === "waiting_for_voting";
	const background = showSubmissionsBackground ? (
		<SubmissionsBackground />
	) : undefined;

	// Render appropriate view based on competition state
	const renderContent = () => {
		if (isLoading) {
			return (
				<CountdownView
					label="Loading..."
					hours={0}
					minutes={0}
					seconds={0}
					isLoading
				/>
			);
		}

		switch (state) {
			case "competition_over":
				return <CompetitionOverView />;

			case "submissions_open":
				return <SubmissionsOpenView hours={hours} minutes={minutes} />;

			case "waiting_for_voting":
				return (
					<SubmissionsClosedView
						hours={hours}
						minutes={minutes}
						seconds={seconds}
						hasSubmission={hasSubmission}
					/>
				);

			case "voting_open":
				if (assignmentsLoading) {
					return (
						<div className="flex flex-col items-center justify-center p-12">
							<Spinner className="text-[#cbff1f]" size="lg" />
						</div>
					);
				}
				return (
					<VotingGalleryView
						timeRemaining={formatTimeRemaining(hours, minutes)}
						assignments={assignedSubmissions ?? []}
						onSubmitVote={handleSubmitVote}
						isSubmittingVote={submitVoteMutation.isPending}
					/>
				);

			case "waiting_for_submissions":
			default:
				return (
					<CountdownView
						label={label}
						hours={hours}
						minutes={minutes}
						seconds={seconds}
					/>
				);
		}
	};

	return (
		<DashboardLayout background={background}>
			<div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
				{renderContent()}

				{(state === "waiting_for_submissions" ||
					state === "submissions_open") && (
					<>
						<CompetitionInstructionsButton
							onClick={() => setIsInstructionsOpen(true)}
						/>
						<CompetitionInstructionsModal
							isOpen={isInstructionsOpen}
							onClose={() => setIsInstructionsOpen(false)}
						/>
					</>
				)}
			</div>
		</DashboardLayout>
	);
}
