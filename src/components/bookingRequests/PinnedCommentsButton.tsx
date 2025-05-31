import React, { useCallback, useMemo } from 'react';
import useModal from '../../hooks/useModal';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { mdiStarCircleOutline } from '@mdi/js';
import CloseIcon from '@material-ui/icons/Close';
import useActivities from '../../hooks/useActivities';
import PinnedActivities from '../bookings/PinnedActivities';
import Icon from '@mdi/react';

const useStyles = makeStyles(theme => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogBody: {
    minWidth: theme.spacing(100),
    width: 'auto',
    minHeight: theme.spacing(10),
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
}));

interface PinnedCommentsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  bookingRequestId: string;
}

const PinnedCommentsModal: React.FC<PinnedCommentsModalProps> = ({
  isOpen,
  closeModal,
  bookingRequestId,
}) => {
  const classes = useStyles();
  const bookingRequestPath = useMemo(
    () => `/bookings-requests/${bookingRequestId}/activity`,
    [bookingRequestId],
  );
  const activities = useActivities(
    bookingRequestPath,
    useCallback(query => {
      return query.where('isPinned', '==', true).orderBy('at', 'desc');
    }, []),
  );

  const handleCloseModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    closeModal();
    event.stopPropagation();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseModal}
      aria-labelledby="dialog-pinned-comments"
      maxWidth="md"
    >
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Pinned Comments ({bookingRequestId})</Typography>
          <IconButton onClick={handleCloseModal} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {activities && activities?.length > 0 && (
            <Box my={2}>
              <Box displayPrint="none">
                <PinnedActivities
                  pinnedActivities={activities}
                  collection={'bookings-requests'}
                  docId={bookingRequestId}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

const PinnedCommentsButton: React.FC<PinnedCommentsButtonProps> = ({ bookingRequestId }) => {
  const { closeModal, openModal, isOpen } = useModal();

  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    openModal();
    event.stopPropagation();
  };

  return (
    <>
      <IconButton
        color="primary"
        aria-label="check vessel space"
        onClick={event => handleOpenModal(event)}
      >
        <Icon
          path={mdiStarCircleOutline}
          title="Pinned Activities"
          size={1}
          color="orange"
          style={{ margin: 'auto' }}
        />
      </IconButton>
      {bookingRequestId && isOpen && (
        <PinnedCommentsModal
          isOpen={isOpen}
          closeModal={closeModal}
          bookingRequestId={bookingRequestId}
        />
      )}
    </>
  );
};

interface PinnedCommentsButtonProps {
  bookingRequestId?: string;
}

export default PinnedCommentsButton;
