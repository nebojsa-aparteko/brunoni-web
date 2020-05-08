import React from 'react';
import Client from '../model/Client';

export default React.createContext<Client[] | undefined>(undefined);
