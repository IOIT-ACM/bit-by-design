import { forwardRef } from "react";

interface TimeSegmentProps {
	value: number;
	label: string;
}

function TimeSegment({ value }: Omit<TimeSegmentProps, "label">) {
	const formatted = value.toString().padStart(2, "0");
	return (
		<span className="inline-block w-[1.2em] text-center">{formatted}</span>
	);
}

function TimeSeparator() {
	return <span className="mx-1 sm:mx-2">:</span>;
}

interface CountdownTimerProps {
	hours: number;
	minutes: number;
	seconds: number;
	isLoading?: boolean;
	style?: React.CSSProperties;
}

export const CountdownTimer = forwardRef<HTMLDivElement, CountdownTimerProps>(
	function CountdownTimer(
		{ hours, minutes, seconds, isLoading = false, style },
		ref,
	) {
		return (
			<div
				ref={ref}
				className="font-['Figtree',sans-serif] font-medium text-5xl sm:text-7xl md:text-[100px] lg:text-[128px] text-white leading-none tabular-nums"
				style={style}
			>
				{isLoading ? (
					<span className="text-[#7e7e7e]">--:--:--</span>
				) : (
					<>
						<TimeSegment value={hours} />
						<TimeSeparator />
						<TimeSegment value={minutes} />
						<TimeSeparator />
						<TimeSegment value={seconds} />
					</>
				)}
			</div>
		);
	},
);

const LABELS = ["Hours", "Minutes", "Seconds"] as const;

interface CountdownLabelsProps {
	style?: React.CSSProperties;
}

export const CountdownLabels = forwardRef<HTMLDivElement, CountdownLabelsProps>(
	function CountdownLabels({ style }, ref) {
		return (
			<div
				ref={ref}
				className="flex justify-between mt-2 sm:mt-4 font-['Figtree',sans-serif] font-medium text-sm sm:text-lg md:text-[24px] text-white max-w-[280px] sm:max-w-[400px] md:max-w-[600px] mx-auto"
				style={style}
			>
				{LABELS.map((label) => (
					<span key={label} className="flex-1 text-center">
						{label}
					</span>
				))}
			</div>
		);
	},
);
