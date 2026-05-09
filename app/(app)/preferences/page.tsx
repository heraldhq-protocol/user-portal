import type { Metadata } from "next";
import PreferencesPage from "./page.client";

export const metadata: Metadata = {
	title: "Preferences",
	description: "Customize your notification preferences for email, SMS, and Telegram channels.",
	openGraph: {
		title: "Preferences | Herald",
		description: "Customize your notification preferences for email, SMS, and Telegram channels.",
		images: [{ url: "/api/og?title=Preferences&subtitle=Notification+Settings&description=Customize+your+notification+preferences+for+email%2C+SMS%2C+and+Telegram+channels.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=Preferences&subtitle=Notification+Settings&description=Customize+your+notification+preferences+for+email%2C+SMS%2C+and+Telegram+channels."],
	},
};

export default function Page() {
	return <PreferencesPage />;
}
