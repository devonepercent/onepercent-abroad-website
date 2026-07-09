// Erasmus Mundus application catalogue + checkout recommendations.
// Single flat price per application (UI prototype — no payment wired yet).

export const PRICE = 9900;

export interface Program {
  /** stable id used by the cart (unique per distinct product) */
  id: string;
  /** short programme code, e.g. "EMAI" */
  code: string;
  /** full programme name / description */
  name: string;
  /** owning category (the one shown in the catalogue) */
  category: string;
  /** optional note, e.g. dual-fit programmes */
  note?: string;
}

export interface Category {
  name: string;
  programs: Program[];
}

const slug = (code: string) =>
  code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const p = (code: string, name: string, category: string, note?: string): Program => ({
  id: slug(code),
  code,
  name,
  category,
  note,
});

// ── Main catalogue (the list shown on the page, grouped by category) ──
export const catalog: Category[] = [
  {
    name: "Data Science, AI & Computing",
    programs: [
      p("EMAI", "Erasmus Mundus in Artificial Intelligence", "Data Science, AI & Computing"),
      p("CoDaS", "Communications Engineering & Data Science", "Data Science, AI & Computing"),
      p("EDISS", "Engineering of Data-Intensive Intelligent Software Systems", "Data Science, AI & Computing"),
      p("EMECS", "European Master in Embedded Computing Systems", "Data Science, AI & Computing"),
    ],
  },
  {
    name: "Engineering, Robotics & Advanced Technologies",
    programs: [
      p("JEMARO", "Japan-Europe Master on Advanced Robotics", "Engineering, Robotics & Advanced Technologies"),
      p("QuanTEEM", "Quantum Technologies & Engineering", "Engineering, Robotics & Advanced Technologies"),
      p("BIOREF", "European Master in Biorefinery", "Engineering, Robotics & Advanced Technologies"),
    ],
  },
  {
    name: "Environmental Sustainability, Climate & Natural Resources",
    programs: [
      p("MESPOM", "Environmental Sciences, Policy & Management", "Environmental Sustainability, Climate & Natural Resources"),
      p("MERGED", "Global Environment & Development", "Environmental Sustainability, Climate & Natural Resources"),
      p("SUFONAMA", "Sustainable Forest & Nature Management", "Environmental Sustainability, Climate & Natural Resources"),
    ],
  },
  {
    name: "Agriculture, Food Systems & Biodiversity",
    programs: [
      p("PlantHealth", "Plant Health", "Agriculture, Food Systems & Biodiversity"),
      p("emPLANT", "Plant Breeding", "Agriculture, Food Systems & Biodiversity"),
      p("EMABG", "Animal Biodiversity & Genomics", "Agriculture, Food Systems & Biodiversity"),
      p("IMBRSea", "Marine Biological Resources", "Agriculture, Food Systems & Biodiversity"),
    ],
  },
  {
    name: "Health, Biotechnology & Life Sciences",
    programs: [
      p("NANOMED", "Nanomedicine for Drug Delivery", "Health, Biotechnology & Life Sciences"),
      p("BIOREF", "European Master in Biorefinery", "Health, Biotechnology & Life Sciences", "Dual fit with Engineering"),
    ],
  },
  {
    name: "Chemistry, Materials Science & Nanotechnology",
    programs: [
      p("MaMaSELF", "European Masters in Materials Science", "Chemistry, Materials Science & Nanotechnology"),
    ],
  },
  {
    name: "Public Policy, Governance & International Affairs",
    programs: [
      p("Mundus MAPP", "Master in Public Policy", "Public Policy, Governance & International Affairs"),
      p("IMSISS", "Security, Intelligence & Strategic Studies", "Public Policy, Governance & International Affairs"),
    ],
  },
  {
    name: "Psychology, Education & Human Development",
    programs: [
      p("Global MINDS", "Psychology of Global Mobility", "Psychology, Education & Human Development"),
    ],
  },
  {
    name: "Law, Society & Humanities",
    programs: [
      p("ARCHMAT", "Archaeological Materials Science", "Law, Society & Humanities"),
    ],
  },
];

// Flat lookup of every programme that exists anywhere (catalogue + recommendations).
export interface Recommendation extends Program {
  type: "popular" | "suggested"; // popular | "students who bought X also bought Y"
}

const r = (
  type: "popular" | "suggested",
  code: string,
  name: string,
  category: string,
): Recommendation => ({ ...p(code, name, category), type });

