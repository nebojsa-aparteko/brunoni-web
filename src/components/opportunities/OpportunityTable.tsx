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
  TableSortLabel,
} from '@material-ui/core';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { NormalizedOpportunity } from '../../model/Opportunity';

import OpportunitiesEmptyResults from './OpportunitisEmptyResults';

const getSortValue = (opportunity: NormalizedOpportunity, key: string): any => {
  switch (key) {
    case 'salesRep':
      return opportunity.salesRepId
        ? `${opportunity.salesRepId.lastName} ${opportunity.salesRepId.firstName}`
        : '';
    case 'bookingParty':
      return opportunity.bookingPartyId?.name || '';
    case 'statisticalClient':
      return opportunity.statisticalClientId?.name || '';
    case 'agreement':
      return opportunity.agreementId || '';
    case 'quoteKind':
      return opportunity.quoteKind || '';
    case 'placeOfReceipt':
      return opportunity.placeOfReceiptGroupId?.name || '';
    case 'portOfLoading':
      return opportunity.portOfLoadingGroupId?.name || '';
    case 'portOfDischarge':
      return opportunity.portOfDischargeGroupId?.name || '';
    case 'placeOfDelivery':
      return opportunity.placeOfDeliveryGroupId?.name || '';
    case 'commodityGroup':
      return opportunity.commodityGroupId?.name || '';
    case 'equipmentGroup':
      return opportunity.equipmentGroupId?.name || '';
    case 'tags':
      return opportunity.tagIds?.length || 0;
    case 'validity':
      return opportunity.validity ? new Date(opportunity.validity).getTime() : 0;
    case 'capacityTEU':
      return opportunity.capacityTEU || 0;
    case 'quotedProgress':
      return opportunity.quoted && opportunity.capacityTEU
        ? opportunity.quoted / opportunity.capacityTEU
        : 0;
    case 'bookedProgress':
      return opportunity.booked && opportunity.capacityTEU
        ? opportunity.booked / opportunity.capacityTEU
        : 0;
    case 'note':
      return opportunity.note || '';
    default:
      return '';
  }
};

const sortOpportunities = (
  opportunities: NormalizedOpportunity[],
  sortConfig: SortConfig,
): NormalizedOpportunity[] => {
  if (!sortConfig.key) return opportunities;

  return [...opportunities].sort((a, b) => {
    const aValue = getSortValue(a, sortConfig.key);
    const bValue = getSortValue(b, sortConfig.key);

    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return sortConfig.direction === 'desc' ? -comparison : comparison;
  });
};

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

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortOrder;
}

interface OpportunityTableProps {
  opportunities: NormalizedOpportunity[] | undefined;
  onRowClick?: (opportunity: NormalizedOpportunity) => void;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

interface OpportunityTableRowProps {
  opportunity: NormalizedOpportunity;
  onRowClick?: (opportunity: NormalizedOpportunity) => void;
}

interface SortableHeaderProps {
  sortKey: string;
  children: React.ReactNode;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  sortKey,
  children,
  sortConfig,
  onSort,
}) => {
  const active = sortConfig?.key === sortKey;
  const direction = active ? sortConfig.direction : 'asc';

  const handleClick = () => {
    onSort?.(sortKey);
  };

  return (
    <TableCell align="center">
      <TableSortLabel active={active} direction={direction} onClick={handleClick}>
        {children}
      </TableSortLabel>
    </TableCell>
  );
};

