import Swal from 'sweetalert2';

const Notification = {
  success: (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#f97316', 
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
      background: '#ffffff',
      color: '#374151'
    });
  },

  error: (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#f97316',
      confirmButtonText: 'OK',
      position: 'center',
      background: '#ffffff',
      color: '#374151'
    });
  },

  warning: (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonColor: '#f97316',
      confirmButtonText: 'OK',
      position: 'center',
      background: '#ffffff',
      color: '#374151'
    });
  },

  info: (title, text = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonColor: '#f97316',
      confirmButtonText: 'OK',
      position: 'center',
      background: '#ffffff',
      color: '#374151'
    });
  },

  confirm: (title, text = '', confirmText = 'Confirmer', cancelText = 'Annuler') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      background: '#ffffff',
      color: '#374151'
    });
  }
};

export default Notification;