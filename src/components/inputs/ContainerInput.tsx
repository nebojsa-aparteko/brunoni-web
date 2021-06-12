import React, {
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import set from 'lodash/fp/set';
import unset from 'lodash/fp/unset';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import { Grid, IconButton, InputAdornment, makeStyles, TextField, Theme } from '@material-ui/core';
import InputProps from '../../model/InputProps';
import Container, { Tariff, Ventilation } from '../../model/Container';
import ContainerTypeInput from './ContainerTypeInput';
import QuantityInput from './QuantityInput';
import LocationInput from './LocationInput';
import ContainerType from '../../model/ContainerType';
import CommodityType from '../../model/CommodityType';
import PickupLocation from '../../model/PickupLocation';
import OptionalInput, { OptionalInputProps } from './OptionalInput';
import ListInput from './ListInput';
import IMOInput from './IMOInput';
import OOGInput from './OOGInput';
import IMO from '../../model/IMO';
import OOG from '../../model/OOG';
import ContainerDetails from '../../model/ContainerDetails';
import FormControl from '@material-ui/core/FormControl';
import DateInput from './DateInput';
import ActingAs from '../../contexts/ActingAs';
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import AcUnitIcon from '@material-ui/icons/AcUnit';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import VentilationInput from './VentilationInput';
import useCodebook from '../../hooks/useCodebook';
import { BookingCategory } from '../../model/Booking';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import Typography from '@material-ui/core/Typography';
import TariffsInput from './TariffInput';
import BrunoniCodes from '../../model/BrunoniCodes';
import CommodityTypeInput from './CommodityTypeInput';

interface Props extends InputProps<Container & ContainerDetails> {}

const useStyles = makeStyles((theme: Theme) => ({
  containerFormGroup: {
    backgroundColor: theme.palette.grey['100'],
    padding: theme.spacing(2),
  },
  inlineForm: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 120,
  },
  menuItem: {
    maxWidth: '40em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const OOGListInput = forwardRef((props: OptionalInputProps<OOG[]>, ref) => (
  <ListInput
    ref={ref}
    ItemInput={OOGInput}
    addText="Add container info"
    defaultItemValue={{ width: '', height: '', length: '', weight: '' }}
    {...props}
  />
));

const IMOListInput = forwardRef((props: OptionalInputProps<IMO[]>, ref) => (
  <ListInput
    ref={ref}
    ItemInput={IMOInput}
    addText="Add new IMO"
    defaultItemValue={{ IMOClass: '', UNNumber: '', PGNumber: '' }}
    {...props}
  />
));

const defaultIMOItem: IMO = {
  IMOClass: '',
  UNNumber: '',
  PGNumber: '',
};

const defaultOOGItem: OOG = {
  width: '',
  height: '',
  length: '',
  weight: '',
};

export interface Codebook {
  storage: BrunoniCodes[];
  demurrage: BrunoniCodes[];
  plugin: BrunoniCodes[];
}

export const isReefer = (containerType: ContainerType) => containerType?.id === '45R1' || containerType?.id === '22R1';

export const isContainerSO = (container: Container & ContainerDetails) =>
  container.containerType &&
  container.containerType?.description &&
  container.containerType?.description.includes('S.O.');

interface ContainerNumberInputProp {
  container: Container & ContainerDetails;
  index: number;
  handleChange: (newContainerNumbers: string[] | undefined) => void;
}

const ContainerNumberInput: React.FC<ContainerNumberInputProp> = ({ container, index, handleChange }) => {
  const [containerNumber, setContainerNumber] = useState<string | undefined>(
    container.containerNumbers && container.containerNumbers[index] && container.containerNumbers[index],
  );

  useEffect(() => {
    setContainerNumber(
      container.containerNumbers && container.containerNumbers[index] && container.containerNumbers[index],
    );
  }, [container.containerNumbers]);

  const handleChangeNumber = (value: string | undefined) => {
    let tempContainerNumbers = container.containerNumbers ? [...container.containerNumbers] : [];
    if (container.quantity > tempContainerNumbers.length) {
      while (container.quantity > tempContainerNumbers.length) tempContainerNumbers.push('');
    }

    const newContainerNumbers = tempContainerNumbers?.map((number, i) => (i === index ? value || '' : number));
    handleChange(newContainerNumbers.slice(0, container.quantity));
  };

  return (
    <Grid item md={2} xs={12}>
      <TextField
        label="Container No."
        margin="dense"
        variant="outlined"
        fullWidth
        value={containerNumber || ''}
        onChange={event => setContainerNumber(event.target.value)}
        onBlur={event => handleChangeNumber(event.target.value)}
      />
    </Grid>
  );
};

const getContainerNumberInputs = (
  container: Container & ContainerDetails,
  handleChange: { (newContainerNumbers: string[] | undefined): void },
) => {
  const containerNumberInputs = [];
  if (container.quantity && container.quantity > 0) {
    for (let i = 0; i < container.quantity; i++) {
      containerNumberInputs.push(
        <ContainerNumberInput key={'container' + i} container={container} index={i} handleChange={handleChange} />,
      );
    }
  }
  return containerNumberInputs;
};

const getArrayOfCorrectLength = (containerNumbers: string[] | undefined, quantity: number) => {
  const newContainerNumbers = containerNumbers ? [...containerNumbers] : [];
  if (quantity >= newContainerNumbers.length) {
    while (quantity > newContainerNumbers.length) newContainerNumbers.push('');
  }
  return newContainerNumbers.slice(undefined, quantity);
};

const ContainerInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, ...rest }, ref) => {
  const classes = useStyles();
  const containerTypeInput = useRef();
  const commodityTypeInput = useRef();
  const locationInput = useRef();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [linkedReferences, setLinkedReferences] = useState<boolean>(true);
  const [container, setContainer] = useState<Container & ContainerDetails>(value);
  const [temperatureFocused, setTemperatureFocused] = useState<boolean>(false);
  const [bookingRequest] = useBookingRequestContext();

  const tariffs = useCodebook({
    depotLocation: container.pickupLocation?.id,
    carrier: bookingRequest?.carrier?.id,
    port: bookingRequest?.schedule?.OriginInfo.Port.ID,
    category: BookingCategory.Export,
    equipment: container.containerType?.id,
  }) as Codebook;

  useEffect(() => {
    setContainer(value);
  }, [value]);

  useEffect(() => {
    if (isContainerSO(container)) {
      const newContainerNumbers = getArrayOfCorrectLength(container.containerNumbers, container.quantity);
      setContainer(prevState => ({
        ...prevState,
        containerNumbers: container.quantity === 0 ? undefined : newContainerNumbers,
      }));
    } else {
      setContainer(prevState => ({ ...prevState, containerNumbers: undefined }));
    }
  }, [container.containerType, container.quantity]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (!value.containerType) {
        (containerTypeInput.current! as { focus: () => void }).focus();
      } else if (!value.commodityType) {
        (commodityTypeInput.current! as { focus: () => void }).focus();
      } else if (!value.pickupLocation) {
        try {
          (locationInput.current! as { focus: () => void }).focus();
        } catch (e) {
          // ignore, cannot focus the field that is not there
        }
      } else {
        (containerTypeInput.current! as { focus: () => void }).focus();
      }
    },
  }));

  const handleContainerTypeChange = (v: ContainerType | null) => {
    const isSO = (v || {}).description?.endsWith('S.O.');
    onChange(
      flow(
        set('containerType', v),
        set('ventilation', v && isReefer(v) ? Ventilation.CLOSED : undefined),
        (v || {}).couldBeOversize ? identity : set('oog', [false]),
        isSO ? unset('location') : identity,
        isSO ? unset('pickupLocation') : identity,
        isSO ? unset('pickupReference') : identity,
        isSO ? unset('pickupDate') : identity,
      )(container) as Container & ContainerDetails,
    );
    (commodityTypeInput.current! as { focus: () => void }).focus();
  };

  const handleCommodityTypeChange = (v: CommodityType | null) => {
    onChange(set('commodityType', v)(container));
    if (locationInput.current) {
      (locationInput.current! as { focus: () => void }).focus();
    }
  };

  const handleLocationChange = (v: PickupLocation | null) => {
    onChange(set('pickupLocation', isContainerSO(container) ? undefined : v)(container));
  };

  const handleQuantityChange = (v: number | null) => {
    onChange(set('quantity', v)(container));
  };

  const handleIMOChange = (v: [false] | [true, IMO[]]) => {
    onChange(set('imo', v[0] ? v : undefined)(container));
  };

  const handleOOGChange = (v: [false] | [true, OOG[]]) => {
    onChange(set('oog', v[0] ? v : undefined)(container));
  };

  const handlePickupDateChange = (v: Date | null) => {
    setDateOpen(false);
    onChange(set('pickupDate', isContainerSO(container) ? undefined : v)(container));
  };

  const handleWeightTextChange = (v: number | null) => {
    setContainer(set('weight', v)(container));
  };

  const handleWeightChange = (v: number | null) => {
    onChange(set('weight', v)(container));
  };

  const handleTemperatureChange = (v: number | null) => {
    onChange(set('temperature', v)(container));
  };

  const handleHumidityChange = (v: string | null) => {
    onChange(set('humidity', v)(container));
  };

  const handleVentilationChange = (v: Ventilation | null) => {
    onChange(set('ventilation', v)(container));
  };

  const handlePickupReferenceTextChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? { ...container, pickupReference: isContainerSO(container) ? undefined : v, deliveryReference: v, vgmPin: v }
      : { ...container, pickupReference: isContainerSO(container) ? undefined : v }) as Container & ContainerDetails;
    setContainer(newValue);
  };

  const handlePickupReferenceChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? {
          ...container,
          pickupReference: isContainerSO(container) ? undefined : v,
          deliveryReference: v,
          vgmPin: v,
        }
      : { ...container, pickupReference: isContainerSO(container) ? undefined : v }) as Container & ContainerDetails;
    onChange(newValue);
  };

  const handleDeliveryReferenceTextChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? { ...container, pickupReference: isContainerSO(container) ? undefined : v, deliveryReference: v, vgmPin: v }
      : { ...container, deliveryReference: v }) as Container & ContainerDetails;
    setContainer(newValue);
  };

  const handleDeliveryReferenceChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? {
          ...container,
          pickupReference: isContainerSO(container) ? undefined : v,
          deliveryReference: v,
          vgmPin: v,
        }
      : { ...container, deliveryReference: v }) as Container & ContainerDetails;
    onChange(newValue);
  };

  const handleVGMPinTextChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? { ...container, pickupReference: isContainerSO(container) ? undefined : v, deliveryReference: v, vgmPin: v }
      : { ...container, vgmPin: v }) as Container & ContainerDetails;
    setContainer(newValue);
  };

  const handleVGMPinChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? {
          ...container,
          pickupReference: isContainerSO(container) ? undefined : v,
          deliveryReference: v,
          vgmPin: v,
        }
      : { ...container, vgmPin: v }) as Container & ContainerDetails;
    onChange(newValue);
  };

  const handleChangeDemDetTariffs = (newTariffs: Tariff[]) => {
    onChange({ ...container, demDetTariffs: newTariffs });
  };

  const handleChangeStorageTariffs = (newTariffs: Tariff[]) => {
    onChange({ ...container, storageTariffs: newTariffs });
  };

  const handleChangePluginTariffs = (newTariffs: Tariff[]) => {
    onChange({ ...container, pluginTariffs: newTariffs });
  };

  const handleChangeContainerNumbers = (newContainerNumbers: string[] | undefined) => {
    onChange({ ...container, containerNumbers: newContainerNumbers?.filter(value => value.trim() !== '') });
  };

  return (
    <Fragment>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <ContainerTypeInput
            ref={containerTypeInput}
            margin="dense"
            value={container.containerType!}
            onChange={handleContainerTypeChange}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <CommodityTypeInput
            label={'Commodity'}
            onChange={handleCommodityTypeChange}
            value={container.commodityType!}
            margin="dense"
            freeSolo={true}
            inputRef={commodityTypeInput}
          />
        </Grid>
        {get('showLocations')(rest) && !value.containerType?.description?.endsWith('S.O.') && (
          <Grid item md={4} xs={12}>
            <LocationInput
              ref={locationInput}
              margin="dense"
              value={container.pickupLocation!}
              onChange={handleLocationChange}
              shouldShowAllDepots={!!get('shouldShowAllDepots')(rest)}
            />
          </Grid>
        )}
        <Grid item md={2} xs={12}>
          <QuantityInput value={container.quantity} margin="dense" onChange={handleQuantityChange} />
        </Grid>
        {get('isDetailedInput')(rest) && (
          <>
            {!isContainerSO(container) && (
              <Grid item md={2} xs={12}>
                <DateInput
                  value={container.pickupDate || null}
                  onChange={handlePickupDateChange}
                  open={dateOpen}
                  onOpen={() => setDateOpen(true)}
                  onClose={() => setDateOpen(false)}
                  label="Pickup Date"
                  margin="dense"
                  fullWidth
                />
              </Grid>
            )}
            <Grid item md={2} xs={12}>
              <TextField
                label="Weight (Kg)"
                type="number"
                margin="dense"
                variant="outlined"
                fullWidth
                value={container.weight}
                onChange={event => handleWeightTextChange(parseInt(event.target.value))}
                onBlur={event => handleWeightChange(parseInt(event.target.value))}
              />
            </Grid>
            {container.containerType && isReefer(container.containerType) && (
              <React.Fragment>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.temperature}
                    onChange={event => handleTemperatureChange(parseInt(event.target.value))}
                    onFocus={() => setTemperatureFocused(true)}
                    onBlur={() => setTemperatureFocused(false)}
                    helperText={
                      !temperatureFocused && container.temperature && container.temperature < 0
                        ? 'Below zero °C'
                        : undefined
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          {container.temperature ? (
                            container.temperature < 0 ? (
                              <AcUnitIcon htmlColor={'#8bddff'} />
                            ) : (
                              <WbSunnyIcon htmlColor={'#ffd904'} />
                            )
                          ) : null}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Humidity (%)"
                    type="number"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.humidity}
                    onChange={event => handleHumidityChange(event.target.value)}
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <VentilationInput value={container.ventilation} onChange={handleVentilationChange} />
                </Grid>
              </React.Fragment>
            )}
            {isAdmin && (
              <React.Fragment>
                {!isContainerSO(container) && (
                  <Grid item md={3} xs={12}>
                    <TextField
                      label={linkedReferences ? 'Pickup Reference (Linked)' : 'Pickup Reference'}
                      margin="dense"
                      variant="outlined"
                      fullWidth
                      value={container.pickupReference || ''}
                      onChange={event => handlePickupReferenceTextChange(event.target.value)}
                      onBlur={event => handlePickupReferenceChange(event.target.value)}
                    />
                  </Grid>
                )}
                <Grid item md={3} xs={12}>
                  <TextField
                    label={linkedReferences ? 'Delivery Reference (Linked)' : 'Delivery Reference'}
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.deliveryReference || ''}
                    onChange={event => handleDeliveryReferenceTextChange(event.target.value)}
                    onBlur={event => handleDeliveryReferenceChange(event.target.value)}
                  />
                </Grid>
                <Grid item md={3} xs={12} style={{ display: 'flex' }}>
                  <TextField
                    label={linkedReferences ? 'VGM Pin (Linked)' : 'VGM Pin'}
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.vgmPin || ''}
                    onChange={event => handleVGMPinTextChange(event.target.value)}
                    onBlur={event => handleVGMPinChange(event.target.value)}
                  />
                  <IconButton onClick={() => setLinkedReferences(prevState => !prevState)} size="small">
                    {linkedReferences ? <LinkOffIcon /> : <LinkIcon />}
                  </IconButton>
                </Grid>
                {isContainerSO(container) && container.quantity > 0
                  ? getContainerNumberInputs(container, handleChangeContainerNumbers)
                  : null}
                {tariffs && tariffs.demurrage && (
                  <Grid item md={12} xs={12}>
                    <Typography style={{ fontWeight: 700 }}>Dem./Det. tariffs</Typography>
                    <TariffsInput
                      handleChange={handleChangeDemDetTariffs}
                      availableTariffs={tariffs.demurrage}
                      tariffs={container.demDetTariffs}
                      margin="dense"
                    />
                  </Grid>
                )}
                {tariffs && tariffs.storage && (
                  <Grid item md={12} xs={12}>
                    <Typography style={{ fontWeight: 700 }}>Storage tariffs</Typography>
                    <TariffsInput
                      handleChange={handleChangeStorageTariffs}
                      availableTariffs={tariffs.storage}
                      tariffs={container.storageTariffs}
                      margin="dense"
                    />
                  </Grid>
                )}
                {tariffs && tariffs.plugin && (
                  <Grid item md={12} xs={12}>
                    <Typography style={{ fontWeight: 700 }}>Plug-in tariffs</Typography>
                    <TariffsInput
                      handleChange={handleChangePluginTariffs}
                      availableTariffs={tariffs.plugin}
                      tariffs={container.pluginTariffs}
                      margin="dense"
                    />
                  </Grid>
                )}
              </React.Fragment>
            )}
          </>
        )}
      </Grid>
      <FormControl margin="dense" className={classes.inlineForm}>
        <OptionalInput
          label="This container contains IMO"
          ItemInput={IMOListInput}
          defaultItemValue={[defaultIMOItem]}
          value={
            container.imo && container.imo.length > 0 && typeof container.imo[0] !== 'boolean'
              ? container.imo
                ? container.imo.length > 0
                  ? [true, (container.imo as unknown) as IMO[]]
                  : [false]
                : [false]
              : container.imo || [false]
          }
          onChange={handleIMOChange}
        />
        {(container.containerType || {}).couldBeOversize && (
          <OptionalInput
            label="This container is out of gauge"
            ItemInput={OOGListInput}
            defaultItemValue={[defaultOOGItem]}
            value={
              container.oog && container.oog.length > 0 && typeof container.oog[0] !== 'boolean'
                ? container.oog
                  ? container.oog.length > 0
                    ? [true, (container.oog as unknown) as OOG[]]
                    : [false]
                  : [false]
                : container.oog || [false]
            }
            onChange={handleOOGChange}
          />
        )}
      </FormControl>
    </Fragment>
  );
};

export default forwardRef(ContainerInput);
