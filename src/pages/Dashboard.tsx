import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, History, LogOut, Trash2 } from "lucide-react";
import ChartsSection from "@/components/dashboard/ChartsSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    healthyChoices: 0,
    avgScore: 0
  });
  const [selectedScan, setSelectedScan] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      // Fetch user's scans
      const { data: scansData, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setScans(scansData || []);

      // Calculate stats
      if (scansData && scansData.length > 0) {
        const totalScans = scansData.length;
        const healthyChoices = scansData.filter((s: any) => s.recommendation === 'EAT').length;
        const avgScore = scansData.reduce((sum: number, s: any) => sum + s.health_score, 0) / totalScans;

        setStats({
          totalScans,
          healthyChoices,
          avgScore: Number(avgScore.toFixed(1))
        });
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      // Update local state
      const updatedScans = scans.filter(s => s.id !== scanId);
      setScans(updatedScans);

      // Recalculate stats
      if (updatedScans.length > 0) {
        const totalScans = updatedScans.length;
        const healthyChoices = updatedScans.filter((s: any) => s.recommendation === 'EAT').length;
        const avgScore = updatedScans.reduce((sum: number, s: any) => sum + s.health_score, 0) / totalScans;

        setStats({
          totalScans,
          healthyChoices,
          avgScore: Number(avgScore.toFixed(1))
        });
      } else {
        setStats({ totalScans: 0, healthyChoices: 0, avgScore: 0 });
      }

      toast.success("Scan deleted successfully");
    } catch (error: any) {
      console.error('Error deleting scan:', error);
      toast.error('Failed to delete scan');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Charts Section */}
        <ChartsSection scans={scans} latestScan={scans[0]} />

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats.totalScans}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-2xl">🥗</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy Choices</p>
                <p className="text-2xl font-bold">{stats.healthyChoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scan History */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recent Scans</h2>
          </div>
          
          {scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No scans yet</p>
              <Button onClick={() => navigate("/scan")}>
                Start Your First Scan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div 
                  key={scan.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedScan(scan)}
                >
                  {scan.product_image && (
                    <img 
                      src={scan.product_image} 
                      alt={scan.product_name}
                      className="w-16 h-16 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{scan.product_name}</h3>
                    <p className="text-sm text-muted-foreground">{scan.brand}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {scan.health_score.toFixed(1)}
                    </div>
                    <div className={`text-sm font-medium ${
                      scan.recommendation === 'EAT' ? 'text-green-600' :
                      scan.recommendation === 'BUY' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {scan.recommendation}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(scan.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Product Analysis Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={(open) => !open && setSelectedScan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Product Analysis</DialogTitle>
            <DialogDescription>
              Detailed nutritional breakdown and health assessment
            </DialogDescription>
          </DialogHeader>
          
          {selectedScan && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4">
                {selectedScan.product_image && (
                  <img 
                    src={selectedScan.product_image} 
                    alt={selectedScan.product_name}
                    className="w-24 h-24 object-contain rounded"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedScan.product_name}</h3>
                  <p className="text-muted-foreground">{selectedScan.brand}</p>
                  <p className="text-sm text-muted-foreground">
                    Scanned on {new Date(selectedScan.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Overall Score */}
              <Card className="p-6 bg-primary/5">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {selectedScan.health_score.toFixed(1)}
                  </div>
                  <div className={`text-xl font-semibold ${
                    selectedScan.recommendation === 'EAT' ? 'text-green-600' :
                    selectedScan.recommendation === 'BUY' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedScan.recommendation}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Overall Health Score</p>
                </div>
              </Card>

              {/* Health Factors */}
              <div className="grid grid-cols-3 gap-4">
                {selectedScan.nutrition_score !== null && (
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedScan.nutrition_score.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Nutrition Score</p>
                  </Card>
                )}
                {selectedScan.ingredient_quality !== null && (
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedScan.ingredient_quality.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Ingredient Quality</p>
                  </Card>
                )}
                {selectedScan.additives_score !== null && (
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedScan.additives_score.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Additives Score</p>
                  </Card>
                )}
              </div>

              {/* Macronutrients */}
              {(selectedScan.carbs || selectedScan.protein || selectedScan.fat) && (
                <div>
                  <h4 className="font-semibold mb-3">Macronutrients</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedScan.carbs !== null && (
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">{selectedScan.carbs}g</div>
                          <p className="text-sm text-muted-foreground">Carbs</p>
                        </div>
                      </Card>
                    )}
                    {selectedScan.protein !== null && (
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">{selectedScan.protein}g</div>
                          <p className="text-sm text-muted-foreground">Protein</p>
                        </div>
                      </Card>
                    )}
                    {selectedScan.fat !== null && (
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">{selectedScan.fat}g</div>
                          <p className="text-sm text-muted-foreground">Fat</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Health Risks */}
              {selectedScan.health_risks && Array.isArray(selectedScan.health_risks) && selectedScan.health_risks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">⚠️ Health Risks</h4>
                  <div className="space-y-3">
                    {selectedScan.health_risks.map((risk: any, idx: number) => (
                      <Card key={idx} className="p-4 border-red-200 bg-red-50/50">
                        <div className="flex items-start gap-3">
                          <div className="text-red-600 text-xl">⚠️</div>
                          <div className="flex-1">
                            <div className="font-semibold text-red-900">{risk.nutrient}</div>
                            <div className="text-sm font-medium text-red-800 mt-1">{risk.risk}</div>
                            <p className="text-sm text-red-700 mt-2">{risk.explanation}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Healthier Alternatives */}
              {selectedScan.alternatives && Array.isArray(selectedScan.alternatives) && selectedScan.alternatives.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">✨ Healthier Alternatives</h4>
                  <div className="space-y-3">
                    {selectedScan.alternatives.map((alt: any, idx: number) => (
                      <Card key={idx} className="p-4 border-green-200 bg-green-50/50">
                        <div className="flex items-start gap-3">
                          <div className="text-green-600 text-xl">✓</div>
                          <div className="flex-1">
                            <div className="font-semibold text-green-900">{alt.name}</div>
                            <div className="text-sm font-medium text-green-800 mt-1">
                              Why better: {alt.why_better}
                            </div>
                            <p className="text-sm text-green-700 mt-2">{alt.how_helps}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Barcode */}
              <div className="text-sm text-muted-foreground">
                <strong>Barcode:</strong> {selectedScan.barcode}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
