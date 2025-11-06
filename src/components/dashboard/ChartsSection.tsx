import { Card } from "@/components/ui/card";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartsSectionProps {
  scans: any[];
  latestScan?: any;
}

const ChartsSection = ({ scans, latestScan }: ChartsSectionProps) => {
  // Macronutrient data for pie chart
  const macroData = latestScan && (latestScan.carbs || latestScan.protein || latestScan.fat) ? [
    { name: 'Carbs', value: latestScan.carbs || 0 },
    { name: 'Protein', value: latestScan.protein || 0 },
    { name: 'Fat', value: latestScan.fat || 0 }
  ].filter(item => item.value > 0) : [];

  // Health score trends over time
  const trendData = scans.slice(0, 10).reverse().map((scan, index) => ({
    name: `Scan ${index + 1}`,
    score: scan.health_score,
    date: new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Gauge data
  const gaugeScore = latestScan?.health_score || 0;
  const gaugeData = [
    { name: 'Score', value: gaugeScore, fill: getScoreColor(gaugeScore) },
    { name: 'Remaining', value: 10 - gaugeScore, fill: 'hsl(var(--muted))' }
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  function getScoreColor(score: number) {
    if (score >= 7) return 'hsl(var(--chart-1))';
    if (score >= 4) return 'hsl(var(--chart-2))';
    return 'hsl(var(--chart-3))';
  }

  if (scans.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {/* Macronutrient Pie Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Macronutrient Breakdown</h3>
        {macroData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No macronutrient data available
          </div>
        )}
        {latestScan && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Latest: {latestScan.product_name}
          </p>
        )}
      </Card>

      {/* Health Score Trends Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Health Score Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gauge Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Product Rating</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-4">
          <div className="text-3xl font-bold" style={{ color: getScoreColor(gaugeScore) }}>
            {gaugeScore.toFixed(1)}/10
          </div>
          {latestScan && (
            <p className="text-xs text-muted-foreground mt-1">
              {latestScan.product_name}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChartsSection;
