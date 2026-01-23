import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Card, CardTitle, CardDescription } from "../ui";
import { CheckIcon } from "../icons";
import { VotingModal, type VoteScores } from "./VotingModal";
import type { AssignmentWithSubmission } from "../../api/voting";

interface VotingGalleryViewProps {
	timeRemaining: string;
	assignments: AssignmentWithSubmission[];
	onSubmitVote: (submissionId: number, scores: VoteScores) => void;
	isSubmittingVote?: boolean;
}

interface SubmissionThumbnailProps {
	assignment: AssignmentWithSubmission;
	onClick: () => void;
	index: number;
}

function SubmissionThumbnail({
	assignment,
	onClick,
	index,
}: SubmissionThumbnailProps) {
	const itemRef = useRef<HTMLButtonElement>(null);
	const hasVoted = !!assignment.existingVote;

	useEffect(() => {
		if (!itemRef.current) return;

		gsap.fromTo(
			itemRef.current,
			{ opacity: 0, y: 20, scale: 0.95 },
			{
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.4,
				delay: index * 0.1,
				ease: "back.out(1.2)",
			},
		);
	}, [index]);

	return (
		<button
			ref={itemRef}
			type="button"
			onClick={onClick}
			className={`
				relative group cursor-pointer rounded-lg overflow-hidden
				border transition-all duration-200
				hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
				${
					hasVoted
						? "border-[#738f17] shadow-[0px_0px_0px_2px_rgba(115,143,23,0.2)]"
						: "border-[rgba(64,64,64,0.31)] hover:border-[#cbff1f]"
				}
			`}
			style={{ opacity: 0 }}
		>
			{/* Thumbnail Image */}
			<div className="aspect-video bg-[#f5f5f5]">
				{assignment.submission.design_image ? (
					<img
						src={assignment.submission.design_image}
						alt={`Submission ${assignment.submission.id}`}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-[#bababa] font-['Figtree',sans-serif] text-xs">
						No preview
					</div>
				)}
			</div>

			{/* Hover overlay */}
			<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
				<span className="font-['Figtree',sans-serif] text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					{hasVoted ? "Edit Vote" : "Vote"}
				</span>
			</div>

			{/* Voted indicator */}
			{hasVoted && (
				<div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#cbff1f] border border-[#738f17] flex items-center justify-center shadow-md">
					<CheckIcon size={14} className="text-[#738f17]" />
				</div>
			)}

			{/* Submission number badge */}
			<div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm">
				<span className="font-['Figtree',sans-serif] text-xs font-medium text-white">
					#{index + 1}
				</span>
			</div>
		</button>
	);
}

export function VotingGalleryView({
	timeRemaining,
	assignments,
	onSubmitVote,
	isSubmittingVote = false,
}: VotingGalleryViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [selectedAssignment, setSelectedAssignment] =
		useState<AssignmentWithSubmission | null>(null);

	// Entrance animation for container
	useEffect(() => {
		if (!containerRef.current) return;

		gsap.fromTo(
			containerRef.current,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
		);
	}, []);

	const votedCount = assignments.filter((a) => a.existingVote).length;
	const totalCount = assignments.length;
	const allVoted = votedCount === totalCount && totalCount > 0;

	const handleSubmitVote = (submissionId: number, scores: VoteScores) => {
		onSubmitVote(submissionId, scores);
		// Close modal after submitting (in real implementation, wait for success)
		setSelectedAssignment(null);
	};

	return (
		<>
			<div
				ref={containerRef}
				className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto"
				style={{ opacity: 0 }}
			>
				{/* Time remaining */}
				<div className="text-center">
					<span className="font-['Figtree',sans-serif] font-normal text-base text-white/50 tracking-[-0.64px]">
						Time to vote:{" "}
					</span>
					<span className="font-['Figtree',sans-serif] font-medium text-base text-white tracking-[-0.64px]">
						{timeRemaining}
					</span>
				</div>

				<Card animate={false} className="w-full overflow-hidden">
					<div className="flex flex-col gap-5">
						{/* Header */}
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-left text-lg">
									Your Voting Assignments
								</CardTitle>
								<CardDescription className="mt-1 text-left">
									Review each submission and rate them on the criteria
								</CardDescription>
							</div>
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f5f5] border border-[#e0e0e0]">
								<span className="font-['Figtree',sans-serif] text-sm font-medium text-[#717171]">
									{votedCount}/{totalCount}
								</span>
								{allVoted && <CheckIcon size={14} className="text-[#738f17]" />}
							</div>
						</div>

						{/* Progress bar */}
						<div className="w-full h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
							<div
								className="h-full bg-[#cbff1f] transition-all duration-500 ease-out rounded-full"
								style={{ width: `${(votedCount / totalCount) * 100}%` }}
							/>
						</div>

						{/* Gallery Grid */}
						{assignments.length > 0 ? (
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{assignments.map((assignment, index) => (
									<SubmissionThumbnail
										key={assignment.assignment.id}
										assignment={assignment}
										index={index}
										onClick={() => setSelectedAssignment(assignment)}
									/>
								))}
							</div>
						) : (
							<div className="py-12 text-center">
								<p className="font-['Figtree',sans-serif] text-sm text-[#717171]">
									No submissions assigned to you yet.
								</p>
								<p className="font-['Figtree',sans-serif] text-xs text-[#bababa] mt-1">
									Check back when the voting period begins.
								</p>
							</div>
						)}

						{/* Completion message */}
						{allVoted && (
							<div className="p-4 rounded-lg bg-[#f0ffd9] border border-[#738f17]/30 text-center">
								<p className="font-['Figtree',sans-serif] text-sm font-medium text-[#738f17]">
									🎉 You've voted on all assigned submissions!
								</p>
								<p className="font-['Figtree',sans-serif] text-xs text-[#738f17]/70 mt-1">
									You can still update your votes before the deadline.
								</p>
							</div>
						)}
					</div>
				</Card>
			</div>

			{/* Voting Modal */}
			{selectedAssignment && (
				<VotingModal
					assignment={selectedAssignment}
					onClose={() => setSelectedAssignment(null)}
					onSubmitVote={handleSubmitVote}
					isSubmitting={isSubmittingVote}
				/>
			)}
		</>
	);
}
