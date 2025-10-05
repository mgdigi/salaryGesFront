import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, User, Briefcase, DollarSign, Calendar, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const [employeeResponse, statsResponse] = await Promise.all([
          employeeApi.getEmployeeById(id),
          employeeApi.getEmployeeStats(id)
        ]);

        setEmployee(employeeResponse.employee);
        setStats(statsResponse.stats);
      } catch (err) {
        setError('Erreur lors du chargement des détails de l\'employé');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !employee) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600">{error || 'Employé non trouvé'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retour
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAYE': return 'text-green-600 bg-green-100';
      case 'PARTIEL': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAYE': return <CheckCircle className="w-4 h-4" />;
      case 'PARTIEL': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-gray-600">{employee.position}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {employee.isActive ? 'Actif' : 'Inactif'}
          </div>
        </div>

        {/* Employee Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Informations personnelles</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Prénom:</span> {employee.firstName}</p>
              <p><span className="font-medium">Nom:</span> {employee.lastName}</p>
              <p><span className="font-medium">Poste:</span> {employee.position}</p>
              <p><span className="font-medium">Contrat:</span> {employee.contractType === 'JOURNALIER' ? 'Journalier' : employee.contractType === 'FIXE' ? 'Fixe' : 'Honoraires'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Informations salariales</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Salaire:</span> {employee.rate.toLocaleString()} FCFA</p>
              <p><span className="font-medium">Type de contrat:</span> {employee.contractType}</p>
              {employee.bankDetails && (
                <p><span className="font-medium">Détails bancaires:</span> {employee.bankDetails}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dates importantes</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Créé le:</span> {new Date(employee.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><span className="font-medium">Dernière mise à jour:</span> {new Date(employee.updatedAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {stats && stats.payslips && stats.payslips.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Historique des paiements</h3>
                  <p className="text-sm text-gray-500">Bulletins de salaire et statuts de paiement</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.payslips.map((payslip) => (
                  <div key={payslip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {payslip.payRun?.period?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Période: {payslip.payRun?.period}</p>
                        <p className="text-sm text-gray-500">Brut: {payslip.gross.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payslip.status)}`}>
                        {getStatusIcon(payslip.status)}
                        <span>{payslip.status === 'PAYE' ? 'Payé' : payslip.status === 'PARTIEL' ? 'Partiel' : 'En attente'}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Net: {payslip.net.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No payment history */}
        {(!stats || !stats.payslips || stats.payslips.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun bulletin disponible</h3>
            <p className="text-gray-600">Cet employé n'a pas encore de bulletins de salaire générés.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDetails;