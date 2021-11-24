import React, { useState } from 'react';
import useCountries from '../../hooks/useCountries';
import Country from '../../model/Country';
import SingleCountryInput from './SingleCountryInput';
import { Box } from '@material-ui/core';
import CityByCountryInput from './CityByCountryInput';
import City from '../../model/City';

interface Props {
  onSelect?: (selectedCity?: City) => void;
}

const CityInput: React.FC<Props> = ({ onSelect }) => {
  const countries = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    countries && countries.length > 0 ? countries[0] : null,
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleChangeSelectedCountry = (value: Country | null) => {
    setSelectedCountry(value || (countries && countries.length > 0 ? countries[0] : null));
  };

  const handleChangeSelectedCity = (value: City | null) => {
    setSelectedCity(value || null);
    onSelect && onSelect(value || undefined);
  };

  return (
    <Box display="flex" flexDirection="row">
      <SingleCountryInput margin="dense" value={selectedCountry!} onChange={handleChangeSelectedCountry} />
      <CityByCountryInput
        margin="dense"
        country={selectedCountry || undefined}
        value={selectedCity!}
        onChange={handleChangeSelectedCity}
      />
    </Box>
  );
};

export default CityInput;
