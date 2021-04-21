import React, { useContext, useMemo, Fragment } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import { containerTypesLabels, EquipmentImportSummary, statusLabels } from '../../model/EquipmentControl';
import { Box, CircularProgress, makeStyles, Theme, Tooltip } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import EquipmentControlImportRow from './EquipmentControlImportRow';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';
import { groupBy } from 'lodash/fp';
import CountryCodes from '../../model/CountryCodes';
import clsx from 'clsx';
import truncateString from '../../utilities/truncateString';
import sortByObjectKeys from '../../utilities/sortByObjectKeys';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';

export const importFlowsStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBottom: theme.spacing(3),
  },
  row: {
    '&:hover': {
      '& > td': {
        backgroundColor: 'inherit',
      },
    },
  },
  defaultCell: {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'white',
  },
  statusCell: {
    alignItems: 'center',
    fontSize: theme.typography.caption.fontSize,
    borderCollapse: 'collapse',
  },
  headerCell: {
    fontSize: theme.typography.caption.fontSize,
    backgroundColor: theme.palette.grey['100'],
  },
  cityCell: {
    fontSize: theme.typography.caption.fontSize,
  },
  borderRight: {
    borderRight: `3px solid ${theme.palette.divider}`,
  },
  tightCell: {
    lineHeight: 1,
  },
  stickySide: {
    position: 'sticky',
    left: 0,
    zIndex: 3,
  },
  hoverColorControl: {
    backgroundColor: theme.palette.background.paper,
  },
  list: {
    minWidth: '20rem',
  },
  root: {
    position: 'relative',
    left: theme.spacing(3),
    paddingRight: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
  },
  table: {
    // overflow: 'hidden',
    //
    // '& tr': {
    //   '&:hover':{
    //     backgroundColor: '#ffa',
    //   }
    // },
    //
    // '& td': {
    //   position: 'relative',
    //
    //   '&:hover': {
    //     backgroundColor: 'red',
    //
    //     '&::after': {
    //       content: '""',
    //       position: 'absolute',
    //       backgroundColor: '#ffa',
    //       left: 0,
    //       top: -5000,
    //       height: 10000,
    //       width: '100%',
    //       zIndex: -1,
    //     }
    //   }
    // },
  },
}));

interface ImportFlowsTableProps {
  summary: EquipmentImportSummary[];
}

const ImportFlowsTable: React.FC<ImportFlowsTableProps> = ({ summary }) => {
  const classes = importFlowsStyles();
  const locations = useContext(PickupLocations);
  // const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [locations]);

  const groupedSummary = useMemo(
    () =>
      Object.entries(
        sortByObjectKeys(
          groupBy<EquipmentImportSummary>(s => {
            const location = locations?.find(loc => loc.id === get(s, 'id', '-'));
            // return `${location?.countryCode || '-'}`;
            return `${location?.countryCode || '-'}~${location?.city || '-'}`;
          })(summary),
        ) as { [key: string]: EquipmentImportSummary[] },
      ),
    [summary, locations],
  );
  // const total = useMemo(() => {
  //   return summary?.reduce((previousValue, currentValue) => {
  //     const sum = {};
  //     statusKeys.forEach(key => {
  //       set(sum, key, mergeAndSumObjects(get(previousValue, key), get(currentValue, key)));
  //     });
  //     return sum;
  //   }, {});
  // }, [summary]);
  return !groupedSummary ? (
    <Box minHeight="40vh" p={3} width={1} display="flex" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  ) : groupedSummary.length === 0 ? (
    <BookingsEmptyResults message={'No equipment control found for your filter criteria. Try changing filters.'} />
  ) : (
    <TableContainer className={classes.container}>
      <Table stickyHeader size="small" aria-label="a dense table" className={classes.root}>
        <TableHead className={classes.table}>
          <TableRow>
            <TableCell rowSpan={2} />
            <TableCell rowSpan={2} className={clsx([classes.stickySide, classes.headerCell, classes.borderRight])}>
              Depot Location
            </TableCell>
            {statusLabels.map((status, index) => (
              <TableCell key={index} colSpan={8} className={clsx(classes.statusCell, classes.borderRight)}>
                {status}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {statusLabels.map(() =>
              containerTypesLabels.map((label, index) => (
                <TableCell
                  key={index}
                  size="small"
                  className={clsx(classes.statusCell, {
                    [classes.borderRight]: containerTypesLabels.length === index + 1,
                  })}
                >
                  {label}
                </TableCell>
              )),
            )}
          </TableRow>
        </TableHead>

        <TableBody className={classes.table}>
          {groupedSummary.length !== 0 &&
            groupedSummary.map(([id, group]) => {
              const [countryCode, city] = id.split('~');
              return (
                <Fragment key={id}>
                  <TableRow>
                    <TableCell
                      style={{ paddingTop: 2, paddingBottom: 2, fontWeight: 'bold' }}
                      colSpan={statusLabels.length * containerTypesLabels.length + 2}
                      className={clsx([classes.headerCell, classes.borderRight, classes.tightCell])}
                    >
                      {get(CountryCodes, countryCode, '-')}
                    </TableCell>
                  </TableRow>
                  {group?.map((equipment, index) => (
                    <TableRow key={equipment.id} hover className={classes.row}>
                      {index === 0 && (
                        <Tooltip title={city}>
                          <TableCell
                            rowSpan={group.length}
                            className={clsx([classes.borderRight, classes.cityCell])}
                            style={{ borderRightWidth: 1, whiteSpace: 'nowrap' }}
                          >
                            {truncateString(city, 7)}
                          </TableCell>
                        </Tooltip>
                      )}
                      <EquipmentControlImportRow equipmentControl={equipment} key={equipment.id} />
                    </TableRow>
                  ))}
                </Fragment>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ImportFlowsTable;
