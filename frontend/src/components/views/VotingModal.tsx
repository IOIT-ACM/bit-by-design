import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Card, CardTitle, CardDescription, Button } from "../ui";
import type { AssignmentWithSubmission, VoteResponse } from "../../api/voting";

/**
 * Vote scores for a submission (all 0-5)
 * This is the UI-friendly version used in the component
 */
export interface VoteScores {
	problemFitScore: number;
	clarityScore: number;
	styleInterpretationScore: number;
	originalityScore: number;
	overallQualityScore: number;
}

const initialVoteScores: VoteScores = {
	problemFitScore: 0,
	clarityScore: 0,
	styleInterpretationScore: 0,
	originalityScore: 0,
	overallQualityScore: 0,
};

/**
 * Convert API vote response to UI vote scores
 */
function apiVoteToScores(vote: VoteResponse): VoteScores {
	return {
		problemFitScore: vote.problem_fit_score,
		clarityScore: vote.clarity_score,
		styleInterpretationScore: vote.style_interpretation_score,
		originalityScore: vote.originality_score,
		overallQualityScore: vote.overall_quality_score,
	};
}

interface VotingModalProps {
	assignment: AssignmentWithSubmission;
	onClose: () => void;
	onSubmitVote: (submissionId: number, scores: VoteScores) => void;
	isSubmitting?: boolean;
}

interface ScoreInputProps {
	label: string;
	description: string;
	value: number;
	onChange: (value: number) => void;
}

function ScoreInput({ label, description, value, onChange }: ScoreInputProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div>
					<p className="font-['Figtree',sans-serif] text-sm font-medium text-black">
						{label}
					</p>
					<p className="font-['Figtree',sans-serif] text-xs text-[#717171]">
						{description}
					</p>
				</div>
				<span className="font-['Figtree',sans-serif] text-sm font-semibold text-[#738f17] min-w-[24px] text-right">
					{value}/5
				</span>
			</div>
			<div className="flex gap-1">
				{[0, 1, 2, 3, 4, 5].map((score) => (
					<button
						key={score}
						type="button"
						onClick={() => onChange(score)}
						className={`
							flex-1 h-8 rounded-md border font-['Figtree',sans-serif] text-sm font-medium
							transition-all duration-200 cursor-pointer
							${
								value === score
									? "bg-[#cbff1f] border-[#738f17] text-[#738f17] shadow-[0px_1px_0px_0px_#738f17]"
									: "bg-[#f5f5f5] border-[#e0e0e0] text-[#717171] hover:bg-[#eaeaea] hover:border-[#c4c4c4]"
							}
						`}
					>
						{score}
					</button>
				))}
			</div>
		</div>
	);
}

function RationaleItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="font-['Figtree',sans-serif] text-xs font-medium text-[#717171]">
				{label}
			</p>
			<p className="font-['Figtree',sans-serif] text-sm text-black/80 leading-relaxed">
				{value || <span className="text-[#bababa] italic">Not provided</span>}
			</p>
		</div>
	);
}

