import React, { Fragment, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles,
  Typography,
  Theme,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { NormalizedEntityOpportunityMatch, OpportunityMatchStatus } from '../../model/Opportunity';
import Port from '../../model/Port';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { NormalizedBookingQuoteMatchData } from '../../model/Opportunity';
const useStyles = makeStyles((theme: Theme) => ({
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
  emptyMessage: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface Props {
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  opportunityMatches?: NormalizedEntityOpportunityMatch[];
  onMatchOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onCreateNewOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onDiscardMatch?: (match: NormalizedEntityOpportunityMatch) => void;
  onUnmatchOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onRowClick?: (match: NormalizedEntityOpportunityMatch) => void;
}

const ManualMatchingTable: React.FC<Props> = ({
  opportunityMatches,
  onMatchOpportunity,
  onCreateNewOpportunity,
  onDiscardMatch,
  onUnmatchOpportunity,
  onRowClick,
}) => {
  console.debug('ManualMatchingTable props', {
    opportunityMatches,
    onMatchOpportunity,
    onCreateNewOpportunity,
    onDiscardMatch,
    onUnmatchOpportunity,
  });
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMatch, setSelectedMatch] = useState<NormalizedEntityOpportunityMatch | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    match: NormalizedEntityOpportunityMatch,
  ) => {
    event.stopPropagation(); // Prevent row click when clicking menu
    setAnchorEl(event.currentTarget);
    setSelectedMatch(match);
  };

  const handleRowClick = (match: NormalizedEntityOpportunityMatch) => {
    if (onRowClick) {
      onRowClick(match);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMatch(null);
  };

  const handleMatchOpportunity = () => {
    if (selectedMatch && onMatchOpportunity) {
      onMatchOpportunity(selectedMatch);
    }
    handleMenuClose();
  };

  const handleCreateNewOpportunity = () => {
    if (selectedMatch && onCreateNewOpportunity) {
      onCreateNewOpportunity(selectedMatch);
    }
    handleMenuClose();
  };

  const handleDiscardMatch = () => {
    if (selectedMatch && onDiscardMatch) {
      onDiscardMatch(selectedMatch);
    }
    handleMenuClose();
  };

  const handleUnmatchOpportunity = () => {
    if (selectedMatch && onUnmatchOpportunity) {
      onUnmatchOpportunity(selectedMatch);
    }
    handleMenuClose();
  };

  console.debug('opportunityMatches', opportunityMatches);
  return (
    <Fragment>
      {!opportunityMatches || opportunityMatches.length === 0 ? (
        <Typography variant="body1" className={classes.emptyMessage}>
          No manual matching data available. This table will display bookings and quotes matched
          with opportunities.
        </Typography>
      ) : (
        <TableContainer className={classes.container}>
          <Table
            stickyHeader
            size="small"
            aria-label="manual matching table"
            className={classes.root}
          >
            <TableHead className={classes.table}>
              <TableRow>
                <TableCell align="center" className={classes.headerCell}>
                  ID
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  B/Party
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  Agreement
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  Commodity
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  Equipment
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  PLR
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  POL
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  POD
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  PLD
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  S/Client
                </TableCell>
                <TableCell align="center" className={classes.headerCell}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.table}>
              {opportunityMatches.map((match, index) => {
                const matchData = match.entityMatchData;

                const renderEquipmentArrayItems = (items: any[]) => {
                  if (!items || items.length === 0) return '';
                  return items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 4 : 0 }}>
                      {item.value.name}
                    </div>
                  ));
                };
                const renderCommodityArrayItems = (items: any[]) => {
                  if (!items || items.length === 0) return '';
                  return items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 4 : 0 }}>
                      {item.definition.type === 'groupId'
                        ? (item.value as OpportunityCommodityGroup).name || item.value
                        : item.value}
                    </div>
                  ));
                };
                const renderPlacesArrayItems = (items: any[]) => {
                  if (!items || items.length === 0) return '';
                  return items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 4 : 0 }}>
                      aa
                      {/* {item.definition.type === 'groupId'
                        ? (item.value as OpportunityCommodityGroup).name || item.value
                        : item.value} */}
                    </div>
                  ));
                };
                const renderPortsArrayItems = (items: any[]) => {
                  if (!items || items.length === 0) return '';
                  return items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 4 : 0 }}>
                      {item.definition.type === 'groupId'
                        ? (item.value as OpportunityCommodityGroup).name || item.value
                        : item.definition.type === 'portId'
                          ? `${(item.value as Port).city} ${(item.value as Port).id}`
                          : item.value}
                    </div>
                  ));
                };

                const renderCompanyInfo = (company: any) => {
                  if (!company) return '';
                  return (
                    <div>
                      <div>{company.name || ''}</div>
                      {company.city && (
                        <div style={{ fontSize: '0.875em', color: '#666' }}>{company.city}</div>
                      )}
                    </div>
                  );
                };

                const renderEntityInfo = (item: NormalizedEntityOpportunityMatch) => {
                  if (!item) return '';
                  return (
                    <div>
                      <div>{item.entityId || ''}</div>
                      {item.entity && (
                        <div style={{ fontSize: '0.875em', color: '#666' }}>{item.entity}</div>
                      )}
                    </div>
                  );
                };

                return (
                  <TableRow
                    key={`${match.entity}-${match.entityId}-${index}`}
                    hover
                    className={classes.row}
                    tabIndex={-1}
                    onClick={() => handleRowClick(match)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell align="center">{renderEntityInfo(match)}</TableCell>
                    <TableCell align="center">
                      {renderCompanyInfo(matchData?.bookingPartyId)}
                    </TableCell>
                    <TableCell align="center">{matchData?.agreementId || ''}</TableCell>
                    <TableCell align="center">
                      {renderCommodityArrayItems(matchData?.commodity || [])}
                    </TableCell>
                    <TableCell align="center">
                      {renderEquipmentArrayItems(matchData?.equipment || [])}
                    </TableCell>
                    <TableCell align="center">
                      {renderPlacesArrayItems(matchData?.placeOfReceipt || [])}
                    </TableCell>
                    <TableCell align="center">
                      {renderPortsArrayItems(matchData?.portOfLoading || [])}
                    </TableCell>
                    <TableCell align="center">
                      {renderPortsArrayItems(matchData?.portOfDischarge || [])}
                    </TableCell>
                    <TableCell align="center">
                      {renderPlacesArrayItems(matchData?.placeOfDelivery || [])}
                    </TableCell>
                    <TableCell align="center">
                      {renderCompanyInfo(matchData?.statisticalClientId)}
                    </TableCell>
                    <TableCell align="center">
                      {(match.status === OpportunityMatchStatus.Unmatched ||
                        match.status === OpportunityMatchStatus.Matched) && (
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={e => handleMenuClick(e, match)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedMatch?.status === OpportunityMatchStatus.Unmatched && (
          <>
            <MenuItem onClick={handleMatchOpportunity}>Match Opportunity</MenuItem>
            <MenuItem onClick={handleCreateNewOpportunity}>Create New Opportunity</MenuItem>
            <MenuItem onClick={handleDiscardMatch}>Discard</MenuItem>
          </>
        )}
        {selectedMatch?.status === OpportunityMatchStatus.Matched && (
          <MenuItem onClick={handleUnmatchOpportunity}>Unmatch</MenuItem>
        )}
      </Menu>
    </Fragment>
  );
};

export default ManualMatchingTable;
