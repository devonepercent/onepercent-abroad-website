import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ErasmusTopBar from "@/components/ErasmusTopBar";
import { programCategories, PRICE, Program } from "@/lib/erasmusData";
import { styleFor } from "@/lib/erasmusIcons";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const PAGE_CSS = `
.font-poppins { font-family: Poppins, sans-serif; }
.font-inter { font-family: Inter, sans-serif; }
`;

const matches = (p: Program, q: string) => {
  const t = q.toLowerCase();
  return p.code.toLowerCase().includes(t) || p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t);
};

const ProgramCard = ({ prog }: { prog: Program }) => {
  const { Icon, color, bg } = styleFor(prog.category);
  return (
    <Link
      to={`/application/erasmus/program/${prog.id}`}
      className="bg-white border border-[#DCE7F6] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg hover:border-[#065DC7]/40 transition-all"
    >
      <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <div className="flex-1">
        <div className="font-poppins font-semibold text-[16px] text-[#040B2B]">{prog.code}</div>
        <div className="font-inter text-[13px] text-[#6B7A99] leading-5 mt-1">{prog.name}</div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#EFF4FB]">
        <span className="font-inter font-semibold text-[14px] text-[#040B2B]">{inr(PRICE)}</span>
        <span className="font-inter font-semibold text-[13px] text-[#065DC7]">View →</span>
      </div>
    </Link>
  );
};

const ErasmusPrograms = () => {
  const [query, setQuery] = useState("");
  // All categories start collapsed; searching auto-expands the matches.
  const [openSet, setOpenSet] = useState<Record<string, boolean>>({});
  const searching = query.trim().length > 0;
  const toggle = (name: string) => setOpenSet((s) => ({ ...s, [name]: !s[name] }));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    window.scrollTo(0, 0);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searching) return programCategories;
    return programCategories
      .map((cat) => ({ ...cat, programs: cat.programs.filter((p) => matches(p, query)) }))
      .filter((cat) => cat.programs.length > 0);
  }, [query, searching]);

  return (
    <div className="bg-[#FBFDFF] min-h-screen font-inter text-[#040B2B]">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <ErasmusTopBar back={{ to: "/application/erasmus", label: "Back" }} />

      <main className="max-w-[1248px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <h1 className="font-poppins font-semibold text-[26px] leading-8 md:text-[36px] md:leading-[44px] mb-2">
          Browse Erasmus Mundus Programmes
        </h1>
        <p className="font-inter text-[14px] md:text-[16px] text-[#6B7A99] mb-8">
          Flat {inr(PRICE)} per application. SOP, LORs, filing and deadline tracking all included.
        </p>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-[#DCE7F6] rounded-xl px-4 py-3 mb-10 max-w-[560px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7A99" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programmes, codes or fields…"
            className="flex-1 outline-none font-inter text-[15px] bg-transparent"
          />
          {searching && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[#6B7A99] text-lg leading-none">
              ×
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-[#6B7A99] border border-dashed border-[#DCE7F6] rounded-2xl py-14">
            No programmes match "{query}".
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map((cat) => {
            const { Icon, color, bg } = styleFor(cat.name);
            const open = searching ? true : !!openSet[cat.name];
            return (
              <section key={cat.name} className="bg-white border border-[#DCE7F6] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggle(cat.name)}
                  aria-expanded={open}
                  className={`w-full flex items-center gap-3 px-4 md:px-6 py-4 md:py-5 text-left ${
                    open ? "bg-[#F5F8FF]" : "bg-white hover:bg-[#F5F8FF]"
                  } transition-colors`}
                >
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <h2 className="font-poppins font-semibold text-[16px] md:text-[19px] flex-1">{cat.name}</h2>
                  <span className="font-inter text-[12px] text-[#6B7A99] bg-white border border-[#DCE7F6] rounded-full px-2.5 py-0.5 flex-shrink-0">
                    {cat.programs.length}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B7A99"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {open && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6 border-t border-[#EFF4FB]">
                    {cat.programs.map((p) => (
                      <ProgramCard key={p.id} prog={p} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ErasmusPrograms;
