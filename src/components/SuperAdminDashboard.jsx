import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { superAdminStatsApi } from '../api/superAdminStatsApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  UserCheck,
  BarChart3,
  RefreshCw,
  Activity
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
    <div className={`h-1 ${color} opacity-75`}></div>
  </div>
);

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await superAdminStatsApi.getGlobalStats();
      setStats(response.stats);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error || 'Impossible de charger les statistiques'}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const userRoleData = stats.userRoleStats.map(item => ({
    name: item.role === 'SUPER_ADMIN' ? 'Super Admin' :
          item.role === 'ADMIN' ? 'Admin' :
          item.role === 'CAISSIER' ? 'Caissier' : 'Employé',
    value: item._count,
    color: item.role === 'SUPER_ADMIN' ? '#8B5CF6' :
           item.role === 'ADMIN' ? '#F97316' :
           item.role === 'CAISSIER' ? '#6B7280' : '#10B981'
  }));

  const contractTypeData = stats.contractTypeStats.map(item => ({
    name: item.contractType === 'JOURNALIER' ? 'Journalier' :
          item.contractType === 'FIXE' ? 'Fixe' :
          item.contractType === 'HONORAIRE' ? 'Honoraire' : item.contractType,
    value: item._count
  }));

  const COLORS = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];

  return (
    <div className="h-full w-full">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              title="Total Entreprises"
              value={stats.overview.totalCompanies}
              icon={Building2}
              color="none"
              subtitle="Entreprises actives"
            />
            <StatCard
              title="Total Utilisateurs"
              value={stats.overview.totalUsers}
              icon={Users}
              color="none"
              subtitle="Tous rôles confondus"
            />
            <StatCard
              title="Total Employés"
              value={stats.overview.totalEmployees}
              icon={UserCheck}
              color="none"
              subtitle="Employés actifs"
            />
            <StatCard
              title="Montant total payé"
              value={`${(stats.overview.totalAmount / 1000000).toFixed(1)}M FCFA`}
              icon={DollarSign}
              color="none"
              subtitle="Paiements effectués"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            

            {/* Évolution mensuelle */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Évolution mensuelle
                </h3>
                <p className="text-sm text-gray-500">Croissance des 6 derniers mois</p>
              </div>
              <div className="p-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="companies"
                        stroke="#F97316"
                        strokeWidth={3}
                        name="Entreprises"
                        dot={{ fill: '#F97316', strokeWidth: 2, r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="Utilisateurs"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="employees"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        name="Employés"
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top entreprises et types de contrats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top entreprises */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Top Entreprises
                </h3>
                <p className="text-sm text-gray-500">Par nombre d'employés</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.topCompaniesByEmployees.slice(0, 5).map((company, index) => (
                    <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{company.name}</p>
                          <p className="text-sm text-gray-500">{company._count.employees} employés</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{company._count.employees}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Types de contrats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Types de contrats
                </h3>
                <p className="text-sm text-gray-500">Répartition des contrats employés</p>
              </div>
              <div className="p-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contractTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          </div>

          

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Paiements récents
              </h3>
              <p className="text-sm text-gray-500">Derniers paiements effectués</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {payment.payslip.employee.firstName} {payment.payslip.employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.payslip.payRun.company.name} • {new Date(payment.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {payment.amount.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-gray-500">{payment.method}</p>
                    </div>
                  </div>
                ))}
                {stats.recentPayments.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Aucun paiement récent</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;