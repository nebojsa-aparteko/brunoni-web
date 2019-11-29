import React, { useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import isFunction from 'lodash/fp/isFunction';

type Message = string | React.ReactNode | ((error: Error) => string | React.ReactNode);

export default (error: Error | null, message: Message) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const createMessage = isFunction(message) ? useCallback(message, []) : () => message;

  useEffect(() => {
    if (!error) {
      return;
    }

    const snackbarKey = enqueueSnackbar(createMessage(error), {
      variant: 'error',
      persist: true,
    });

    return snackbarKey
      ? () => {
          closeSnackbar(snackbarKey!);
        }
      : undefined;
  }, [error, createMessage, enqueueSnackbar, closeSnackbar]);
};
