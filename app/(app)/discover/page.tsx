import type { Metadata } from "next";
import DiscoverPageClient from "./page.client";

export const metadata: Metadata = {
	title: "Discover Protocols · Herald",
	description: "Browse and subscribe to Herald-integrated protocols",
};

export default function DiscoverPage() {
	return <DiscoverPageClient />;
}
