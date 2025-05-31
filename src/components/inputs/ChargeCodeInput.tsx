import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TextField } from '@material-ui/core';
import ChargeCodes from '../../contexts/ChargeCodes';
import ChargeCode from '../../model/ChargeCode';
import { FreightDetailGroup } from '../../model/Booking';
import { Autocomplete } from '@material-ui/lab';

const commissionChargeCode = {
  id: 'COMMISSION',
  text: 'Agency Commission',
  internal1: 'TRUE',
  chargeCodeId: '',
  language: 'E',
} as ChargeCode;

const ChargeCodeInput: React.FC<Props> = ({ chargeCodeText, handleChange, group, margin }) => {
  const chargeCodes = useContext(ChargeCodes);
  const filteredChargeCodes = useMemo(
    () =>
      group && group === FreightDetailGroup.INTERNAL1
        ? chargeCodes
            ?.filter(code => code.internal1 === 'TRUE' && code.language === 'E')
            .concat(commissionChargeCode)
        : chargeCodes?.filter(code => code.language === 'E'),
    [chargeCodes, group],
  );

  const [chargeCode, setChargeCode] = useState<ChargeCode | undefined>(
    chargeCodes ? chargeCodes.find(code => code.text === chargeCodeText) : undefined,
  );

  useEffect(() => {
    setChargeCode(
      chargeCodes
        ? chargeCodes.concat(commissionChargeCode).find(code => code.text === chargeCodeText)
        : undefined,
    );
  }, [chargeCodeText, chargeCodes]);

  const handleSetSelectedValue = (event: React.ChangeEvent<{}>, value: ChargeCode | null) => {
    const selectedSpecialRemark = value
      ? value.id === 'COMMISSION'
        ? commissionChargeCode
        : chargeCodes?.find(code => code.id === value.id)
      : undefined;
    selectedSpecialRemark && handleChange && handleChange(selectedSpecialRemark);
  };

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      options={filteredChargeCodes || []}
      getOptionSelected={(option: ChargeCode, value: ChargeCode) => option.id === value.id}
      getOptionLabel={option => `${option.text}` || ''}
      onChange={handleSetSelectedValue}
      value={chargeCode}
      renderInput={params => (
        <TextField
          {...params}
          margin={margin}
          fullWidth
          placeholder="Type to filter"
          variant="outlined"
        />
      )}
    />
  );
};

interface Props {
  chargeCodeText?: string;
  group?: FreightDetailGroup;
  handleChange?: (chargeCode: ChargeCode | undefined) => void;
  margin?: any;
}

export default ChargeCodeInput;
