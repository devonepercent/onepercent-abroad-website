import { Link } from "react-router-dom";
import { ArrowLeft, PhoneCall } from "lucide-react";
import logoBlue from "@/assets/logo-blue.png";

interface Props {
  /** When set, a back button replaces the logo (programme pages). */
  back?: { to: string; label?: string };
}

// Shared top bar for the erasmus browse / programme pages.
const ErasmusTopBar = ({ back }: Props) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#DCE7F6] px-4 md:px-8 py-3 flex items-center justify-between">
      {back ? (
        <Link
          to={back.to}
          className="inline-flex items-center gap-2 font-inter font-semibold text-[14px] text-[#040B2B] border border-[#DCE7F6] bg-white rounded-full px-4 py-2.5 hover:border-[#065DC7]/50 hover:text-[#065DC7]"
        >
          <ArrowLeft size={16} />
          {back.label ?? "Back"}
        </Link>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <img src={logoBlue} alt="OnePercent Abroad" className="h-8 w-auto" />
          </Link>
          <Link
            to="/application/erasmus"
            className="hidden sm:inline-flex items-center gap-1 text-[13px] font-inter font-medium text-[#6B7A99] hover:text-[#065DC7]"
          >
            <ArrowLeft size={14} />
            Erasmus Home
          </Link>
        </div>
      )}
      <Link
        to="/application/erasmus#erasmus-form"
        className="inline-flex items-center gap-2 bg-[#040B2B] text-white font-inter font-semibold text-[14px] px-5 py-2.5 rounded-full"
      >
        <PhoneCall size={16} />
        Talk to a counsellor
      </Link>
    </header>
  );
};

export default ErasmusTopBar;
