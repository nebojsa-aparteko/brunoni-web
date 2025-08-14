import { useMemo } from 'react';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import useFirestoreCollection from './useFirestoreCollection';
import { OpportunityMatchDefinition } from '../model/Opportunity';

const useOpportunityPlacesWithDefinition = ():
  | {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityPlacesGroup | string;
    }[]
  | null => {
  const placesGroupsCollection = useFirestoreCollection('opportunity-places-groups');

  return useMemo(() => {
    if (!placesGroupsCollection) return null;

    const placesCollection = placesGroupsCollection.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as OpportunityPlacesGroup[];

    const placesGroups = placesCollection.map(group => ({
      definition: { type: 'groupId' as const, value: group.id },
      value: group,
    }));

    const placesFreeText = placesCollection.reduce(
      (acc, group) =>
        acc.concat(
          (group.places || []).map((place: string) => ({
            definition: { type: 'freeText' as const, value: place },
            value: place,
          })),
        ),
      [] as { definition: OpportunityMatchDefinition<'freeText'>; value: string }[],
    );

    return [...placesGroups, ...placesFreeText];
  }, [placesGroupsCollection]);
};

export default useOpportunityPlacesWithDefinition;
