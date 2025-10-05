import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Notification from '../common/Notification';
import { ArrowBigDownDash  } from 'lucide-react';

const PayslipPDF = ({ payslip, onClose }) => {
  const generatePDF = async () => {
    const element = document.getElementById('payslip-content');

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

      const fileName = `bulletin_${payslip.employee.firstName}_${payslip.employee.lastName}_${payslip.payRunPeriod}.pdf`;
      pdf.save(fileName);

      onClose();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Notification.error('Erreur', 'Impossible de générer le PDF du bulletin');
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

  const formatContractType = (contractType) => {
    switch (contractType) {
      case 'JOURNALIER': return 'Journalier';
      case 'FIXE': return 'Fixe';
      case 'HONORAIRE': return 'Honoraire';
      default: return contractType;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulletin de Paie</h2>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <ArrowBigDownDash />  Télécharger PDF
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>

      <div id="payslip-content" className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BULLETIN DE PAIE</h1>
          <p className="text-lg text-gray-600">Période: {payslip.payRunPeriod}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Informations Entreprise</h2>
          <div className="bg-gray-50 p-4 rounded flex items-center space-x-4">
            {payslip.companyLogo ? (
              <img
                src={payslip.companyLogo}
                alt={`${payslip.companyName} logo`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {payslip.companyName?.charAt(0) || 'E'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-gray-700"><strong>Nom:</strong> {payslip.companyName}</p>
              <p className="text-gray-700"><strong>Adresse:</strong> {payslip.companyAddress || 'Adresse non spécifiée'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Informations Employé</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700"><strong>Nom:</strong> {payslip.employee.firstName} {payslip.employee.lastName}</p>
              <p className="text-gray-700"><strong>Poste:</strong> {payslip.employee.position}</p>
              <p className="text-gray-700"><strong>Type de contrat:</strong> {formatContractType(payslip.employee.contractType)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700"><strong>Matricule:</strong> EMP-{payslip.employee.id.slice(-4).toUpperCase()}</p>
              <p className="text-gray-700"><strong>Date d'émission:</strong> {formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails de Rémunération</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Salaire Brut</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(payslip.gross)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Déductions (5%)</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">-{formatCurrency(payslip.deductions)}</td>
              </tr>
              <tr className="bg-orange-50">
                <td className="border border-gray-300 px-4 py-2 font-bold text-lg">Salaire Net à Payer</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-lg text-orange-600">{formatCurrency(payslip.net)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Statut du Paiement</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">
                <strong>Statut:</strong>
                <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                  payslip.status === 'PAYE' ? 'bg-green-100 text-green-800' :
                  payslip.status === 'PARTIEL' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {payslip.status === 'PAYE' ? 'Payé' :
                   payslip.status === 'PARTIEL' ? 'Paiement partiel' :
                   'En attente'}
                </span>
              </span>
              {payslip.payments && payslip.payments.length > 0 && (
                <span className="text-gray-700">
                  <strong>Déjà payé:</strong> {formatCurrency(payslip.payments.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>Ce bulletin est généré automatiquement par le système de gestion RH.</p>
          <p>Pour toute question, contactez votre service RH.</p>
        </div>
      </div>
    </div>
  );
};

export default PayslipPDF;