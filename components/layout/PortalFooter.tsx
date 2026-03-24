import Link from "next/link";

export function PortalFooter() {
	return (
		<footer className="border-t border-border px-4 md:px-8 py-8 mt-auto">
			<div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
				{/* Left: Logo + copyright */}
				<div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 bg-teal rounded-md flex items-center justify-center text-xs font-extrabold text-navy">
							◈
						</div>
						<span className="font-bold text-sm">Herald</span>
					</div>
					<span className="text-xs text-text-muted">
						© {new Date().getFullYear()} Herald. All rights reserved.
					</span>
				</div>

				{/* Right: Links */}
				<div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
					<Link
						href="/privacy"
						className="text-xs text-text-muted hover:text-text-secondary transition-colors"
					>
						Privacy
					</Link>
					<Link
						href="/how-it-works"
						className="text-xs text-text-muted hover:text-text-secondary transition-colors"
					>
						How it works
					</Link>
					<span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-card px-3 py-1.5 rounded-md border border-border">
						⚡ Built on Solana
					</span>
				</div>
			</div>
		</footer>
	);
}
