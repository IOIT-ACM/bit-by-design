import { useRef, useState, useCallback, type DragEvent } from "react";
import { UploadIcon, EditIcon, PreviewIcon } from "../icons";

interface FileUploadProps {
	value?: File | null;
	onChange?: (file: File | null) => void;
	accept?: string;
	disabled?: boolean;
	error?: boolean;
	previewUrl?: string;
	className?: string;
}

export function FileUpload({
	value,
	onChange,
	accept = "image/png,image/jpeg",
	disabled = false,
	error = false,
	previewUrl,
	className = "",
}: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [localPreview, setLocalPreview] = useState<string | null>(null);

	const preview = previewUrl || localPreview;

	const handleFileChange = useCallback(
		(file: File | null) => {
			if (file && localPreview) {
				URL.revokeObjectURL(localPreview);
			}

			if (file) {
				const url = URL.createObjectURL(file);
				setLocalPreview(url);
			} else {
				setLocalPreview(null);
			}

			onChange?.(file);
		},
		[localPreview, onChange],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		handleFileChange(file);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		if (disabled) return;

		const file = e.dataTransfer.files?.[0];
		if (file && accept.includes(file.type)) {
			handleFileChange(file);
		}
	};

	const handleClick = () => {
		if (!disabled) {
			inputRef.current?.click();
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		handleFileChange(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const hasFile = value || preview;

	return (
		<div className={className}>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				onChange={handleInputChange}
				disabled={disabled}
				className="sr-only"
				aria-label="Upload file"
			/>

			<div
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				role="button"
				tabIndex={disabled ? -1 : 0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
				className={`
					relative h-[78px] w-full rounded-[10px] border overflow-hidden
					transition-all duration-200 ease-out cursor-pointer
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(203,255,31,0.4)]
					${
						error
							? "border-[#a22121] shadow-[0px_1px_0px_0px_#a22121]"
							: isDragOver
								? "border-[#738f17] bg-[rgba(203,255,31,0.05)] shadow-[0px_1px_0px_0px_#738f17]"
								: "border-[rgba(64,64,64,0.31)] shadow-[0px_1px_0px_0px_rgba(114,114,114,0.24)]"
					}
					${disabled ? "opacity-50 cursor-not-allowed" : ""}
					${hasFile ? "bg-black/40" : "bg-white"}
				`}
			>
				{hasFile && preview ? (
					<>
						{/* Image preview */}
						<img
							src={preview}
							alt="Upload preview"
							className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
						/>
						{/* Overlay */}
						<div className="absolute inset-0 bg-black/40 animate-in fade-in duration-300" />
						{/* Action buttons */}
						<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									if (preview) {
										window.open(preview, "_blank");
									}
								}}
								className="h-[26px] w-[34px] bg-white border border-[#cbcbcb] border-r-0 rounded-l-[10px] shadow-[0px_1px_0px_0px_#cbcbcb] flex items-center justify-center hover:bg-gray-50 transition-colors"
								aria-label="Preview image"
							>
								<PreviewIcon className="text-[#666]" />
							</button>
							<button
								type="button"
								onClick={handleClick}
								className="h-[26px] w-[34px] bg-white border border-[#cbcbcb] rounded-r-[10px] shadow-[0px_1px_0px_0px_#cbcbcb] flex items-center justify-center hover:bg-gray-50 transition-colors"
								aria-label="Change image"
							>
								<EditIcon className="text-[#666]" />
							</button>
						</div>
					</>
				) : (
					<div className="flex flex-col items-center justify-center h-full gap-1">
						<UploadIcon
							size={24}
							className={error ? "text-[#a22121]" : "text-[#bababa]"}
						/>
						<span
							className={`
								font-['Figtree',sans-serif] font-medium text-[11px] tracking-[-0.44px]
								${error ? "text-[#a22121]" : "text-[#bababa]"}
							`}
						>
							Drag & Drop or Click to browse
						</span>
					</div>
				)}
			</div>

			{/* File name display */}
			{value && (
				<div className="mt-2 flex items-center justify-between">
					<span className="font-['Figtree',sans-serif] text-xs text-[#717171] truncate max-w-[200px]">
						{value.name}
					</span>
					<button
						type="button"
						onClick={handleRemove}
						className="text-xs text-[#a22121] hover:underline font-['Figtree',sans-serif]"
					>
						Remove
					</button>
				</div>
			)}
		</div>
	);
}
