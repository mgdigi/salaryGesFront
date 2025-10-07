import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { qrCodeApi } from '../../api/qrCodeApi';
import { employeeApi } from '../../api/employeeApi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Notification from '../common/Notification';
import { QrCode, Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAllEmployees();
      // Pour chaque employé, vérifier s'il a un QR code actif
      const employeesWithQR = await Promise.all(
        (response.employees || []).map(async (employee) => {
          if (employee.qrCodeId) {
            try {
              const qrResponse = await qrCodeApi.getEmployeeQR(employee.id);
              return { ...employee, qrCode: qrResponse };
            } catch (error) {
              return { ...employee, qrCode: null };
            }
          }
          return { ...employee, qrCode: null };
        })
      );
      setEmployees(employeesWithQR);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      Notification.error('Erreur', 'Impossible de charger les employés');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (employeeId) => {
    try {
      setGenerating(true);
      const response = await qrCodeApi.generateEmployeeQR(employeeId);
      Notification.success('Succès', 'QR code généré avec succès');
      fetchEmployees(); // Recharger la liste pour voir le nouveau QR
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      Notification.error('Erreur', 'Impossible de générer le QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateQR = async (employeeId) => {
    const result = await Notification.confirm(
      'Régénérer le QR code',
      'Cela invalidera l\'ancien QR code. Voulez-vous continuer ?',
      'Régénérer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        setGenerating(true);
        const response = await qrCodeApi.regenerateEmployeeQR(employeeId);
        Notification.success('Succès', 'QR code régénéré avec succès');
        fetchEmployees();
      } catch (error) {
        console.error('Erreur lors de la régénération:', error);
        Notification.error('Erreur', 'Impossible de régénérer le QR code');
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleViewQR = async (employee) => {
    try {
      const response = await qrCodeApi.getEmployeeQR(employee.id);

      // Générer l'image QR code à partir des données JSON
      const qrCodeDataURL = await QRCode.toDataURL(response.data, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      setQrCodeData({
        employee,
        qrCode: response,
        qrCodeImage: qrCodeDataURL
      });
      setShowQRModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération du QR:', error);
      Notification.error('Erreur', 'QR code non trouvé');
    }
  };

  const handleBulkGenerate = async () => {
    const result = await Notification.confirm(
      'Génération en masse',
      `Cela va générer des QR codes pour tous les employés actifs (${employees.filter(e => e.isActive).length} employés). Voulez-vous continuer ?`,
      'Générer tout',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        setGenerating(true);
        const response = await qrCodeApi.generateBulkQRCodes(user.companyId);
        Notification.success('Succès', `${response.results.length} QR codes générés`);
        fetchEmployees();
      } catch (error) {
        console.error('Erreur lors de la génération en masse:', error);
        Notification.error('Erreur', 'Impossible de générer les QR codes en masse');
      } finally {
        setGenerating(false);
      }
    }
  };

  const downloadQRCode = (employee, qrCodeImage) => {
    // Télécharger l'image QR code générée
    const link = document.createElement('a');
    link.download = `qr-${employee.firstName}-${employee.lastName}.png`;
    link.href = qrCodeImage;
    link.click();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des QR Codes</h2>
          <p className="text-gray-600 mt-1">
            Générez et gérez les QR codes pour le pointage automatique
          </p>
        </div>
        <Button
          onClick={handleBulkGenerate}
          variant="primary"
          disabled={generating}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Générer tous les QR codes
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {employees.map((employee) => (
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
                      {employee.position} • {employee.contractType}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Actif' : 'Inactif'}
                  </span>

                  {employee.isActive && (
                    <div className="flex items-center space-x-2">
                      {employee.qrCodeId || employee.qrCode ? (
                        <>
                          <Button
                            onClick={() => handleViewQR(employee)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir QR
                          </Button>
                          <Button
                            onClick={() => handleRegenerateQR(employee.id)}
                            variant="secondary"
                            size="sm"
                            disabled={generating}
                          >
                            <RefreshCw className={`w-4 h-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
                            Régénérer
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleGenerateQR(employee.id)}
                          variant="primary"
                          size="sm"
                          disabled={generating}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          Générer QR
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {/* Modal d'affichage du QR code */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setQrCodeData(null);
        }}
        title="QR Code de pointage"
        size="md"
      >
        {qrCodeData && (
          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {qrCodeData.employee.firstName} {qrCodeData.employee.lastName}
              </h3>
              <p className="text-sm text-gray-500">{qrCodeData.employee.position}</p>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg mb-4">
              {/* QR code réel */}
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                {qrCodeData.qrCodeImage ? (
                  <img
                    src={qrCodeData.qrCodeImage}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                ) : (
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Chargement...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p><strong>Valide jusqu'au:</strong> {new Date(qrCodeData.qrCode.expiresAt).toLocaleDateString('fr-FR')}</p>
              <p><strong>Dernière régénération:</strong> {new Date(qrCodeData.qrCode.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => downloadQRCode(qrCodeData.employee, qrCodeData.qrCodeImage)}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button
                onClick={() => handleRegenerateQR(qrCodeData.employee.id)}
                variant="primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Régénérer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QRCodeGenerator;