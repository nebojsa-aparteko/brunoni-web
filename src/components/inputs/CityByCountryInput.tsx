import React, { useRef, useState } from 'react';
import Country from '../../model/Country';
import useCitiesByCountry from '../../hooks/useCitiesByCountry';
import SelectInput from './SelectInput';
import City from '../../model/City';
import InputProps from '../../model/InputProps';

interface Props extends InputProps<City> {
  country?: Country;
  margin?: string;
}

const filterOptions = (options: City[], { inputValue }: { inputValue: string }) => {
  return options.filter(option => option.name.toLowerCase().includes(inputValue.trim().toLowerCase()));
};

const CityByCountryInput: React.FC<Props> = ({ value, onChange, country, margin }) => {
  const cities = useCitiesByCountry(country?.countryCode);
  const input = useRef();
  const [open, setOpen] = useState(false);

  return (
    <SelectInput
      inputRef={input}
      label="City"
      margin={margin}
      disabled={!country}
      options={cities || []}
      getOptionLabel={value => value.name}
      filterOptions={filterOptions}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(city: City | null) => onChange(city)}
      getOptionSelected={(option: City, value: City) => option.id === value.id}
    />
  );
};

export default CityByCountryInput;
