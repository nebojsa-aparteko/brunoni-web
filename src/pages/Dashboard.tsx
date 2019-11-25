import React, { Fragment } from 'react';
import { Theme, makeStyles, Grid, Paper, Typography, Button } from '@material-ui/core';
import Navbar from '../components/Navbar';
import Container from '../components/Container';
import Quotes from '../components/Quotes';
import ClientPerformance from '../components/ClientPerformance';
import Footer from '../components/Footer';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  paper: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(4),
  },
}));

const Dashboard: React.FC<Props> = ({}) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Navbar />
      <Container className={classes.root}>
        <ClientPerformance />
        <Paper className={classes.paper}>
          <Grid container spacing={2} justify="space-between">
            <Grid item>
              <Typography variant="h6" gutterBottom>
                Quotes
              </Typography>
            </Grid>
            <Grid item>
              <Button>Get Quote</Button>
            </Grid>
          </Grid>
          <Quotes />
        </Paper>
      </Container>
      <Footer />
    </Fragment>
  );
};

export default Dashboard;
