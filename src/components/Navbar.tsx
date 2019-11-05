import React from 'react';
import { makeStyles, Theme, AppBar, Toolbar, createStyles } from '@material-ui/core';
import changeCase from 'change-case';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Link from './Link';

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
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },
    toolbarItem: {},
    logo: {
      '& > img':
        ({
          brunoni: {
            position: 'relative',
            top: 38,
            width: 132,
          },
          allmarine: {
            height: 80,
          },
        } as Record<string, CSSProperties>)[process.env.REACT_APP_BRAND || ''] || {},
    },
    link: {
      height: 40,
      padding: '0 10px',
      lineHeight: '40px',
      color: '#666', // TODO Externalize.
      fontWeight: 300,
      letterSpacing: 1,
      transition: 'all .15s ease-in-out',
      transform: 'translateZ(0)',
      '&::after': {
        content: "''",
        position: 'absolute',
        bottom: 2,
        right: 10,
        left: 10,
        height: 1,
        background: '#4b6992', // TODO Externalize.
        opacity: 0,
        transition: 'height 0.3s, opacity 0.3s, transform 0.3s',
        transform: 'translateY(-10px)',
      },
      '&:hover': {
        textDecoration: 'none',
        '&::after': {
          opacity: 1,
          transform: 'translateY(0px)',
        },
      },
    },
  }),
);

const Navbar: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Link className={classes.logo} to="https://www.brunoni.ch/">
            <img
              src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
              alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
              className={classes.logo}
            />
          </Link>
          {/*<Link className={classes.link} to="https://www.brunoni.ch/links">*/}
          {/*LINKS*/}
          {/*</Link>*/}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