// ── Checkout recommendations (Popular + Suggested), grouped by category ──
export const recommendationGroups: { category: string; items: Recommendation[] }[] = [
  {
    category: "Data Science, AI & Computing",
    items: [
      r("popular", "EMAI", "Erasmus Mundus in Artificial Intelligence", "Data Science, AI & Computing"),
      r("popular", "CoDaS", "Communications Engineering & Data Science", "Data Science, AI & Computing"),
      r("popular", "EDISS", "Engineering of Data-Intensive Intelligent Software Systems", "Data Science, AI & Computing"),
      r("popular", "EMECS", "European Master in Embedded Computing Systems", "Data Science, AI & Computing"),
      r("suggested", "CyberMACS", "Cybersecurity", "Data Science, AI & Computing"),
      r("suggested", "NeuroData", "International Master in Brain & Data Science", "Data Science, AI & Computing"),
      r("suggested", "DEAI", "Data Analytics & AI Systems", "Data Science, AI & Computing"),
    ],
  },
  {
    category: "Engineering, Robotics & Advanced Technologies",
    items: [
      r("popular", "JEMARO", "Japan-Europe Master on Advanced Robotics", "Engineering, Robotics & Advanced Technologies"),
      r("popular", "QuanTEEM", "Quantum Technologies & Engineering", "Engineering, Robotics & Advanced Technologies"),
      r("popular", "BIOREF", "European Master in Biorefinery", "Engineering, Robotics & Advanced Technologies"),
      r("suggested", "IFROS", "Intelligent Field Robotic Systems", "Engineering, Robotics & Advanced Technologies"),
      r("suggested", "EMSSE", "European Master in Sustainable Systems Engineering", "Engineering, Robotics & Advanced Technologies"),
    ],
  },
  {
    category: "Environmental Sustainability, Climate & Natural Resources",
    items: [
      r("popular", "MESPOM", "Environmental Sciences, Policy & Management", "Environmental Sustainability, Climate & Natural Resources"),
      r("popular", "SUFONAMA", "Sustainable Forest & Nature Management", "Environmental Sustainability, Climate & Natural Resources"),
      r("popular", "MERGED", "Global Environment & Development", "Environmental Sustainability, Climate & Natural Resources"),
      r("suggested", "IMSOGLO", "International MSc in Soils & Global Change", "Environmental Sustainability, Climate & Natural Resources"),
      r("suggested", "Islands & Sustainability", "MSc Islands & Sustainability", "Environmental Sustainability, Climate & Natural Resources"),
    ],
  },
  {
    category: "Agriculture, Food Systems & Biodiversity",
    items: [
      r("popular", "IMBRSea", "Marine Biological Resources", "Agriculture, Food Systems & Biodiversity"),
      r("popular", "PlantHealth", "Plant Health", "Agriculture, Food Systems & Biodiversity"),
      r("popular", "emPLANT", "Plant Breeding", "Agriculture, Food Systems & Biodiversity"),
      r("popular", "EMABG", "Animal Biodiversity & Genomics", "Agriculture, Food Systems & Biodiversity"),
      r("suggested", "MEME", "Erasmus Mundus Master in Evolutionary Biology", "Agriculture, Food Systems & Biodiversity"),
      r("suggested", "TROPIMUNDO", "Tropical Biodiversity & Ecosystems", "Agriculture, Food Systems & Biodiversity"),
      r("suggested", "DANUBE", "Danube Agrifood Master", "Agriculture, Food Systems & Biodiversity"),
    ],
  },
  {
    category: "Health, Biotechnology & Life Sciences",
    items: [
      r("popular", "NANOMED", "Nanomedicine for Drug Delivery", "Health, Biotechnology & Life Sciences"),
      r("popular", "EMMBIOME", "Erasmus Mundus Master in Biomedical Engineering", "Health, Biotechnology & Life Sciences"),
      r("suggested", "BioPharm", "BioPharm", "Health, Biotechnology & Life Sciences"),
    ],
  },
  {
    category: "Public Policy, Governance & International Affairs",
    items: [
      r("popular", "Mundus MAPP", "Master in Public Policy", "Public Policy, Governance & International Affairs"),
      r("popular", "IMSISS", "Security, Intelligence & Strategic Studies", "Public Policy, Governance & International Affairs"),
      r("suggested", "EMGS", "European Masters in Global Studies", "Public Policy, Governance & International Affairs"),
      r("suggested", "EMMIR", "Migration & Intercultural Relations", "Public Policy, Governance & International Affairs"),
      r("suggested", "PIONEER", "Public Sector Innovation & eGovernance", "Public Policy, Governance & International Affairs"),
      r("suggested", "IMESS", "International Masters in Economy, State & Society", "Public Policy, Governance & International Affairs"),
      r("suggested", "GOALS", "Governance & Administration of Leisure and Sports", "Public Policy, Governance & International Affairs"),
    ],
  },
  {
    category: "Business, Economics & Finance",
    items: [
      r("suggested", "CEMS MIM", "Master in International Management", "Business, Economics & Finance"),
      r("suggested", "EMLE", "European Masters in Law & Economics", "Business, Economics & Finance"),
      r("suggested", "EPOG+", "Economic Policies for the Global Bifurcation", "Business, Economics & Finance"),
      r("suggested", "EGEI", "Economics of Globalisation & European Integration", "Business, Economics & Finance"),
      r("suggested", "EMJM Quantitative Economics", "Quantitative Economics", "Business, Economics & Finance"),
    ],
  },
  {
    category: "Psychology, Education & Human Development",
    items: [
      r("popular", "Global MINDS", "Psychology of Global Mobility", "Psychology, Education & Human Development"),
      r("suggested", "MARIHE", "Master in Research & Innovation in Higher Education", "Psychology, Education & Human Development"),
      r("suggested", "EDU_MIG", "Education, Migration & Diversity", "Psychology, Education & Human Development"),
    ],
  },
];

