import { normalizeOpportunity } from '../providers/OpportunityProvider';
import { useContext, useMemo } from 'react';
import useOpportunityPortsGroups from './useOpportunityPortsGroups';
import useOpportunityPlacesGroups from './useOpportunityPlacesGroups';
import useOpportunityCommodityGroups from './useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from './useOpportunityEquipmentGroups';
import useOpportunityTags from './useOpportunityTags';
import useClients from './useClients';
import UserRecords from '../contexts/UserRecordsContext';

const useNormalizedOpportunity = () => {
  const users = useContext(UserRecords);
  const clients = useClients();
  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const tags = useOpportunityTags();

  return useMemo(() => {
    const getUser = (id: string) => users?.find(u => u.id === id) || null;
    const getClient = (id: string) => clients?.find(c => c.id === id) || null;
    const getPortsGroup = (id: string) => portsGroups?.find(g => g.id === id) || null;
    const getPlacesGroup = (id: string) => placesGroups?.find(g => g.id === id) || null;
    const getCommodityGroup = (id: string) => commodityGroups?.find(g => g.id === id) || null;
    const getEquipmentGroup = (id: string) => equipmentGroups?.find(g => g.id === id) || null;
    const getTag = (id: string) => tags?.find(t => t.id === id) || null;

    return normalizeOpportunity(
      getUser,
      getClient,
      getPortsGroup,
      getPlacesGroup,
      getCommodityGroup,
      getEquipmentGroup,
      getTag,
    );
  }, [users, clients, portsGroups, placesGroups, commodityGroups, equipmentGroups, tags]);
};

export default useNormalizedOpportunity;
