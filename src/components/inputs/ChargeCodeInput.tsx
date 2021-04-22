import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MenuItem, Select } from '@material-ui/core';
import ChargeCodes from '../../contexts/ChargeCodes';
import ChargeCode from '../../model/ChargeCode';
import { FreightDetailGroup } from '../../model/Booking';

const ChargeCodeInput: React.FC<Props> = ({ chargeCodeText, handleChange, group, margin }) => {
  const chargeCodes = useContext(ChargeCodes);
  const filteredChargeCodes = useMemo(
    () =>
      chargeCodes?.filter(code => (group && group === FreightDetailGroup.INTERNAL1 ? code.internal1 === 'TRUE' : true)),
    [chargeCodes],
  );

  const [chargeCode, setChargeCode] = useState<ChargeCode | undefined>(
    chargeCodes ? chargeCodes.find(code => code.text === chargeCodeText) : undefined,
  );

  useEffect(() => {
    setChargeCode(chargeCodes ? chargeCodes.find(code => code.text === chargeCodeText) : undefined);
  }, [chargeCodeText]);

  const handleSetSelectedValue = (event: React.ChangeEvent<{ value: string }>) => {
    const selectedSpecialRemark = event.target.value
      ? chargeCodes?.find(code => code.id === event.target.value)
      : undefined;
    handleChange && handleChange(selectedSpecialRemark);
  };

  return (
    <Select
      value={chargeCode?.id || ''}
      margin={margin}
      fullWidth
      onChange={event => handleSetSelectedValue(event as React.ChangeEvent<{ value: string }>)}
      style={{ flex: 1, height: 'fit-content' }}
    >
      {filteredChargeCodes?.map(code => (
        <MenuItem key={code.id} value={code.id}>
          {code.text}
        </MenuItem>
      ))}
    </Select>
  );
};

interface Props {
  chargeCodeText?: string;
  group?: FreightDetailGroup;
  handleChange?: (chargeCode: ChargeCode | undefined) => void;
  margin?: any;
}

export default ChargeCodeInput;
