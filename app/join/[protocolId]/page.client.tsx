"use client";

import { RegistrationWizard } from "@/components/registration/RegistrationWizard";

interface Protocol {
	name?: string;
	logoUrl?: string | null;
	websiteUrl?: string | null;
	notificationCategories?: string[];
}

export function JoinPage({ protocol, protocolId }: { protocol: Protocol | null; protocolId: string }) {
	return (
		<div className="flex items-center justify-center min-h-dvh px-4 sm:px-6 py-12 sm:py-16">
			<RegistrationWizard
				protocolContext={
					protocol
						? { name: protocol.name, logoUrl: protocol.logoUrl, protocolId }
						: { protocolId }
				}
			/>
		</div>
	);
}
