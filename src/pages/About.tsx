import { Card } from "@/components/ui/card";
import { Heart, Target, Users } from "lucide-react";
import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About NutriScan AI</h1>
          <p className="text-xl text-muted-foreground">
            Making nutritious food choices simple and accessible for everyone
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At NutriScan AI, we believe everyone deserves to make informed decisions about their nutrition. 
                Our mission is to empower consumers with instant, AI-powered insights into the foods they buy, 
                making healthy eating accessible and straightforward. We're democratizing nutritional knowledge, 
                one scan at a time.
              </p>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Scan or Enter Barcode</h3>
              <p className="text-muted-foreground">
                Simply scan a product's barcode or manually enter it into our app.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced AI algorithm analyzes nutritional data, ingredients, and additives 
                from the Open Food Facts database to generate a comprehensive health score.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Clear Recommendations</h3>
              <p className="text-muted-foreground">
                Receive an easy-to-understand health score (0-10) and a simple recommendation: 
                EAT (healthy choice), BUY (acceptable option), or AVOID (unhealthy product).
              </p>
            </div>
          </div>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Health First</h3>
            <p className="text-muted-foreground">
              We prioritize your well-being by providing honest, science-based nutritional assessments.
            </p>
          </Card>

          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparency</h3>
            <p className="text-muted-foreground">
              We believe in complete transparency, showing you exactly how we calculate health scores.
            </p>
          </Card>
        </div>

        {/* Personal Bio Section */}
        <Card className="p-8 mt-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-2xl font-bold mb-4">Meet the Creator</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            NutriScan AI was created by a team of nutrition enthusiasts and AI developers who 
            experienced firsthand the challenge of making healthy food choices in today's complex 
            food landscape. After countless hours navigating confusing nutrition labels and 
            contradictory health advice, we decided to build a solution that makes nutritional 
            decision-making simple and instant.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is to help millions of people worldwide make better food choices, reduce 
            consumption of ultra-processed foods, and ultimately lead healthier lives. We're 
            continuously improving our AI algorithm to provide the most accurate and helpful 
            nutritional guidance possible.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default About;
