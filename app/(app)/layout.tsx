"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { WalletAddressDisplay } from "@/components/wallet/WalletAddressDisplay";
import { WalletStatusBadge } from "@/components/wallet/WalletStatusBadge";
import Link from "next/link";
import { FaArrowRightFromBracket } from "react-icons/fa6";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { connected, connecting, publicKey, disconnect } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		
		const isRegisterPage = pathname.startsWith("/register");
		
		if (!connected && !connecting && !isRegisterPage) {
			router.replace("/");
		}
		
		// 2. Connected but status resolved
		if (connected && !isLoading && status) {
			if (!status.registered && !isRegisterPage) {
				router.replace("/register");
			} else if (status.registered && isRegisterPage) {
				router.replace("/notifications");
			}
		}
	}, [mounted, connected, connecting, isLoading, status, pathname, router]);

	// Show loading state while resolving
	if (!mounted || connecting || isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center p-12 text-text-muted">
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
			<header className="sticky top-0 z-40 bg-navy/85 backdrop-blur-md border-b border-border">
				<div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-4 sm:gap-8">
						<Link href="/notifications" className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
							Herald.
						</Link>
						
						{/* Only show nav links if fully registered */}
						{status?.registered && (
							<nav className="hidden md:flex items-center gap-5">
								<Link 
									href="/notifications" 
									className={pathname.startsWith("/notifications") ? "text-white text-sm font-bold" : "text-text-muted hover:text-white transition-colors text-sm font-semibold"}
								>
									Notifications
								</Link>
								<Link 
									href="/preferences" 
									className={pathname.startsWith("/preferences") ? "text-white text-sm font-bold" : "text-text-muted hover:text-white transition-colors text-sm font-semibold"}
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
						<button
							onClick={() => disconnect()}
							title="Disconnect"
							className="p-2 ml-1 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors"
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
