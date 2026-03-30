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

    const { name, email, phoneNumber, countryCode, degree, destinations, startYear, courseInterests, investmentReadiness, academicScore, heardFrom, utm_source, utm_campaign, utm_adset, utm_ad, utm_medium } = await req.json();
    console.log('Creating lead for:', { name, email, phoneNumber: `${countryCode}${phoneNumber}` });

    // Prepare lead data for LeadSquared
    const leadData = [
      { "Attribute": "EmailAddress", "Value": email },
      { "Attribute": "FirstName", "Value": name },
      { "Attribute": "Phone", "Value": `${countryCode}${phoneNumber}` },
      { "Attribute": "Source", "Value": utm_source || "Website Lead Form" },
      ...(degree ? [{ "Attribute": "mx_Degree", "Value": degree }] : []),
      ...(destinations ? [{ "Attribute": "mx_Destinations", "Value": destinations }] : []),
      ...(startYear ? [{ "Attribute": "mx_Start_Year", "Value": startYear }] : []),
      ...(courseInterests ? [{ "Attribute": "mx_Course_Interests", "Value": courseInterests }] : []),
      ...(investmentReadiness ? [{ "Attribute": "mx_Investment_Readiness", "Value": investmentReadiness }] : []),
      ...(academicScore ? [{ "Attribute": "mx_Academic_Score", "Value": academicScore }] : []),
      ...(heardFrom ? [{ "Attribute": "mx_Heard_From", "Value": heardFrom }] : []),
      ...(utm_campaign ? [{ "Attribute": "mx_UTM_Campaign", "Value": utm_campaign }] : []),
      ...(utm_medium ? [{ "Attribute": "mx_UTM_Medium", "Value": utm_medium }] : []),
      ...(utm_adset ? [{ "Attribute": "mx_UTM_Adset", "Value": utm_adset }] : []),
      ...(utm_ad ? [{ "Attribute": "mx_UTM_Ad", "Value": utm_ad }] : []),
    ];

    const response = await fetch(
      `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=${accessKey}&secretKey=${secretKey}`,
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
