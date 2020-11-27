import UserRecord, { CUSTOMER_FACING_ROLES } from '../model/UserRecord';
import UserInput from './inputs/UserInput';
import React, { useContext, useState } from 'react';
import useAdminUsers from '../hooks/useAdminUsers';
import { Box } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import PersonIcon from '@material-ui/icons/Person';
import ClearIcon from '@material-ui/icons/Clear';
import ActingAs from '../contexts/ActingAs';

interface Props {
  value?: UserRecord;
  onChange: (userRecord: UserRecord | null) => void;
}

const UserAssignment: React.FC<Props> = ({ value, onChange, ...other }) => {
  const [changeInProgress, setChangeInProgress] = useState(false);
  const [actingAs] = useContext(ActingAs);

  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);

  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-end" {...other}>
      {!changeInProgress ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {value?.firstName} {value?.lastName}
          {actingAs ? (
            <PersonIcon style={{ margin: 4 }} />
          ) : (
            <IconButton aria-label="assign" onClick={() => setChangeInProgress(true)}>
              <PersonIcon />
            </IconButton>
          )}
        </div>
      ) : (
        <Box display="flex" style={{ minWidth: '300px' }}>
          <UserInput
            label="Assigned To"
            users={assignableUsers || []}
            onChange={(_, user) => onChange(user)}
            value={value}
          />
          <IconButton aria-label="cancel" onClick={() => setChangeInProgress(false)}>
            <ClearIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default UserAssignment;
