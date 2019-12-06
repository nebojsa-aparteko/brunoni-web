import React from 'react';
import { Theme, makeStyles, CardHeader, Divider, CardContent, Card } from '@material-ui/core';
import Container from '../components/Container';
import QuoteGroups from '../components/QuoteGroups';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import GetQuotesButton from '../components/GetQuotesButton';

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
      <QuoteGroups showGetQuoteButton={false} className={classes.quoteDetails} />
    </Container>
  );
};

export default Dashboard;
