import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, cvText, jobRequirements } = await req.json();
    
    if (!candidateId || !cvText || !jobRequirements) {
      return new Response(
        JSON.stringify({ error: 'candidateId, cvText, and jobRequirements are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing CV for candidate:', candidateId);

    // Call Lovable AI to analyze CV match
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert HR analyst. Analyze how well a candidate's CV matches the job requirements. 
            Provide a match percentage (0-100) based on:
            - Skills match
            - Experience relevance
            - Education requirements
            - Overall fit
            
            Return ONLY a JSON object with this exact structure:
            {
              "matchPercentage": <number between 0-100>,
              "analysis": "<brief explanation of the match>"
            }`
          },
          {
            role: 'user',
            content: `Job Requirements:\n${jobRequirements}\n\nCandidate CV:\n${cvText}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);
    
    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: try to extract percentage from text
      const percentMatch = aiContent.match(/(\d+)%/);
      const percentage = percentMatch ? parseInt(percentMatch[1]) : 50;
      result = {
        matchPercentage: Math.min(100, Math.max(0, percentage)),
        analysis: aiContent
      };
    }

    // Update candidate with match percentage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ match_percentage: result.matchPercentage })
      .eq('id', candidateId);

    if (updateError) {
      console.error('Error updating candidate:', updateError);
      throw updateError;
    }

    console.log('Successfully updated candidate with match percentage:', result.matchPercentage);

    return new Response(
      JSON.stringify({
        matchPercentage: result.matchPercentage,
        analysis: result.analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-cv function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});