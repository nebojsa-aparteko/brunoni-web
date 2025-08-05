import React, { useState, useEffect } from 'react';
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
import { NormalizedOpportunity, TaskStatus } from '../../model/Opportunity';
import firebase from '../../firebase';

interface CreateOpportunityTaskDialogProps {
  open: boolean;
  onClose: () => void;
  opportunity: NormalizedOpportunity;
}

const CreateOpportunityTaskDialog: React.FC<CreateOpportunityTaskDialogProps> = ({
  open,
  onClose,
  opportunity,
}) => {
  const [content, setContent] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<UserRecord | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const users = useAdminUsers(CUSTOMER_FACING_ROLES);

  useEffect(() => {
    if (!open) {
      setContent('');
      setAssignedTo(null);
      setDueDate(null);
      setDueDatePickerOpen(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!content.trim() || !assignedTo || !dueDate) {
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        content: content.trim(),
        assignedTo: assignedTo.id,
        dueDate: dueDate,
        status: TaskStatus.Active,
        opportunityId: opportunity.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firebase.firestore().collection('opportunity-tasks').add(taskData);
      console.debug('Created opportunity task:', taskData);
      onClose();
    } catch (error) {
      console.error('Failed to create opportunity task:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = content.trim() && assignedTo && dueDate;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task for Opportunity #{opportunity.opportunityId}</DialogTitle>
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
          onClick={handleCreate}
          color="primary"
          variant="contained"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOpportunityTaskDialog;
