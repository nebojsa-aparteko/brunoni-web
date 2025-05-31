import React, { Fragment, useCallback, useMemo } from 'react';
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
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { QuoteGroup } from '../../providers/QuoteGroupsProvider';
import { useNavigate } from 'react-router-dom';
import { quoteRouteLabelDisplay } from '../../utilities/formattedPortDisplay';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/fp/invoke';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import UserRecord from '../../model/UserRecord';
import { useClientById } from '../../hooks/useClient';

const useStyles = makeStyles(() =>
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

export const ClientRequestedByLabel: React.FC<{
  userRecord: UserRecord | null | undefined;
  userId: string;
  userNameString: string;
}> = ({ userRecord, userId, userNameString }) => {
  return (
    <Typography variant="body2">
      {userId
        ? userRecord
          ? [userRecord.firstName, userRecord.lastName]
              .filter(identity)
              .map(invoke('trim'))
              .join(' ') ||
            userRecord.emailAddress ||
            userId
          : userId
        : userNameString || ' - '}
    </Typography>
  );
};

const QuoteGroupRow: React.FC<RowProps> = ({
  showCompanyInfo,
  id,
  dateIssued,
  containers,
  commodityTypes,
  quotes,
  assignedUsers,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const requestedById = quotes[0].userId;
  const requestedBy = useUserByAlphacomId(requestedById);

  const clientId = quotes[0].clientId;
  const clientUserNameString = quotes[0].userNameString;
  const client = useClientById(clientId);

  const clientInfo = useMemo(() => {
    if (!showCompanyInfo) {
      return null;
    }

    if (!client) {
      return <TableCell>{clientId}</TableCell>;
    }

    return (
      <TableCell>
        {client.name}
        <ClientRequestedByLabel
          userRecord={requestedBy}
          userId={requestedById}
          userNameString={clientUserNameString}
        />
      </TableCell>
    );
  }, [showCompanyInfo, client, requestedBy, requestedById, clientId, clientUserNameString]);

  const handleRowClick = useCallback(
    (event: React.MouseEvent<unknown>) => {
      navigate(quotes?.length > 1 ? `/quotes/groups/${id}` : `/quotes/${quotes[0].id}`);
    },
    [history, quotes, id],
  );

  return (
    <TableRow hover tabIndex={-1} className={classes.tableRow} onClick={handleRowClick} key={id}>
      {clientInfo}
      <TableCell>
        {quoteRouteLabelDisplay(quotes[0], true)}
        {!showCompanyInfo && (
          <ClientRequestedByLabel
            userRecord={requestedBy}
            userId={quotes[0].userId}
            userNameString={quotes[0].userNameString}
          />
        )}
      </TableCell>
      <TableCell>
        {uniq(quotes.map(quote => quote.carrier?.name || quote.carrier?.id)).join(', ')}
      </TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {/*TODO handle the flash of undefined text*/}
          {containers &&
            containers.map((container, index) => (
              <Grid item key={index}>
                {container && (
                  <Chip label={container.containerType?.name || container.containerType?.id} />
                )}
              </Grid>
            ))}
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container spacing={1}>
          {commodityTypes &&
            commodityTypes.map((commodityType, index) => (
              <Grid item key={index}>
                <Chip
                  label={commodityType?.name ? commodityType?.name : commodityType?.id || 'N/A'}
                />
              </Grid>
            ))}
        </Grid>
      </TableCell>
      <TableCell>{formatDate(dateIssued, 'd. MMMM')}</TableCell>
      <TableCell>
        {assignedUsers.map(user => `${user?.firstName} ${user?.lastName}`).join(',')}
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
          <TableCell>Assigned user</TableCell>
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
