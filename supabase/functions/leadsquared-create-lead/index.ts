import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get('LEADSQUARED_ACCESS_KEY');
    const secretKey = Deno.env.get('LEADSQUARED_SECRET_KEY');

    if (!accessKey || !secretKey) {
      console.error('Missing LeadSquared credentials');
      throw new Error('LeadSquared credentials not configured');
    }

    const { name, email, phoneNumber, countryCode } = await req.json();
    console.log('Creating lead for:', { name, email, phoneNumber: `${countryCode}${phoneNumber}` });

    // Prepare lead data for LeadSquared
    const leadData = [
      { "Attribute": "EmailAddress", "Value": email },
      { "Attribute": "FirstName", "Value": name },
      { "Attribute": "Phone", "Value": `${countryCode}${phoneNumber}` },
      { "Attribute": "Source", "Value": "Webinar Registration" }
    ];

    const response = await fetch(
      `https://api.leadsquared.com/v2/LeadManagement.svc/Lead.Create?accessKey=${accessKey}&secretKey=${secretKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      }
    );

    const result = await response.text();
    console.log('LeadSquared response:', result);

    if (!response.ok) {
      throw new Error(`LeadSquared API error: ${result}`);
    }

    return new Response(JSON.stringify({ success: true, result: JSON.parse(result) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating lead:', errorMessage);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
