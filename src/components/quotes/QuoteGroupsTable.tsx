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
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { QuoteGroup } from '../../providers/QuoteGroups';
import UserRecords from '../../contexts/UserRecords';
import { useHistory } from 'react-router';
import { quoteRouteLabelDisplay } from '../../utilities/formattedPortDisplay';
import useClients from '../../hooks/useClients';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/fp/invoke';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';

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

const QuoteGroupRow: React.FC<RowProps> = ({ showCompanyInfo, id, dateIssued, containers, commodityTypes, quotes }) => {
  const classes = useStyles();
  const users = useContext(UserRecords);
  const clients = useClients();
  const history = useHistory();

  const requestedBy = useUserByAlphacomId(quotes[0].userId);

  const client = useMemo(() => clients?.find(client => client.id === quotes[0].clientId), [
    clients,
    quotes[0].clientId,
  ]);

  const clientInfo = useMemo(() => {
    if (!showCompanyInfo) {
      return null;
    }

    if (!client) {
      return <TableCell>{quotes[0].clientId}</TableCell>;
    }

    return (
      <TableCell>
        {client.name}
        <Typography variant="body2">
          {quotes[0].userId
            ? requestedBy
              ? [requestedBy.firstName, requestedBy.lastName]
                  .filter(identity)
                  .map(invoke('trim'))
                  .join(' ') ||
                requestedBy.emailAddress ||
                quotes[0].userId
              : quotes[0].userId
            : quotes[0].userNameString || ' - '}
        </Typography>
      </TableCell>
    );
  }, [showCompanyInfo, client, quotes[0].clientId]);

  const handleRowClick = (event: React.MouseEvent<unknown>, pathToNavigate: string) => {
    history.push(pathToNavigate);
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      className={classes.tableRow}
      onClick={event =>
        handleRowClick(event, quotes?.length !== 1 ? `/quotes/groups/${id}` : `/quotes/${quotes[0].id}`)
      }
      key={id}
    >
      {clientInfo}
      <TableCell>{quoteRouteLabelDisplay(quotes[0], true)}</TableCell>
      <TableCell>{uniq(quotes.map(quote => quote.carrier?.name || quote.carrier?.id)).join(', ')}</TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {/*TODO handle the flash of undefined text*/}
          {containers &&
            containers.map((container, index) => (
              <Grid item key={index}>
                {container && <Chip label={container.containerType?.name || container.containerType?.id} />}
              </Grid>
            ))}
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {commodityTypes &&
            commodityTypes.map((commodityType, index) => (
              <Grid item key={index}>
                <Chip label={commodityType?.name ? commodityType?.name : commodityType?.id || 'N/A'} />
              </Grid>
            ))}
        </Grid>
      </TableCell>
      <TableCell>{formatDate(dateIssued, 'd. MMMM')}</TableCell>
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
