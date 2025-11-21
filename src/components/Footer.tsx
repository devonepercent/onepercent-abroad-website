import logoWhite from "@/assets/logo-white.png";

const Footer = () => {
  return (
    <footer className="bg-primary border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src={logoWhite} alt="OnePercent Abroad" className="h-10 w-auto" />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Your trusted partner in university admissions.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-xs">
              Services
            </h3>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              Master's
            </a>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              PhD
            </a>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              Undergraduate
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-xs">
              Company
            </h3>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              About Us
            </a>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              How it Works
            </a>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              Testimonials
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-xs">
              Legal
            </h3>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-sm text-gray-300 hover:text-white transition-colors" href="#">
              Terms of Service
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-xs">
              Follow Us
            </h3>
            <div className="flex gap-4 text-gray-400">
              <a className="hover:text-white transition-colors" href="#">
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a className="hover:text-white transition-colors" href="#">
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a className="hover:text-white transition-colors" href="#">
                <svg
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect height="12" width="4" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 OnePercent Abroad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
