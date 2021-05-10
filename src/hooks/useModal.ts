import { useCallback, useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => setOpen(false), []);
  const openModal = useCallback(() => setOpen(true), []);

  return { open, closeModal, openModal };
};
