import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../common/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CircleDollarSign, CheckCircle, Clock, RotateCcw, Building2, BanknoteArrowUp, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';




const DashboardStats = () => {
  const { stats, salaryEvolution, loading, fetchDashboardStats } = useDashboard();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getSelectedCompany = () => {
    const selected = localStorage.getItem('selectedCompany');
    return selected ? JSON.parse(selected) : null;
  };

  const selectedCompany = getSelectedCompany();

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

  return (
    <div className="h-full w-full">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Tableau de bord
                </h1>
                <p className="text-sm lg:text-base text-gray-500">
                  Bienvenue, <span className="font-medium text-gray-700">{user?.email?.split('@')[0] || 'Utilisateur'}</span> • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchDashboardStats}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Actualiser</span>
                </button>
                <div className="hidden md:flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-orange-700">Système actif</span>
                </div>
              </div>
            </div>
          </div>

          {user?.role === 'ADMIN' && (
          
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                  title="Employés actifs"
                  value={stats.totalEmployees}
                  icon={Users}
                  color="bg-orange-400"
                />
                <StatCard
                  title="Masse salariale"
                  value={`${(stats.totalSalary / 1000000).toFixed(1)}M FCFA`}
                  icon={CircleDollarSign}
                  color="bg-orange-400"
                />
                <StatCard
                  title="Montant payé"
                  value={`${(stats.paidAmount / 1000000).toFixed(1)}M FCFA`}
                  icon={BanknoteArrowUp}
                  color="bg-orange-400"
                />
                <StatCard
                  title="Montant restant"
                  value={`${(stats.pendingAmount / 1000000).toFixed(1)}M FCFA`}
                  icon={Clock}
                  color="bg-orange-400"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Évolution de la masse salariale
                        </h3>
                        <p className="text-sm text-gray-500">Tendance sur les 6 derniers mois</p>
                      </div>
                      <div className="px-3 py-1 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium text-orange-600">+2.5%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salaryEvolution}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={user?.company?.color || '#f97316'} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={user?.company?.color || '#f97316'} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                          />
                          <YAxis 
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                          />
                          <Tooltip
                            formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Masse salariale']}
                            contentStyle={{ 
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            stroke={user?.company?.color || '#f97316'}
                            strokeWidth={3}
                            dot={{ fill: user?.company?.color || '#f97316', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#fff', strokeWidth: 3 }}
                            fill="url(#colorAmount)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Prochains paiements
                    </h3>
                    <p className="text-sm text-gray-500">À effectuer ce mois</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {stats.upcomingPayments && stats.upcomingPayments.length > 0 ? (
                        stats.upcomingPayments.slice(0, 3).map((payment, index) => (
                          <div key={index} className="group">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200 cursor-pointer" onClick={() => navigate(`/employee/${payment.employee?.id}`)}>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                                  {payment.employee?.firstName?.charAt(0)}{payment.employee?.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {payment.employee?.firstName} {payment.employee?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {payment.payRun?.period}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                  {(payment.amount / 1000).toFixed(0)}K
                                </p>
                                <p className="text-xs text-gray-500">FCFA</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Aucun paiement en attente</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'SUPER_ADMIN' && (
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-orange-100 rounded-2xl">
                    <Building2 className="w-12 h-12 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Vue d'ensemble des entreprises
                </h3>
                <p className="text-center text-gray-600 mb-8">
                  Gérez toutes les entreprises depuis cette interface centralisée
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate('/companies')}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Accéder à la gestion des entreprises
                  </button>
                </div>
              </div>
            </div>
          )}

          {user?.role === 'CAISSIER' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                  title="Paiements en attente"
                  value={stats.upcomingPayments?.length || 0}
                  icon={Clock}
                  color="bg-orange-500"
                />
                <StatCard
                  title="Montant à payer"
                  value={`${(stats.pendingAmount / 1000000).toFixed(1)}M FCFA`}
                  icon={CircleDollarSign}
                  color="bg-red-400"
                />
                <StatCard
                  title="Montant payé"
                  value={`${(stats.paidAmount / 1000000).toFixed(1)}M FCFA`}
                  icon={CheckCircle}
                  color="bg-green-400"
                />
                <StatCard
                  title="Employés actifs"
                  value={stats.totalEmployees}
                  icon={Users}
                  color="bg-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Prochains paiements à effectuer
                    </h3>
                    <p className="text-sm text-gray-500">Bulletins en attente de paiement</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {stats.upcomingPayments && stats.upcomingPayments.length > 0 ? (
                        stats.upcomingPayments.slice(0, 5).map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {payment.employee?.firstName?.charAt(0)}{payment.employee?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <button
                                  onClick={() => navigate(`/employee/${payment.employee?.id}`)}
                                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                                >
                                  {payment.employee?.firstName} {payment.employee?.lastName}
                                </button>
                                <p className="text-xs text-gray-500">
                                  {payment.payRun?.period}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">
                                {(payment.amount / 1000).toFixed(0)}K FCFA
                              </p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                En attente
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Tous les paiements sont à jour</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="p-4 bg-gray-100 rounded-2xl">
                        <CreditCard className="w-12 h-12 text-gray-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                      Gestion des paiements
                    </h3>
                    <p className="text-center text-gray-600 mb-8">
                      Enregistrez les paiements, générez les reçus et consultez les bulletins
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate('/payments')}
                        className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        Accéder aux paiements
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;