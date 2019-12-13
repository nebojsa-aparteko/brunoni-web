import React, { Fragment, useContext, useMemo } from 'react';
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
import UserRecords from '../../contexts/UserRecords';
import { portShortFormatLabel } from '../../utilities/formattedPortDisplay';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
      },
    },
  }),
);

interface RowProps extends QuoteGroup {
  showCompanyInfo?: boolean;
}

const QuoteGroupRow: React.FC<RowProps> = ({
  showCompanyInfo,
  id,
  dateIssued,
  origin,
  destination,
  containers,
  commodityTypes,
  quotes,
}) => {
  const classes = useStyles();

  const users = useContext(UserRecords);

  const clientInfo = useMemo(() => {
    if (!showCompanyInfo) {
      return null;
    }

    const user = users?.find(user => user.alphacomClientId === quotes[0].clientId);

    if (!user) {
      return <TableCell>{quotes[0].clientId}</TableCell>;
    }

    return <TableCell>{user.company.name}</TableCell>;
  }, [showCompanyInfo, users, quotes[0].clientId]);

  return (
    <TableRow className={classes.tableRow}>
      {clientInfo}
      <TableCell>
        {portShortFormatLabel(origin)} → {portShortFormatLabel(destination)}
      </TableCell>
      <TableCell>{uniq(quotes.map(quote => quote.carrier?.name || quote.carrier?.id)).join(', ')}</TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {/*TODO handle the flash of undefined text*/}
          {containers &&
            containers.map((container, index) => (
              <Grid item key={index}>
                {container && <Chip label={container!.containerType?.name} />}
              </Grid>
            ))}
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {commodityTypes &&
            commodityTypes.map((commodityType, index) => (
              <Grid item key={index}>
                <Chip label={commodityType?.name ? commodityType?.name : commodityType?.id} />
              </Grid>
            ))}
        </Grid>
      </TableCell>
      <TableCell>{formatDate(dateIssued, 'd. MMMM')}</TableCell>
      <TableCell align="right">
        <Button
          color="primary"
          component={RouterLink}
          size="small"
          to={quotes?.length !== 1 ? `/quotes/groups/${id}` : `/quotes/${quotes[0].id}`}
          variant="outlined"
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

interface Props {
  showCompanyInfo?: boolean;
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

const QuoteGroupsTable: React.FC<Props> = ({ showCompanyInfo, quoteGroups }) => (
  <Fragment>
    <Table>
      <TableHead>
        <TableRow>
          {showCompanyInfo && <TableCell>Client</TableCell>}
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
            <QuoteGroupRow key={quoteGroup.id} showCompanyInfo={showCompanyInfo} {...quoteGroup} />
          ))
        )}
      </TableBody>
    </Table>
  </Fragment>
);

export default QuoteGroupsTable;
