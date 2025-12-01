import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/hooks';
import { Button, Input, Card } from '@/components/common';
import { User, Mail, Lock } from 'lucide-react';

const RegisterSchema = Yup.object().shape({
  username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterForm: React.FC = () => {
  const { register, isRegistering } = useAuth();

  return (
    <Card className="max-w-md w-full mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign up to get started</p>
      </div>

      <Formik
        initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={RegisterSchema}
        onSubmit={(values, { setSubmitting }) => {
          register.mutate(
            { username: values.username, email: values.email, password: values.password },
            {
              onSettled: () => setSubmitting(false),
            }
          );
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Field
                  as={Input}
                  name="username"
                  placeholder="Choose a username"
                  error={touched.username && errors.username}
                  className="pl-10"
                  fullWidth
                />
              </div>
              {touched.username && errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Field
                  as={Input}
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  error={touched.email && errors.email}
                  className="pl-10"
                  fullWidth
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Field
                  as={Input}
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  error={touched.password && errors.password}
                  className="pl-10"
                  fullWidth
                />
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Field
                  as={Input}
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  error={touched.confirmPassword && errors.confirmPassword}
                  className="pl-10"
                  fullWidth
                />
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || isRegistering}
              disabled={isSubmitting || isRegistering}
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Sign in
                </a>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default RegisterForm;
