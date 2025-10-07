import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import axios from 'axios';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ total: 0, used: 0, remaining: 0 });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'ANNUEL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/leaves/my-leaves');
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Erreur lors du chargement des congés:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/leaves/my-balance');
      setLeaveBalance(response.data.balance);
    } catch (error) {
      console.error('Erreur lors du chargement du solde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      alert('Veuillez saisir les dates de début et de fin');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate > endDate) {
      alert('La date de fin doit être après la date de début');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/leaves', {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });

      setShowRequestModal(false);
      resetForm();
      fetchLeaves();
      alert('Demande de congé envoyée avec succès');
    } catch (error) {
      console.error('Erreur lors de la demande:', error);
      alert('Erreur: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/leaves/${leaveId}/cancel`);
      fetchLeaves();
      alert('Demande annulée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'ANNUEL',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROUVEE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REFUSEE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ANNULEE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROUVEE':
        return <CheckCircle className="w-4 h-4" />;
      case 'REFUSEE':
        return <XCircle className="w-4 h-4" />;
      case 'ANNULEE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case 'ANNUEL':
        return 'Congé annuel';
      case 'MALADIE':
        return 'Congé maladie';
      case 'EXCEPTIONNEL':
        return 'Congé exceptionnel';
      case 'MATERNITE':
        return 'Congé maternité';
      case 'PATERNITE':
        return 'Congé paternité';
      case 'SANS_SOLDE':
        return 'Congé sans solde';
      default:
        return type;
    }
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Compter seulement les jours ouvrés
    let workingDays = 0;
    const currentDate = new Date(start);
    for (let i = 0; i < diffDays; i++) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lundi à vendredi
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Solde de congés */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Solde de congés</h3>
          <Calendar className="w-6 h-6 text-orange-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{leaveBalance.total}</div>
            <div className="text-sm text-blue-800">Total annuel</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{leaveBalance.used}</div>
            <div className="text-sm text-orange-800">Utilisés</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{leaveBalance.remaining}</div>
            <div className="text-sm text-green-800">Restants</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Mes demandes de congé</h2>
        <Button
          onClick={() => setShowRequestModal(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle demande</span>
        </Button>
      </div>

      {/* Liste des congés */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {leaves.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
            <p className="text-gray-500">Vous n'avez pas encore fait de demande de congé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getLeaveTypeLabel(leave.type)}
                      </h4>
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        <span>{leave.status === 'EN_ATTENTE' ? 'En attente' :
                               leave.status === 'APPROUVEE' ? 'Approuvé' :
                               leave.status === 'REFUSEE' ? 'Refusé' : 'Annulé'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Du:</span> {new Date(leave.startDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="font-medium">Au:</span> {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <span className="font-medium">Jours:</span> {calculateLeaveDays(leave.startDate, leave.endDate)}
                      </div>
                      <div>
                        <span className="font-medium">Demandé le:</span> {new Date(leave.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Motif:</span> {leave.reason}
                      </div>
                    )}

                    {leave.notes && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Note de l'administrateur:</span> {leave.notes}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {leave.status === 'EN_ATTENTE' && (
                      <Button
                        onClick={() => handleCancelLeave(leave.id)}
                        variant="danger"
                        size="sm"
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de demande de congé */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          resetForm();
        }}
        title="Nouvelle demande de congé"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de congé
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="ANNUEL">Congé annuel</option>
              <option value="MALADIE">Congé maladie</option>
              <option value="EXCEPTIONNEL">Congé exceptionnel</option>
              <option value="MATERNITE">Congé maternité</option>
              <option value="PATERNITE">Congé paternité</option>
              <option value="SANS_SOLDE">Congé sans solde</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date de début"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />

            <FormInput
              label="Date de fin"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif (optionnel)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Expliquez brièvement le motif de votre demande..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowRequestModal(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Envoyer la demande
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;