import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceApi } from '../../api/attendanceApi';
import { payRunApi } from '../../api/payRunApi';
import { employeeApi } from '../../api/employeeApi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Notification from '../common/Notification';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';

const AttendanceManagement = () => {
  const { payRunId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [payRun, setPayRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    type: 'PRESENCE',
    hours: '',
    isPresent: true,
    notes: ''
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [bulkAttendanceData, setBulkAttendanceData] = useState({
    startDate: '',
    endDate: '',
    type: 'PRESENCE',
    hours: '',
    isPresent: true,
    notes: ''
  });

  useEffect(() => {
    if (payRunId) {
      fetchPayRunAndAttendances();
    }
  }, [payRunId]);

  const fetchPayRunAndAttendances = async () => {
    try {
      setLoading(true);
      const [payRunResponse, attendancesResponse, employeesResponse] = await Promise.all([
        payRunApi.getPayRunById(payRunId),
        attendanceApi.getAttendancesByPayRun(payRunId),
        employeeApi.getAllEmployees()
      ]);

      setPayRun(payRunResponse.payRun);
      setAttendances(attendancesResponse.attendances);
      setEmployees(employeesResponse.employees || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Notification.error('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const attendanceData = {
        ...formData,
        payRunId,
        date: new Date(formData.date),
        hours: formData.hours ? parseFloat(formData.hours) : undefined
      };

      if (editingAttendance) {
        await attendanceApi.updateAttendance(editingAttendance.id, attendanceData);
        Notification.success('Succès', 'Pointage mis à jour');
      } else {
        await attendanceApi.createAttendance(attendanceData);
        Notification.success('Succès', 'Pointage créé');
      }

      fetchPayRunAndAttendances();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Notification.error('Erreur', 'Impossible de sauvegarder le pointage');
    }
  };

  const handleEdit = (attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      employeeId: attendance.employeeId,
      date: new Date(attendance.date).toISOString().split('T')[0],
      type: attendance.type,
      hours: attendance.hours?.toString() || '',
      isPresent: attendance.isPresent,
      notes: attendance.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (attendanceId) => {
    const result = await Notification.confirm(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce pointage ?',
      'Supprimer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await attendanceApi.deleteAttendance(attendanceId);
        Notification.success('Succès', 'Pointage supprimé');
        fetchPayRunAndAttendances();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Notification.error('Erreur', 'Impossible de supprimer le pointage');
      }
    }
  };

  const handleBulkGenerateAttendances = async () => {
    if (!bulkAttendanceData.startDate || !bulkAttendanceData.endDate) {
      Notification.error('Erreur', 'Veuillez sélectionner les dates de début et fin');
      return;
    }

    const result = await Notification.confirm(
      'Générer les pointages en masse',
      `Cela va créer des pointages "${getAttendanceLabel(bulkAttendanceData.type)}" pour tous les employés actifs entre le ${new Date(bulkAttendanceData.startDate).toLocaleDateString('fr-FR')} et le ${new Date(bulkAttendanceData.endDate).toLocaleDateString('fr-FR')}. Voulez-vous continuer ?`,
      'Générer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        const startDate = new Date(bulkAttendanceData.startDate);
        const endDate = new Date(bulkAttendanceData.endDate);
        const attendances = [];

        employees.forEach(employee => {
          if (employee.isActive) {
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dayOfWeek = currentDate.getDay();
              if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
                attendances.push({
                  employeeId: employee.id,
                  payRunId,
                  date: new Date(currentDate),
                  type: bulkAttendanceData.type,
                  hours: bulkAttendanceData.hours ? parseFloat(bulkAttendanceData.hours) : undefined,
                  isPresent: bulkAttendanceData.isPresent,
                  notes: bulkAttendanceData.notes || undefined
                });
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });

        await attendanceApi.bulkCreateAttendances(attendances);
        Notification.success('Succès', `${attendances.length} pointages générés`);
        fetchPayRunAndAttendances();

        setBulkAttendanceData({
          startDate: '',
          endDate: '',
          type: 'PRESENCE',
          hours: '',
          isPresent: true,
          notes: ''
        });
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        Notification.error('Erreur', 'Impossible de générer les pointages');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAttendance(null);
    setFormData({
      employeeId: '',
      date: '',
      type: 'PRESENCE',
      hours: '',
      isPresent: true,
      notes: ''
    });
  };

  const getAttendanceIcon = (type) => {
    switch (type) {
      case 'PRESENCE':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ABSENCE_JUSTIFIEE':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ABSENCE_INJUSTIFIEE':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CONGE':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'MALADIE':
        return <Clock className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAttendanceLabel = (type) => {
    switch (type) {
      case 'PRESENCE':
        return 'Présent';
      case 'ABSENCE_JUSTIFIEE':
        return 'Absence justifiée';
      case 'ABSENCE_INJUSTIFIEE':
        return 'Absence injustifiée';
      case 'CONGE':
        return 'Congé';
      case 'MALADIE':
        return 'Maladie';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des pointages</h1>
          {payRun && (
            <p className="text-gray-600">
              Cycle: {payRun.name || `Du ${new Date(payRun.startDate).toLocaleDateString()} au ${new Date(payRun.endDate).toLocaleDateString()}`}
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau pointage
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Génération en masse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Date début</label>
            <input
              type="date"
              value={bulkAttendanceData.startDate}
              onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, startDate: e.target.value})}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Date fin</label>
            <input
              type="date"
              value={bulkAttendanceData.endDate}
              onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, endDate: e.target.value})}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Type</label>
            <select
              value={bulkAttendanceData.type}
              onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, type: e.target.value})}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PRESENCE">Présence</option>
              <option value="ABSENCE_JUSTIFIEE">Absence justifiée</option>
              <option value="ABSENCE_INJUSTIFIEE">Absence injustifiée</option>
              <option value="CONGE">Congé</option>
              <option value="MALADIE">Maladie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Heures (optionnel)</label>
            <input
              type="number"
              step="0.5"
              value={bulkAttendanceData.hours}
              onChange={(e) => setBulkAttendanceData({...bulkAttendanceData, hours: e.target.value})}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="8"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleBulkGenerateAttendances}
            variant="primary"
          >
            Générer les pointages
          </Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {attendances.map((attendance) => (
            <li key={`${attendance.employeeId}-${attendance.date}`} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getAttendanceIcon(attendance.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {attendance.employee.firstName} {attendance.employee.lastName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        {new Date(attendance.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getAttendanceLabel(attendance.type)}
                      </span>
                      {attendance.hours && (
                        <span className="text-sm text-gray-500">
                          {attendance.hours}h
                        </span>
                      )}
                    </div>
                    {attendance.notes && (
                      <p className="text-sm text-gray-500 mt-1">{attendance.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleEdit(attendance)}
                    variant="outline"
                    size="sm"
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => handleDelete(attendance.id)}
                    variant="danger"
                    size="sm"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {attendances.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun pointage enregistré pour ce cycle</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAttendance ? 'Modifier le pointage' : 'Nouveau pointage'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employé</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Sélectionner un employé</option>
              {employees.filter(emp => emp.isActive).map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="PRESENCE">Présence</option>
              <option value="ABSENCE_JUSTIFIEE">Absence justifiée</option>
              <option value="ABSENCE_INJUSTIFIEE">Absence injustifiée</option>
              <option value="CONGE">Congé</option>
              <option value="MALADIE">Maladie</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Heures travaillées</label>
            <input
              type="number"
              step="0.5"
              value={formData.hours}
              onChange={(e) => setFormData({...formData, hours: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Laisser vide pour calcul automatique"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notes optionnelles..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleCloseModal}
              variant="secondary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {editingAttendance ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;