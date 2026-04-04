"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function SponsorsBanner() {
	const sponsors = [
		{
			name: "Superteam",
			logo: "https://de.superteam.fun/st-flag-logo.png",
			tier: "Ecosystem Partner",
		},
		{
			name: "Solana Foundation",
			logo: "https://solana.org/pages/branding/logotype/logo.png",
			tier: "Founding Sponsor",
		},
	];

	const isPlaceholder = sponsors[0].name === "Your Logo Here";

	return (
		<section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
			<div className="max-w-[1100px] mx-auto px-4 sm:px-6">
				<div className="text-center mb-8">
					<span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
						{isPlaceholder ? "Seeking Founding Sponsors" : "Backed By"}
					</span>
				</div>

				{isPlaceholder ? (
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<a
							href="mailto:partnerships@herald.xyz"
							className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25"
						>
							Become a Sponsor
						</a>
						<span className="text-sm text-slate-500 dark:text-slate-400">
							Interested in supporting privacy infrastructure?
						</span>
					</div>
				) : (
					<div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
						{sponsors.map((sponsor, i) => (
							<motion.a
								key={i}
								href="#"
								target="_blank"
								rel="noopener noreferrer"
								whileHover={{ scale: 1.05 }}
								className="group flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
							>
								<Image
									src={sponsor.logo}
									alt={sponsor.name}
									width={180}
									height={16}
									className="h-8 md:h-10 w-auto grayscale group-hover:grayscale-0 transition-all dark:invert dark:group-hover:invert-0"
								/>
								<span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-600 font-medium">
									{sponsor.tier}
								</span>
							</motion.a>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
