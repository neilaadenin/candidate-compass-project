
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
      {/* Summary Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Ringkasan Statistik</h3>
            <p className="text-sm text-gray-700">
              {getDisplayText()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Outreach vs Applicants</h3>
                <p className="text-sm text-gray-600">Perbandingan jumlah outreach dan applicants per posisi</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="outreach" 
                    fill="#3B82F6" 
                    name="Outreach" 
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="applicants" 
                    fill="#10B981" 
                    name="Applicants" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
                <p className="text-sm text-gray-600">Persentase konversi per posisi</p>
              </div>
            </div>
          </div>
          <div className="p-4">
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
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
