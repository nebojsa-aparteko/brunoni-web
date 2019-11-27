import React from 'react';
import UserInfo from '../model/UserInfo';

type Type = {
  busy: boolean;
  error: string | undefined;
  result: UserInfo | null | undefined;
  refresh: () => void;
};

export default React.createContext<Type>({
  busy: false,
  error: undefined,
  result: undefined,
  refresh: () => {},
});
