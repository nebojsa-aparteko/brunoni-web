import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { NormalizedEntityOpportunityMatch } from '../../model/Opportunity';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[50],
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
}

const ManualMatchingTable: React.FC<Props> = ({ sortConfig, onSort, opportunityMatches }) => {
  const classes = useStyles();

  console.debug('opportunityMatches', opportunityMatches);
  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} aria-label="manual matching table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headerCell}>Booking Party</TableCell>
            <TableCell className={classes.headerCell}>Agreement ID</TableCell>
            <TableCell className={classes.headerCell}>Commodity</TableCell>
            <TableCell className={classes.headerCell}>Equipment</TableCell>
            <TableCell className={classes.headerCell}>Place of Delivery</TableCell>
            <TableCell className={classes.headerCell}>Place of Receipt</TableCell>
            <TableCell className={classes.headerCell}>Port of Discharge</TableCell>
            <TableCell className={classes.headerCell}>Port of Loading</TableCell>
            <TableCell className={classes.headerCell}>Statistical Client</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {opportunityMatches && opportunityMatches.length > 0 ? (
            opportunityMatches.map((match, index) => {
              const matchData = match.entityMatchData;

              const renderArrayItems = (items: any[]) => {
                if (!items || items.length === 0) return '';
                return items.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: idx < items.length - 1 ? 4 : 0 }}>
                    {typeof item === 'object' && item.name
                      ? item.name
                      : typeof item === 'object' && item.city
                        ? item.city
                        : typeof item === 'string'
                          ? item
                          : JSON.stringify(item)}
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

              return (
                <TableRow key={`${match.entity}-${match.entityId}-${index}`}>
                  <TableCell>{renderCompanyInfo(matchData?.bookingPartyId)}</TableCell>
                  <TableCell>{matchData?.agreementId || ''}</TableCell>
                  <TableCell>{renderArrayItems(matchData?.commodity || [])}</TableCell>
                  <TableCell>{renderArrayItems(matchData?.equipment || [])}</TableCell>
                  <TableCell>{renderArrayItems(matchData?.placeOfDelivery || [])}</TableCell>
                  <TableCell>{renderArrayItems(matchData?.placeOfReceipt || [])}</TableCell>
                  <TableCell>{renderArrayItems(matchData?.portOfDischarge || [])}</TableCell>
                  <TableCell>{renderArrayItems(matchData?.portOfLoading || [])}</TableCell>
                  <TableCell>{renderCompanyInfo(matchData?.statisticalClientId)}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9}>
                <Typography variant="body1" className={classes.emptyMessage}>
                  No manual matching data available. This table will display bookings and quotes
                  matched with opportunities.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ManualMatchingTable;
