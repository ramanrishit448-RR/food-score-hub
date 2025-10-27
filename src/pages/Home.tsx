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
