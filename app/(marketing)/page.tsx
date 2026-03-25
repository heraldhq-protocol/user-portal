"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FaLink } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { AnimatedList } from "@/components/ui/animated-list";

const PROTOCOLS = [
	"Jupiter",
	"Drift",
	"Marinade",
	"Marginfi",
	"Orca",
	"Kamino",
	"Solend",
	"Raydium",
];

const trustCards = [
	{
		icon: <FaLock />,
		title: "Zero PII",
		desc: "We never see your email address. Ever.",
	},
	{
		icon: <FaLink />,
		title: "On-chain proof",
		desc: "Every send is verifiably recorded on Solana.",
	},
	{
		icon: <IoMdMail />,
		title: "Any inbox",
		desc: "Works with Gmail, Outlook, Proton — any email.",
	},
];

const howSteps = [
	{
		n: "01",
		title: "Connect wallet",
		desc: "Your wallet is your identity. No username needed.",
	},
	{
		n: "02",
		title: "Enter email",
		desc: "Encrypted in your browser. We receive only ciphertext.",
	},
	{
		n: "03",
		title: "Done",
		desc: "Receive DeFi alerts from any protocol, privately.",
	},
];

const demoNotifications = [
	{
		type: "defi" as const,
		proto: "Drift Protocol",
		msg: "Health factor 1.05 — add collateral",
		time: "Just now",
	},
	{
		type: "governance" as const,
		proto: "Realms DAO",
		msg: "Proposal #47 vote closes in 23h",
		time: "2m ago",
	},
	{
		type: "defi" as const,
		proto: "Marginfi",
		msg: "Position near liquidation threshold",
		time: "5m ago",
	},
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
	},
};

