import { type ReactNode, useRef, useEffect } from "react";
import gsap from "gsap";
import { Link } from "@tanstack/react-router";
import { AcmLogo, BitByDesignLogo } from "../logos";

interface AppLayoutProps {
	children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	const leftLogoRef = useRef<HTMLAnchorElement>(null);
	const rightLogoRef = useRef<HTMLAnchorElement>(null);
	const glowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Staggered logo entrance
		const tl = gsap.timeline();

		tl.fromTo(
			leftLogoRef.current,
			{ opacity: 0, x: -20 },
			{ opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
		);

		tl.fromTo(
			rightLogoRef.current,
			{ opacity: 0, x: 20 },
			{ opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
			"-=0.4",
		);

		// Subtle glow pulse animation
		if (glowRef.current) {
			gsap.to(glowRef.current, {
				opacity: 0.7,
				scale: 1.1,
				duration: 3,
				ease: "sine.inOut",
				repeat: -1,
				yoyo: true,
			});
		}
	}, []);

	return (
		<div className="bg-[#101010] min-h-screen w-full relative overflow-hidden">
			{/* Subtle gradient background */}
			<div className="absolute inset-0 bg-linear-to-br from-[#101010] via-[#151515] to-[#101010] pointer-events-none" />

			{/* Subtle animated glow effect */}
			<div
				ref={glowRef}
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#cbff1f]/5 rounded-full blur-3xl pointer-events-none"
				style={{ opacity: 0.5 }}
			/>

			{/* Top left logo - links to home */}
			<Link
				to="/"
				ref={leftLogoRef}
				className="absolute top-4 left-4 sm:top-8 sm:left-12 z-10 cursor-pointer hover:opacity-80 transition-opacity scale-75 sm:scale-100 origin-top-left"
				style={{ opacity: 0 }}
			>
				<BitByDesignLogo />
			</Link>

			{/* Top right logo - links to ACM */}
			<a
				href="https://ioit.acm.org"
				target="_blank"
				rel="noopener noreferrer"
				ref={rightLogoRef}
				className="absolute top-4 right-4 sm:top-8 sm:right-12 z-10 cursor-pointer hover:opacity-80 transition-opacity scale-75 sm:scale-100 origin-top-right"
				style={{ opacity: 0 }}
			>
				<AcmLogo />
			</a>

			{/* Main content */}
			<div className="relative min-h-screen">{children}</div>
		</div>
	);
}
