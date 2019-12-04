import React, { Fragment, useContext } from 'react';
import changeCase from 'change-case';
import {
  makeStyles,
  Theme,
  AppBar,
  Toolbar,
  createStyles,
  Button,
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Link from './Link';
import Container from './Container';
import IdentityWidget from './IdentityWidget';
import useUser from '../hooks/useUser';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Divider from '@material-ui/core/Divider';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import Collapse from '@material-ui/core/Collapse';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import firebase from '../firebase';
import { useSnackbar } from 'notistack';
import LoginDialog from '../contexts/LoginDialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: 100,
    },
    appBar: {
      background: theme.palette.background.paper,
    },
    toolbar: {
      height: 100,
    },
    toolbarItem: {},
    logo: {
      marginRight: theme.spacing(2),
      '& > img':
        ({
          brunoni: {
            position: 'relative',
            top: 6,
            width: 80,
          },
          allmarine: {
            height: 80,
          },
        } as Record<string, CSSProperties>)[process.env.REACT_APP_BRAND || ''] || {},
    },
    spacer: {
      flex: 1,
    },
    item: {
      display: 'flex',
      marginLeft: theme.spacing(2),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: 240,
        flexShrink: 0,
      },
    },
    drawerPaper: {
      width: 240,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

const Navbar: React.FC = () => {
  const classes = useStyles();
  const [user] = useUser();
  const { open } = useContext(LoginDialog);

  const { enqueueSnackbar } = useSnackbar();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDrawer, setOpenDrawer] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClick = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleLogOut = async () => {
    try {
      await firebase.auth().signOut();
      enqueueSnackbar(<Typography>You are now signed out.</Typography>, { variant: 'info' });
    } catch (e) {
      console.error('Unable to sign out', e);
      enqueueSnackbar(<Typography>Error occurred while trying to sign you out.</Typography>, { variant: 'error' });
    }
  };

  return (
    <Fragment>
      <Hidden smDown implementation="css">
        <AppBar position="relative" className={classes.appBar}>
          <Container>
            <Toolbar className={classes.toolbar} disableGutters>
              <Link className={classes.logo} to="/">
                <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
                  className={classes.logo}
                />
              </Link>
              <Box displayPrint="none" width="100%" display="flex">
                {user !== undefined && user !== null && (
                  <Fragment>
                    <div className={classes.item}>
                      <Button component={Link} to="/" underline="none">
                        Dashboard
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/schedule" underline="none">
                        Schedule
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/quotes/groups" underline="none">
                        Quotes
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/equipment" underline="none">
                        Equipment Situation
                      </Button>
                    </div>
                  </Fragment>
                )}
                <div className={classes.spacer} />
                {user !== undefined && user !== null ? (
                  <div className={classes.item}>
                    <Button component={Link} to="/quotes/get" underline="none" variant="outlined">
                      Get Quote
                    </Button>
                  </div>
                ) : process.env.REACT_APP_BRAND === 'brunoni' ? (
                  <div className={classes.item}>
                    <Button component="a" href="https://brunoni.ch">
                      Visit brunoni.ch
                    </Button>
                  </div>
                ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                  <div className={classes.item}>
                    <Button component="a" href="https://allmarine.ch">
                      Visit allmarine.ch
                    </Button>
                  </div>
                ) : null}
                <div className={classes.item}>
                  <IdentityWidget />
                </div>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Hidden>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp implementation="css">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
              <Link className={classes.logo} to="/">
                <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
                  className={classes.logo}
                  style={{ width: '4rem' }}
                />
              </Link>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <List>
              {user !== undefined && user !== null && (
                <Fragment>
                  <ListItem component={props => <Link {...props} to="/" />}>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem component={props => <Link {...props} to="/schedule" />}>
                    <ListItemText primary="Schedule" />
                  </ListItem>
                  <ListItem component={props => <Link {...props} to="/quotes/groups" />}>
                    <ListItemText primary="Quotes" />
                  </ListItem>
                  <ListItem component={props => <Link {...props} to="/equipment" />}>
                    <ListItemText primary="Equipment Situation" />
                  </ListItem>
                </Fragment>
              )}

              {user !== undefined && user !== null ? (
                <ListItem component={props => <Link {...props} to="/quotes/get" />}>
                  <ListItemText primary="Get Quote" />
                </ListItem>
              ) : process.env.REACT_APP_BRAND === 'brunoni' ? (
                <ListItem component={props => <a {...props} href="https://brunoni.ch" />}>
                  <ListItemText primary="Visit brunoni.ch" />
                </ListItem>
              ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                <ListItem component={props => <a {...props} href="https://allmarine.ch" />}>
                  <ListItemText primary="Visit allmarine.ch" />
                </ListItem>
              ) : null}

              <Divider />
              {user !== undefined && user !== null ? (
                <Fragment>
                  <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary={user?.email || '???'} />
                    {openDrawer ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={openDrawer} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItem button onClick={handleLogOut} className={classes.nested}>
                        <ListItemText primary="Log out" />
                      </ListItem>
                    </List>
                  </Collapse>
                </Fragment>
              ) : (
                <ListItem button onClick={open}>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log in" />
                </ListItem>
              )}
            </List>
          </Drawer>
        </Hidden>
      </nav>
    </Fragment>
  );
};

export default Navbar;
