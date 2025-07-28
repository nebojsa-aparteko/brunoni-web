import { normalizeOpportunity } from '../providers/OpportunityProvider';
import { useContext, useMemo } from 'react';
import useOpportunityPortsGroups from './useOpportunityPortsGroups';
import useOpportunityPlacesGroups from './useOpportunityPlacesGroups';
import useOpportunityCommodityGroups from './useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from './useOpportunityEquipmentGroups';
import useOpportunityTags from './useOpportunityTags';
import useClients from './useClients';
import UserRecords from '../contexts/UserRecordsContext';
import { useOpportunityCounters } from './useOpportunityCounters';
import { OpportunityMatchDefinition } from '../model/Opportunity';
const useNormalizedOpportunity = (opportunityIds: string[]) => {
  const users = useContext(UserRecords);
  const clients = useClients();
  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const tags = useOpportunityTags();
  const counters = useOpportunityCounters(opportunityIds);

  return useMemo(() => {
    const getUser = (id: string) => users?.find(u => u.id === id) || null;
    const getClient = (id: string) => clients?.find(c => c.id === id) || null;
    const getPortsGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      console.debug('getPortsGroup called with omd:', omd);
      if (omd.type === 'portId') {
        return portsGroups?.find(g => g.id === omd.value) || null;
      } else if (omd.type === 'groupId') {
        return portsGroups?.find(g => g.id === omd.value) || null;
      } else {
        return omd.value;
      }
    };
    const getPlacesGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return placesGroups?.find(g => g.id === omd.value) || null;
      } else {
        return omd.value;
      }
    };
    const getCommodityGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return commodityGroups?.find(g => g.id === omd.value) || null;
      } else {
        return omd.value;
      }
    };
    const getEquipmentGroup = (omd: OpportunityMatchDefinition) => {
      if (!omd) return null;
      if (omd.type === 'groupId') {
        return equipmentGroups?.find(g => g.id === omd.value) || null;
      } else {
        return omd.value;
      }
    };
    const getTag = (id: string) => tags?.find(t => t.id === id) || null;
    const getCounters = (id: string) =>
      counters[id] || { booked: 0, bookedTEU: 0, quoted: 0, quotedTEU: 0 };

    return normalizeOpportunity(
      getUser,
      getClient,
      getPortsGroup,
      getPlacesGroup,
      getCommodityGroup,
      getEquipmentGroup,
      getTag,
      getCounters,
    );
  }, [users, clients, portsGroups, placesGroups, commodityGroups, equipmentGroups, tags, counters]);
};

export default useNormalizedOpportunity;
