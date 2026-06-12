"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
	Mail, 
	Send, 
	Smartphone, 
	Shield, 
	Lock, 
	Bell, 
	ArrowRight,
	ShieldCheck,
	Sliders,
	Code
} from "lucide-react";
import { PROTOCOLS } from "@/config/protocols";
import { cn } from "@/lib/utils";

// Mock Notification Data for Interactive Swapper
const CHANNEL_MOCKUPS = {
	email: {
		label: "Secure Email",
		icon: Mail,
		color: "text-teal border-teal/20 bg-teal/5",
		subject: "⚠️ Lending Protocol: Liquidation Risk",
		to: "Address: 51h2...QX3P (AES-256 Encrypted)",
		body: "Your position health factor has dropped to 1.05. Add collateral immediately to protect your SOL position from liquidation.",
		footer: "Decrypted in-browser using your local private keys",
		tag: "Zero-Knowledge AES"
	},
	telegram: {
		label: "Telegram Bot",
		icon: Send,
		color: "text-[#0088cc] border-[#0088cc]/20 bg-[#0088cc]/5",
		subject: "🔔 Herald Bot (@HeraldBot)",
		to: "Recipient: Telegram Chat ID (SHA-256 Mapped)",
		body: "⚠️ Liquidation warning for Lending Protocol! Health factor: 1.05. Solscan Tx: 4z9c...8f2b.",
		footer: "Delivered securely via encrypted Telegram webhook",
		tag: "@HeraldBot Connect"
	},
	sms: {
		label: "Private SMS",
		icon: Smartphone,
		color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
		subject: "💬 Herald SMS Relay",
		to: "Recipient: Encrypted Mobile Number",
		body: "Herald Alert: [Lending Protocol] Position warning. Health factor is 1.05. Add collateral or repay debt.",
		footer: "Dispatched via decentralized routing provider",
		tag: "SMS Relay Mode"
	}
};

type ChannelKey = keyof typeof CHANNEL_MOCKUPS;

// Mock Notification Data for Category Filter Preview
const MOCK_NOTIFICATIONS = [
	{
		id: 1,
		category: "defi" as const,
		protocol: "Kamigawa Lending",
		msg: "Liquidation warning: position health factor at 1.03",
		time: "Just now",
		dotColor: "bg-[#00C896] shadow-[0_0_8px_rgba(0,200,150,0.4)]",
		payload: {
			recipient_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
			encrypted_payload: "U2FsdGVkX19qS5r8Gf7Z2V4WnKzZq1r2yK57PmlB8H...",
			channel: "Telegram Relay",
			routing_status: "RELAYED_AND_LOGGED"
		}
	},
	{
		id: 2,
		category: "governance" as const,
		protocol: "Solana Realms DAO",
		msg: "Proposal #88: Upgrade protocol fees to 0.15% - Voting Active",
		time: "4m ago",
		dotColor: "bg-[#5B35D5] shadow-[0_0_8px_rgba(91,53,213,0.4)]",
		payload: {
			recipient_hash: "8f3b6c12d4a51e607b901a248f21bbd85a127ee85d956bf1a3f019b78e24cf1a",
			encrypted_payload: "U2FsdGVkX19vTDRwOHV6ZXl0cm9wYXNzd29yZ...",
			channel: "Secure Email",
			routing_status: "RELAYED_AND_LOGGED"
		}
	},
	{
		id: 3,
		category: "system" as const,
		protocol: "Security Registry",
		msg: "Notification key rotation required (90-day cycle)",
		time: "12m ago",
		dotColor: "bg-[#E8920A] shadow-[0_0_8px_rgba(232,146,10,0.4)]",
		payload: {
			recipient_hash: "0a3f9c210816b8bfd37651a24be51c6b12a89df85c952b1fa89f7e65cf1a980e",
			encrypted_payload: "U2FsdGVkX19zZWNyZXRrZXlyb3RhdGlvbjkwd...",
			channel: "SMS Relay",
			routing_status: "KEY_ROTATED_ON_CHAIN"
		}
	},
	{
		id: 4,
		category: "marketing" as const,
		protocol: "Herald Launchpad",
		msg: "Integrate Herald in 5 minutes with our new TypeScript SDK",
		time: "1h ago",
		dotColor: "bg-[#64748B] shadow-[0_0_8px_rgba(100,116,139,0.4)]",
		payload: {
			recipient_hash: "d4a13f8c5b9671e2b4f603c9b7d8ee591f8c85a92bf1c4d98a23e7f6e246cf3b",
			encrypted_payload: "U2FsdGVkX19zZGtpbnRlZ3JhdGlvbnR1dG9yaW...",
			channel: "Secure Email",
			routing_status: "RELAYED_AND_LOGGED"
		}
	}
];

