import { useEffect, useMemo, useState } from 'react';
import firebase from '../firebase';
import { OpportunityCounter } from '../model/Opportunity';

interface OpportunityCounters {
  [opportunityId: string]: {
    booked: number;
    quoted: number;
    bookedTEU: number;
    quotedTEU: number;
  };
}

export const useOpportunityCounters = (opportunityIds: string[]): OpportunityCounters => {
  const [counters, setCounters] = useState<OpportunityCounters>({});

  useEffect(() => {
    if (!opportunityIds.length) {
      setCounters({});
      return;
    }

    const currentYear = new Date().getFullYear();

    const fetchCounters = async () => {
      const counterPromises = opportunityIds.map(async opportunityId => {
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
          let bookedTEU = 0;
          let quotedTEU = 0;

          countersSnapshot.docs.forEach(doc => {
            const counter = doc.data() as OpportunityCounter;
            if (counter.entity === 'booking') {
              booked += counter.count || 0;
              bookedTEU += counter.teuCount || 0;
            } else if (counter.entity === 'quote') {
              quoted += counter.count || 0;
              quotedTEU += counter.teuCount || 0;
            }
          });

          return {
            opportunityId,
            booked,
            quoted,
            bookedTEU,
            quotedTEU,
          };
        } catch (error) {
          console.error(`Error fetching counters for opportunity ${opportunityId}:`, error);
          return {
            opportunityId,
            booked: 0,
            quoted: 0,
            bookedTEU: 0,
            quotedTEU: 0,
          };
        }
      });

      const results = await Promise.all(counterPromises);

      setCounters(prevCounters => {
        const newCounters = { ...prevCounters };

        results.forEach(({ opportunityId, booked, quoted, bookedTEU, quotedTEU }) => {
          newCounters[opportunityId] = { booked, quoted, bookedTEU, quotedTEU };
        });

        const hasChanged = results.some(
          ({ opportunityId, booked, quoted, bookedTEU, quotedTEU }) => {
            const prev = prevCounters[opportunityId];
            return (
              !prev ||
              prev.booked !== booked ||
              prev.quoted !== quoted ||
              prev.bookedTEU !== bookedTEU ||
              prev.quotedTEU !== quotedTEU
            );
          },
        );

        return hasChanged ? newCounters : prevCounters;
      });
    };

    fetchCounters().catch(error => console.error('Error calculating counters:', error));
  }, [opportunityIds]);

  return useMemo(() => counters, [counters]);
};
