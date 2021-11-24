import React from 'react';
import Country from '../model/Country';

export default React.createContext<Country[] | undefined>(undefined);
