import useAPI from './useAPI';

const useLandTransportLocations = () => {
  const { get } = useAPI();
  return {
    getLocationsByName: async (name: string) =>
      await get('landTransport/findLocations', { cityName: name.toUpperCase() }),
    getAllLocations: async () => await get('landTransport/allLocations'),
  };
};

export default useLandTransportLocations;
