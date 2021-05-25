import React, { useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import ChargeCodes from '../../contexts/ChargeCodes';
import ChargeCode from '../../model/ChargeCode';
import { FreightDetailGroup } from '../../model/Booking';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles({
  input: {
    // todo. Cant make it dynamic... fit-content not working.
    minWidth: '250px',
  },
});

const ChargeCodeInput: React.FC<Props> = ({ chargeCodeText, handleChange, group, margin }) => {
  const classes = useStyles();
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

  const handleSetSelectedValue = (event: React.ChangeEvent<{}>, value: ChargeCode | null) => {
    const selectedSpecialRemark = value ? chargeCodes?.find(code => code.id === value.id) : undefined;
    selectedSpecialRemark && handleChange && handleChange(selectedSpecialRemark);
  };

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      className={classes.input}
      options={filteredChargeCodes || []}
      getOptionSelected={(option: ChargeCode, value: ChargeCode) => option.text === value.text}
      getOptionLabel={option => option.text || ''}
      onChange={handleSetSelectedValue}
      value={chargeCode}
      renderInput={params => <TextField {...params} fullWidth placeholder="Type to filter" variant="outlined" />}
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
