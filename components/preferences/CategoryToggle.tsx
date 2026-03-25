import { Toggle } from "@/components/ui/Toggle";

interface CategoryToggleProps {
	label: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export function CategoryToggle({ label, description, checked, onChange }: CategoryToggleProps) {
	return (
		<div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-border last:border-b-0">
			<div>
				<div className="text-sm font-semibold text-slate-700 dark:text-text-secondary mb-0.5">
					{label}
				</div>
				<div className="text-xs text-slate-500 dark:text-text-muted">{description}</div>
			</div>
			<Toggle checked={checked} onCheckedChange={onChange} aria-label={`Toggle ${label}`} />
		</div>
	);
}
