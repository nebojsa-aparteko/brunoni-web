import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Theme,
  Tooltip,
} from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddIcon from '@material-ui/icons/Add';
import palette from '../../theme/palette';
import Typography from '@material-ui/core/Typography';
import BrunoniCodes from '../../model/BrunoniCodes';
import { Tariff } from '../../model/Container';
import { isNil, omitBy } from 'lodash/fp';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: palette.background.hover,
    },
  },
  actionSection: {
    backgroundColor: theme.palette.grey['50'],
  },
  menuItem: {
    maxWidth: '40em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  menuItemPrimaryText: {
    fontWeight: 500,
  },
  menuItemSecondaryText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    marginLeft: theme.spacing(1),
  },
}));

interface SingleInputProps {
  tariff?: Tariff;
  availableCodes?: BrunoniCodes[];
  handleChange?: (tariff: Tariff) => void;
  margin?: any;
}

const TariffInput: React.FC<SingleInputProps> = ({
  tariff,
  availableCodes,
  margin,
  handleChange,
}) => {
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = React.useState<string>(
    tariff?.id || (availableCodes && availableCodes.length > 0 ? availableCodes[0].id || '' : ''),
  );
  const [tariffDays, setTariffDays] = useState<number>(tariff?.days ? parseInt(tariff?.days) : 14);

  useEffect(() => {
    setSelectedValue(
      tariff?.id || (availableCodes && availableCodes.length > 0 ? availableCodes[0].id || '' : ''),
    );
    setTariffDays(tariff?.days ? parseInt(tariff?.days) : 14);
  }, [tariff]);

  const handleSelectNewTariffId = (event: React.ChangeEvent<{ value: string }>) => {
    const selectedTariff = availableCodes?.find(tariff => tariff.id === event.target.value);
    setSelectedValue(event.target.value);
    const newDaysValue = selectedTariff?.days;
    setTariffDays(newDaysValue ? parseInt(newDaysValue) : -1);
    selectedTariff &&
      handleSetSelectedTariffValue({
        id: selectedTariff.id,
        days: newDaysValue + ' ',
        text: selectedTariff?.text,
      } as Tariff);
  };

  const handleSetSelectedTariffValue = (newTariff: Tariff) => {
    handleChange && handleChange(newTariff);
  };

  const handleOnDaysChange = (newText: string | undefined) => {
    setTariffDays(newText ? parseInt(newText) : -1);
  };

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item md={3} xs={12}>
        <TextField
          label="No. of days"
          variant="outlined"
          margin={margin}
          type="number"
          fullWidth
          value={tariffDays ? (tariffDays === -1 ? '' : tariffDays) : ''}
          onChange={event => handleOnDaysChange(event.target.value)}
          onBlur={event =>
            handleSetSelectedTariffValue({
              id: selectedValue,
              days: event.target.value,
              text: tariff?.text,
            } as Tariff)
          }
        />
      </Grid>
      <Grid item md={9} xs={12} style={{ display: 'flex' }}>
        <Select
          value={selectedValue}
          margin={margin}
          onChange={event => handleSelectNewTariffId(event as React.ChangeEvent<{ value: string }>)}
          variant="outlined"
          style={{ marginTop: 8, height: 'fit-content', width: '100%' }}
          renderValue={value => `${availableCodes?.find(tariff => tariff.id === value)?.text}`}
        >
          {availableCodes?.map(tariff => {
            return (
              <MenuItem key={tariff.id} value={tariff.id} className={classes.menuItem}>
                <Typography className={classes.menuItemPrimaryText}>
                  {tariff.description}
                </Typography>
                <Typography
                  className={classes.menuItemSecondaryText}
                  variant="body2"
                  color="textSecondary"
                  title={tariff.text}
                >
                  {(tariff.days ? '(' + tariff.days + ') ' : '') + tariff.text}
                </Typography>
              </MenuItem>
            );
          })}
        </Select>
      </Grid>
    </Grid>
  );
};

const getTariffFromBrunoniCode = (code: BrunoniCodes) => {
  return omitBy(isNil)({
    id: code.id,
    days: code.days,
    text: code.text,
    description: code.description,
  }) as Tariff;
};
const TariffsInput: React.FC<Props> = ({ tariffs, availableTariffs, margin, handleChange }) => {
  const classes = useStyles();

  const handleAdd = () => {
    availableTariffs &&
      availableTariffs.length > 0 &&
      handleChange(
        tariffs
          ? tariffs.concat(getTariffFromBrunoniCode(availableTariffs[0]))
          : [getTariffFromBrunoniCode(availableTariffs[0])],
      );
  };

  const handleRemove = (item: Tariff) => () => {
    tariffs && handleChange(tariffs.filter(tariff => tariff !== item));
  };

  const handleChangeSingleTariff = (tariff: Tariff, index: number) => {
    if (tariffs) {
      const newTariffs = [...tariffs];
      newTariffs[index] = tariff;
      handleChange(newTariffs);
    }
  };

  return (
    <Box>
      {tariffs &&
        tariffs.map((item, i) => (
          <Paper key={i} className={classes.paper}>
            <Box display="flex">
              <Box flex="1" p={2}>
                <TariffInput
                  tariff={item}
                  availableCodes={availableTariffs}
                  handleChange={(tariff: Tariff) => handleChangeSingleTariff(tariff, i)}
                  margin={margin}
                />
              </Box>
              <Box
                py={2}
                px={1}
                display="flex"
                alignContent="center"
                alignItems="center"
                className={classes.actionSection}
              >
                <IconButton onClick={handleRemove(item)} aria-label="delete" size="small">
                  <DeleteForeverIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      <Box pt={tariffs && tariffs.length > 0 ? 1 : 0}>
        <Tooltip
          title={'No available tariffs to add'}
          disableHoverListener={!(!availableTariffs || availableTariffs.length === 0)}
          placement="right"
          arrow
        >
          <span>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!availableTariffs || availableTariffs.length === 0}
            >
              Add Tariff
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

interface Props {
  tariffs?: Tariff[];
  availableTariffs?: BrunoniCodes[];
  handleChange: (tariffs: Tariff[]) => void;
  margin?: any;
}

export default TariffsInput;
