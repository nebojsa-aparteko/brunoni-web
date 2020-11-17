import React, { Fragment, MouseEventHandler, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as changeCase from 'change-case';
import {
  AppBar,
  Box,
  Button,
  createStyles,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  Theme,
  Toolbar,
  Typography,
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
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LoginDialog from '../contexts/LoginDialog';
import ActingAs from '../contexts/ActingAs';
import Mousetrap from 'mousetrap';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import NavBarQuickSearchDialog from './quickSearch/NavBarQuickSearchDialog';
import SearchIcon from '@material-ui/icons/Search';
import NotificationsButton from './notifications/NotificationsButton';
import { isDashboardUser, isSuperAdmin } from '../model/UserRecord';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Omit } from '@material-ui/types';
import { camelCase } from 'lodash';
import TourButton from './bookings/BookingTour';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: 100,
    },
    appBar: {
      background: theme.palette.background.paper,

      ['@media print']: {
        display: 'none',
      },
    },
    toolbar: {
      height: 100,
    },
    toolbarItem: {},
    logo: {
      marginRight: 'auto',
      display: 'flex',
      '& > img':
        ({
          brunoni: {
            position: 'relative',
            top: 6,
            height: 78,
          },
          allmarine: {
            maxHeight: 80,
            width: 'auto',
          },
        } as Record<string, CSSProperties>)[process.env.REACT_APP_BRAND || ''] || {},
      [theme.breakpoints.down('sm')]: {
        '& > img': {
          top: 0,
          maxHeight: '4em',
          width: 'auto',
        },
      },
    },
    spacer: {
      flex: 1,
    },
    item: {
      display: 'flex',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(2),
      },
    },
    goToQuote: {
      marginTop: theme.spacing(0.5),
      width: 120,
    },
    input: {
      margin: theme.spacing(1),
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
    menu: {
      textTransform: 'uppercase',
    },
  }),
);

