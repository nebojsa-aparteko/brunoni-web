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
    color: theme.palette.common.white,
  },
  copyright: {
    background: '#273546',
    color: 'rgba(255,255,255,.35)',
    textAlign: 'center',
    fontWeigh: theme.typography.fontWeightMedium,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,

    '& li > a': {
      color: theme.palette.common.white,
      opacity: 0.65,
      fontSize: '1.25em',

      '&:hover': {
        opacity: 1,
        textDecoration: 'none',
      },
    },
  },
}));

const Footer: React.FC<Props> = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Box className={classes.spacer} displayPrint="none" />
      <Box className={classes.info} py={6} displayPrint="none">
        <Container>
          <Grid container spacing={2}>
            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="subtitle2">Company</Typography>
              </Box>
              <Box mb={4}>
                <ul className={classes.list}>
                  <li>
                    <Link href="https://www.brunoni.ch/company/history">History</Link>
                  </li>
                  <li>
                    <Link href="https://www.brunoni.ch/company/philosophy">Philosophy</Link>
                  </li>
                  <li>
                    <Link href="https://www.brunoni.ch/company/management">Management</Link>
                  </li>
                  <li>
                    <Link href="https://www.brunoni.ch/company/team">Team</Link>
                  </li>
                  <li>
                    <Link href="https://www.brunoni.ch/company/careers">Careers</Link>
                  </li>
                </ul>
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="subtitle2">Office Hours</Typography>
              </Box>
              <Box mb={2} style={{ opacity: 0.65 }}>
                <Typography variant="body2">Mon-Fri</Typography>
                <Typography variant="body2">08:00 - 12:00</Typography>
                <Typography variant="body2">13:00 - 17:30</Typography>
              </Box>

              <Box mb={4} style={{ opacity: 0.65 }}>
                <Typography variant="body2">Phone +41 44 455 58 58</Typography>
                <Typography variant="body2">Fax +41 44 455 58 55</Typography>
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="subtitle2">Follow Us</Typography>
              </Box>
              <Box mb={4}>
                <ul className={classes.list}>
                  <li>
                    <Link href="https://www.linkedin.com/in/nenad-milutinovic-3aa677b0?originalSubdomain=ch">
                      LinkedIn
                    </Link>
                  </li>
                  <li>
                    <Link href="https://www.brunoni.ch/newsletter-abo/user/modify">Newsletter ABO</Link>
                  </li>
                </ul>
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={12}>
              <Box mb={4}>
                <Typography variant="subtitle2">About Us</Typography>
              </Box>
              <Box mb={4}>
                <Typography variant="body2" style={{ opacity: 0.65 }}>
                  Shortly after the Second World War, in the year 1946. Oskar Brunoni founded his own company, to
                  represent foreign shipping lines in Switzerland.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box className={classes.copyright} py={4} displayPrint="none">
        <Container>Copyright © {new Date().getFullYear()} O. Brunoni S.A. Agence Maritime</Container>
      </Box>
    </Fragment>
  );
};

export default Footer;
