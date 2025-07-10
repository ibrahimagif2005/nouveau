// frontend/src/pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../features/auth/RegisterForm'; // Import du composant de feature
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <RegisterForm />
      <p className="text-center text-sm text-gray-600 mt-6">
        Déjà un compte?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
          Connectez-vous ici
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
