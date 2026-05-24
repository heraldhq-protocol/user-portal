"use client";

import { RegistrationWizard } from "@/components/registration/RegistrationWizard";

interface Protocol {
	name?: string;
	logoUrl?: string | null;
	websiteUrl?: string | null;
	notificationCategories?: string[];
}

export function JoinPage({ protocol }: { protocol: Protocol | null }) {
	return (
		<div className="flex items-center justify-center min-h-dvh px-6 py-16">
			<RegistrationWizard
				protocolContext={
					protocol
						? { name: protocol.name, logoUrl: protocol.logoUrl }
						: undefined
				}
			/>
		</div>
	);
}
