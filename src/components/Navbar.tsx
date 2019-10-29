import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { WithStyles, createStyles, Theme, withStyles, AppBar, Toolbar, Link } from '@material-ui/core';
import changeCase from 'change-case';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

interface Props extends WithStyles<typeof styles> {}

const Navbar: React.FC<Props> = ({ classes }) => (
  <div className={classes.container}>
    <AppBar className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Link component={Link1} className={classes.logo} to="https://www.brunoni.ch/">
          <img
            src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
            alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
            className={classes.logo}
          />
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/">
          HOME
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/company/history">
          COMPANY
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/carriers/hamburg-sued">
          CARRIERS
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/cases-studies/antwerp-fujairah">
          CASE STUDIES
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/vgm/definition">
          VGM
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/news">
          NEWS
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/blog">
          BLOG
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/contact/address">
          CONTACT
        </Link>
        <Link component={Link1} className={classes.link} to="https://www.brunoni.ch/links">
          LINKS
        </Link>
      </Toolbar>
    </AppBar>
  </div>
);

const Link1 = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => (
  <RouterLink innerRef={ref} {...props} />
));

const styles = (theme: Theme) =>
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
  });

export default withStyles(styles)(Navbar);
