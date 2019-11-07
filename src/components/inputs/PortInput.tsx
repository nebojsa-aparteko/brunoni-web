import 'isomorphic-fetch';
import React, { HTMLAttributes, MutableRefObject, Ref } from 'react';
import Autocomplete, { PopupProps } from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, TextField, Theme, Typography } from '@material-ui/core';
import Port from '../../model/Port';

const getOptionLabel = (option: Port) => `${option.HarbourName} - ${option.Land} (${option.ID})`;

interface Props {
  label: string;
  ports: Port[] | undefined;
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: Port;
  onChange: (port: Port) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
}

const PortInput: React.FC<Props> = ({ label, ports, inputRef, value, onChange, open, onOpen, onClose }) => {
  const loading = open && !ports;

  return (
    <Autocomplete
      value={value}
      onChange={(_, port: Port) => onChange(port)}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionLabel={getOptionLabel}
      options={ports}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          fullWidth
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      PopupComponent={Popup}
      PaperComponent={Papyrus}
      renderOption={option => <Typography>{getOptionLabel(option)}</Typography>}
    />
  );
};

const usePopupStyles = makeStyles((theme: Theme) => ({
  popper: {
    [theme.breakpoints.up('sm')]: {
      width: theme.breakpoints.values.md / 2,
    },
  },
}));

function Popup(props: PopupProps) {
  const { popperRef, anchorEl, open, children, ...other } = props;
  const classes = usePopupStyles();

  return (
    <Popper
      placement="bottom-start"
      popperRef={popperRef as Ref<any>}
      anchorEl={anchorEl}
      open={open}
      children={children}
      className={classes.popper}
    />
  );
}

const Papyrus: React.FC<HTMLAttributes<HTMLElement>> = ({ ...props }) => <Paper {...props} />;

export default PortInput;