const OpportunityTableRow: React.FC<OpportunityTableRowProps> = ({ opportunity, onRowClick }) => {
  const classes = useStyles();

  const handleRowClick = () => {
    onRowClick?.(opportunity);
  };

  return (
    <TableRow hover className={classes.tableRow} tabIndex={-1} onClick={handleRowClick}>
      <TableCell component="th" scope="row" style={{ paddingLeft: 4 }}>
        {opportunity.opportunityId}
      </TableCell>
      <TableCell align="center">{opportunity.bookingPartyId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.statisticalClientId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.placeOfReceiptGroupId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.portOfLoadingGroupId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.portOfDischargeGroupId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.placeOfDeliveryGroupId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.equipmentGroupId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.commodityGroupId?.name || ''}</TableCell>
      <TableCell align="center">{opportunity.quoteKind || ''}</TableCell>
      <TableCell align="center">{opportunity.agreementId || ''}</TableCell>

      <TableCell align="center">
        {opportunity.validity ? new Date(opportunity.validity).toLocaleDateString() : ''}
      </TableCell>
      <TableCell align="center">
        {opportunity.capacityTEU ? `${opportunity.capacityTEU} TEU` : ''}
      </TableCell>

      <TableCell align="center">
        {opportunity.capacityTEU && opportunity.capacityTEU > 0 ? (
          <div style={{ minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, marginRight: 6 }}>
                {opportunity.booked !== null && opportunity.quoted !== null
                  ? `${opportunity.booked} / ${opportunity.quoted}`
                  : '—'}
              </span>
              {opportunity.booked !== null &&
                opportunity.quoted !== null &&
                opportunity.quoted > 0 && (
                  <span style={{ fontSize: 10, color: '#666', marginLeft: 'auto' }}>
                    ({Math.round((opportunity.booked / opportunity.quoted) * 100)}%)
                  </span>
                )}
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
        ) : (
          ''
        )}
      </TableCell>
      <TableCell align="center">
        {opportunity.capacityTEU && opportunity.capacityTEU > 0 ? (
          <div style={{ minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, marginRight: 6 }}>
                {opportunity.booked !== null && opportunity.capacityTEU
                  ? `${opportunity.booked} / ${opportunity.capacityTEU}`
                  : '—'}
              </span>
              {opportunity.booked !== null &&
                opportunity.capacityTEU &&
                opportunity.capacityTEU > 0 && (
                  <span style={{ fontSize: 10, color: '#666', marginLeft: 'auto' }}>
                    ({Math.round((opportunity.booked / opportunity.capacityTEU) * 100)}%)
                  </span>
                )}
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
        ) : (
          ''
        )}
      </TableCell>
      <TableCell align="center">{opportunity.note || ''}</TableCell>
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
          : ''}
      </TableCell>
      <TableCell align="center">
        {opportunity.salesRepId
          ? `${opportunity.salesRepId.firstName} ${opportunity.salesRepId.lastName}`
          : ''}
      </TableCell>
    </TableRow>
  );
};

const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  onRowClick,
  sortConfig,
  onSort,
}) => {
  const baseOpportunities = opportunities || [];
  const displayOpportunities = sortConfig
    ? sortOpportunities(baseOpportunities, sortConfig)
    : baseOpportunities;

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
                  <SortableHeader sortKey="id" sortConfig={sortConfig} onSort={onSort}>
                    ID
                  </SortableHeader>
                  <SortableHeader sortKey="bookingParty" sortConfig={sortConfig} onSort={onSort}>
                    B/Party
                  </SortableHeader>
                  <SortableHeader
                    sortKey="statisticalClient"
                    sortConfig={sortConfig}
                    onSort={onSort}
                  >
                    S/Client
                  </SortableHeader>
                  <SortableHeader sortKey="placeOfReceipt" sortConfig={sortConfig} onSort={onSort}>
                    PLR
                  </SortableHeader>
                  <SortableHeader sortKey="portOfLoading" sortConfig={sortConfig} onSort={onSort}>
                    POL
                  </SortableHeader>
                  <SortableHeader sortKey="portOfDischarge" sortConfig={sortConfig} onSort={onSort}>
                    POD
                  </SortableHeader>
                  <SortableHeader sortKey="placeOfDelivery" sortConfig={sortConfig} onSort={onSort}>
                    PLD
                  </SortableHeader>
                  <SortableHeader sortKey="equipmentGroup" sortConfig={sortConfig} onSort={onSort}>
                    Equipment
                  </SortableHeader>
                  <SortableHeader sortKey="commodityGroup" sortConfig={sortConfig} onSort={onSort}>
                    Commodity
                  </SortableHeader>
                  <SortableHeader sortKey="quoteKind" sortConfig={sortConfig} onSort={onSort}>
                    Quote
                  </SortableHeader>
                  <SortableHeader sortKey="agreement" sortConfig={sortConfig} onSort={onSort}>
                    Agreement
                  </SortableHeader>
                  <SortableHeader sortKey="validity" sortConfig={sortConfig} onSort={onSort}>
                    Validity
                  </SortableHeader>
                  <SortableHeader sortKey="capacityTEU" sortConfig={sortConfig} onSort={onSort}>
                    Potential
                  </SortableHeader>
                  <SortableHeader sortKey="quotedProgress" sortConfig={sortConfig} onSort={onSort}>
                    Quoted
                  </SortableHeader>
                  <SortableHeader sortKey="bookedProgress" sortConfig={sortConfig} onSort={onSort}>
                    Booked
                  </SortableHeader>
                  <SortableHeader sortKey="note" sortConfig={sortConfig} onSort={onSort}>
                    Note
                  </SortableHeader>
                  <SortableHeader sortKey="tags" sortConfig={sortConfig} onSort={onSort}>
                    Tags
                  </SortableHeader>
                  <SortableHeader sortKey="salesRep" sortConfig={sortConfig} onSort={onSort}>
                    S/Rep
                  </SortableHeader>
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
