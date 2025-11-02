import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, History, LogOut, Trash2 } from "lucide-react";

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
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
      setScans(scans.filter(scan => scan.id !== scanId));
      
      // Recalculate stats
      const updatedScans = scans.filter(scan => scan.id !== scanId);
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
                <div key={scan.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
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
                    onClick={() => handleDelete(scan.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
