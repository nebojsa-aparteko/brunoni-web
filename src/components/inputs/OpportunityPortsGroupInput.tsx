import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  CircularProgress,
  makeStyles,
  Paper,
  Popper,
  PopperProps,
  TextField,
  Theme,
} from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';

interface Props {
  label: string;
  options: OpportunityPortsGroup[];
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: OpportunityPortsGroup | null | undefined;
  onChange: (group: OpportunityPortsGroup | null | undefined) => void;
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

const OpportunityPortsGroupInput: React.FC<Props> = ({
  label,
  options,
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
  const loading = open && !options;

  return (
    <Autocomplete
      {...rest}
      className={classes.root}
      value={value || null}
      onChange={(_: ChangeEvent<{}>, group: OpportunityPortsGroup | null | undefined) =>
        onChange(group)
      }
      autoSelect
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionLabel={(option: OpportunityPortsGroup) => option.name}
      getOptionSelected={(option, value) => option.id === value?.id}
      options={options}
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
        const matches = match(option.name, inputValue);
        const parts = parse(option.name, matches);

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
    zIndex: 5000,
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

export default OpportunityPortsGroupInput;
