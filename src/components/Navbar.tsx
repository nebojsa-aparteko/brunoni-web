import React from 'react';
import changeCase from 'change-case';
import { makeStyles, Theme, AppBar, Toolbar, createStyles, Button } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Link from './Link';
import Container from './Container';
import IdentityWidget from './IdentityWidget';

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
    item: {
      display: 'flex',
      marginLeft: theme.spacing(2),
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
          {process.env.REACT_APP_BRAND === 'brunoni' ? (
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
