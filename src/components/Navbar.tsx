import React, {
  Fragment,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as changeCase from 'change-case';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  Grid,
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
import { Link, ButtonLink, MenuItemLink } from './Link';
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
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import NavBarQuickSearchDialog from './quickSearch/NavBarQuickSearchDialog';
import SearchIcon from '@material-ui/icons/Search';
import NotificationsButton from './notifications/NotificationsButton';
import { isDashboardUser, isSuperAdmin } from '../model/UserRecord';
import { camelCase } from 'lodash';
import GuideButton from './GuideButton';
import Shepherd from 'shepherd.js';
import { bookingsTableShepherdTour } from './guides/BookingsTableGuide';
import { quotesShepherdTour } from './guides/QuotesGuide';
import { dashboardShepherdTour } from './guides/DashboardGuide';
import { scheduleShepherdTour } from './guides/ScheduleGuide';
import { myDayShepherdTour } from './guides/MyDayGuide';
import { bookingShepherdTour } from './guides/BookingGuide';
import { quoteShepherdTour } from './guides/QuoteGuide';
import { quotesGroupShepherdTour } from './guides/QuotesGroupGuide';
import { getQuotesShepherdTour } from './guides/GetQuoteGuide';
import brunoniLogo from '../assets/logo.brunoni.svg';
import allmarineLogo from '../assets/logo.allmarine.png';
import useZonedTime, { CLOCKS } from '../hooks/useZonedTime';

const mediaPrint = '@media print';
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: 100,
  },
  appBar: {
    background: theme.palette.background.paper,

    [mediaPrint]: {
      display: 'none',
    },
  },
  toolbar: {
    height: theme.spacing(9),
  },
  toolbarItem: {},
  logo: {
    marginRight: 'auto',
    display: 'flex',
    '& > img':
      (
        {
          brunoni: {
            position: 'relative',

            height: 45,
          },
          allmarine: {
            maxHeight: 45,
            width: 'auto',
          },
        } as Record<string, CSSProperties>
      )[import.meta.env.VITE_BRAND || ''] || {},
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
  worldClock: {
    backgroundColor: '#2c3c50',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: theme.palette.getContrastText('#2c3c50'),
  },
}));

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

export const getLogo = () => {
  return import.meta.env.VITE_BRAND === 'brunoni' ? brunoniLogo : allmarineLogo;
};

const getGuide = (path: string): any | undefined => {
  switch (path) {
    case '/schedule':
      return scheduleShepherdTour;
    case '/bookings':
      return bookingsTableShepherdTour;
    case '/quotes/groups':
      return quotesShepherdTour;
    case '/quotes/get':
      return getQuotesShepherdTour;
    case '/my-day':
      return myDayShepherdTour;
    default: {
      if (path.startsWith('/bookings/')) return bookingShepherdTour;
      if (path.startsWith('/quotes/groups/')) return quotesGroupShepherdTour;
      if (path.startsWith('/quotes/')) return quoteShepherdTour;
      return undefined;
    }
  }
};

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

  return (
    <li id={camelCase(primary) + 'Nav'}>
      <ListItem button component={Link} to={to} onClick={onClick}>
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
      <ButtonLink to={to} variant={variant} color={color}>
        <Typography variant="body1" style={typographyStyle}>
          {primary}
        </Typography>
      </ButtonLink>
    </div>
  );
}

