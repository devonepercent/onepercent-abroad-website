import { useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import ErasmusTopBar from "@/components/ErasmusTopBar";
import { findProgram, inclusions, suggestionsFor, PRICE } from "@/lib/erasmusData";
import { styleFor } from "@/lib/erasmusIcons";
import { useErasmusCart } from "@/lib/erasmusCart";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const PAGE_CSS = `
.font-poppins { font-family: Poppins, sans-serif; }
.font-inter { font-family: Inter, sans-serif; }
.bg-37 { background-image: linear-gradient(80.67deg, #61A2FE 14.27%, #065DC7 85.65%); }
`;

const GreenTick = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
    <circle cx="10" cy="10" r="10" fill="#1DD882" />
    <path d="M6 10.2 8.7 13 14 7.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const ErasmusProgram = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { has, add } = useErasmusCart();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const prog = id ? findProgram(id) : undefined;
  if (!prog) return <Navigate to="/application/erasmus/programs" replace />;

  const { Icon, color, bg } = styleFor(prog.category);
  const inCart = has(prog.id);
  const related = suggestionsFor(prog, 4);

  return (
    <div className="bg-[#FBFDFF] min-h-screen font-inter text-[#040B2B]">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <ErasmusTopBar back={{ to: "/application/erasmus/programs", label: "All programmes" }} />

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 md:gap-8">
          {/* Left: programme info */}
          <div className="bg-white border border-[#DCE7F6] rounded-2xl p-6 md:p-8">
            <span className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: bg, color }}>
              <Icon size={32} strokeWidth={1.6} />
            </span>

            <h1 className="font-poppins font-semibold text-[26px] leading-8 md:text-[34px] md:leading-[42px]">{prog.code}</h1>
            <p className="font-inter text-[16px] md:text-[18px] text-[#6B7A99] mt-1 mb-4">{prog.name}</p>

            <span
              className="inline-block font-inter font-semibold text-[12px] rounded-full px-3 py-1.5 mb-6"
              style={{ background: bg, color }}
            >
              {prog.category}
            </span>

            <p className="font-inter text-[14px] md:text-[15px] leading-6 text-[#40506B] mb-8">
              {prog.name} ({prog.code}) is an Erasmus Mundus Joint Master. You study in two or three European
              countries within one degree, and the EU scholarship covers full tuition, travel and a monthly living
              stipend worth ₹40 lakh+. We handle your entire application end-to-end for one flat fee.
            </p>

            <h2 className="font-poppins font-semibold text-[17px] mb-4">Every application includes</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inclusions.map((inc) => (
                <li key={inc.title} className="flex gap-2.5">
                  <GreenTick />
                  <div>
                    <div className="font-inter font-semibold text-[14px]">{inc.title}</div>
                    <div className="font-inter text-[12.5px] text-[#6B7A99] leading-4.5">{inc.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: price / actions */}
          <div className="md:sticky md:top-20 h-fit bg-white border border-[#DCE7F6] rounded-2xl p-6">
            <div className="flex items-baseline gap-2">
              <span className="font-inter font-bold text-[34px] tracking-tight">{inr(PRICE)}</span>
              <span className="font-inter text-[13px] text-[#6B7A99]">per application</span>
            </div>
            <div className="font-inter text-[13px] text-[#6B7A99] mt-1 mb-5">
              All-inclusive · agencies charge <span className="line-through">₹25,000+</span>
            </div>

            {inCart ? (
              <>
                <div className="w-full text-center font-poppins font-semibold text-[15px] text-[#065DC7] border-2 border-[#065DC7] rounded-[56px] py-4 mb-3 bg-[#EBF2FF]">
                  ✓ In your cart
                </div>
                <button
                  onClick={() => navigate("/application/erasmus/checkout")}
                  className="w-full bg-37 text-white font-poppins font-semibold text-[15px] rounded-[56px] py-4"
                >
                  Go to Cart →
                </button>
              </>
            ) : (
              <button
                onClick={() => add(prog)}
                className="w-full bg-37 text-white font-poppins font-semibold text-[15px] rounded-[56px] py-4"
              >
                Add to Cart
              </button>
            )}

            <p className="font-inter text-[12px] text-[#6B7A99] text-center mt-4 leading-5">
              The EU allows scholarship applications to a maximum of 3 programmes per intake.
            </p>
          </div>
        </div>

        {/* Related programmes */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-poppins font-semibold text-[20px] md:text-[24px] mb-5">Students also applied to</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => {
                const s = styleFor(r.category);
                return (
                  <Link
                    key={r.id}
                    to={`/application/erasmus/program/${r.id}`}
                    className="bg-white border border-[#DCE7F6] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg hover:border-[#065DC7]/40 transition-all"
                  >
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                      <s.Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div>
                      <div className="font-poppins font-semibold text-[15px]">{r.code}</div>
                      <div className="font-inter text-[12.5px] text-[#6B7A99] leading-4 mt-1">{r.name}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ErasmusProgram;
