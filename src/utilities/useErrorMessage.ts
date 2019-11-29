import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';

export default (error: Error | null, message: (error: Error) => string | React.ReactNode) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!error) {
      return;
    }

    const snackbarKey = enqueueSnackbar(message(error), {
      variant: 'error',
      persist: true,
    });

    return snackbarKey
      ? () => {
          closeSnackbar(snackbarKey!);
        }
      : undefined;
  }, [error, message, enqueueSnackbar, closeSnackbar]);
};
