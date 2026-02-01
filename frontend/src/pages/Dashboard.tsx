import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Gauge, FileText } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Write',
      description: 'Submit new feedback or suggestion',
      icon: Mail,
      path: '/submit',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Track Report Status',
      description: 'Check the status of your submissions',
      icon: Gauge,
      path: '/history',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Submission History',
      description: 'View all your past submissions',
      icon: FileText,
      path: '/history',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          <span className="italic">"Sampaikan</span>
          <br />
          <span className="italic">Kritik & Saran Anda dengan Aman dan Anonim"</span>
        </h1>
        <p className="text-gray-600 mt-4">
          Submit Your Feedback Safely and Anonymously
        </p>
      </div>

      {/* Welcome Message */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600 mt-2">
          Your voice matters. Help us improve the faculty by sharing your feedback, suggestions, or concerns.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.path}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className={`w-16 h-16 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">{action.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{action.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-teal-50 rounded-xl border border-teal-100">
        <h3 className="font-semibold text-teal-800 mb-2">How it works</h3>
        <ul className="text-teal-700 text-sm space-y-2">
          <li>• Submit your feedback with the option to remain anonymous</li>
          <li>• Track the status of your submission in real-time</li>
          <li>• Receive notifications when there are updates</li>
          <li>• Your identity is protected when you choose anonymous submission</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
