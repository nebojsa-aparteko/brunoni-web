import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, TextField } from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import UserRecord, { UserRecordMin } from '../../model/UserRecord';

const getOptionSelected = (option: UserRecord, value: UserRecord) =>
  option?.alphacomId === value?.alphacomId;
const getOptionLabel = (option: UserRecord) =>
  option ? `${option.firstName || ''} ${option.lastName || ''}` : '';

interface Props {
  label: string;
  users: UserRecordMin[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: UserRecordMin | null;
  onChange: (event: ChangeEvent<{}>, user: UserRecordMin | null) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
  },
  input: {
    flexWrap: 'nowrap',
  },
}));

const UserInput: React.FC<Props> = ({
  label,
  users,
  inputRef,
  value,
  onChange,
  open,
  onOpen,
  onClose,
  ...rest
}) => {
  const classes = useStyles();
  const loading = open && !users;

  return (
    <Autocomplete
      {...rest}
      className={classes.root}
      value={value || null}
      onChange={(event: ChangeEvent<{}>, user: UserRecord | null) => onChange(event, user)}
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
          onClick={event => event.stopPropagation()}
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
      PopperComponent={Popper}
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

const Papyrus: React.FC<HTMLAttributes<HTMLElement>> = ({ ...props }) => <Paper {...props} />;

export default UserInput;
