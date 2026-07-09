// Flat 2D icon + tint per programme category (lucide icons, one hue each).
import {
  BrainCircuit,
  Bot,
  Leaf,
  Sprout,
  Dna,
  FlaskConical,
  Landmark,
  GraduationCap,
  Scale,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryStyle {
  Icon: LucideIcon;
  color: string;
  bg: string;
}

const categoryStyle: Record<string, CategoryStyle> = {
  "Data Science, AI & Computing": { Icon: BrainCircuit, color: "#065DC7", bg: "#EBF2FF" },
  "Engineering, Robotics & Advanced Technologies": { Icon: Bot, color: "#7C3AED", bg: "#F3E8FF" },
  "Environmental Sustainability, Climate & Natural Resources": { Icon: Leaf, color: "#059669", bg: "#D1FAE5" },
  "Agriculture, Food Systems & Biodiversity": { Icon: Sprout, color: "#65A30D", bg: "#ECFCCB" },
  "Health, Biotechnology & Life Sciences": { Icon: Dna, color: "#DC2626", bg: "#FEE2E2" },
  "Chemistry, Materials Science & Nanotechnology": { Icon: FlaskConical, color: "#EA580C", bg: "#FFEDD5" },
  "Public Policy, Governance & International Affairs": { Icon: Landmark, color: "#0891B2", bg: "#CFFAFE" },
  "Psychology, Education & Human Development": { Icon: GraduationCap, color: "#DB2777", bg: "#FCE7F3" },
  "Law, Society & Humanities": { Icon: Scale, color: "#B45309", bg: "#FEF3C7" },
  "Business, Economics & Finance": { Icon: TrendingUp, color: "#4F46E5", bg: "#E0E7FF" },
};

export const styleFor = (category: string): CategoryStyle =>
  categoryStyle[category] ?? { Icon: BookOpen, color: "#065DC7", bg: "#EBF2FF" };
