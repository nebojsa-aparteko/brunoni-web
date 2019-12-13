import React, { Fragment } from 'react';
import formatDate from 'date-fns/format';
import uniq from 'lodash/fp/uniq';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Chip,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { Skeleton } from '@material-ui/lab';
import { QuoteGroup } from '../../providers/QuoteGroups';
import { portLongFormatLabel, portShortFormatLabel } from '../../utilities/formattedPortDisplay';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
      },
    },
  }),
);

interface Props {
  quoteGroups?: QuoteGroup[] | null;
}

const QuoteGroupsBodySekeleton: React.FC = () => (
  <Fragment>
    {[...Array(6)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton width={50} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={65} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell align="right">
          <Skeleton width={64} height={29} style={{ margin: 0, float: 'right' }} />
        </TableCell>
      </TableRow>
    ))}
  </Fragment>
);

const QuoteGroupsTable: React.FC<Props> = ({ quoteGroups }) => {
  const classes = useStyles();
  return (
    <Fragment>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Route</TableCell>
            <TableCell>Carriers</TableCell>
            <TableCell>Cargo</TableCell>
            <TableCell>Commodities</TableCell>
            <TableCell>Issue Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quoteGroups === undefined || quoteGroups === null ? (
            <QuoteGroupsBodySekeleton />
          ) : (
            quoteGroups.map(quoteGroup => (
              <TableRow key={quoteGroup.id} className={classes.tableRow}>
                <TableCell>
                  {portShortFormatLabel(quoteGroup.origin)} → {portShortFormatLabel(quoteGroup.destination)}
                </TableCell>
                <TableCell>
                  {uniq(quoteGroup.quotes.map(quote => quote.carrier?.name || quote.carrier?.id)).join(', ')}
                </TableCell>
                <TableCell>
                  <Grid container spacing={1}>
                    {/*TODO handle the flash of undefined text*/}
                    {quoteGroup.containers &&
                      quoteGroup.containers.map((container, index) => (
                        <Grid item key={index}>
                          {container && <Chip label={container!.containerType?.name} />}
                        </Grid>
                      ))}
                  </Grid>
                </TableCell>
                <TableCell>
                  <Grid container spacing={1}>
                    {quoteGroup.commodityTypes &&
                      quoteGroup.commodityTypes.map((commodityType, index) => (
                        <Grid item key={index}>
                          <Chip label={commodityType?.name ? commodityType?.name : commodityType?.id} />
                        </Grid>
                      ))}
                  </Grid>
                </TableCell>
                <TableCell>{formatDate(quoteGroup.dateIssued, 'd. MMMM')}</TableCell>
                <TableCell align="right">
                  <Button
                    color="primary"
                    component={RouterLink}
                    size="small"
                    to={
                      quoteGroup.quotes?.length !== 1
                        ? `/quotes/groups/${quoteGroup.id}`
                        : `/quotes/${quoteGroup.quotes[0].id}`
                    }
                    variant="outlined"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default QuoteGroupsTable;
