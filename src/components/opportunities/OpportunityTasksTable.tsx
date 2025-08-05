import React, { Fragment, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Theme,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { format } from 'date-fns';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import Avatar from 'react-avatar';
import { OpportunityTask } from './OpportunityTasksView';
import { TaskStatus } from '../../model/Opportunity';
import { withStyles, createStyles } from '@material-ui/styles';
import InfoBoxItem from '../InfoBoxItem';

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: '1em',
    marginLeft: '1px',
    marginRight: '1px',
    marginBottom: '1px',
  },
  statusContainer: {
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  statusActive: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusResolved: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
  },
  content: {
    backgroundColor: '#f8f9fa',
    padding: theme.spacing(1),
    borderRadius: '4px',
    marginBottom: theme.spacing(1),
  },
  opportunityLink: {
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
  },
}));

export const StyledTaskRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      cursor: 'default',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      '&:hover': {
        backgroundColor: 'rgba(161,213,255,0.10) !important',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:nth-of-type(even)': {
        backgroundColor: theme.palette.background.default,
      },
    },
  }),
)(Box);

interface OpportunityTaskRowProps {
  task: OpportunityTask;
  isAdmin?: boolean;
  onResolve: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const getStatusInfo = (task: OpportunityTask) => {
  if (task.status === TaskStatus.Resolved) {
    return { status: TaskStatus.Resolved, color: 'resolved' };
  }

  return { status: TaskStatus.Active, color: 'active' };
};

export const OpportunityTaskRow: React.FC<OpportunityTaskRowProps> = ({
  task,
  onResolve,
  onDelete,
}) => {
  const classes = useStyles();
  const statusInfo = getStatusInfo(task);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResolve = () => {
    if (task.id) {
      onResolve(task.id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (task.id) {
      onDelete(task.id);
    }
    handleMenuClose();
  };

  return (
    <StyledTaskRow>
      <Box display="flex" flexDirection="column" width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">
            Task #{task.id?.slice(-6).toUpperCase()}
            {task.opportunity && (
              <span style={{ marginLeft: 8, color: '#666', fontSize: '0.9em' }}>
                for Opportunity #{task.opportunity.opportunityId}
              </span>
            )}
          </Typography>
          <Box
            className={`${classes.statusContainer} ${
              statusInfo.color === 'resolved' ? classes.statusResolved : classes.statusActive
            }`}
          >
            <Typography className={classes.statusText}>
              {statusInfo.status.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.content} mb={2}>
          <Typography variant="body1">{task.content}</Typography>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          style={{ gap: 16 }}
        >
          <InfoBoxItem
            title="Assigned To"
            label1={
              task.assignedToUser ? (
                <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                  <Avatar
                    name={`${task.assignedToUser.firstName} ${task.assignedToUser.lastName}`}
                    title={`${task.assignedToUser.firstName} ${task.assignedToUser.lastName} <${task.assignedToUser.emailAddress}>`}
                    size="32"
                    round={true}
                  />
                  <Box>
                    <Typography variant="body2">
                      {task.assignedToUser.firstName} {task.assignedToUser.lastName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {task.assignedToUser.role}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                'Unknown User'
              )
            }
            gutterBottom
          />

          <InfoBoxItem
            title="Due Date"
            label1={format(new Date(task.dueDate), 'dd.MM.yyyy')}
            label2={
              <Typography
                variant="caption"
                color={new Date(task.dueDate) < new Date() ? 'error' : 'textSecondary'}
              >
                {formatDistanceToNowConfigured(task.dueDate)}
                {new Date(task.dueDate) < new Date() ? ' ago' : ''}
              </Typography>
            }
            gutterBottom
          />

          {task.opportunity && (
            <InfoBoxItem
              title="Opportunity"
              label1={
                <span className={classes.opportunityLink}>#{task.opportunity.opportunityId}</span>
              }
              label2={task.opportunity.bookingPartyId?.name || 'No booking party'}
              gutterBottom
            />
          )}

          <InfoBoxItem
            title="Created"
            label1={format(new Date(task.createdAt), 'dd.MM.yyyy HH:mm')}
            label2={formatDistanceToNowConfigured(task.createdAt)}
            gutterBottom
          />
        </Box>

        {/* Action Menu */}
        <Box className={classes.actionButtons}>
          <Tooltip title="Actions">
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {task.status !== TaskStatus.Resolved && (
          <MenuItem onClick={handleResolve}>Mark as Resolved</MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Delete Task</MenuItem>
      </Menu>
    </StyledTaskRow>
  );
};

interface OpportunityTasksTableProps {
  tasks: OpportunityTask[];
  isAdmin?: boolean;
  onResolve: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const OpportunityTasksTable: React.FC<OpportunityTasksTableProps> = ({
  tasks,
  isAdmin,
  onResolve,
  onDelete,
}) => {
  const classes = useStyles();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      onDelete(taskToDelete);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  return (
    <Fragment>
      {tasks.map(task => (
        <Card key={task.id} className={classes.card}>
          <OpportunityTaskRow
            task={task}
            isAdmin={isAdmin}
            onResolve={onResolve}
            onDelete={handleDeleteClick}
          />
        </Card>
      ))}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default OpportunityTasksTable;
