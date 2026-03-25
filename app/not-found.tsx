import Link from "next/link";

export default function NotFoundPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
			<div className="text-[64px] mb-4">🔍</div>
			<h1 className="text-3xl font-extrabold tracking-tight mb-3">Page not found</h1>
			<p className="text-slate-500 dark:text-text-muted text-sm leading-relaxed max-w-sm mb-8">
				The page you&apos;re looking for doesn&apos;t exist or has been moved.
			</p>
			<Link
				href="/"
				className="inline-flex items-center gap-2 bg-teal text-navy font-bold text-[15px] px-7 py-3 rounded-[10px] hover:bg-teal-2 active:scale-[0.97] transition-all duration-150"
			>
				← Back to home
			</Link>
		</div>
	);
}
