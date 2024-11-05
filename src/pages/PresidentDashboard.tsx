import React from 'react';
import { Layout } from '../components/Layout';
import { useQuery } from '@tanstack/react-query';
import { firebaseService } from '../services/firebase';
import { format } from 'date-fns';
import { Loader2, Users, MapPin, FileText, CheckCircle } from 'lucide-react';

interface WorkReport {
  id: string;
  userId: string;
  userName: string;
  description: string;
  area: string;
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'completed';
}

function PresidentDashboard() {
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['workReports'],
    queryFn: () => firebaseService.queryDocuments('workReports')
  });

  const { data: workers, isLoading: workersLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const users = await firebaseService.queryDocuments('users');
      return users.filter(user => user.role === 'worker');
    }
  });

  const activeWorkers = reports?.filter(
    (report: WorkReport) => report.status === 'in-progress'
  ).length || 0;

  const completedToday = reports?.filter((report: WorkReport) => {
    const reportDate = new Date(report.endTime || '');
    const today = new Date();
    return (
      report.status === 'completed' &&
      reportDate.toDateString() === today.toDateString()
    );
  }).length || 0;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">President Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {workersLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    workers?.length || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPin className="h-10 w-10 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    activeWorkers
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-10 w-10 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    completedToday
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
              <button 
                onClick={() => window.location.href = '/dashboard/map'}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : reports?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reports available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(reports || []).slice(0, 5).map((report: WorkReport) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.userName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{report.area}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{report.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(report.startTime), 'PPp')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PresidentDashboard;