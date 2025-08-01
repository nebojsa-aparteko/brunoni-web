import { normalizeOpportunityMatch } from '../providers/OpportunityMatchProvider';
import { useContext, useMemo } from 'react';
import useOpportunityPortsGroups from './useOpportunityPortsGroups';
import useOpportunityPlacesGroups from './useOpportunityPlacesGroups';
import useOpportunityCommodityGroups from './useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from './useOpportunityEquipmentGroups';
import useClients from './useClients';
import UserRecords from '../contexts/UserRecordsContext';
import {
  OpportunityMatchDefinition,
  EntityOpportunityMatch,
  NormalizedEntityOpportunityMatch,
} from '../model/Opportunity';
import Ports from '../contexts/Ports';
import ContainerTypes from '../contexts/ContainerTypes';
import useFirestoreCollection from './useFirestoreCollection';

const useNormalizedOpportunityMatch = () => {
  const users = useContext(UserRecords);
  const clients = useClients();
  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const ports = useContext(Ports);
  const containers = useContext(ContainerTypes);

  console.debug('useNormalizedOpportunityMatch');
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

    return normalizeOpportunityMatch(
      getUser,
      getClient,
      getPortsGroup,
      getPlacesGroup,
      getCommodityGroup,
      getEquipmentGroup,
    );
  }, [
    users,
    clients,
    portsGroups,
    placesGroups,
    commodityGroups,
    equipmentGroups,
    ports,
    containers,
  ]);
};

export default useNormalizedOpportunityMatch;
