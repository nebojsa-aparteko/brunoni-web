import { Quote } from '../../providers/QuoteGroupsProvider';
import { BookingRequest } from '../../model/BookingRequest';
import React, { useContext, useMemo, useRef, useState } from 'react';
import Container, { Ventilation } from '../../model/Container';
import ContainerDetails from '../../model/ContainerDetails';
import { isNil, omitBy } from 'lodash/fp';
import { Button, Grid } from '@material-ui/core';
import ListInput from '../inputs/ListInput';
import ContainerInput, { isContainerSO, isReefer } from '../inputs/ContainerInput';
import { isDashboardUser } from '../../model/UserRecord';
import UserRecordContext from '../../contexts/UserRecordContext';
import ActingAs from '../../contexts/ActingAs';

const checkRequestForIMO = (containers: (Container & ContainerDetails)[] | undefined) =>
  containers && containers.some((container: Container & ContainerDetails) => container.imo?.[0]);

const checkRequestForSOC = (containers: (Container & ContainerDetails)[] | undefined) =>
  containers &&
  containers.some(
    (container: Container & ContainerDetails) =>
      container.containerType &&
      container.containerType?.description &&
      container.containerType?.description.includes('S.O.'),
  );

const CargoInfo: React.FC<Props> = ({ quote, handlePrevious, handleNext, bookingRequest, setBookingRequest }) => {
  const addButton = useRef<HTMLButtonElement>();
  const listInput = useRef<unknown>();
  const userRecord = useContext(UserRecordContext);
  const actingAs = useContext(ActingAs)[0]; //isAdmin -> !actingAs

  //TODO set conainers in ContainerInput even if no change happened
  const [containers, setContainers] = useState<(Container & ContainerDetails)[]>(
    bookingRequest && bookingRequest.containers
      ? bookingRequest.containers
      : quote && quote.containers
      ? quote.containers.map(container => {
          return {
            ...container,
            imo: [false],
            oog: [false],
            ventilation:
              container.containerType && isReefer(container.containerType)
                ? container.ventilation || Ventilation.CLOSED
                : container.ventilation,
          };
        })
      : [],
  );

  const isNextButtonDisabled = useMemo<boolean>(
    () =>
      !(
        containers.length > 0 &&
        containers.every(
          container =>
            (isContainerSO(container) ? true : container.pickupLocation && container.pickupDate) &&
            container.quantity &&
            container.containerType &&
            container.commodityType &&
            container.weight,
        )
      ),
    [containers],
  );

  const handleContinue = () => {
    const writableContainers = containers.map(container => {
      return {
        ...container,
        // imo: container.imo && container.imo.length > 1 ? container.imo[1] : null,
        // oog: container.oog && container.oog.length > 1 ? container.oog[1] : null,
        pickupDate: isContainerSO(container) ? null : container.pickupDate ? container.pickupDate : new Date(),
      };
    });

    setBookingRequest(
      omitBy(isNil)({
        ...bookingRequest,
        containers: writableContainers,
        imo: checkRequestForIMO(containers) || undefined,
        soc: checkRequestForSOC(containers) || undefined,
      }) as BookingRequest,
    );
    handleNext();
  };

  return (
    <Grid container direction="column" spacing={4} style={{ width: '100%' }}>
      <ListInput
        listRef={listInput}
        addButtonRef={addButton}
        ItemInput={ContainerInput}
        ItemInputProps={{
          showLocations: true,
          isDetailedInput: true,
          showLessDetailedInput: !actingAs,
          shouldShowAllDepots: isDashboardUser(userRecord),
        }}
        addText="Add Container"
        defaultItemValue={{ quantity: 1, imo: [false], oog: [false] }}
        value={containers || []}
        onChange={setContainers}
      />
      <Grid item>
        <Button variant="text" color="default" onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={handleContinue} disabled={isNextButtonDisabled}>
          Next
        </Button>
      </Grid>
    </Grid>
  );
};

interface Props {
  quote?: Quote;
  handlePrevious: () => void;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default CargoInfo;
