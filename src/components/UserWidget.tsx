import React, { Fragment } from 'react';
import { useId } from 'react-id-generator';
import { useSnackbar } from 'notistack';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';

import firebase from '../firebase';

interface Props {}

const UserWidget: React.FC<Props> = () => {
  const [menuId] = useId();
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogOut = async () => {
    try {
      await firebase.auth().signOut();
      setAnchorEl(null);
      enqueueSnackbar(<Typography>You are now signed out.</Typography>, { variant: 'info' });
    } catch (e) {
      console.error('Unable to sign out', e);
      enqueueSnackbar(<Typography>Error occurred while trying to sign you out.</Typography>, { variant: 'error' });
    }
  };

  return (
    <Fragment>
      <IconButton
        edge="end"
        aria-label="User menu"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
      >
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
      </Menu>
    </Fragment>
  );
};

export default UserWidget;
