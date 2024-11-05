import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { firebaseService } from '../services/firebase';
import { format } from 'date-fns';
import { Loader2, MapPin, CheckCircle, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkReport {
  id: string;
  userId: string;
  userName: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  startTime: string;
  endTime?: string;
  startImage: string;
  endImage?: string;
  status: 'in-progress' | 'completed';
  area: string;
}

interface FilterState {
  status: 'all' | 'in-progress' | 'completed';
  area: string;
  dateRange: {
    start: string;
    end: string;
  };
}

function WorkerMap() {
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    area: 'all',
    dateRange: {
      start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const areasData = await firebaseService.queryDocuments('areas');
      setAreas(areasData.map(area => area.name));
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsData = await firebaseService.queryDocuments('workReports');
      setReports(reportsData as WorkReport[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    const matchesArea = filters.area === 'all' || report.area === filters.area;
    const reportDate = new Date(report.startTime);
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    const matchesDate = reportDate >= startDate && reportDate <= endDate;
    
    return matchesStatus && matchesArea && matchesDate;
  });

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Worker Map</h1>
            <p className="text-gray-600">Track work reports and locations</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={filters.area}
                  onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Areas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <p>Map integration will be implemented here</p>
                  <p className="text-sm mt-2">
                    Showing {filteredReports.length} {filters.status === 'all' ? 'total' : filters.status} reports
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Work Reports</h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : filteredReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports found</p>
            ) : (
              <div className="space-y-4 max-h-[calc(600px-8rem)] overflow-y-auto">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {report.status === 'completed' ? (
                        <CheckCircle className="text-green-500 mt-1" size={20} />
                      ) : (
                        <Clock className="text-yellow-500 mt-1" size={20} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{report.userName}</p>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Area: {report.area}
                        </p>
                        <p className="text-xs text-gray-500">
                          Started: {format(new Date(report.startTime), 'PPp')}
                        </p>
                        {report.endTime && (
                          <p className="text-xs text-gray-500">
                            Completed: {format(new Date(report.endTime), 'PPp')}
                          </p>
                        )}
                        <div className="mt-2 flex gap-2">
                          <img
                            src={report.startImage}
                            alt="Start"
                            className="w-16 h-16 rounded object-cover"
                          />
                          {report.endImage && (
                            <img
                              src={report.endImage}
                              alt="End"
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default WorkerMap;