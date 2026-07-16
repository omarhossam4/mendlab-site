import {
  Activity,
  Circle,
  Droplet,
  Hand,
  Layers,
  Syringe,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Maps a service `icon` key (see lib/services) to a Lucide icon. */
const iconMap: Record<string, LucideIcon> = {
  circle: Circle,
  droplet: Droplet,
  zap: Zap,
  hand: Hand,
  needle: Syringe,
  activity: Activity,
  layers: Layers,
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
