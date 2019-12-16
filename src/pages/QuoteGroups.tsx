import React, { Fragment } from 'react';
import QuoteGroupsView from '../components/QuoteGroups';
import Container from '@material-ui/core/Container';
import { makeStyles, Theme } from '@material-ui/core';
import Meta from '../components/Meta';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

const QuoteGroups: React.FC = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Meta title="Quotes" />
      <Container maxWidth="lg" className={classes.root}>
        <QuoteGroupsView showGetQuoteButton={false} />
      </Container>
    </Fragment>
  );
};

export default QuoteGroups;
