import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    console.log('Analyzing food image with Gemini 2.5 Flash...');

    // Call Lovable AI with Gemini 2.5 Flash for image analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide a detailed nutritional assessment. Return ONLY a valid JSON object with this exact structure:
{
  "food_name": "Name of the food item",
  "description": "Brief description",
  "calories": number (estimated per 100g),
  "carbs": number (grams per 100g),
  "protein": number (grams per 100g),
  "fat": number (grams per 100g),
  "health_score": number (0-10),
  "recommendation": "EAT" or "BUY" or "AVOID",
  "nutrition_score": number (0-10),
  "ingredient_quality": number (0-10),
  "additives_score": number (0-10),
  "health_risks": [
    {
      "nutrient": "nutrient name",
      "risk": "risk description",
      "explanation": "detailed explanation"
    }
  ],
  "alternatives": [
    {
      "name": "alternative name",
      "why_better": "reason",
      "how_helps": "benefits"
    }
  ]
}

Important:
- health_score should be 0-10 based on overall nutritional value
- recommendation: EAT (8-10), BUY (5-7), AVOID (0-4)
- Estimate macros per 100g
- Provide 2-3 health risks if any
- Suggest 2-3 healthier alternatives
- Return ONLY valid JSON, no markdown or additional text`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    console.log('Parsed analysis:', analysis);

    // Check if user is authenticated and save to database
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    let userId = null;

    if (authHeader) {
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;

      if (userId) {
        const { error: insertError } = await supabase
          .from('scans')
          .insert({
            user_id: userId,
            barcode: 'IMAGE_SCAN',
            product_name: analysis.food_name,
            brand: 'Image Analysis',
            health_score: analysis.health_score,
            recommendation: analysis.recommendation,
            nutrition_score: analysis.nutrition_score,
            ingredient_quality: analysis.ingredient_quality,
            additives_score: analysis.additives_score,
            carbs: analysis.carbs,
            protein: analysis.protein,
            fat: analysis.fat,
            calories: analysis.calories,
            health_risks: analysis.health_risks || [],
            alternatives: analysis.alternatives || [],
            product_image: null
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
        } else {
          console.log('Scan saved successfully for user:', userId);
        }
      }
    }

    return new Response(
      JSON.stringify({
        name: analysis.food_name,
        brand: 'Image Analysis',
        description: analysis.description,
        score: analysis.health_score,
        recommendation: analysis.recommendation,
        factors: {
          nutritionScore: analysis.nutrition_score,
          ingredientQuality: analysis.ingredient_quality,
          additives: analysis.additives_score
        },
        macros: {
          calories: analysis.calories,
          carbs: analysis.carbs,
          protein: analysis.protein,
          fat: analysis.fat
        },
        healthRisks: analysis.health_risks,
        alternatives: analysis.alternatives
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-food-image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
