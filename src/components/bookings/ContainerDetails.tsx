import React, { Fragment, useContext } from 'react';
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
  Theme,
  Tooltip,
  Typography,
  withStyles,
} from '@material-ui/core';
import {
  BookingCategory,
  BookingLocType,
  BookingVersion,
  CargoDetail,
  CtrTariff,
  CtrTariffDetail,
  EquipmentDetail,
  LocRefItem,
} from '../../model/Booking';
import ContainerType from '../../model/ContainerType';
import ContainerTypes from '../../contexts/ContainerTypes';
import { isImport, isLongVersion } from './BookingView';
import ImcoContainer from './ImcoContainer';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';
import { ReactComponent as WeightIconSVG } from '../../assets/weight.svg';
import theme from '../../theme';
import invoke from 'lodash/fp/invoke';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';

interface Props {
  cargoDetail: CargoDetail[];
  version: BookingVersion;
  category: BookingCategory;
  tariffDetails: CtrTariffDetail[];
}

interface TableRowProps {
  label: string;
  content: string;
}

interface ContainerDatesProps {
  equipment: EquipmentDetail;
  bookingCategory: BookingCategory;
}

interface ContainerDatesContentProps {
  firstDate: string | null;
  secondDate: string | null;
  firstLabel: string;
  secondLabel: string;
}

interface EquipmentProps {
  equipment: EquipmentDetail[];
  bookingCategory: BookingCategory;
}

interface AdditionalCargoProps {
  detail: CargoDetail;
}

interface CtrTariffProps {
  ctrTariffs: CtrTariff[] | null;
  tariffDetails: CtrTariffDetail[];
}

interface CtrTariffDetailProps {
  ctrTariffs: CtrTariff[] | null;
  tariffDetails: CtrTariffDetail[];
  type: string;
}

interface ContainerItemProps {
  detail: CargoDetail;
  index?: number;
  containerTypes: ContainerType[] | undefined;
  version: BookingVersion;
  category: BookingCategory;
  tariffDetails: CtrTariffDetail[];
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    verticalAlign: 'top',
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
  },
  tableRow: {
    verticalAlign: 'top',
    ['@media not print']: {
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

export const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    width: 'fit-content',
    fontSize: theme.typography.pxToRem(14),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

export const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
    </TableRow>
  );
};

