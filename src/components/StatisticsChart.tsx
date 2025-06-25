
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatisticData } from '@/api/statistics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Info, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

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
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ringkasan Statistik</h3>
              <p className="text-gray-700 leading-relaxed">
                {getDisplayText()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Outreach vs Applicants</CardTitle>
                <CardDescription>Perbandingan jumlah outreach dan applicants per posisi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={11}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="outreach" 
                    fill="#3B82F6" 
                    name="Outreach" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="applicants" 
                    fill="#10B981" 
                    name="Applicants" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
                <CardDescription>Persentase konversi per posisi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
