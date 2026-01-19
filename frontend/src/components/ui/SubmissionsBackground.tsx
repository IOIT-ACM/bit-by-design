import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Animated background with infinite "SUBMISSIONS OPEN" text pattern
 * Rows scroll horizontally in alternating directions (infinite marquee)
 * Typography: Figtree 256px, italic, 800 weight, uppercase
 */
export function SubmissionsBackground() {
	const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Text block width including gap (measured/estimated)
	// "SUBMISSIONS OPEN" at 256px + 120px gap ≈ 2100px per block
	const textBlockWidth = 2100;

	useEffect(() => {
		const animations: gsap.core.Tween[] = [];

		rowRefs.current.forEach((row, i) => {
			if (!row) return;

			// Alternating directions: even rows go left, odd rows go right
			const direction = i % 2 === 0 ? -1 : 1;

			// For seamless loop: animate exactly one text block width
			// Start position and end position differ by exactly textBlockWidth
			const startX = direction === -1 ? 0 : -textBlockWidth;
			const endX = direction === -1 ? -textBlockWidth : 0;

			// Set initial position
			gsap.set(row, { x: startX });

			// Create infinite horizontal scroll - very slow and subtle
			const anim = gsap.to(row, {
				x: endX,
				duration: 80 + i * 5, // Much slower: 80-125 seconds per cycle
				ease: "none",
				repeat: -1,
			});

			animations.push(anim);
		});

		return () => {
			animations.forEach((anim) => anim.kill());
		};
	}, [textBlockWidth]);

	// Generate rows of "SUBMISSIONS OPEN" text
	// Pattern settings: Y spacing -29%
	// Using fixed values to maintain consistent spacing across screen sizes
	const fontSize = 256; // Fixed font size in pixels
	const lineHeight = fontSize * 1.16694; // 116.694% line height
	const rowSpacing = lineHeight * -0.29; // -29% of line height
	const rowCount = 10;
	const textGap = 120; // Gap between text repetitions in pixels

	const rows = Array.from({ length: rowCount }, (_, i) => (
		<div
			key={i}
			ref={(el) => {
				rowRefs.current[i] = el;
			}}
			className="whitespace-nowrap flex"
			style={{
				// Fixed pixel spacing between rows
				marginTop: i === 0 ? 0 : `${rowSpacing}px`,
			}}
		>
			{/* Duplicate content for seamless infinite scroll - need enough to fill screen + one extra for loop */}
			{Array.from({ length: 6 }, (_, j) => (
				<span
					key={j}
					className="font-['Figtree',sans-serif] italic inline-block shrink-0"
					style={{
						color: "rgba(255, 255, 255, 0.03)",
						fontSize: `${fontSize}px`,
						fontWeight: 800,
						lineHeight: "116.694%",
						letterSpacing: "-0.04em",
						textTransform: "uppercase",
						marginRight: `${textGap}px`,
					}}
				>
					SUBMISSIONS OPEN
				</span>
			))}
		</div>
	));

	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
			<div className="absolute -inset-[100px] flex flex-col justify-center">
				{rows}
			</div>
		</div>
	);
}
