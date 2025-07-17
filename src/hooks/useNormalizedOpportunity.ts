import { normalizeOpportunity } from '../providers/OpportunityProvider';
import { useContext, useMemo } from 'react';
import Users from '../contexts/Users';
import Clients from '../contexts/Clients';
import OpportunityPortsGroups from '../contexts/OpportunityPortsGroups';
import OpportunityPlacesGroups from '../contexts/OpportunityPlacesGroups';
import OpportunityCommodityGroups from '../contexts/OpportunityCommodityGroups';
import OpportunityEquipmentGroups from '../contexts/OpportunityEquipmentGroups';
import OpportunityTags from '../contexts/OpportunityTags';
const useNormalizedOpportunity = () => {
  const users = useContext(Users);
  const clients = useContext(Clients);
  const portsGroups = useContext(OpportunityPortsGroups);
  const placesGroups = useContext(OpportunityPlacesGroups);
  const commodityGroups = useContext(OpportunityCommodityGroups);
  const equipmentGroups = useContext(OpportunityEquipmentGroups);
  const tags = useContext(OpportunityTags);

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
