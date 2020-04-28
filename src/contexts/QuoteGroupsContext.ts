import React from 'react';
import { QuoteGroup } from '../providers/QuoteGroupsProvider';

export default React.createContext<QuoteGroup[] | undefined>(undefined);
