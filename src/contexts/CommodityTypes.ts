import React from 'react';
import { CommodityType } from '../model/get-quotes/CommodityType';

export default React.createContext<CommodityType[] | undefined>(undefined);
