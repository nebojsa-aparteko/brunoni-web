import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as changeCase from 'change-case';
import { useHistory } from 'react-router';
import {
  AppBar,
  Box,
  Button,
  createStyles,
  Drawer,
  FormControl,
  Input,
  InputAdornment,
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
import LaunchIcon from '@material-ui/icons/Launch';
import Mousetrap from 'mousetrap';
import focusAndSelect from '../utilities/focusAndSelect';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import NavBarQuickSearchDialog from './NavBarQuickSearchDialog';

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
      marginLeft: theme.spacing(2),
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

  const gotoQuoteInputRef = useRef<HTMLInputElement>();

  const history = useHistory();

  useEffect(() => {
    const focusGoToQuote = () => {
      focusAndSelect(gotoQuoteInputRef.current!);
    };

    Mousetrap.bind(['ctrl+g', 'command+k', 'ctrl+shift+g', 'j q'], focusGoToQuote);

    return () => {
      Mousetrap.unbind(['ctrl+g', 'command+k', 'ctrl+shift+g', 'j q']);
    };
  }, [gotoQuoteInputRef]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoToQuoteOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode == 13) {
      history.push(`/quotes/${gotoQuoteInputRef.current?.value}`);
    }
  };

  const handleGoToQuoteButtonClick = () => {
    history.push(`/quotes/${gotoQuoteInputRef.current?.value}`);
  };

  const formControl = (
    <FormControl>
      <Input
        id="gotoquoteinput"
        placeholder="Quote # "
        onKeyDown={handleGoToQuoteOnKeyDown}
        className={classes.goToQuote}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="toggle password visibility" onClick={handleGoToQuoteButtonClick}>
              <LaunchIcon />
            </IconButton>
          </InputAdornment>
        }
        aria-describedby="gotoquoteinput-helper-text"
        inputRef={gotoQuoteInputRef}
        inputProps={{
          'aria-label': 'Go to quote',
        }}
        margin="dense"
      />
    </FormControl>
  );

  return (
    <Fragment>
      <Hidden smDown implementation="css">
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
                {user !== undefined && user !== null && actingAs && (
                  <Fragment>
                    <div className={classes.item}>
                      <Button component={Link} to="/" underline="none">
                        <Typography variant="body1">Dashboard</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/schedule" underline="none">
                        <Typography variant="body1">Schedule</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/quotes/groups" underline="none">
                        <Typography variant="body1">Quotes</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/bookings" underline="none">
                        <Typography variant="body1">Bookings</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
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
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      className={classes.menu}
                    >
                      <MenuItem onClick={handleMenuClose} component={props => <Link {...props} to="/equipment" />}>
                        Equipment Situation
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose} component={props => <Link {...props} to="/charges" />}>
                        Side Charges
                      </MenuItem>
                    </Menu>
                  </Fragment>
                )}
                {user !== undefined && user !== null && actingAs === null && (
                  <Fragment>
                    <div className={classes.item}>
                      <Button component={Link} to="/schedule" underline="none">
                        <Typography variant="body1">Schedule</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/quotes/groups" underline="none">
                        <Typography variant="body1">Quotes</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/bookings" underline="none">
                        <Typography variant="body1">Bookings</Typography>
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/charges" underline="none">
                        <Typography variant="body1">Side Charges</Typography>
                      </Button>
                    </div>
                    {userRecord?.emailAddress.indexOf('@spfr.co') !== -1 && (
                      <div className={classes.item}>
                        <Button variant="outlined" color="primary">
                          <Typography variant="body1">Quick Search</Typography>
                        </Button>
                      </div>
                    )}
                    <div className={classes.item}>
                      <Button component={Link} to="/charges" underline="none">
                        <Typography variant="body1">Side Charges</Typography>
                      </Button>
                    </div>
                    <NavBarQuickSearchDialog isOpen={isSearchDialogOpen} handleClose={handleDialogClose} />
                  </Fragment>
                )}
                <div className={classes.spacer} />
                {user !== undefined && user !== null ? (
                  actingAs ? (
                    <Fragment>
                      {formControl}
                      <div className={classes.item}>
                        <Button component={Link} to="/quotes/get" underline="none" variant="contained" color="primary">
                          <Typography variant="body1" style={{ color: 'white' }}>
                            Get Quote
                          </Typography>
                        </Button>
                      </div>
                    </Fragment>
                  ) : (
                    formControl
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
              <Link className={classes.logo} to="/">
                <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.capitalCase(process.env.REACT_APP_BRAND || '')}
                  className={classes.logo}
                />
              </Link>
              <Box displayPrint="none">
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
                  <ListItem
                    button
                    onClick={handleDrawerToggle}
                    component={props => <Link {...props} to="/" {...props} />}
                  >
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem button onClick={handleDrawerToggle} component={props => <Link {...props} to="/schedule" />}>
                    <ListItemText primary="Schedule" />
                  </ListItem>
                  <ListItem
                    button
                    onClick={handleDrawerToggle}
                    component={props => <Link {...props} to="/quotes/groups" />}
                  >
                    <ListItemText primary="Quotes" />
                  </ListItem>
                  <ListItem button onClick={handleDrawerToggle} component={props => <Link {...props} to="/bookings" />}>
                    <ListItemText primary="Bookings" />
                  </ListItem>
                  <ListItem
                    button
                    onClick={handleDrawerToggle}
                    component={props => <Link {...props} to="/equipment" />}
                  >
                    <ListItemText primary="Equipment Situation" />
                  </ListItem>
                  <ListItem button onClick={handleDrawerToggle} component={props => <Link {...props} to="/charges" />}>
                    <ListItemText primary="Side Charges" />
                  </ListItem>
                </Fragment>
              )}

              {user !== undefined && user !== null ? (
                <ListItem button onClick={handleDrawerToggle} component={props => <Link {...props} to="/quotes/get" />}>
                  <ListItemText primary="Get Quote" />
                </ListItem>
              ) : process.env.REACT_APP_BRAND === 'brunoni' ? (
                <ListItem
                  button
                  onClick={handleDrawerToggle}
                  component={props => <Link {...props} href="https://brunoni.ch" />}
                >
                  <ListItemText primary="Visit brunoni.ch" />
                </ListItem>
              ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                <ListItem
                  button
                  onClick={handleDrawerToggle}
                  component={props => <Link {...props} href="https://allmarine.ch" />}
                >
                  <ListItemText primary="Visit allmarine.ch" />
                </ListItem>
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
