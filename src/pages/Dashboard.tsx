import React from 'react';
import { Theme, makeStyles } from '@material-ui/core';
import Container from '../components/Container';
import QuoteGroupsView from '../components/QuoteGroupsView';
import DashboardCharts from '../components/dashboard/DashboardCharts';

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

  return (
    <Container className={classes.root}>
      <DashboardCharts />
      <QuoteGroupsView showGetQuoteButton={true} className={classes.quoteDetails} />
    </Container>
  );
};

export default Dashboard;
