import React from 'react';
import { User } from 'firebase';

export default React.createContext<User | null | undefined>(undefined);
