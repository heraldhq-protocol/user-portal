"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { WalletAddressDisplay } from "@/components/wallet/WalletAddressDisplay";
import { WalletStatusBadge } from "@/components/wallet/WalletStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { connected, connecting, publicKey, disconnect } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();
	const { isAuthenticated } = useAuth();
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

		// 2. If connected but not registered on-chain -> go to register
		if (connected && status) {
			if (!status.registered && !isRegisterPage) {
				router.replace("/register");
				return;
			}

			// 3. If connected + registered but NOT authenticated (no JWT) -> go to register
			//    The wizard will detect isRegistered and show the login step
			if (status.registered && !isAuthenticated && !isRegisterPage) {
				router.replace("/register");
				return;
			}
		}
	}, [mounted, connected, connecting, isLoading, status, pathname, router, isAuthenticated]);

	// Show loading state while resolving
	if (!mounted || connecting || isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center p-12">
				<Loader message="Authenticating your wallet..." size="lg" />
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
	if (connected && status?.registered && !isAuthenticated && !isRegisterPage) {
		return null;
	}

	return (
		<div className="flex-1 flex flex-col min-h-screen">
			{/* Top Navigation Bar for authenticated portal */}
			<header className="sticky top-0 z-40 bg-white/80 dark:bg-navy/80 backdrop-blur-xl border-b border-slate-200 dark:border-border">
				<div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-6 sm:gap-8">
						<Link
							href="/notifications"
							className="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight shrink-0"
						>
							<Image src="/logo_icon.svg" alt="Herald Logo" width={28} height={28} />
							<span className="hidden xs:inline">Herald.</span>
						</Link>

						{status?.registered && (
							<nav className="flex items-center gap-4 sm:gap-6">
								<Link
									href="/notifications"
									className={cn(
										"text-xs sm:text-sm transition-all duration-200",
										pathname.startsWith("/notifications")
											? "text-teal font-bold"
											: "text-slate-500 hover:text-slate-900 dark:text-text-muted dark:hover:text-white font-semibold"
									)}
								>
									Notifications
								</Link>
								<Link
									href="/preferences"
									className={cn(
										"text-xs sm:text-sm transition-all duration-200",
										pathname.startsWith("/preferences")
											? "text-teal font-bold"
											: "text-slate-500 hover:text-slate-900 dark:text-text-muted dark:hover:text-white font-semibold"
									)}
								>
									Preferences
								</Link>
							</nav>
						)}
					</div>

					<div className="flex items-center gap-2 sm:gap-4">
						<WalletStatusBadge />

						{publicKey && (
							<div className="hidden lg:block">
								<WalletAddressDisplay address={publicKey.toBase58()} />
							</div>
						)}

						<div className="flex items-center gap-1 sm:gap-2">
							<ThemeToggle />
							<button
								onClick={() => disconnect()}
								title="Disconnect"
								className="p-2 rounded-xl text-slate-400 dark:text-text-muted hover:text-red hover:bg-red/10 transition-colors"
							>
								<FaArrowRightFromBracket className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</header>

			<main id="main-content" className="flex-1 flex flex-col relative">
				{children}
			</main>
		</div>
	);
}
