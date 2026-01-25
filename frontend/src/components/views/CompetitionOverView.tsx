import { LeaderboardView } from "./LeaderboardView";

interface CompetitionOverViewProps {
	showLeaderboard: boolean;
}

/**
 * Competition over view - shows leaderboard when enabled
 */
export function CompetitionOverView({
	showLeaderboard,
}: CompetitionOverViewProps) {
	return <LeaderboardView showLeaderboard={showLeaderboard} />;
}
