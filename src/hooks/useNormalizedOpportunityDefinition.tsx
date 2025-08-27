import { normalizeOpportunityMatch } from '../providers/OpportunityMatchProvider';
import { useContext, useMemo } from 'react';
import useOpportunityPortsGroups from './useOpportunityPortsGroups';
import useOpportunityPlacesGroups from './useOpportunityPlacesGroups';
import useOpportunityCommodityGroups from './useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from './useOpportunityEquipmentGroups';
import useClients from './useClients';
import UserRecords from '../contexts/UserRecordsContext';
import { OpportunityMatchDefinition } from '../model/Opportunity';
import Ports from '../contexts/Ports';
import ContainerTypes from '../contexts/ContainerTypes';
import UserRecord from '../model/UserRecord';
import Client from '../model/Client';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import { OpportunityTag } from '../model/OpportunityTag';
import useOpportunityTags from './useOpportunityTags';

export interface OpportunityDefinitionNormalizator {
  getUser: (id: string) => UserRecord | null;
  getClient: (id: string) => Client | null;
  getPortsGroup: (omd: OpportunityMatchDefinition<string>) => OpportunityPortsGroup | null;
  getPlacesGroup: (omd: OpportunityMatchDefinition<string>) => OpportunityPlacesGroup | null;
  getCommodityGroup: (omd: OpportunityMatchDefinition<string>) => OpportunityCommodityGroup | null;
  getEquipmentGroup: (omd: OpportunityMatchDefinition<string>) => OpportunityEquipmentGroup | null;
  getTag: (id: string) => OpportunityTag | null;
}

const useNormalizedOpportunityDefinition = () => {
  const users = useContext(UserRecords);
  const clients = useClients();
  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const ports = useContext(Ports);
  const containers = useContext(ContainerTypes);
  const tags = useOpportunityTags();

  // Fetch bookings and quotes collections

  return useMemo(() => {
    const getUser = (id: string) => users?.find(u => u.id === id) || null;
    const getClient = (id: string) => clients?.find(c => c.id === id) || null;

    const getPortsGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'portId') {
        return { definition: omd, value: ports?.find(g => g.id === omd.value) || null };
      } else if (omd.type === 'groupId') {
        return { definition: omd, value: portsGroups?.find(p => p.id === omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getPlacesGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return { definition: omd, value: placesGroups?.find(g => g.id === omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getCommodityGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return { definition: omd, value: commodityGroups?.find(g => g.id === omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getEquipmentGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return { definition: omd, value: equipmentGroups?.find(g => g.id === omd.value) || null };
      } else if (omd.type === 'containerTypeId') {
        return { definition: omd, value: containers?.find(c => c.id === omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getTag = (id: string) => tags?.find(t => t.id === id) || null;

    return {
      getUser,
      getClient,
      getPortsGroup,
      getPlacesGroup,
      getCommodityGroup,
      getEquipmentGroup,
      getTag,
    } as OpportunityDefinitionNormalizator;
  }, [
    users,
    clients,
    portsGroups,
    placesGroups,
    commodityGroups,
    equipmentGroups,
    ports,
    containers,
    tags,
  ]);
};

export default useNormalizedOpportunityDefinition;
