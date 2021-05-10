import useFirestoreCollection from './useFirestoreCollection';
import PortTerm, { normalizePortTerm } from '../model/PortTerm';

export default function usePortTerms() {
  const termsCollection = useFirestoreCollection('port-terms');

  return termsCollection?.docs.map(doc => {
    return { id: doc.id, ...normalizePortTerm(doc.data()) } as PortTerm;
  }) as PortTerm[];
}
