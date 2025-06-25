
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatisticData } from '@/api/statistics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface StatisticsChartProps {
  data: StatisticData[];
  totalStats: {
    totalOutreach: number;
    totalApplicants: number;
    conversionRate: string;
  };
  companyFilter: string;
  vacancyFilter: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function StatisticsChart({ data, totalStats, companyFilter, vacancyFilter }: StatisticsChartProps) {
  // Prepare data for bar chart
  const chartData = data.map(item => ({
    name: `${item.company} - ${item.vacancy}`,
    company: item.company,
    vacancy: item.vacancy,
    outreach: item.outreach,
    applicants: item.applicants,
    rate: item.outreach > 0 ? ((item.applicants / item.outreach) * 100).toFixed(1) : 0
  }));

  // Prepare data for pie chart (conversion rates)
  const pieData = data.map((item, index) => ({
    name: `${item.company} - ${item.vacancy}`,
    value: item.outreach > 0 ? parseFloat(((item.applicants / item.outreach) * 100).toFixed(1)) : 0,
    fill: COLORS[index % COLORS.length]
  }));

  const getDisplayText = () => {
    if (companyFilter !== "all" && vacancyFilter !== "all" && data.length === 1) {
      const item = data[0];
      const rate = item.outreach > 0 ? ((item.applicants / item.outreach) * 100).toFixed(1) : 0;
      return `Dari ${item.outreach} kandidat yang di-outreach untuk posisi ${item.vacancy} di ${item.company}, ada ${item.applicants} yang apply (${rate}%)`;
    } else if (companyFilter !== "all" && vacancyFilter === "all") {
      return `Total data untuk perusahaan ${companyFilter}: ${totalStats.totalOutreach} outreach, ${totalStats.totalApplicants} applicants (${totalStats.conversionRate})`;
    } else {
      return `Total data dari semua perusahaan: ${totalStats.totalOutreach} outreach, ${totalStats.totalApplicants} applicants (${totalStats.conversionRate})`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Text */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Statistik</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-700">
            {getDisplayText()}
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Outreach vs Applicants</CardTitle>
            <CardDescription>Perbandingan jumlah outreach dan applicants per posisi</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="outreach" fill="#3B82F6" name="Outreach" />
                  <Bar dataKey="applicants" fill="#10B981" name="Applicants" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Persentase konversi per posisi</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
