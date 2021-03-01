import { ReassignmentRule } from '../model/ReassignmentRule';
import useFirestoreCollection from './useFirestoreCollection';

export default function useReassignmentRules() {
  const reassignmentRulesDocs = useFirestoreCollection('reassignment-rules');
  return reassignmentRulesDocs?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ReassignmentRule[];
}
