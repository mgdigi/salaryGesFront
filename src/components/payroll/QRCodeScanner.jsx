import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, Loader } from 'lucide-react';
import Button from '../common/Button';
import axios from 'axios';

const QRCodeScanner = ({ onAttendanceMarked, payRunId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [processing, setProcessing] = useState(false);
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "environment" // Utilise la caméra arrière sur mobile
  };

  const startScanning = useCallback(() => {
    setCameraActive(true);
    setIsScanning(true);
    setLastScanned(null);

    // Scanner toutes les 500ms
    intervalRef.current = setInterval(() => {
      captureAndScan();
    }, 500);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setCameraActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current || processing) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      setProcessing(true);

      // Convertir l'image base64 en blob pour l'envoyer
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Créer FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('image', blob, 'qr-scan.png');

      // Envoyer à un service de décodage QR (nous utiliserons une approche différente)
      // Pour l'instant, simulons avec une validation côté serveur
      const scanResult = await scanQRCode(imageSrc);

      if (scanResult) {
        await processQRCode(scanResult);
      }
    } catch (error) {
      console.error('Erreur lors du scan:', error);
    } finally {
      setProcessing(false);
    }
  }, [processing]);

  const scanQRCode = async (imageSrc) => {
    // Cette fonction devrait utiliser une bibliothèque de scan QR
    // Pour l'instant, nous simulons avec une validation côté serveur
    // Dans un vrai projet, utiliser jsQR ou une API de scan QR

    // Simulation: extraire les données du QR code
    // En réalité, il faudrait analyser l'image
    return null; // Retourner les données du QR si trouvé
  };

  const processQRCode = async (qrData) => {
    try {
      // Valider le QR code auprès du serveur
      const response = await axios.post('http://localhost:3000/api/qrcodes/validate', {
        qrData: qrData
      });

      const { employeeId, isValid, employee } = response.data;

      if (isValid && employee) {
        // Enregistrer la présence
        await markAttendance(employeeId, employee);
      } else {
        setLastScanned({
          success: false,
          message: 'QR code invalide ou expiré',
          employee: null
        });
      }
    } catch (error) {
      console.error('Erreur lors du traitement du QR code:', error);
      setLastScanned({
        success: false,
        message: 'Erreur lors du traitement',
        employee: null
      });
    }
  };

  const markAttendance = async (employeeId, employee) => {
    try {
      const response = await axios.post('http://localhost:3000/api/attendances', {
        employeeId,
        payRunId,
        date: new Date().toISOString().split('T')[0], // Date du jour
        type: 'PRESENCE',
        isPresent: true
      });

      setLastScanned({
        success: true,
        message: 'Présence enregistrée avec succès',
        employee: employee
      });

      // Notifier le parent
      if (onAttendanceMarked) {
        onAttendanceMarked(employee);
      }

      // Arrêter le scan après un succès
      stopScanning();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de présence:', error);
      setLastScanned({
        success: false,
        message: 'Erreur lors de l\'enregistrement',
        employee: employee
      });
    }
  };

  const handleManualEntry = async (employeeId) => {
    try {
      setProcessing(true);
      const response = await axios.post('http://localhost:3000/api/attendances', {
        employeeId,
        payRunId,
        date: new Date().toISOString().split('T')[0],
        type: 'PRESENCE',
        isPresent: true,
        notes: 'Saisie manuelle'
      });

      setLastScanned({
        success: true,
        message: 'Présence enregistrée manuellement',
        employee: { id: employeeId, firstName: 'Employé', lastName: 'Manuel' }
      });

      if (onAttendanceMarked) {
        onAttendanceMarked({ id: employeeId, firstName: 'Employé', lastName: 'Manuel' });
      }
    } catch (error) {
      console.error('Erreur lors de la saisie manuelle:', error);
      setLastScanned({
        success: false,
        message: 'Erreur lors de la saisie manuelle',
        employee: null
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <QrCode className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Scanner QR Code
              </h3>
              <p className="text-sm text-gray-500">
                Enregistrez les présences automatiquement
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!cameraActive ? (
              <Button
                onClick={startScanning}
                variant="primary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Démarrer scan</span>
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <CameraOff className="w-4 h-4" />
                <span>Arrêter</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {cameraActive && (
          <div className="mb-6">
            <div className="relative bg-gray-100 rounded-xl overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-64 object-cover"
              />
              {processing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analyse en cours...</p>
                  </div>
                </div>
              )}
              {isScanning && (
                <div className="absolute inset-0 border-2 border-orange-500 rounded-xl pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 border-2 border-orange-300 rounded-lg"></div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Placez le QR code dans le cadre pour scanner
            </p>
          </div>
        )}

        {lastScanned && (
          <div className={`p-4 rounded-xl mb-4 ${
            lastScanned.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {lastScanned.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  lastScanned.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastScanned.message}
                </p>
                {lastScanned.employee && (
                  <p className="text-xs text-gray-600">
                    {lastScanned.employee.firstName} {lastScanned.employee.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Saisie manuelle (en cas de problème)
          </h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="ID employé"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  handleManualEntry(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[placeholder="ID employé"]');
                if (input && input.value) {
                  handleManualEntry(input.value);
                  input.value = '';
                }
              }}
            >
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;