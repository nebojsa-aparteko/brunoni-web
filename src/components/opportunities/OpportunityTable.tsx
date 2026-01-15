import React, { Fragment, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {
  Chip,
  makeStyles,
  Theme,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';
import { Notes as NotesIcon, MoreVert as MoreVertIcon } from '@material-ui/icons';
import Avatar from 'react-avatar';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { List as RVList, AutoSizer } from 'react-virtualized';
import type { ListRowRenderer, AutoSizerProps } from 'react-virtualized';

// react-virtualized's exported components are JS classes that confuse TSX typing
// create any-typed aliases for safe JSX usage
const RVAutoSizer: any = AutoSizer as any;
const RVListAny: any = RVList as any;
import { NormalizedOpportunity } from '../../model/Opportunity';
import { format } from 'date-fns';

import OpportunitiesEmptyResults from './OpportunitisEmptyResults';
import CreateOpportunityTaskDialog from './CreateOpportunityTaskDialog';

// Explicit column widths used for header cells and virtualized grid rows
const columnWidths = [
  '60px', // id
  '150px', // bookingParty
  '90px', // bookingPartyRep
  '150px', // statisticalClient
  '120px', // placeOfReceipt
  '120px', // portOfLoading
  '120px', // portOfDischarge
  '120px', // placeOfDelivery
  '120px', // equipment
  '120px', // commodity
  '120px', // quoteKind
  '120px', // agreement
  '120px', // validity
  '100px', // capacityTEU
  '120px', // quotedProgress
  '120px', // bookedProgress
  '40px', // note
  '300px', // tags
  '90px', // salesRep
  '80px', // actions
];
const gridTemplate = columnWidths.join(' ');

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
          ? String(opportunity.portOfLoading.value || '')
          : (typeof opportunity.portOfLoading?.value === 'object' &&
            opportunity.portOfLoading.value &&
            'city' in opportunity.portOfLoading.value
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
  editOpportunity?: (opportunity: NormalizedOpportunity) => void;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

interface OpportunityTableRowProps {
  opportunity: NormalizedOpportunity;
  editOpportunity?: (opportunity: NormalizedOpportunity) => void;
}

interface SortableHeaderProps {
  sortKey: string;
  children: React.ReactNode;
  sortConfig?: SortConfig;
  isActive?: boolean;
  onSort?: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  sortKey,
  children,
  sortConfig,
  isActive = false,
  onSort,
}) => {
  const classes = opportunityTableStyles({});

  const active = sortConfig?.key === sortKey;
  if (isActive && !active) {
    onSort?.(sortKey);
  }
  const direction = active ? sortConfig?.direction : 'asc';

  const handleClick = () => {
    onSort?.(sortKey);
  };

  return (
    <TableCell
      align="center"
      className={classes.headerCell}
      style={(children as any)?.props?.style || undefined}
    >
      <TableSortLabel active={active} direction={direction} onClick={handleClick}>
        {children}
      </TableSortLabel>
    </TableCell>
  );
};

const OpportunityTableRow: React.FC<OpportunityTableRowProps> = ({
  opportunity,
  editOpportunity,
}) => {
  const classes = opportunityTableStyles({});
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateTaskClick = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setCreateTaskDialogOpen(true);
    handleMenuClose();
  };

  const handleOpportunityEdit = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    editOpportunity?.(opportunity);
    handleMenuClose();
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

  // Render row children only; the outer virtualized wrapper provides the grid template
  // Return a Fragment so the children become direct grid items of the outer grid container.
  // The outer container (in the virtualized rowRenderer) will handle hover and click.
  return (
    <>
      <div style={{ paddingLeft: 4, textAlign: 'left' }}>{opportunity.opportunityId}</div>
      <div style={{ textAlign: 'center' }}>{opportunity.bookingPartyId?.name || ''}</div>
      <div style={{ textAlign: 'center' }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>{opportunity.statisticalClientId?.name || ''}</div>
      <div style={{ textAlign: 'center' }}>{placeOfReceipt || ''}</div>
      <div style={{ textAlign: 'center' }}>{portOfLoading || ''}</div>
      <div style={{ textAlign: 'center' }}>{portOfDischarge || ''}</div>
      <div style={{ textAlign: 'center' }}>{placeOfDelivery || ''}</div>
      <div style={{ textAlign: 'center' }}>{equipment || ''}</div>
      <div style={{ textAlign: 'center' }}>{commodity || ''}</div>
      <div style={{ textAlign: 'center' }}>{opportunity.quoteKind || ''}</div>
      <div style={{ textAlign: 'center' }}>{opportunity.agreementId || ''}</div>

      <div style={{ textAlign: 'center' }}>
        {opportunity.validity ? format(new Date(opportunity.validity), 'dd.MM.yyyy') : ''}
      </div>
      <div style={{ textAlign: 'center' }}>
        {opportunity.capacityTEU ? `${opportunity.capacityTEU}` : ''}
      </div>

      <div style={{ textAlign: 'center' }}>
        {opportunity.capacityTEU && opportunity.capacityTEU > 0 ? (
          <div style={{ minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, width: '90%' }}>
              <span style={{ fontSize: 12, marginRight: 6 }}>
                {opportunity.booked == null || opportunity.quoted == null ? (
                  <span className={classes.skeletonLine} />
                ) : (
                  `${opportunity.booked} / ${opportunity.quoted}`
                )}
              </span>
              {opportunity.booked != null &&
                opportunity.quoted != null &&
                opportunity.quoted > 0 && (
                  <span style={{ fontSize: 10, color: '#666', marginLeft: 'auto' }}>
                    ({Math.round((opportunity.booked / opportunity.quoted) * 100)}%)
                  </span>
                )}
            </div>
            <div style={{ width: '90%', background: '#e0e0e0', borderRadius: 4, height: 8 }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>
        {opportunity.capacityTEU && opportunity.capacityTEU > 0 ? (
          <div style={{ minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, width: '90%' }}>
              <span style={{ fontSize: 12, marginRight: 6 }}>
                {opportunity.bookedTEU == null || opportunity.capacityTEU == null ? (
                  <span className={classes.skeletonLine} />
                ) : (
                  `${opportunity.bookedTEU} / ${opportunity.capacityTEU}`
                )}
              </span>
              {opportunity.bookedTEU != null &&
                opportunity.capacityTEU != null &&
                opportunity.capacityTEU > 0 && (
                  <span style={{ fontSize: 10, color: '#666', marginLeft: 'auto' }}>
                    ({Math.round((opportunity.bookedTEU / opportunity.capacityTEU) * 100)}%)
                  </span>
                )}
            </div>
            <div style={{ width: '90%', background: '#e0e0e0', borderRadius: 4, height: 8 }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>
        <Tooltip title="Actions">
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </div>
      <CreateOpportunityTaskDialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        opportunity={opportunity}
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={e => handleCreateTaskClick(e)}>Create New Task</MenuItem>
        <MenuItem onClick={e => handleOpportunityEdit(e)}>Edit Opportunity</MenuItem>
      </Menu>
    </>
  );
};

const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  editOpportunity,
  sortConfig,
  onSort,
}) => {
  const classes = opportunityTableStyles({});
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
                <TableCell colSpan={20} style={{ padding: 0, borderBottom: 'none' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: gridTemplate,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      className={classes.headerCell}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingLeft: 8,
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'id'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('id')}
                      >
                        #
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'bookingParty'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('bookingParty')}
                      >
                        B/Party
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'bookingPartyRep'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('bookingPartyRep')}
                      >
                        B/Party Rep
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'statisticalClient'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('statisticalClient')}
                      >
                        S/Client
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'placeOfReceipt'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('placeOfReceipt')}
                      >
                        PLR
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'portOfLoading'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('portOfLoading')}
                      >
                        POL
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'portOfDischarge'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('portOfDischarge')}
                      >
                        POD
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'placeOfDelivery'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('placeOfDelivery')}
                      >
                        PLD
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'equipmentGroup'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('equipmentGroup')}
                      >
                        Equipment
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'commodityGroup'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('commodityGroup')}
                      >
                        Commodity
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'quoteKind'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('quoteKind')}
                      >
                        Quote
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'agreement'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('agreement')}
                      >
                        Agreement
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'validity'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('validity')}
                      >
                        Validity
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'capacityTEU'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('capacityTEU')}
                      >
                        Potential TEU
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'quotedProgress'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('quotedProgress')}
                      >
                        <div>
                          <div>Quoted</div>
                          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                            Booked / Quoted
                          </div>
                        </div>
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'bookedProgress'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('bookedProgress')}
                      >
                        <div>
                          <div>Booked</div>
                          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                            Booked TEU / Potential
                          </div>
                        </div>
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'note'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('note')}
                      >
                        Note
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'tags'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('tags')}
                      >
                        Tags
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === 'salesRep'}
                        direction={sortConfig?.direction || 'asc'}
                        onClick={() => onSort?.('salesRep')}
                      >
                        S/Rep
                      </TableSortLabel>
                    </div>
                    <div
                      className={classes.headerCell}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Actions
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.table}>
              <TableRow>
                <TableCell colSpan={20} style={{ padding: 0, border: 'none' }}>
                  {displayOpportunities ? (
                    // Virtualized list using react-virtualized AutoSizer + List
                    <div style={{ height: 800, width: '100%' }}>
                      <RVAutoSizer disableHeight>
                        {({ width }: { width: number }) => (
                          <RVListAny
                            width={width}
                            height={800}
                            rowCount={displayOpportunities.length}
                            rowHeight={56}
                            rowRenderer={
                              (({ index, key, style }: any) => {
                                const opportunity = displayOpportunities[index];
                                // Ensure the wrapper spans full width (use measured width)
                                const rowStyle = {
                                  ...style,
                                  width: '100%',
                                  height: '100%',
                                  left: 0,
                                  display: 'block',
                                  boxSizing: 'border-box',
                                } as React.CSSProperties;

                                // Render virtualized row as a single grid container so columns line up
                                // The grid container handles hover and click; OpportunityTableRow renders direct grid items
                                return (
                                  <div key={key} style={rowStyle}>
                                    <div
                                      className={classes.row}
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: gridTemplate,
                                        alignItems: 'center',
                                        // cursor: 'pointer',
                                        height: 56,
                                      }}
                                      role="row"
                                    >
                                      <OpportunityTableRow
                                        key={opportunity.id}
                                        opportunity={opportunity}
                                        editOpportunity={editOpportunity}
                                      />
                                    </div>
                                  </div>
                                );
                              }) as ListRowRenderer
                            }
                          />
                        )}
                      </RVAutoSizer>
                    </div>
                  ) : (
                    <ChartsCircularProgress />
                  )}
                </TableCell>
              </TableRow>
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
    // cursor: 'pointer',
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
    left: 0,
    paddingRight: 0,
    paddingLeft: 0,
    margin: 0,
    border: `1px solid ${theme.palette.divider}`,
  },
  // Define the grid template used by virtualized rows and header
  __colTemplate: (props: any) => ({
    gridTemplateColumns:
      '150px 120px 120px 120px 80px 80px 80px 80px 100px 100px 80px 100px 100px 100px 120px 120px 80px 160px 120px 80px',
  }),
  table: {},
  headerCellGrid: {
    display: 'block',
    padding: theme.spacing(1),
    boxSizing: 'border-box',
  },
  largeTooltip: {
    fontSize: theme.typography.body1.fontSize,
    maxWidth: 300,
  },
  skeletonLine: {
    display: 'inline-block',
    height: 12,
    width: 48,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #eee, #f5f5f5, #eee)',
    backgroundSize: '200% 100%',
    animation: '$skeleton 1.2s ease-in-out infinite',
  },
  '@keyframes skeleton': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
}));
