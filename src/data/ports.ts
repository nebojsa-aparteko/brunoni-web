export interface Port {
  id: string;
  name: string;
  country: string;
  code?: string;
  region: string;
}

// Mock port data - in real app this would come from a database/API
export const MOCK_PORTS: Port[] = [
  // Europe
  { id: '1', name: 'Rotterdam', country: 'Netherlands', code: 'NLRTM', region: 'Europe' },
  { id: '2', name: 'Hamburg', country: 'Germany', code: 'DEHAM', region: 'Europe' },
  { id: '3', name: 'Antwerp', country: 'Belgium', code: 'BEANR', region: 'Europe' },
  { id: '4', name: 'Bremen', country: 'Germany', code: 'DEBRV', region: 'Europe' },
  { id: '5', name: 'Felixstowe', country: 'United Kingdom', code: 'GBFXT', region: 'Europe' },
  { id: '6', name: 'Valencia', country: 'Spain', code: 'ESVLC', region: 'Europe' },
  { id: '7', name: 'Piraeus', country: 'Greece', code: 'GRPIR', region: 'Europe' },
  { id: '8', name: 'Genoa', country: 'Italy', code: 'ITGOA', region: 'Europe' },
  { id: '9', name: 'Barcelona', country: 'Spain', code: 'ESBCN', region: 'Europe' },
  { id: '10', name: 'Le Havre', country: 'France', code: 'FRLEH', region: 'Europe' },

  // Asia
  { id: '11', name: 'Singapore', country: 'Singapore', code: 'SGSIN', region: 'Asia' },
  { id: '12', name: 'Shanghai', country: 'China', code: 'CNSHA', region: 'Asia' },
  { id: '13', name: 'Hong Kong', country: 'China', code: 'HKHKG', region: 'Asia' },
  { id: '14', name: 'Busan', country: 'South Korea', code: 'KRPUS', region: 'Asia' },
  { id: '15', name: 'Port Klang', country: 'Malaysia', code: 'MYPKG', region: 'Asia' },
  { id: '16', name: 'Guangzhou', country: 'China', code: 'CNGZH', region: 'Asia' },
  { id: '17', name: 'Ningbo', country: 'China', code: 'CNNGB', region: 'Asia' },
  { id: '18', name: 'Qingdao', country: 'China', code: 'CNTAO', region: 'Asia' },
  { id: '19', name: 'Tianjin', country: 'China', code: 'CNTXG', region: 'Asia' },
  { id: '20', name: 'Kaohsiung', country: 'Taiwan', code: 'TWKHH', region: 'Asia' },
  { id: '21', name: 'Dalian', country: 'China', code: 'CNDLC', region: 'Asia' },
  { id: '22', name: 'Xiamen', country: 'China', code: 'CNXMN', region: 'Asia' },
  { id: '23', name: 'Laem Chabang', country: 'Thailand', code: 'THLCH', region: 'Asia' },
  { id: '24', name: 'Ho Chi Minh City', country: 'Vietnam', code: 'VNSGN', region: 'Asia' },
  { id: '25', name: 'Kobe', country: 'Japan', code: 'JPUKB', region: 'Asia' },
  { id: '26', name: 'Yokohama', country: 'Japan', code: 'JPYOK', region: 'Asia' },
  { id: '27', name: 'Jakarta', country: 'Indonesia', code: 'IDJKT', region: 'Asia' },
  { id: '28', name: 'Manila', country: 'Philippines', code: 'PHMNL', region: 'Asia' },

  // North America
  { id: '29', name: 'Los Angeles', country: 'USA', code: 'USLAX', region: 'North America' },
  { id: '30', name: 'Long Beach', country: 'USA', code: 'USLGB', region: 'North America' },
  { id: '31', name: 'New York', country: 'USA', code: 'USNYC', region: 'North America' },
  { id: '32', name: 'Savannah', country: 'USA', code: 'USSAV', region: 'North America' },
  { id: '33', name: 'Oakland', country: 'USA', code: 'USOAK', region: 'North America' },
  { id: '34', name: 'Seattle', country: 'USA', code: 'USSEA', region: 'North America' },
  { id: '35', name: 'Charleston', country: 'USA', code: 'USCHS', region: 'North America' },
  { id: '36', name: 'Norfolk', country: 'USA', code: 'USNFK', region: 'North America' },
  { id: '37', name: 'Vancouver', country: 'Canada', code: 'CAVAN', region: 'North America' },
  { id: '38', name: 'Montreal', country: 'Canada', code: 'CAMTR', region: 'North America' },

  // Middle East & Africa
  { id: '39', name: 'Dubai', country: 'UAE', code: 'AEDXB', region: 'Middle East' },
  { id: '40', name: 'Jebel Ali', country: 'UAE', code: 'AEJEA', region: 'Middle East' },
  { id: '41', name: 'Colombo', country: 'Sri Lanka', code: 'LKCMB', region: 'South Asia' },
  { id: '42', name: 'Durban', country: 'South Africa', code: 'ZADUR', region: 'Africa' },
  { id: '43', name: 'Cape Town', country: 'South Africa', code: 'ZACPT', region: 'Africa' },
  { id: '44', name: 'Lagos', country: 'Nigeria', code: 'NGLOS', region: 'Africa' },

  // South America
  { id: '45', name: 'Santos', country: 'Brazil', code: 'BRSSZ', region: 'South America' },
  { id: '46', name: 'Buenos Aires', country: 'Argentina', code: 'ARBUE', region: 'South America' },
  { id: '47', name: 'Valparaiso', country: 'Chile', code: 'CLVAP', region: 'South America' },
  { id: '48', name: 'Callao', country: 'Peru', code: 'PECLL', region: 'South America' },

  // Oceania
  { id: '49', name: 'Sydney', country: 'Australia', code: 'AUSYD', region: 'Oceania' },
  { id: '50', name: 'Melbourne', country: 'Australia', code: 'AUMEL', region: 'Oceania' },
];

// Helper function to get port display name
export const getPortDisplayName = (port: Port): string => {
  return `${port.name}, ${port.country}`;
};

// Helper function to search ports
export const searchPorts = (query: string): Port[] => {
  const lowercaseQuery = query.toLowerCase();
  return MOCK_PORTS.filter(
    port =>
      port.name.toLowerCase().includes(lowercaseQuery) ||
      port.country.toLowerCase().includes(lowercaseQuery) ||
      (port.code && port.code.toLowerCase().includes(lowercaseQuery)),
  );
};
