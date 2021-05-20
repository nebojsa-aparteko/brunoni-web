import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MultipleEmailInput from '../../inputs/MultipleEmailInput';
import PortInput from '../../inputs/PortInput';
import EmailIcon from '@material-ui/icons/Email';
import Port from '../../../model/Port';
import { CarrierSettingsRule, PaymentConfirmationType } from '../../../model/PaymentConfirmationRule';
import { Booking } from '../../../model/Booking';
import useCarrierSettings from '../../../hooks/useCarrierSettings';
import { GlobalContext } from '../../../store/GlobalStore';
import useUser from '../../../hooks/useUser';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dialogContent: {
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

const defaultCCEmails = ['importhsdg@brunoni.ch', 'zrh-import-crosstrade@brunoni.ch'];

const SendEmailDialog: React.FC<Props> = ({ booking, setDialogOpen, dialogOpen }) => {
  const classes = useStyles();
  const carrierSettings = useCarrierSettings(booking.CarrierID.toUpperCase(), PaymentConfirmationType.CARRIER_SETTINGS);
  const ports = useMemo(() => carrierSettings?.map(s => s.port), [carrierSettings]);

  const [selectedPort, setSelectedPort] = useState<Port>();
  const selectedCarrierSettings = useMemo(() => carrierSettings?.find(c => c.port.id === selectedPort?.id), [
    carrierSettings,
    selectedPort,
  ]);

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} aria-labelledby="send-email-dialog" maxWidth="lg">
      <DialogTitle disableTypography id="send-email-dialog" className={classes.dialogTitle}>
        <Typography variant="h4">Send semi automatic email</Typography>
        <IconButton onClick={() => setDialogOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box margin={2}>
          <PortInput
            label="Destination port agent"
            ports={ports || []}
            onChange={port => setSelectedPort(port || undefined)}
            value={selectedPort}
          />
        </Box>
        {selectedCarrierSettings && (
          <SendEmailContent
            carrierSetting={selectedCarrierSettings}
            bookingId={booking.id}
            setDialogOpen={setDialogOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;

interface Props {
  booking: Booking;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dialogOpen: boolean;
}

const SendEmailContent = ({
  carrierSetting,
  bookingId,
  setDialogOpen,
}: {
  carrierSetting: CarrierSettingsRule;
  bookingId: string;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    error: false,
  });

  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [selectedContactTo, setSelectedContactTo] = useState<string[]>(carrierSetting?.contactTo || []);
  const [selectedContactCC, setSelectedContactCC] = useState<string[]>(
    defaultCCEmails.concat(carrierSetting?.contactCC || []),
  );
  const [user] = useUser();
  const [selectedContactBCC, setSelectedContactBCC] = useState<string[]>([]);

  const handleAdditionalInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalInfo(event.target.value);
  };
  const handleSendEmail = async (token: string) => {
    try {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      const response = await fetch(`${process.env.REACT_APP_API_URL}/paymentConfirmation`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bcc: [],
          cc: carrierSetting?.contactCC || [],
          contactTo: carrierSetting?.contactTo || [],
          portId: carrierSetting.port?.id,
          freeText: additionalInfo,
          bookingId: bookingId,
        }),
      });
      if (response.ok) {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
        setLoading(false);
        setDialogOpen(false);
        dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Success.' });
      } else {
        setError({
          error: true,
          errorMessage: 'Error sending email. Please try again.',
        });
        setLoading(false);
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    } catch (e) {
      setLoading(false);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  };

  return (
    <Paper className={classes.dialogContent}>
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
      <Button
        color="primary"
        variant="contained"
        onClick={() => user.getIdToken().then(token => handleSendEmail(token))}
        startIcon={<EmailIcon />}
        style={{ minWidth: 80, minHeight: 50 }}
        disabled={loading}
      >
        Send email
      </Button>
      {error.error ? <Typography color="error">{error.errorMessage}</Typography> : null}
    </Paper>
  );
};
