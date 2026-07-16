import {
  Footprints,
  Hand,
  PersonStanding,
  Circle,
  type LucideIcon,
} from "lucide-react";

/** Maps a service `icon` key (see lib/services) to a Lucide icon. */
const iconMap: Record<string, LucideIcon> = {
  upper: Hand,
  lower: Footprints,
  whole: PersonStanding,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Circle;
  return <Icon className={className} aria-hidden="true" />;
}
