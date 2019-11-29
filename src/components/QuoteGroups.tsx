import React, { useContext } from 'react';
import formatDate from 'date-fns/format';
import {
  Button,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Grid,
  Chip,
} from '@material-ui/core';
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

  const { result } = useContext(QuotesEndpointContext);

  return (
    <Container maxWidth="lg">
      {showGetQuoteButton && <GetQuotesButton />}
      <Paper className={classes.root}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Route</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Commodities</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result
              ? result.map(quoteGroup => (
                  <TableRow key={quoteGroup.id}>
                    <TableCell>
                      {quoteGroup.origin.city || quoteGroup.origin.id} →{' '}
                      {quoteGroup.destination.city || quoteGroup.destination.id}
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={1}>
                        {/*TODO handle the flash of undefined text*/}
                        {quoteGroup.containers &&
                          quoteGroup.containers.map(container => (
                            <Grid item>
                              {container && (
                                <Chip
                                  label={
                                    (container.quantity > 1 ? container.quantity + ' x ' : '') +
                                    container!.containerType?.name
                                  }
                                />
                              )}
                            </Grid>
                          ))}
                      </Grid>
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={1}>
                        {quoteGroup.containers && (
                          <Grid item>
                            {/*TODO check all commodity types not just the first one but don’t display duplicates :)*/}
                            <Chip label={quoteGroup.containers[0].commodityType?.name} />
                          </Grid>
                        )}
                      </Grid>
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
