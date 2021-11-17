import useFirestoreCollection from './useFirestoreCollection';
import ProviderPricelistEntity, {
  isExportProviderPricelistEntity,
  isImportProviderPricelistEntity,
} from '../model/land-transport/providers/ProviderPricelists';

const useLandTransportPricelists = (providerId: string) => {
  const landTransportProfitsRef = useFirestoreCollection(`land-transport-config/${providerId}/pricelist`);
  return landTransportProfitsRef?.docs
    .map(
      v =>
        ({
          ...v.data(),
          id: v.id,
        } as ProviderPricelistEntity),
    )
    .reduce(
      (previousValue, currentValue) => {
        if (isExportProviderPricelistEntity(currentValue)) {
          previousValue.exportPricelistEntities.push(currentValue);
        } else if (isImportProviderPricelistEntity(currentValue)) {
          previousValue.importPricelistEntities.push(currentValue);
        }
        return previousValue;
      },
      {
        exportPricelistEntities: [] as ProviderPricelistEntity[],
        importPricelistEntities: [] as ProviderPricelistEntity[],
      },
    ) as { exportPricelistEntities: ProviderPricelistEntity[]; importPricelistEntities: ProviderPricelistEntity[] };
};

export default useLandTransportPricelists;
