import { useRef, useEffect } from "react";
import gsap from "gsap";
import { CountdownTimer, CountdownLabels } from "../ui";

interface CountdownViewProps {
	label: string;
	hours: number;
	minutes: number;
	seconds: number;
	isLoading?: boolean;
}

/**
 * Countdown view for waiting/voting states
 * Shows the countdown timer with label
 */
export function CountdownView({
	label,
	hours,
	minutes,
	seconds,
	isLoading = false,
}: CountdownViewProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<HTMLDivElement>(null);
	const labelsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const tl = gsap.timeline();

		tl.fromTo(
			contentRef.current,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
		);

		tl.fromTo(
			timerRef.current,
			{ opacity: 0, scale: 0.95 },
			{ opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
			"-=0.3",
		);

		tl.fromTo(
			labelsRef.current,
			{ opacity: 0 },
			{ opacity: 1, duration: 0.4, ease: "power2.out" },
			"-=0.2",
		);
	}, []);

	return (
		<div ref={contentRef} className="text-center" style={{ opacity: 0 }}>
			<p className="font-['Figtree',sans-serif] font-normal text-xl sm:text-2xl md:text-[32px] text-white mb-4 sm:mb-6">
				{label}
			</p>

			<CountdownTimer
				ref={timerRef}
				hours={hours}
				minutes={minutes}
				seconds={seconds}
				isLoading={isLoading}
				style={{ opacity: 0 }}
			/>

			<CountdownLabels ref={labelsRef} style={{ opacity: 0 }} />
		</div>
	);
}
