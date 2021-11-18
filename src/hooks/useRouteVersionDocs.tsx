import useFirestoreCollection from './useFirestoreCollection';
import { ChecklistItemValueDocument } from '../components/bookings/checklist/ChecklistItemModel';

const useRouteVersionDocs = (providerId: string, version: string) => {
  const versionDocsRef = useFirestoreCollection(
    `land-transport-config/${providerId}/routes/${version}/versionDocuments`,
  );
  if (!versionDocsRef) return [];
  return versionDocsRef.docs.map(v => v.data() as ChecklistItemValueDocument);
};

export default useRouteVersionDocs;
