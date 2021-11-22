import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EditableTable from '../../EditableTable';
import {
  addLandTransportExtension,
  deleteLandTransportExtension,
  editLandTransportExtension,
} from '../../../api/landTransportConfig';
import useLandTransportExtensionConfig from '../../../hooks/useLandTransportExtensionConfig';

const useStyles = makeStyles((theme: Theme) => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  content: {
    margin: theme.spacing(3),
  },
}));

interface Props {
  providerId: string;
  isOpen: boolean;
  handleClose: () => void;
}

const PredefinedAddOnRatesModal: React.FC<Props> = ({ providerId, isOpen, handleClose }) => {
  const classes = useStyles();
  const extensions = useLandTransportExtensionConfig(providerId);
  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Box>
        <DialogTitle disableTypography>
          <Typography variant="h4">Extension labels (Included/Excluded/Add-ons)</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <EditableTable
            data={extensions}
            cells={[{ fieldName: 'name', fieldType: 'input', label: 'Name' }]}
            defaultItem={{ id: '', name: '', createdAt: new Date() }}
            addItem={item => addLandTransportExtension(providerId, item)}
            editItem={(id, item) => editLandTransportExtension(providerId, id, item)}
            deleteItem={id => deleteLandTransportExtension(providerId, id)}
          />
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default PredefinedAddOnRatesModal;
