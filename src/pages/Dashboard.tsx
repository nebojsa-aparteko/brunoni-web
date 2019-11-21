import React, { Fragment } from 'react';
import { Theme, makeStyles, Grid, Paper, Typography } from '@material-ui/core';
import Navbar from '../components/Navbar';
import Container from '../components/Container';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

const Dashboard: React.FC<Props> = ({}) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Navbar />
      <Container className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Typography variant="h6" gutterBottom>
                Quotes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}></Paper>
          </Grid>
        </Grid>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
