import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, PopperProps, TextField, Theme } from '@material-ui/core';
import Port from '../../model/Port';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

const getOptionLabel = (option: Port) => `${option.city} - ${option.country} (${option.id})`;

interface Props {
  label: string;
  ports: Port[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: Port;
  onChange: (port: Port | null) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
  margin?: 'none' | 'dense' | 'normal';
}

const useStyles = makeStyles({
  input: {
    flexWrap: 'nowrap',
  },
});

const PortInput: React.FC<Props> = ({ label, ports, inputRef, value, onChange, open, onOpen, onClose, margin }) => {
  const classes = useStyles();
  const loading = open && !ports;

  return (
    <Autocomplete
      value={value || null}
      onChange={(_: ChangeEvent<{}>, port: Port | null) => onChange(port)}
      autoHighlight
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
          margin={margin}
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
            className: classes.input,
          }}
        />
      )}
      PopperComponent={Popup}
      PaperComponent={Papyrus}
      renderOption={(option, { inputValue }) => {
        const matches = match(getOptionLabel(option), inputValue);
        const parts = parse(getOptionLabel(option), matches);

        return (
          <div>
            {parts.map((part: { highlight: boolean; text: string }, index: number) => (
              <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                {part.text}
              </span>
            ))}
          </div>
        );
      }}
    />
  );
};

const usePopupStyles = makeStyles((theme: Theme) => ({
  popper: {
    width: theme.breakpoints.values.md / 2,
    zIndex: 2000,
  },
}));

function Popup(props: PopperProps) {
  const { popperRef, anchorEl, open, children } = props;
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
