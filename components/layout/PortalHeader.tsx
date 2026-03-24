"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PortalHeader() {
	const pathname = usePathname();

	return (
		<nav className="sticky top-0 z-99 flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-navy/92 backdrop-blur-xl">
			{/* Logo */}
			<Link href="/" className="flex items-center gap-2 group">
				<div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center text-sm font-extrabold text-navy">
					◈
				</div>
				<span className="font-extrabold text-lg tracking-tight">Herald</span>
			</Link>

			{/* Nav Links */}
			<div className="flex items-center gap-3 md:gap-7">
				<Link
					href="/"
					className={cn(
						"text-sm font-medium transition-colors hidden sm:block",
						pathname === "/" ? "text-text-secondary" : "text-text-muted hover:text-text-secondary"
					)}
				>
					Home
				</Link>
				<Link
					href="/how-it-works"
					className={cn(
						"text-sm font-medium transition-colors hidden sm:block",
						pathname === "/how-it-works"
							? "text-text-secondary"
							: "text-text-muted hover:text-text-secondary"
					)}
				>
					How it works
				</Link>
				<Link
					href="/register"
					className="inline-flex items-center gap-2 bg-teal text-navy font-bold text-sm px-4 py-2 hover:bg-teal-2 active:scale-[0.97] transition-all duration-150 rounded-lg shadow-sm"
				>
					Register
				</Link>
			</div>
		</nav>
	);
}
