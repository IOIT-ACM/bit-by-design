import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layouts";
import { SubmissionsBackground } from "../components/ui";
import {
	CountdownView,
	CompetitionOverView,
	SubmissionsOpenView,
} from "../components/views";
import { useCountdown } from "../hooks";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { hours, minutes, seconds, isLoading, state, label } = useCountdown();

	// Determine background based on state
	const background =
		state === "submissions_open" ? <SubmissionsBackground /> : undefined;

	// Render appropriate view based on competition state
	const renderContent = () => {
		if (isLoading) {
			return (
				<CountdownView
					label="Loading..."
					hours={0}
					minutes={0}
					seconds={0}
					isLoading
				/>
			);
		}

		switch (state) {
			case "competition_over":
				return <CompetitionOverView />;

			case "submissions_open":
				return <SubmissionsOpenView hours={hours} minutes={minutes} />;

			case "voting_open":
			case "waiting_for_submissions":
			default:
				return (
					<CountdownView
						label={label}
						hours={hours}
						minutes={minutes}
						seconds={seconds}
					/>
				);
		}
	};

	return (
		<DashboardLayout background={background}>{renderContent()}</DashboardLayout>
	);
}
