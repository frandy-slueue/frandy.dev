interface ChipProps {
  label: string;
  /** Optional extra class names */
  className?: string;
}

/**
 * Pill-style chip for skills, technologies, and status badges.
 * Hover interaction is handled in globals.css via .chip:hover.
 */
export default function Chip({ label, className = "" }: ChipProps) {
  return (
    <span className={`chip ${className}`.trim()}>
      {label}
    </span>
  );
}
