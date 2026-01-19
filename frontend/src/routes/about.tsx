import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui";

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
	const navigate = useNavigate();

	return (
		<div className="flex items-center justify-center min-h-screen px-4">
			<div className="text-center max-w-2xl">
				<h1 className="text-4xl font-bold text-white mb-4">About</h1>
				<p className="text-[#717171] mb-8">
					Bit by Design is a design competition hosted by ACM at CSUF. Submit
					your best work and let the community vote on their favorites.
				</p>
				<Button variant="secondary" onClick={() => navigate({ to: "/" })}>
					Back to Home
				</Button>
			</div>
		</div>
	);
}
