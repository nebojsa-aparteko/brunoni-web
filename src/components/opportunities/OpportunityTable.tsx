import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import {
  Chip,
  Button,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { Opportunity } from '../../model/Opportunity';
import UserRecord from '../../model/UserRecord';
import Client from '../../model/Client';
import OpportunitiesEmptyResults from './OpportunitisEmptyResults';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityTag } from '../../model/OpportunityTag';

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

interface EnhancedTableToolbarProps {
  numSelected: number;
  selectedOpportunities: string[];
  setSelectedOpportunities: (opportunities: string[]) => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const classes = useStyles();
  const { numSelected, selectedOpportunities, setSelectedOpportunities } = props;

  return (
    <Toolbar
      className={clsx(classes.toolbarRoot, {
        [classes.toolbarHighlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.toolbarTitle} variant="subtitle1" component="div">
          {numSelected === 1
            ? `${numSelected} opportunity selected`
            : `${numSelected} opportunities selected`}
        </Typography>
      ) : (
        <Typography className={classes.toolbarTitle} variant="h5" id="tableTitle" component="div">
          Opportunities
        </Typography>
      )}
      {numSelected > 0 && (
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            console.log('Bulk action for opportunities:', selectedOpportunities);
          }}
          disabled={selectedOpportunities.length === 0}
          style={{ minWidth: 140, height: 54 }}
        >
          Process Selected
        </Button>
      )}
    </Toolbar>
  );
};

interface OpportunityTableRowProps {
  opportunity: Opportunity;
  selected: boolean;
}

