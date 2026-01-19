///<reference types="@rsbuild/core/types" />
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AppLayout } from "../components";

const queryClient = new QueryClient();

const RootLayout = () => (
	<QueryClientProvider client={queryClient}>
		<AppLayout>
			<Outlet />
		</AppLayout>
		<TanStackRouterDevtools />
	</QueryClientProvider>
);

export const Route = createRootRoute({
	component: RootLayout,
});
