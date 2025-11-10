import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroData {
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

interface FoodImageAnalysisProps {
  macros: MacroData;
  score: number;
  name: string;
}

const FoodImageAnalysis = ({ macros, score, name }: FoodImageAnalysisProps) => {
  const macroData = [
    { name: 'Carbs', value: macros.carbs || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Protein', value: macros.protein || 0, color: 'hsl(var(--chart-2))' },
    { name: 'Fat', value: macros.fat || 0, color: 'hsl(var(--chart-3))' }
  ].filter(item => item.value > 0);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'hsl(var(--chart-1))';
    if (score >= 4) return 'hsl(var(--chart-2))';
    return 'hsl(var(--chart-3))';
  };

  const gaugeData = [
    { name: 'Score', value: score, fill: getScoreColor(score) },
    { name: 'Remaining', value: 10 - score, fill: 'hsl(var(--muted))' }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Macronutrient Pie Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Macronutrient Breakdown</h3>
        <p className="text-sm text-muted-foreground mb-4">Per 100g estimated</p>
        {macroData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, value }) => `${name}: ${value}g (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            No macronutrient data available
          </div>
        )}
        {macros.calories && (
          <div className="text-center mt-4 pt-4 border-t">
            <div className="text-2xl font-bold">{macros.calories}</div>
            <div className="text-sm text-muted-foreground">Calories per 100g</div>
          </div>
        )}
      </Card>

      {/* Health Score Gauge */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Health Score</h3>
        <p className="text-sm text-muted-foreground mb-4">Based on AI analysis</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
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
          <div className="text-4xl font-bold" style={{ color: getScoreColor(score) }}>
            {score.toFixed(1)}/10
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {name}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FoodImageAnalysis;
