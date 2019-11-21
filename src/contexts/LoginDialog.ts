import React from 'react';

export default React.createContext<{ open: () => void }>({ open: () => {} });
