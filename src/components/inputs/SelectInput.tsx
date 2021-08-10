import React, { ChangeEvent, HTMLAttributes, Ref } from 'react';
import { Theme, makeStyles, TextField, CircularProgress, Popper, Paper, PopperProps } from '@material-ui/core';
import InputProps from '../../model/InputProps';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props<T> extends InputProps<T> {
  label: string;
  margin?: any;
  options: T[];
  filterOptions?: any;
  getOptionLabel: (value: T) => string;
  inputRef?: React.Ref<any>;
  open: boolean;
  setOpen: (open: boolean) => void;
  getOptionSelected?: (option: T, value: T) => boolean;
}

const useStyles = makeStyles({
  input: {
    flexWrap: 'nowrap',
  },
});

export default function SelectInput<T>({
  label,
  margin,
  options,
  filterOptions,
  getOptionLabel,
  inputRef,
  open,
  setOpen,
  value,
  onChange,
  getOptionSelected,
}: Props<T>) {
  const classes = useStyles();
  const loading = open && !options;

  return (
    <Autocomplete
      value={value || null}
      getOptionSelected={getOptionSelected}
      onChange={(_: ChangeEvent<{}>, value: T | null) => onChange(value)}
      autoSelect
      autoHighlight
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={getOptionLabel}
      filterOptions={filterOptions}
      options={options}
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
}

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