export function VotingModal({
	assignment,
	onClose,
	onSubmitVote,
	isSubmitting = false,
}: VotingModalProps) {
	const overlayRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const [showFullImage, setShowFullImage] = useState(false);

	// Extract submission data
	const { submission, existingVote } = assignment;

	const [scores, setScores] = useState<VoteScores>(
		existingVote ? apiVoteToScores(existingVote) : initialVoteScores,
	);

	// Entrance animation
	useEffect(() => {
		const tl = gsap.timeline();

		tl.fromTo(
			overlayRef.current,
			{ opacity: 0 },
			{ opacity: 1, duration: 0.2, ease: "power2.out" },
		);

		tl.fromTo(
			modalRef.current,
			{ opacity: 0, scale: 0.95, y: 20 },
			{ opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.4)" },
			"-=0.1",
		);

		return () => {
			tl.kill();
		};
	}, []);

	const handleClose = () => {
		const tl = gsap.timeline({
			onComplete: onClose,
		});

		tl.to(modalRef.current, {
			opacity: 0,
			scale: 0.95,
			y: 10,
			duration: 0.2,
			ease: "power2.in",
		});

		tl.to(
			overlayRef.current,
			{ opacity: 0, duration: 0.15, ease: "power2.in" },
			"-=0.1",
		);
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === overlayRef.current) {
			handleClose();
		}
	};

	const handleViewInFigma = () => {
		window.open(submission.figma_link, "_blank");
	};

	const handleSubmitVote = () => {
		onSubmitVote(submission.id, scores);
	};

	const updateScore = (key: keyof VoteScores, value: number) => {
		setScores((prev) => ({ ...prev, [key]: value }));
	};

	const allScoresSet =
		scores.problemFitScore > 0 &&
		scores.clarityScore > 0 &&
		scores.styleInterpretationScore > 0 &&
		scores.originalityScore > 0 &&
		scores.overallQualityScore > 0;

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
			onClick={handleOverlayClick}
			style={{ opacity: 0 }}
		>
			<div
				ref={modalRef}
				className="max-h-[90vh] overflow-y-auto"
				style={{ opacity: 0 }}
			>
				<Card animate={false} className="w-[520px] max-w-[calc(100vw-32px)]">
					<div className="flex flex-col gap-5">
						{/* Header */}
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-lg text-left">
									Vote on Submission
								</CardTitle>
								<CardDescription className="mt-1 text-left">
									Rate this design on each criterion (0-5)
								</CardDescription>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="text-[#bababa] hover:text-[#717171] transition-colors p-1 -mr-1 -mt-1"
								aria-label="Close voting modal"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Design Image - Clickable for full preview */}
						<div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#f5f5f5] border border-[rgba(64,64,64,0.31)]">
							{submission.design_image ? (
								<img
									src={submission.design_image}
									alt="Submission Design"
									className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
									onClick={() => setShowFullImage(true)}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-[#bababa] font-['Figtree',sans-serif] text-sm">
									No preview image
								</div>
							)}
						</div>

						{/* Full-screen image lightbox */}
						{showFullImage && submission.design_image && (
							<div
								className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
								onClick={() => setShowFullImage(false)}
							>
								<img
									src={submission.design_image}
									alt="Submission Design Full Preview"
									className="max-w-full max-h-full object-contain"
								/>
								<button
									type="button"
									onClick={() => setShowFullImage(false)}
									className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2"
									aria-label="Close full image preview"
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</div>
						)}

						{/* Design Rationale - Collapsible */}
						<details className="group">
							<summary className="font-['Figtree',sans-serif] font-semibold text-sm text-black cursor-pointer list-none flex items-center gap-2">
								<svg
									className="w-4 h-4 transition-transform group-open:rotate-90"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
								Design Rationale
							</summary>
							<div className="mt-3 space-y-3 pl-6">
								<RationaleItem
									label="Target User & Primary Goal"
									value={submission.target_user_and_goal}
								/>
								<RationaleItem
									label="Layout & Visual Hierarchy"
									value={submission.layout_explanation}
								/>
								<RationaleItem
									label="Design Style Interpretation"
									value={submission.style_interpretation}
								/>
								<RationaleItem
									label="Key Design Trade-Off"
									value={submission.key_trade_off}
								/>
								{submission.future_improvements && (
									<RationaleItem
										label="Future Improvements"
										value={submission.future_improvements}
									/>
								)}
							</div>
						</details>

						{/* Scoring Section */}
						<div className="space-y-4 pt-2 border-t border-[#e0e0e0]">
							<h3 className="font-['Figtree',sans-serif] font-semibold text-sm text-black">
								Your Scores
							</h3>

							<div className="space-y-4">
								<ScoreInput
									label="Problem Fit"
									description="How well does the design solve the stated problem?"
									value={scores.problemFitScore}
									onChange={(v) => updateScore("problemFitScore", v)}
								/>
								<ScoreInput
									label="Clarity"
									description="How clear and understandable is the design?"
									value={scores.clarityScore}
									onChange={(v) => updateScore("clarityScore", v)}
								/>
								<ScoreInput
									label="Style Interpretation"
									description="How well does it interpret the design style?"
									value={scores.styleInterpretationScore}
									onChange={(v) => updateScore("styleInterpretationScore", v)}
								/>
								<ScoreInput
									label="Originality"
									description="How creative and unique is the approach?"
									value={scores.originalityScore}
									onChange={(v) => updateScore("originalityScore", v)}
								/>
								<ScoreInput
									label="Overall Quality"
									description="Your overall impression of the design"
									value={scores.overallQualityScore}
									onChange={(v) => updateScore("overallQualityScore", v)}
								/>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3 pt-2">
							<Button
								variant="secondary"
								onClick={handleViewInFigma}
								className="flex-1"
							>
								View in Figma
							</Button>
							<Button
								variant="primary"
								onClick={handleSubmitVote}
								disabled={!allScoresSet}
								isLoading={isSubmitting}
								className="flex-1"
							>
								{existingVote ? "Update Vote" : "Submit Vote"}
							</Button>
						</div>

						{!allScoresSet && (
							<p className="font-['Figtree',sans-serif] text-xs text-[#a22121] text-center">
								Please rate all criteria (1-5) before submitting
							</p>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
