import Entity from '../../Entity';

interface ProviderEntity extends Entity {
  name: string;
  active: boolean;
}

export type Provider = Omit<ProviderEntity, 'id' | 'createdAt'>;

export default ProviderEntity;
