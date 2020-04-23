import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, PopperProps, TextField, Theme } from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import UserRecord from '../../model/UserRecord';

const getOptionSelected = (option: UserRecord, value: UserRecord) => option?.alphacomId === value?.alphacomId;
const getOptionLabel = (option: UserRecord) => `${option.firstName} ${option.lastName} <${option.emailAddress}>`;

interface Props {
  label: string;
  users: UserRecord[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: UserRecord;
  onChange: (user: UserRecord | null) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  input: {
    flexWrap: 'nowrap',
  },
}));

const UserInput: React.FC<Props> = ({ label, users, inputRef, value, onChange, open, onOpen, onClose, ...rest }) => {
  const classes = useStyles();
  const loading = open && !users;

  return (
    <Autocomplete
      {...rest}
      className={classes.root}
      value={value}
      onChange={(_: ChangeEvent<{}>, user: UserRecord | null) => onChange(user)}
      autoSelect
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      options={users}
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

export default UserInput;
