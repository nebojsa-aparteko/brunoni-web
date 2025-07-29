import { useMemo } from 'react';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import Port from '../model/Port';
import useFirestoreCollection from './useFirestoreCollection';
import { OpportunityMatchDefinition } from '../model/Opportunity';

const useOpportunityPortsWithDefinition = ():
  | {
      definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
      value: OpportunityPortsGroup | Port | string;
    }[]
  | null => {
  const portsGroupsCollectionSnapshot = useFirestoreCollection('opportunity-ports-groups');
  const portsCollectionSnapshot = useFirestoreCollection('ports');
  return useMemo(() => {
    if (!portsGroupsCollectionSnapshot) return null;

    const portsCollection = portsGroupsCollectionSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as OpportunityPortsGroup[];

    const portsGroups = portsCollection.map(group => ({
      definition: { type: 'groupId' as const, value: group.id },
      value: group,
    }));

    const portsFreeText = portsCollection.reduce(
      (acc, group) =>
        acc.concat(
          (group.portNames || []).map((portName: string) => ({
            definition: { type: 'freeText' as const, value: portName },
            value: portName,
          })),
        ),
      [] as { definition: OpportunityMatchDefinition<'freeText'>; value: string }[],
    );

    const ports =
      portsCollectionSnapshot?.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            city: data.city || '',
            country: data.country || '',
          } as Port;
        })
        .map(port => ({
          definition: { type: 'portId' as const, value: port.id },
          value: port,
        })) || [];

    return [...portsGroups, ...portsFreeText, ...ports];
  }, [portsGroupsCollectionSnapshot, portsCollectionSnapshot]);
};

export default useOpportunityPortsWithDefinition;
