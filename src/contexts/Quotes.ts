import React from 'react';
import { Quote } from '../providers/QuoteGroups';

export default React.createContext<Quote[] | undefined>(undefined);
