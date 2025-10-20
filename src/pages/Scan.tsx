import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductResult {
  name: string;
  brand: string;
  score: number;
  recommendation: "EAT" | "BUY" | "AVOID";
  factors: {
    nutritionScore: number;
    ingredientQuality: number;
    additives: number;
  };
  image?: string;
}

const Scan = () => {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);

  const handleScan = async () => {
    if (!barcode.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { barcode }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Product analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast.error("Failed to analyze product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-lime-600";
    if (score >= 4) return "text-yellow-600";
    if (score >= 2) return "text-orange-600";
    return "text-red-600";
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === "EAT") return "bg-green-100 text-green-800 border-green-300";
    if (rec === "BUY") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Scan a Product</h1>
          <p className="text-muted-foreground">
            Enter a barcode to analyze the product's nutritional value
          </p>
        </div>

        {/* Scanner Input */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter barcode (e.g., 3017620422003)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={handleScan} 
              disabled={loading}
              size="lg"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ScanBarcode className="h-5 w-5" />
              )}
              Analyze
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Try example: 3017620422003 (Nutella)
          </p>
        </Card>

        {/* Results Display */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Product Info */}
            <Card className="p-6">
              <div className="flex gap-6">
                {result.image && (
                  <img 
                    src={result.image} 
                    alt={result.name}
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{result.name}</h2>
                  <p className="text-muted-foreground">{result.brand}</p>
                </div>
              </div>
            </Card>

            {/* Health Score */}
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium mb-4">Health Score</h3>
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score)}`}>
                {result.score.toFixed(1)}/10
              </div>
              <div className={`inline-block px-6 py-3 rounded-full border-2 font-bold text-lg ${getRecommendationColor(result.recommendation)}`}>
                {result.recommendation}
              </div>
            </Card>

            {/* Factor Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Nutrition Score</span>
                    <span className="font-semibold">{result.factors.nutritionScore}/10</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${result.factors.nutritionScore * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Ingredient Quality</span>
                    <span className="font-semibold">{result.factors.ingredientQuality}/10</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${result.factors.ingredientQuality * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Additives Score</span>
                    <span className="font-semibold">{result.factors.additives}/10</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${result.factors.additives * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
