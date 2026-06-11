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
	const { connected, connecting, publicKey } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();
	const { isAuthenticated, logout } = useAuth();
	const [mounted, setMounted] = useState(false);
	const [isEmbedded, setIsEmbedded] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
		if (typeof window !== "undefined") {
			const embedded = window.self !== window.top || window.location.search.includes("embed=true");
			setIsEmbedded(embedded);
		}
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
			<div className="flex-1 flex flex-col items-center justify-center min-h-dvh gap-4 px-4">
				<div className="relative">
					<div className="absolute inset-0 rounded-full bg-teal/20 blur-2xl scale-150" />
					<Image src="/logo_icon.svg" alt="Herald Logo" width={40} height={40} className="relative z-10" />
				</div>
				<Loader message="Authenticating your wallet..." size="lg" />
				<p className="text-text-muted text-sm">Checking your wallet and loading your portal...</p>
			</div>
		);
	}

	// Double safety: branded splash screen before redirect executes
	const isRegisterPage = pathname.startsWith("/register");
	if (!connected && !isRegisterPage) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
				<Image src="/logo_icon.svg" alt="Herald Logo" width={36} height={36} />
				<p className="text-text-muted text-sm">Redirecting to home...</p>
			</div>
		);
	}
	if (connected && !status?.registered && !isRegisterPage) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
				<Image src="/logo_icon.svg" alt="Herald Logo" width={36} height={36} />
				<p className="text-text-muted text-sm">Redirecting to registration...</p>
			</div>
		);
	}
	if (connected && status?.registered && !isAuthenticated && !isRegisterPage) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
				<Image src="/logo_icon.svg" alt="Herald Logo" width={36} height={36} />
				<p className="text-text-muted text-sm">Signing you in...</p>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-h-dvh">
			{/* Top Navigation Bar for authenticated portal */}
			{!isEmbedded && (
				<header className="sticky top-0 z-40 bg-navy/80 backdrop-blur-xl border-b border-border">
					<div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
						<div className="flex items-center gap-6 sm:gap-8">
							<Link
								href="/notifications"
								className="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-text-primary tracking-tight shrink-0"
							>
								<Image src="/logo_icon.svg" alt="Herald Logo" width={28} height={28} />
								<span className="hidden sm:inline">Herald.</span>
							</Link>

							{status?.registered && (
								<nav className="flex items-center gap-4 sm:gap-6">
									<Link
										href="/notifications"
										className={cn(
											"text-xs sm:text-sm transition-all duration-200",
											pathname.startsWith("/notifications")
												? "text-teal font-bold"
												: "text-text-muted hover:text-text-primary font-semibold"
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
												: "text-text-muted hover:text-text-primary font-semibold"
										)}
									>
										Preferences
									</Link>
									<Link
										href="/subscriptions"
										className={cn(
											"text-xs sm:text-sm transition-all duration-200",
											pathname.startsWith("/subscriptions")
												? "text-teal font-bold"
												: "text-text-muted hover:text-text-primary font-semibold"
										)}
									>
										Subscriptions
									</Link>
									<Link
										href="/discover"
										className={cn(
											"text-xs sm:text-sm transition-all duration-200",
											pathname.startsWith("/discover")
												? "text-teal font-bold"
												: "text-text-muted hover:text-text-primary font-semibold"
										)}
									>
										Discover
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
									onClick={() => logout()}
									title="Disconnect"
									className="p-2 rounded-xl text-text-muted hover:text-herald-red hover:bg-herald-red/10 transition-colors"
								>
									<FaArrowRightFromBracket className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</header>
			)}

			<main id="main-content" className="flex-1 flex flex-col relative">
				{children}
			</main>
		</div>
	);
}
