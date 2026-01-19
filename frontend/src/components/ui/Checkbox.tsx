import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { CheckIcon } from "../icons";

interface CheckboxProps extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"type"
> {
	label: string;
	error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	function Checkbox({ label, error = false, className = "", ...props }, ref) {
		const id = useId();
		const isChecked = props.checked ?? false;

		return (
			<label
				htmlFor={id}
				className={`flex items-start gap-3 cursor-pointer group ${className}`}
			>
				<div className="relative flex-shrink-0 mt-0.5">
					<input
						ref={ref}
						id={id}
						type="checkbox"
						className="peer sr-only"
						{...props}
					/>
					{/* Custom checkbox */}
					<div
						className={`
							w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center
							transition-all duration-200 ease-out
							${
								error
									? "border-[#a22121] bg-[#fef2f2]"
									: isChecked
										? "bg-[#cbff1f] border-[#738f17]"
										: "border-[rgba(64,64,64,0.4)] bg-white group-hover:border-[#738f17]"
							}
							peer-focus-visible:ring-2 peer-focus-visible:ring-[rgba(203,255,31,0.4)]
							peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
						`}
					>
						{isChecked && <CheckIcon size={12} className="text-[#738f17]" />}
					</div>
				</div>
				<span
					className={`
						font-['Figtree',sans-serif] text-sm leading-snug select-none
						${error ? "text-[#a22121]" : "text-[rgba(0,0,0,0.71)]"}
					`}
				>
					{label}
				</span>
			</label>
		);
	},
);