const useStylesButtonMenuItem = makeStyles((theme: Theme) => ({
  item: {
    display: 'flex',
    textStyle: 'none',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
  onClick?: MouseEventHandler;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | undefined;
  typographyStyle?: any;
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to, onClick } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <li id={camelCase(primary) + 'Nav'}>
      <ListItem button component={renderLink} onClick={onClick}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

function ButtonMenuItem(props: ListItemLinkProps) {
  const classes = useStylesButtonMenuItem();
  const { primary, to, variant, typographyStyle, color } = props;

  return (
    <div className={classes.item} id={camelCase(primary) + 'Nav'}>
      <Button component={RouterLink} variant={variant} color={color} to={to}>
        <Typography variant="body1" style={typographyStyle}>
          {primary}
        </Typography>
      </Button>
    </div>
  );
}

function MenuItemLink(props: ListItemLinkProps) {
  const { primary, to, onClick } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to],
  );

  return (
    <MenuItem id={camelCase(primary) + 'Nav'} onClick={onClick} component={renderLink}>
      {primary}
    </MenuItem>
  );
}

const Navbar: React.FC = () => {
  const classes = useStyles();
  const [user, userRecord] = useUser();
  const [actingAs] = useContext(ActingAs);
  const { open } = useContext(LoginDialog);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const handleDialogClose = useCallback(() => {
    setIsSearchDialogOpen(false);
  }, [setIsSearchDialogOpen]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const quickSearchButtonRef = useRef<HTMLButtonElement>();

  useEffect(() => {
    Mousetrap.bind(['ctrl+g', 'command+k', 'ctrl+shift+g', 'j q'], () => setIsSearchDialogOpen(true));

    return () => {
      Mousetrap.unbind(['ctrl+g', 'command+k', 'ctrl+shift+g', 'j q']);
    };
  }, [quickSearchButtonRef]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <Hidden smDown>
        <AppBar position="relative" className={classes.appBar}>
          <Container>
            <Toolbar className={classes.toolbar} disableGutters>
              <Link className={classes.logo} to="/">
                <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.capitalCase(process.env.REACT_APP_BRAND || '')}
                  className={classes.logo}
                />
              </Link>
              <Box displayPrint="none" width="100%" display="flex">
                {user !== undefined && user !== null && (
                  <Fragment>
                    {actingAs !== null && <ButtonMenuItem primary="Dashboard" to="/" />}
                    <ButtonMenuItem primary="Schedule" to="/schedule" />
                    <ButtonMenuItem primary="Quotes" to="/quotes/groups" />

                    <ButtonMenuItem primary="My day" to="/my-day" />
                    {isDashboardUser(userRecord) && !actingAs && <ButtonMenuItem primary="Vessel" to="/vessel" />}

                    {isDashboardUser(userRecord) && !actingAs && <ButtonMenuItem primary="Load list" to="/loadList" />}

                    <ButtonMenuItem primary="Bookings" to="/bookings" />
                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem to="/client-statistics" primary="Statistics" />
                    )}

                    {actingAs !== null && (
                      <Fragment>
                        <div id="otherMenuNav" className={classes.item}>
                          <Button
                            endIcon={<KeyboardArrowDownIcon />}
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={handleMenuClick}
                          >
                            <Typography variant="body1">Other</Typography>
                          </Button>
                        </div>
                        <Menu
                          id="simple-menu"
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                          className={classes.menu}
                          getContentAnchorEl={null}
                        >
                          <MenuItemLink onClick={handleMenuClose} to="/equipment" primary="Equipment Situation" />
                          <MenuItemLink onClick={handleMenuClose} to="/charges" primary="Side Charges" />
                        </Menu>
                      </Fragment>
                    )}

                    {actingAs === null && (
                      <Fragment>
                        <div className={classes.item}>
                          <Button
                            endIcon={<KeyboardArrowDownIcon />}
                            aria-controls="configuration-menu"
                            aria-haspopup="true"
                            onClick={handleMenuClick}
                          >
                            <Typography variant="body1">Configuration</Typography>
                          </Button>
                        </div>
                        <Menu
                          id="configuration-menu"
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                          className={classes.menu}
                          getContentAnchorEl={null}
                        >
                          <MenuItemLink onClick={handleMenuClose} to="/charges" primary="Side Charges" />
                          <MenuItemLink onClick={handleMenuClose} to="/weekly-payment" primary="Weekly Payment" />
                          <MenuItemLink onClick={handleMenuClose} to="/commissions" primary="Commissions" />
                          <MenuItemLink primary="Equipment Situation" to="/equipment" onClick={handleMenuClose} />
                          {isSuperAdmin(userRecord) && (
                            <MenuItemLink onClick={handleMenuClose} to="/teams" primary="Teams" />
                          )}
                        </Menu>
                        {/*<ButtonMenuItem primary="Side Charges" to="/charges" />*/}
                        {/*{isSuperAdmin(userRecord) && <ButtonMenuItem primary="Teams" to="/teams" />}*/}
                      </Fragment>
                    )}
                  </Fragment>
                )}

                <div className={classes.spacer} />
                {user !== undefined && user !== null ? (
                  actingAs ? (
                    <Fragment>
                      <ButtonMenuItem
                        primary="Get Quote"
                        to="/quotes/get"
                        variant="contained"
                        color="primary"
                        typographyStyle={{ color: 'white' }}
                      />
                      <IconButton
                        id="quickSearchNav"
                        buttonRef={quickSearchButtonRef}
                        onClick={() => setIsSearchDialogOpen(true)}
                        style={{ padding: 8 }}
                        title={'Hey hey you can use your keyboard as well. Try it out >> ctrl+g <<'}
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                      {isSearchDialogOpen && (
                        <NavBarQuickSearchDialog isOpen={isSearchDialogOpen} handleClose={handleDialogClose} />
                      )}
                    </Fragment>
                  ) : (
                    <Fragment>
                      <IconButton
                        buttonRef={quickSearchButtonRef}
                        onClick={() => setIsSearchDialogOpen(true)}
                        style={{ padding: 8 }}
                        title={'Hey hey you can use your keyboard as well. Try it out >> ctrl+g <<'}
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                      {isSearchDialogOpen && (
                        <NavBarQuickSearchDialog isOpen={isSearchDialogOpen} handleClose={handleDialogClose} />
                      )}
                    </Fragment>
                  )
                ) : process.env.REACT_APP_BRAND === 'brunoni' ? (
                  <div className={classes.item}>
                    <Button component="a" href="https://brunoni.ch">
                      <Typography variant="body1">Visit brunoni.ch</Typography>
                    </Button>
                  </div>
                ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                  <div className={classes.item}>
                    <Button component="a" href="https://allmarine.ch">
                      <Typography variant="body1">Visit allmarine.ch</Typography>
                    </Button>
                  </div>
                ) : null}
                <div id="notificationsNav" className={classes.item}>
                  {user !== undefined && user !== null && <NotificationsButton />}
                </div>
                <div id="identityWidgetNav" className={classes.item}>
                  <IdentityWidget />
                </div>
              </Box>
              {actingAs !== null && <TourButton />}
            </Toolbar>
          </Container>
        </AppBar>
      </Hidden>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp>
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <AppBar position="fixed" className={classes.appBar}>
            <Toolbar>
              <Link className={classes.logo} to="/">
                <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.capitalCase(process.env.REACT_APP_BRAND || '')}
                  className={classes.logo}
                />
              </Link>
              <Box displayPrint="none">
                {user !== undefined && user !== null && <NotificationsButton />}
                <IconButton aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            anchor="right"
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
                  <ListItemLink primary="Dashboard" to="/" onClick={handleDrawerToggle} />
                  <ListItemLink primary="Schedule" to="/schedule" onClick={handleDrawerToggle} />
                  <ListItemLink primary="Quotes" to="/quotes/groups" onClick={handleDrawerToggle} />

                  <ListItemLink primary="My day" to="/my-day" onClick={handleDrawerToggle} />

                  <Fragment>
                    <ListItemLink primary="Bookings" to="/bookings" onClick={handleDrawerToggle} />
                  </Fragment>
                  <ListItemLink primary="Equipment Situation" to="/equipment" onClick={handleDrawerToggle} />
                  <ListItemLink primary="Side Charges" to="/charges" onClick={handleDrawerToggle} />
                </Fragment>
              )}

              {user !== undefined && user !== null ? (
                <ListItemLink primary="Get Quote" to="/quotes/get" onClick={handleDrawerToggle} />
              ) : process.env.REACT_APP_BRAND === 'brunoni' ? (
                <ListItemLink primary="Visit brunoni.ch" to="https://brunoni.ch" onClick={handleDrawerToggle} />
              ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                <ListItemLink primary="Visit  allmarine.ch" to="https://allmarine.ch" onClick={handleDrawerToggle} />
              ) : null}

              <Divider />

              {user ? (
                <div className={classes.item}>
                  <IdentityWidget />
                </div>
              ) : (
                <ListItem button onClick={() => open()}>
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
