import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Loader2, Camera, Keyboard, Image } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import FoodImageAnalysis from "@/components/FoodImageAnalysis";

interface HealthRisk {
  nutrient: string;
  risk: string;
  explanation: string;
}

interface Alternative {
  name: string;
  why_better: string;
  how_helps: string;
}

interface NutrientLevels {
  fat?: string;
  salt?: string;
  saturated_fat?: string;
  sugars?: string;
}

interface Nutriments {
  energy_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  salt_100g?: number;
}

interface MacroData {
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

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
  healthRisks?: HealthRisk[];
  alternatives?: Alternative[];
  nutrientLevels?: NutrientLevels;
  nutriments?: Nutriments;
  macros?: MacroData;
  description?: string;
}

const Scan = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [scanMode, setScanMode] = useState<"manual" | "camera" | "image">(
    "manual"
  );
  const [isScanning, setIsScanning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerDivId = "barcode-scanner";

  useEffect(() => {
    // Check authentication status but don't require it
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);

      // Sync localStorage scans to database when user logs in
      if (session?.user) {
        syncLocalScansToDatabase(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Sync scans when user signs in
        syncLocalScansToDatabase(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, navigate]);

  const syncLocalScansToDatabase = async (userId: string) => {
    try {
      const localScans = localStorage.getItem("pending_scans");
      if (!localScans) return;

      const scans = JSON.parse(localScans);
      if (!Array.isArray(scans) || scans.length === 0) return;

      console.log(`Syncing ${scans.length} local scans to database...`);

      const { error } = await supabase.from("scans").insert(
        scans.map((scan) => ({
          ...scan,
          user_id: userId,
        }))
      );

      if (!error) {
        localStorage.removeItem("pending_scans");
        toast.success(
          `${scans.length} scan${
            scans.length > 1 ? "s" : ""
          } synced to your dashboard!`
        );
      }
    } catch (error) {
      console.error("Error syncing local scans:", error);
    }
  };

  const saveToLocalStorage = (scanData: any) => {
    try {
      const localScans = localStorage.getItem("pending_scans");
      const scans = localScans ? JSON.parse(localScans) : [];
      scans.push(scanData);
      localStorage.setItem("pending_scans", JSON.stringify(scans));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Start camera when scan mode changes to camera
  useEffect(() => {
    if (scanMode === "camera" && !isScanning) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCameraScanning();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scanMode]);

  const handleScan = async (value?: string) => {
    const raw = value ?? barcode;
    const cleaned = raw.trim();

    if (!cleaned) {
      toast.error("Please enter a barcode");
      return;
    }

    // Basic numeric validation for common EAN/UPC lengths
    const digitsOnly = cleaned.replace(/\D/g, "");
    if (!/^\d{8,14}$/.test(digitsOnly)) {
      toast.error("Invalid barcode. Use 8–14 digits (EAN/UPC)");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke(
        "analyze-product",
        {
          body: { barcode: digitsOnly },
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : {},
        }
      );

      if (error) throw error;

      setResult(data);

      if (session?.user) {
        toast.success("Product analyzed and saved to your dashboard!");
      } else {
        // Save to localStorage for later sync
        const scanData = {
          barcode: digitsOnly,
          product_name: data.name,
          brand: data.brand,
          health_score: data.score,
          recommendation: data.recommendation,
          nutrition_score: data.factors.nutritionScore,
          ingredient_quality: data.factors.ingredientQuality,
          additives_score: data.factors.additives,
          product_image: data.image,
          carbs: data.nutriments?.carbohydrates_100g || null,
          protein: data.nutriments?.proteins_100g || null,
          fat: data.nutriments?.fat_100g || null,
          health_risks: data.healthRisks || [],
          alternatives: data.alternatives || [],
        };
        saveToLocalStorage(scanData);
        toast.success("Product analyzed! Sign in to save this scan.");
      }
    } catch (error: any) {
      console.error("Error analyzing product:", error);
      const msg =
        error?.message || "Failed to analyze product. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke(
        "analyze-food-image",
        {
          body: { imageBase64: selectedImage },
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : {},
        }
      );

      if (error) throw error;

      setResult(data);

      if (session?.user) {
        toast.success("Food image analyzed and saved to your dashboard!");
      } else {
        // Save to localStorage for later sync
        const scanData = {
          barcode: "IMAGE_SCAN",
          product_name: data.name,
          brand: data.brand,
          health_score: data.score,
          recommendation: data.recommendation,
          nutrition_score: data.factors.nutritionScore,
          ingredient_quality: data.factors.ingredientQuality,
          additives_score: data.factors.additives,
          product_image: null,
          carbs: data.macros?.carbs || null,
          protein: data.macros?.protein || null,
          fat: data.macros?.fat || null,
          calories: data.macros?.calories || null,
          health_risks: data.healthRisks || [],
          alternatives: data.alternatives || [],
        };
        saveToLocalStorage(scanData);
        toast.success("Food image analyzed! Sign in to save this scan.");
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      const msg =
        error?.message || "Failed to analyze image. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanning = async () => {
    try {
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
        } as any,
        (decodedText) => {
          setBarcode(decodedText);
          stopCameraScanning();
          toast.success("Barcode detected!");
        },
        () => {
          // Error callback - ignore individual frame errors
        }
      );
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Failed to access camera");
      setIsScanning(false);
    }
  };

  const stopCameraScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  const toggleScanMode = () => {
    if (scanMode === "camera") {
      stopCameraScanning();
      setScanMode("manual");
    } else {
      setScanMode("camera");
      // Camera will start automatically via useEffect
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

  const getNutrientLevelBadge = (level?: string) => {
    if (!level) return null;
    const levelLower = level.toLowerCase();

    if (levelLower === "low") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-300 text-sm font-medium">
          <span className="text-green-600">✓</span> Low
        </div>
      );
    }
    if (levelLower === "moderate") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm font-medium">
          <span className="text-yellow-600">⚠</span> Moderate
        </div>
      );
    }
    if (levelLower === "high") {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-sm font-medium">
          <span className="text-red-600">⊗</span> High
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-accent/10">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Scan a Product</h1>
          <p className="text-muted-foreground">
            Scan barcodes or analyze food images with AI
          </p>
        </div>

        {/* Scanner Input */}
        <Card className="p-6 mb-8">
          <div className="flex gap-2 mb-4">
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => {
                stopCameraScanning();
                setScanMode("manual");
                setSelectedImage(null);
              }}
              className="flex-1 gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Manual
            </Button>
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={toggleScanMode}
              className="flex-1 gap-2"
            >
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button
              variant={scanMode === "image" ? "default" : "outline"}
              onClick={() => {
                stopCameraScanning();
                setScanMode("image");
              }}
              className="flex-1 gap-2"
            >
              <Image className="h-4 w-4" />
              AI Image
            </Button>
          </div>

          {scanMode === "manual" ? (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter barcode (e.g., 3017620422003)"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleScan()}
                    className="text-lg"
                  />
                </div>
                <Button
                  onClick={() => handleScan()}
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
            </>
          ) : scanMode === "image" ? (
            <>
              <div className="space-y-4">
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Click to upload a food image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AI will analyze nutritional content
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {selectedImage && (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Selected food"
                      className="w-full max-h-64 object-contain rounded-lg"
                    />
                    <Button
                      onClick={handleImageAnalysis}
                      disabled={loading}
                      size="lg"
                      className="w-full gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Image className="h-5 w-5" />
                      )}
                      Analyze with AI
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div
                id={scannerDivId}
                className="w-full rounded-lg overflow-hidden bg-muted"
                style={{ minHeight: "300px" }}
              />
              {barcode && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Detected barcode:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={barcode}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleScan()}
                      disabled={loading}
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
                </div>
              )}
            </>
          )}
        </Card>

        {/* Results Display */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Sign In Prompt for Unauthenticated Users */}
            {!user && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold mb-1">
                      Save This Scan to Your Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in or create an account to track your scans and see
                      your nutrition history
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/auth")}
                    size="lg"
                    className="gap-2 whitespace-nowrap"
                  >
                    Sign In / Sign Up
                  </Button>
                </div>
              </Card>
            )}

            {/* Product Info */}
            <Card className="p-6">
              <div className="flex gap-6">
                {(result.image || selectedImage) && (
                  <img
                    src={result.image || selectedImage || ""}
                    alt={result.name}
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{result.name}</h2>
                  <p className="text-muted-foreground">{result.brand}</p>
                  {result.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Health Score */}
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium mb-4">Health Score</h3>
              <div
                className={`text-6xl font-bold mb-4 ${getScoreColor(
                  result.score
                )}`}
              >
                {result.score.toFixed(1)}/10
              </div>
              <div
                className={`inline-block px-6 py-3 rounded-full border-2 font-bold text-lg ${getRecommendationColor(
                  result.recommendation
                )}`}
              >
                {result.recommendation}
              </div>
            </Card>

            {/* AI Image Analysis Charts */}
            {result.macros && (
              <FoodImageAnalysis
                macros={result.macros}
                score={result.score}
                name={result.name}
              />
            )}

            {/* Nutrient Levels & Nutrition Facts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nutrient Levels */}
              {result.nutrientLevels && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-red-500">♥</span> Nutrient Levels
                  </h3>
                  <div className="space-y-3">
                    {result.nutrientLevels.fat && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Fat</span>
                        {getNutrientLevelBadge(result.nutrientLevels.fat)}
                      </div>
                    )}
                    {result.nutrientLevels.salt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Salt</span>
                        {getNutrientLevelBadge(result.nutrientLevels.salt)}
                      </div>
                    )}
                    {result.nutrientLevels.saturated_fat && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Saturated Fat
                        </span>
                        {getNutrientLevelBadge(
                          result.nutrientLevels.saturated_fat
                        )}
                      </div>
                    )}
                    {result.nutrientLevels.sugars && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sugars</span>
                        {getNutrientLevelBadge(result.nutrientLevels.sugars)}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Key Nutrition Facts */}
              {result.nutriments && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">⚡</span> Key Nutrition
                    Facts (per 100g)
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {result.nutriments.energy_100g !== undefined && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Energy</span>
                          <span className="font-semibold">
                            {result.nutriments.energy_100g} kcal
                          </span>
                        </div>
                      </>
                    )}
                    {result.nutriments.proteins_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Protein</span>
                        <span className="font-semibold">
                          {result.nutriments.proteins_100g}g
                        </span>
                      </div>
                    )}
                    {result.nutriments.fat_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fat</span>
                        <span className="font-semibold">
                          {result.nutriments.fat_100g}g
                        </span>
                      </div>
                    )}
                    {result.nutriments.carbohydrates_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carbs</span>
                        <span className="font-semibold">
                          {result.nutriments.carbohydrates_100g}g
                        </span>
                      </div>
                    )}
                    {result.nutriments.saturated_fat_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Saturated Fat
                        </span>
                        <span className="font-semibold">
                          {result.nutriments.saturated_fat_100g}g
                        </span>
                      </div>
                    )}
                    {result.nutriments.fiber_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fiber</span>
                        <span className="font-semibold">
                          {result.nutriments.fiber_100g}g
                        </span>
                      </div>
                    )}
                    {result.nutriments.sugars_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sugars</span>
                        <span className="font-semibold">
                          {result.nutriments.sugars_100g}g
                        </span>
                      </div>
                    )}
                    {result.nutriments.salt_100g !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salt</span>
                        <span className="font-semibold">
                          {result.nutriments.salt_100g}g
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Factor Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Nutrition Score</span>
                    <span className="font-semibold">
                      {result.factors.nutritionScore}/10
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${result.factors.nutritionScore * 10}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Ingredient Quality</span>
                    <span className="font-semibold">
                      {result.factors.ingredientQuality}/10
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${result.factors.ingredientQuality * 10}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Additives Score</span>
                    <span className="font-semibold">
                      {result.factors.additives}/10
                    </span>
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

            {/* Health Risk Profile */}
            {result.healthRisks && result.healthRisks.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🚨 Health Risk Profile
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-semibold">
                          Nutrient of Concern
                        </th>
                        <th className="text-left py-3 px-2 font-semibold">
                          Associated Health Risks
                        </th>
                        <th className="text-left py-3 px-2 font-semibold">
                          How It Affects You
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.healthRisks.map((risk, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-2 font-medium">
                            {risk.nutrient}
                          </td>
                          <td className="py-3 px-2">{risk.risk}</td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {risk.explanation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Healthier Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  ✅ Healthier Alternatives to Try
                </h3>
                <div className="space-y-4">
                  {result.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-primary pl-4 py-2"
                    >
                      <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                        ✨ {alt.name}
                      </h4>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Why it's better:</span>{" "}
                        <span className="text-muted-foreground">
                          {alt.why_better}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">How it helps:</span>{" "}
                        <span className="text-muted-foreground">
                          {alt.how_helps}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
