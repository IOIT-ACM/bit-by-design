import { Card, CardTitle, CardDescription } from "../ui";

interface VotingNotEligibleViewProps {
	timeRemaining: string;
}

/**
 * View shown during voting period for users who didn't submit.
 * They are not eligible to vote.
 */
export function VotingNotEligibleView({
	timeRemaining,
}: VotingNotEligibleViewProps) {
	return (
		<div className="flex flex-col items-center gap-6">
			<Card animate={false} className="w-95 max-w-[calc(100vw-32px)]">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-12 h-12 rounded-full bg-[#fff5f5] border border-[#a22121]/30 flex items-center justify-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#a22121"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
					</div>
					<div>
						<CardTitle className="text-lg">Voting Unavailable</CardTitle>
						<CardDescription className="mt-2">
							You didn't submit during the submission period, so you aren't
							eligible to vote in this competition.
						</CardDescription>
					</div>
				</div>
			</Card>

			<p className="font-['Figtree',sans-serif] font-normal text-sm text-white/80">
				Voting ends in{" "}
				<span className="font-medium text-white">{timeRemaining}</span>
			</p>
		</div>
	);
}
