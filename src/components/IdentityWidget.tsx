import React, { Fragment } from 'react';
import { Theme, makeStyles, CircularProgress } from '@material-ui/core';

import LoginWidget from './LoginWidget';
import useUser from '../hooks/useUser';

import UserWidget from './UserWidget';

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    marginLeft: theme.spacing(1),
  },
}));

const IdentityWidget: React.FC = () => {
  const classes = useStyles();
  const [user] = useUser();

  if (user === undefined) {
    return <CircularProgress size={24} className={classes.progress} />;
  } else {
    return (
      <Fragment>
        {user === null && <LoginWidget />}
        {user && <UserWidget />}
      </Fragment>
    );
  }
};

export default IdentityWidget;
