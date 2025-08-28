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

  const usersMap = new Map(users?.map(u => [u.id, u]));
  const clientsMap = new Map(clients?.map(c => [c.id, c]));
  const portsMap = new Map(ports?.map(p => [p.id, p]));
  const containersMap = new Map(containers?.map(c => [c.id, c]));
  const portsGroupsMap = new Map(portsGroups?.map(pg => [pg.id, pg]));
  const placesGroupsMap = new Map(placesGroups?.map(pg => [pg.id, pg]));
  const commodityGroupsMap = new Map(commodityGroups?.map(cg => [cg.id, cg]));
  const equipmentGroupsMap = new Map(equipmentGroups?.map(eg => [eg.id, eg]));
  const tagsMap = new Map(tags?.map(t => [t.id, t]));

  // Fetch bookings and quotes collections

  return useMemo(() => {
    const getUser = (id: string) => usersMap.get(id) || null;
    const getClient = (id: string) => clientsMap.get(id) || null;

    const getPortsGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'portId') {
        return { definition: omd, value: portsMap.get(omd.value) || null };
      } else if (omd.type === 'groupId') {
        return { definition: omd, value: portsGroupsMap.get(omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getPlacesGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return { definition: omd, value: placesGroupsMap.get(omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getCommodityGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return { definition: omd, value: commodityGroupsMap.get(omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getEquipmentGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return { definition: omd, value: equipmentGroupsMap.get(omd.value) || null };
      } else if (omd.type === 'containerTypeId') {
        return { definition: omd, value: containersMap.get(omd.value) || null };
      } else {
        return { definition: omd, value: omd.value };
      }
    };

    const getTag = (id: string) => tagsMap.get(id) || null;

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
    usersMap,
    clientsMap,
    portsGroupsMap,
    placesGroupsMap,
    commodityGroupsMap,
    equipmentGroupsMap,
    portsMap,
    containersMap,
    tagsMap,
  ]);
};

export default useNormalizedOpportunityDefinition;
