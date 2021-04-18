import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControlLabel,
  Switch,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Task from '../../model/Task';
import theme from '../../theme';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import pick from 'lodash/fp/pick';
import { UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import BookingTaskTable from '../tasks/BookingTaskTable';
import ActingAs from '../../contexts/ActingAs';

const BookingTaskExpansionPanel: React.FC<Props> = ({ tasks, updateComponent, selectedTab }) => {
  const users = useAdminUsers();
  const [assignTo, setAssignTo] = useState<UserRecordMin | undefined>(undefined);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const actingAs = useContext(ActingAs)[0];
  const [showResolved, setShowResolved] = useState(false);
  const assignUser = useCallback(
    event => {
      // console.log(tasks?.filter(task => task.selected));
      event.stopPropagation();
      selectedTasks.forEach(id => {
        const [bookingId, taskId] = id.split('/');

        firebase
          .firestore()
          .collection('bookings')
          .doc(bookingId)
          .collection('tasks')
          .doc(taskId)
          .update('assignedUser', pick(UserRecordMinProperties)(assignTo))
          .then(() => {
            updateComponent?.();
            setSelectedTasks([]);
          });
      });
    },
    [selectedTasks, assignTo, updateComponent],
  );
  const onSelectTask = useCallback(
    (id: string) =>
      setSelectedTasks(prevState =>
        selectedTasks.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      ),
    [selectedTasks],
  );
  const filteredTasks = useMemo(() => (showResolved ? tasks : tasks.filter(task => !task.resolved)), [
    showResolved,
    tasks,
  ]);
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Typography>{filteredTasks.length} Tasks</Typography>
          {!actingAs && (
            <Box display="flex" flexDirection="row">
              <Box display="flex" style={{ minWidth: theme.spacing(35) }} mr={1}>
                <UserInput
                  label="Assign task to"
                  users={users}
                  onChange={(event, user) => {
                    console.log(user);
                    setAssignTo(user || undefined);
                    event.stopPropagation();
                  }}
                  value={assignTo}
                />
              </Box>
              <Button
                color="primary"
                variant="contained"
                onClick={assignUser}
                disabled={selectedTasks && selectedTasks.length === 0}
              >
                Assign user
              </Button>
            </Box>
          )}
        </Box>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <FormControlLabel
          style={{ marginTop: '8px', marginBottom: '8px' }}
          control={
            <Switch
              checked={showResolved}
              onChange={(event, checked) => {
                event.stopPropagation();
                setShowResolved(checked);
              }}
              color="primary"
              name="showResolvedTasks"
            />
          }
          label="Show resolved tasks"
          labelPlacement="start"
        />
        <BookingTaskTable
          tasks={filteredTasks}
          selectedTasks={selectedTasks}
          onSelectTask={onSelectTask}
          tab={selectedTab}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default BookingTaskExpansionPanel;

interface Props {
  tasks: Task[];
  updateComponent?: () => void;
  selectedTab?: string;
}