const OpportunityTableRow: React.FC<OpportunityTableRowProps> = ({ opportunity, selected }) => {
  const classes = useStyles();

  const renderGroup = (group?: { name?: string; id?: string }) =>
    group ? group.name || group.id : 'Not specified';

  const renderGroups = (groups?: { name?: string; id?: string }[]) =>
    groups && groups.length > 0 ? groups.map(g => g.name || g.id).join(', ') : 'Not specified';

  return (
    <TableRow hover className={classes.tableRow} selected={selected} tabIndex={-1}>
      <TableCell padding="checkbox"></TableCell>
      <TableCell align="center">{opportunity.id}</TableCell>
      <TableCell align="center">{opportunity.kindOfQuote}</TableCell>
      <TableCell align="center">
        {opportunity.sleasRep.firstName} {opportunity.sleasRep.lastName}
      </TableCell>
      <TableCell align="center">{opportunity.bookingParty.name}</TableCell>
      <TableCell align="center">{opportunity.statClient || 'Not specified'}</TableCell>
      <TableCell align="center">{renderGroup(opportunity.placeOfReceiptGroupId)}</TableCell>
      <TableCell align="center">{renderGroup(opportunity.portOfLoadingGroupId)}</TableCell>
      <TableCell align="center">{renderGroup(opportunity.portOfDischargeGroupId)}</TableCell>
      <TableCell align="center">{renderGroup(opportunity.placeOfDeliveryGroupId)}</TableCell>
      <TableCell align="center">{renderGroups(opportunity.commodityGroupIds)}</TableCell>
      <TableCell align="center">{renderGroups(opportunity.equipmentGroupIds)}</TableCell>
      <TableCell align="center">
        {opportunity.tags && opportunity.tags.length > 0
          ? opportunity.tags.map(tag => (
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
      <TableCell align="center">{opportunity.potentialTEU} TEU</TableCell>
      <TableCell align="center">
        {opportunity.bookedTEU} / {opportunity.potentialTEU}
        <span style={{ marginLeft: 8, color: '#888' }}>
          ({(((opportunity.quotedTEU ?? 0) / opportunity.potentialTEU) * 100).toFixed(1)}%)
        </span>
        <div className={classes.progress}>
          <div
            className={classes.progressBar}
            style={{
              width: `${Math.min(((opportunity.quotedTEU ?? 0) / opportunity.potentialTEU) * 100, 100)}%`,
              backgroundColor: '#2196f3',
            }}
          />
        </div>
      </TableCell>
      <TableCell align="center">
        {opportunity.bookedTEU} / {opportunity.potentialTEU}
        <span style={{ marginLeft: 8, color: '#888' }}>
          ({(((opportunity.bookedTEU ?? 0) / opportunity.potentialTEU) * 100).toFixed(1)}%)
        </span>
        <div className={classes.progress}>
          <div
            className={classes.progressBar}
            style={{
              width: `${Math.min(((opportunity.bookedTEU ?? 0) / opportunity.potentialTEU) * 100, 100)}%`,
              backgroundColor: '#4caf50',
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

// Mock data generator
const generateMockOpportunities = (): Opportunity[] => {
  const mockPlacesGroups: OpportunityPlacesGroup[] = [
    { id: 'pr1', name: 'East Europe', places: ['Prague', 'Tallin'] },
    { id: 'pr2', name: 'Nort Africa', places: ['Cairo', 'Marrakesh'] },
  ];

  const mockPortsGroups: OpportunityPortsGroup[] = [
    { id: 'pl1', name: 'Europe', portIds: ['h1', 'h2'], portNames: ['Hamburg', 'Waltershof'] },
    { id: 'pl2', name: 'Africa', portIds: ['r1', 'r2'], portNames: ['Mogadishu', 'Freetown'] },
  ];

  const mockCommodityGroups: OpportunityCommodityGroup[] = [
    { id: 'cg1', name: 'Chemicals', commodities: ['Paint', 'Solvent'] },
    { id: 'cg2', name: 'Food', commodities: ['Wheat', 'Corn'] },
  ];

  const mockEquipmentGroups: OpportunityEquipmentGroup[] = [
    { id: 'eg1', name: 'Standard Containers', equipmentTypeId: ['20GP', '40GP'] },
    { id: 'eg2', name: 'Reefer Containers', equipmentTypeId: ['20RF', '40RF'] },
  ];

  const mockTags: OpportunityTag[] = [
    { id: 't1', tag: 'Priority' },
    { id: 't2', tag: 'Standard' },
  ];
  const salesReps: UserRecord[] = [
    {
      id: '1',
      alphacomId: 'john.smith',
      firstName: 'John',
      lastName: 'Smith',
      emailAddress: 'john.smith@company.com',
      role: 'sales',
    },
    {
      id: '2',
      alphacomId: 'sarah.johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      emailAddress: 'sarah.johnson@company.com',
      role: 'sales',
    },
    {
      id: '3',
      alphacomId: 'mike.brown',
      firstName: 'Mike',
      lastName: 'Brown',
      emailAddress: 'mike.brown@company.com',
      role: 'sales',
    },
  ];

  const clients: Client[] = [
    { id: '1', name: 'Global Trading Ltd', city: 'Hamburg', countryCode: 'DE' },
    { id: '2', name: 'Ocean Freight Co', city: 'Rotterdam', countryCode: 'NL' },
    { id: '3', name: 'Maritime Solutions', city: 'Antwerp', countryCode: 'BE' },
  ];

  const quoteKinds = ['Spot', 'Tender', 'Project'];

  return Array.from({ length: 10 }, (_, index) => {
    const salesRep = salesReps[index % salesReps.length];
    const bookingParty = clients[index % clients.length];
    const potentialTEU = Math.floor(Math.random() * 9900) + 100; // 100 - 10000
    const quotedTEU = Math.floor(Math.random() * (potentialTEU + 1)); // 0 - capacity
    const bookedTEU = Math.floor(Math.random() * (quotedTEU + 1)); // 0 - quoted

    return {
      id: `opp-${index + 1}`,
      sleasRep: salesRep,
      bookingParty,
      StatClient: `Shipper Company ${index + 1}`,
      kindOfQuote: quoteKinds[index % quoteKinds.length],
      placeOfReceiptGroupId: mockPlacesGroups[index % mockPlacesGroups.length],
      portOfLoadingGroupId: mockPortsGroups[index % mockPortsGroups.length],
      portOfDischargeGroupId: mockPortsGroups[(index + 1) % mockPortsGroups.length],
      placeOfDeliveryGroupId: mockPlacesGroups[(index + 1) % mockPlacesGroups.length],
      commodityGroupIds: [mockCommodityGroups[index % mockCommodityGroups.length]],
      equipmentGroupIds: [mockEquipmentGroups[index % mockEquipmentGroups.length]],
      tags: [mockTags[index % mockTags.length]],
      potentialTEU,
      quotedTEU,
      bookedTEU,
    };
  });
};

interface OpportunityTableProps {
  opportunities: Opportunity[] | undefined;
  isAdmin?: boolean;
}

const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities, isAdmin }) => {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  const displayOpportunities = opportunities || generateMockOpportunities();

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
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="center">Quote Kind</TableCell>
                  <TableCell align="center">Sales Rep</TableCell>
                  <TableCell align="center">Booking Party</TableCell>
                  <TableCell align="center">Statistical client</TableCell>
                  <TableCell align="center">Place of Receipt</TableCell>
                  <TableCell align="center">Port of Loading</TableCell>
                  <TableCell align="center">Port of Discharge</TableCell>
                  <TableCell align="center">Place of Delivery</TableCell>
                  <TableCell align="center">Commodity Groups</TableCell>
                  <TableCell align="center">Equipment Groups</TableCell>
                  <TableCell align="center">Tags</TableCell>
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
                      selected={selectedOpportunities.includes(opportunity.id)}
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
