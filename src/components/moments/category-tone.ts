import type { BadgeProps } from "@/components/ui/Badge";
import type { MomentCategory } from "@/lib/moments/schema";

/** Maps a moment category to a Badge tone so colour usage stays consistent. */
export const categoryTone: Record<MomentCategory, NonNullable<BadgeProps["tone"]>> = {
  funny: "primary",
  insightful: "accent",
  controversial: "warning",
  emotional: "accent",
  quotable: "success",
  surprising: "warning",
};
