import toast from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'loading' | 'info' | 'default';

export const showToast = (message: string, type: ToastType = 'success', duration: number = 3000) => {
  const opts = { duration, position: 'top-right' } as const;

  if (type === 'info' || type === 'default') {
    // react-hot-toast doesn't have toast.info by default; use generic toast for info
    toast(message, opts);
    return;
  }

  const fn = (toast as any)[type];
  if (typeof fn === 'function') {
    fn(message, opts);
  } else {
    toast(message, opts);
  }
};

export const successToast = (message: string) => showToast(message, 'success');
export const errorToast = (message: string) => showToast(message, 'error');
export const loadingToast = (message: string) => showToast(message, 'loading', 0);
export const infoToast = (message: string) => showToast(message, 'info');
