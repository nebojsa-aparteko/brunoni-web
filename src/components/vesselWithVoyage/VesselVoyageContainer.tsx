import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import useVesselWithVoyage, { normalizeVesselData } from '../../hooks/useVesselWithVoyage';
import VesselVoyageItem from './VesselVoyageItem';
import firebase from '../../firebase';
import VesselWithVoyage from '../../model/VesselWithVoyage';

const groups = ['vesselWithVoyage', 'pol'];

const VesselVoyageContainer: React.FC<Props> = () => {
  // const [vessel, setVessel] = useState<VesselWithVoyage[]>([]);
  const vessel = useVesselWithVoyage();
  // useEffect(() => {
  //   firebase
  //     .firestore()
  //     .collectionGroup('vesVoyCollection')
  //     .where('ets', '>', new Date())
  //     .get()
  //     .then(result => {
  //       // console.log(
  //       //   'Vessel ',
  //       //   result.docs.map(d => ({
  //       //     ...normalizeVesselData(d.data()),
  //       //     vesselWithVoyage: d.ref.parent.parent?.id,
  //       //   })),
  //       // );
  //       setVessel(
  //         result.docs.map(d => ({
  //           ...normalizeVesselData(d.data()),
  //           vesselWithVoyage: d.ref.parent.parent?.id,
  //         })) as VesselWithVoyage[],
  //       );
  //     });
  // }, []);

  const normalizedVessel = useMemo(
    () =>
      vessel?.reduce((r: any, o: any) => {
        groups
          .reduce(
            (group: any, key: any, i, { length }) => (group[o[key]] = group[o[key]] || (i + 1 === length ? [] : {})),
            r,
          )
          .push(o);
        return r;
      }, {}),
    [vessel],
  );
  return (
    <Card>
      <CardHeader title="Vessel with voyage overview" />
      <CardContent>
        {normalizedVessel &&
          Object.entries(normalizedVessel).map(([vessel, items]: any, index: number) => (
            <VesselVoyageItem vessel={vessel} items={items} key={vessel} />
          ))}
      </CardContent>
    </Card>
  );
};

export default VesselVoyageContainer;

interface Props {}
