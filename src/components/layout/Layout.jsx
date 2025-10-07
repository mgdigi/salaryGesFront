import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircleGauge, Building2, Users, BanknoteArrowUp, CreditCard, LogOut, Menu, X, ChevronDown, ClipboardClock, FileText, Calendar, QrCode } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const Layout = ({ children, stats: propStats }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(propStats || {
    totalEmployees: 0,
    totalSalary: 0,
    paidAmount: 0,
    pendingAmount: 0,
    upcomingPayments: []
  });

  const getSelectedCompany = () => {
    const selected = localStorage.getItem('selectedCompany');
    console.log('Layout - localStorage selectedCompany:', selected);
    return selected ? JSON.parse(selected) : null;
  };

  const [selectedCompany, setSelectedCompany] = useState(getSelectedCompany());
  console.log('Layout - selectedCompany state:', selectedCompany);
  console.log('Layout - user:', user);

  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedCompany(getSelectedCompany());
    };

    window.addEventListener('storage', handleStorageChange);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (key === 'selectedCompany') {
        setSelectedCompany(getSelectedCompany());
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    const handleStatsUpdate = (event) => {
      if (event.detail) {
        setStats(event.detail);
      }
    };

    window.addEventListener('statsUpdate', handleStatsUpdate);

    return () => {
      window.removeEventListener('statsUpdate', handleStatsUpdate);
    };
  }, []);

  const currentCompany = selectedCompany || user?.company;
  console.log('Layout - currentCompany:', currentCompany);

  const navigationItems = { 
    SUPER_ADMIN: [
      { name: 'Tableau de bord', path: '/dashboard', icon: CircleGauge },
      { name: 'Entreprises', path: '/companies', icon: Building2 },
    ],
    ADMIN: [
      { name: 'Tableau de bord', path: '/dashboard', icon: CircleGauge },
      { name: 'Employés', path: '/employees', icon: Users },
      { name: 'Cycles de paie', path: '/payruns', icon: BanknoteArrowUp },
      { name: 'Pointage quotidien', path: '/daily-attendance', icon: ClipboardClock },
      { name: 'Congés', path: '/leaves', icon: Calendar },
      { name: 'QR Codes', path: '/qr-codes', icon: QrCode },
    ],
    CAISSIER: [
      { name: 'Tableau de bord', path: '/dashboard', icon: CircleGauge },
      { name: 'Paiements', path: '/payments', icon: CreditCard },
    ],
  };

  const currentNavItems = user ? navigationItems[user.role] || [] : [];

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'ADMIN':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'CAISSIER':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrateur';
      case 'ADMIN':
        return 'Administrateur';
      case 'CAISSIER':
        return 'Caissier';
      default:
        return role || 'Utilisateur';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {user?.role === 'ADMIN' && (
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          stats={stats}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
              )}

              <div className="flex items-center space-x-3">
                {currentCompany?.logo ? (
                  <img
                    src={currentCompany.logo}
                    alt={`${currentCompany.name} logo`}
                    className="w-10 h-10 rounded-xl object-cover shadow-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg ${currentCompany?.logo ? 'hidden' : ''}`}>
                  <span className="text-white font-bold text-lg">
                    {currentCompany?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {currentCompany?.name || 'SalaryGes'}
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {user?.role === 'SUPER_ADMIN' && selectedCompany ? `Entreprise: ${selectedCompany.name}` : 'Gestion de paie'}
                  </p>
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-2">
              {currentNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
                      transition-all duration-300 group relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      }
                    `}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user?.role)}`}>
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {currentNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm
                      transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                 <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                   {user?.email?.charAt(0).toUpperCase() || 'U'}
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-gray-900">
                     {user?.email?.split('@')[0] || 'Utilisateur'}
                   </p>
                   <p className="text-xs text-gray-500">
                     {getRoleLabel(user?.role)}
                   </p>
                 </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

        <main className="flex-1 w-full">
          <div className="h-full">
            {children || (
              <div className="flex items-center justify-center h-full p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue sur SalaryGes</h2>
                  <p className="text-gray-600">Votre contenu s'affichera ici</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-800">
                © 2025 mgdev  +221 78 011 82 23 Tous droits réservés.
              </p>
              
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;