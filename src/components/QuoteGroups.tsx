import React, { useContext } from 'react';
import formatDate from 'date-fns/format';
import {
  Box,
  Button,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
} from '@material-ui/core';
import Container from './Container';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import Link from './Link';
import { QuoteHeader } from '../model/quotes/QuotesResult';
import { Link as RouterLink } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const QuoteGroups: React.FC = () => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  return (
    <Box>
      <Container>
        <Box display="flex" pt={2} pb={0}>
          <Box flex="1" />
          <Button component={Link} to="/quotes/get" color="primary" variant="contained">
            Get Quote
          </Button>
        </Box>
      </Container>
      <Container maxWidth="lg">
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
                      <TableCell>{formatDate(quoteGroup.date, 'd. MMMM')}</TableCell>
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
    </Box>
  );
};

export default QuoteGroups;
