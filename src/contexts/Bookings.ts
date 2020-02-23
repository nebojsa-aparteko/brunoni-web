import { createContext } from 'react';
import { Booking } from '../model/Booking';

export default createContext<Booking[] | undefined>(undefined);
