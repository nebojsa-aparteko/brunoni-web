import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React from 'react';
import UserRecord from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamsChipMultiInput from './TeamsChipMultiInput';
import invoke from 'lodash/fp/invoke';
import { DateFormats } from '../../utilities/formattingHelpers';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

interface Props {
  user: UserRecord;
}

const TeamUserRow: React.FC<Props> = ({ user, ...other }) => {
  const adminUsers = useAdminUsers();
  return (
    <TableRow {...other}>
      <TableCell component="th" scope="row">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell align="right">{user.emailAddress}</TableCell>
      <TableCell align="right">{user.role}</TableCell>
      <TableCell align="right">
        <TeamsChipMultiInput options={adminUsers || []} values={user.teams || []} />
      </TableCell>
      <TableCell align="right">
        {user.lastSession ? formatDistanceToNow(invoke('toDate')(user.lastSession)) : 'never'}
      </TableCell>
    </TableRow>
  );
};

export default TeamUserRow;
