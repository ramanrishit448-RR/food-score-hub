import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    console.log('Analyzing barcode:', barcode);

    // Fetch product data from Open Food Facts
    const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const offData = await offResponse.json();

    if (!offData.product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const product = offData.product;
    console.log('Product found:', product.product_name);

    // Extract nutritional data
    const nutriments = product.nutriments || {};
    const ingredients = product.ingredients_text || '';
    const additives = product.additives_tags || [];
    const nova_group = product.nova_group || 0;
    const nutriscore_grade = product.nutriscore_grade || '';

    // Prepare data for AI analysis
    const analysisPrompt = `Analyze this food product and provide a health score from 0-10:

Product: ${product.product_name || 'Unknown'}
Brand: ${product.brands || 'Unknown'}

Nutritional Data (per 100g):
- Energy: ${nutriments.energy_100g || 'N/A'} kcal
- Fat: ${nutriments.fat_100g || 'N/A'}g
- Saturated Fat: ${nutriments['saturated-fat_100g'] || 'N/A'}g
- Carbohydrates: ${nutriments.carbohydrates_100g || 'N/A'}g
- Sugars: ${nutriments.sugars_100g || 'N/A'}g
- Fiber: ${nutriments.fiber_100g || 'N/A'}g
- Protein: ${nutriments.proteins_100g || 'N/A'}g
- Salt: ${nutriments.salt_100g || 'N/A'}g

Additional Info:
- NOVA Group: ${nova_group} (1=unprocessed, 4=ultra-processed)
- Nutri-Score: ${nutriscore_grade.toUpperCase() || 'N/A'}
- Number of Additives: ${additives.length}
- Ingredients Preview: ${ingredients.substring(0, 200)}

Please analyze and return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "health_score": <number 0-10>,
  "recommendation": "<EAT|BUY|AVOID>",
  "nutrition_score": <number 0-10>,
  "ingredient_quality": <number 0-10>,
  "additives_score": <number 0-10>
}

Scoring guidelines:
- health_score: Overall assessment (8-10=excellent, 6-7=good, 4-5=moderate, 2-3=poor, 0-1=very poor)
- recommendation: EAT (score 7+), BUY (score 4-6), AVOID (score 0-3)
- nutrition_score: Based on macro/micronutrients balance
- ingredient_quality: Based on processing level and ingredient list
- additives_score: Penalize for number and type of additives`;

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
            content: 'You are a nutrition expert AI. Analyze food products and provide health scores. Always respond with valid JSON only, no markdown formatting.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    let analysisResult;
    try {
      const content = aiData.choices[0].message.content.trim();
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiData.choices[0].message.content);
      // Fallback scoring based on nutriscore
      const fallbackScore = nutriscore_grade === 'a' ? 8 : 
                           nutriscore_grade === 'b' ? 6 : 
                           nutriscore_grade === 'c' ? 5 : 
                           nutriscore_grade === 'd' ? 3 : 2;
      analysisResult = {
        health_score: fallbackScore,
        recommendation: fallbackScore >= 7 ? 'EAT' : fallbackScore >= 4 ? 'BUY' : 'AVOID',
        nutrition_score: fallbackScore,
        ingredient_quality: Math.max(1, 10 - nova_group * 2),
        additives_score: Math.max(1, 10 - additives.length * 0.5)
      };
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;

      // Save scan to database if user is authenticated
      if (userId) {
        const { error: insertError } = await supabase.from('scans').insert({
          user_id: userId,
          barcode,
          product_name: product.product_name || 'Unknown Product',
          brand: product.brands || null,
          health_score: analysisResult.health_score,
          recommendation: analysisResult.recommendation,
          nutrition_score: analysisResult.nutrition_score,
          ingredient_quality: analysisResult.ingredient_quality,
          additives_score: analysisResult.additives_score,
          product_image: product.image_url || null,
        });

        if (insertError) {
          console.error('Error saving scan:', insertError);
        } else {
          console.log('Scan saved successfully for user:', userId);
        }
      }
    }

    // Return results
    const result = {
      name: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      score: analysisResult.health_score,
      recommendation: analysisResult.recommendation,
      factors: {
        nutritionScore: analysisResult.nutrition_score,
        ingredientQuality: analysisResult.ingredient_quality,
        additives: analysisResult.additives_score,
      },
      image: product.image_url || null,
    };

    console.log('Analysis complete:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-product function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
