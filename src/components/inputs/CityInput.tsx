import React from 'react';
import Country from '../../model/Country';
import SingleCountryInput from './SingleCountryInput';
import { Box, Typography } from '@material-ui/core';
import CityByCountryInput from './CityByCountryInput';
import City from '../../model/City';
import theme from '../../theme';
import Destination from '../../model/land-transport/Destination';
import { get } from 'lodash/fp';

interface Props {
  isEditing: boolean;
  origin: Destination | null;
  onSelect: (value: City | Country | null, path: keyof Destination) => void;
}

const CityInput: React.FC<Props> = ({ onSelect, origin, isEditing }) => (
  <Box display="flex" flexDirection="row" style={{ gap: theme.spacing(1) }} alignItems="center">
    {isEditing ? (
      <SingleCountryInput
        margin="dense"
        // @ts-ignore
        value={origin?.country}
        onChange={value => onSelect(value, 'country')}
      />
    ) : (
      <Typography>{get('name')(origin?.country)},</Typography>
    )}
    {isEditing ? (
      <CityByCountryInput
        margin="dense"
        country={origin?.country}
        // @ts-ignore
        value={origin?.city}
        onChange={value => onSelect(value, 'city')}
      />
    ) : (
      <Typography>{get('name')(origin?.city)}</Typography>
    )}
  </Box>
);

export default CityInput;
