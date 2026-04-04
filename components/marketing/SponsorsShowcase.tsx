"use client";

import { motion } from "motion/react";
import { Sparkles, Zap, Globe, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const sponsorTiers = [
	{
		name: "Ecosystem Partner",
		description: "Strategic partners building the future of Solana",
		icon: Globe,
		color: "from-violet-500 to-purple-600",
		bgColor: "bg-violet-50 dark:bg-violet-950/20",
		borderColor: "border-violet-200 dark:border-violet-800",
		textColor: "text-violet-700 dark:text-violet-400",
		features: ["Logo on homepage", "Priority integration support", "Co-marketing opportunities"],
		cta: "Become a Partner",
		ctaLink: "mailto:partnerships@useherald.xyz",
	},
	{
		name: "Founding Sponsor",
		description: "Early supporters of privacy-preserving infrastructure",
		icon: Sparkles,
		color: "from-emerald-400 to-teal-600",
		bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
		borderColor: "border-emerald-200 dark:border-emerald-800",
		textColor: "text-emerald-700 dark:text-emerald-400",
		features: ["Featured placement", "Product roadmap input", "Annual report recognition"],
		cta: "Join as Sponsor",
		ctaLink: "mailto:sponsors@useherald.xyz",
		featured: true,
	},
	{
		name: "Grant Backer",
		description: "Supporting public goods for the Solana ecosystem",
		icon: Zap,
		color: "from-amber-400 to-orange-600",
		bgColor: "bg-amber-50 dark:bg-amber-950/20",
		borderColor: "border-amber-200 dark:border-amber-800",
		textColor: "text-amber-700 dark:text-amber-400",
		features: ["Tax-deductible (via 501c3)", "Impact metrics dashboard", "Community recognition"],
		cta: "Fund Public Goods",
		ctaLink: "mailto:grants@useherald.xyz",
	},
];

const placeholderSponsors = [
	{
		name: "Superteam",
		tier: "Ecosystem Partner",
		logo: "https://de.superteam.fun/st-flag-logo.png",
		description: "The talent layer of Solana",
		website: "https://superteam.fun",
	},
	{
		name: "Solana Foundation",
		tier: "Founding Sponsor",
		logo: "https://solana.com/pages/branding/logotype/logo.png",
		description: "Supporting the Solana ecosystem",
		website: "https://solana.com",
		featured: true,
	},
];

export default function SponsorsShowcase() {
	const hasSponsors =
		placeholderSponsors.length > 0 && placeholderSponsors[0].name !== "Your Logo Here";

	return (
		<section className="relative py-20 sm:py-28 overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-50/50 to-transparent dark:from-transparent dark:via-slate-900/30 dark:to-transparent" />
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

			<div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-16"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
						<Shield className="w-4 h-4" />
						Trusted By Industry Leaders
					</div>
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
						Backed by the{" "}
						<span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-violet-600">
							Best in Solana
						</span>
					</h2>
					<p className="text-lg text-slate-600 dark:text-slate-400 max-w-[600px] mx-auto leading-relaxed">
						Herald is proud to partner with organizations building the future of decentralized
						infrastructure and privacy-preserving technology.
					</p>
				</motion.div>

				{/* Current Sponsors Grid (or Placeholder) */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="mb-20"
				>
					{hasSponsors ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
							{placeholderSponsors.map((sponsor, i) => (
								<motion.a
									key={i}
									href={sponsor.website}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ y: -4, scale: 1.02 }}
									className={`group relative bg-white dark:bg-slate-800/50 border ${sponsor.featured ? "border-emerald-300 dark:border-emerald-600 ring-2 ring-emerald-500/20" : "border-slate-200 dark:border-slate-700"} rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-emerald-500/10`}
								>
									{sponsor.featured && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
											Founding Sponsor
										</div>
									)}
									<div className="h-20 w-full flex items-center justify-center mb-4">
										<Image
											src={sponsor.logo}
											alt={`${sponsor.name} logo`}
											width={180}
											height={16}
											className="max-h-16 max-w-[180px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300 dark:invert dark:group-hover:invert-0"
										/>
									</div>
									<h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
										{sponsor.name}
									</h3>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										{sponsor.description}
									</p>
									<div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
										Visit website <ArrowRight className="w-3 h-3" />
									</div>
								</motion.a>
							))}
						</div>
					) : (
						/* Placeholder State - When no sponsors yet */
						<div className="relative bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center max-w-[800px] mx-auto">
							<div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-emerald-100 to-violet-100 dark:from-emerald-900/30 dark:to-violet-900/30 flex items-center justify-center">
								<Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
							</div>
							<h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
								Partner With Us
							</h3>
							<p className="text-slate-600 dark:text-slate-400 mb-8 max-w-[400px] mx-auto">
								{
									"We're actively seeking founding sponsors who believe in privacy-preserving infrastructure for the Solana ecosystem."
								}
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Link
									href="mailto:partnerships@herald.xyz"
									className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
								>
									<Sparkles className="w-4 h-4" />
									Become a Founding Sponsor
								</Link>
								<Link
									href="/sponsorship"
									className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 active:scale-[0.98]"
								>
									View Sponsorship Deck
								</Link>
							</div>
						</div>
					)}
				</motion.div>

				{/* Sponsorship Tiers */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
				>
					<h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-8">
						Sponsorship Opportunities
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{sponsorTiers.map((tier, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.1 * i }}
								whileHover={{ y: -8 }}
								className={`relative group ${tier.bgColor} ${tier.borderColor} border rounded-2xl p-6 transition-all duration-300 ${tier.featured ? "ring-2 ring-emerald-500/20 scale-105 z-10" : "hover:shadow-lg"}`}
							>
								{tier.featured && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
										Most Popular
									</div>
								)}

								<div
									className={`w-12 h-12 rounded-xl bg-linear-to-br ${tier.color} flex items-center justify-center mb-4 shadow-lg`}
								>
									<tier.icon className="w-6 h-6 text-white" />
								</div>

								<h4 className={`text-lg font-bold mb-2 ${tier.textColor}`}>{tier.name}</h4>
								<p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
									{tier.description}
								</p>

								<ul className="space-y-2 mb-6">
									{tier.features.map((feature, j) => (
										<li
											key={j}
											className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
										>
											<span
												className={`mt-1 w-1.5 h-1.5 rounded-full bg-linear-to-r ${tier.color} shrink-0`}
											/>
											{feature}
										</li>
									))}
								</ul>

								<Link
									href={tier.ctaLink}
									className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${tier.featured ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
								>
									{tier.cta}
								</Link>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Bottom Trust Indicators */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 }}
					className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center gap-8 text-center"
				>
					<div>
						<div className="text-2xl font-bold text-slate-900 dark:text-white">$0.0001</div>
						<div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">
							Per notification cost
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-slate-900 dark:text-white">Zero</div>
						<div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">
							PII ever stored
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
						<div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">
							Open source
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
