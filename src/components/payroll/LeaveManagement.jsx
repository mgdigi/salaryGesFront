import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api/leaveApi';
import { employeeApi } from '../../api/employeeApi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import { Calendar, CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveApi.getAllLeaves();
      setLeaves(response.leaves || []);

      // Calculer les statistiques
      const total = response.leaves?.length || 0;
      const pending = response.leaves?.filter(l => l.status === 'EN_ATTENTE').length || 0;
      const approved = response.leaves?.filter(l => l.status === 'APPROUVEE').length || 0;
      const rejected = response.leaves?.filter(l => l.status === 'REFUSEE').length || 0;

      setStats({ total, pending, approved, rejected });
    } catch (error) {
      console.error('Erreur lors du chargement des congés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveApi.approveLeave(leaveId);
      fetchLeaves();
      alert('Demande de congé approuvée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleRejectLeave = async (leaveId, reason) => {
    try {
      await leaveApi.rejectLeave(leaveId, reason);
      fetchLeaves();
      alert('Demande de congé rejetée');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROUVEE':
        return 'bg-green-100 text-green-800';
      case 'REFUSEE':
        return 'bg-red-100 text-red-800';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROUVEE':
        return <CheckCircle className="w-4 h-4" />;
      case 'REFUSEE':
        return <XCircle className="w-4 h-4" />;
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return leave.status === 'EN_ATTENTE';
    if (filter === 'APPROVED') return leave.status === 'APPROUVEE';
    if (filter === 'REJECTED') return leave.status === 'REFUSEE';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center m-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Congés</h2>
          <p className="text-gray-600 mt-1">
            Gérez les demandes de congé des employés
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 m-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2  rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 ">
          <div className="flex items-center">
            <div className="p-2 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2  rounded-lg">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2  rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 m-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
          >
            Tous ({stats.total})
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('PENDING')}
          >
            En attente ({stats.pending})
          </Button>
          <Button
            variant={filter === 'APPROVED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('APPROVED')}
          >
            Approuvées ({stats.approved})
          </Button>
          <Button
            variant={filter === 'REJECTED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('REJECTED')}
          >
            Rejetées ({stats.rejected})
          </Button>
        </div>
      </div>

      {/* Liste des congés */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md m-8">
        <ul className="divide-y divide-gray-200">
          {filteredLeaves.map((leave) => (
            <li key={leave.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {leave.type} • Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                    </div>
                    {leave.reason && (
                      <div className="text-xs text-gray-400 mt-1">
                        {leave.reason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                    {getStatusIcon(leave.status)}
                    <span className="ml-1">
                      {leave.status === 'EN_ATTENTE' ? 'En attente' :
                       leave.status === 'APPROUVEE' ? 'Approuvé' :
                       leave.status === 'REFUSEE' ? 'Rejeté' : leave.status}
                    </span>
                  </span>

                  {leave.status === 'EN_ATTENTE' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveLeave(leave.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const reason = prompt('Motif du rejet:');
                          if (reason) handleRejectLeave(leave.id, reason);
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredLeaves.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'ALL' ? 'Aucune demande de congé trouvée' :
               filter === 'PENDING' ? 'Aucune demande en attente' :
               filter === 'APPROVED' ? 'Aucune demande approuvée' :
               'Aucune demande rejetée'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;