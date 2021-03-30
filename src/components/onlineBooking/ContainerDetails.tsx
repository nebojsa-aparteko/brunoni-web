import React, { useContext, useEffect, useState } from 'react';
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
  Typography,
} from '@material-ui/core';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';
import { ReactComponent as WeightIconSVG } from '../../assets/weight.svg';
import theme from '../../theme';
import { TableRowData } from '../bookingRequests/BookingRequestContainerDetails';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import { BookingRequest } from '../../model/BookingRequest';
import PickupLocations from '../../contexts/PickupLocations';
import PickupLocation from '../../model/PickupLocation';
import OOG from '../../model/OOG';
import IMO from '../../model/IMO';

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
      {(container.oog as OOG[]).map((oogItem: OOG) => (
        <TableRow>
          <TableCell className={classes.tableCellLabel}>Overdimension</TableCell>
          <Box display="flex" flexDirection="column">
            <TableCell className={classes.tableCell}>
              <Box display="flex" flexDirection="column">
                {oogItem.width && <Typography>{`OW: ${oogItem.width}`}</Typography>}
                {oogItem.height && <Typography>{`OH: ${oogItem.height}`}</Typography>}
                {oogItem.length && <Typography>{`OL: ${oogItem.length}`}</Typography>}
                {oogItem.weight && <Typography>{`OWt: ${parseFloat(oogItem.weight).toFixed(2)} KGS`}</Typography>}
              </Box>
            </TableCell>
          </Box>
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
      {(container.imo as IMO[]).map(imoItem => (
        <TableRow>
          <TableCell className={classes.tableCellLabel}>IMCO</TableCell>
          <Box display="flex" flexDirection="column">
            <TableCell className={classes.tableCell}>
              <Box display="flex" flexDirection="column">
                {imoItem.IMOClass && <Typography>{`IMO Class: ${imoItem.IMOClass}`}</Typography>}
                {imoItem.UNNumber && <Typography>{`UN Number: ${imoItem.UNNumber}`}</Typography>}
                {imoItem.PGNumber && <Typography>{`PG Number: ${imoItem.PGNumber}`}</Typography>}
              </Box>
            </TableCell>
          </Box>
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
    pickupLocations && container.pickupLocation.id
      ? pickupLocations.find(location => location.id === container.pickupLocation.id)
      : undefined,
  );

  useEffect(() => {
    setPickupLocation(
      pickupLocations && container.pickupLocation.id
        ? pickupLocations.find(location => location.id === container.pickupLocation.id)
        : undefined,
    );
  }, [container.pickupLocation.id, pickupLocations]);

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
              <TableCell className={classes.tableCell}>{`${container.quantity} x ${container.containerType
                ?.description || container.containerType?.name}`}</TableCell>
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

            {/*  {detail.Equipment && detail.Equipment[0] ? (*/}
            {/*    <EquipmentData equipment={detail.Equipment} bookingCategory={category} />*/}
            {/*  ) : null}*/}

            {/*  {isLongVersion(version) && tariffDetails && detail.Equipment && detail.Equipment[0] ? (*/}
            {/*    <CtrTariffDetails*/}
            {/*      key={`tariff-${index}`}*/}
            {/*      tariffDetails={tariffDetails}*/}
            {/*      ctrTariffs={detail.Equipment[0].CtrTariffs}*/}
            {/*      detail={detail}*/}
            {/*    />*/}
            {/*  ) : null}*/}
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
            {/*{isImport(category) ? <AdditionalCargoData detail={detail} /> : null}*/}

            {/*{detail.LocRefs.map((ref: LocRefItem, index: number) => {*/}
            {/*  if (ref.LocType === 'PICK UP' && ref.LocDate) {*/}
            {/*    return (*/}
            {container.pickupReference && (
              <TableRowData label={'Pick Up Reference'} content={container.pickupReference} />
            )}
            {container.pickupDate && (
              <TableRowData
                label={'Pick Up Date'}
                content={formatDateSafe(container.pickupDate, DateFormats.LONG).toString()}
              />
            )}
            {pickupLocation && pickupLocation.name && (
              <TableRowData label={'Pick Up Location'} content={pickupLocation.name} />
            )}
            {bookingRequest?.schedule && bookingRequest.schedule.OriginInfo.Port.PortName && (
              <TableRowData label={'Delivery Address'} content={bookingRequest.schedule.OriginInfo.Port.PortName} />
            )}

            {/*  );*/}
            {/*}*/}

            {/*if (ref.LocType === 'DELIVERY') {*/}
            {/*  return (*/}
            {/*    <Fragment key={`booking-loc-type-${index}`}>*/}
            {/*      <TableRowData label={'Delivery Reference'} content={ref.LocRef} />*/}
            {/*      <TableRowData label={'Delivery Address'} content={ref.LocDet} />*/}
            {/*    </Fragment>*/}
            {/*  );*/}
            {/*}*/}
            {/*})}*/}
            {/*{detail['VGM-PIN'] && (*/}
            {/*  <TableRowData label={'VGM Pin'} content={detail['VGM-PIN']} key={`booking-vgm-pin-type-${index}`} />*/}
            {/*)}*/}
            {container.oog && <TableRowData label={'Remarks'} content={container.oog ? 'OUT-OF-GAUGE' : 'IN-GAUGE'} />}
            {/*{arrivalItemRemark && (*/}
            {/*  <TableRowData*/}
            {/*    label={'Arrival Items Remark'}*/}
            {/*    content={detectAndInsertLink(arrivalItemRemark.RemarkTxt)}*/}
            {/*  />*/}
            {/*)}*/}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

const ContainerDetails: React.FC<Props> = ({ containers, bookingRequest }) => {
  return (
    <Grid container spacing={4}>
      {containers &&
        containers.map((container, index) => (
          <React.Fragment>
            <ContainerDetail container={container} index={index} bookingRequest={bookingRequest} />
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </React.Fragment>
        ))}
    </Grid>
  );
};

interface Props {
  containers?: any[];
  bookingRequest?: BookingRequest;
}

export default ContainerDetails;
