import React, { Fragment } from 'react';
import {
  Chip,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { NormalizedOpportunity } from '../../model/Opportunity';

import OpportunitiesEmptyResults from './OpportunitisEmptyResults';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbarRoot: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    toolbarHighlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.secondary.dark,
            backgroundColor: theme.palette.secondary.dark,
          },
    toolbarTitle: {
      flex: '1 1 100%',
    },
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogBody: {
      width: theme.spacing(100),
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
    },
    tableRow: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(161,213,255,0.20) !important',
      },
    },
    progress: {
      backgroundColor: '#e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '8px',
      width: '100%',
      marginTop: '4px',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#3f51b5',
      transition: 'width 0.3s ease-in-out',
    },
  }),
);

interface OpportunityTableProps {
  opportunities: NormalizedOpportunity[] | undefined;
  onRowClick?: (opportunity: NormalizedOpportunity) => void;
}

interface OpportunityTableRowProps {
  opportunity: NormalizedOpportunity;
  onRowClick?: (opportunity: NormalizedOpportunity) => void;
}

const OpportunityTableRow: React.FC<OpportunityTableRowProps> = ({ opportunity, onRowClick }) => {
  const classes = useStyles();
  const booked = 0;
  const quoted = 0;

  const handleRowClick = () => {
    onRowClick?.(opportunity);
  };

  return (
    <TableRow hover className={classes.tableRow} tabIndex={-1} onClick={handleRowClick}>
      <TableCell padding="checkbox"></TableCell>
      <TableCell align="center">
        {opportunity.salesRepId?.firstName} {opportunity.salesRepId?.lastName}
      </TableCell>
      <TableCell align="center">{opportunity.bookingPartyId?.name}</TableCell>
      <TableCell align="center">{opportunity.statisticalClientId?.name}</TableCell>
      <TableCell align="center">{opportunity.agreementId}</TableCell>
      <TableCell align="center">{opportunity.quoteKind}</TableCell>
      <TableCell align="center">{opportunity.placeOfReceiptGroupId?.name}</TableCell>
      <TableCell align="center">{opportunity.portOfLoadingGroupId?.name}</TableCell>
      <TableCell align="center">{opportunity.portOfDischargeGroupId?.name}</TableCell>
      <TableCell align="center">{opportunity.placeOfDeliveryGroupId?.name}</TableCell>
      <TableCell align="center">{opportunity.commodityGroupId?.name}</TableCell>
      <TableCell align="center">{opportunity.equipmentGroupId?.name}</TableCell>
      <TableCell align="center">
        {opportunity.tagIds && opportunity.tagIds.length > 0
          ? opportunity.tagIds.map(tag => (
              <Chip
                key={tag.id}
                label={tag.tag}
                size="small"
                style={{ marginRight: 4, marginBottom: 2 }}
                color="primary"
                variant="outlined"
              />
            ))
          : 'Not specified'}
      </TableCell>
      <TableCell align="center">
        {opportunity.validity
          ? new Date(opportunity.validity).toLocaleDateString()
          : 'Not specified'}
      </TableCell>
      <TableCell align="center">{opportunity.note}</TableCell>
      <TableCell align="center">{opportunity.capacityTEU} TEU</TableCell>
      <TableCell align="center">
        <div style={{ minWidth: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, marginRight: 6 }}>
              {opportunity.booked !== null && opportunity.capacityTEU
                ? `${opportunity.booked} / ${opportunity.capacityTEU}`
                : '—'}
            </span>
          </div>
          <div style={{ width: '100%', background: '#e0e0e0', borderRadius: 4, height: 8 }}>
            <div
              style={{
                width:
                  opportunity.booked !== null && opportunity.capacityTEU
                    ? `${Math.min((opportunity.booked / opportunity.capacityTEU) * 100, 100)}%`
                    : '0%',
                background: '#3f51b5',
                height: '100%',
                borderRadius: 4,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell align="center">
        <div style={{ minWidth: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, marginRight: 6 }}>
              {opportunity.booked !== null && opportunity.quoted !== null
                ? `${opportunity.booked} / ${opportunity.quoted}`
                : '—'}
            </span>
          </div>
          <div style={{ width: '100%', background: '#e0e0e0', borderRadius: 4, height: 8 }}>
            <div
              style={{
                width:
                  opportunity.booked !== null && opportunity.quoted
                    ? `${Math.min((opportunity.booked / (opportunity.quoted === 0 ? 1 : opportunity.quoted)) * 100, 100)}%`
                    : '0%',
                background: '#43a047',
                height: '100%',
                borderRadius: 4,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities, onRowClick }) => {
  const displayOpportunities = opportunities || [];

  return (
    <Fragment>
      {displayOpportunities.length === 0 ? (
        <OpportunitiesEmptyResults
          message={'No opportunities found for your filter criteria. Try changing filters.'}
        />
      ) : (
        <Paper>
          <TableContainer component={Paper}>
            <Table aria-label="opportunities table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}></TableCell>
                  <TableCell align="center">Sales Rep</TableCell>
                  <TableCell align="center">Booking Party</TableCell>
                  <TableCell align="center">Statistical client</TableCell>
                  <TableCell align="center">Agreement</TableCell>
                  <TableCell align="center">Quote Kind</TableCell>
                  <TableCell align="center">Place of Receipt</TableCell>
                  <TableCell align="center">Port of Loading</TableCell>
                  <TableCell align="center">Port of Discharge</TableCell>
                  <TableCell align="center">Place of Delivery</TableCell>
                  <TableCell align="center">Commodity Groups</TableCell>
                  <TableCell align="center">Equipment Groups</TableCell>
                  <TableCell align="center">Tags</TableCell>
                  <TableCell align="center">Validity</TableCell>
                  <TableCell align="center">Note</TableCell>
                  <TableCell align="center">Potential</TableCell>
                  <TableCell align="center">Quoted</TableCell>
                  <TableCell align="center">Booked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayOpportunities ? (
                  displayOpportunities.map(opportunity => (
                    <OpportunityTableRow
                      key={opportunity.id}
                      opportunity={opportunity}
                      onRowClick={onRowClick}
                    />
                  ))
                ) : (
                  <ChartsCircularProgress />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Fragment>
  );
};

export default OpportunityTable;
