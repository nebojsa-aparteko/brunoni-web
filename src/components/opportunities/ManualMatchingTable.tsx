import React, { Fragment, useState, useCallback, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  makeStyles,
  Typography,
  Theme,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Checkbox,
  Paper,
  Link,
  Chip,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { ManualMatchingTableToolbar } from './ManualMatchingTableToolbar';
import {
  NormalizedEntityOpportunityMatch,
  OpportunityMatchStatus,
  opportunityToString,
} from '../../model/Opportunity';
import Port from '../../model/Port';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import useUser from '../../hooks/useUser';
import { GlobalContext } from '../../store/GlobalStore';
import { SHOW_SUCCESS_SNACKBAR, SHOW_ERROR_SNACKBAR } from '../../store/types/globalAppState';
import useOpportunities from '../../hooks/useOpportunities';

const getSortValue = (match: NormalizedEntityOpportunityMatch, key: string): any => {
  const matchData = match.entityMatchData;

  switch (key) {
    case 'id':
      return match.entityId || '';
    case 'bookingParty':
      return matchData?.bookingPartyId?.name || '';
    case 'agreement':
      return matchData?.agreementId || '';
    case 'statisticalClient':
      return matchData?.statisticalClientId?.name || '';
    default:
      return '';
  }
};

const sortMatches = (
  matches: NormalizedEntityOpportunityMatch[],
  sortConfig: SortConfig,
): NormalizedEntityOpportunityMatch[] => {
  if (!sortConfig.key) return matches;

  return [...matches].sort((a, b) => {
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
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBottom: theme.spacing(3),
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
  entityLink: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
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
  const classes = useStyles();
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

interface Props {
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  opportunityMatches?: NormalizedEntityOpportunityMatch[];
  onMatchOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onCreateNewOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onBulkDiscardMatches?: (matchIds: string[]) => void;
  onUnmatchOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onAutoRematchOpportunity?: (match: NormalizedEntityOpportunityMatch) => void;
  onRowClick?: (match: NormalizedEntityOpportunityMatch) => void;
}

const ManualMatchingTable: React.FC<Props> = ({
  opportunityMatches,
  onMatchOpportunity,
  onCreateNewOpportunity,
  onBulkDiscardMatches,
  onUnmatchOpportunity,
  onAutoRematchOpportunity,
  onRowClick,
  sortConfig,
  onSort,
}) => {
  console.debug('ManualMatchingTable props', {
    opportunityMatches,
    onMatchOpportunity,
    onCreateNewOpportunity,
    onBulkDiscardMatches,
    onUnmatchOpportunity,
  });
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMatch, setSelectedMatch] = useState<NormalizedEntityOpportunityMatch | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    match: NormalizedEntityOpportunityMatch,
  ) => {
    event.stopPropagation(); // Prevent row click when clicking menu
    setAnchorEl(event.currentTarget);
    setSelectedMatch(match);
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

  const handleUnmatchOpportunity = () => {
    if (selectedMatch && onUnmatchOpportunity) {
      onUnmatchOpportunity(selectedMatch);
    }
    handleMenuClose();
  };

  const handleAutoRematchOpportunity = () => {
    if (selectedMatch && onAutoRematchOpportunity) {
      onAutoRematchOpportunity(selectedMatch);
    }
    handleMenuClose();
  };

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, matchId: string) => {
      event.stopPropagation();
      setSelectedMatches(prevState =>
        selectedMatches.includes(matchId)
          ? [...prevState.filter(id => id !== matchId)]
          : [...prevState, matchId],
      );
    },
    [selectedMatches],
  );

  const handleSelectDeselectAll = () => {
    if (!opportunityMatches) return;
    const matchIds = opportunityMatches.map(match => `${match.entity}-${match.entityId}`);
    if (selectedMatches.length !== matchIds.length) {
      setSelectedMatches(matchIds);
    } else {
      setSelectedMatches([]);
    }
  };

  const handleBulkDiscard = useCallback(() => {
    if (!window.confirm('Are you sure you want to discard selected entities?')) {
      return;
    }

    if (selectedMatches.length > 0 && onBulkDiscardMatches) {
      onBulkDiscardMatches(selectedMatches);
      setSelectedMatches([]);
    }
  }, [selectedMatches, onBulkDiscardMatches]);

  const [user] = useUser();
  const [, globalDispatch] = useContext(GlobalContext);
  const handleBulkAutoRematch = useCallback(
    async (selectedRows: Array<{ entity: string; entityId: string }>) => {
      console.debug('Bulk auto rematch for selected rows:', selectedRows);

      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/opportunities/process-entities`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(selectedRows),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Auto rematch request completed:', result);

        // Show success message and clear selections
        globalDispatch({
          type: SHOW_SUCCESS_SNACKBAR,
          message: `Auto rematch completed successfully for ${selectedRows.length} items`,
          duration: 3000,
        });
        setSelectedMatches([]);
      } catch (error) {
        console.error('Failed to process auto rematch:', error);
        globalDispatch({
          type: SHOW_ERROR_SNACKBAR,
          message: 'Failed to process auto rematch',
          duration: 5000,
        });
      }
    },
    [user, globalDispatch],
  );

  const getSelectedMatchObjects = useCallback(() => {
    if (!opportunityMatches) return [];
    return opportunityMatches
      .filter(match => selectedMatches.includes(`${match.entity}-${match.entityId}`))
      .map(match => ({ entity: match.entity, entityId: match.entityId }));
  }, [opportunityMatches, selectedMatches]);

  console.debug('opportunityMatches', opportunityMatches);
  const baseMatches = opportunityMatches || [];
  const displayMatches = sortConfig ? sortMatches(baseMatches, sortConfig) : baseMatches;
  const matchIds = displayMatches.map(match => `${match.entity}-${match.entityId}`);
  const opportunities = useOpportunities();

  return (
    <Fragment>
      {!opportunityMatches || opportunityMatches.length === 0 ? (
        <Typography variant="body1" className={classes.emptyMessage}>
          No manual matching data available. This table will display bookings and quotes matched
          with opportunities.
        </Typography>
      ) : (
        <Paper>
          <ManualMatchingTableToolbar
            numSelected={selectedMatches.length}
            onDiscard={handleBulkDiscard}
            onAutoRematch={handleBulkAutoRematch}
            selectedRows={getSelectedMatchObjects()}
          />
          <TableContainer className={classes.container}>
            <Table
              stickyHeader
              size="small"
              aria-label="manual matching table"
              className={classes.root}
            >
              <TableHead className={classes.table}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedMatches.length === matchIds.length && matchIds.length > 0}
                      onClick={handleSelectDeselectAll}
                      color="primary"
                    />
                  </TableCell>
                  <SortableHeader sortKey="id" sortConfig={sortConfig} onSort={onSort}>
                    ID
                  </SortableHeader>
                  <SortableHeader sortKey="bookingParty" sortConfig={sortConfig} onSort={onSort}>
                    B/Party
                  </SortableHeader>
                  <SortableHeader sortKey="agreement" sortConfig={sortConfig} onSort={onSort}>
                    Agreement
                  </SortableHeader>
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
                  <SortableHeader
                    sortKey="statisticalClient"
                    sortConfig={sortConfig}
                    onSort={onSort}
                  >
                    S/Client
                  </SortableHeader>
                  <TableCell align="center" className={classes.headerCell}>
                    Match status
                  </TableCell>
                  <TableCell align="center" className={classes.headerCell}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className={classes.table}>
                {displayMatches.map((match, index) => {
                  const matchData = match.entityMatchData;

                  const renderEquipmentArrayItems = (items: any[]) => {
                    if (!items || items.length === 0) return '';

                    const visibleItems = items.slice(0, 2);
                    const remainingItems = items.slice(2);

                    return (
                      <div>
                        {visibleItems.map((item, idx) => (
                          <div
                            key={idx}
                            style={{ marginBottom: idx < visibleItems.length - 1 ? 4 : 0 }}
                          >
                            {item.value.name}
                          </div>
                        ))}
                        {remainingItems.length > 0 && (
                          <Tooltip
                            title={
                              <div>
                                {remainingItems.map((item, idx) => (
                                  <div key={idx}>{item.value.name}</div>
                                ))}
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <span style={{ color: '#666', fontSize: '0.875em', cursor: 'help' }}>
                              +{remainingItems.length} more
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    );
                  };
                  const renderCommodityArrayItems = (items: any[]) => {
                    if (!items || items.length === 0) return '';

                    const visibleItems = items.slice(0, 2);
                    const remainingItems = items.slice(2);

                    return (
                      <div>
                        {visibleItems.map((item, idx) => (
                          <div
                            key={idx}
                            style={{ marginBottom: idx < visibleItems.length - 1 ? 4 : 0 }}
                          >
                            {item.definition.type === 'groupId'
                              ? (item.value as OpportunityCommodityGroup).name || item.value
                              : item.value}
                          </div>
                        ))}
                        {remainingItems.length > 0 && (
                          <Tooltip
                            title={
                              <div>
                                {remainingItems.map((item, idx) => (
                                  <div key={idx}>
                                    {item.definition.type === 'groupId'
                                      ? (item.value as OpportunityCommodityGroup).name || item.value
                                      : item.value}
                                  </div>
                                ))}
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <span style={{ color: '#666', fontSize: '0.875em', cursor: 'help' }}>
                              +{remainingItems.length} more
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    );
                  };
                  const renderPlacesArrayItems = (items: any[]) => {
                    if (!items || items.length === 0) return '';

                    const visibleItems = items.slice(0, 2);
                    const remainingItems = items.slice(2);

                    return (
                      <div>
                        {visibleItems.map((item, idx) => (
                          <div
                            key={idx}
                            style={{ marginBottom: idx < visibleItems.length - 1 ? 4 : 0 }}
                          >
                            {item.definition.type === 'groupId'
                              ? (item.value as OpportunityCommodityGroup).name || item.value
                              : item.value}
                          </div>
                        ))}
                        {remainingItems.length > 0 && (
                          <Tooltip
                            title={
                              <div>
                                {remainingItems.map((item, idx) => (
                                  <div key={idx}>
                                    {item.definition.type === 'groupId'
                                      ? (item.value as OpportunityCommodityGroup).name || item.value
                                      : item.value}
                                  </div>
                                ))}
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <span style={{ color: '#666', fontSize: '0.875em', cursor: 'help' }}>
                              +{remainingItems.length} more
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    );
                  };
                  const renderPortsArrayItems = (items: any[]) => {
                    if (!items || items.length === 0) return '';

                    const visibleItems = items.slice(0, 2);
                    const remainingItems = items.slice(2);

                    return (
                      <div>
                        {visibleItems.map((item, idx) => (
                          <div
                            key={idx}
                            style={{ marginBottom: idx < visibleItems.length - 1 ? 4 : 0 }}
                          >
                            {item.definition.type === 'groupId'
                              ? (item.value as OpportunityCommodityGroup).name || item.value
                              : item.definition.type === 'portId'
                                ? `${(item.value as Port).city} ${(item.value as Port).id}`
                                : item.value}
                          </div>
                        ))}
                        {remainingItems.length > 0 && (
                          <Tooltip
                            title={
                              <div>
                                {remainingItems.map((item, idx) => (
                                  <div key={idx}>
                                    {item.definition.type === 'groupId'
                                      ? (item.value as OpportunityCommodityGroup).name || item.value
                                      : item.definition.type === 'portId'
                                        ? `${(item.value as Port).city} ${(item.value as Port).id}`
                                        : item.value}
                                  </div>
                                ))}
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <span style={{ color: '#666', fontSize: '0.875em', cursor: 'help' }}>
                              +{remainingItems.length} more
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    );
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

                  const renderOpportunityInfo = (opportunityId?: string) => {
                    const opportunity = opportunities?.find(op => op.id === opportunityId);
                    if (!opportunity) return '';
                    return (
                      <div>
                        <div>{opportunityToString(opportunity) || ''}</div>
                      </div>
                    );
                  };

                  const renderEntityInfo = (item: NormalizedEntityOpportunityMatch) => {
                    if (!item) return '';
                    const handleLinkClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (onRowClick) {
                        onRowClick(item);
                      }
                    };
                    return (
                      <Link
                        component="button"
                        variant="body2"
                        className={classes.entityLink}
                        onClick={handleLinkClick}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div>
                          <div>{item.entityId || ''}</div>
                          {item.entity && (
                            <div style={{ fontSize: '0.875em', color: '#666' }}>{item.entity}</div>
                          )}
                        </div>
                      </Link>
                    );
                  };

                  const matchId = `${match.entity}-${match.entityId}`;
                  const isSelected = selectedMatches.includes(matchId);

                  return (
                    <TableRow
                      key={`${match.entity}-${match.entityId}-${index}`}
                      tabIndex={-1}
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onClick={event => onSelectRow(event, matchId)}
                          color="primary"
                        />
                      </TableCell>
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
                        {match.status === OpportunityMatchStatus.Matched && (
                          <div>{renderOpportunityInfo(match.opportunityId)}</div>
                        )}
                        {match.status === OpportunityMatchStatus.Unmatched && (
                          <Chip label="Unmatched" color="secondary" size="small" />
                        )}
                        {match.status === OpportunityMatchStatus.Discarded && (
                          <Chip label="Discarded" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={e => handleMenuClick(e, match)}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedMatch?.status === OpportunityMatchStatus.Unmatched && (
          <>
            <MenuItem onClick={handleMatchOpportunity}>Match Opportunity</MenuItem>
            <MenuItem onClick={handleCreateNewOpportunity}>Create New Opportunity</MenuItem>
          </>
        )}
        {selectedMatch?.status === OpportunityMatchStatus.Matched && (
          <>
            <MenuItem onClick={handleAutoRematchOpportunity}>Auto Rematch</MenuItem>
            <MenuItem onClick={handleUnmatchOpportunity}>Unmatch</MenuItem>
          </>
        )}
        {selectedMatch?.status === OpportunityMatchStatus.Discarded && (
          <>
            <MenuItem onClick={handleUnmatchOpportunity}>Revert to Unmatched</MenuItem>
          </>
        )}
      </Menu>
    </Fragment>
  );
};

export default ManualMatchingTable;
