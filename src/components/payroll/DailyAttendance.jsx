import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi } from '../../api/attendanceApi';
import { payRunApi } from '../../api/payRunApi';
import { employeeApi } from '../../api/employeeApi';
import Button from '../common/Button';
import Notification from '../common/Notification';
import { Calendar, Clock, CheckCircle, XCircle, User, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

const DailyAttendance = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [attendances, setAttendances] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPayRun) {
      loadPayRunData(selectedPayRun);
    }
  }, [selectedDate, selectedPayRun]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer tous les cycles de paie actifs (BROUILLON ou APPROUVE)
      const payRunsResponse = await payRunApi.getAllPayRuns({ companyId: user?.companyId });
      const activePayRuns = payRunsResponse.payRuns.filter(pr =>
        pr.status === 'BROUILLON' || pr.status === 'APPROUVE'
      );
      setPayRuns(activePayRuns);

      // Si aucun cycle n'est sélectionné et qu'il y en a des disponibles, sélectionner le premier
      if (!selectedPayRun && activePayRuns.length > 0) {
        setSelectedPayRun(activePayRuns[0]);
      }

      // Charger les données si un cycle est sélectionné
      if (selectedPayRun) {
        await loadPayRunData(selectedPayRun);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Notification.error('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadPayRunData = async (payRun) => {
    try {
      // Récupérer les bulletins de ce cycle pour filtrer les employés
      const payRunsResponse = await payRunApi.getPayRunById(payRun.id);
      const payRunData = payRunsResponse.payRun;

      // Extraire les IDs des employés qui ont des bulletins dans ce cycle
      const employeeIdsWithPayslips = payRunData.payslips?.map(payslip => payslip.employeeId) || [];

      // Récupérer tous les employés et filtrer ceux qui ont des bulletins dans ce cycle
      const employeesResponse = await employeeApi.getAllEmployees();
      const dailyEmployees = employeesResponse.employees.filter(emp =>
        emp.isActive &&
        (emp.contractType === 'JOURNALIER' || emp.contractType === 'HONORAIRE') &&
        employeeIdsWithPayslips.includes(emp.id)
      );
      setEmployees(dailyEmployees);

      // Récupérer les pointages existants pour cette date et ce cycle
      const attendancesResponse = await attendanceApi.getAttendancesByPayRun(payRun.id);
      const dateAttendances = attendancesResponse.attendances.filter(att =>
        new Date(att.date).toISOString().split('T')[0] === selectedDate
      );

      // Organiser les pointages par employé
      const attendancesMap = {};
      dateAttendances.forEach(att => {
        attendancesMap[att.employeeId] = att;
      });
      setAttendances(attendancesMap);
    } catch (error) {
      console.error('Erreur lors du chargement des données du cycle:', error);
      Notification.error('Erreur', 'Impossible de charger les données du cycle');
    }
  };

  const handlePayRunChange = (payRunId) => {
    const payRun = payRuns.find(pr => pr.id === payRunId);
    setSelectedPayRun(payRun);
  };

  const handleHoursInput = async (employeeId) => {
    const { value: hours } = await Swal.fire({
      title: 'Nombre d\'heures travaillées',
      input: 'number',
      inputLabel: 'Entrez le nombre d\'heures (ex: 8.5)',
      inputPlaceholder: '8',
      inputAttributes: {
        min: '0',
        max: '24',
        step: '0.5'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Veuillez entrer un nombre d\'heures';
        }
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 24) {
          return 'Veuillez entrer un nombre valide entre 0 et 24';
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#f97316',
      customClass: {
        popup: 'swal2-custom-popup',
        confirmButton: 'swal2-custom-confirm',
        cancelButton: 'swal2-custom-cancel'
      }
    });

    if (hours) {
      await handleAttendanceChange(employeeId, 'PRESENCE', hours);
    }
  };

  const handleAttendanceChange = async (employeeId, type, hours = null) => {
    if (!selectedPayRun) return;

    const savingKey = `${employeeId}-${selectedDate}`;
    setSaving(prev => ({ ...prev, [savingKey]: true }));

    try {
      const attendanceData = {
        employeeId,
        payRunId: selectedPayRun.id,
        date: new Date(selectedDate),
        type,
        hours: hours ? parseFloat(hours) : undefined,
        isPresent: type === 'PRESENCE',
        notes: ''
      };

      // Vérifier si un pointage existe déjà
      const existingAttendance = attendances[employeeId];

      if (existingAttendance) {
        await attendanceApi.updateAttendance(existingAttendance.id, attendanceData);
        setAttendances(prev => ({
          ...prev,
          [employeeId]: { ...existingAttendance, ...attendanceData }
        }));
      } else {
        const response = await attendanceApi.createAttendance(attendanceData);
        setAttendances(prev => ({
          ...prev,
          [employeeId]: response.attendance || response
        }));
      }

      Notification.success('Succès', 'Pointage enregistré');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Notification.error('Erreur', 'Impossible d\'enregistrer le pointage');
    } finally {
      setSaving(prev => ({ ...prev, [savingKey]: false }));
    }
  };

  const getAttendanceStatus = (employeeId) => {
    const attendance = attendances[employeeId];
    if (!attendance) return null;

    return {
      type: attendance.type,
      hours: attendance.hours,
      isPresent: attendance.isPresent
    };
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    if (status.type === 'PRESENCE') return 'bg-green-100 text-green-800';
    if (status.type === 'ABSENCE_JUSTIFIEE') return 'bg-yellow-100 text-yellow-800';
    if (status.type === 'ABSENCE_INJUSTIFIEE') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getStatusText = (status) => {
    if (!status) return 'Non pointé';
    if (status.type === 'PRESENCE') return 'Présent';
    if (status.type === 'ABSENCE_JUSTIFIEE') return 'Absence justifiée';
    if (status.type === 'ABSENCE_INJUSTIFIEE') return 'Absence injustifiée';
    return status.type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (payRuns.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Aucun cycle actif</h3>
          <p className="text-yellow-700">Il n'y a pas de cycle de paie actif pour enregistrer les pointages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pointage quotidien</h1>
          {selectedPayRun && (
            <p className="text-gray-600">
              Cycle: Du {new Date(selectedPayRun.startDate).toLocaleDateString('fr-FR')} au {new Date(selectedPayRun.endDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-xl font-bold text-gray-600">JOUR : </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Cycle Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Sélectionner un cycle de paie
            </label>
            <select
              value={selectedPayRun?.id || ''}
              onChange={(e) => handlePayRunChange(e.target.value)}
              className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choisir un cycle...</option>
              {payRuns.map(payRun => (
                <option key={payRun.id} value={payRun.id}>
                  Du {new Date(payRun.startDate).toLocaleDateString('fr-FR')} au {new Date(payRun.endDate).toLocaleDateString('fr-FR')}
                  ({payRun.status === 'BROUILLON' ? 'Brouillon' : 'Approuvé'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees List - Only show if a cycle is selected */}
      {selectedPayRun ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Employés à pointer - {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
          </div>

        <ul className="divide-y divide-gray-200">
          {employees.map((employee) => {
            const status = getAttendanceStatus(employee.id);
            const savingKey = `${employee.id}-${selectedDate}`;
            const isSaving = saving[savingKey];

            return (
              <li key={employee.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.position} • {employee.contractType === 'JOURNALIER' ? 'Journalier' : 'Honoraire'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                      {status?.hours && ` (${status.hours}h)`}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAttendanceChange(employee.id, 'PRESENCE')}
                        variant={status?.type === 'PRESENCE' ? 'primary' : 'outline'}
                        size="sm"
                        disabled={isSaving}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Présent
                      </Button>

                      {employee.contractType === 'HONORAIRE' && (
                        <Button
                          onClick={() => handleHoursInput(employee.id)}
                          variant="secondary"
                          size="sm"
                          disabled={isSaving}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Heures
                        </Button>
                      )}

                      <Button
                        onClick={() => handleAttendanceChange(employee.id, 'ABSENCE_JUSTIFIEE')}
                        variant={status?.type === 'ABSENCE_JUSTIFIEE' ? 'warning' : 'outline'}
                        size="sm"
                        disabled={isSaving}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent J.
                      </Button>

                      <Button
                        onClick={() => handleAttendanceChange(employee.id, 'ABSENCE_INJUSTIFIEE')}
                        variant={status?.type === 'ABSENCE_INJUSTIFIEE' ? 'danger' : 'outline'}
                        size="sm"
                        disabled={isSaving}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent IJ.
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun employé journalier ou honoraire actif trouvé.</p>
          </div>
        )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Sélectionnez un cycle de paie</h3>
          <p className="text-gray-500">Choisissez un cycle de paie dans la liste ci-dessus pour commencer le pointage quotidien.</p>
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;