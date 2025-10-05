import React, { useState } from 'react';
import { usePayRuns } from '../../context/PayRunsContext';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Notification from '../common/Notification';
import Modal from '../common/Modal';
import PayslipPDF from './PayslipPDF';
import { CalendarDays, FileText, Users } from 'lucide-react';
import axios from 'axios';

const PayRunsList = () => {
  const { payRuns, loading, generatePayslips, approvePayRun, closePayRun } = usePayRuns();
  const navigate = useNavigate();
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'BROUILLON': return 'bg-yellow-100 text-yellow-800';
      case 'APPROUVE': return 'bg-blue-100 text-blue-800';
      case 'CLOTURE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'BROUILLON': return 'Brouillon';
      case 'APPROUVE': return 'Approuvé';
      case 'CLOTURE': return 'Clôturé';
      default: return status;
    }
  };

  const handleGeneratePayslips = async (payRunId) => {
    const result = await Notification.confirm(
      'Confirmer la génération',
      'Êtes-vous sûr de vouloir générer les bulletins pour ce cycle ?',
      'Générer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await generatePayslips(payRunId);
        Notification.success('Succès', 'Bulletins générés avec succès !');
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        Notification.error('Erreur', 'Impossible de générer les bulletins');
      }
    }
  };

  const handleApprove = async (payRunId) => {
    const result = await Notification.confirm(
      'Confirmer l\'approbation',
      'Êtes-vous sûr de vouloir approuver ce cycle de paie ?',
      'Approuver',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await approvePayRun(payRunId);
        Notification.success('Succès', 'Cycle approuvé avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'approbation:', error);
        Notification.error('Erreur', 'Impossible d\'approuver le cycle');
      }
    }
  };

  const handleClose = async (payRunId) => {
    const result = await Notification.confirm(
      'Confirmer la clôture',
      'Êtes-vous sûr de vouloir clôturer ce cycle de paie ?',
      'Clôturer',
      'Annuler'
    );

    if (result.isConfirmed) {
      try {
        await closePayRun(payRunId);
        Notification.success('Succès', 'Cycle clôturé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
        Notification.error('Erreur', 'Impossible de clôturer le cycle');
      }
    }
  };

  const handleViewPayslip = (payslip, payRun) => {
    const payslipWithCompany = {
      ...payslip,
      payRunPeriod: payRun.period,
      companyName: payRun.company?.name || 'Entreprise',
      companyAddress: payRun.company?.address || 'Adresse non spécifiée',
      companyLogo: payRun.company?.logo || null
    };
    setSelectedPayslip(payslipWithCompany);
    setShowPDFModal(true);
  };

  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setSelectedPayslip(null);
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-gray-500">Chargement des cycles de paie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white m-8 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {payRuns.map((payRun) => (
          <li key={payRun.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                     <CalendarDays className='text-orange-500 text' />
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    Période: {payRun.period}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payRun.startDate && payRun.endDate ?
                      `Du ${new Date(payRun.startDate).toLocaleDateString('fr-FR')} au ${new Date(payRun.endDate).toLocaleDateString('fr-FR')}` :
                      'Période non définie'
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {payRun.company?.name} • {payRun.payslips?.length || 0} bulletins
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payRun.status)}`}>
                  {getStatusText(payRun.status)}
                </span>
                <div className="flex space-x-2">
                  {payRun.status === 'BROUILLON' && (
                    <>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGeneratePayslips(payRun.id);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Générer bulletins
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(payRun.id);
                        }}
                        variant="primary"
                        size="sm"
                      >
                        Approuver
                      </Button>
                    </>
                  )}
                  {payRun.status === 'APPROUVE' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose(payRun.id);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Clôturer
                    </Button>
                  )}
                  {payRun.status === 'CLOTURE' && (
                    <span className="text-gray-500 text-sm">Terminé</span>
                  )}
                </div>
              </div>
            </div>
            {payRun.payslips && payRun.payslips.length > 0 && (
              <div className="mt-4 ml-14">
                <div className="text-sm text-gray-600">
                  <div className="space-y-2">
                    {payRun.payslips.map((payslip) => (
                      <div key={payslip.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <div className="font-medium text-gray-900">
                            {payslip.employee.firstName} {payslip.employee.lastName}
                          </div>
                          <div className="text-gray-500">
                            Salaire net: {payslip.net.toLocaleString()} FCFA
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPayslip(payslip, payRun);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <FileText className='text-orange-500' />
                          Voir Bulletin
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {payRuns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun cycle de paie trouvé.</p>
        </div>
      )}

      <Modal
        isOpen={showPDFModal}
        onClose={handleClosePDFModal}
        size="xl"
      >
        {selectedPayslip && (
          <PayslipPDF
            payslip={selectedPayslip}
            onClose={handleClosePDFModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default PayRunsList;