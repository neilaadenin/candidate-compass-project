
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Building2, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Recruitment Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your recruitment process efficiently
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">System Status</CardTitle>
          <CheckCircle className="h-6 w-6 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Success
            </Badge>
            <span className="text-gray-600">All systems operational</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500">Active companies</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Open Vacancies
            </CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">45</div>
            <p className="text-xs text-gray-500">Available positions</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">234</div>
            <p className="text-xs text-gray-500">Registered candidates</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Access */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          <CardDescription>
            Quick access to manage companies, vacancies, and candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/admin/company">
                <Building2 className="w-4 h-4 mr-2" />
                Manage Companies
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/vacancy">
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Vacancies
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/candidate">
                <Users className="w-4 h-4 mr-2" />
                View Candidates
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
