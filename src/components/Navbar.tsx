import React from 'react';
import changeCase from 'change-case';
import { makeStyles, Theme, AppBar, Toolbar, createStyles, Button, Grid } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Link from './Link';
import Container from './Container';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: 100,
    },
    appBar: {
      background: theme.palette.background.default,
    },
    toolbar: {
      height: 100,
    },
    toolbarItem: {},
    logo: {
      '& > img':
        ({
          brunoni: {
            position: 'relative',
            top: 38,
            width: 153,
          },
          allmarine: {
            height: 80,
          },
        } as Record<string, CSSProperties>)[process.env.REACT_APP_BRAND || ''] || {},
    },
    spacer: {
      flex: 1,
    },
    link: {
      // height: 40,
      // padding: '0 10px',
      // lineHeight: '40px',
      // color: '#666', // TODO Externalize.
      // fontWeight: 300,
      // letterSpacing: 1,
      // transition: 'all .15s ease-in-out',
      // transform: 'translateZ(0)',
      // '&::after': {
      //   content: "''",
      //   position: 'absolute',
      //   bottom: 2,
      //   right: 10,
      //   left: 10,
      //   height: 1,
      //   background: '#4b6992', // TODO Externalize.
      //   opacity: 0,
      //   transition: 'height 0.3s, opacity 0.3s, transform 0.3s',
      //   transform: 'translateY(-10px)',
      // },
      // '&:hover': {
      //   textDecoration: 'none',
      //   '&::after': {
      //     opacity: 1,
      //     transform: 'translateY(0px)',
      //   },
      // },
    },
  }),
);

const Navbar: React.FC = () => {
  const classes = useStyles();

  return (
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
          <div className={classes.spacer} />
          <Grid container justify="flex-end" spacing={2}>
            <Grid item>
              <Button component="a" href="https://www.brunoni.ch/links">
                Visit brunoni.ch
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined">Login</Button>
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
