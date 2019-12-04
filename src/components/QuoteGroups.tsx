import React, { useContext, Fragment } from 'react';
import formatDate from 'date-fns/format';
import uniq from 'lodash/fp/uniq';
import { Table, TableBody, TableCell, TableHead, TableRow, Grid, Chip, Button, Container } from '@material-ui/core';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import { Link as RouterLink } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import GetQuotesButton from './GetQuotesButton';

interface Props {
  showGetQuoteButton?: boolean;
}

const QuoteGroups: React.FC<Props> = ({ showGetQuoteButton }) => {
  const { result } = useContext(QuotesEndpointContext);

  return (
    <Container maxWidth="lg" style={{ overflowX: 'auto', padding: 0 }}>
      {showGetQuoteButton && <GetQuotesButton />}
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Route</TableCell>
            <TableCell>Carriers</TableCell>
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
                    {uniq(quoteGroup.quotes.map(quote => quote.carrier?.name || quote.carrier?.id)).join(',')}
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1}>
                      {/*TODO handle the flash of undefined text*/}
                      {quoteGroup.containers &&
                        quoteGroup.containers.map((container, index) => (
                          <Grid item key={index}>
                            {container && <Chip label={container!.containerType?.name} />}
                          </Grid>
                        ))}
                    </Grid>
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1}>
                      {quoteGroup.commodityTypes &&
                        quoteGroup.commodityTypes.map((commodityType, index) => (
                          <Grid item key={index}>
                            <Chip label={commodityType?.name ? commodityType?.name : commodityType?.id} />
                          </Grid>
                        ))}
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
                    <Skeleton width={140} height={16} style={{ margin: 0 }} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={65} height={16} style={{ margin: 0 }} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={140} height={16} style={{ margin: 0 }} />
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
    </Container>
  );
};

QuoteGroups.defaultProps = {
  showGetQuoteButton: true,
};

export default QuoteGroups;
