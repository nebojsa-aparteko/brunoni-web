import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import {
  CircularProgress,
  makeStyles,
  Paper,
  Popper,
  PopperProps,
  TextField,
  Theme,
} from '@material-ui/core';
import Port from '../../model/Port';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { FilterOptionsState } from '@material-ui/lab';
import { FieldError } from 'react-hook-form';

const filter = createFilterOptions<Port>();

const getOptionLabel = (option: Port) =>
  option.city && option.country
    ? `${option.city} - ${option.country} (${option.id})`
    : `${option.id}`;
const getOptionSelectItemLabel = (option: Port) =>
  option.city && option.country
    ? `${option.city} - ${option.country} (${option.id})`
    : `Add "${option.id}"`;

interface Props {
  label?: string;
  ports: Port[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: Port;
  onChange: (port: Port | null) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
  margin?: 'none' | 'dense' | 'normal';
  freeSolo?: boolean;
  formError?: FieldError;
}

const useStyles = makeStyles({
  input: {
    flexWrap: 'nowrap',
  },
});

const PortInput: React.FC<Props> = ({
  label = '',
  ports,
  inputRef,
  value,
  onChange,
  open,
  onOpen,
  onClose,
  margin,
  freeSolo,
  formError,
}) => {
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
      filterOptions={
        freeSolo
          ? (options: Port[], params: FilterOptionsState<Port>) => {
              const filtered = filter(options, params);
              if (params.inputValue !== '') {
                filtered.push({
                  id: params.inputValue.toUpperCase(),
                  city: '',
                  country: '',
                } as Port);
              }
              return filtered;
            }
          : undefined
      }
      options={ports}
      freeSolo={freeSolo}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          margin={margin}
          fullWidth
          error={!!formError}
          helperText={formError ? formError.message : null}
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
        const matches = match(
          freeSolo ? getOptionSelectItemLabel(option) : getOptionLabel(option),
          inputValue,
        );
        const parts = parse(
          freeSolo ? getOptionSelectItemLabel(option) : getOptionLabel(option),
          matches,
        );

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
