interface ProviderEntity {
  id: string;
  name: string;
}

export type Provider = Omit<ProviderEntity, 'id'>;

export default ProviderEntity;
