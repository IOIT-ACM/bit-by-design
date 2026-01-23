import { useRef, useEffect } from "react";
import gsap from "gsap";
import {
	Card,
	CardTitle,
	CardDescription,
	CountdownTimer,
	CountdownLabels,
} from "../ui";
import { CheckIcon } from "../icons";

interface SubmissionsClosedViewProps {
	hours: number;
	minutes: number;
	seconds: number;
	hasSubmission: boolean;
}

/**
 * View shown after submissions close but before voting starts.
 * Shows user's submission status and countdown to voting.
 */
export function SubmissionsClosedView({
	hours,
	minutes,
	seconds,
	hasSubmission,
}: SubmissionsClosedViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const countdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const tl = gsap.timeline();

		tl.fromTo(
			containerRef.current,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
		);

		tl.fromTo(
			cardRef.current,
			{ opacity: 0, scale: 0.95 },
			{ opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
			"-=0.2",
		);

		tl.fromTo(
			countdownRef.current,
			{ opacity: 0, y: 10 },
			{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
			"-=0.2",
		);
	}, []);

	return (
		<div
			ref={containerRef}
			className="flex flex-col items-center gap-8"
			style={{ opacity: 0 }}
		>
			{/* Status Card */}
			<div ref={cardRef} style={{ opacity: 0 }}>
				<Card animate={false} className="w-[380px] max-w-[calc(100vw-32px)]">
					<div className="flex flex-col items-center gap-4 text-center">
						{hasSubmission ? (
							<>
								<div className="w-12 h-12 rounded-full bg-[#f0ffd9] border border-[#738f17]/30 flex items-center justify-center">
									<CheckIcon size={24} className="text-[#738f17]" />
								</div>
								<div>
									<CardTitle className="text-lg">
										Submission Received!
									</CardTitle>
									<CardDescription className="mt-2">
										Your design has been submitted successfully. Sit tight while
										we wait for all participants to finish submitting.
									</CardDescription>
								</div>
							</>
						) : (
							<>
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
									<CardTitle className="text-lg">Submissions Closed</CardTitle>
									<CardDescription className="mt-2">
										Unfortunately, the submission period has ended. You can
										still participate in voting once it begins.
									</CardDescription>
								</div>
							</>
						)}
					</div>
				</Card>
			</div>

			{/* Countdown to voting */}
			<div ref={countdownRef} className="text-center" style={{ opacity: 0 }}>
				<p className="font-['Figtree',sans-serif] font-normal text-xl sm:text-2xl text-white mb-4">
					Voting begins in
				</p>
				<CountdownTimer hours={hours} minutes={minutes} seconds={seconds} />
				<CountdownLabels />
			</div>
		</div>
	);
}
