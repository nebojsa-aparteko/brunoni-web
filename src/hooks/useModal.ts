import { useCallback, useState } from 'react';

export default () => {
  const [isOpen, setOpen] = useState(false);
  const closeModal = useCallback(() => setOpen(false), []);
  const openModal = useCallback(() => setOpen(true), []);

  return { isOpen, closeModal, openModal };
};