const Navbar: React.FC = () => {
  const classes = useStyles();
  const [user, userRecord] = useUser();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const { open } = useContext(LoginDialog);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const handleDialogClose = useCallback(() => {
    setIsSearchDialogOpen(false);
  }, [setIsSearchDialogOpen]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guide, setGuide] = useState<Shepherd.Tour | undefined>(undefined);

  const zonedTime = useZonedTime();

  useEffect(() => {
    setGuide(getGuide(window.location.pathname));
  }, []);

  const quickSearchButtonRef = useRef<HTMLButtonElement>();

  useEffect(() => {
    Mousetrap.bind(['ctrl+g', 'command+k', 'ctrl+shift+g', 'j q'], () =>
      setIsSearchDialogOpen(true),
    );

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
          <Container maxWidth={false} className={classes.worldClock}>
            <Grid container justify={'center'} spacing={3} style={{ flexWrap: 'nowrap' }}>
              {CLOCKS.map((clock, i) => {
                const { formattedDate } = zonedTime(clock.timeZone);
                return (
                  <Grid item key={i}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="inherit">
                        <span>{clock.city}</span> •{' '}
                        <span style={{ whiteSpace: 'nowrap' }}>{formattedDate}</span>
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
          <Container maxWidth="xl">
            <Toolbar className={classes.toolbar} disableGutters>
              <Link className={classes.logo} to="/">
                <img
                  src={getLogo()}
                  alt={changeCase.capitalCase(import.meta.env.VITE_BRAND || '')}
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
                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem primary="Vessel" to="/vessel" />
                    )}
                    {/*TODO uncomment this once it's ready*/}
                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem primary="Land" to="/land-transport" />
                    )}

                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem primary="Load list" to="/loadList" />
                    )}
                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem primary="Equipment control" to="/equipment-control" />
                    )}
                    {/*<ButtonMenuItem primary="Online Booking" to="/online-booking" />*/}
                    <ButtonMenuItem primary="Bookings" to="/bookings" />
                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem to="/client-statistics" primary="Statistics" />
                    )}
                    {isDashboardUser(userRecord) && !actingAs && (
                      <ButtonMenuItem to="/opportunities" primary="Opportunities" />
                    )}

                    {actingAs !== null && (
                      <Fragment>
                        <MenuItemLink onClick={handleMenuClose} to="/equipment">
                          EQUIPMENT SITUATION
                        </MenuItemLink>
                        <MenuItemLink onClick={handleMenuClose} to="/charges">
                          SIDE CHARGES
                        </MenuItemLink>
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
                          <MenuItemLink onClick={handleMenuClose} to="/charges">
                            Side Charges
                          </MenuItemLink>
                          <MenuItemLink onClick={handleMenuClose} to="/weekly-payment">
                            Weekly Payment
                          </MenuItemLink>
                          <MenuItemLink onClick={handleMenuClose} to="/commissions">
                            Commissions
                          </MenuItemLink>
                          <MenuItemLink onClick={handleMenuClose} to="/equipment">
                            Equipment Situation
                          </MenuItemLink>
                          {isSuperAdmin(userRecord) && (
                            <MenuItemLink onClick={handleMenuClose} to="/teams">
                              Teams
                            </MenuItemLink>
                          )}
                          <MenuItemLink onClick={handleMenuClose} to="/land-transport-config">
                            Land Transport Config
                          </MenuItemLink>
                          <MenuItemLink onClick={handleMenuClose} to="/opportunities-config">
                            Opportunities Config
                          </MenuItemLink>
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
                      <ButtonMenuItem
                        primary="Book Now"
                        to="/schedule?isPicker=true"
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
                        <NavBarQuickSearchDialog
                          isOpen={isSearchDialogOpen}
                          handleClose={handleDialogClose}
                        />
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
                        <NavBarQuickSearchDialog
                          isOpen={isSearchDialogOpen}
                          handleClose={handleDialogClose}
                        />
                      )}
                    </Fragment>
                  )
                ) : import.meta.env.VITE_BRAND === 'brunoni' ? (
                  <div className={classes.item}>
                    <Button component="a" href="https://brunoni.ch">
                      <Typography variant="body1">Visit brunoni.ch</Typography>
                    </Button>
                  </div>
                ) : import.meta.env.VITE_BRAND === 'allmarine' ? (
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
              {guide && actingAs !== null && <GuideButton guide={guide} />}
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
                  src={getLogo()}
                  alt={changeCase.capitalCase(import.meta.env.VITE_BRAND || '')}
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
                  {isAdmin && (
                    <ListItemLink
                      primary="Land Transport"
                      to="/land-transport"
                      onClick={handleDrawerToggle}
                    />
                  )}
                  {/*<ListItemLink primary="Online Booking" to="/online-booking" onClick={handleDrawerToggle} />*/}

                  <ListItemLink primary="My day" to="/my-day" onClick={handleDrawerToggle} />

                  <Fragment>
                    <ListItemLink primary="Bookings" to="/bookings" onClick={handleDrawerToggle} />
                  </Fragment>
                  <ListItemLink
                    primary="Equipment Situation"
                    to="/equipment"
                    onClick={handleDrawerToggle}
                  />
                  <ListItemLink primary="Side Charges" to="/charges" onClick={handleDrawerToggle} />
                </Fragment>
              )}

              {user !== undefined && user !== null ? (
                <ListItemLink primary="Get Quote" to="/quotes/get" onClick={handleDrawerToggle} />
              ) : import.meta.env.VITE_BRAND === 'brunoni' ? (
                <ListItemLink
                  primary="Visit brunoni.ch"
                  to="https://brunoni.ch"
                  onClick={handleDrawerToggle}
                />
              ) : import.meta.env.VITE_BRAND === 'allmarine' ? (
                <ListItemLink
                  primary="Visit  allmarine.ch"
                  to="https://allmarine.ch"
                  onClick={handleDrawerToggle}
                />
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
