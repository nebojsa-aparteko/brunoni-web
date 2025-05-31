import { getDistancesByCountryAndCityId } from '../api/countriesAPI';
import RouteFromCityEntity from '../model/RouteFromCity';
import { useEffect, useState } from 'react';

const useDistanceBetweenCities = (countryId: string, startCityId: string) => {
  const [distances, setDistances] = useState<RouteFromCityEntity[]>();

  useEffect(() => {
    if (!countryId || !startCityId) {
      setDistances([]);
      return;
    }

    getDistancesByCountryAndCityId(countryId, startCityId).then(d => {
      setDistances(
        d.docs.map(
          value => ({ ...value.data(), id: value.id }) as RouteFromCityEntity,
        ) as RouteFromCityEntity[],
      );
    });
  }, [countryId, startCityId]);

  return distances;
};

export default useDistanceBetweenCities;
