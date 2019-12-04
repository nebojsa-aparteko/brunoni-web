import React, { Fragment } from 'react';
import QuoteGroupsView from '../components/QuoteGroups';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core';
import Helmet from 'react-helmet';
import Meta from '../components/Meta';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

const QuoteGroups: React.FC = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Meta title="Quotes" />
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <QuoteGroupsView showGetQuoteButton={false} />
        </Paper>
      </Container>
    </Fragment>
  );
};

export default QuoteGroups;
