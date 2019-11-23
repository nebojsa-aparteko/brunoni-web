import React, { Fragment, useEffect, useState } from 'react';
import {
  CargoDetailCargoDetail,
  QuoteDetailQuoteDetail,
  QuoteDetailsQuoteDetailClass,
  QuoteHeader,
  QuoteItemNormalized,
  ServiceDetailElement,
  TermTerm,
} from '../../model/quotes/QuotesResult';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import {
  Box,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import InfoBoxItem from '../InfoBoxItem';
import Page from './Page';
import QuoteItemQuoteDetails from './QuoteItemQuoteDetails';
import QuoteItem from './QuoteItem';

interface Props {
  quoteHeaders: QuoteHeader[];
}

const QuotesList: React.FC<Props> = ({ quoteHeaders }) => {
  return (
    <Fragment>
      {quoteHeaders.map((quoteHeader: QuoteHeader) => {
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
          <ExpansionPanel defaultExpanded={false} TransitionProps={{ unmountOnExit: true }}>
            <ExpansionPanelSummary>
              <Grid container spacing={2}>
                <Grid item md={3} sm={12}>
                  <InfoBoxItem title="Quote Number" label1={quoteHeader.QuoteNumber} />
                </Grid>
                <Grid item md={3} sm={12}>
                  <InfoBoxItem
                    title="Quote Reference"
                    label1={quoteHeader.AdrId}
                    label2={'Carrier: ' + quoteHeader.CarrierID}
                  />
                </Grid>
                <Grid item md={3} sm={12}>
                  <InfoBoxItem title="Quote Date" label1={quoteHeader.QuoteDate} />
                </Grid>
                <Grid item md={3} sm={12}>
                  <InfoBoxItem title="Quote Validity" label1={quoteHeader.QuoteValidity} />
                </Grid>
              </Grid>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.expansionPanelDetails}>
              <Grid container>
                {normalizedQuoteItems.map(quoteItem => (
                  <Grid item xs={12}>
                    <QuoteItem quoteItemNormalized={quoteItem} />
                  </Grid>
                ))}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </Fragment>
  );
};

export default QuotesList;
