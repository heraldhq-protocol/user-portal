import type { Metadata } from "next";
import NotificationsPage from "./page.client";

export const metadata: Metadata = {
	title: "Notifications",
	description: "View and manage your DeFi notification alerts.",
	openGraph: {
		title: "Notifications | Herald",
		description: "View and manage your DeFi notification alerts.",
		images: [{ url: "/api/og?title=Notifications&subtitle=Your+Alerts&description=View+and+manage+your+DeFi+notification+alerts.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=Notifications&subtitle=Your+Alerts&description=View+and+manage+your+DeFi+notification+alerts."],
	},
};

export default function Page() {
	return <NotificationsPage />;
}
