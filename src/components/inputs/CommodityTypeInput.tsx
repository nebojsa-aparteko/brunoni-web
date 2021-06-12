import 'isomorphic-fetch';
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref, useContext } from 'react';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { CircularProgress, makeStyles, Paper, Popper, PopperProps, TextField, Theme } from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { FilterOptionsState } from '@material-ui/lab';
import CommodityType from '../../model/CommodityType';
import CommodityTypes from '../../contexts/CommodityTypes';

const filter = createFilterOptions<CommodityType>();

const getOptionLabel = (option: CommodityType) =>
  option ? (option.name && option.name !== '' ? option.name : option.id) : '';
const getOptionSelectItemLabel = (option: CommodityType) => (option.name ? option.name : `Add "${option.id}"`);

interface Props {
  label: string;
  inputRef?: MutableRefObject<HTMLInputElement | undefined>;
  value?: CommodityType;
  onChange: (commodityType: CommodityType | null) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
  margin?: 'none' | 'dense' | 'normal';
  freeSolo?: boolean;
}

const useStyles = makeStyles({
  input: {
    flexWrap: 'nowrap',
  },
});

const CommodityTypeInput: React.FC<Props> = ({
  label,
  inputRef,
  value,
  onChange,
  open,
  onOpen,
  onClose,
  margin,
  freeSolo,
}) => {
  const commodityTypes = useContext(CommodityTypes);
  const classes = useStyles();
  const loading = open && !commodityTypes;

  return (
    <Autocomplete
      value={value || null}
      onChange={(_: ChangeEvent<{}>, commodityType: CommodityType | null) => onChange(commodityType)}
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionLabel={getOptionLabel}
      filterOptions={
        freeSolo
          ? (options: CommodityType[], params: FilterOptionsState<CommodityType>) => {
              const filtered = filter(options, params);
              if (params.inputValue !== '') {
                filtered.push({
                  id: params.inputValue.toUpperCase(),
                  name: '',
                } as CommodityType);
              }
              return filtered;
            }
          : undefined
      }
      options={commodityTypes || []}
      freeSolo={freeSolo}
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
        const matches = match(freeSolo ? getOptionSelectItemLabel(option) : getOptionLabel(option), inputValue);
        const commodityTypes = parse(freeSolo ? getOptionSelectItemLabel(option) : getOptionLabel(option), matches);

        return (
          <div>
            {commodityTypes.map((commodityType: { highlight: boolean; text: string }, index: number) => (
              <span key={index} style={{ fontWeight: commodityType.highlight ? 700 : 400 }}>
                {commodityType.text}
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

export default CommodityTypeInput;
