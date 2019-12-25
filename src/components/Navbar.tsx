import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import changeCase from 'change-case';
import { useHistory } from 'react-router';
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
  InputAdornment,
  Input,
  FormControl,
  Menu,
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
import firebase from '../firebase';
import { useSnackbar } from 'notistack';
import LoginDialog from '../contexts/LoginDialog';
import ActingAs from '../contexts/ActingAs';
import LaunchIcon from '@material-ui/icons/Launch';
import Mousetrap from 'mousetrap';
import focusAndSelect from '../utilities/focusAndSelect';
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

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
            width: 80,
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
  const [user] = useUser();
  const [userRecord] = useContext(ActingAs);
  const { open } = useContext(LoginDialog);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

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
                  alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
                  className={classes.logo}
                />
              </Link>
              <Box displayPrint="none" width="100%" display="flex">
                {user !== undefined && user !== null && userRecord && (
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
                      <Button
                        endIcon={<KeyboardArrowDownIcon />}
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={handleMenuClick}
                      >
                        Other
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
                {user !== undefined && user !== null && userRecord === null && (
                  <Fragment>
                    <div className={classes.item}>
                      <Button component={Link} to="/quotes/groups" underline="none">
                        Quotes
                      </Button>
                    </div>
                    <div className={classes.item}>
                      <Button component={Link} to="/charges" underline="none">
                        Side Charges
                      </Button>
                    </div>
                  </Fragment>
                )}
                <div className={classes.spacer} />
                {user !== undefined && user !== null ? (
                  userRecord ? (
                    <Fragment>
                      {formControl}
                      <div className={classes.item}>
                        <Button component={Link} to="/quotes/get" underline="none" variant="outlined">
                          Get Quote
                        </Button>
                      </div>
                    </Fragment>
                  ) : (
                    formControl
                  )
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
              <Link className={classes.logo} to="/">
                <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
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
                  <ListItem button onClick={handleDrawerToggle} component={props => <Link {...props} to="/" />}>
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
                  component={props => <a {...props} href="https://brunoni.ch" />}
                >
                  <ListItemText primary="Visit brunoni.ch" />
                </ListItem>
              ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                <ListItem
                  button
                  onClick={handleDrawerToggle}
                  component={props => <a {...props} href="https://allmarine.ch" />}
                >
                  <ListItemText primary="Visit allmarine.ch" />
                </ListItem>
              ) : null}

              <Divider />

              {user !== undefined && user !== null ? (
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
