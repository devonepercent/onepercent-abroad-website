import { CheckCircle2 } from "lucide-react";

const ApplicationHelpThankYou = () => {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-center px-8 md:px-12 py-12 md:py-16">
        <img src="/logo-blue.png" alt="OnePercent Abroad" className="h-9 w-auto mx-auto mb-8" />

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-primary" />
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-3">
          Got it!
        </h1>
        <p className="text-base text-muted-foreground mb-2">
          Our team will reach out within 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          We'll review your offer details and get back to you with next-step guidance — visa, finance, post-admit support, whatever you need.
        </p>

        <a
          href="/"
          className="inline-flex items-center mt-10 px-6 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-all"
        >
          Back to home
        </a>
      </div>
    </div>
  );
};

export default ApplicationHelpThankYou;
