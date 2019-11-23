import React from 'react';
import Carrier from '../model/Carrier';

export default React.createContext<Carrier[] | undefined>(undefined);
