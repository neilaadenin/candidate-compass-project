
// Dummy API endpoint for statistics
export interface StatisticData {
  company: string;
  vacancy: string;
  outreach: number;
  applicants: number;
}

// Dummy data based on your specifications
const dummyStatistics: StatisticData[] = [
  // Zuri
  { company: "Zuri", vacancy: "Hotel General Manager", outreach: 100, applicants: 20 },
  { company: "Zuri", vacancy: "Chief Accountant", outreach: 70, applicants: 10 },
  
  // Kusuma
  { company: "Kusuma", vacancy: "Finance", outreach: 80, applicants: 15 },
  { company: "Kusuma", vacancy: "General Manager", outreach: 90, applicants: 25 },
  { company: "Kusuma", vacancy: "Marketing", outreach: 60, applicants: 12 },
  
  // Alfamedika
  { company: "Alfamedika", vacancy: "Store Manager", outreach: 45, applicants: 8 },
  
  // Rey
  { company: "Rey", vacancy: "Claim", outreach: 35, applicants: 7 },
  
  // BPRKS
  { company: "BPRKS", vacancy: "Programmer", outreach: 120, applicants: 30 },
  { company: "BPRKS", vacancy: "Business Operation Advisor", outreach: 85, applicants: 18 },
  { company: "BPRKS", vacancy: "Credit Marketing Head", outreach: 75, applicants: 15 },
  { company: "BPRKS", vacancy: "Credit Marketing", outreach: 95, applicants: 22 },
  
  // Mahkota
  { company: "Mahkota", vacancy: "Project", outreach: 110, applicants: 28 },
  { company: "Mahkota", vacancy: "Marketing", outreach: 65, applicants: 13 },
  { company: "Mahkota", vacancy: "Site", outreach: 55, applicants: 11 },
  { company: "Mahkota", vacancy: "Finance", outreach: 70, applicants: 14 },
  
  // Bumame
  { company: "Bumame", vacancy: "Sales", outreach: 80, applicants: 16 },
  { company: "Bumame", vacancy: "Sales Manager", outreach: 50, applicants: 12 },
];

export const getStatistics = async (): Promise<StatisticData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return dummyStatistics;
};

export const getUniqueCompanies = (data: StatisticData[]): string[] => {
  return [...new Set(data.map(item => item.company))];
};

export const getVacanciesByCompany = (data: StatisticData[], company: string): string[] => {
  return [...new Set(data.filter(item => item.company === company).map(item => item.vacancy))];
};
