import { useEffect, useMemo, useRef, useState } from 'react';
import firebase from '../firebase';
import { OpportunityCounter } from '../model/Opportunity';

type YearTotals = {
  booked?: number;
  quoted?: number;
  bookedTEU?: number;
  quotedTEU?: number;
};

type OpportunityCounters = Map<string, YearTotals>;

const getCountersForOpportunity = async (
  opportunityId: string,
  year: number,
): Promise<{ opportunityId: string } & YearTotals> => {
  try {
    const snapshot = await firebase
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

    snapshot.docs.forEach(doc => {
      const counter = doc.data() as OpportunityCounter;

      if (counter.entity === 'booking') {
        booked += counter.count || 0;
        bookedTEU += counter.teuCount || 0;
      } else if (counter.entity === 'quote') {
        quoted += counter.count || 0;
        quotedTEU += counter.teuCount || 0;
      }
    });

    return { opportunityId, booked, quoted, bookedTEU, quotedTEU };
  } catch (error) {
    console.error(`[Counters] Error fetching counters for opportunity ${opportunityId}:`, error);
    return { opportunityId, booked: 0, quoted: 0, bookedTEU: 0, quotedTEU: 0 };
  }
};

export const useOpportunityCounters = (
  opportunityIds: string[],
  year?: number,
): OpportunityCounters => {
  const [counters, setCounters] = useState<OpportunityCounters>(new Map());
  const requestIdRef = useRef(0);

  const selectedYear = year ?? new Date().getFullYear();

  // stable key to avoid effect loops
  const idsKey = useMemo(() => opportunityIds.join('|'), [opportunityIds]);

  useEffect(() => {
    if (!opportunityIds.length) {
      setCounters(new Map());
      return;
    }

    // clear stale counters immediately on year / ids change
    setCounters(new Map());

    const requestId = ++requestIdRef.current;

    const fetchCounters = async () => {
      const results = await Promise.all(
        opportunityIds.map(id => getCountersForOpportunity(id, selectedYear)),
      );

      // ignore stale responses
      if (requestId !== requestIdRef.current) return;

      setCounters(() => {
        const next = new Map<string, YearTotals>();
        results.forEach(({ opportunityId, booked, quoted, bookedTEU, quotedTEU }) => {
          next.set(opportunityId, { booked, quoted, bookedTEU, quotedTEU });
        });
        return next;
      });
    };

    fetchCounters().catch(err => console.error('Error fetching opportunity counters:', err));
  }, [idsKey, selectedYear]);

  return useMemo(() => counters, [counters]);
};
