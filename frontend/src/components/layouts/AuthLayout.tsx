import { type ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

/**
 * AuthLayout centers content vertically and horizontally.
 * Used for login, register, and other auth pages.
 * Note: AppLayout provides the logos and background.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex items-center justify-center min-h-screen px-4">
			{children}
		</div>
	);
}
