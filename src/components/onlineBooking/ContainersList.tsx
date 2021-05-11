import { Grid } from '@material-ui/core';
import InfoBoxItem from '../InfoBoxItem';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import IMO from '../../model/IMO';
import OOG from '../../model/OOG';
import React from 'react';

const ContainersList: React.FC<Props> = ({ containers }) => {
  return (
    <Grid container item xs={12} title={'Containers'}>
      {containers.map(container => (
        <Grid item xs={4}>
          <InfoBoxItem
            title={
              <>
                {`${container.quantity} x ${container.containerType?.description}`}
                {container.commodityType && ` - ${container.commodityType?.name}`}
              </>
            }
            label1={
              <>
                {(container.pickupLocation ||
                  container.pickupDate ||
                  container.temperature ||
                  container.humidity ||
                  container.ventilation) &&
                  ` (`}
                {container.pickupLocation &&
                  `${container.pickupLocation?.name}, ${container.pickupLocation?.city}, ${container.pickupLocation?.countryCode}`}
                {container.pickupDate && ` - ${formatDateSafe(container.pickupDate as Date, DateFormats.LONG)}`}
                {container.temperature && `, Temp: ${container.temperature} °C`}
                {container.temperature && (container.humidity || container.ventilation) ? ', ' : null}
                {container.humidity && `Humidity: ${container.humidity}%`}
                {(container.temperature || container.humidity) && container.ventilation ? ', ' : null}
                {container.ventilation && `Ventilation: ${container.ventilation}`}
                {(container.pickupLocation ||
                  container.pickupDate ||
                  container.temperature ||
                  container.humidity ||
                  container.ventilation) &&
                  `)`}
              </>
            }
            label2={
              <>
                {container.containerType &&
                  container.containerType?.description &&
                  container.containerType?.description.includes('S.O.') &&
                  'Container is shipper owned'}
                {container.imo &&
                  container.imo.length > 0 &&
                  container.imo.map(
                    (imoItem: IMO) =>
                      `(${'IMO Class: ' + imoItem.IMOClass} - ${'PG Number: ' + imoItem.PGNumber} - ${'UN Number: ' +
                        imoItem.UNNumber} )`,
                  )}
                {container.oog &&
                  container.oog.length > 0 &&
                  container.oog.map(
                    (oogItem: OOG) =>
                      `(${'Length: ' + oogItem.length} - ${'Width: ' + oogItem.width} - ${'Height: ' +
                        oogItem.height} - ${'Weight: ' + oogItem.weight})`,
                  )}
              </>
            }
            gutterBottom
          />
        </Grid>
      ))}
    </Grid>
  );
};

interface Props {
  containers: any[];
}

export default ContainersList;