export default function LandingPage() {
	return (
		<div className="relative overflow-hidden selection:bg-teal/30">
			{/* Ambient animated glow background behind hero */}
			<div
				className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal/10 blur-[140px] rounded-full pointer-events-none opacity-70 animate-pulse"
				style={{ animationDuration: "8s" }}
			/>

			{/* ───── Hero ───── */}
			<section className="relative z-10 px-4 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 max-w-[1100px] mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
					{/* Left: Copy */}
					<motion.div variants={container} initial="hidden" animate="show">
						<motion.div variants={item}>
							<span className="inline-flex items-center gap-2.5 bg-white dark:bg-card border border-teal/20 shadow-[0_0_15px_rgba(0,200,150,0.15)] rounded-full px-4 py-1.5 text-[12px] sm:text-[13px] font-bold text-teal mb-6 sm:mb-8 tracking-wide overflow-hidden break-words text-center sm:text-left">
								<span className="relative flex h-2 w-2 shrink-0">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-teal shrink-0"></span>
								</span>
								Privacy-preserving · On-chain verified
							</span>
						</motion.div>

						<motion.h1
							variants={item}
							className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.1] tracking-tight mb-4 sm:mb-6"
						>
							Your wallet
							<br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-[#5B35D5]">
								is your address.
							</span>
						</motion.h1>

						<motion.p
							variants={item}
							className="text-lg text-slate-700 dark:text-text-secondary leading-[1.8] mb-10 max-w-[440px] font-medium"
						>
							Receive critical DeFi alerts directly to your inbox without sharing your email with
							any protocol. Herald never stores your email in plaintext.
						</motion.p>

						<motion.div variants={item} className="flex flex-wrap gap-4">
							<Link
								href="/register"
								className="group relative inline-flex items-center justify-center gap-2 bg-teal text-navy font-bold text-[16px] px-8 py-4 rounded-xl hover:bg-teal-2 active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(0,200,150,0.3)] hover:shadow-[0_0_30px_rgba(0,200,150,0.5)] overflow-hidden"
							>
								{/* Subtle shine effect on hover */}
								<div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
								<span className="relative z-10">Register now</span>
								<span className="relative z-10 group-hover:translate-x-1 transition-transform">
									→
								</span>
							</Link>
							<Link
								href="/how-it-works"
								className="inline-flex items-center justify-center gap-2 bg-slate-50 dark:bg-card-2 text-slate-700 dark:text-text-secondary font-bold text-[16px] px-8 py-4 rounded-xl border border-slate-300 dark:border-border-2 hover:border-text-muted hover:text-white transition-all duration-300 active:scale-[0.98]"
							>
								How it works
							</Link>
						</motion.div>
					</motion.div>

					{/* Right: Demo notification card */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
						animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
						transition={{
							delay: 0.2,
							duration: 0.8,
							ease: [0.16, 1, 0.3, 1],
						}}
						className="relative z-10"
					>
						{/* Floating decorative elements */}
						<div className="absolute -top-6 -right-6 w-32 h-32 bg-herald-purple/20 blur-2xl rounded-full" />
						<div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal/20 blur-3xl rounded-full" />

						<div className="relative bg-slate-50 dark:bg-navy-2/60 backdrop-blur-xl border border-slate-200 dark:border-border/50 rounded-[24px] p-7 shadow-2xl">
							<div className="flex items-center justify-between mb-6">
								<div className="text-[12px] text-slate-500 dark:text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-herald-gold animate-pulse" />
									Live Inbox Preview
								</div>
								<div className="flex gap-1.5">
									<div className="w-2.5 h-2.5 rounded-full bg-border-2" />
									<div className="w-2.5 h-2.5 rounded-full bg-border-2" />
									<div className="w-2.5 h-2.5 rounded-full bg-border-2" />
								</div>
							</div>

							<AnimatedList>
								{demoNotifications.map((n, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 100 }}
									>
										<div
											className={`group flex gap-4 items-start p-4 rounded-xl border bg-white dark:bg-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 dark:hover:bg-card-2 hover:shadow-lg ${i < 2 ? "mb-3" : ""} ${n.type === "governance" ? "border-herald-purple/20 hover:border-herald-purple/50" : "border-teal/20 hover:border-teal/50"}`}
										>
											<div
												className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 transition-transform duration-300 group-hover:scale-125"
												style={{
													background:
														n.type === "governance"
															? "var(--color-herald-purple)"
															: "var(--color-teal)",
													boxShadow: `0 0 0 3px ${n.type === "governance" ? "rgba(91,53,213,0.25)" : "rgba(0,200,150,0.25)"}`,
												}}
											/>
											<div className="flex-1 min-w-0">
												<div className="flex justify-between items-center mb-1">
													<span
														className="text-sm font-extrabold tracking-tight"
														style={{
															color: n.type === "governance" ? "#A78BFA" : "var(--color-teal)",
														}}
													>
														{n.proto}
													</span>
													<span className="text-[11px] font-medium text-slate-500 dark:text-text-muted">
														{n.time}
													</span>
												</div>
												<p className="text-[14px] text-slate-900 dark:text-text-primary/90 font-medium truncate">
													{n.msg}
												</p>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatedList>

							<div className="mt-5 px-4 py-3 bg-teal/10 rounded-xl border border-teal/20 flex justify-between items-center gap-3">
								<span className="text-teal text-lg leading-none">
									<FaLock />
								</span>
								<p className="text-xs text-teal/90 font-semibold leading-relaxed">
									The sender protocol does not know this email address. Verified via Zero-Knowledge
									proof.
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* ───── Trust Cards ───── */}
			<section className="relative z-10 px-4 sm:px-8 pb-16 sm:pb-20 pt-10 max-w-[1100px] mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{trustCards.map((c, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: 0.1 * i, duration: 0.5 }}
							className="group relative bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 sm:p-8 hover:bg-slate-50 dark:hover:bg-card-2 transition-colors duration-300"
						>
							{/* Hover glow line at top */}
							<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

							<div className="text-4xl mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 origin-bottom-left w-fit">
								{c.icon}
							</div>
							<div className="font-extrabold text-xl mb-2 text-slate-900 dark:text-white">
								{c.title}
							</div>
							<div className="text-[14px] font-medium text-slate-500 dark:text-text-muted leading-relaxed">
								{c.desc}
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* ───── How It Works ───── */}
			<section className="relative px-4 sm:px-8 pb-16 sm:pb-24 pt-10 max-w-[1100px] mx-auto">
				<div className="text-center mb-10 sm:mb-14">
					<h2 className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white dark:bg-card border border-slate-200 dark:border-border text-[12px] sm:text-[13px] font-extrabold tracking-[2px] text-slate-700 dark:text-text-secondary uppercase mb-4 sm:mb-6">
						How it works
					</h2>
					<h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
						Three steps to private alerts
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
					{/* Connecting line for desktop */}
					<div className="absolute top-[28px] left-[15%] right-[15%] h-px bg-border hidden md:block" />

					{howSteps.map((s, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: 0.1 * i, duration: 0.5 }}
							className="relative flex flex-col items-center text-center"
						>
							<div className="w-14 h-14 rounded-full bg-white dark:bg-navy border-2 border-slate-200 dark:border-border flex items-center justify-center z-10 mb-4 sm:mb-6 shadow-xl">
								<span className="font-mono text-sm text-teal font-bold">{s.n}</span>
							</div>
							<h3 className="text-[18px] sm:text-[20px] font-extrabold mb-2 sm:mb-3 text-slate-900 dark:text-white">
								{s.title}
							</h3>
							<p className="text-[14px] sm:text-[15px] font-medium text-slate-500 dark:text-text-muted leading-relaxed max-w-[260px] mx-auto">
								{s.desc}
							</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* ───── Protocol Marquee ───── */}
			<section className="border-y border-slate-200 dark:border-border/50 bg-white dark:bg-card py-12 relative overflow-hidden">
				<div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
				<div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

				<div className="text-[12px] text-slate-500 dark:text-text-muted font-bold tracking-[2.5px] uppercase text-center mb-8">
					{"Integrated perfectly with Solana's best"}
				</div>
				<div className="overflow-hidden">
					<div className="flex gap-8 animate-marquee w-max">
						{[...PROTOCOLS, ...PROTOCOLS, ...PROTOCOLS].map((p, i) => (
							<div
								key={i}
								className="px-8 py-3 bg-slate-50 dark:bg-navy-2 border border-slate-200 dark:border-border rounded-xl text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white hover:border-teal/50 hover:text-teal transition-colors cursor-default whitespace-nowrap shadow-sm"
							>
								{p}
							</div>
						))}
					</div>
				</div>
			</section>

			<style jsx global>{`
				@keyframes shimmer {
					100% {
						transform: translateX(100%);
					}
				}
			`}</style>
		</div>
	);
}
