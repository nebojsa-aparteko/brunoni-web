import React from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';

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
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      flexDirection: 'column',
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
    formControl: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& *': {
        margin: `0 ${theme.spacing(1)}`,
      },
    },
    searchInput: {
      flex: 1,
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
        <DialogContent className={classes.dialogContent}>
          <Typography>Find booking by:</Typography>
          <TextField
            label="Normal"
            id="outlined-margin-normal"
            defaultValue="Default Value"
            margin="normal"
            variant="outlined"
          />
          <FormControl className={classes.formControl}>
            <FormLabel>File number</FormLabel>
            <TextField
              id="input-file-number"
              label="File number"
              margin="normal"
              variant="outlined"
              className={classes.searchInput}
            />
            <IconButton aria-label="delete" color="primary">
              <SearchIcon />
            </IconButton>
          </FormControl>

          <TextField id="input-bl-number" label="BL number" margin="normal" variant="outlined" />
          <TextField id="input-customer-ref" label="Customer's reference" margin="normal" variant="outlined" />
          <TextField id="input-container-number" label="Container number" margin="normal" variant="outlined" />
          <TextField id="input-delivery-ref" label="Delivery reference" margin="normal" variant="outlined" />
          <TextField id="input-pickup-ref" label="Pickup reference" margin="normal" variant="outlined" />
          <TextField id="input-voyage-vessel" label="Vessel including Voyage" margin="normal" variant="outlined" />
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default NavBarQuickSearchDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}
