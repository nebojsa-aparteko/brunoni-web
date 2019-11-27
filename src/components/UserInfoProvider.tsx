import React from 'react';
import get from 'lodash/fp/get';
import Context from '../contexts/UserInfoEndpoint';
import useEndpoint from '../hooks/useEndpoint';

interface Props {
  children: React.ReactNode;
}

const UserInfoProvider: React.FC<Props> = ({ children }) => {
  const userInfo = useEndpoint('/session', get('UserInfo'), undefined);
  return <Context.Provider value={userInfo}>{children}</Context.Provider>;
};

export default UserInfoProvider;
