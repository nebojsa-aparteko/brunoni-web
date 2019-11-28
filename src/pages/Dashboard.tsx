import React, { Fragment } from 'react';
import { Theme, makeStyles, CardHeader, Divider, CardContent, Card } from '@material-ui/core';
import Navbar from '../components/Navbar';
import Container from '../components/Container';
import QuoteGroups from '../components/QuoteGroups';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import Footer from '../components/Footer';
import GetQuotesButton from '../components/GetQuotesButton';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
  quoteDetails: {
    marginTop: theme.spacing(2),
  },
}));

const Dashboard: React.FC = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Navbar />
      <Container className={classes.root}>
        <DashboardCharts />
        <Card className={classes.quoteDetails}>
          <CardHeader title="Quotes" action={<GetQuotesButton />} />
          <Divider />
          <CardContent>
            <QuoteGroups showGetQuoteButton={false} />
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </Fragment>
  );
};

export default Dashboard;
