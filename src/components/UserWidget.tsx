import React, { Fragment, useCallback, useContext } from 'react';
import { useId } from 'react-id-generator';
import * as changeCase from 'change-case';
import identity from 'lodash/fp/identity';

import { useSnackbar } from 'notistack';
import { Avatar, Box, Chip, Link, makeStyles, Menu, MenuItem, Typography } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Forward from '@material-ui/icons/Forward';
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle';

import firebase from '../firebase';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import { useHistory } from 'react-router';
import { isDashboardUser } from '../model/UserRecord';

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
  avatarWarning: {
    backgroundColor: 'rgba(255,16,0,0.25)',
  },
}));

const UserWidget: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const [menuId] = useId();
  const { enqueueSnackbar } = useSnackbar();
  const [user, userData] = useUser();
  const client = userData?.company;

  const [actingAs, setActingAs] = useContext(ActingAs);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    [setAnchorEl],
  );
  const handleMenuClose = useCallback(() => setAnchorEl(null), [setAnchorEl]);

  const handleSwitch = useCallback(() => {
    setAnchorEl(null);
    if (actingAs) {
      setActingAs(null);
    } else {
      setActingAs(user.uid);
    }
    history.push('/');
  }, [setAnchorEl, setActingAs, user, history, actingAs]);

  const handleLogOut = useCallback(async () => {
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
  }, [setAnchorEl, enqueueSnackbar]);

  return (
    <Fragment>
      <Chip
        avatar={
          <Avatar className={userData && userData.isRedirectionActive ? classes.avatarWarning : undefined}>
            {isDashboardUser(userData) ? (
              userData && userData.isRedirectionActive ? (
                <Forward color="error" />
              ) : (
                <SupervisedUserCircle />
              )
            ) : userData && userData.isRedirectionActive ? (
              <Forward color="error" />
            ) : (
              <AccountCircle />
            )}
          </Avatar>
        }
        aria-label="User menu"
        aria-controls={menuId}
        aria-haspopup="true"
        label={user?.email || '???'}
        onClick={handleProfileMenuOpen}
        className={classes.chip}
      />
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
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
              {isDashboardUser(actingAs) && (
                <MenuItem onClick={handleSwitch}>
                  Switch to{' '}
                  {[changeCase.capitalCase(process.env.REACT_APP_BRAND || ''), 'Administrator']
                    .filter(identity)
                    .join(' ')}
                </MenuItem>
              )}
            </div>
          )
        ) : (
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
        )}
        <MenuItem component={Link} href={'/my-profile'}>
          My profile
        </MenuItem>
        <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
      </Menu>
    </Fragment>
  );
};

export default UserWidget;
