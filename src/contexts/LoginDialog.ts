import React from 'react';

export interface Params {
  message?: string;
  next?: string;
}

export default React.createContext<{ open: (params?: Params) => void }>({ open: () => {} });
