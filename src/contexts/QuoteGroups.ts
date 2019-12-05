import React from 'react';
import { QuoteGroup } from '../providers/QuoteGroups';

export default React.createContext<QuoteGroup[] | undefined>(undefined);
