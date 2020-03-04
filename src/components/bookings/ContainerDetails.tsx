import React, { Fragment } from 'react';
import {
  Box,
  Divider,
  Grid,
  Typography,
  makeStyles,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@material-ui/core';
import isArray from 'lodash/fp/isArray';
import { CargoDetail, BookingVersion, LocRefItem } from '../../model/Booking';

interface Props {
  cargoDetail: CargoDetail | CargoDetail[];
  version: BookingVersion;
}

interface TableRowProps {
  label: string;
  content: string;
}

interface ContainerItemProps {
  detail: CargoDetail;
  index?: number;
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
  },
  tableRow: {
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


const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content}} />
    </TableRow>
  );
};

const ContainerItem: React.FC<ContainerItemProps> = ({ detail, index }) => {
  return (
    <Fragment>
      <Typography variant="h4">{index ? `ITEM ${index + 1}` : 'ITEM 1'}</Typography>

      <Box marginTop="2em" marginBottom="2em">
        <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Table size="small" aria-label="a dense table">
            <colgroup>
              <col style={{ width: '40%' }} />
              <col style={{ width: '60%' }} />
            </colgroup>
            <TableBody>
              <TableRowData label={'Equipment'} content={`${detail.CtrQuantity} x ${detail.CtypID}`} />

              {detail.CommodityTXT ? (
                <TableRowData label={'Commodity'} content={detail.CommodityTXT} />
              ) : null}

              {detail.CtrWeight ? (
                <TableRowData label={'Weight'} content={detail.CtrWeight} />
              ) : null}
            </TableBody>
          </Table>
        </Grid>
        <Grid item md={6} xs={12}>
          <Table size="small" aria-label="a dense table">
            <colgroup>
              <col style={{ width: '40%' }} />
              <col style={{ width: '60%' }} />
            </colgroup>
            <TableBody>
              {detail.LocRefs.LocRef.map((ref: LocRefItem) => {
                if(ref.LocType === 'PICK UP') {
                  return (
                    <Fragment>
                      <TableRowData label={'Pick Up Reference'} content={ref.LocRef} />
                      <TableRowData label={'Pick Up Date'} content={ref.LocDate} />
                      <TableRowData label={'Pick Up Location'} content={ref.LocDet} />
                    </Fragment>
                  );
                }

                if (ref.LocType === 'DELIVERY') {
                  return (
                    <Fragment>
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
      </Grid>
      </Box>

      <Box marginTop="2em" marginBottom="2em">
        <Divider />
      </Box>
    </Fragment>
  );
};

const ContainerDetails: React.FC<Props> = ({ cargoDetail, version }) => {
  return (
    <Grid item xs={12}>
      <Box marginTop="2em" marginBottom="2em">
        <Divider />
      </Box>

      {isArray(cargoDetail) ? (
        cargoDetail.map((cargoDetailItem, index) => {
          return <ContainerItem key={`cargo-detail-${index}`} index={index} detail={cargoDetailItem} />;
        })
      ) : (
        <ContainerItem detail={cargoDetail} />
      )}
    </Grid>
  );
};

export default ContainerDetails;
