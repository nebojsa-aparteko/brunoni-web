export interface Equipment {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
}

// Mock equipment data - in real app this would come from a database/API
export const MOCK_EQUIPMENT: Equipment[] = [
  // Containers
  {
    id: '1',
    name: '20ft Standard Container',
    type: 'Container',
    category: 'Dry Container',
    description: 'Standard 20-foot dry container',
  },
  {
    id: '2',
    name: '40ft Standard Container',
    type: 'Container',
    category: 'Dry Container',
    description: 'Standard 40-foot dry container',
  },
  {
    id: '3',
    name: '40ft High Cube Container',
    type: 'Container',
    category: 'Dry Container',
    description: '40-foot high cube container',
  },
  {
    id: '4',
    name: '45ft High Cube Container',
    type: 'Container',
    category: 'Dry Container',
    description: '45-foot high cube container',
  },
  {
    id: '5',
    name: '20ft Refrigerated Container',
    type: 'Container',
    category: 'Reefer Container',
    description: 'Temperature-controlled container',
  },
  {
    id: '6',
    name: '40ft Refrigerated Container',
    type: 'Container',
    category: 'Reefer Container',
    description: 'Large temperature-controlled container',
  },
  {
    id: '7',
    name: '20ft Open Top Container',
    type: 'Container',
    category: 'Special Container',
    description: 'Container with removable top',
  },
  {
    id: '8',
    name: '40ft Open Top Container',
    type: 'Container',
    category: 'Special Container',
    description: 'Large container with removable top',
  },
  {
    id: '9',
    name: '20ft Flat Rack Container',
    type: 'Container',
    category: 'Special Container',
    description: 'Platform with collapsible sides',
  },
  {
    id: '10',
    name: '40ft Flat Rack Container',
    type: 'Container',
    category: 'Special Container',
    description: 'Large platform with collapsible sides',
  },

  // Trailers
  {
    id: '11',
    name: 'Standard Semi-Trailer',
    type: 'Trailer',
    category: 'Road Transport',
    description: 'Standard road transport trailer',
  },
  {
    id: '12',
    name: 'Refrigerated Trailer',
    type: 'Trailer',
    category: 'Road Transport',
    description: 'Temperature-controlled trailer',
  },
  {
    id: '13',
    name: 'Flatbed Trailer',
    type: 'Trailer',
    category: 'Road Transport',
    description: 'Open platform trailer',
  },
  {
    id: '14',
    name: 'Lowboy Trailer',
    type: 'Trailer',
    category: 'Road Transport',
    description: 'Low-profile heavy equipment trailer',
  },
  {
    id: '15',
    name: 'Tank Trailer',
    type: 'Trailer',
    category: 'Road Transport',
    description: 'Liquid transport trailer',
  },

  // Rail Equipment
  {
    id: '16',
    name: 'Standard Rail Car',
    type: 'Rail Car',
    category: 'Rail Transport',
    description: 'Standard railway freight car',
  },
  {
    id: '17',
    name: 'Refrigerated Rail Car',
    type: 'Rail Car',
    category: 'Rail Transport',
    description: 'Temperature-controlled rail car',
  },
  {
    id: '18',
    name: 'Tank Rail Car',
    type: 'Rail Car',
    category: 'Rail Transport',
    description: 'Liquid transport rail car',
  },
  {
    id: '19',
    name: 'Flatcar',
    type: 'Rail Car',
    category: 'Rail Transport',
    description: 'Open platform rail car',
  },
  {
    id: '20',
    name: 'Hopper Car',
    type: 'Rail Car',
    category: 'Rail Transport',
    description: 'Bulk cargo rail car',
  },

  // Handling Equipment
  {
    id: '21',
    name: 'Reach Stacker',
    type: 'Handling Equipment',
    category: 'Port Equipment',
    description: 'Container handling equipment',
  },
  {
    id: '22',
    name: 'Container Crane',
    type: 'Handling Equipment',
    category: 'Port Equipment',
    description: 'Large container lifting crane',
  },
  {
    id: '23',
    name: 'Forklift',
    type: 'Handling Equipment',
    category: 'Warehouse Equipment',
    description: 'Material handling vehicle',
  },
  {
    id: '24',
    name: 'Side Loader',
    type: 'Handling Equipment',
    category: 'Port Equipment',
    description: 'Side-loading container handler',
  },
  {
    id: '25',
    name: 'Mobile Harbor Crane',
    type: 'Handling Equipment',
    category: 'Port Equipment',
    description: 'Mobile port crane',
  },

  // Specialized Equipment
  {
    id: '26',
    name: 'ISO Tank Container',
    type: 'Container',
    category: 'Liquid Container',
    description: 'Standardized liquid transport container',
  },
  {
    id: '27',
    name: 'Bulk Container',
    type: 'Container',
    category: 'Bulk Container',
    description: 'Dry bulk cargo container',
  },
  {
    id: '28',
    name: 'Car Carrier Trailer',
    type: 'Trailer',
    category: 'Specialized Transport',
    description: 'Vehicle transport trailer',
  },
  {
    id: '29',
    name: 'Livestock Trailer',
    type: 'Trailer',
    category: 'Specialized Transport',
    description: 'Animal transport trailer',
  },
  {
    id: '30',
    name: 'Container Chassis',
    type: 'Chassis',
    category: 'Road Transport',
    description: 'Container transport chassis',
  },

  // Air Cargo Equipment
  {
    id: '31',
    name: 'ULD Container',
    type: 'Air Cargo',
    category: 'Air Transport',
    description: 'Unit Load Device for aircraft',
  },
  {
    id: '32',
    name: 'Air Cargo Pallet',
    type: 'Air Cargo',
    category: 'Air Transport',
    description: 'Aircraft cargo pallet',
  },

  // Warehouse Equipment
  {
    id: '33',
    name: 'Warehouse Pallet',
    type: 'Warehouse Equipment',
    category: 'Storage',
    description: 'Standard storage pallet',
  },
  {
    id: '34',
    name: 'Pallet Rack',
    type: 'Warehouse Equipment',
    category: 'Storage',
    description: 'Pallet storage system',
  },
  {
    id: '35',
    name: 'Conveyor System',
    type: 'Warehouse Equipment',
    category: 'Material Handling',
    description: 'Automated material transport',
  },
];

// Helper function to get equipment display name
export const getEquipmentDisplayName = (equipment: Equipment): string => {
  return `${equipment.name} (${equipment.type})`;
};

// Helper function to search equipment
export const searchEquipment = (query: string): Equipment[] => {
  const lowercaseQuery = query.toLowerCase();
  return MOCK_EQUIPMENT.filter(
    equipment =>
      equipment.name.toLowerCase().includes(lowercaseQuery) ||
      equipment.type.toLowerCase().includes(lowercaseQuery) ||
      equipment.category.toLowerCase().includes(lowercaseQuery) ||
      (equipment.description && equipment.description.toLowerCase().includes(lowercaseQuery)),
  );
};
