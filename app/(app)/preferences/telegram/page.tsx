import type { Metadata } from "next";
import TelegramPreferencesPage from "./page.client";

export const metadata: Metadata = {
	title: "Telegram Preferences",
	description: "Configure your Telegram notification preferences for DeFi alerts.",
	openGraph: {
		title: "Telegram Preferences | Herald",
		description: "Configure your Telegram notification preferences for DeFi alerts.",
		images: [{ url: "/api/og?title=Telegram+Preferences&subtitle=Telegram+Settings&description=Configure+your+Telegram+notification+preferences+for+DeFi+alerts.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=Telegram+Preferences&subtitle=Telegram+Settings&description=Configure+your+Telegram+notification+preferences+for+DeFi+alerts."],
	},
};

export default function Page() {
	return <TelegramPreferencesPage />;
}
