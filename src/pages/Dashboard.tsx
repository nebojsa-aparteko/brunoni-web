import React, { useState } from 'react';
import { Box, Grid, makeStyles, Theme } from '@material-ui/core';
import Container from '../components/Container';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import useUser from '../hooks/useUser';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';
import DashboardYearSelect from '../components/DashboardYearSelect';

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
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setYear(event.target.value as number);
  };
  return (
    <Container className={classes.root}>
      <Box my={2}>
        <Grid container justify="flex-end">
          <Grid item xs={6} sm={5} md={4} lg={3}>
            <DashboardYearSelect year={year} handleYearChange={handleYearChange} />
          </Grid>
        </Grid>
      </Box>
      {userRecord?.alphacomClientId ? (
        <DashboardCharts client={userRecord?.alphacomClientId} year={year} />
      ) : (
        <ChartsCircularProgress />
      )}
    </Container>
  );
};

export default Dashboard;
