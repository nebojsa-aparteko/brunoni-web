import React, { useState } from 'react';
import useCountries from '../../hooks/useCountries';
import Country from '../../model/Country';
import SingleCountryInput from './SingleCountryInput';
import { Box } from '@material-ui/core';
import CityByCountryInput from './CityByCountryInput';
import City from '../../model/City';
import theme from '../../theme';
import Destination from '../../model/land-transport/Destination';

interface Props {
  origin: Destination | null;
  onSelect: (value: City | Country | null, path: keyof Destination) => void;
}

const CityInput: React.FC<Props> = ({ onSelect, origin }) => (
  <Box display="flex" flexDirection="row" style={{ gap: theme.spacing(1) }}>
    {/*//@ts-ignore*/}
    <SingleCountryInput margin="dense" value={origin?.country} onChange={value => onSelect(value, 'country')} />
    <CityByCountryInput
      margin="dense"
      country={origin?.country}
      //@ts-ignore
      value={origin?.city}
      onChange={value => onSelect(value, 'city')}
    />
  </Box>
);

export default CityInput;
