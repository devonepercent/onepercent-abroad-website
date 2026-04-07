import { useEffect } from "react";
import { trackMetaEvent, initHiringPixel } from "@/lib/metaPixel";

const HiringThankYou = () => {
  useEffect(() => {
    initHiringPixel();
    trackMetaEvent("Lead");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="max-w-md text-center bg-background rounded-xl shadow-lg p-8 border">
        <h1 className="text-3xl font-bold mb-4">Thank You for Applying</h1>
        <p className="text-muted-foreground mb-4">
          Our HR team will review your profile and contact shortlisted candidates.
        </p>
        <p className="text-sm text-muted-foreground">
          You can now close this tab. There are no additional steps required from your side.
        </p>
      </div>
    </div>
  );
};

export default HiringThankYou;

