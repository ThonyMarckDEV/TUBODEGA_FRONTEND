import React from 'react'; 
import Swal from 'sweetalert2';

// Función para mostrar una alerta básica 
const showBasicAlert = () => {
  return Swal.fire('Hello world!');
};

// Función para mostrar una alerta con título y mensaje 
const showMessageAlert = (title, message, icon = 'info') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: icon,
    confirmButtonText: 'Aceptar',
  });
};

// Función para mostrar una alerta de éxito 
const showSuccessAlert = (title, message) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'success',
    confirmButtonText: 'Aceptar',
  });
};

// Función para mostrar una alerta de error 
const showErrorAlert = (title, message) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'Reintentar',
  });
};

// Función para mostrar una alerta con input 
const showInputAlert = (title, inputPlaceholder) => {
  return Swal.fire({
    title: title,
    input: 'text',
    inputLabel: 'Por favor, ingresa algo:',
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
  });
};

// Función para mostrar una alerta con temporizador 
const showTimerAlert = (title, message, timer = 2000) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'info',
    timer: timer,
    showConfirmButton: false,
  });
};

// Función para mostrar una alerta con confirmación (sí/no) 
const showConfirmationAlert = (title, message) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });
};

const SweetAlert = {
  showBasicAlert,
  showMessageAlert,
  showSuccessAlert,
  showErrorAlert,
  showInputAlert,
  showTimerAlert,
  showConfirmationAlert,
};

export default SweetAlert;