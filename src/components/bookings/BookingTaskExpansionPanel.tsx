import React from 'react';
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Link,
  TableRow,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Task, { TaskDescription } from '../../model/Task';
import formatDate from 'date-fns/format';
import theme from '../../theme';

const BookingTaskExpansionPanel: React.FC<Props> = ({ tasks }) => {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography>{tasks.length} Tasks</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {tasks.map(task => (
          <TableRow
            key={task.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(1),
            }}
          >
            <Box textAlign="left" width={'30%'}>
              <Typography variant="subtitle1">{Object.values(TaskDescription)[task.type] || '-'}</Typography>
            </Box>
            <Box textAlign="center" width={'15%'}>
              <Link target="_blank" href={`/bookings/${task.bookingId}`}>
                {task.bookingId}
              </Link>
            </Box>
            <Box textAlign="center" width={'20%'}>
              {task.assignedUser?.emailAddress || '-'}
            </Box>
            <Box textAlign="center" width={'15%'}>
              {task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Box>
            <Box textAlign="center" width={'20%'}>
              <Button
                variant="outlined"
                onClick={event => {
                  event.stopPropagation();
                  // onResolve(task.bookingId, task.id);
                }}
                disabled={task.resolved}
              >
                Resolve
              </Button>
            </Box>
          </TableRow>
        ))}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default BookingTaskExpansionPanel;

interface Props {
  tasks: Task[];
}
