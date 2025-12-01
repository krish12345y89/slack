import React from 'react';
import { RegisterForm } from '@/components/auth';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
