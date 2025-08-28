import { useEffect, useMemo, useState } from 'react';
import firebase from '../firebase';
import { OpportunityCounter } from '../model/Opportunity';

type OpportunityCounters = Map<
  string,
  { booked: number; quoted: number; bookedTEU: number; quotedTEU: number }
>;

const getCountersForOpportunity = async (opportunityId: string, year: number) => {
  try {
    const countersSnapshot = await firebase
      .firestore()
      .collection('opportunities')
      .doc(opportunityId)
      .collection('counters')
      .where('year', '==', year)
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
};

export const useOpportunityCounters = (opportunityIds: string[]): OpportunityCounters => {
  const [counters, setCounters] = useState<OpportunityCounters>(new Map());

  useEffect(() => {
    if (!opportunityIds.length) {
      setCounters(new Map());
      return;
    }

    const currentYear = new Date().getFullYear();

    const fetchCounters = async () => {
      const results = await Promise.all(
        opportunityIds.map(async opportunityId => {
          return getCountersForOpportunity(opportunityId, currentYear);
        }),
      );

      setCounters(prevCounters => {
        const hasChanged = results.some(
          ({ opportunityId, booked, quoted, bookedTEU, quotedTEU }) => {
            const prev = prevCounters.get(opportunityId);
            return (
              !prev ||
              prev.booked !== booked ||
              prev.quoted !== quoted ||
              prev.bookedTEU !== bookedTEU ||
              prev.quotedTEU !== quotedTEU
            );
          },
        );

        // if not changed, do not update state
        if (!hasChanged) {
          return prevCounters;
        }

        const newCounters = new Map(prevCounters);
        results.forEach(({ opportunityId, booked, quoted, bookedTEU, quotedTEU }) => {
          newCounters.set(opportunityId, { booked, quoted, bookedTEU, quotedTEU });
        });
        return newCounters;
      });
    };

    fetchCounters().catch(error => console.error('Error calculating counters:', error));
  }, [opportunityIds]);

  return useMemo(() => counters, [counters]);
};
