import React, { Fragment, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  QuoteDetailQuoteDetail,
  QuoteDetailsQuoteDetailClass,
  QuoteHeader,
  ServiceDetailElement,
} from '../../model/quotes/QuotesResult';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import Container from '../Container';
import { Box, Grid, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Divider from '@material-ui/core/Divider';
import MaterialTable from 'material-table';

interface Props {
  quoteHeaders: QuoteHeader[];
}

const QuotesList: React.FC<Props> = ({ quoteHeaders }) => {
  return (
    <Box>
      <MaterialTable
        data={quoteHeaders}
        columns={[
          { title: 'Quote Reference', field: 'AdrId' },
          { title: 'Carrier ID', field: 'CarrierID' },
          { title: 'Quote Number', field: 'QuoteNumber' },
          { title: 'Quote Date', field: 'QuoteDate' },
          { title: 'Quote Validity', field: 'QuoteValidity' },
        ]}
        detailPanel={rowData => {
          let asArray = (quoteDetail: any) => (Array.isArray(quoteDetail) ? quoteDetail : [quoteDetail]);
          const normalizeQuotesResult = flow(
            update('QuoteDetails', flow(asArray, map(update('QuoteDetail', asArray)))),
            update('ServiceDetail', asArray),
            update('Remarks', asArray),
          );
          const normalizedQuotesResult = normalizeQuotesResult(rowData);

          return (
            <Container>
              <Grid container spacing={4}>
                {normalizedQuotesResult.QuoteDetails.map((quoteDetails: QuoteDetailsQuoteDetailClass) => (
                  <Fragment>
                    <Grid item xs={12}>
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Currency</TableCell>
                            <TableCell>Cost Value</TableCell>
                            <TableCell>Cost Unit</TableCell>
                            <TableCell>Remark</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {quoteDetails.QuoteDetail.map((quoteDetail: QuoteDetailQuoteDetail) => (
                            <TableRow key={quoteDetail.Pos}>
                              <TableCell component="th" scope="row">
                                {quoteDetail.Description}
                              </TableCell>
                              <TableCell>{quoteDetail.Currency}</TableCell>
                              <TableCell>{quoteDetail.CostValue}</TableCell>
                              <TableCell>{quoteDetail.CostUnit}</TableCell>
                              <TableCell>{quoteDetail.Remark}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Grid>
                  </Fragment>
                ))}
                {normalizedQuotesResult.ServiceDetail.map((item: ServiceDetailElement) => (
                  <Fragment>
                    <Divider />
                    <Grid item xs={4}>
                      <Typography variant="h5" gutterBottom>
                        <Box fontWeight="fontWeightBold">Frequency</Box>
                      </Typography>
                      <Typography variant="subtitle1">{item.Frequency}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h5" gutterBottom>
                        <Box fontWeight="fontWeightBold">Routing</Box>
                      </Typography>
                      <Typography variant="subtitle1">{item.Routing}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h5" gutterBottom>
                        <Box fontWeight="fontWeightBold">Transit Time</Box>
                      </Typography>
                      <Typography variant="subtitle1">{item.TransitTime}</Typography>
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Container>
          );
        }}
      />
    </Box>
  );
};

export default QuotesList;
