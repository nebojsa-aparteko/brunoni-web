import React, { useContext } from 'react';
import formatDate from 'date-fns/format';
import { Button, makeStyles, Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme } from '@material-ui/core';
import Container from './Container';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import { Link as RouterLink } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import GetQuotesButton from './GetQuotesButton';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  showGetQuoteButton?: boolean;
}

const QuoteGroups: React.FC<Props> = ({ showGetQuoteButton }) => {
  const classes = useStyles();

  console.log('show', showGetQuoteButton);

  const { result } = useContext(QuotesEndpointContext);

  return (
    <Container maxWidth="lg">
      {showGetQuoteButton && <GetQuotesButton />}
      <Paper className={classes.root}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Reference Number</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result
              ? result.map(quoteGroup => (
                  <TableRow key={quoteGroup.id}>
                    <TableCell component="th" scope="row">
                      #{quoteGroup.id}
                    </TableCell>
                    <TableCell>
                      {quoteGroup.origin.city || quoteGroup.origin.id} →{' '}
                      {quoteGroup.destination.city || quoteGroup.destination.id}
                    </TableCell>
                      <TableCell>{formatDate(quoteGroup.dateIssued, 'd. MMMM')}</TableCell>
                    <TableCell align="right">
                      <Button
                        color="primary"
                        component={RouterLink}
                        size="small"
                        to={`/quotes/groups/${quoteGroup.id}`}
                        variant="outlined"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton width={50} height={16} style={{ margin: 0 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={65} height={16} style={{ margin: 0 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={140} height={16} style={{ margin: 0 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={64} height={29} style={{ margin: 0, float: 'right' }} />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

QuoteGroups.defaultProps = {
  showGetQuoteButton: true,
};

export default QuoteGroups;
