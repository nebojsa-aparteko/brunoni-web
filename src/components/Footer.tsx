import React, { Fragment } from 'react';
import { Theme, makeStyles, Box, Grid, Typography, Link, List, ListItem } from '@material-ui/core';
import Container from './Container';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  spacer: {
    flex: 1,
  },
  info: {
    background: '#2c3c50',
    color: 'rgba(215, 227, 243, 0.6)',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  copyright: {
    background: '#3d516a',
    color: 'rgba(215, 227, 243, 0.3)',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    textAlign: 'center',
  },
}));

const Footer: React.FC<Props> = ({}) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Box className={classes.spacer} />
      <Box className={classes.info}>
        <Container>
          <Grid container spacing={2}>
            <Grid item md={3}>
              <Typography variant="subtitle1">Company</Typography>
              <Box>
                <Link href="https://www.brunoni.ch/company/history">History</Link>
              </Box>
              <Box>
                <Link href="https://www.brunoni.ch/company/philosophy">Philosophy</Link>
              </Box>
              <Box>
                <Link href="https://www.brunoni.ch/company/management">Management</Link>
              </Box>
              <Box>
                <Link href="https://www.brunoni.ch/company/team">Team</Link>
              </Box>
              <Box>
                <Link href="https://www.brunoni.ch/company/careers">Careers</Link>
              </Box>
            </Grid>
            <Grid item md={3}>
              <Typography variant="subtitle1">Office Hours</Typography>
              <Box>
                <Typography>Mon-Fri</Typography>
              </Box>
              <Box>
                <Typography>08:00 - 12:00</Typography>
              </Box>
              <Box>
                <Typography>13:00 - 17:30</Typography>
              </Box>
              <Box />
              <Box>
                <Typography>Phone +41 44 455 58 58</Typography>
              </Box>
              <Box>
                <Typography>Fax +41 44 455 58 55</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box className={classes.copyright}>
        <Container>Copyright © {new Date().getFullYear()} O. Brunoni S.A. Agence Maritime</Container>
      </Box>
    </Fragment>
  );
};

export default Footer;
