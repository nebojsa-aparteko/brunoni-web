import React, { useContext, Fragment } from 'react';
import {
  Box,
  Divider,
  Grid,
  Typography,
  makeStyles,
  Table,
  TableBody,
  TableRow,
  TableCell,
  SvgIcon,
} from '@material-ui/core';
import { CargoDetail, BookingVersion, LocRefItem, EquipmentDetail, CtrTariff } from '../../model/Booking';
import ContainerType from '../../model/ContainerType';
import ContainerTypes from '../../contexts/ContainerTypes';
import { isLongVersion } from './BookingView';
import ImcoContainer from './ImcoContainer';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';
import { ReactComponent as WeightIconSVG } from '../../assets/weight.svg';
import theme from '../../theme';

interface Props {
  cargoDetail: CargoDetail[];
  version: BookingVersion;
}

interface TableRowProps {
  label: string;
  content: string;
}

interface EquipmentProps {
  equipment: EquipmentDetail[];
}

interface CtrTariffProps {
  tariff: CtrTariff;
  numberOfContainers: string;
}

interface ContainerItemProps {
  detail: CargoDetail;
  index?: number;
  containerTypes: ContainerType[] | undefined;
  version: BookingVersion;
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

export const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
    </TableRow>
  );
};

export const EquipmentData: React.FC<EquipmentProps> = ({ equipment }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>Containers</TableCell>
      <TableCell className={classes.tableCell}>
        {equipment.map(equipmentDetail =>
          equipmentDetail.ContainerNumber && equipmentDetail.ContainerNumber ? (
            <span>
              {equipmentDetail.ContainerNumber}
              <br />
            </span>
          ) : null,
        )}
      </TableCell>
    </TableRow>
  );
};

export const CtrTariffData: React.FC<CtrTariffProps> = ({ tariff, numberOfContainers }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>
        {
          {
            'DEM/DET': 'Dem./Det. tariff',
            STORAGE: 'Storage tariff',
          }[tariff.Type]
        }
      </TableCell>
      <TableCell className={classes.tableCell}>
        {tariff.Amount && tariff.Amount !== '0.00'
          ? numberOfContainers + ' x ' + tariff.Amount + ' ' + tariff.Currency
          : 'ON REQUEST'}
      </TableCell>
    </TableRow>
  );
};

const ContainerItem: React.FC<ContainerItemProps> = ({ detail, containerTypes, index, version }) => {
  const cont = containerTypes?.find(type => type.id === detail.CtypID);
  const classes = useStyles();

  return (
    <Fragment>
      <Typography variant="h5">{index ? `ITEM ${index + 1}` : 'ITEM 1'}</Typography>

      <Box marginTop="0em" marginBottom="2em">
        <Grid container spacing={1} style={{ paddingTop: '10px' }}>
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

                {detail.IMCO && detail.IMCOs && detail.IMCOs[0] ? <ImcoContainer IMCOs={detail.IMCOs} /> : null}

                {detail.Overdimension && <OverdimensionComponent detail={detail} />}

                {detail.Equipment && detail.Equipment[0] ? <EquipmentData equipment={detail.Equipment} /> : null}

                {isLongVersion(version) && detail.Equipment && detail.Equipment[0]
                  ? detail.Equipment[0].CtrTariffs && detail.Equipment[0].CtrTariffs[0]
                    ? detail.Equipment[0].CtrTariffs.map((tariff, index) => (
                        <CtrTariffData
                          key={`tarrif-${index}`}
                          tariff={tariff}
                          numberOfContainers={detail.CtrQuantity}
                        />
                      ))
                    : null
                  : null}
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
                  {detail.LocRefs.map((ref: LocRefItem, index: number) => {
                    if (ref.LocType === 'PICK UP') {
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

const ContainerDetails: React.FC<Props> = ({ cargoDetail, version }) => {
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