// Flat list of every recommendation across all categories.
export const allRecommendations: Recommendation[] = recommendationGroups.flatMap((g) => g.items);

// ── Full browsable programme list (catalogue + recommendation-only programmes),
//    deduped by id and grouped by category — powers the browse + detail pages. ──
export const programCategories: Category[] = (() => {
  const seen = new Set<string>();
  const byCat = new Map<string, Program[]>();
  const push = (prog: Program) => {
    if (seen.has(prog.id)) return;
    seen.add(prog.id);
    const arr = byCat.get(prog.category) ?? [];
    arr.push(prog);
    byCat.set(prog.category, arr);
  };
  catalog.forEach((c) => c.programs.forEach(push));
  recommendationGroups.forEach((g) => g.items.forEach((r) => push(r)));
  return [...byCat.entries()].map(([name, programs]) => ({ name, programs }));
})();

export const findProgram = (id: string): Program | undefined =>
  programCategories.flatMap((c) => c.programs).find((p) => p.id === id);

// Contextual suggestions for a specific programme ("students who applied to X
// also applied to…"). Prefers same-category programmes; falls back to popular.
export function suggestionsFor(program: { id: string; category: string }, limit = 4): Recommendation[] {
  const group = recommendationGroups.find((g) => g.category === program.category);
  let pool = (group ? group.items : []).filter((i) => i.id !== program.id);
  if (pool.length === 0) {
    pool = allRecommendations.filter((i) => i.type === "popular" && i.id !== program.id);
  }
  // popular first, then suggested
  pool = [...pool].sort((a, b) => (a.type === b.type ? 0 : a.type === "popular" ? -1 : 1));
  return pool.slice(0, limit);
}

// ── What every application includes (the bundle behind the flat fee) ──
export interface Inclusion {
  title: string;
  desc: string;
}

export const inclusions: Inclusion[] = [
  { title: "Application Filing", desc: "End-to-end submission, handled for you" },
  { title: "SOP", desc: "Statement of Purpose tailored per programme" },
  { title: "LORs", desc: "Recommendation letters drafted & managed" },
  { title: "Requirements Mapping", desc: "Eligibility & document checklist" },
  { title: "Deadline Tracking", desc: "Every intake & deadline monitored" },
  { title: "1:1 Student Support", desc: "A dedicated mentor throughout" },
];

// ── Winners marquee (placeholder content — swap images/names later) ──
export interface Winner {
  name: string;
  program: string;   // subtitle
  scholarship: string;
}

export const winners: Winner[] = [
  { name: "Aarav Menon", program: "EMAI — Artificial Intelligence", scholarship: "Full Erasmus Mundus Scholarship" },
  { name: "Sneha Pillai", program: "MESPOM — Environmental Policy", scholarship: "€49,000 Scholarship" },
  { name: "Rohan Das", program: "JEMARO — Advanced Robotics", scholarship: "Full Tuition + Stipend" },
  { name: "Fatima Noor", program: "IMBRSea — Marine Biology", scholarship: "Full Erasmus Mundus Scholarship" },
  { name: "Karthik Iyer", program: "Mundus MAPP — Public Policy", scholarship: "€47,000 Scholarship" },
  { name: "Ananya Rao", program: "NANOMED — Nanomedicine", scholarship: "Full Tuition Waiver" },
  { name: "Vivek Sharma", program: "EMECS — Embedded Computing", scholarship: "Full Erasmus Mundus Scholarship" },
  { name: "Meera Krishnan", program: "Global MINDS — Psychology", scholarship: "€46,000 Scholarship" },
];
