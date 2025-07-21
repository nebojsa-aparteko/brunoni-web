import { useEffect, useState, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { OpportunityCounter } from '../model/Opportunity';

interface OpportunityCounters {
  [opportunityId: string]: {
    booked: number;
    quoted: number;
  };
}

export const useOpportunityCounters = (opportunityIds: string[]): OpportunityCounters => {
  const [counters, setCounters] = useState<OpportunityCounters>({});
  const currentYear = new Date().getFullYear();

  const stableOpportunityIds = useMemo(() => {
    return [...opportunityIds].sort();
  }, [opportunityIds]);

  const [fetchedIds, setFetchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!stableOpportunityIds.length) {
      setCounters({});
      setFetchedIds(new Set());
      return;
    }

    const idsToFetch = stableOpportunityIds.filter(id => !fetchedIds.has(id));

    if (!idsToFetch.length) {
      console.debug('useOpportunityCounters: All counters already fetched, skipping');
      return;
    }

    console.debug(
      'useOpportunityCounters: Fetching counters for',
      idsToFetch.length,
      'new opportunities',
    );

    const fetchCounters = async () => {
      const counterPromises = idsToFetch.map(async opportunityId => {
        console.debug('useOpportunityCounters: Fetching counters for opportunity', opportunityId);
        try {
          const countersSnapshot = await firebase
            .firestore()
            .collection('opportunities')
            .doc(opportunityId)
            .collection('counters')
            .where('year', '==', currentYear)
            .get();

          let booked = 0;
          let quoted = 0;

          countersSnapshot.docs.forEach(doc => {
            const counter = doc.data() as OpportunityCounter;
            if (counter.entity === 'booking') {
              booked += counter.count || 0;
            } else if (counter.entity === 'quote') {
              quoted += counter.count || 0;
            }
          });

          return {
            opportunityId,
            booked,
            quoted,
          };
        } catch (error) {
          console.error(`Error fetching counters for opportunity ${opportunityId}:`, error);
          return {
            opportunityId,
            booked: 0,
            quoted: 0,
          };
        }
      });

      const results = await Promise.all(counterPromises);

      setFetchedIds(prevFetched => {
        const newFetched = new Set(prevFetched);
        idsToFetch.forEach(id => newFetched.add(id));
        return newFetched;
      });

      setCounters(prevCounters => {
        const newCounters = { ...prevCounters };

        results.forEach(({ opportunityId, booked, quoted }) => {
          newCounters[opportunityId] = { booked, quoted };
        });

        const hasChanged = results.some(({ opportunityId, booked, quoted }) => {
          const prev = prevCounters[opportunityId];
          return !prev || prev.booked !== booked || prev.quoted !== quoted;
        });

        return hasChanged ? newCounters : prevCounters;
      });
    };

    fetchCounters();
  }, [stableOpportunityIds, currentYear, fetchedIds]);

  return useMemo(() => counters, [counters]);
};
