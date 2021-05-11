import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Divider,
  Grid,
  makeStyles,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';
import { ReactComponent as WeightIconSVG } from '../../assets/weight.svg';
import theme from '../../theme';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import { BookingRequest } from '../../model/BookingRequest';
import PickupLocations from '../../contexts/PickupLocations';
import PickupLocation from '../../model/PickupLocation';
import OOG from '../../model/OOG';
import IMO from '../../model/IMO';
import { TableRowData } from '../bookingRequests/BookingRequestSummary';
import ContainerInput from '../inputs/ContainerInput';
import ListInput from '../inputs/ListInput';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import UserRecordContext from '../../contexts/UserRecordContext';
import { isDashboardUser } from '../../model/UserRecord';
import PortTermsInput from '../inputs/PortTermsInput';
import PortTerms from '../../contexts/PortTerms';

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    verticalAlign: 'top',
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
    maxWidth: '8em',
  },
  tableRow: {
    verticalAlign: 'top',
    '@media not print': {
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '& td': {
          display: 'block',
          padding: theme.spacing(0),
        },
      },
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
  },
  tableCell: {
    verticalAlign: 'top',
    border: 'none',
  },
}));

interface OverdimensionDetailsProps {
  container: any;
}

const OverdimensionDetails: React.FC<OverdimensionDetailsProps> = ({ container }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {(container.oog as OOG[]).map((oogItem: OOG, index) => (
        <TableRow key={`${index}:${oogItem.length}-${oogItem.width}-${oogItem.height}-${oogItem.weight}`}>
          <TableCell className={classes.tableCellLabel}>Overdimension</TableCell>
          <TableCell className={classes.tableCell}>
            <Box display="flex" flexDirection="column">
              {oogItem.width && <Typography>{`OW: ${oogItem.width}`}</Typography>}
              {oogItem.height && <Typography>{`OH: ${oogItem.height}`}</Typography>}
              {oogItem.length && <Typography>{`OL: ${oogItem.length}`}</Typography>}
              {oogItem.weight && <Typography>{`OWt: ${parseFloat(oogItem.weight).toFixed(2)} KGS`}</Typography>}
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </React.Fragment>
  );
};

interface IMCODetailsProps {
  container: any;
}

const IMCODetails: React.FC<IMCODetailsProps> = ({ container }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {(container.imo as IMO[]).map((imoItem, index) => (
        <TableRow key={`${index}:${imoItem.IMOClass}-${imoItem.PGNumber}-${imoItem.UNNumber}`}>
          <TableCell className={classes.tableCellLabel}>IMCO</TableCell>
          <TableCell className={classes.tableCell}>
            <Box display="flex" flexDirection="column">
              {imoItem.IMOClass && <Typography>{`IMO Class: ${imoItem.IMOClass}`}</Typography>}
              {imoItem.UNNumber && <Typography>{`UN Number: ${imoItem.UNNumber}`}</Typography>}
              {imoItem.PGNumber && <Typography>{`PG Number: ${imoItem.PGNumber}`}</Typography>}
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </React.Fragment>
  );
};

interface ContainerDetailProps {
  container: any;
  index: number;
  bookingRequest?: BookingRequest;
}

const ContainerDetail: React.FC<ContainerDetailProps> = ({ container, index, bookingRequest }) => {
  const classes = useStyles();
  const pickupLocations = useContext(PickupLocations);

  const [pickupLocation, setPickupLocation] = useState<PickupLocation | undefined>(
    pickupLocations && container.pickupLocation?.id
      ? pickupLocations.find(location => location.id === container.pickupLocation.id)
      : undefined,
  );

  useEffect(() => {
    setPickupLocation(
      pickupLocations && container.pickupLocation?.id
        ? pickupLocations.find(location => location.id === container.pickupLocation.id)
        : undefined,
    );
  }, [container.pickupLocation?.id, pickupLocations]);

  return (
    <Grid container item spacing={2} style={{ paddingTop: '10px' }}>
      <Grid item xs={12}>
        <Typography variant="h5">{`ITEM ${index + 1}`}</Typography>
      </Grid>
      <Grid item md={5} xs={12}>
        <Table size="small" aria-label="a dense table">
          <colgroup>
            <col style={{ width: '35%', paddingRight: theme.spacing(0) }} />
            <col style={{ width: '65%' }} />
          </colgroup>
          <TableBody>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableCell}>
                <SvgIcon component={ContainerIconSVG} viewBox="0 0 512 512" />
              </TableCell>
              <TableCell className={classes.tableCell}>
                {`${container.quantity} x ${container.containerType?.description || container.containerType?.name}`}
              </TableCell>
            </TableRow>

            {container.commodityType && container.commodityType?.name && (
              <TableRow>
                <TableCell className={classes.tableCell}>
                  <SvgIcon component={PackageIconSVG} viewBox="0 0 512 512" />
                </TableCell>
                <TableCell className={classes.tableCell}>{container.commodityType?.name}</TableCell>
              </TableRow>
            )}

            {container.weight && (
              <TableRow>
                <TableCell className={classes.tableCell}>
                  <SvgIcon component={WeightIconSVG} viewBox="0 0 512 512" />
                </TableCell>
                <TableCell className={classes.tableCell}>{container.weight.toFixed(2) + ' KGS'}</TableCell>
              </TableRow>
            )}

            {container.temperature && <TableRowData label={'Temperature'} content={container.temperature + ' °C'} />}

            {container.humidity && <TableRowData label={'Humidity'} content={container.humidity + ' %'} />}

            {container.ventilation && <TableRowData label={'Ventilation'} content={container.ventilation} />}

            {container.imo && container.imo.length > 0 && <IMCODetails container={container} />}

            {container.oog && container.oog.length > 0 && <OverdimensionDetails container={container} />}
          </TableBody>
        </Table>
      </Grid>
      <Grid item md={7} xs={12}>
        <Table size="small" aria-label="a dense table">
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '80%' }} />
          </colgroup>
          <TableBody>
            <TableRowData label={'Pick Up Reference'} content={container.pickupReference || '[To be assigned]'} />
            {container.pickupDate && (
              <TableRowData
                label={'Pick Up Date'}
                content={formatDateSafe(container.pickupDate, DateFormats.LONG).toString()}
              />
            )}
            {pickupLocation && pickupLocation.name && (
              <TableRowData label={'Pick Up Location'} content={createAddressString(pickupLocation)} />
            )}
            <TableRowData label={'Delivery Reference'} content={container.deliveryReference || '[To be assigned]'} />
            {bookingRequest?.schedule && bookingRequest.schedule.OriginInfo.Port.PortName && (
              <TableRowData label={'Delivery Address'} content={bookingRequest.schedule.OriginInfo.Port.PortName} />
            )}

            <TableRowData label={'VGM Reference'} content={container.vgmPin || '[To be assigned]'} />
            {container.oog && <TableRowData label={'Remarks'} content={container.oog ? 'OUT-OF-GAUGE' : 'IN-GAUGE'} />}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

const ContainerDetails: React.FC<Props> = ({ containers, bookingRequest, setBookingRequest, editing }) => {
  const addButton = useRef<HTMLButtonElement>();
  const listInput = useRef<unknown>();
  const terms = useContext(PortTerms);
  //TODO change the matching to ID once Norbert added that to the schedule data
  const [selectedPortTerm, setSelectedPortTerm] = useState(
    terms ? terms.find(term => term.port === bookingRequest?.schedule?.OriginInfo.Port.ID) : undefined,
  );

  useEffect(() => {
    setSelectedPortTerm(
      terms ? terms.find(term => term.port === bookingRequest?.schedule?.OriginInfo.Port.ID) : undefined,
    );
  }, [bookingRequest?.schedule?.OriginInfo.Port.ID]);

  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    bookingRequest?.schedule?.OriginInfo.Port.PortName.replaceAll('<br/>', '\n') || '',
  );

  const userRecord = useContext(UserRecordContext);

  useEffect(() => {
    setDeliveryAddress(bookingRequest?.schedule?.OriginInfo.Port.PortName.replaceAll('<br/>', '\n') || '');
  }, [bookingRequest?.schedule?.OriginInfo.Port.PortName]);

  const handleChange = (value: any[] | undefined) => {
    const writableContainers = value?.map(container => {
      return {
        ...container,
        imo: container.imo && container.imo.length > 1 ? container.imo[1] : null,
        oog: container.oog && container.oog.length > 1 ? container.oog[1] : null,
        pickupDate: container.pickupDate ? container.pickupDate : new Date(),
      };
    });
    setBookingRequest && setBookingRequest({ ...bookingRequest, containers: writableContainers } as BookingRequest);
  };

  const handleAddressTextChange = (v: string | undefined) => {
    setDeliveryAddress(v || '');
  };

  const handleAddressChange = (v: string | undefined) => {
    const newAddress = {
      ...bookingRequest,
      schedule: {
        ...bookingRequest?.schedule,
        OriginInfo: {
          ...bookingRequest?.schedule?.OriginInfo,
          Port: {
            ...bookingRequest?.schedule?.OriginInfo.Port,
            PortName: v?.replaceAll('\n', '<br/>'),
          },
        },
      },
    } as BookingRequest;
    omitEmptyDeep(newAddress);
    setBookingRequest && setBookingRequest(newAddress);
  };

  return (
    <Grid container spacing={4}>
      {editing ? (
        <Box p={1} display="flex" flexDirection="column">
          <Grid container direction="column" spacing={1}>
            <Grid item md={3} xs={12}>
              <PortTermsInput
                value={selectedPortTerm}
                onChange={term => {
                  handleAddressChange(term.address);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Delivery Address"
                variant="outlined"
                margin="dense"
                rows={5}
                multiline
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={deliveryAddress}
                onChange={event => handleAddressTextChange(event.target.value)}
                onBlur={event => handleAddressChange(event.target.value)}
              />
            </Grid>
          </Grid>
          <ListInput
            listRef={listInput}
            addButtonRef={addButton}
            ItemInput={ContainerInput}
            ItemInputProps={{
              showLocations: true,
              isDetailedInput: true,
              shouldShowAllDepots: isDashboardUser(userRecord),
            }}
            addText="Add Container"
            defaultItemValue={{ quantity: 1, imo: [false], oog: [false] }}
            value={containers || []}
            onChange={handleChange}
          />
        </Box>
      ) : (
        containers &&
        containers.map((container, index) => (
          <React.Fragment key={container.createdAt + ' - ' + index}>
            <ContainerDetail container={container} index={index} bookingRequest={bookingRequest} />
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </React.Fragment>
        ))
      )}
    </Grid>
  );
};

interface Props {
  containers?: any[];
  bookingRequest?: BookingRequest;
  setBookingRequest?: (bookingRequest: BookingRequest) => void;
  editing?: boolean;
}

export default ContainerDetails;

const createAddressString = (object: PickupLocation) =>
  object.name +
  (object.street ? `<br/>${object.street}` : '') +
  (object.city ? `<br/>${object.city}` : '') +
  (object.city && object.countryCode ? ', ' : '') +
  `${object.countryCode || ''}`;
