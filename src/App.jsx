import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { DashboardProvider } from './context/DashboardContext';
import { PayRunsProvider } from './context/PayRunsContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import PayRuns from './pages/PayRuns';
import Payments from './pages/Payments';
import Companies from './pages/Companies';
import LeaveManagement from './pages/LeaveManagement';
import AttendanceManagement from './components/payroll/AttendanceManagement';
import DailyAttendance from './components/payroll/DailyAttendance';
import QRCodeGenerator from './components/payroll/QRCodeGenerator';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DashboardProvider>
          <EmployeeProvider>
            <PayRunsProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/employees"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <Employees />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/employee/:id"
                      element={
                        <ProtectedRoute>
                          <EmployeeDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payruns"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <PayRuns />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payruns/:payRunId/attendance"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AttendanceManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/daily-attendance"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'CAISSIER']}>
                          <Layout>
                            <DailyAttendance />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payments"
                      element={
                        <ProtectedRoute allowedRoles={['CAISSIER']}>
                          <Payments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/companies"
                      element={
                        <ProtectedRoute>
                          <Companies />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/leaves"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <LeaveManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/qr-codes"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <Layout>
                            <QRCodeGenerator />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                  </Routes>
                </div>
              </Router>
            </PayRunsProvider>
          </EmployeeProvider>
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default App;
