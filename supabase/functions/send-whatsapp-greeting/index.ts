import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('LIBROMI_TOKEN');
    if (!token) {
      console.error('Missing LIBROMI_TOKEN secret');
      throw new Error('WhatsApp credentials not configured');
    }

    const { fullName, phoneNumber, countryCode } = await req.json();

    // Extract first name only
    const firstName = (fullName as string).trim().split(/\s+/)[0];

    // Build E.164 digits-only: strip +, spaces, dashes from the combined number
    const rawPhone = `${countryCode}${phoneNumber}`;
    const e164Phone = rawPhone.replace(/[^\d]/g, "");

    console.log(`Sending WhatsApp greeting to ${e164Phone} for ${firstName}`);

    const payload = {
      to: e164Phone,
      type: "template",
      template: {
        name: "new_lead_greeting",
        language: {
          code: "en",
          policy: "deterministic",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: firstName,
              },
            ],
          },
        ],
      },
    };

    const response = await fetch("https://wa-api.cloud/api/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();

    if (response.status !== 200 && response.status !== 201) {
      console.error(`Libromi API error [${response.status}] for ${e164Phone}: ${resultText}`);
      return new Response(
        JSON.stringify({ success: false, status: response.status, error: resultText }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`WhatsApp message sent successfully to ${e164Phone}`);
    return new Response(
      JSON.stringify({ success: true, status: response.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-whatsapp-greeting error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
