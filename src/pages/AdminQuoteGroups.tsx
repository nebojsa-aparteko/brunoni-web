import React, { Fragment } from 'react';
import QuoteGroupsView from '../components/QuoteGroupsView';
import Container from '@material-ui/core/Container';
import { makeStyles, Theme } from '@material-ui/core';
import Meta from '../components/Meta';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

const AdminQuoteGroups: React.FC = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <Meta title="Quotes" />
      <Container maxWidth="xl" className={classes.root}>
        <QuoteGroupsView showGetQuoteButton={false} showCompanyInfo />
      </Container>
    </Fragment>
  );
};

export default AdminQuoteGroups;
