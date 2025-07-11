import Avatar from 'react-avatar';
import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Container as MUIContainer,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import formatDate from 'date-fns/format';
import theme from '../../theme';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import {
  DateFormats,
  formatDateSafe,
  formatDistanceToNowConfigured,
} from '../../utilities/formattingHelpers';
import TagsPreviewList from '../tags/TagsPreviewList';
import Tags from '../../contexts/Tags';
import { Opportunity } from '../../model/Opportunity';
import UserRecord from '../../model/UserRecord';
import Client from '../../model/Client';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles(() => ({
  button: {
    position: 'relative',
  },
  progressButton: {
    position: 'absolute',
  },
  tableRowHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    overflowY: 'hidden',
    gap: '8px',
    padding: '8px 0',
    maxWidth: '80vw',
    width: '100%',
    scrollbarWidth: 'thin',
    scrollbarColor: '#888 #f1f1f1',
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '10px',
      '&:hover': {
        background: '#555',
      },
    },
  },
  horizontalItem: {
    minWidth: '150px',
    width: 'auto',
    flex: '0 0 auto',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      minWidth: '120px',
    },
    '@media (max-width: 480px)': {
      minWidth: '100px',
    },
  },
  avatarCell: {
    textAlign: 'center',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    display: 'block',
  },
  textEmphasized: {
    textTransform: 'uppercase',
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
  actionBarGridItem: {
    marginRight: 0,
    textAlign: 'right',
  },
  divider: {
    marginTop: theme.spacing(2),
  },
  card: {
    marginTop: '1em',
    marginLeft: '1px',
    marginRight: '1px',
    marginBottom: '8px',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  compactRow: {
    padding: '12px 16px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  mainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '8px',
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
}));

interface OpportunityTableProps {
  opportunities: Opportunity[] | undefined;
  isAdmin?: boolean;
}

interface OpportunityRowProps {
  opportunity: Opportunity;
  onDetailsClick?: any;
  isAdmin?: boolean;
  preventDefaultClick?: boolean;
}

interface OpportunityDetailsDialogProps {
  isOpen: boolean;
  opportunity: Opportunity;
  handleClose: any;
}

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

export const OpportunityDetailsDialog: React.FC<OpportunityDetailsDialogProps> = ({
  isOpen,
  handleClose,
  opportunity,
}) => {
  const classes = useStyles();

  // Add safety check for undefined opportunity
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

export const OpportunityRow: React.FC<OpportunityRowProps> = ({
  isAdmin,
  opportunity,
  onDetailsClick,
  preventDefaultClick,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const availableTags = useContext(Tags);
  const [tags, setTags] = useState(
    availableTags &&
      availableTags.filter(
        tag => opportunity.tag && opportunity.tag.some(oppTag => oppTag.id === tag.id),
      ),
  );

  const handleRowClick = useCallback(
    (id: string) => {
      if (!preventDefaultClick) {
        navigate(`/opportunities/${id}`);
      }
    },
    [navigate, preventDefaultClick],
  );

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        position: 'relative',
        cursor: 'pointer',
        padding: theme.spacing(2),
        '&:hover': {
          backgroundColor: 'rgba(161,213,255,0.20) !important',
        },
        '&:focus': {
          outline: 'none',
        },
        '&:nth-of-type(even)': {
          backgroundColor: theme.palette.background.default,
        },
      },
    }),
  )(Box);

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

  return (
    <StyledTableRow tabIndex={-1} onClick={() => handleRowClick(opportunity.id)}>
      {tags && (
        <Box style={{ position: 'absolute', right: 16, top: 16 }}>
          <TagsPreviewList tags={tags} />
        </Box>
      )}

      <div className={classes.headerRow}>
        <div className={classes.mainInfo}>
          <Typography variant="h6">Opportunity {opportunity.id}</Typography>
          <Typography variant="body2" color="textSecondary">
            {opportunity.kindOfQuote} Quote • {opportunity.capacityTEU} TEU
          </Typography>
        </div>
      </div>

      <div className={classes.horizontalContainer}>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Sales Rep"
            label1={`${opportunity.sleasRep.firstName} ${opportunity.sleasRep.lastName}`}
            label2={opportunity.sleasRep.emailAddress}
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Booking Party"
            label1={opportunity.bookingParty.name}
            label2={opportunity.bookingParty.city}
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Shipper"
            label1={opportunity.shipper || 'Not specified'}
            label2=""
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Consignee"
            label1={opportunity.cosignee || 'Not specified'}
            label2=""
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Commodity Groups"
            label1={
              opportunity.commodityGroupIds?.map(group => group.name).join(', ') || 'Not specified'
            }
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Equipment Groups"
            label1={
              opportunity.equipmentGroupIds?.map(group => group.name).join(', ') || 'Not specified'
            }
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Place of Receipt"
            label1={opportunity.placeOfReceiptGroupId?.name || 'Not specified'}
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Port of Loading"
            label1={opportunity.portOfLoadingGroupId?.name || 'Not specified'}
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Port of Discharge"
            label1={opportunity.portOfDischargeGroupId?.name || 'Not specified'}
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <InfoBoxItem
            title="Place of Delivery"
            label1={opportunity.placeOfDeliveryGroupId?.name || 'Not specified'}
            gutterBottom
          />
        </div>
        <div className={classes.horizontalItem}>
          <Typography variant="body2" gutterBottom>
            Capacity Progress
          </Typography>
          <div className={classes.progress}>
            <div
              className={classes.progressBar}
              role="progressbar"
              style={{ width: `${(opportunity.capacityTEU / 1000) * 100}%` }}
            />
          </div>
          <Typography variant="subtitle2">{opportunity.capacityTEU} TEU</Typography>
        </div>
      </div>
    </StyledTableRow>
  );
};

const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities, isAdmin }) => {
  const [dialogData, setDialogData] = useState<Opportunity | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const classes = useStyles();

  // Use mock data if no opportunities provided
  const displayOpportunities = opportunities || generateMockOpportunities();

  const handleDetailsClick = useCallback(
    (event: React.MouseEvent<unknown>, opportunity: Opportunity) => {
      event.stopPropagation();
      setIsDialogOpen(true);
      setDialogData(opportunity);
    },
    [setIsDialogOpen, setDialogData],
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  return (
    <Fragment>
      {!displayOpportunities ? (
        <MUIContainer maxWidth="md">
          <Paper>
            <ChartsCircularProgress />
          </Paper>
        </MUIContainer>
      ) : (
        displayOpportunities.map(opportunity => (
          <Card id="opportunitySummaryTable" className={classes.card} key={opportunity.id}>
            <OpportunityRow
              isAdmin={isAdmin}
              opportunity={opportunity}
              onDetailsClick={(event: React.MouseEvent<unknown>) =>
                handleDetailsClick(event, opportunity)
              }
            />
          </Card>
        ))
      )}
      <OpportunityDetailsDialog
        isOpen={isDialogOpen}
        handleClose={handleDialogClose}
        opportunity={dialogData!}
      />
    </Fragment>
  );
};

export default OpportunityTable;