const containerVariants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
	hidden: { opacity: 0, y: 24 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
	}
};

// Scroll-triggered fade-up reveal wrapper
interface ScrollRevealProps {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}

function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 36 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Interactive 3D tilt + mouse spotlight glow card component
interface Card3DProps {
	children: React.ReactNode;
	className?: string;
	glowColor?: string;
	bgVar?: string;
}

function Card3D({ 
	children, 
	className, 
	glowColor = "rgba(0, 200, 150, 0.35)", 
	bgVar = "var(--bg-card)" 
}: Card3DProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		
		const xPct = (mouseX / width) - 0.5;
		const yPct = (mouseY / height) - 0.5;
		
		cardRef.current.style.setProperty("--rot-x", `${-yPct * 8}deg`);
		cardRef.current.style.setProperty("--rot-y", `${xPct * 8}deg`);
		cardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
		cardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);
	};

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
		if (!cardRef.current) return;
		cardRef.current.style.setProperty("--rot-x", "0deg");
		cardRef.current.style.setProperty("--rot-y", "0deg");
	};

	return (
		<div
			ref={cardRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={cn(
				"relative transition-all duration-300 ease-out border border-transparent rounded-2xl group overflow-hidden",
				className
			)}
			style={{
				transform: isHovered 
					? "perspective(1000px) rotateX(var(--rot-x, 0deg)) rotateY(var(--rot-y, 0deg)) scale3d(1.015, 1.015, 1.015)"
					: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
				transformStyle: "preserve-3d",
				backgroundImage: isHovered 
					? `linear-gradient(${bgVar}, ${bgVar}), radial-gradient(150px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${glowColor}, transparent 70%)`
					: `linear-gradient(${bgVar}, ${bgVar}), linear-gradient(var(--border), var(--border))`,
				backgroundOrigin: "border-box",
				backgroundClip: "padding-box, border-box",
			}}
		>
			{/* Inner Spotlight Highlight over card text */}
			<div 
				className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
				style={{
					background: `radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255, 255, 255, 0.04), transparent 70%)`,
				}}
			/>
			
			<div className="relative z-20 h-full w-full" style={{ transform: "translateZ(15px)" }}>
				{children}
			</div>
		</div>
	);
}

