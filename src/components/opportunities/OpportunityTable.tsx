import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
import CloseIcon from '@material-ui/icons/Close';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import theme from '../../theme';
import InfoBoxItem from '../InfoBoxItem';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import TagsPreviewList from '../tags/TagsPreviewList';
import Tags from '../../contexts/Tags';
import { Opportunity } from '../../model/Opportunity';
import UserRecord from '../../model/UserRecord';
import Client from '../../model/Client';
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
            // Handle bulk actions here
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
  onSelectRow: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  onRowClick: (id: string) => void;
  handleOpenDetailsDialog: (opportunity: Opportunity) => void;
}

const OpportunityTableRow: React.FC<OpportunityTableRowProps> = ({
  opportunity,
  selected,
  onSelectRow,
  onRowClick,
  handleOpenDetailsDialog,
}) => {
  const classes = useStyles();
  const availableTags = useContext(Tags);
  const [tags, setTags] = useState(
    availableTags &&
      availableTags.filter(
        tag => opportunity.tag && opportunity.tag.some(oppTag => oppTag.id === tag.id),
      ),
  );

  useEffect(
    () =>
      setTags(
        availableTags &&
          availableTags.filter(
            tag => opportunity.tag && opportunity.tag.some(oppTag => oppTag.id === tag.id),
          ),
      ),
    [availableTags, opportunity.tag],
  );

  const handleRowClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    onRowClick(opportunity.id);
  };

  const handleDetailsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleOpenDetailsDialog(opportunity);
  };

  return (
    <TableRow
      hover
      className={classes.tableRow}
      selected={selected}
      onClick={handleRowClick}
      role="checkbox"
      aria-checked={selected}
      tabIndex={-1}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event, opportunity.id)}
          onFocus={event => event.stopPropagation()}
        />
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{opportunity.id}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{opportunity.kindOfQuote}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{opportunity.capacityTEU} TEU</Typography>
        <div className={classes.progress}>
          <div
            className={classes.progressBar}
            style={{ width: `${Math.min((opportunity.capacityTEU / 1000) * 100, 100)}%` }}
          />
        </div>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">
          {opportunity.sleasRep.firstName} {opportunity.sleasRep.lastName}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{opportunity.bookingParty.name}</Typography>
        <Typography variant="caption" color="textSecondary">
          {opportunity.bookingParty.city}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{opportunity.shipper || 'Not specified'}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{opportunity.cosignee || 'Not specified'}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">
          {opportunity.commodityGroupIds?.map(group => group.name).join(', ') || 'Not specified'}
        </Typography>
      </TableCell>
      <TableCell align="center">{tags && <TagsPreviewList tags={tags} />}</TableCell>
      <TableCell align="center">
        <Button variant="outlined" size="small" onClick={handleDetailsClick}>
          Details
        </Button>
      </TableCell>
    </TableRow>
  );
};

interface OpportunityDetailsDialogProps {
  isOpen: boolean;
  opportunity: Opportunity | undefined;
  handleClose: () => void;
}

export const OpportunityDetailsDialog: React.FC<OpportunityDetailsDialogProps> = ({
  isOpen,
  handleClose,
  opportunity,
}) => {
  const classes = useStyles();

  if (!opportunity) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-opportunity-details"
      maxWidth="md"
    >
      <span className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-opportunity-details">
          <Typography variant="h4">Opportunity {opportunity.id}</Typography>
          <Typography variant="h6">Quote Kind: {opportunity.kindOfQuote}</Typography>
          <Typography variant="h6">Capacity: {opportunity.capacityTEU} TEU</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <InfoBoxItem
                title="Sales Rep"
                label1={`${opportunity.sleasRep.firstName} ${opportunity.sleasRep.lastName}`}
                label2={opportunity.sleasRep.emailAddress}
              />
            </Grid>
            <Grid item xs={6}>
              <InfoBoxItem
                title="Booking Party"
                label1={opportunity.bookingParty.name}
                label2={opportunity.bookingParty.city}
              />
            </Grid>
            <Grid item xs={6}>
              <InfoBoxItem
                title="Shipper"
                label1={opportunity.shipper || 'Not specified'}
                label2=""
              />
            </Grid>
            <Grid item xs={6}>
              <InfoBoxItem
                title="Consignee"
                label1={opportunity.cosignee || 'Not specified'}
                label2=""
              />
            </Grid>
            <Grid item xs={12}>
              <InfoBoxItem
                title="Commodity Groups"
                label1={
                  opportunity.commodityGroupIds?.map(group => group.name).join(', ') ||
                  'Not specified'
                }
              />
            </Grid>
            <Grid item xs={12}>
              <InfoBoxItem
                title="Equipment Groups"
                label1={
                  opportunity.equipmentGroupIds?.map(group => group.name).join(', ') ||
                  'Not specified'
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
      </span>
    </Dialog>
  );
};

