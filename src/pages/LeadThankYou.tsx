import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const LeadThankYou = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Thank you for registering!
        </h1>
        <p className="text-muted-foreground">
          Our team will reach out to you shortly. Meanwhile, feel free to explore our website or follow us on social media.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-xl">
            <a href="https://wa.me/919074100157?text=hi" target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/">Visit Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadThankYou;
