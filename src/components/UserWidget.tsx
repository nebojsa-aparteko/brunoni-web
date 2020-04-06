import React, { Fragment, useContext } from 'react';
import { useId } from 'react-id-generator';
import * as changeCase from 'change-case';
import identity from 'lodash/fp/identity';

import { useSnackbar } from 'notistack';
import { Box, Chip, makeStyles, Menu, MenuItem, Typography } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle';

import firebase from '../firebase';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import { useHistory } from 'react-router';

interface Props {
  active: boolean;
}

const useStyles = makeStyles(() => ({
  chip: {
    '& > span': {
      display: 'block',
      maxWidth: '10em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}));

const UserWidget: React.FC<Props> = ({ active }) => {
  const classes = useStyles();
  const history = useHistory();
  const [menuId] = useId();
  const { enqueueSnackbar } = useSnackbar();
  const [user, userData, client] = useUser();
  const [actingAs, setActingAs] = useContext(ActingAs);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSwitch = () => {
    setAnchorEl(null);
    if (actingAs) {
      setActingAs(null);
    } else {
      setActingAs(user.uid);
    }
    history.push('/');
  };

  const handleLogOut = async () => {
    try {
      await firebase.auth().signOut();
      setAnchorEl(null);
      enqueueSnackbar(<Typography color="inherit">You are now signed out.</Typography>, { variant: 'info' });
    } catch (e) {
      console.error('Unable to sign out', e);
      enqueueSnackbar(<Typography color="inherit">Error occurred while trying to sign you out.</Typography>, {
        variant: 'error',
      });
    }
  };

  return (
    <Fragment>
      {active && (
        <Chip
          avatar={userData?.isAdmin ? <SupervisedUserCircle /> : <AccountCircle />}
          aria-label="User menu"
          aria-controls={menuId}
          aria-haspopup="true"
          label={user?.email || '???'}
          onClick={handleProfileMenuOpen}
          className={classes.chip}
        />
      )}
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {actingAs ? (
          client?.name && (
            <div>
              <MenuItem disabled style={{ opacity: 'initial' }}>
                <Box>
                  <Typography variant="subtitle1">{client.name.toUpperCase()}</Typography>
                  {client.city && <Typography variant="subtitle2">{client.city.toUpperCase()}</Typography>}
                </Box>
              </MenuItem>
              {actingAs!.isAdmin && (
                <MenuItem onClick={handleSwitch}>
                  Switch to{' '}
                  {[changeCase.capitalCase(process.env.REACT_APP_BRAND || ''), 'Administrator']
                    .filter(identity)
                    .join(' ')}
                </MenuItem>
              )}
            </div>
          )
        ) : actingAs === null ? (
          <div>
            <MenuItem disabled style={{ opacity: 'initial' }}>
              <Box>
                <Typography variant="subtitle1">
                  {[changeCase.capitalCase(process.env.REACT_APP_BRAND || ''), 'Administrator']
                    .filter(identity)
                    .join(' ')}
                </Typography>
              </Box>
            </MenuItem>
            {client && <MenuItem onClick={handleSwitch}>Switch to {client.name}</MenuItem>}
          </div>
        ) : null}
        <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
      </Menu>
    </Fragment>
  );
};

export default UserWidget;
