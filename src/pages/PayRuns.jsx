import React, { useState } from 'react';
import { PayRunsProvider } from '../context/PayRunsContext';
import Layout from '../components/layout/Layout';
import PayRunsList from '../components/payroll/PayRunsList';
import PayRunForm from '../components/payroll/PayRunForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const PayRunsContent = () => {
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-4 flex justify-end ">
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
          >
            Nouveau cycle de paie
          </Button>
        </div>

        <PayRunsList />
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Créer un nouveau cycle de paie"
        size="md"
      >
        <PayRunForm onClose={handleCloseModal} />
      </Modal>
    </Layout>
  );
};

const PayRuns = () => {
  return (
    <PayRunsProvider>
      <PayRunsContent />
    </PayRunsProvider>
  );
};

export default PayRuns;