import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { attendanceApi } from '../../api/attendanceApi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Camera, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = ({ payRunId, onAttendanceMarked }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsScanning(true);
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  };

  const scanQRCode = async () => {
    const now = Date.now();
    if (now - lastScanTime < 2000) return; // Éviter les scans trop fréquents

    setLastScanTime(now);

    try {
      const imageData = captureFrame();
      if (!imageData) {
        setScanResult({
          success: false,
          error: 'Impossible de capturer l\'image',
          message: 'Erreur de capture'
        });
        setShowResultModal(true);
        return;
      }

      // Convertir l'image en données utilisables par jsQR
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          try {
            // Valider d'abord le QR code
            const validationResult = await attendanceApi.validateQRCode(code.data);

            if (validationResult.isValid) {
              // Marquer la présence
              const result = await attendanceApi.markAttendanceWithQR(payRunId, code.data);
              setScanResult({
                success: true,
                employee: result.employee,
                type: result.type,
                message: 'Présence marquée avec succès'
              });
            } else {
              setScanResult({
                success: false,
                error: 'QR code invalide ou expiré',
                message: 'Code QR non valide'
              });
            }
          } catch (error) {
            setScanResult({
              success: false,
              error: error.response?.data?.error || 'Erreur lors du marquage',
              message: 'Échec du marquage de présence'
            });
          }
        } else {
          setScanResult({
            success: false,
            error: 'Aucun QR code détecté',
            message: 'QR code non trouvé'
          });
        }

        setShowResultModal(true);

        // Fermer automatiquement après 3 secondes
        setTimeout(() => {
          setShowResultModal(false);
          setScanResult(null);
        }, 3000);
      };

      img.src = imageData;
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setScanResult({
        success: false,
        error: 'Erreur technique lors du scan',
        message: 'Erreur de scan'
      });
      setShowResultModal(true);
    }
  };

  const handleManualScan = () => {
    // Simulation d'un scan manuel pour les tests
    scanQRCode();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Scanner QR Code
        </h3>
        <p className="text-sm text-gray-600">
          Scannez le QR code d'un employé pour marquer sa présence
        </p>
      </div>

      <div className="bg-gray-100 rounded-lg p-6">
        <div className="relative">
          {!isScanning ? (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Caméra inactive</p>
                <Button onClick={startCamera} variant="primary">
                  <Camera className="w-4 h-4 mr-2" />
                  Activer la caméra
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-black rounded-lg object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay de ciblage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-orange-500 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-orange-500"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-orange-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-orange-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-orange-500"></div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                <Button onClick={scanQRCode} variant="primary" size="lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Scanner
                </Button>
                <Button onClick={stopCamera} variant="outline" size="lg">
                  <XCircle className="w-5 h-5 mr-2" />
                  Arrêter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de test pour simulation */}
      <div className="text-center">
        <Button onClick={handleManualScan} variant="secondary">
          <Clock className="w-4 h-4 mr-2" />
          Simulation de scan (Test)
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Pour les tests : simule un scan QR code
        </p>
      </div>

      {/* Modal de résultat */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={scanResult?.success ? "Présence marquée" : "Erreur"}
        size="sm"
      >
        <div className="text-center">
          {scanResult?.success ? (
            <div>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Présence enregistrée
              </h3>
              {scanResult.employee && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">
                      {scanResult.employee.firstName} {scanResult.employee.lastName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {scanResult.employee.position}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600">
                {scanResult.message}
              </p>
            </div>
          ) : (
            <div>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Échec du scan
              </h3>
              <p className="text-sm text-gray-600">
                {scanResult?.error || scanResult?.message}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default QRScanner;