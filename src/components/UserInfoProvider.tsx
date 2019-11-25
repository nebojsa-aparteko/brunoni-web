import React from 'react';
import identity from 'lodash/identity';
import Context from '../contexts/UserInfo';
import useEndpoint from '../hooks/useEndpoint';

interface Props {
  children: React.ReactNode;
}

const UserInfoProvider: React.FC<Props> = ({ children }) => {
  const userInfo = useEndpoint('/session', identity, undefined);
  return <Context.Provider value={userInfo}>{children}</Context.Provider>;
};

export default UserInfoProvider;
