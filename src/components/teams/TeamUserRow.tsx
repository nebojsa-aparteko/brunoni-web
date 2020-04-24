import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React from 'react';
import UserRecord from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamsChipMultiInput from './TeamsChipMultiInput';

interface Props {
  user: UserRecord;
}

const TeamUserRow: React.FC<Props> = ({ user }) => {
  const adminUsers = useAdminUsers();
  return (
    <TableRow key={user.firstName + user.lastName}>
      <TableCell component="th" scope="row">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell align="right">{user.emailAddress}</TableCell>
      <TableCell align="right">{user.role}</TableCell>
      <TableCell align="right">
        <TeamsChipMultiInput options={adminUsers} />
      </TableCell>
      <TableCell align="right">{user.lastSession}</TableCell>
    </TableRow>
  );
};

export default TeamUserRow;
