import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EditableTable from '../../EditableTable';
import {
  addLandTransportExtensionConfig,
  deleteLandTransportExtensionConfig,
  editLandTransportExtensionConfig,
} from '../../../api/landTransportConfig';
import useLandTransportExtensionConfig from '../../../hooks/useLandTransportExtensionConfig';
import theme from '../../../theme';

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
        <DialogContent style={{ margin: theme.spacing(2) }}>
          <EditableTable
            tableTitle="Extension labels"
            data={extensions}
            cells={[{ fieldName: 'name', fieldType: 'input', label: 'Name' }]}
            defaultItem={{ id: '', name: '', createdAt: new Date() }}
            addItem={item => addLandTransportExtensionConfig(providerId, item)}
            editItem={(id, item) => editLandTransportExtensionConfig(providerId, id, item)}
            deleteItem={id => deleteLandTransportExtensionConfig(providerId, id)}
          />
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default PredefinedAddOnRatesModal;
