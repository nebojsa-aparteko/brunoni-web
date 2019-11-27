import React from 'react';
import PickupLocation from '../model/PickupLocation';

export default React.createContext<PickupLocation[] | undefined>(undefined);
