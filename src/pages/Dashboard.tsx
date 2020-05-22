import React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import Container from '../components/Container';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import useUser from '../hooks/useUser';
import useStatistics from '../hooks/useStatistics';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
  quoteDetails: {
    marginTop: theme.spacing(2),
  },
  cardContent: {
    padding: theme.spacing(0),
    overflowX: 'auto',
  },
}));

const Dashboard: React.FC = () => {
  const classes = useStyles();
  const userRecord = useUser()[1];
  return (
    <Container className={classes.root}>
      {userRecord?.alphacomClientId ? (
        <DashboardCharts client={userRecord?.alphacomClientId} />
      ) : (
        <ChartsCircularProgress />
      )}
    </Container>
  );
};

export default Dashboard;
