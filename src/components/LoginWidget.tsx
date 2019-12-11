import React, { useContext } from 'react';
import { Button } from '@material-ui/core';

import LoginDialog from '../contexts/LoginDialog';

const LoginWidget: React.FC = () => {
  const { open } = useContext(LoginDialog);

  return (
    <Button variant="outlined" onClick={() => open()}>
      Login
    </Button>
  );
};

export default LoginWidget;
