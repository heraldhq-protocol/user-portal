import { Toggle } from "@/components/ui/Toggle";

interface CategoryToggleProps {
	label: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export function CategoryToggle({ label, description, checked, onChange }: CategoryToggleProps) {
	return (
		<div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-b-0">
			<div className="flex-1 min-w-0">
				<div className="text-sm font-semibold text-text-secondary w-full truncate mb-0.5">
					{label}
				</div>
				<div className="text-xs text-text-muted">{description}</div>
			</div>
			<div className="shrink-0">
				<Toggle checked={checked} onCheckedChange={onChange} aria-label={`Toggle ${label}`} />
			</div>
		</div>
	);
}
