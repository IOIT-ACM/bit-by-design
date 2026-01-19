import type { IconProps } from "./types";

export function PreviewIcon({ className = "", size = 13 }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}
