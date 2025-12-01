import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useCreateChannel } from '@/hooks';
import { Button, Input, Card } from '@/components/common';
import { X } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChannelSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Name must be at least 3 characters').required('Channel name is required'),
  description: Yup.string().max(200, 'Description must be less than 200 characters'),
  isPrivate: Yup.boolean(),
});

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose }) => {
  const createChannel = useCreateChannel();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Channel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <Formik
          initialValues={{ name: '', description: '', isPrivate: false }}
          validationSchema={CreateChannelSchema}
          onSubmit={(values, { setSubmitting }) => {
            createChannel.mutate(values, {
              onSuccess: () => {
                onClose();
                setSubmitting(false);
              },
              onError: () => {
                setSubmitting(false);
              },
            });
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel Name
                </label>
                <Field
                  as={Input}
                  name="name"
                  placeholder="Enter channel name"
                  error={touched.name && errors.name}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Enter channel description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Field
                  type="checkbox"
                  name="isPrivate"
                  id="isPrivate"
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300">
                  Make this channel private
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Create
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default CreateChannelModal;
