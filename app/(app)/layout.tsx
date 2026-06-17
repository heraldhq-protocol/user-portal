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
import { Menu, X, Bell, Settings, Bookmark, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeyRotationBanner } from "@/components/layout/KeyRotationBanner";

const NAV_LINKS = [
	{ href: "/notifications", label: "Notifications", icon: Bell },
	{ href: "/preferences", label: "Preferences", icon: Settings },
	{ href: "/subscriptions", label: "Subscriptions", icon: Bookmark },
	{ href: "/discover", label: "Discover", icon: Compass },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { connected, connecting, publicKey } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();
	const { isAuthenticated, logout } = useAuth();
	const [mounted, setMounted] = useState(false);
	const [isEmbedded, setIsEmbedded] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
		if (typeof window !== "undefined") {
			const embedded = window.self !== window.top || window.location.search.includes("embed=true");
			setIsEmbedded(embedded);
		}
	}, []);

	// Close mobile menu on route change
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMenuOpen(false);
	}, [pathname]);

	// Lock body scroll when menu is open
	useEffect(() => {
		if (menuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => { document.body.style.overflow = ""; };
	}, [menuOpen]);

	useEffect(() => {
		if (!mounted || connecting || isLoading) return;

		const isRegisterPage = pathname.startsWith("/register");

		if (!connected && !isRegisterPage) {
			router.replace("/");
			return;
		}

		if (connected && status) {
			if (!status.registered && !isRegisterPage) {
				router.replace("/register");
				return;
			}
			if (status.registered && !isAuthenticated && !isRegisterPage) {
				// Session expired — preserve the intended destination so we can
				// redirect back after a successful login.
				router.replace(`/register?redirect=${encodeURIComponent(pathname)}`);
				return;
			}
		}
	}, [mounted, connected, connecting, isLoading, status, pathname, router, isAuthenticated]);

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
			{!isEmbedded && <KeyRotationBanner />}
			{!isEmbedded && (
				<header className="sticky top-0 z-40 bg-navy/80 backdrop-blur-xl border-b border-border">
					<div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

						{/* Left: logo + desktop nav */}
						<div className="flex items-center gap-6 sm:gap-8">
							<Link
								href="/notifications"
								className="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-text-primary tracking-tight shrink-0"
							>
								<Image src="/logo_icon.svg" alt="Herald Logo" width={28} height={28} />
								<span className="hidden sm:inline">Herald.</span>
							</Link>

							{status?.registered && (
								<nav className="hidden sm:flex items-center gap-4 sm:gap-6">
									{NAV_LINKS.map(({ href, label }) => (
										<Link
											key={href}
											href={href}
											className={cn(
												"text-sm transition-all duration-200 font-semibold",
												pathname.startsWith(href)
													? "text-teal font-bold"
													: "text-text-muted hover:text-text-primary"
											)}
										>
											{label}
										</Link>
									))}
								</nav>
							)}
						</div>

						{/* Right: badges + theme + disconnect (desktop) + hamburger (mobile) */}
						<div className="flex items-center gap-2 sm:gap-3">
							<WalletStatusBadge compact />
							{process.env.NEXT_PUBLIC_RPC_CLUSTER && process.env.NEXT_PUBLIC_RPC_CLUSTER.replace(/['"]+/g, "").trim() !== "mainnet-beta" && (
								<span className="px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-[9px] font-bold text-amber-500 uppercase tracking-wider shrink-0">
									{process.env.NEXT_PUBLIC_RPC_CLUSTER.replace(/['"]+/g, "").trim()}
								</span>
							)}

							{publicKey && (
								<div className="hidden lg:block">
									<WalletAddressDisplay address={publicKey.toBase58()} />
								</div>
							)}

							<div className="hidden sm:flex items-center gap-1 sm:gap-2">
								<ThemeToggle />
								<button
									onClick={() => logout()}
									title="Disconnect"
									className="p-2 rounded-xl text-text-muted hover:text-herald-red hover:bg-herald-red/10 transition-colors"
								>
									<FaArrowRightFromBracket className="w-4 h-4" />
								</button>
							</div>

							{/* Hamburger — mobile only */}
							{status?.registered && (
								<button
									onClick={() => setMenuOpen(true)}
									className="sm:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-card transition-colors"
									aria-label="Open menu"
								>
									<Menu className="w-5 h-5" />
								</button>
							)}
						</div>
					</div>
				</header>
			)}

			{/* Mobile side drawer */}
			{menuOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden"
						onClick={() => setMenuOpen(false)}
						aria-hidden="true"
					/>

					{/* Drawer panel */}
					<div className="fixed top-0 right-0 z-50 h-full w-72 bg-navy border-l border-border flex flex-col sm:hidden animate-in slide-in-from-right duration-200">
						{/* Drawer header */}
						<div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
							<Link
								href="/notifications"
								onClick={() => setMenuOpen(false)}
								className="flex items-center gap-2 font-extrabold text-lg text-text-primary tracking-tight"
							>
								<Image src="/logo_icon.svg" alt="Herald Logo" width={24} height={24} />
								Herald.
							</Link>
							<button
								onClick={() => setMenuOpen(false)}
								className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-card transition-colors"
								aria-label="Close menu"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Nav links */}
						<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
							{NAV_LINKS.map(({ href, label, icon: Icon }) => {
								const active = pathname.startsWith(href);
								return (
									<Link
										key={href}
										href={href}
										onClick={() => setMenuOpen(false)}
										className={cn(
											"flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150",
											active
												? "bg-teal/10 text-teal border border-teal/20"
												: "text-text-muted hover:text-text-primary hover:bg-card border border-transparent"
										)}
									>
										<Icon className={cn("w-4 h-4 shrink-0", active ? "text-teal" : "text-text-muted")} />
										{label}
									</Link>
								);
							})}
						</nav>

						{/* Drawer footer: wallet + actions */}
						<div className="border-t border-border px-5 py-4 space-y-3 shrink-0">
							{publicKey && (
								<div className="px-1">
									<WalletAddressDisplay address={publicKey.toBase58()} />
								</div>
							)}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<WalletStatusBadge />
									{process.env.NEXT_PUBLIC_RPC_CLUSTER && process.env.NEXT_PUBLIC_RPC_CLUSTER.replace(/['"]+/g, "").trim() !== "mainnet-beta" && (
										<span className="px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-[9px] font-bold text-amber-500 uppercase tracking-wider shrink-0">
											{process.env.NEXT_PUBLIC_RPC_CLUSTER.replace(/['"]+/g, "").trim()}
										</span>
									)}
								</div>
								<div className="flex items-center gap-2">
									<ThemeToggle />
									<button
										onClick={() => { logout(); setMenuOpen(false); }}
										title="Disconnect"
										className="p-2 rounded-xl text-text-muted hover:text-herald-red hover:bg-herald-red/10 transition-colors"
									>
										<FaArrowRightFromBracket className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			<main id="main-content" className="flex-1 flex flex-col relative">
				{children}
			</main>
		</div>
	);
}
