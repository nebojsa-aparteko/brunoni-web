import React, { Fragment } from 'react';
import { Typography, Link, Grid, makeStyles } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { Term } from '../../providers/QuoteGroupsProvider';

interface Props {
  terms: Term[];
}

const useStyles = makeStyles(theme => ({
  link: {
    wordBreak: 'break-word',
  },
}));

const QuoteItemTerms: React.FC<Props> = ({ terms }) => {
  const classes = useStyles();

  return (
    <Fragment>
      <Grid item xs={12}>
        {terms
          .filter(term => term.TermLabel !== 'TERMS & CONDITIONS')
          .map((term, index: number) => (
            <Typography variant="body2" key={index}>
              {term.TermValue} - {term.TermDetail}
              <br />
              <Link href={term.TermURL || ''} className={classes.link} target="_blank" rel="noreferrer">
                {term.TermURL}
              </Link>
            </Typography>
          ))}
      </Grid>
      <Divider />
    </Fragment>
  );
};

export default QuoteItemTerms;
