import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Competition over view - placeholder for leaderboard
 */
export function CompetitionOverView() {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		gsap.fromTo(
			contentRef.current,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
		);
	}, []);

	return (
		<div ref={contentRef} className="text-center" style={{ opacity: 0 }}>
			<p className="font-['Figtree',sans-serif] font-normal text-xl sm:text-2xl md:text-[32px] text-white mb-4 sm:mb-6">
				Competition has ended!
			</p>
			<p className="font-['Figtree',sans-serif] text-lg text-white/70">
				Leaderboard coming soon...
			</p>
		</div>
	);
}
