import { useState, useCallback } from 'react';

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [title, setTitle] = useState('Are you sure?');
  const [description, setDescription] = useState('This action cannot be undone.');

  const confirm = useCallback(({
    title: confirmTitle = 'Are you sure?',
    description: confirmDescription = 'This action cannot be undone.',
    onConfirm: onConfirmCallback,
  }: {
    title?: string;
    description?: string;
    onConfirm: () => void;
  }) => {
    setTitle(confirmTitle);
    setDescription(confirmDescription);
    setOnConfirm(() => onConfirmCallback);
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    setIsOpen(false);
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setOnConfirm(null);
  }, []);

  return {
    isOpen,
    title,
    description,
    confirm,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
}

export default useConfirm;