export default function LandingPage() {
	// Active channel in hero mockup switcher
	const [activeChannel, setActiveChannel] = useState<ChannelKey>("email");
	const [userInteracted, setUserInteracted] = useState(false);

	// Category filter active states
	const [filterCategories, setFilterCategories] = useState({
		defi: true,
		governance: true,
		system: true,
		marketing: false,
	});

	// Expanded alert details for ZK Cryptographic Proof view
	const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

	// Cycle channels in hero mockup automatically
	useEffect(() => {
		if (userInteracted) return;
		const channels: ChannelKey[] = ["email", "telegram", "sms"];
		const interval = setInterval(() => {
			setActiveChannel((prev) => {
				const idx = channels.indexOf(prev);
				return channels[(idx + 1) % channels.length];
			});
		}, 4000);
		return () => clearInterval(interval);
	}, [userInteracted]);

	const toggleFilterCategory = (key: keyof typeof filterCategories) => {
		setFilterCategories((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const filteredNotifications = MOCK_NOTIFICATIONS.filter(
		(n) => filterCategories[n.category]
	);

	const activeMockup = CHANNEL_MOCKUPS[activeChannel];
	const MockupIcon = activeMockup.icon;

	return (
		<div className="relative overflow-hidden selection:bg-teal/30">
			{/* Cyberpunk Grid Background */}
			<div 
				className="absolute inset-0 z-0 pointer-events-none opacity-20"
				style={{
					backgroundImage: `
						linear-gradient(to right, rgba(0, 200, 150, 0.05) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(0, 200, 150, 0.05) 1px, transparent 1px)
					`,
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Drifting Cryptographic Glow Blobs */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
				<motion.div
					animate={{
						x: ["0%", "20%", "-10%", "0%"],
						y: ["0%", "-30%", "20%", "0%"],
					}}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute top-[5%] left-[5%] w-[450px] h-[450px] bg-teal/10 blur-[130px] rounded-full opacity-60"
				/>
				<motion.div
					animate={{
						x: ["0%", "-15%", "15%", "0%"],
						y: ["0%", "20%", "-20%", "0%"],
					}}
					transition={{
						duration: 22,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-herald-purple/10 blur-[140px] rounded-full opacity-65"
				/>
				<motion.div
					animate={{
						x: ["0%", "10%", "-20%", "0%"],
						y: ["0%", "15%", "25%", "0%"],
					}}
					transition={{
						duration: 18,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute top-[35%] left-[40%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full opacity-50"
				/>
			</div>

			{/* ───── Hero Section ───── */}
			<section className="relative z-10 px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-[1100px] mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
					{/* Left Column: Copy (7 cols on large screens) */}
					<motion.div 
						variants={containerVariants} 
						initial="hidden" 
						animate="show"
						className="lg:col-span-7"
					>
						<motion.div variants={itemVariants}>
							<span className="inline-flex items-center gap-2.5 bg-card border border-teal/20 shadow-[0_0_15px_rgba(0,200,150,0.15)] rounded-full px-4 py-1.5 text-[12px] sm:text-[13px] font-bold text-teal mb-6 sm:mb-8 tracking-wide overflow-hidden break-words">
								<span className="relative flex h-2 w-2 shrink-0">
									<span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
									<span className="relative inline-flex rounded-full h-2 w-2 bg-teal shrink-0" />
								</span>
								Multi-Channel · End-to-End Encrypted · Zero-Knowledge
							</span>
						</motion.div>

						<motion.h1
							variants={itemVariants}
							className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-[1.1] tracking-tight mb-4 sm:mb-6"
						>
							Solana alerts.
							<br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-teal-2 to-herald-purple">
								100% Private.
							</span>
						</motion.h1>

						<motion.p
							variants={itemVariants}
							className="text-[16px] sm:text-lg text-text-secondary leading-[1.8] mb-10 max-w-[500px] font-medium"
						>
							Receive liquidation warnings, governance votes, and on-chain updates via{" "}
							<span className="text-text-primary font-bold">Email, Telegram, and SMS</span>.
							Your contact data is encrypted in-browser before it hits the blockchain.
						</motion.p>

						<motion.div variants={itemVariants} className="flex flex-wrap gap-4">
							<Link
								href="/register"
								className="group relative inline-flex items-center justify-center gap-2 bg-teal text-navy font-bold text-[16px] px-8 py-4 rounded-xl hover:bg-teal-2 active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(0,200,150,0.3)] hover:shadow-[0_0_30px_rgba(0,200,150,0.5)] overflow-hidden"
							>
								<div className="absolute inset-0 -translate-x-full group-hover:motion-safe:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
								<span className="relative z-10">Get Private Alerts</span>
								<ArrowRight className="relative z-10 size-3.5 group-hover:translate-x-1 transition-transform" />
							</Link>
							<Link
								href="/how-it-works"
								className="inline-flex items-center justify-center gap-2 bg-card border border-border-2 text-text-secondary font-bold text-[16px] px-8 py-4 rounded-xl hover:border-teal/30 hover:text-text-primary transition-all duration-300 active:scale-[0.98]"
							>
								Explore How
							</Link>
						</motion.div>
					</motion.div>

					{/* Right Column: Interactive Mockup Card (5 cols on large screens) */}
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
						className="lg:col-span-5 relative z-10"
					>
						<Card3D className="bg-navy-2/70 backdrop-blur-xl border border-border/60 rounded-[24px] p-5 sm:p-6 shadow-2xl overflow-hidden" bgVar="var(--bg-secondary)">
							<div className="flex items-center justify-between mb-5">
								<span className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-teal motion-safe:animate-pulse" />
									Live Channel Preview
								</span>
								<div className="flex gap-1">
									<div className="w-2 h-2 rounded-full bg-border-2" />
									<div className="w-2 h-2 rounded-full bg-border-2" />
									<div className="w-2 h-2 rounded-full bg-border-2" />
								</div>
							</div>

							{/* Interactive Switcher Tabs */}
							<div className="relative flex gap-1.5 p-1 bg-card border border-border/40 rounded-xl mb-4">
								{(Object.keys(CHANNEL_MOCKUPS) as ChannelKey[]).map((key) => {
									const m = CHANNEL_MOCKUPS[key];
									const Icon = m.icon;
									const isActive = activeChannel === key;
									return (
										<button
											key={key}
											onClick={() => {
												setActiveChannel(key);
												setUserInteracted(true);
											}}
											className={cn(
												"relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer z-10",
												isActive ? "text-teal" : "text-text-muted hover:text-text-secondary"
											)}
										>
											<Icon className="size-3.5" />
											<span className="hidden xs:inline">{m.label.split(" ")[1] || m.label}</span>
											{isActive && (
												<motion.div
													layoutId="activeTabGlow"
													className="absolute inset-0 bg-teal/10 border border-teal/20 rounded-lg -z-10"
													transition={{ type: "spring", stiffness: 380, damping: 30 }}
												/>
											)}
										</button>
									);
								})}
							</div>

							{/* Active Mockup Screen */}
							<div className="relative h-[200px] rounded-2xl border border-border/80 bg-card/60 overflow-hidden">
								<AnimatePresence mode="wait">
									<motion.div
										key={activeChannel}
										initial={{ opacity: 0, y: 15 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -15 }}
										transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
										className="absolute inset-0 p-5 flex flex-col justify-between"
									>
										<div>
											<div className="flex items-center justify-between gap-2 mb-3">
												<span className={cn(
													"text-[10px] font-extrabold px-2 py-0.5 border rounded-md uppercase tracking-wider shrink-0",
													activeMockup.color
												)}>
													{activeMockup.tag}
												</span>
												<span className="text-[10px] font-medium text-text-muted">Just now</span>
											</div>

											<p className="text-xs font-mono text-text-muted mb-2 truncate">
												{activeMockup.to}
											</p>

											<h4 className="text-sm font-bold text-text-primary mb-1.5 truncate">
												{activeMockup.subject}
											</h4>

											<p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
												{activeMockup.body}
											</p>
										</div>

										<div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border/40">
											<Lock className="size-3 text-teal shrink-0" />
											<span className="text-[10px] text-text-muted truncate font-medium">
												{activeMockup.footer}
											</span>
										</div>
									</motion.div>
								</AnimatePresence>
							</div>
						</Card3D>
					</motion.div>
				</div>
			</section>

			{/* Scroll mouse indicator */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 0.7, y: 0 }}
				transition={{ delay: 1.4, duration: 0.8 }}
				className="relative z-10 flex flex-col items-center gap-2 mb-14 cursor-pointer group hover:opacity-100 transition-opacity"
				onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" })}
			>
				<span className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase tracking-[3px] font-mono">
					Explore Features
				</span>
				<div className="w-5 h-8 rounded-full border border-text-muted/30 flex justify-center pt-1.5 bg-card/20">
					<motion.div
						animate={{ y: [0, 8, 0] }}
						transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
						className="w-1.5 h-1.5 rounded-full bg-teal"
					/>
				</div>
			</motion.div>

			{/* ───── Stats Grid ───── */}
			<section className="relative z-10 px-4 sm:px-8 pb-16 sm:pb-20 max-w-[1100px] mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
					{[
						{ value: "100% Encrypted", label: "Email, Telegram & SMS data encrypted in-browser" },
						{ value: "Zero Plaintext", label: "Plaintext contact information never written to DBs" },
						{ value: "On-Chain Verified", label: "Cryptographic delivery receipts logged on Solana" },
					].map((s, i) => (
						<ScrollReveal key={i} delay={i * 0.1}>
							<Card3D
								className="text-center py-6 px-5"
								bgVar="var(--bg-card)"
								glowColor="rgba(0, 200, 150, 0.25)"
							>
								<div className="text-2xl sm:text-3xl font-extrabold text-teal mb-1">{s.value}</div>
								<div className="text-xs text-text-muted font-medium">{s.label}</div>
							</Card3D>
						</ScrollReveal>
					))}
				</div>
			</section>

			{/* ───── Multi-Channel Spotlight (Bento Grid) ───── */}
			<section className="relative z-10 px-4 sm:px-8 pb-20 sm:pb-28 max-w-[1100px] mx-auto">
				<ScrollReveal className="text-center mb-12 sm:mb-16">
					<h2 className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-card border border-border text-[11px] font-extrabold tracking-[2px] text-text-secondary uppercase mb-4">
						Core Architecture
					</h2>
					<h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
						Three Private Channels. One Secure Protocol.
					</h3>
				</ScrollReveal>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Card 1: Telegram */}
					<ScrollReveal className="lg:col-span-2">
						<Card3D className="group p-6 sm:p-8 flex flex-col justify-between" bgVar="var(--bg-card)" glowColor="rgba(0, 136, 204, 0.25)">
							<div>
								<div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 flex items-center justify-center mb-6 text-[#0088cc]">
									<Send className="size-6 animate-pulse" />
								</div>
								<h4 className="text-xl font-extrabold text-text-primary mb-3">
									Anonymous Telegram Notifications
								</h4>
								<p className="text-sm text-text-muted leading-relaxed mb-6 max-w-xl">
									Integrate Telegram without leaving a trace. We encrypt your Chat ID and map it via a secure SHA-256 process using our bot, `@HeraldBot`. No protocol or server ever sees your Telegram account identifier.
								</p>
							</div>
							<div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
								<span className="text-[10px] font-bold bg-[#0088cc]/15 text-[#0088cc] px-2.5 py-1 rounded-md">
									@HeraldBot Connect
								</span>
								<span className="text-[10px] font-bold bg-card border border-border/40 text-text-muted px-2.5 py-1 rounded-md">
									SHA-256 Hash Matching
								</span>
							</div>
						</Card3D>
					</ScrollReveal>

					{/* Card 2: Email */}
					<ScrollReveal delay={0.15}>
						<Card3D className="p-6 sm:p-8 flex flex-col justify-between" bgVar="var(--bg-card)" glowColor="rgba(0, 200, 150, 0.25)">
							<div>
								<div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-6 text-teal">
									<Mail className="size-6" />
								</div>
								<h4 className="text-xl font-extrabold text-text-primary mb-3">
									Zero-Knowledge Email
								</h4>
								<p className="text-sm text-text-muted leading-relaxed mb-6">
									Your email address is encrypted in your browser using AES-256 before leaving your computer. It is decrypted dynamically by our secure routing nodes only at the moment of relay.
								</p>
							</div>
							<div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
								<span className="text-[10px] font-bold bg-teal/10 text-teal px-2.5 py-1 rounded-md">
									In-Browser AES
								</span>
								<span className="text-[10px] font-bold bg-card border border-border/40 text-text-muted px-2.5 py-1 rounded-md">
									Decrypted On-Relay
								</span>
							</div>
						</Card3D>
					</ScrollReveal>

					{/* Card 3: SMS */}
					<Card3D className="p-6 sm:p-8 flex flex-col justify-between" bgVar="var(--bg-card)" glowColor="rgba(168, 85, 247, 0.25)">
						<div>
							<div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
								<Smartphone className="size-6" />
							</div>
							<h4 className="text-xl font-extrabold text-text-primary mb-3">
								Secure SMS Alerts
							</h4>
							<p className="text-sm text-text-muted leading-relaxed mb-6">
								Get high-priority transaction alerts directly on your mobile lockscreen. We handle routing via decentralized SMS gateways, meaning you don&apos;t have to leak your personal phone number to the dApps you use.
							</p>
						</div>
						<div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
							<span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md">
								Global SMS Relay
							</span>
							<span className="text-[10px] font-bold bg-card border border-border/40 text-text-muted px-2.5 py-1 rounded-md">
								Gateway Masking
							</span>
						</div>
					</Card3D>

					{/* Card 4: On-Chain Verification */}
					<Card3D className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between" bgVar="var(--bg-card)" glowColor="rgba(0, 200, 150, 0.25)">
						<div>
							<div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-6 text-teal">
								<ShieldCheck className="size-6" />
							</div>
							<h4 className="text-xl font-extrabold text-text-primary mb-3">
								On-Chain Verified Receipts
							</h4>
							<p className="text-sm text-text-muted leading-relaxed mb-6">
								Every notification delivered is cryptographically logged on the Solana blockchain. Users can verify the sender identity, delivery status, and timestamp on-chain via Solscan without revealing their own identities.
							</p>
						</div>
						<div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
							<span className="text-[10px] font-bold bg-teal/10 text-teal px-2.5 py-1 rounded-md">
								Solana Native
							</span>
							<span className="text-[10px] font-bold bg-card border border-border/40 text-text-muted px-2.5 py-1 rounded-md">
								Solscan Verifiable
							</span>
						</div>
					</Card3D>
				</div>
			</section>

			{/* ───── Interactive Preferences Stepper (Preview) ───── */}
			<section className="relative z-10 px-4 sm:px-8 pb-20 sm:pb-28 max-w-[1100px] mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
					{/* Left: Preferences controller card */}
					<Card3D className="p-5 sm:p-7 shadow-xl" bgVar="var(--bg-card)">
						<div className="flex items-center gap-2 mb-4">
							<Sliders className="size-4 text-teal" />
							<span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
								Interactive Portal Simulator
							</span>
						</div>
						<h3 className="text-lg sm:text-xl font-extrabold mb-2 text-text-primary">
							Choose what you receive
						</h3>
						<p className="text-xs sm:text-sm text-text-muted mb-6 leading-relaxed">
							Toggle category preferences below to filter the real-time notification feed. Click on any feed alert to view its cryptographic Zero-Knowledge payload!
						</p>

						{/* Interactive Switches */}
						<div className="space-y-3.5 mb-2">
							{[
								{ key: "defi" as const, label: "DeFi Alerts", desc: "Liquidation risk, lending rates, yield optimization" },
								{ key: "governance" as const, label: "Governance Proposals", desc: "DAO voting updates, proposal completions" },
								{ key: "system" as const, label: "System Alerts", desc: "Notification key rotations, security updates" },
								{ key: "marketing" as const, label: "Protocol Discoveries", desc: "New launch alerts, developer utilities" },
							].map((cat) => (
								<motion.div
									key={cat.key}
									onClick={() => toggleFilterCategory(cat.key)}
									whileTap={{ scale: 0.98 }}
									className={cn(
										"flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200",
										filterCategories[cat.key]
											? "border-teal/30 bg-teal/5 text-text-primary"
											: "border-border/60 bg-transparent text-text-muted hover:border-border"
									)}
								>
									<div>
										<h5 className="text-xs sm:text-sm font-bold">{cat.label}</h5>
										<p className="text-[10px] sm:text-xs text-text-muted mt-0.5">{cat.desc}</p>
									</div>
									<div className={cn(
										"w-8 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
										filterCategories[cat.key] ? "bg-teal justify-end" : "bg-card-2 border border-border/60 justify-start"
									)}>
										<motion.div 
											layout
											transition={{ type: "spring", stiffness: 500, damping: 30 }}
											className="w-4 h-4 rounded-full bg-navy shadow-sm" 
										/>
									</div>
								</motion.div>
							))}
						</div>
					</Card3D>

					{/* Right: Simulated Notification feed reacting to filter changes */}
					<div className="flex flex-col gap-3">
						<span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
							Simulated Alert Feed ({filteredNotifications.length})
						</span>

						<div className="space-y-3 min-h-[300px]">
							<AnimatePresence mode="popLayout">
								{filteredNotifications.length === 0 ? (
									<motion.div
										key="empty"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="h-[300px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-card/10"
									>
										<Bell className="size-8 text-text-muted/40 mb-3 animate-bounce" />
										<h5 className="text-sm font-bold text-text-muted">No alerts selected</h5>
										<p className="text-xs text-text-muted/60 max-w-[200px] mt-1 leading-relaxed">
											Toggle categories on the simulator card to preview mock alerts.
										</p>
									</motion.div>
								) : (
									filteredNotifications.map((n) => {
										const isExpanded = expandedAlert === n.id;
										return (
											<motion.div
												key={n.id}
												layout="position"
												initial={{ opacity: 0, y: 10, scale: 0.98 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={{ opacity: 0, y: -10, scale: 0.98 }}
												onClick={() => setExpandedAlert(isExpanded ? null : n.id)}
												className={cn(
													"p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm hover:bg-card-2/20 transition-all cursor-pointer shadow-sm select-none",
													isExpanded && "border-teal/30 bg-card/50"
												)}
											>
												<div className="flex gap-3.5 items-start">
													<div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.dotColor)} />
													<div className="flex-1 min-w-0">
														<div className="flex justify-between items-center mb-1">
															<span className="text-xs font-extrabold text-teal uppercase tracking-wider">
																{n.category}
															</span>
															<span className="text-[10px] text-text-muted font-medium">{n.time}</span>
														</div>
														<h5 className="text-sm font-bold text-text-primary mb-0.5 truncate">
															{n.protocol}
														</h5>
														<p className="text-xs text-text-secondary leading-normal">
															{n.msg}
														</p>
													</div>
													<div className="shrink-0 flex items-center justify-center w-6 h-6 rounded bg-card border border-border/60 hover:text-teal hover:border-teal/20 transition-colors">
														<Code className="size-3 text-text-muted" />
													</div>
												</div>

												{/* ZK Cryptographic Proof Expand Section */}
												<AnimatePresence>
													{isExpanded && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															transition={{ duration: 0.3, ease: "easeInOut" }}
															className="overflow-hidden mt-3 pt-3 border-t border-border/40"
															onClick={(e) => e.stopPropagation()}
														>
															<div className="bg-navy rounded-lg p-3 font-mono text-[10px] text-teal border border-teal/10 overflow-x-auto whitespace-pre leading-relaxed">
																<div className="flex items-center gap-1.5 mb-1.5 text-text-secondary border-b border-border/20 pb-1.5 font-sans font-bold">
																	<Shield className="size-3 text-teal shrink-0" />
																	Zero-Knowledge Packet Verification
																</div>
																<span className="text-text-muted">{"{"}</span>
																<br />
																&nbsp;&nbsp;Address Hash: <span className="text-text-primary">&quot;{n.payload.recipient_hash}&quot;</span>,
																<br />
																&nbsp;&nbsp;Payload (AES-256): <span className="text-text-primary">&quot;{n.payload.encrypted_payload}&quot;</span>,
																<br />
																&nbsp;&nbsp;Relay Destination: <span className="text-text-primary">&quot;{n.payload.channel}&quot;</span>,
																<br />
																&nbsp;&nbsp;Audit Status: <span className="text-[#00C896] font-bold">&quot;{n.payload.routing_status}&quot;</span>
																<br />
																<span className="text-text-muted">{"}"}</span>
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</motion.div>
										);
									})
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</section>

			{/* ───── How It Works (Timeline Stepper) ───── */}
			<section className="relative z-10 px-4 sm:px-8 pb-20 sm:pb-28 max-w-[1100px] mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5 }}
					className="text-center mb-12 sm:mb-16"
				>
					<h2 className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-card border border-border text-[11px] font-extrabold tracking-[2px] text-text-secondary uppercase mb-4">
						Onboarding Flow
					</h2>
					<h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
						Get Alerts in Four Steps
					</h3>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
					{/* Animated horizontal connecting line on desktop */}
					<div className="absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-border/20 hidden md:block z-0">
						<motion.div
							initial={{ scaleX: 0 }}
							whileInView={{ scaleX: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1.2, ease: "easeOut" }}
							className="h-full bg-gradient-to-r from-teal via-teal-2 to-herald-purple origin-left"
						/>
					</div>

					{/* Animated vertical connecting line on mobile */}
					<div className="absolute left-1/2 -translate-x-1/2 top-[50px] bottom-[50px] w-0.5 bg-border/20 md:hidden z-0">
						<motion.div
							initial={{ scaleY: 0 }}
							whileInView={{ scaleY: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1.2, ease: "easeOut" }}
							className="w-full bg-gradient-to-b from-teal via-teal-2 to-herald-purple origin-top"
						/>
					</div>

					{[
						{ step: "01", title: "Connect Wallet", desc: "Establish your secure Solana credentials. Your public key serves as your profile identity." },
						{ step: "02", title: "Choose Channels", desc: "Select and link your preferred notify endpoints—Email, Telegram (via @HeraldBot), or SMS." },
						{ step: "03", title: "Write Encrypted", desc: "Your details are encrypted client-side in-browser before writing on-chain to Solana." },
						{ step: "04", title: "Receive Alerts", desc: "Integrated protocols push system warnings, DAOs, or liquidations directly to you." }
					].map((s, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
							whileHover={{ y: -6, scale: 1.02 }}
							className="relative flex flex-col items-center text-center z-10 p-5 rounded-2xl bg-card/10 backdrop-blur-sm border border-border/40 hover:border-teal/30 hover:bg-card/20 transition-all duration-300 cursor-default"
						>
							<div className="w-14 h-14 rounded-2xl bg-card border border-border/80 flex items-center justify-center mb-5 shadow-lg shadow-teal/5 group-hover:border-teal/40">
								<span className="font-mono text-sm text-teal font-extrabold">{s.step}</span>
							</div>
							<h4 className="text-[16px] sm:text-[18px] font-extrabold text-text-primary mb-2.5">
								{s.title}
							</h4>
							<p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-[240px]">
								{s.desc}
							</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* ───── Protocol Marquee ───── */}
			{PROTOCOLS.length > 0 && (
				<section className="border-y border-border/50 bg-card py-12 relative overflow-hidden mb-12">
					<div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
					<div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<div className="text-[12px] text-text-muted font-bold tracking-[2.5px] uppercase text-center mb-8">
							Built for the Solana ecosystem
						</div>
					</motion.div>
					<div className="overflow-hidden">
						<div className="flex gap-8 motion-safe:animate-marquee w-max">
							{[...PROTOCOLS, ...PROTOCOLS, ...PROTOCOLS].map((p, i) => (
								<div
									key={i}
									className="px-8 py-3 bg-navy-2 border border-border rounded-xl text-[15px] font-extrabold tracking-tight text-text-primary hover:border-teal/50 hover:text-teal transition-colors cursor-default whitespace-nowrap shadow-sm"
								>
									{p}
								</div>
							))}
						</div>
					</div>
				</section>
			)}

			{/* ───── Final CTA ───── */}
			<section className="relative px-4 sm:px-8 py-20 sm:py-28 max-w-[700px] mx-auto text-center">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal/5 blur-[100px] rounded-full pointer-events-none" />
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.6 }}
					className="relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-300"
				>
					<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-text-primary">
						Keep your contact info private.
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-herald-purple">
							Never miss an alert.
						</span>
					</h2>
					<p className="text-sm sm:text-base text-text-muted max-w-[480px] mx-auto mb-10 leading-relaxed font-medium">
						Connect your wallet, encrypt your Email, Telegram, or SMS settings once, and enjoy decentralized, verifiable notifications on Solana.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href="/register"
							className="group relative inline-flex items-center justify-center gap-2 bg-teal text-navy font-bold text-[16px] px-10 py-4 rounded-xl hover:bg-teal-2 active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(0,200,150,0.3)] hover:shadow-[0_0_30px_rgba(0,200,150,0.5)] overflow-hidden"
						>
							<div className="absolute inset-0 -translate-x-full group-hover:motion-safe:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
							<span className="relative z-10">Access Portal</span>
							<ArrowRight className="relative z-10 size-3.5 group-hover:translate-x-1 transition-transform" />
						</Link>
						<Link
							href="/how-it-works"
							className="inline-flex items-center justify-center gap-2 bg-card border border-border-2 text-text-secondary font-bold text-[16px] px-8 py-4 rounded-xl hover:border-teal/50 hover:text-text-primary transition-all duration-300 active:scale-[0.98]"
						>
							Learn more
						</Link>
					</div>
				</motion.div>
			</section>
		</div>
	);
}
