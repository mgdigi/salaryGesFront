import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Notification from '../common/Notification';
import {ArrowBigDownDash} from 'lucide-react';

const PaymentReceiptPDF = ({ payment, onClose }) => {
  const generatePDF = async () => {
    const element = document.getElementById('receipt-content');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignorer les éléments avec des styles non supportés
          return element.classList.contains('ignore-pdf');
        },
        onclone: (clonedDoc) => {
          // Supprimer les styles Tailwind problématiques
          const styleSheets = clonedDoc.styleSheets;
          for (let i = 0; i < styleSheets.length; i++) {
            try {
              const rules = styleSheets[i].cssRules;
              for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.cssText && rule.cssText.includes('oklch')) {
                  // Supprimer la règle problématique
                  styleSheets[i].deleteRule(j);
                  j--; // Ajuster l'index après suppression
                }
              }
            } catch (e) {
              // Ignorer les erreurs d'accès aux CSS
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `recu_paiement_${payment.payslip.employee.firstName}_${payment.payslip.employee.lastName}_${new Date(payment.date).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      onClose();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Notification.error('Erreur', 'Impossible de générer le PDF du reçu');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'ESPECES': return 'Espèces';
      case 'VIREMENT': return 'Virement bancaire';
      case 'ORANGE_MONEY': return 'Orange Money';
      case 'WAVE': return 'Wave';
      default: return method;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reçu de Paiement</h2>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <ArrowBigDownDash /> Télécharger PDF
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>

      <div id="receipt-content" className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">REÇU DE PAIEMENT</h1>
          <p className="text-lg text-gray-600">N° {payment.id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Informations de l'Entreprise</h2>
          <div className="bg-gray-50 p-4 rounded flex items-center space-x-4">
            {payment.payslip.companyLogo && (
              <img
                src={payment.payslip.companyLogo}
                alt={`${payment.payslip.companyName} logo`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
            )}
            <div className="flex-1">
              <p className="text-gray-700"><strong>Nom:</strong> {payment.payslip.companyName}</p>
              <p className="text-gray-700"><strong>Adresse:</strong> {payment.payslip.companyAddress || 'Adresse non spécifiée'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Informations du Paiement</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700"><strong>Employé:</strong> {payment.payslip.employee.firstName} {payment.payslip.employee.lastName}</p>
              <p className="text-gray-700"><strong>Poste:</strong> {payment.payslip.employee.position}</p>
              <p className="text-gray-700"><strong>Période:</strong> {payment.payslip.payRunPeriod}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700"><strong>Date de paiement:</strong> {formatDate(payment.date)}</p>
              <p className="text-gray-700"><strong>Mode de paiement:</strong> {getMethodText(payment.method)}</p>
              <p className="text-gray-700"><strong>Montant payé:</strong> {formatCurrency(payment.amount)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Détails du Salaire</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Salaire Brut</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.payslip.gross)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Déductions</p>
                <p className="text-lg font-bold text-red-600">-{formatCurrency(payment.payslip.deductions)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Salaire Net</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(payment.payslip.net)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Statut du Paiement</h2>
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-orange-800 font-semibold">Paiement validé et enregistré</p>
                <p className="text-orange-600 text-sm">Le {formatDate(payment.date)} à {new Date(payment.date).toLocaleTimeString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>Ce reçu atteste du paiement effectué et fait office de justificatif officiel.</p>
          <p>Conservez ce document pour vos archives.</p>
          <p className="mt-2 font-semibold">Reçu généré automatiquement le {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptPDF;