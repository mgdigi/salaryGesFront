import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileText, CreditCard, ClipboardClock, X, ChevronRight } from 'lucide-react';

const DashboardSidebar = ({ isOpen, onClose, user, stats }) => {
  const navigate = useNavigate();

  const quickActions = [
    { name: 'Cycles de paie', path: '/payruns', icon: BarChart3, description: 'Gérer les cycles de paie', key: 'payruns-manage' },
    { name: 'Employés', path: '/employees', icon: Users, description: 'Gérer les employés', key: 'employees' },
    { name: 'Bulletins', path: '/payruns', icon: FileText, description: 'Générer les bulletins', key: 'payruns-slips' },
    { name: 'pointage', path: '/daily-attendance', icon: ClipboardClock, description: 'gerer le pointage', key: 'daily-attendance' }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-30 lg:z-0
        w-72 bg-white border-r border-gray-200 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Actions rapides</h3>
                <p className="text-xs text-gray-500 mt-1">Accès rapide aux fonctionnalités</p>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={() => {
                    navigate(action.path);
                    onClose();
                  }}
                  className="w-full group"
                >
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-orange-50 border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {action.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="space-y-3">
              <div className="text-center mb-3">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Aperçu rapide</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Employés</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{stats?.totalEmployees || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">En attente</span>
                </div>
                <span className="text-sm font-bold text-orange-600">{stats?.pendingAmount ? (stats.pendingAmount / 1000000).toFixed(1) + 'M' : '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;