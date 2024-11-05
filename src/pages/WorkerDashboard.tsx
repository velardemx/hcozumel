import React from 'react';
import { Layout } from '../components/Layout';
import { WorkReportForm } from '../components/WorkReportForm';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

function WorkerDashboard() {
  const { user } = useAuthStore();

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['workReports', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      const q = query(
        collection(db, 'workReports'),
        where('userId', '==', user.uid),
        orderBy('startTime', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!user?.uid
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Work Report Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Report Work</h2>
            <WorkReportForm onSuccess={refetch} />
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{report.description}</p>
                        <p className="text-sm text-gray-500">
                          Started: {format(new Date(report.startTime), 'PPp')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'in-progress' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status === 'in-progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <img 
                        src={report.startImage} 
                        alt="Work start" 
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No work reports yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default WorkerDashboard;