import { TermTerm } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Typography, Link } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

interface Props {
  terms: TermTerm[];
}

const QuoteItemTerms: React.FC<Props> = ({ terms }) => (
  <Fragment>
    {terms.map((term: TermTerm) => (
      <Typography variant="body2">
        {term.TermValue} - {term.TermDetail}
        <br />
        <Link href={term.TermURL || ''} target="_blank" rel="noreferrer">
          {term.TermURL}
        </Link>
      </Typography>
    ))}
    <Divider />
  </Fragment>
);

export default QuoteItemTerms;
