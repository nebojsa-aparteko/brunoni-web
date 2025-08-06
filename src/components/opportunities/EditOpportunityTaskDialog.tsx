import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@material-ui/core';
import UserInput from '../inputs/UserInput';
import DateInput from '../inputs/DateInput';
import useAdminUsers from '../../hooks/useAdminUsers';
import { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import UserRecord from '../../model/UserRecord';
import firebase from '../../firebase';
import { OpportunityTask } from './OpportunityTasksView';

interface EditOpportunityTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: OpportunityTask;
  onUpdate: () => void;
}

const EditOpportunityTaskDialog: React.FC<EditOpportunityTaskDialogProps> = ({
  open,
  onClose,
  task,
  onUpdate,
}) => {
  const [content, setContent] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<UserRecord | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const users = useAdminUsers(CUSTOMER_FACING_ROLES);

  useEffect(() => {
    if (open && task) {
      setContent(task.content || '');
      setAssignedTo(task.assignedToUser || null);
      setDueDate(task.dueDate || null);
      setDueDatePickerOpen(false);
    } else if (!open) {
      setContent('');
      setAssignedTo(null);
      setDueDate(null);
      setDueDatePickerOpen(false);
    }
  }, [open, task]);

  const handleUpdate = async () => {
    if (!content.trim() || !assignedTo || !dueDate || !task.id) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        content: content.trim(),
        assignedTo: assignedTo.id,
        dueDate: dueDate,
        updatedAt: new Date(),
      };

      await firebase.firestore().collection('opportunity-tasks').doc(task.id).update(updateData);
      console.debug('Updated opportunity task:', updateData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update opportunity task:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = content.trim() && assignedTo && dueDate;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Task #{task.id?.slice(-6).toUpperCase()}
        {task.opportunity && (
          <span style={{ fontSize: '0.9em', color: '#666', marginLeft: 8 }}>
            for Opportunity #{task.opportunity.opportunityId}
          </span>
        )}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Task Content"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              minRows={3}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter task description..."
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <UserInput
              label="Assigned To"
              users={users || []}
              onChange={(_, user) => setAssignedTo(user)}
              value={assignedTo}
            />
          </Grid>
          <Grid item xs={12}>
            <DateInput
              label="Due Date"
              value={dueDate}
              onChange={date => setDueDate(date)}
              open={dueDatePickerOpen}
              onOpen={() => setDueDatePickerOpen(true)}
              onClose={() => setDueDatePickerOpen(false)}
              margin="dense"
              format="dd.MM.yyyy"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          color="primary"
          variant="contained"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Updating...' : 'Update Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOpportunityTaskDialog;
