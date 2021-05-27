import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, PopperProps, TextField, Theme } from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import Client from '../../model/Client';

const getOptionSelected = (option: Client, value: Client) => option.id === value?.id;
const getOptionLabel = (option: Client) => `${option.name} - ${option.city} (${option.id})`;

interface Props {
  label: string;
  clients: Client[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: Client | null | undefined;
  onChange: (client: Client | null | undefined) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
  margin?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  input: {
    flexWrap: 'nowrap',
  },
}));

const ClientInput: React.FC<Props> = ({
  label,
  clients,
  inputRef,
  value,
  onChange,
  open,
  onOpen,
  onClose,
  margin,
  ...rest
}) => {
  const classes = useStyles();
  const loading = open && !clients;

  return (
    <Autocomplete
      {...rest}
      className={classes.root}
      value={value || null}
      onChange={(_: ChangeEvent<{}>, client: Client | null | undefined) => onChange(client)}
      autoSelect
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      options={clients}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          fullWidth
          variant="outlined"
          margin={margin}
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
    zIndex: 100,
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

export default ClientInput;
