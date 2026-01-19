import type { IconProps } from "./types";

export function CheckIcon({ className = "", size = 16 }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M20 6L9 17l-5-5" />
		</svg>
	);
}
