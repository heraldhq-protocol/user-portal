"use client";

import React from "react";

const RegistrationInfographic = () => {
	return (
		<div className="w-full bg-slate-100 dark:bg-[#0D1F35] border dark:border-[#1A3A52] rounded-2xl p-6 md:p-8 overflow-hidden">
			{/* Header */}
			<div className="mb-6 md:mb-8">
				<h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-2">
					Registration Flow <span className="text-[#00C896]">— Zero PII Exposure</span>
				</h2>
				<p className="text-sm text-[#64748B] font-mono">
					Client-side encryption ensures Herald never sees your email address
				</p>
			</div>

			{/* Flow Diagram */}
			<div className="relative">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
					{/* Left Column: User Actions */}
					<div className="space-y-4">
						<div className="text-xs font-mono text-[#00C896] uppercase tracking-wider mb-4">
							In Your Browser
						</div>

						{/* Step 1 */}
						<div className="relative bg-white dark:bg-[#060D18] border border-[#5B35D5]/80 dark:border-[#1A3A52] rounded-xl p-4 hover:border-[#5B35D5] transition-colors">
							<div className="flex items-start gap-3">
								<div className="w-8 h-8 rounded-lg bg-[#5B35D5]/20 border border-[#5B35D5]/40 flex items-center justify-center text-[#5B35D5] font-bold text-sm shrink-0">
									1
								</div>
								<div>
									<h3 className="text-[#5B35D5] dark:text-white font-semibold text-sm mb-1">
										Connect Wallet
									</h3>
									<p className="text-xs text-slate-800 dark:text-[#64748B]">
										Phantom, Solflare, or Ledger connects via wallet-adapter
									</p>
								</div>
							</div>
						</div>

						{/* Arrow */}
						<div className="flex justify-center lg:justify-start lg:pl-6">
							<svg
								className="w-6 h-6 text-[#00C896] rotate-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M19 14l-7 7m0 0l-7-7m7 7V3"
								/>
							</svg>
						</div>

						{/* Step 2 */}
						<div className="relative bg-white dark:bg-[#060D18] border border-[#00C896]/80 dark:border-[#1A3A52] rounded-xl p-4 hover:border-[#00C896] transition-colors">
							<div className="flex items-start gap-3">
								<div className="w-8 h-8 rounded-lg bg-[#00C896]/20 border border-[#00C896]/40 flex items-center justify-center text-[#00C896] font-bold text-sm shrink-0">
									2
								</div>
								<div>
									<h3 className="text-[#00C896] dark:text-white font-semibold text-sm mb-1">
										Enter Email
									</h3>
									<p className="text-xs text-slate-800 dark:text-[#64748B]">
										Plaintext entered in form field — stays browser-only
									</p>
								</div>
							</div>
						</div>

						{/* Arrow */}
						<div className="flex justify-center lg:justify-start lg:pl-6">
							<svg
								className="w-6 h-6 text-[#E8920A] rotate-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M19 14l-7 7m0 0l-7-7m7 7V3"
								/>
							</svg>
						</div>

						{/* Step 3 - Encryption Highlight */}
						<div className="relative bg-linear-to-br dark:from-[#E8920A]/10 dark:to-[#060D18] from-white/5 to-[#E8920A]/10 border border-[#E8920A] rounded-xl p-4 shadow-lg shadow-[#E8920A]/5">
							<div className="absolute -top-2 left-4 px-2 py-0.5 bg-[#E8920A] text-white dark:text-[#060D18] text-[10px] font-bold rounded-full">
								CRITICAL STEP
							</div>
							<div className="flex items-start gap-3 mt-2">
								<div className="w-8 h-8 rounded-lg bg-[#E8920A]/20 border border-[#E8920A]/40 flex items-center justify-center text-[#E8920A] font-bold text-sm shrink-0">
									3
								</div>
								<div>
									<h3 className="text-[#E8920A] font-semibold text-sm mb-1">
										Client-Side Encryption
									</h3>
									<p className="text-xs text-slate-800 dark:text-[#64748B] mb-2">
										Email encrypted using TweetNaCl.js before transmission
									</p>
									<div className="flex flex-wrap gap-1.5">
										<span className="px-2 py-0.5 dark:bg-[#071520] bg-white border dark:border-[#1A3A52] border-[#E8920A] rounded text-[10px] text-[#E8920A] font-mono">
											ed25519→x25519
										</span>
										<span className="px-2 py-0.5 dark:bg-[#071520] bg-white border dark:border-[#1A3A52] border-[#E8920A] rounded text-[10px] text-[#E8920A] font-mono">
											random nonce
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Arrow */}
						<div className="flex justify-center lg:justify-start lg:pl-6">
							<svg
								className="w-6 h-6 text-[#5B35D5] rotate-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M19 14l-7 7m0 0l-7-7m7 7V3"
								/>
							</svg>
						</div>

						{/* Step 4 */}
						<div className="relative dark:bg-[#060D18] bg-white border dark:border-[#1A3A52] border-[#5B35D5] rounded-xl p-4 hover:border-[#5B35D5] transition-colors">
							<div className="flex items-start gap-3">
								<div className="w-8 h-8 rounded-lg bg-[#5B35D5]/20 border border-[#5B35D5]/40 flex items-center justify-center text-[#5B35D5] font-bold text-sm shrink-0">
									4
								</div>
								<div>
									<h3 className="text-[#5B35D5] dark:text-white font-semibold text-sm mb-1">
										Sign Transaction
									</h3>
									<p className="text-xs text-[#64748B]">
										Wallet signs register_identity() instruction
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column: Blockchain Storage */}
					<div className="lg:pt-12">
						<div className="text-xs font-mono text-[#5B35D5] uppercase tracking-wider mb-4">
							On Solana Blockchain
						</div>

						{/* PDA Card */}
						<div className="dark:bg-[#060D18] bg-white border dark:border-[#1A3A52] border-[#5B35D5] rounded-xl p-5 relative overflow-hidden">
							<div className="absolute top-0 right-0 w-32 h-32 bg-[#00C896]/5 rounded-full blur-2xl -mr-16 -mt-16" />

							<div className="flex items-center gap-2 mb-4">
								<div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
								<h3 className="text-[#00C896] font-bold text-sm">IdentityAccount PDA Created</h3>
							</div>

							<div className="space-y-3 font-mono text-xs">
								<div className="flex justify-between items-center py-2 border-b border-[#1A3A52]">
									<span className="text-[#64748B]">owner</span>
									<span className="text-black dark:text-white truncate max-w-[150px]">
										7xR4mKp2nQ...
									</span>
								</div>
								<div className="flex justify-between items-center py-2 border-b border-[#1A3A52]">
									<span className="text-[#64748B]">encrypted_email</span>
									<span className="text-[#E8920A]">[0x2A, 0xF3...]</span>
								</div>
								<div className="flex justify-between items-center py-2 border-b border-[#1A3A52]">
									<span className="text-[#64748B]">nonce</span>
									<span className="text-[#64748B]">[u8;24]</span>
								</div>
								<div className="flex justify-between items-center py-2">
									<span className="text-[#64748B]">opt_in_all</span>
									<span className="text-[#27AE60]">true</span>
								</div>
							</div>

							<div className="mt-4 pt-4 border-t border-[#1A3A52]">
								<p className="text-[10px] text-[#64748B] leading-relaxed">
									Seeds: <span className="text-[#00C896]">{'["identity", wallet_pubkey]'}</span>
								</p>
							</div>
						</div>

						{/* Security Callouts */}
						<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="bg-[#27AE60]/5 border border-[#27AE60]/30 rounded-lg p-3">
								<div className="text-[#27AE60] font-semibold text-xs mb-1">Herald CAN read</div>
								<ul className="text-[10px] text-[#64748B] space-y-1">
									<li>• Wallet public key</li>
									<li>• Encrypted blob (in TEE)</li>
									<li>• Opt-in preferences</li>
								</ul>
							</div>

							<div className="bg-[#D63031]/5 border border-[#D63031]/30 rounded-lg p-3">
								<div className="text-[#D63031] font-semibold text-xs mb-1">Herald CANNOT read</div>
								<ul className="text-[10px] text-[#64748B] space-y-1">
									<li>• Plaintext email</li>
									<li>• Even with DB access</li>
									<li>• Without your private key</li>
								</ul>
							</div>
						</div>

						{/* User Controls */}
						<div className="mt-4 dark:bg-[#060D18] bg-white border dark:border-[#1A3A52] border-[#5B35D5] rounded-lg p-4">
							<div className="text-xs font-semibold text-black dark:text-white mb-2">
								User Controls (Wallet-signed)
							</div>
							<div className="flex flex-wrap gap-2">
								<span className="px-2 py-1 dark:bg-[#0D1F35] bg-white dark:border-[#1A3A52] rounded text-[10px] text-[#64748B] border border-[#1A3A52]">
									update_identity()
								</span>
								<span className="px-2 py-1 dark:bg-[#0D1F35] bg-white dark:border-[#1A3A52] rounded text-[10px] text-[#64748B] border border-[#1A3A52]">
									toggle_opt_in()
								</span>
								<span className="px-2 py-1 dark:bg-[#0D1F35] bg-white dark:border-[#1A3A52] rounded text-[10px] text-[#D63031] border border-[#D63031]/30">
									delete_identity()
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Trust Badge */}
			<div className="mt-6 pt-4 border-t border-[#1A3A52] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#64748B] font-mono">
				<div className="flex items-center gap-2">
					<svg
						className="w-4 h-4 text-[#27AE60]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
					<span>GDPR Art.17 Compliant</span>
				</div>
				<div className="flex items-center gap-2">
					<svg
						className="w-4 h-4 text-[#E8920A]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
					<span>Client-side Encryption (TweetNaCl.js)</span>
				</div>
			</div>
		</div>
	);
};

export default RegistrationInfographic;
