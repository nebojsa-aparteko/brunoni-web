import React, { Fragment } from 'react';
import { useId } from 'react-id-generator';
import { useSnackbar } from 'notistack';
import { Box, Chip, Menu, MenuItem, Typography } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';

import firebase from '../firebase';
import useUser from '../hooks/useUser';

interface Props {
  active: boolean;
}

const UserWidget: React.FC<Props> = ({ active }) => {
  const [menuId] = useId();
  const { enqueueSnackbar } = useSnackbar();
  const [user, userData] = useUser();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
          avatar={<AccountCircle />}
          aria-label="User menu"
          aria-controls={menuId}
          aria-haspopup="true"
          label={user?.email || '???'}
          onClick={handleProfileMenuOpen}
        />
      )}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {userData?.company?.name && (
          <MenuItem disabled style={{ opacity: 'initial' }}>
            <Box>
              <Typography>{userData.company.name.toUpperCase()}</Typography>
              {userData.company.city && <Typography>{userData.company.city.toUpperCase()}</Typography>}
            </Box>
          </MenuItem>
        )}
        <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
      </Menu>
    </Fragment>
  );
};

export default UserWidget;
