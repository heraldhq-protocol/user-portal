"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { WalletAddressDisplay } from "@/components/wallet/WalletAddressDisplay";
import { WalletStatusBadge } from "@/components/wallet/WalletStatusBadge";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { connected, connecting, publicKey, disconnect } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || connecting || isLoading) return;

		const isRegisterPage = pathname.startsWith("/register");

		// 1. If not connected, redirect to landing (root)
		if (!connected && !isRegisterPage) {
			router.replace("/");
			return;
		}

		// 2. If connected, check registration status
		if (connected && status) {
			if (!status.registered && !isRegisterPage) {
				// Connected but not registered on-chain -> go to register
				router.replace("/register");
			} else if (status.registered && isRegisterPage) {
				// Already registered but on register page -> go to notifications
				router.replace("/notifications");
			}
		}
	}, [mounted, connected, connecting, isLoading, status, pathname, router]);

	// Show loading state while resolving
	if (!mounted || connecting || isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center p-12 text-slate-500 dark:text-text-muted">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
					<p className="font-semibold text-sm">Authenticating your wallet...</p>
				</div>
			</div>
		);
	}

	// Double safety: blank screen before redirect executes
	const isRegisterPage = pathname.startsWith("/register");
	if (!connected && !isRegisterPage) {
		return null;
	}
	if (connected && !status?.registered && !isRegisterPage) {
		return null;
	}

	return (
		<div className="flex-1 flex flex-col min-h-screen">
			{/* Top Navigation Bar for authenticated portal */}
			<header className="sticky top-0 z-40 bg-white dark:bg-navy/85 backdrop-blur-md border-b border-slate-200 dark:border-border">
				<div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-4 sm:gap-8">
						<Link
							href="/notifications"
							className="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight"
						>
							<Image src="/logo_icon.svg" alt="Herald Logo" width={28} height={28} />
							Herald.
						</Link>

						{/* Only show nav links if fully registered */}
						{status?.registered && (
							<nav className="hidden md:flex items-center gap-5">
								<Link
									href="/notifications"
									className={
										pathname.startsWith("/notifications")
											? "text-slate-900 dark:text-white text-sm font-bold"
											: "text-slate-500 dark:text-text-muted hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold"
									}
								>
									Notifications
								</Link>
								<Link
									href="/preferences"
									className={
										pathname.startsWith("/preferences")
											? "text-slate-900 dark:text-white text-sm font-bold"
											: "text-slate-500 dark:text-text-muted hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold"
									}
								>
									Preferences
								</Link>
							</nav>
						)}
					</div>

					<div className="flex items-center gap-3">
						<WalletStatusBadge />
						{publicKey && (
							<div className="hidden sm:block">
								<WalletAddressDisplay address={publicKey.toBase58()} />
							</div>
						)}
						<ThemeToggle />
						<button
							onClick={() => disconnect()}
							title="Disconnect"
							className="p-2 ml-1 rounded-lg text-slate-500 dark:text-text-muted hover:text-red hover:bg-red/10 transition-colors"
						>
							<FaArrowRightFromBracket className="w-4 h-4" />
						</button>
					</div>
				</div>
			</header>

			<main id="main-content" className="flex-1 flex flex-col relative">
				{children}
			</main>
		</div>
	);
}
