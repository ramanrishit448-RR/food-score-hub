import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Loader2, Camera, Keyboard, Mic } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import VoiceScanner from "@/components/VoiceScanner";

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
}

const Scan = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [scanMode, setScanMode] = useState<"manual" | "camera" | "voice">("manual");
  const [isScanning, setIsScanning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "barcode-scanner";

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to scan products");
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, navigate]);

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

    if (!user) {
      toast.error("Please sign in to scan products");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { barcode: digitsOnly },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Product analyzed and saved to your dashboard!");
    } catch (error: any) {
      console.error("Error analyzing product:", error);
      const msg = error?.message || "Failed to analyze product. Please try again.";
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
        // Check if scanner is actually running before stopping
        const state = await scannerRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING = 2
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
        setIsScanning(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
        // Reset state even if stop fails
        scannerRef.current = null;
        setIsScanning(false);
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

  const switchToMode = (mode: "manual" | "camera" | "voice") => {
    if (scanMode === "camera" && mode !== "camera") {
      stopCameraScanning();
    }
    setScanMode(mode);
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
          <div className="flex gap-2 mb-4">
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => switchToMode("manual")}
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
              variant={scanMode === "voice" ? "default" : "outline"}
              onClick={() => switchToMode("voice")}
              className="flex-1 gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice
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
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
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
          ) : scanMode === "camera" ? (
            <>
              <div 
                id={scannerDivId} 
                className="w-full rounded-lg overflow-hidden bg-muted"
                style={{ minHeight: "300px" }}
              />
              {barcode && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Detected barcode:</p>
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
          ) : (
            <VoiceScanner 
              onBarcodeDetected={(detectedBarcode) => {
                setBarcode(detectedBarcode);
                handleScan(detectedBarcode);
              }} 
            />
          )}
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
                        <th className="text-left py-3 px-2 font-semibold">Nutrient of Concern</th>
                        <th className="text-left py-3 px-2 font-semibold">Associated Health Risks</th>
                        <th className="text-left py-3 px-2 font-semibold">How It Affects You</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.healthRisks.map((risk, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-2 font-medium">{risk.nutrient}</td>
                          <td className="py-3 px-2">{risk.risk}</td>
                          <td className="py-3 px-2 text-muted-foreground">{risk.explanation}</td>
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
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                        ✨ {alt.name}
                      </h4>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Why it's better:</span>{" "}
                        <span className="text-muted-foreground">{alt.why_better}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">How it helps:</span>{" "}
                        <span className="text-muted-foreground">{alt.how_helps}</span>
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
