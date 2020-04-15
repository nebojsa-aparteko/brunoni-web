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
import isArray from 'lodash/fp/isArray';
import { CargoDetail, BookingVersion, LocRefItem } from '../../model/Booking';
import ContainerType from '../../model/ContainerType';
import ContainerTypes from '../../contexts/ContainerTypes';
import { isLongVersion } from './BookingView';
import ImcoContainer from './ImcoContainer';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';
import theme from '../../theme';

interface Props {
  cargoDetail: CargoDetail[];
  version: BookingVersion;
}

interface TableRowProps {
  label: string;
  content: string;
}

interface ContainerItemProps {
  detail: CargoDetail;
  index?: number;
  containerTypes: ContainerType[] | undefined;
  version: BookingVersion;
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
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

const ContainerItem: React.FC<ContainerItemProps> = ({ detail, containerTypes, index, version }) => {
  const cont = containerTypes?.find(type => type.id === detail.CtypID);
  const classes = useStyles();

  return (
    <Fragment>
      <Typography variant="h5">{index ? `ITEM ${index + 1}` : 'ITEM 1'}</Typography>

      <Box marginTop="0em" marginBottom="2em">
        <Grid container spacing={1}>
          <Grid item md={4} xs={12}>
            <Table size="small" aria-label="a dense table">
              <colgroup>
                <col style={{ width: '3%', paddingRight: theme.spacing(0) }} />
                <col style={{ width: '97%' }} />
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
                      <SvgIcon component={PackageIconSVG} viewBox="0 0 512 512" />
                    </TableCell>
                    <TableCell className={classes.tableCell}>{detail.CtrWeight}</TableCell>
                  </TableRow>
                ) : null}

                {detail.Equipment ? (
                  <TableRow>
                    <TableCell className={classes.tableCell}>
                      <SvgIcon component={PackageIconSVG} viewBox="0 0 512 512" />
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {detail.Equipment
                        ? detail.Equipment.length
                        : // detail.Equipment.map(equipmentDetail => (
                          //   equipmentDetail.ContainerNumber ? (
                          //     <div>
                          //       {equipmentDetail.ContainerNumber}
                          //     </div>
                          //   ) : null
                          // ))
                          null}
                    </TableCell>
                  </TableRow>
                ) : null}

                {/*<TableRowData label={'Containers:'} content={'N/A'} />*/}

                {isLongVersion(version) ? <TableRowData label={'Dem./Det. Tariff'} content={'N/A'} /> : null}

                {isLongVersion(version) ? <TableRowData label={'Storage Tariff'} content={'N/A'} /> : null}
              </TableBody>
            </Table>
            <span>
              {detail.IMCO && detail.IMCOs?.map(imco => <ImcoContainer detail={imco} />)}
              {detail.Overdimension && <OverdimensionComponent detail={detail} />}
            </span>
          </Grid>

          {isLongVersion(version) ? (
            <Grid item md={8} xs={12}>
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

                  <TableRowData label={'Remarks'} content={detail.CargoDetailRermarks} />
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
const OverdimensionComponent: React.FC<Overdimension> = ({ detail }) => (
  <TableRowData
    label="Overdimension"
    content={`${detail.Overwidth ? `OW: ${detail.Overwidth}` : ''}
    ${detail.Overheight ? `OH: ${detail.Overheight}` : ''}
    ${detail.Overlength ? `OL: ${detail.Overlength}` : ''}`}
  />
);

export default ContainerDetails;
