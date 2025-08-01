import React, { Fragment } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { Chip, makeStyles, Theme, Tooltip, IconButton } from '@material-ui/core';
import { Notes as NotesIcon } from '@material-ui/icons';
import Avatar from 'react-avatar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { NormalizedOpportunity } from '../../model/Opportunity';
import { format } from 'date-fns';

import OpportunitiesEmptyResults from './OpportunitisEmptyResults';

const getSortValue = (opportunity: NormalizedOpportunity, key: string): any => {
  switch (key) {
    case 'id':
      return opportunity.opportunityId ? Number(opportunity.opportunityId) : 0;
    case 'salesRep':
      return opportunity.salesRepId
        ? `${opportunity.salesRepId.lastName} ${opportunity.salesRepId.firstName}`
        : '';
    case 'bookingPartyRep':
      return opportunity.bookingPartyRepId
        ? `${opportunity.bookingPartyRepId.lastName} ${opportunity.bookingPartyRepId.firstName}`
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
      return opportunity.placeOfReceipt?.definition.type === 'groupId'
        ? (typeof opportunity.placeOfReceipt.value === 'object' &&
          opportunity.placeOfReceipt.value &&
          'name' in opportunity.placeOfReceipt.value
            ? opportunity.placeOfReceipt.value.name
            : '') || ''
        : String(opportunity.placeOfReceipt?.value || '');
    case 'portOfLoading':
      return opportunity.portOfLoading?.definition.type === 'groupId'
        ? (typeof opportunity.portOfLoading.value === 'object' &&
          opportunity.portOfLoading.value &&
          'name' in opportunity.portOfLoading.value
            ? opportunity.portOfLoading.value.name
            : '') || ''
        : opportunity.portOfLoading?.definition.type === 'freeText'
          ? String(opportunity.portOfLoading?.value || '')
          : (typeof opportunity.portOfLoading?.value === 'object' &&
            opportunity.portOfLoading?.value &&
            'city' in opportunity.portOfLoading?.value
              ? opportunity.portOfLoading.value.city
              : '') || '';
    case 'portOfDischarge':
      return opportunity.portOfDischarge?.definition.type === 'groupId'
        ? (typeof opportunity.portOfDischarge.value === 'object' &&
          opportunity.portOfDischarge.value &&
          'name' in opportunity.portOfDischarge.value
            ? opportunity.portOfDischarge.value.name
            : '') || ''
        : opportunity.portOfDischarge?.definition.type === 'freeText'
          ? String(opportunity.portOfDischarge?.value || '')
          : (typeof opportunity.portOfDischarge?.value === 'object' &&
            opportunity.portOfDischarge?.value &&
            'city' in opportunity.portOfDischarge?.value
              ? opportunity.portOfDischarge.value.city
              : '') || '';
    case 'placeOfDelivery':
      return opportunity.placeOfDelivery?.definition.type === 'groupId'
        ? (typeof opportunity.placeOfDelivery.value === 'object' &&
          opportunity.placeOfDelivery.value &&
          'name' in opportunity.placeOfDelivery.value
            ? opportunity.placeOfDelivery.value.name
            : '') || ''
        : String(opportunity.placeOfDelivery?.value || '');
    case 'commodityGroup':
      return opportunity.commodity?.definition.type === 'groupId'
        ? (typeof opportunity.commodity.value === 'object' &&
          opportunity.commodity.value &&
          'name' in opportunity.commodity.value
            ? opportunity.commodity.value.name
            : '') || ''
        : String(opportunity.commodity?.value || '');
    case 'equipmentGroup':
      return opportunity.equipment?.definition.type === 'groupId'
        ? (typeof opportunity.equipment?.value === 'object' &&
          opportunity.equipment?.value &&
          'name' in opportunity.equipment?.value
            ? opportunity.equipment.value.name
            : '') || ''
        : String(
            (typeof opportunity.equipment?.value === 'object' &&
            opportunity.equipment?.value &&
            'name' in opportunity.equipment?.value
              ? opportunity.equipment.value.name
              : opportunity.equipment?.value) || '',
          );
    case 'tags':
      return opportunity.tagIds?.length || 0;
    case 'validity':
      return opportunity.validity ? new Date(opportunity.validity).getTime() : 0;
    case 'capacityTEU':
      return opportunity.capacityTEU || 0;
    case 'quotedProgress':
      return opportunity.booked && opportunity.quoted && opportunity.capacityTEU
        ? opportunity.booked / opportunity.quoted
        : 0;
    case 'bookedProgress':
      return opportunity.bookedTEU && opportunity.capacityTEU
        ? opportunity.bookedTEU / opportunity.capacityTEU
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
  const classes = opportunityTableStyles();
  const active = sortConfig?.key === sortKey;
  const direction = active ? sortConfig.direction : 'asc';

  const handleClick = () => {
    onSort?.(sortKey);
  };

  return (
    <TableCell align="center" className={classes.headerCell}>
      <TableSortLabel active={active} direction={direction} onClick={handleClick}>
        {children}
      </TableSortLabel>
    </TableCell>
  );
};

const OpportunityTableRow: React.FC<OpportunityTableRowProps> = ({ opportunity, onRowClick }) => {
  const classes = opportunityTableStyles();

  const handleRowClick = () => {
    onRowClick?.(opportunity);
  };
  const placeOfReceipt =
    opportunity.placeOfReceipt?.definition.type === 'groupId'
      ? String(
          (typeof opportunity.placeOfReceipt.value === 'object' &&
          opportunity.placeOfReceipt.value &&
          'name' in opportunity.placeOfReceipt.value
            ? opportunity.placeOfReceipt.value.name
            : opportunity.placeOfReceipt.value) || '',
        )
      : String(opportunity.placeOfReceipt?.value || '');

  const placeOfDelivery =
    opportunity.placeOfDelivery?.definition.type === 'groupId'
      ? String(
          (typeof opportunity.placeOfDelivery.value === 'object' &&
          opportunity.placeOfDelivery.value &&
          'name' in opportunity.placeOfDelivery.value
            ? opportunity.placeOfDelivery.value.name
            : opportunity.placeOfDelivery.value) || '',
        )
      : String(opportunity.placeOfDelivery?.value || '');

  const equipment = String(opportunity.equipment?.value?.name || '');
  const commodity =
    opportunity.commodity?.definition.type === 'groupId'
      ? String(
          (typeof opportunity.commodity?.value === 'object' &&
          opportunity.commodity?.value &&
          'name' in opportunity.commodity.value
            ? opportunity.commodity.value.name
            : opportunity.commodity?.value) || '',
        )
      : String(opportunity.commodity?.value || '');

  const portOfLoading =
    opportunity.portOfLoading?.definition.type === 'freeText'
      ? String(opportunity.portOfLoading?.value || '')
      : opportunity.portOfLoading?.definition.type === 'groupId'
        ? String(
            (typeof opportunity.portOfLoading?.value === 'object' &&
            opportunity.portOfLoading?.value &&
            'name' in opportunity.portOfLoading.value
              ? opportunity.portOfLoading.value.name
              : opportunity.portOfLoading?.value) || '',
          )
        : String(
            (typeof opportunity.portOfLoading?.value === 'object' &&
            opportunity.portOfLoading?.value &&
            'city' in opportunity.portOfLoading.value
              ? opportunity.portOfLoading.value.city
              : opportunity.portOfLoading?.value) || '',
          );

  const portOfDischarge =
    opportunity.portOfDischarge?.definition.type === 'freeText'
      ? String(opportunity.portOfDischarge?.value || '')
      : opportunity.portOfDischarge?.definition.type === 'groupId'
        ? String(
            (typeof opportunity.portOfDischarge?.value === 'object' &&
            opportunity.portOfDischarge?.value &&
            'name' in opportunity.portOfDischarge.value
              ? opportunity.portOfDischarge.value.name
              : opportunity.portOfDischarge?.value) || '',
          )
        : String(
            (typeof opportunity.portOfDischarge?.value === 'object' &&
            opportunity.portOfDischarge?.value &&
            'city' in opportunity.portOfDischarge.value
              ? opportunity.portOfDischarge.value.city
              : opportunity.portOfDischarge?.value) || '',
          );

  return (
    <TableRow hover className={classes.row} tabIndex={-1} onClick={handleRowClick}>
      <TableCell component="th" scope="row" style={{ paddingLeft: 4 }}>
        {opportunity.opportunityId}
      </TableCell>
      <TableCell align="center">{opportunity.bookingPartyId?.name || ''}</TableCell>
      <TableCell align="center">
        {opportunity.bookingPartyRepId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Avatar
              name={`${opportunity.bookingPartyRepId.firstName} ${opportunity.bookingPartyRepId.lastName}`}
              title={`${opportunity.bookingPartyRepId.firstName} ${opportunity.bookingPartyRepId.lastName} ${opportunity.bookingPartyRepId.emailAddress}`}
              size="32"
              round={true}
            />
          </div>
        ) : (
          ''
        )}
      </TableCell>
      <TableCell align="center">{opportunity.statisticalClientId?.name || ''}</TableCell>
      <TableCell align="center">{placeOfReceipt || ''}</TableCell>
      <TableCell align="center">{portOfLoading || ''}</TableCell>
      <TableCell align="center">{portOfDischarge || ''}</TableCell>
      <TableCell align="center">{placeOfDelivery || ''}</TableCell>
      <TableCell align="center">{equipment || ''}</TableCell>
      <TableCell align="center">{commodity || ''}</TableCell>
      <TableCell align="center">{opportunity.quoteKind || ''}</TableCell>
      <TableCell align="center">{opportunity.agreementId || ''}</TableCell>

      <TableCell align="center">
        {opportunity.validity ? format(new Date(opportunity.validity), 'dd.MM.yyyy') : ''}
      </TableCell>
      <TableCell align="center">
        {opportunity.capacityTEU ? `${opportunity.capacityTEU} TEU` : ''}
      </TableCell>

      <TableCell align="center">
        {opportunity.capacityTEU && opportunity.capacityTEU > 0 ? (
          <div style={{ minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, marginRight: 6 }}>
                {opportunity.booked != null && opportunity.quoted != null
                  ? `${opportunity.booked} / ${opportunity.quoted}`
                  : '—'}
              </span>
              {opportunity.booked != null &&
                opportunity.quoted != null &&
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
                    opportunity.booked != null && opportunity.quoted != null
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
                {opportunity.bookedTEU != null && opportunity.capacityTEU != null
                  ? `${opportunity.bookedTEU} / ${opportunity.capacityTEU}`
                  : '—'}
              </span>
              {opportunity.bookedTEU != null &&
                opportunity.capacityTEU != null &&
                opportunity.capacityTEU > 0 && (
                  <span style={{ fontSize: 10, color: '#666', marginLeft: 'auto' }}>
                    ({Math.round((opportunity.bookedTEU / opportunity.capacityTEU) * 100)}%)
                  </span>
                )}
            </div>
            <div style={{ width: '100%', background: '#e0e0e0', borderRadius: 4, height: 8 }}>
              <div
                style={{
                  width:
                    opportunity.bookedTEU != null && opportunity.capacityTEU != null
                      ? `${Math.min((opportunity.bookedTEU / opportunity.capacityTEU) * 100, 100)}%`
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
      <TableCell align="center">
        {opportunity.note ? (
          <Tooltip
            title={opportunity.note}
            arrow
            placement="top"
            classes={{ tooltip: classes.largeTooltip }}
          >
            <IconButton size="small">
              <NotesIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          ''
        )}
      </TableCell>
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
        {opportunity.salesRepId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Avatar
              name={`${opportunity.salesRepId.firstName} ${opportunity.salesRepId.lastName}`}
              title={`${opportunity.salesRepId.firstName} ${opportunity.salesRepId.lastName} ${opportunity.salesRepId.emailAddress}`}
              size="32"
              round={true}
            />
          </div>
        ) : (
          ''
        )}
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
  const classes = opportunityTableStyles();
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
        <TableContainer className={classes.container}>
          <Table
            stickyHeader
            size="small"
            aria-label="opportunities table"
            className={classes.root}
          >
            <TableHead className={classes.table}>
              <TableRow>
                <SortableHeader sortKey="id" sortConfig={sortConfig} onSort={onSort}>
                  ID
                </SortableHeader>
                <SortableHeader sortKey="bookingParty" sortConfig={sortConfig} onSort={onSort}>
                  B/Party
                </SortableHeader>
                <SortableHeader sortKey="bookingPartyRep" sortConfig={sortConfig} onSort={onSort}>
                  B/Party Rep
                </SortableHeader>
                <SortableHeader sortKey="statisticalClient" sortConfig={sortConfig} onSort={onSort}>
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
                  <div>
                    <div>Quoted</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Booked / Quoted</div>
                  </div>
                </SortableHeader>
                <SortableHeader sortKey="bookedProgress" sortConfig={sortConfig} onSort={onSort}>
                  <div>
                    <div>Booked</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                      Booked TEU / Potential
                    </div>
                  </div>
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
            <TableBody className={classes.table}>
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
      )}
    </Fragment>
  );
};

export default OpportunityTable;

const opportunityTableStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBottom: theme.spacing(3),
  },
  row: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(161,213,255,0.20) !important',
      '& > td': {
        backgroundColor: 'inherit',
      },
    },
  },
  defaultCell: {
    border: `1px solid ${theme.palette.divider}`,
    fontSize: theme.typography.body2.fontSize,
    backgroundColor: 'white',
  },
  statusCell: {
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
    borderCollapse: 'collapse',
  },
  headerCell: {
    fontSize: theme.typography.body2.fontSize,
    backgroundColor: theme.palette.grey['100'],
  },
  cityCell: {
    fontSize: theme.typography.body2.fontSize,
  },
  borderRight: {
    borderRight: `3px solid ${theme.palette.divider}`,
  },
  tightCell: {
    lineHeight: 1,
  },
  stickySide: {
    position: 'sticky',
    left: 0,
    zIndex: 3,
  },
  hoverColorControl: {
    backgroundColor: theme.palette.background.paper,
  },
  list: {
    minWidth: '20rem',
  },
  root: {
    position: 'relative',
    left: theme.spacing(3),
    paddingRight: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
  },
  table: {},
  largeTooltip: {
    fontSize: theme.typography.body1.fontSize,
    maxWidth: 300,
  },
}));
