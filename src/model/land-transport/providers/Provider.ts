import Entity from '../../Entity';

interface ProviderEntity extends Entity {
  name: string;
}

export type Provider = Omit<ProviderEntity, 'id' | 'createdAt'>;

export default ProviderEntity;
