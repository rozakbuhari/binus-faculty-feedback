import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { DashboardStats } from '../types';
import { BarChart3, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStats();
        setStats(response.data.stats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-600">Failed to load dashboard data</div>;
  }

  const statCards = [
    { label: 'Total Feedbacks', value: stats.totalFeedbacks, icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Submitted', value: stats.statusBreakdown?.submitted || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Processing', value: stats.statusBreakdown?.processing || 0, icon: TrendingUp, color: 'bg-orange-500' },
    { label: 'Completed', value: stats.statusBreakdown?.completed || 0, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">By Category</h2>
          <div className="space-y-3">
            {stats.categoryBreakdown?.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-gray-700">{item.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(item.count / stats.totalFeedbacks) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 text-sm w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Anonymous vs Identified</h2>
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl font-bold text-teal-600">{stats.anonymousBreakdown?.anonymous || 0}</span>
              </div>
              <span className="text-gray-600">Anonymous</span>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl font-bold text-blue-600">{stats.anonymousBreakdown?.identified || 0}</span>
              </div>
              <span className="text-gray-600">Identified</span>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.monthlyTrends?.map((item) => {
              const maxCount = Math.max(...stats.monthlyTrends.map((t) => t.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <span className="text-sm text-gray-600 mb-1">{item.count}</span>
                  <div className="w-full bg-teal-500 rounded-t" style={{ height: `${height}%`, minHeight: '4px' }} />
                  <span className="text-xs text-gray-500 mt-2">{item.month.slice(-2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {stats.averageResolutionDays && (
        <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
          <p className="text-teal-800">
            <strong>Average Resolution Time:</strong> {stats.averageResolutionDays} days
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
