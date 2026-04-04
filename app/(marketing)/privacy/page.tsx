import type { Metadata } from "next";
import {
	Shield,
	Lock,
	EyeOff,
	Database,
	Trash2,
	FileCheck,
	Server,
	Mail,
	Wallet,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Privacy — Herald",
	description:
		"Learn how Herald protects your privacy with client-side encryption, on-chain storage, and zero PII exposure.",
};

export default function PrivacyPage() {
	const privacyFeatures = [
		{
			icon: Lock,
			title: "Client-Side Encryption",
			color: "text-emerald-600 dark:text-[#00C896]",
			bgColor: "bg-emerald-50 dark:bg-[#00C896]/10",
			borderColor: "border-emerald-200 dark:border-[#00C896]/20",
			gradientFrom: "from-emerald-500/20",
			content:
				"Your email is encrypted entirely in your browser using TweetNaCl.js before it ever touches our servers. We use NaCl box encryption (Curve25519-XSalsa20-Poly1305).",
			highlight: "Plaintext never leaves your device",
		},
		{
			icon: Database,
			title: "On-Chain Identity",
			color: "text-violet-600 dark:text-[#5B35D5]",
			bgColor: "bg-violet-50 dark:bg-[#5B35D5]/10",
			borderColor: "border-violet-200 dark:border-[#5B35D5]/20",
			gradientFrom: "from-violet-500/20",
			content:
				"Your encrypted data lives in a Solana Program Derived Address (PDA) controlled by your wallet. Only your wallet signature can authorize changes.",
			highlight: "You own your data, not us",
		},
		{
			icon: Shield,
			title: "TEE Decryption",
			color: "text-amber-600 dark:text-[#E8920A]",
			bgColor: "bg-amber-50 dark:bg-[#E8920A]/10",
			borderColor: "border-amber-200 dark:border-[#E8920A]/20",
			gradientFrom: "from-amber-500/20",
			content:
				"Decryption happens inside an AWS Nitro Enclave — a hardware-isolated Trusted Execution Environment. Memory is cryptographically zeroed after use.",
			highlight: "Memory wiped after every send",
		},
		{
			icon: EyeOff,
			title: "Zero PII Storage",
			color: "text-rose-600 dark:text-[#D63031]",
			bgColor: "bg-rose-50 dark:bg-[#D63031]/10",
			borderColor: "border-rose-200 dark:border-[#D63031]/20",
			gradientFrom: "from-rose-500/20",
			content:
				"Our database stores only SHA-256 hashes. Even if compromised, attackers find zero email addresses or linkable identities.",
			highlight: "Nothing to steal, nothing to leak",
		},
	];

	const neverStores = [
		{ icon: Mail, label: "Plaintext email addresses" },
		{ icon: Wallet, label: "Wallet public keys (raw)" },
		{ icon: Server, label: "IP address logs" },
		{ icon: Database, label: "Email-to-wallet associations" },
	];

	const complianceItems = [
		{
			icon: Trash2,
			title: "GDPR Right to Erasure",
			content:
				"Delete your IdentityAccount PDA anytime. The account closes, rent is returned to your wallet, and all future notifications are permanently blocked.",
			color: "text-emerald-600 dark:text-[#27AE60]",
			bgColor: "bg-emerald-50 dark:bg-[#27AE60]/10",
		},
		{
			icon: FileCheck,
			title: "ZK Delivery Proofs",
			content:
				"Every delivery generates a ZK-compressed receipt on Solana via Light Protocol. Verifiable proof without exposing recipient identity. Cost: $0.0001 per proof.",
			color: "text-blue-600 dark:text-[#00C896]",
			bgColor: "bg-blue-50 dark:bg-[#00C896]/10",
		},
	];

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-[#060D18] transition-colors duration-300">
			<div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
				{/* Hero Section */}
				<div className="mb-12 sm:mb-16 text-center">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-100 dark:bg-[#00C896]/10 border border-emerald-200 dark:border-[#00C896]/20 text-emerald-700 dark:text-[#00C896] text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-4 sm:mb-6">
						<Shield className="w-3 h-3 sm:w-4 sm:h-4" />
						Zero-Knowledge Architecture
					</div>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 text-slate-900 dark:text-white">
						Privacy by <span className="text-emerald-600 dark:text-[#00C896]">Design</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-[600px] mx-auto px-2 sm:px-0">
						Herald was built on a simple premise: we should be technically incapable of reading your
						email address, even if we wanted to.
					</p>
				</div>

				{/* Privacy Architecture Diagram */}
				<div className="mb-12 sm:mb-16 bg-white dark:bg-[#0D1F35] border border-slate-200 dark:border-[#1A3A52] rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-none">
					<h3 className="text-xs sm:text-sm font-mono text-slate-500 dark:text-[#64748B] uppercase tracking-wider mb-4 sm:mb-6">
						Data Flow Visualization
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
						{/* Connection Lines (Desktop only) */}
						<div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] h-0.5 bg-gradient-to-r from-violet-500 to-emerald-500 -translate-y-1/2 z-0 opacity-30" />

						{/* Step 1: User */}
						<div className="relative z-10 bg-slate-50 dark:bg-[#060D18] border border-violet-200 dark:border-[#5B35D5] rounded-xl p-4 sm:p-5 text-center group hover:scale-[1.02] transition-transform">
							<div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-lg bg-violet-100 dark:bg-[#5B35D5]/20 flex items-center justify-center">
								<Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 dark:text-[#5B35D5]" />
							</div>
							<div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
								Your Browser
							</div>
							<div className="text-[10px] sm:text-xs text-slate-500 dark:text-[#64748B] font-mono">
								Encrypts email locally
							</div>
							<div className="mt-3 inline-block px-2 py-1 rounded bg-violet-100 dark:bg-[#5B35D5]/10 text-violet-700 dark:text-[#5B35D5] text-[10px] sm:text-xs font-mono border border-violet-200 dark:border-[#5B35D5]/20">
								TweetNaCl.js
							</div>
						</div>

						{/* Arrow Mobile */}
						<div className="md:hidden flex justify-center">
							<div className="w-0.5 h-6 bg-gradient-to-b from-violet-500 to-amber-500" />
						</div>

						{/* Step 2: Herald (Limited) */}
						<div className="relative z-10 bg-slate-50 dark:bg-[#060D18] border border-amber-200 dark:border-[#E8920A] rounded-xl p-4 sm:p-5 text-center group hover:scale-[1.02] transition-transform">
							<div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-lg bg-amber-100 dark:bg-[#E8920A]/20 flex items-center justify-center">
								<Server className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-[#E8920A]" />
							</div>
							<div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
								Herald Servers
							</div>
							<div className="text-[10px] sm:text-xs text-slate-500 dark:text-[#64748B] font-mono">
								Sees only ciphertext
							</div>
							<div className="mt-3 inline-block px-2 py-1 rounded bg-rose-100 dark:bg-[#D63031]/10 text-rose-700 dark:text-[#D63031] text-[10px] sm:text-xs font-mono border border-rose-200 dark:border-[#D63031]/20">
								Cannot decrypt
							</div>
						</div>

						{/* Arrow Mobile */}
						<div className="md:hidden flex justify-center">
							<div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-emerald-500" />
						</div>

						{/* Step 3: Blockchain */}
						<div className="relative z-10 bg-slate-50 dark:bg-[#060D18] border border-emerald-200 dark:border-[#00C896] rounded-xl p-4 sm:p-5 text-center group hover:scale-[1.02] transition-transform">
							<div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-lg bg-emerald-100 dark:bg-[#00C896]/20 flex items-center justify-center">
								<Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-[#00C896]" />
							</div>
							<div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
								Solana Blockchain
							</div>
							<div className="text-[10px] sm:text-xs text-slate-500 dark:text-[#64748B] font-mono">
								Stores encrypted blob
							</div>
							<div className="mt-3 inline-block px-2 py-1 rounded bg-emerald-100 dark:bg-[#00C896]/10 text-emerald-700 dark:text-[#00C896] text-[10px] sm:text-xs font-mono border border-emerald-200 dark:border-[#00C896]/20">
								Immutable PDA
							</div>
						</div>
					</div>

					<div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-[#1A3A52] flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-[#64748B] font-mono">
						<Lock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-[#27AE60]" />
						<span className="text-center">Only the TEE can decrypt — and only at send time</span>
					</div>
				</div>

				{/* Main Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
					{privacyFeatures.map((feature, i) => (
						<div
							key={i}
							className={`group bg-white dark:bg-[#0D1F35] border border-slate-200 dark:border-[#1A3A52] rounded-2xl p-5 sm:p-6 hover:shadow-lg dark:hover:shadow-none hover:border-emerald-300 dark:hover:border-[#00C896]/50 transition-all duration-300 relative overflow-hidden`}
						>
							{/* Gradient blob effect */}
							<div
								className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.gradientFrom} to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
							/>

							<div
								className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.bgColor} ${feature.borderColor} border flex items-center justify-center mb-3 sm:mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300`}
							>
								<feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
							</div>
							<h2 className={`text-base sm:text-lg font-bold mb-2 ${feature.color} relative z-10`}>
								{feature.title}
							</h2>
							<p className="text-sm text-slate-600 dark:text-slate-400 leading-[1.6] sm:leading-[1.7] mb-3 relative z-10">
								{feature.content}
							</p>
							<div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-slate-500 dark:text-[#64748B] bg-slate-100 dark:bg-[#060D18] px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1A3A52] relative z-10">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								{feature.highlight}
							</div>
						</div>
					))}
				</div>

				{/* What We Never Store */}
				<div className="mb-12 sm:mb-16 bg-gradient-to-br from-rose-50 to-white dark:from-[#D63031]/5 dark:to-transparent border border-rose-200 dark:border-[#D63031]/20 rounded-2xl p-6 sm:p-8">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-rose-100 dark:bg-[#D63031]/10 flex items-center justify-center">
							<EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-[#D63031]" />
						</div>
						<h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
							What Herald Never Stores
						</h2>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{neverStores.map((item, i) => (
							<div
								key={i}
								className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 p-2 rounded-lg hover:bg-rose-50/50 dark:hover:bg-[#D63031]/5 transition-colors"
							>
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 dark:bg-[#060D18] border border-slate-200 dark:border-[#1A3A52] flex items-center justify-center shrink-0">
									<item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 dark:text-[#D63031]" />
								</div>
								<span className="line-through decoration-rose-400/50 dark:decoration-[#D63031]/50 decoration-2">
									{item.label}
								</span>
							</div>
						))}
					</div>

					<div className="mt-6 p-4 bg-slate-100 dark:bg-[#060D18] rounded-xl border border-slate-200 dark:border-[#1A3A52]">
						<p className="text-xs sm:text-sm text-slate-600 dark:text-[#64748B] leading-relaxed font-mono">
							<span className="text-rose-600 dark:text-[#D63031] font-semibold">
								Technical guarantee:
							</span>{" "}
							Even with complete database access, we cannot link wallet addresses to email addresses
							or read notification contents. The cryptographic keys never leave the TEE.
						</p>
					</div>
				</div>

				{/* Compliance & Additional Features */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
					{complianceItems.map((item, i) => (
						<div
							key={i}
							className="bg-white dark:bg-[#0D1F35] border border-slate-200 dark:border-[#1A3A52] rounded-2xl p-5 sm:p-6 hover:shadow-md dark:hover:shadow-none transition-shadow"
						>
							<div className="flex items-start gap-3 sm:gap-4">
								<div
									className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0`}
								>
									<item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
								</div>
								<div>
									<h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
										{item.title}
									</h3>
									<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
										{item.content}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Trust Badge */}
				<div className="text-center bg-white dark:bg-[#0D1F35] border border-slate-200 dark:border-[#1A3A52] rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-none">
					<div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
						<Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-[#00C896]" />
						<span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
							Audit-Ready Architecture
						</span>
					</div>
					<p className="text-sm text-slate-600 dark:text-slate-400 max-w-[500px] mx-auto mb-4 sm:mb-6">
						Our entire infrastructure is designed to be inspected. The code is open-source, the
						encryption happens in your browser, and the on-chain logic is verifiable.
					</p>
					<div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono">
						<span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-[#00C896]/10 text-emerald-700 dark:text-[#00C896] border border-emerald-200 dark:border-[#00C896]/20">
							Open Source
						</span>
						<span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-violet-100 dark:bg-[#5B35D5]/10 text-violet-700 dark:text-[#5B35D5] border border-violet-200 dark:border-[#5B35D5]/20">
							Audited Contracts
						</span>
						<span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-100 dark:bg-[#E8920A]/10 text-amber-700 dark:text-[#E8920A] border border-amber-200 dark:border-[#E8920A]/20">
							GDPR Compliant
						</span>
						<span className="px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-100 dark:bg-[#27AE60]/10 text-blue-700 dark:text-[#27AE60] border border-blue-200 dark:border-[#27AE60]/20">
							SOC 2 Type II
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
