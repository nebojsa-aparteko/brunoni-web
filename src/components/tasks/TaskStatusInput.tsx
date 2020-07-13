import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref, useMemo } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, PopperProps, TextField, Theme } from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { TaskStatus } from '../TaskStatusChip';

const getOptionSelected = (option: TaskStatus, value: TaskStatus) => option === value;
const getOptionLabel = (option: TaskStatus) => (option ? option : '');

interface Props {
  label: string;
  tasksStatus: TaskStatus[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: TaskStatus;
  onChange: (event: ChangeEvent<{}>, taskStatus: TaskStatus | null) => void;
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

const TaskStatusInput: React.FC<Props> = ({
  label,
  tasksStatus,
  inputRef,
  value,
  onChange,
  open,
  onOpen,
  onClose,
  ...rest
}) => {
  const classes = useStyles();
  const loading = useMemo(() => open && !tasksStatus, [open, tasksStatus]);

  return (
    <Autocomplete
      {...rest}
      className={classes.root}
      value={value || null}
      onChange={(event: ChangeEvent<{}>, user: TaskStatus | null) => onChange(event, user)}
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      options={tasksStatus}
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
      onClick={event => event.stopPropagation()}
    />
  );
}

const Papyrus: React.FC<HTMLAttributes<HTMLElement>> = ({ ...props }) => <Paper {...props} />;

export default TaskStatusInput;
