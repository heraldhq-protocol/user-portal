import type { Metadata } from "next";
import UnsubscribePage from "./page.client";

export const metadata: Metadata = {
	title: "Unsubscribe",
	description: "Unsubscribe from Herald notifications for your wallet.",
	openGraph: {
		title: "Unsubscribe | Herald",
		description: "Manage your notification preferences and unsubscribe from DeFi alerts.",
		images: [{ url: "/api/og?title=Unsubscribe&subtitle=Manage+Preferences&description=Unsubscribe+from+Herald+notifications+for+your+wallet.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=Unsubscribe&subtitle=Manage+Preferences&description=Unsubscribe+from+Herald+notifications+for+your+wallet."],
	},
};

export default function Page() {
	return <UnsubscribePage />;
}
