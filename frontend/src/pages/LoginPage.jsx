// frontend/src/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../features/auth/LoginForm'; // Import du composant de feature
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <LoginForm />
      <p className="text-center text-sm text-gray-600 mt-6">
        Pas encore de compte?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
          Inscrivez-vous ici
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
