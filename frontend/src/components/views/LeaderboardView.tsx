import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
	useLeaderboard,
	type LeaderboardEntry,
	useSubmission,
} from "../../api";
import { Card, Button, Spinner } from "../ui";
import type { SubmissionResponse } from "../../api/submissions";

interface LeaderboardViewProps {
	showLeaderboard: boolean;
}

/**
 * Leaderboard view - shows final scores when competition is over
 * and show_leaderboard is enabled in config
 */
export function LeaderboardView({ showLeaderboard }: LeaderboardViewProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const {
		data: leaderboard,
		isLoading,
		error,
	} = useLeaderboard(showLeaderboard);
	const [selectedScore, setSelectedScore] = useState<LeaderboardEntry | null>(
		null,
	);

	useEffect(() => {
		if (contentRef.current) {
			gsap.fromTo(
				contentRef.current,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
			);
		}
	}, []);

	// Animate items when they load
	useEffect(() => {
		if (leaderboard && leaderboard.length > 0) {
			gsap.fromTo(
				".leaderboard-item",
				{ opacity: 0, x: -20 },
				{ opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
			);
		}
	}, [leaderboard]);

	if (!showLeaderboard) {
		return (
			<div ref={contentRef} className="text-center" style={{ opacity: 0 }}>
				<p className="font-['Figtree',sans-serif] font-normal text-xl sm:text-2xl md:text-[32px] text-white mb-4 sm:mb-6">
					Competition has ended!
				</p>
				<p className="font-['Figtree',sans-serif] text-lg text-white/70">
					Leaderboard will be available soon...
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div ref={contentRef} className="text-center" style={{ opacity: 0 }}>
				<p className="font-['Figtree',sans-serif] text-lg text-white/70">
					Loading leaderboard...
				</p>
			</div>
		);
	}

	if (error || !leaderboard) {
		return (
			<div ref={contentRef} className="text-center" style={{ opacity: 0 }}>
				<p className="font-['Figtree',sans-serif] font-normal text-xl sm:text-2xl md:text-[32px] text-white mb-4 sm:mb-6">
					Competition has ended!
				</p>
				<p className="font-['Figtree',sans-serif] text-lg text-white/70">
					Unable to load leaderboard. Please try again later.
				</p>
			</div>
		);
	}

	// Sort by final_score descending
	const sortedLeaderboard = [...leaderboard].sort(
		(a, b) => b.final_score - a.final_score,
	);

	return (
		<>
			<div
				ref={contentRef}
				className="w-full max-w-md mx-auto px-4"
				style={{ opacity: 0 }}
			>
				{/* Header */}
				<div className="text-center mb-6 sm:mb-8">
					<h1 className="font-['Figtree',sans-serif] font-semibold text-2xl sm:text-3xl md:text-4xl text-white mb-2">
						Final Leaderboard
					</h1>
					<p className="font-['Figtree',sans-serif] text-sm sm:text-base text-white/60">
						The Competition results are in
					</p>
				</div>

				{/* Leaderboard Card */}
				<div className="bg-white border border-[#202020] rounded-[13px] p-4 max-h-[400px] overflow-y-auto">
					{/* Column Headers */}
					<div className="flex items-center justify-between px-2 mb-3">
						<span className="font-['Figtree',sans-serif] font-extrabold text-[13px] text-black uppercase">
							RANK
						</span>
						<span className="font-['Figtree',sans-serif] font-extrabold text-[13px] text-black uppercase">
							SCORE
						</span>
					</div>

					{sortedLeaderboard.length === 0 ? (
						<div className="text-center py-8">
							<p className="font-['Figtree',sans-serif] text-sm text-[#bababa]">
								No scores available yet.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-[9px]">
							{sortedLeaderboard.map((entry, index) => (
								<LeaderboardItem
									key={entry.id}
									rank={index + 1}
									entry={entry}
									onClick={() => setSelectedScore(entry)}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Submission Preview Modal */}
			{selectedScore && (
				<SubmissionPreviewModal
					score={selectedScore}
					onClose={() => setSelectedScore(null)}
				/>
			)}
		</>
	);
}

interface LeaderboardItemProps {
	rank: number;
	entry: LeaderboardEntry;
	onClick: () => void;
}

function LeaderboardItem({ rank, entry, onClick }: LeaderboardItemProps) {
	const getStyles = () => {
		switch (rank) {
			case 1:
				return {
					bg: "bg-[#cbff1f]",
					border: "border-[rgba(0,0,0,0.42)]",
					shadow: "shadow-[0px_1px_0px_0px_#738f17]",
					text: "text-[#738f17]",
				};
			case 2:
				return {
					bg: "bg-[#dadada]",
					border: "border-[#8b8b8b]",
					shadow: "shadow-[0px_1px_0px_0px_#8b8b8b]",
					text: "text-[#8b8b8b]",
				};
			case 3:
				return {
					bg: "bg-[#916a23]",
					border: "border-[#5e3913]",
					shadow: "shadow-[0px_1px_0px_0px_#5e3913]",
					text: "text-[#5e3913]",
				};
			default:
				return {
					bg: "bg-[#ebebeb]",
					border: "border-[#3d3d3d]",
					shadow: "shadow-[0px_1px_0px_0px_#3d3d3d]",
					text: "text-[#3d3d3d]",
				};
		}
	};

	const getRankDisplay = () => {
		switch (rank) {
			case 1:
				return "🥇";
			case 2:
				return "🥈";
			case 3:
				return "🥉";
			default:
				return rank.toString();
		}
	};

	const styles = getStyles();

	return (
		<button
			type="button"
			onClick={onClick}
			className={`leaderboard-item w-full flex items-center justify-between px-4 h-[51px] rounded-[7px] border ${styles.bg} ${styles.border} ${styles.shadow} transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
			style={{ opacity: 0 }}
		>
			<div className="flex items-center gap-3">
				<span
					className={`font-['Figtree',sans-serif] text-[24px] text-center w-6 ${rank > 3 ? `font-medium text-[20px] ${styles.text}` : ""}`}
				>
					{getRankDisplay()}
				</span>
				<span
					className={`font-['Figtree',sans-serif] font-medium text-[20px] ${styles.text}`}
				>
					{entry.user_name}
				</span>
			</div>
			<span
				className={`font-['Figtree',sans-serif] font-medium text-[20px] ${styles.text}`}
			>
				{entry.final_score}
			</span>
		</button>
	);
}

interface SubmissionPreviewModalProps {
	score: LeaderboardEntry;
	onClose: () => void;
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

function SubmissionPreviewModal({
	score,
	onClose,
}: SubmissionPreviewModalProps) {
	const overlayRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const [showFullImage, setShowFullImage] = useState(false);

	// Fetch submission on-demand when modal opens
	const { data: submission, isLoading: submissionLoading } = useSubmission(
		score.submission_id,
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
		if (submission?.figma_link) {
			window.open(submission.figma_link, "_blank");
		}
	};

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
								<h2 className="font-['Figtree',sans-serif] font-semibold text-lg text-black text-left">
									Submission Preview
								</h2>
								<p className="font-['Figtree',sans-serif] text-sm text-[#717171] mt-1 text-left">
									Final Score:{" "}
									<span className="font-semibold text-[#738f17]">
										{score.final_score}
									</span>
								</p>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="text-[#bababa] hover:text-[#717171] transition-colors p-1 -mr-1 -mt-1"
								aria-label="Close preview modal"
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

						{/* Loading State */}
						{submissionLoading && (
							<div className="flex items-center justify-center py-12">
								<Spinner className="text-[#cbff1f]" size="md" />
							</div>
						)}

						{/* Content - only show when submission is loaded */}
						{!submissionLoading && submission && (
							<>
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
							</>
						)}

						{/* Score Breakdown */}
						<div className="p-3 rounded-lg bg-[#f5f5f5] border border-[#e0e0e0]">
							<h3 className="font-['Figtree',sans-serif] font-semibold text-sm text-black mb-2">
								Score Breakdown
							</h3>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div className="flex justify-between">
									<span className="text-[#717171]">Problem Fit:</span>
									<span className="font-medium text-black">
										{score.problem_fit_score}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[#717171]">Visual Clarity:</span>
									<span className="font-medium text-black">
										{score.visual_clarity_score}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[#717171]">Style Interpretation:</span>
									<span className="font-medium text-black">
										{score.style_interpretation_score}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[#717171]">Originality:</span>
									<span className="font-medium text-black">
										{score.originality_score}
									</span>
								</div>
								<div className="flex justify-between col-span-2">
									<span className="text-[#717171]">Overall Quality:</span>
									<span className="font-medium text-black">
										{score.overall_quality_score}
									</span>
								</div>
							</div>
						</div>

						{/* Design Rationale - Collapsible */}
						{submission && (
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
						)}

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
								onClick={handleClose}
								className="flex-1"
							>
								Close
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
