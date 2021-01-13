import React, { Fragment } from 'react';
import { Theme, makeStyles, Box, Grid, Typography, Link } from '@material-ui/core';
import Container from './Container';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  spacer: {
    flex: 1,
  },
  info: {
    background: '#2c3c50',
    color: 'rgba(215, 227, 243, 0.5)',
  },
  title: {
    textTransform: 'uppercase',
    color: '#d7e3f3', // TODO move this to theme
  },
  copyright: {
    background: '#273546',
    color: 'rgba(215, 227, 243, 0.5)', // TODO move this to theme
    textAlign: 'center',
    fontWeigh: theme.typography.fontWeightMedium,
    fontFamily: theme.typography.fontFamily, // TODO set font family to <body> rather than each individual component
  },
  link: {
    color: '#d7e3f3', // TODO move this to theme
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    lineHeight: 1.65,

    '& li > a': {
      color: '#d7e3f3', // TODO move this to theme
      fontSize: theme.typography.body1,
      fontFamily: theme.typography.fontFamily,

      '&:hover': {
        opacity: 1,
        textDecoration: 'none',
      },
    },
  },
}));

const BrunoniFooter: React.FC<Props> = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Box className={classes.spacer} displayPrint="none" />
      <Box className={classes.info} py={6} displayPrint="none">
        <Container>
          <Grid container spacing={2}>
            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="h4" className={classes.title}>
                  Company
                </Typography>
              </Box>
              <Box mb={4}>
                <ul className={classes.list}>
                  <li>
                    <Link href="https://allmarine.ch/company">About Us</Link>
                  </li>
                  <li>
                    <Link href="https://allmarine.ch/contact/address">Team</Link>
                  </li>
                </ul>
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="h4" className={classes.title}>
                  Office Hours
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body1" color="inherit">
                  Mon-Fri
                </Typography>
                <Typography variant="body1" color="inherit">
                  08:00 - 12:00
                </Typography>
                <Typography variant="body1" color="inherit">
                  13:00 - 17:00
                </Typography>
              </Box>

              <Box mb={4}>
                <Typography variant="body1" color="inherit">
                  Phone +41 44 533 38 48
                </Typography>
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="h4" className={classes.title}>
                  Follow Us
                </Typography>
              </Box>
              <Box mb={4}>
                <ul className={classes.list}>
                  <li>
                    <Link href="https://www.linkedin.com/company/allmarine-ag/">LinkedIn</Link>
                  </li>
                </ul>
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="h4" className={classes.title}>
                  About Us
                </Typography>
              </Box>
              <Box mb={4}>
                <Typography variant="body1" color="inherit">
                  Allmarine AG was founded in 2017 and is a privately owned company, which acts as an independent
                  shipping agency in Switzerland.{' '}
                  <Link href="https://allmarine.ch/company" className={classes.link}>
                    Read more…
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box className={classes.copyright} py={5} displayPrint="none">
        <Container>
          <Typography variant="body1" color="inherit">
            Copyright © {new Date().getFullYear()} ALLMARINE AG.
          </Typography>
        </Container>
      </Box>
    </Fragment>
  );
};

export default BrunoniFooter;
