import React, { Fragment, useContext } from 'react';
import { Box, Divider, Grid, makeStyles, Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core';
import { BookingVersion, CargoDetail, LocRefItem } from '../../model/Booking';
import ContainerType from '../../model/ContainerType';
import ContainerTypes from '../../contexts/ContainerTypes';
import { isLongVersion } from './Booking';
import ImcoContainer from './ImcoContainer';

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

  return (
    <Fragment>
      <Typography variant="h5">{index ? `ITEM ${index + 1}` : 'ITEM 1'}</Typography>

      <Box marginTop="0em" marginBottom="2em">
        <Grid container spacing={0}>
          <Grid item md={5} xs={12}>
            <Table size="small" aria-label="a dense table">
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '60%' }} />
              </colgroup>
              <TableBody>
                <TableRowData
                  label={'Equipment'}
                  content={`${detail.CtrQuantity} x ${cont?.description || detail.CtypID}`}
                />

                {detail.CommodityTXT ? <TableRowData label={'Commodity'} content={detail.CommodityTXT} /> : null}

                {detail.CtrWeight ? <TableRowData label={'Weight'} content={detail.CtrWeight} /> : null}

                {detail.IMCO && detail.IMCOs ? detail.IMCOs?.map(imco => <ImcoContainer detail={imco} />) : null}
              </TableBody>
            </Table>
          </Grid>

          {isLongVersion(version) ? (
            <Grid item md={7} xs={12}>
              <Table size="small" aria-label="a dense table">
                <colgroup>
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '60%' }} />
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

                  <TableRowData label={'Dem./Det. Tariff'} content={'N/A'} />
                  <TableRowData label={'Storage Tariff'} content={'N/A'} />

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

export default ContainerDetails;
