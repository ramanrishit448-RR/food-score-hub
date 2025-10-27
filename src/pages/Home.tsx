import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScanBarcode, Shield, Zap, Users } from "lucide-react";
import Navigation from "@/components/Navigation";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
            <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary">AI-Powered Food Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">See Beyond the Label</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            FoodSight AI brings clarity to your food choices. Scan any product and get instant, 
            intelligent insights: EAT, BUY, or AVOID.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/scan">
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <ScanBarcode className="h-5 w-5" />
                Start Scanning
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FoodSight AI?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Analysis</h3>
              <p className="text-muted-foreground">
                Get health scores in seconds. Simply scan a barcode and receive immediate AI-powered insights.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Clear guidance on every product: EAT (healthy), BUY (moderate), or AVOID (unhealthy).
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Journey</h3>
              <p className="text-muted-foreground">
                Monitor your scanning history and make informed decisions about your nutrition over time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes FoodSight AI Different?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We go beyond basic nutrition scores to give you the full picture—including what's harmful and what's better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Health Risk Analysis */}
            <Card className="p-8 border-2 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Detailed Health Risk Profile</h3>
                <p className="text-muted-foreground mb-4">
                  Most apps just give you a score. We tell you <strong>exactly what's harmful</strong> and why it matters.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2"></div>
                  <div>
                    <p className="font-semibold text-sm">Nutrient of Concern</p>
                    <p className="text-xs text-muted-foreground">High Fructose Corn Syrup, Saturated Fat, Sodium</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2"></div>
                  <div>
                    <p className="font-semibold text-sm">Associated Health Risk</p>
                    <p className="text-xs text-muted-foreground">Weight Gain, Type 2 Diabetes, Heart Disease</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2"></div>
                  <div>
                    <p className="font-semibold text-sm">How It Affects You</p>
                    <p className="text-xs text-muted-foreground">Clear explanations linking ingredients to real health impacts</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Alternative Recommendations */}
            <Card className="p-8 border-2 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Smarter Alternative Recommendations</h3>
                <p className="text-muted-foreground mb-4">
                  We don't just say "avoid it"—we show you <strong>healthier swaps</strong> with clear reasons why they're better.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-semibold text-sm">Alternative Name</p>
                    <p className="text-xs text-muted-foreground">Specific product recommendations, not vague suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-semibold text-sm">Why It's Better</p>
                    <p className="text-xs text-muted-foreground">Key nutritional benefits explained simply</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-semibold text-sm">How It Helps</p>
                    <p className="text-xs text-muted-foreground">Positive health outcomes you'll actually experience</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold mb-2">The FoodSight Difference</p>
            <p className="text-muted-foreground">
              Complete transparency. Actionable insights. Real alternatives. That's intelligence you can trust.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Shopping?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands making healthier food choices every day.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 FoodSight AI. See Beyond the Label.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
