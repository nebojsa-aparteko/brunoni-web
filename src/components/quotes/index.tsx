import React from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import { CargoDetail, QuoteHeader, QuoteItemNormalized, TermTerm } from '../../model/quotes/QuotesResult';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import {
  Button,
  Container,
  Paper,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  quoteHeaders: QuoteHeader[];
}

const QuotesList: React.FC<Props> = ({ quoteHeaders }) => {
  const history = useHistory();
  const classes = useStyles();
  return (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Quote Number</TableCell>
              <TableCell align="right">Quote Reference</TableCell>
              <TableCell align="right">Quote Date</TableCell>
              <TableCell align="right">Quote Validity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quoteHeaders.map((quoteHeader: QuoteHeader, index) => {
              const asArray = (item: any) => (item === null ? [] : Array.isArray(item) ? item : [item]);
              const normalizeQuoteHeaderProps = flow(
                update('QuoteDetails', flow(asArray, map(update('QuoteDetail', asArray)))),
                update('CostDetailsRemarks', flow(asArray, map(update('CostDetailRemark', asArray)))),
                update('ServiceDetail', asArray),
                update('CargoDetails', flow(asArray, map(update('CargoDetail', asArray)))),
                update('Remarks', flow(asArray, map(update('Remark', asArray)))),
                update('Terms', flow(asArray, map(update('Term', asArray)))),
              );
              const normalizedQuotesResult = normalizeQuoteHeaderProps(quoteHeader);

              let normalizedQuoteItems: QuoteItemNormalized[] = [];
              for (let i = 0; i < normalizedQuotesResult.QuoteDetails.length; i++) {
                normalizedQuoteItems[i] = {
                  QuoteDetails: normalizedQuotesResult.QuoteDetails[i].QuoteDetail,
                  CargoDetail: normalizedQuotesResult.CargoDetails[i]
                    ? normalizedQuotesResult.CargoDetails[i].CargoDetail
                    : [],
                  Remarks: normalizedQuotesResult.Remarks[i].Remark,
                  CostDetailsRemarks: normalizedQuotesResult.CostDetailsRemarks[i]
                    ? normalizedQuotesResult.CostDetailsRemarks[i].CostDetailRemark
                    : [],
                  Terms: normalizedQuotesResult.Terms[i]
                    ? normalizedQuotesResult.Terms[i].Term.filter((item: TermTerm) => item.TermLabel === null)
                    : [],
                  ServiceDetail: normalizedQuotesResult.ServiceDetail[i],
                  TermsHeader: normalizedQuotesResult.Terms[i]
                    ? normalizedQuotesResult.Terms[i].Term.filter((item: TermTerm) => item.TermLabel !== null)
                    : [],
                  QuoteHeader: normalizedQuotesResult,
                };
              }
              console.log('Normalized ', normalizedQuoteItems);
              return (
                <TableRow hover>
                  <TableCell component="th" scope="row">
                    {quoteHeader.QuoteNumber}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" display="block">
                      {quoteHeader.AdrId}
                    </Typography>
                    <Typography variant="body2" display="block">
                      {'Carrier: ' + quoteHeader.CarrierID}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{quoteHeader.QuoteDate}</TableCell>
                  <TableCell align="right">{quoteHeader.QuoteValidity}</TableCell>
                  <TableCell align="right">
                    <Button
                      color="primary"
                      component={RouterLink}
                      size="small"
                      to={`/quotes/${quoteHeader.QuoteNumber}`}
                      variant="outlined"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default QuotesList;
