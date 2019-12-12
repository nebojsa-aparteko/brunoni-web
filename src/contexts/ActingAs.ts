import React from 'react';
import UserRecord from '../model/UserRecord';

export default React.createContext<[UserRecord | null | undefined, (next: string | null) => void]>([null, () => {}]);
