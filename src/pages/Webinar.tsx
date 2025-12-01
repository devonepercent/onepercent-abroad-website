import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const countryCodes = [{
  code: "+91",
  country: "India"
}, {
  code: "+1",
  country: "USA/Canada"
}, {
  code: "+92",
  country: "Pakistan"
}, {
  code: "+44",
  country: "UK"
}, {
  code: "+971",
  country: "UAE"
}, {
  code: "+86",
  country: "China"
}, {
  code: "+81",
  country: "Japan"
}, {
  code: "+82",
  country: "South Korea"
}, {
  code: "+65",
  country: "Singapore"
}, {
  code: "+60",
  country: "Malaysia"
}, {
  code: "+66",
  country: "Thailand"
}, {
  code: "+61",
  country: "Australia"
}, {
  code: "+64",
  country: "New Zealand"
}, {
  code: "+49",
  country: "Germany"
}, {
  code: "+33",
  country: "France"
}, {
  code: "+39",
  country: "Italy"
}, {
  code: "+34",
  country: "Spain"
}, {
  code: "+31",
  country: "Netherlands"
}, {
  code: "+32",
  country: "Belgium"
}, {
  code: "+41",
  country: "Switzerland"
}, {
  code: "+46",
  country: "Sweden"
}, {
  code: "+47",
  country: "Norway"
}, {
  code: "+45",
  country: "Denmark"
}, {
  code: "+358",
  country: "Finland"
}, {
  code: "+7",
  country: "Russia"
}, {
  code: "+27",
  country: "South Africa"
}, {
  code: "+20",
  country: "Egypt"
}, {
  code: "+966",
  country: "Saudi Arabia"
}, {
  code: "+974",
  country: "Qatar"
}, {
  code: "+973",
  country: "Bahrain"
}, {
  code: "+968",
  country: "Oman"
}, {
  code: "+965",
  country: "Kuwait"
}, {
  code: "+961",
  country: "Lebanon"
}, {
  code: "+962",
  country: "Jordan"
}, {
  code: "+90",
  country: "Turkey"
}, {
  code: "+55",
  country: "Brazil"
}, {
  code: "+52",
  country: "Mexico"
}, {
  code: "+54",
  country: "Argentina"
}, {
  code: "+57",
  country: "Colombia"
}, {
  code: "+51",
  country: "Peru"
}, {
  code: "+56",
  country: "Chile"
}];
const Webinar = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !countryCode || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from("webinar_registrations").insert({
        name,
        email,
        country_code: countryCode,
        phone_number: phoneNumber
      });
      if (error) throw error;
      toast({
        title: "Registration Successful!",
        description: "Redirecting you to the webinar..."
      });

      // Redirect to Google Meet on same tab
      window.location.href = "https://meet.google.com/bba-tewz-jpq";
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Onepercent scholar orientation session</h1>
            <p className="text-xl text-muted-foreground">Get scholarship worth  Lk</p>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-lg border">
            <h2 className="text-2xl font-semibold mb-6">Register Now</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country-code">Country Code *</Label>
                  <Select value={countryCode} onValueChange={setCountryCode} required>
                    <SelectTrigger id="country-code">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map(({
                      code,
                      country
                    }) => <SelectItem key={code} value={code}>
                          {code} ({country})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Enter phone number" required />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join the Webinar"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Webinar;