// Mock data generator
const generateMockOpportunities = (): Opportunity[] => {
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

    return {
      id: `opp-${index + 1}`,
      sleasRep: salesRep,
      bookingParty,
      shipper: `Shipper Company ${index + 1}`,
      cosignee: `Consignee Corp ${index + 1}`,
      kindOfQuote: quoteKinds[index % quoteKinds.length],
      capacityTEU: Math.floor(Math.random() * 1000) + 100,
    };
  });
};

interface OpportunityTableProps {
  opportunities: Opportunity[] | undefined;
  isAdmin?: boolean;
}

const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities, isAdmin }) => {
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [dialogData, setDialogData] = useState<Opportunity | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Use mock data if no opportunities provided
  const displayOpportunities = opportunities || generateMockOpportunities();

  const handleSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      const selectedIndex = selectedOpportunities.indexOf(id);
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedOpportunities, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedOpportunities.slice(1));
      } else if (selectedIndex === selectedOpportunities.length - 1) {
        newSelected = newSelected.concat(selectedOpportunities.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedOpportunities.slice(0, selectedIndex),
          selectedOpportunities.slice(selectedIndex + 1),
        );
      }

      setSelectedOpportunities(newSelected);
    },
    [selectedOpportunities],
  );

  const handleSelectDeselectAll = useCallback(() => {
    if (selectedOpportunities.length === displayOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(displayOpportunities.map(opp => opp.id));
    }
  }, [selectedOpportunities, displayOpportunities]);

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/opportunities/${id}`);
    },
    [navigate],
  );

  const handleOpenDetailsDialog = useCallback((opportunity: Opportunity) => {
    setDialogData(opportunity);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setDialogData(undefined);
  }, []);

  return (
    <Fragment>
      {displayOpportunities.length === 0 ? (
        <OpportunitiesEmptyResults
          message={'No opportunities found for your filter criteria. Try changing filters.'}
        />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedOpportunities.length}
            selectedOpportunities={selectedOpportunities}
            setSelectedOpportunities={setSelectedOpportunities}
          />
          <TableContainer component={Paper}>
            <Table aria-label="opportunities table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedOpportunities.length === displayOpportunities.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="center">Quote Kind</TableCell>
                  <TableCell align="center">Capacity</TableCell>
                  <TableCell align="center">Sales Rep</TableCell>
                  <TableCell align="center">Booking Party</TableCell>
                  <TableCell align="center">Shipper</TableCell>
                  <TableCell align="center">Consignee</TableCell>
                  <TableCell align="center">Commodity Groups</TableCell>
                  <TableCell align="center">Tags</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayOpportunities ? (
                  displayOpportunities.map(opportunity => (
                    <OpportunityTableRow
                      key={opportunity.id}
                      opportunity={opportunity}
                      selected={selectedOpportunities.includes(opportunity.id)}
                      onSelectRow={handleSelectRow}
                      onRowClick={handleRowClick}
                      handleOpenDetailsDialog={handleOpenDetailsDialog}
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
      <OpportunityDetailsDialog
        isOpen={isDialogOpen}
        handleClose={handleDialogClose}
        opportunity={dialogData}
      />
    </Fragment>
  );
};

export default OpportunityTable;
