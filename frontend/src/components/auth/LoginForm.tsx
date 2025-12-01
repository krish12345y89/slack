import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/hooks';
import { Button, Input, Card } from '@/components/common';
import { Mail, Lock } from 'lucide-react';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginForm: React.FC = () => {
  const { login, isLoggingIn } = useAuth();

  return (
    <Card className="max-w-md w-full mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={(values, { setSubmitting }) => {
          login.mutate(values, {
            onSettled: () => setSubmitting(false),
          });
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || isLoggingIn}
              disabled={isSubmitting || isLoggingIn}
            >
              Sign In
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Sign up
                </a>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default LoginForm;
