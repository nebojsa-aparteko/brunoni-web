import React from 'react';
import UserRecord from '../model/UserRecord';

export default React.createContext<UserRecord[] | undefined>(undefined);
