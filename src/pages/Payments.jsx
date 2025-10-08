import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/common/Notification';
import Layout from '../components/layout/Layout';
import { paymentApi } from '../api/paymentApi';
import { payRunApi } from '../api/payRunApi';
import { Download, ClipboardClock  } from 'lucide-react';
import PaymentReceiptPDF from '../components/payroll/PaymentReceiptPDF';
import PayslipPDF from '../components/payroll/PayslipPDF';
import Modal from '../components/common/Modal';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'ESPECES'
  });

  useEffect(() => {
    fetchPayments();
    fetchPendingPayslips();
  }, []);

  const fetchPayments = async () => {
    try {
      const companyId = user?.role === 'SUPER_ADMIN' ? undefined : user?.companyId;
      const response = await paymentApi.getAllPayments({ companyId });

      const enrichedPayments = response.payments.map(payment => ({
        ...payment,
        payslip: {
          ...payment.payslip,
          employee: {
            ...payment.payslip.employee,
            contractType: payment.payslip.employee?.contractType || 'FIXE' 
          },
          companyName: payment.payslip.payRun?.company?.name || 'Entreprise',
          companyAddress: payment.payslip.payRun?.company?.address || 'Adresse non spécifiée',
          companyLogo: payment.payslip.payRun?.company?.logo || null,
          payRunPeriod: payment.payslip.payRun?.period || 'Période inconnue'
        }
      }));

      setPayments(enrichedPayments);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    }
  };

  const fetchPendingPayslips = async () => {
    try {
      const companyId = user?.role === 'SUPER_ADMIN' ? undefined : user?.companyId;
      const payRunsResponse = await payRunApi.getAllPayRuns({ companyId });
      const payRuns = payRunsResponse.payRuns;

      const allPayslips = [];
      payRuns.forEach(payRun => {
        if (payRun.payslips) {
          payRun.payslips.forEach(payslip => {
            if (payslip.status !== 'PAYE') {
              allPayslips.push({
                ...payslip,
                employee: {
                  ...payslip.employee,
                  contractType: payslip.employee?.contractType || 'FIXE' 
                },
                payRunPeriod: payRun.period,
                companyName: payRun.company?.name,
                companyAddress: payRun.company?.address || 'Adresse non spécifiée',
                companyLogo: payRun.company?.logo || null
              });
            }
          });
        }
      });

      setPayslips(allPayslips);
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAmount = (amount) => {
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    const num = parseFloat(amount);
    return amountRegex.test(amount) && num > 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!validateAmount(formData.amount)) {
      Notification.error('Erreur de validation', 'Veuillez saisir un montant valide (nombre positif avec maximum 2 décimales)');
      return;
    }

    try {
      await paymentApi.createPayment({
        payslipId: selectedPayslip.id,
        amount: parseFloat(formData.amount),
        method: formData.method
      });

      fetchPayments();
      fetchPendingPayslips();
      window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
      setShowModal(false);
      setSelectedPayslip(null);
      resetForm();
      Notification.success('Succès', 'Paiement enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      Notification.error('Erreur', 'Impossible d\'enregistrer le paiement');
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      method: 'ESPECES'
    });
  };

  const openPaymentModal = (payslip) => {
    setSelectedPayslip(payslip);
    const totalPaid = payslip.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const remainingAmount = payslip.net - totalPaid;

    setFormData({
      amount: remainingAmount.toString(),
      method: 'ESPECES'
    });
    setShowModal(true);
  };

  const openReceiptModal = (payment) => {
    const enrichedPayment = {
      ...payment,
      payslip: {
        ...payment.payslip,
        companyName: payment.payslip.payRun?.company?.name || 'Entreprise',
        companyAddress: payment.payslip.payRun?.company?.address || 'Adresse non spécifiée',
        companyLogo: payment.payslip.payRun?.company?.logo || null,
        payRunPeriod: payment.payslip.payRun?.period || 'Période inconnue'
      }
    };
    setSelectedPayment(enrichedPayment);
    setShowReceiptModal(true);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedPayment(null);
  };

  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipForDownload, setSelectedPayslipForDownload] = useState(null);

  const downloadPayslip = async (payslip) => {
    try {
      
      const payslipData = payslip.payslip || payslip;

      const enrichedPayslip = {
        ...payslipData,
        employee: {
          ...payslipData.employee,
          contractType: payslipData.employee?.contractType || 'FIXE' 
        },
        companyName: payslipData.companyName || payslipData.payRun?.company?.name || 'Entreprise',
        companyAddress: payslipData.companyAddress || payslipData.payRun?.company?.address || 'Adresse non spécifiée',
        companyLogo: payslipData.companyLogo || payslipData.payRun?.company?.logo || null,
        payRunPeriod: payslipData.payRunPeriod || payslipData.payRun?.period || 'Période inconnue'
      };

      setSelectedPayslipForDownload(enrichedPayslip);
      setShowPayslipModal(true);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      Notification.error('Erreur', 'Impossible de charger le bulletin');
    }
  };

  const closePayslipModal = () => {
    setShowPayslipModal(false);
    setSelectedPayslipForDownload(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'PARTIEL': return 'bg-blue-100 text-blue-800';
      case 'PAYE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'PARTIEL': return 'Partiel';
      case 'PAYE': return 'Payé';
      default: return status;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'ESPECES': return 'Espèces';
      case 'VIREMENT': return 'Virement';
      case 'ORANGE_MONEY': return 'Orange Money';
      case 'WAVE': return 'Wave';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des paiements
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bulletins en attente de paiement
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {payslips.map((payslip) => {
                  const totalPaid = payslip.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
                  const remainingAmount = payslip.net - totalPaid;

                  return (
                    <li key={payslip.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  <ClipboardClock  className="text-white"/>
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {payslip.employee.firstName} {payslip.employee.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payslip.payRunPeriod} • {payslip.companyName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Restant: {remainingAmount.toLocaleString()} FCFA
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payslip.status)}`}>
                            {getStatusText(payslip.status)}
                          </span>
                          <button
                            onClick={() => downloadPayslip(payslip)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Bulletin</span>
                          </button>
                          <button
                            onClick={() => openPaymentModal(payslip)}
                            className="bg-gray-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                          >
                            Payer
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {payslips.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun bulletin en attente de paiement.</p>
                </div>
              )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Historique des paiements
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {payments.slice(0, 10).map((payment) => (
                  <li key={payment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-green-700">
                              ✓
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.payslip.employee.firstName} {payment.payslip.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.date).toLocaleDateString()} • {getMethodText(payment.method)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.amount.toLocaleString()} FCFA
                        </div>
                        <button
                          onClick={() => downloadPayslip(payment.payslip)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Bulletin</span>
                        </button>
                        <button
                          onClick={() => openReceiptModal(payment)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Reçu</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {payments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun paiement enregistré.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedPayslip && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enregistrer un paiement
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Employé:</strong> {selectedPayslip.employee.firstName} {selectedPayslip.employee.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Montant net:</strong> {selectedPayslip.net.toLocaleString()} FCFA
                </p>
                {selectedPayslip.payments && selectedPayslip.payments.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <strong>Déjà payé:</strong> {selectedPayslip.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} FCFA
                  </p>
                )}
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mode de paiement</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="VIREMENT">Virement bancaire</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="WAVE">Wave</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showReceiptModal}
        onClose={closeReceiptModal}
        size="xl"
      >
        {selectedPayment && (
          <PaymentReceiptPDF
            payment={selectedPayment}
            onClose={closeReceiptModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={showPayslipModal}
        onClose={closePayslipModal}
        size="xl"
      >
        {selectedPayslipForDownload && (
          <PayslipPDF
            payslip={selectedPayslipForDownload}
            onClose={closePayslipModal}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default Payments;