import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { uniqWith, isEqual, uniq } from 'lodash/fp';
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MultipleEmailInput from '../../inputs/MultipleEmailInput';
import PortInput from '../../inputs/PortInput';
import EmailIcon from '@material-ui/icons/Email';
import Port from '../../../model/Port';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import { CarrierSettingsRule, PaymentConfirmationType } from '../../../model/PaymentConfirmationRule';
import { Booking } from '../../../model/Booking';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dialogContent: {
      width: '800px',
      paddingBottom: theme.spacing(3),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 10,
      '& > *': {
        width: 600,
      },
    },
  }),
);

const SendEmailDialog: React.FC<Props> = ({ booking, setDialogOpen, dialogOpen }) => {
  const classes = useStyles();

  const carrierSettingsRef = useFirestoreCollection(
    'payment-confirmation-config',
    useCallback(
      query => {
        query = query.where('carrier.name', '==', booking.CarrierID.toUpperCase());
        return query.where('type', '==', PaymentConfirmationType.CARRIER_SETTINGS);
      },
      [booking.CarrierID],
    ),
  );

  useEffect(() => {
    const carrierSettings = carrierSettingsRef?.docs.map(settingRef => settingRef.data() as CarrierSettingsRule);
    if (carrierSettings) {
      const ports = carrierSettings.map(setting => setting.port);
      const contactTo = carrierSettings.map(setting => setting.contactTo).flat(1);
      let contactCC = carrierSettings.map(setting => setting.contactCC).flat(1);
      contactCC = ['importhsdg@brunoni.ch', 'zrh-import-crosstrade@brunoni.ch'].concat(contactCC);

      setSelectedContactTo(uniq(contactTo));
      setSelectedContactCC(uniq(contactCC));
      setPorts(uniqWith(isEqual)(ports));
    }
  }, [carrierSettingsRef]);

  const [ports, setPorts] = useState<Port[]>();

  const [selectedPort, setSelectedPort] = useState<Port>();
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [selectedContactTo, setSelectedContactTo] = useState<string[]>([]);
  const [selectedContactCC, setSelectedContactCC] = useState<string[]>([
    'importhsdg@brunoni.ch',
    'zrh-import-crosstrade@brunoni.ch',
  ]);
  const [selectedContactBCC, setSelectedContactBCC] = useState<string[]>([]);

  const handleAdditionalInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalInfo(event.target.value);
  };

  const handleSendEmail = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/paymentConfirmation`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bcc: selectedContactBCC,
        cc: selectedContactCC,
        contactTo: selectedContactTo,
        portId: selectedPort?.id,
        freeText: additionalInfo,
        bookingId: booking.id,
      }),
    });
  };

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} aria-labelledby="send-email-dialog" maxWidth="lg">
      <DialogTitle disableTypography id="send-email-dialog" className={classes.dialogTitle}>
        <Typography variant="h4">Send semi automatic email</Typography>
        <IconButton onClick={() => setDialogOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Paper className={classes.dialogContent}>
          <Box margin={2}>
            <PortInput
              label="Destination port agent"
              ports={ports || []}
              onChange={port => setSelectedPort(port || undefined)}
              value={selectedPort}
            />
          </Box>
          <Box margin={2}>
            <TextField
              id="outlined-basic"
              fullWidth
              multiline
              rows={4}
              label="Freight collection message"
              variant="outlined"
              value={additionalInfo}
              onChange={handleAdditionalInfoChange}
            />
          </Box>
          <Box margin={2}>
            <MultipleEmailInput
              data={[]}
              label="Contact To"
              selectedEmails={selectedContactTo}
              setSelectedEmails={setSelectedContactTo}
            />
          </Box>
          <Box margin={2}>
            <MultipleEmailInput
              data={[]}
              label="Contact CC"
              selectedEmails={selectedContactCC}
              setSelectedEmails={setSelectedContactCC}
            />
          </Box>
          <Box margin={2}>
            <MultipleEmailInput
              data={[]}
              label="Contact BCC"
              selectedEmails={selectedContactBCC}
              setSelectedEmails={setSelectedContactBCC}
            />
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSendEmail}
          startIcon={<EmailIcon />}
          style={{ minWidth: 80, minHeight: 50, marginRight: 15 }}
        >
          Send email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmailDialog;

interface Props {
  booking: Booking;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dialogOpen: boolean;
}