export const ContainerDatesContent: React.FC<ContainerDatesContentProps> = ({
  firstDate,
  secondDate,
  firstLabel,
  secondLabel,
}) => {
  return (
    <Grid container>
      {firstDate ? (
        <Grid container style={{ display: 'flex', flexDirection: 'column' }}>
          <Grid container>
            <Grid item style={{ width: '75px' }}>
              {firstLabel}
            </Grid>
            <Grid item style={{ width: '80px', paddingRight: '0px' }}>
              {formatDateSafe(invoke('toDate')(firstDate), DateFormats.LONG)}
            </Grid>
          </Grid>
          {secondDate ? (
            <Grid container spacing={0}>
              <Grid item style={{ width: '75px', paddingRight: '0px' }}>
                {secondLabel}
              </Grid>
              <Grid item style={{ width: '80px' }}>
                {formatDateSafe(invoke('toDate')(secondDate), DateFormats.LONG)}
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      ) : secondDate ? (
        <Grid container spacing={1}>
          <Grid item>{secondLabel}</Grid>
          <Grid item>{formatDateSafe(invoke('toDate')(secondDate), DateFormats.LONG)}</Grid>
        </Grid>
      ) : null}
    </Grid>
  );
};

export const ContainerDates: React.FC<ContainerDatesProps> = ({ equipment, bookingCategory }) => {
  return isImport(bookingCategory) ? (
    <ContainerDatesContent
      firstDate={equipment.GateOutDate}
      firstLabel={'Gate Out:'}
      secondDate={equipment.DropOffDate}
      secondLabel={'Drop Off:'}
    />
  ) : (
    <ContainerDatesContent
      firstDate={equipment.PickUpDate}
      firstLabel={'Pick Up:'}
      secondDate={equipment.GateInDate}
      secondLabel={'Gate In:'}
    />
  );
};

export const EquipmentData: React.FC<EquipmentProps> = ({ equipment, bookingCategory }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>Containers</TableCell>
      <TableCell className={classes.tableCell}>
        {equipment.map(equipmentDetail =>
          equipmentDetail.ContainerNumber && equipmentDetail.ContainerNumber ? (
            <span>
              {equipmentDetail.GateInDate ||
              equipmentDetail.PickUpDate ||
              equipmentDetail.DropOffDate ||
              equipmentDetail.GateOutDate ? (
                <HtmlTooltip
                  title={<ContainerDates equipment={equipmentDetail} bookingCategory={bookingCategory} />}
                  placement={'right'}
                >
                  <Box style={{ width: 'fit-content' }}>{equipmentDetail.ContainerNumber}</Box>
                </HtmlTooltip>
              ) : (
                <Box style={{ width: 'fit-content' }}>{equipmentDetail.ContainerNumber}</Box>
              )}
            </span>
          ) : null,
        )}
      </TableCell>
    </TableRow>
  );
};

export const CtrTariffDetailType: React.FC<CtrTariffDetailProps> = ({ tariffDetails, ctrTariffs, type }) => {
  const classes = useStyles();
  const data =
    ctrTariffs && ctrTariffs[0] && tariffDetails && tariffDetails[0]
      ? tariffDetails.map(tariff =>
          tariff.DaysFree &&
          tariff.Txt &&
          ctrTariffs &&
          ctrTariffs.some(ctrTariff => ctrTariff.ID === tariff.ID && ctrTariff.Type === tariff.Type) ? (
            <Fragment>
              {tariff.DaysFree + ' ' + tariff.Txt}
              <br />
            </Fragment>
          ) : null,
        )
      : null;

  return ctrTariffs && ctrTariffs[0] && tariffDetails && tariffDetails[0] ? (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>{type}</TableCell>
      <TableCell className={classes.tableCell}>
        {data && !data.every(item => item === null) ? data : 'ON REQUEST'}
      </TableCell>
    </TableRow>
  ) : (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>{type}</TableCell>
      <TableCell className={classes.tableCell}>{'ON REQUEST'}</TableCell>
    </TableRow>
  );
};

export const CtrTariffDetails: React.FC<CtrTariffProps> = ({ tariffDetails, ctrTariffs }) => {
  const demDetTariffs = tariffDetails.filter(tariffDetail => tariffDetail.Type === 'DEM/DET');
  const storageTariffs = tariffDetails.filter(tariffDetail => tariffDetail.Type === 'STORAGE');
  const pluginTariffs = tariffDetails.filter(tariffDetail => tariffDetail.Type === 'PLUGIN');

  return (
    <Fragment>
      <Fragment>
        {demDetTariffs && demDetTariffs[0] ? (
          <CtrTariffDetailType tariffDetails={demDetTariffs} ctrTariffs={ctrTariffs} type={'Dem./Det. tariff'} />
        ) : (
          <CtrTariffDetailType tariffDetails={demDetTariffs} ctrTariffs={null} type={'Dem./Det. tariff'} />
        )}
      </Fragment>
      <Fragment>
        {storageTariffs && storageTariffs[0] ? (
          <CtrTariffDetailType tariffDetails={storageTariffs} ctrTariffs={ctrTariffs} type={'Storage tariff'} />
        ) : (
          <CtrTariffDetailType tariffDetails={storageTariffs} ctrTariffs={null} type={'Storage tariff'} />
        )}
      </Fragment>
      <Fragment>
        {pluginTariffs && pluginTariffs[0] ? (
          <CtrTariffDetailType tariffDetails={pluginTariffs} ctrTariffs={ctrTariffs} type={'Plug-in tariff'} />
        ) : null}
      </Fragment>
    </Fragment>
  );
};

export const AdditionalCargoData: React.FC<AdditionalCargoProps> = ({ detail }) => {
  const emptyReturnAddress = (detail.LocRefs && detail.LocRefs[0]
    ? detail.LocRefs.map(ref => (ref.LocType === BookingLocType.dropOff ? ref.LocDet : null))
    : null
  )?.join('');
  const destinationTerminal = (detail.LocRefs && detail.LocRefs[0]
    ? detail.LocRefs.map(ref => (ref.LocType === BookingLocType.gateOut ? ref.LocDet : null))
    : null
  )?.join('');

  return (
    <Fragment>
      {destinationTerminal ? <TableRowData label={'Destination Terminal'} content={destinationTerminal} /> : null}

      {detail.PINNr ? <TableRowData label={'Pin Number'} content={detail.PINNr} /> : null}

      {emptyReturnAddress ? <TableRowData label={'Empty Return Address'} content={emptyReturnAddress} /> : null}

      {detail.Stock ? <TableRowData label={'Stock'} content={detail.Stock} /> : null}

      {detail.DropOffRef ? <TableRowData label={'Drop Off Reference'} content={detail.DropOffRef} /> : null}
    </Fragment>
  );
};

const ContainerItem: React.FC<ContainerItemProps> = ({
  detail,
  containerTypes,
  index,
  version,
  category,
  tariffDetails,
}) => {
  const cont = containerTypes?.find(type => type.id === detail.CtypID);
  const classes = useStyles();

  return (
    <Fragment>
      <Typography variant="h5">{index ? `ITEM ${index + 1}` : 'ITEM 1'}</Typography>
      <Box marginTop="0em" marginBottom="2em">
        <Grid container spacing={2} style={{ paddingTop: '10px' }}>
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
                  <TableCell className={classes.tableCell}>{`${detail.CtrQuantity} x ${cont?.description ||
                    detail.CtypID}`}</TableCell>
                </TableRow>

                {detail.CommodityTXT ? (
                  <TableRow>
                    <TableCell className={classes.tableCell}>
                      <SvgIcon component={PackageIconSVG} viewBox="0 0 512 512" />
                    </TableCell>
                    <TableCell className={classes.tableCell}>{detail.CommodityTXT}</TableCell>
                  </TableRow>
                ) : null}

                {detail.CtrWeight ? (
                  <TableRow>
                    <TableCell className={classes.tableCell}>
                      <SvgIcon component={WeightIconSVG} viewBox="0 0 512 512" />
                    </TableCell>
                    <TableCell className={classes.tableCell}>{detail.CtrWeight}</TableCell>
                  </TableRow>
                ) : null}

                {detail.Temperature ? (
                  <TableRowData label={'Temperature'} content={detail.Temperature?.toUpperCase()} />
                ) : null}

                {detail.Dehumidification ? (
                  <TableRowData label={'Dehumidification'} content={detail.Dehumidification} />
                ) : null}

                {detail.Ventilation ? <TableRowData label={'Ventilation'} content={detail.Ventilation} /> : null}

                {detail.IMCO && detail.IMCOs && detail.IMCOs[0] ? <ImcoContainer IMCOs={detail.IMCOs} /> : null}

                {detail.Overdimension && <OverdimensionComponent detail={detail} />}

                {detail.Equipment && detail.Equipment[0] ? (
                  <EquipmentData equipment={detail.Equipment} bookingCategory={category} />
                ) : null}

                {isLongVersion(version) && tariffDetails && detail.Equipment && detail.Equipment[0] ? (
                  <CtrTariffDetails
                    key={`tariff-${index}`}
                    tariffDetails={tariffDetails}
                    ctrTariffs={detail.Equipment[0].CtrTariffs}
                  />
                ) : null}
              </TableBody>
            </Table>
          </Grid>

          {isLongVersion(version) ? (
            <Grid item md={7} xs={12}>
              <Table size="small" aria-label="a dense table">
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '75%' }} />
                </colgroup>
                <TableBody>
                  {isImport(category) ? <AdditionalCargoData detail={detail} /> : null}

                  {detail.LocRefs.map((ref: LocRefItem, index: number) => {
                    if (ref.LocType === 'PICK UP' && ref.LocDate) {
                      console.log('Ref', ref);
                      return (
                        <Fragment key={`booking-loc-ref-${index}`}>
                          <TableRowData label={'Pick Up Reference'} content={ref.LocRef} />
                          <TableRowData label={'Pick Up Date'} content={ref.LocDate} />
                          <TableRowData label={'Pick Up Location'} content={ref.LocDet} />
                        </Fragment>
                      );
                    }

                    if (ref.LocType === 'DELIVERY') {
                      return (
                        <Fragment key={`booking-loc-type-${index}`}>
                          <TableRowData label={'Delivery Reference'} content={ref.LocRef} />
                          <TableRowData label={'Delivery Address'} content={ref.LocDet} />
                        </Fragment>
                      );
                    }
                  })}

                  {detail.CargoDetailRermarks && (
                    <TableRowData label={'Remarks'} content={detail.CargoDetailRermarks} />
                  )}
                </TableBody>
              </Table>
            </Grid>
          ) : null}
        </Grid>
      </Box>

      <Box marginTop="2em" marginBottom="2em">
        <Divider />
      </Box>
    </Fragment>
  );
};

const ContainerDetails: React.FC<Props> = ({ cargoDetail, version, category, tariffDetails }) => {
  const containerTypes = useContext(ContainerTypes);

  return (
    <Grid item xs={12}>
      <Box marginTop="2em" marginBottom="2em">
        <Divider />
      </Box>

      {cargoDetail &&
        cargoDetail.map((cargoDetailItem, index) => (
          <ContainerItem
            key={`cargo-detail-${index}`}
            index={index}
            detail={cargoDetailItem}
            containerTypes={containerTypes}
            version={version}
            category={category}
            tariffDetails={tariffDetails}
          />
        ))}
    </Grid>
  );
};

interface Overdimension {
  detail: CargoDetail;
}

export const OverdimensionComponent: React.FC<Overdimension> = ({ detail }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>Overdimension</TableCell>
      <TableCell className={classes.tableCell}>
        {detail.Overwidth ? `OW: ${detail.Overwidth}` : ''}
        {detail.Overheight ? `OH: ${detail.Overheight}` : ''}
        {detail.Overlength ? `OL: ${detail.Overlength}` : ''}
      </TableCell>
    </TableRow>
  );
};

export default ContainerDetails;
