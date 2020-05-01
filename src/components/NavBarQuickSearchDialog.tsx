import React from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogBody: {
      width: theme.spacing(100),
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
    },
    dropZone: {
      border: '1px dashed black',
    },
    dropZoneDefault: {
      border: '1px solid transparent',
    },
    addBtn: {
      margin: theme.spacing(1),
    },
  }),
);

const NavBarQuickSearchDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Quick Search</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}></DialogContent>
      </Box>
    </Dialog>
  );
};

export default NavBarQuickSearchDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}
