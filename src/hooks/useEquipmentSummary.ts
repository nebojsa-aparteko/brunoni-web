import { useEffect, useMemo, useState } from 'react';
import { EquipmentExportSummary, EquipmentImportSummary } from '../model/EquipmentControl';
import { useEquipmentControlFilterProviderContext } from '../providers/EquipmentControlFilterProvider';
import { BookingCategory, BookingVersion } from '../model/Booking';
import useUser from './useUser';
import { flatMap } from 'lodash';

export default function useEquipmentSummary<T extends BookingCategory>(
  category: T,
): T extends BookingCategory.Export ? EquipmentExportSummary[] : EquipmentImportSummary[] {
  const [filters] = useEquipmentControlFilterProviderContext();
  const [user] = useUser();
  const [equipmentControl, setEquipmentControl] = useState<any[]>([]);
  // const query = useMemo(
  //   () => (collection: firebase.firestore.Query) => {
  //     let query = collection;
  //     // query = query.where(firebase.firestore.FieldPath.documentId(), '!=', '0');
  //     if (category === BookingCategory.Export) {
  //       query = query.where('year', '==', getYear(new Date()));
  //       query = query.where('week', '>=', getWeek(new Date(), { weekStartsOn: 1 }));
  //       query = query.where('week', '<=', getWeek(addWeeks(new Date(), 3), { weekStartsOn: 1 }));
  //       query = query.orderBy('week', 'asc');
  //     }
  //     return query;
  //   },
  //   [category],
  // );
  useEffect(() => {
    const unsubscribe = setInterval(() => {
      user
        .getIdToken()
        .then(token => {
          return getEquipmentSummary(
            token,
            filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id!,
            BookingVersion.long,
            category,
          );
        })
        .then(
          (
            value: {
              [k: string]: {
                [k: string]: {};
              };
            }[],
          ) => {
            if (value && Array.isArray(value))
              setEquipmentControl(
                flatMap(
                  value?.map(e =>
                    Object.entries(e)?.map(([k, v]) => ({
                      id: k,
                      ...v,
                    })),
                  ),
                ),
              );
          },
        );

      return () => clearInterval(unsubscribe);
    }, 600000);
  }, [filters, user]);
  useEffect(() => {
    user
      .getIdToken()
      .then(token => {
        return getEquipmentSummary(
          token,
          filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id!,
          BookingVersion.long,
          category,
        );
      })
      .then(
        (
          value: {
            [k: string]: {
              [k: string]: {};
            };
          }[],
        ) => {
          if (value && Array.isArray(value))
            setEquipmentControl(flatMap(value?.map(e => Object.entries(e)?.map(([k, v]) => ({ id: k, ...v })))));
        },
      );
  }, [filters, user]);

  // const equipmentSummary = useFirestoreCollection(
  //   'sum-equipment-control',
  //   query,
  //   `${filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id}-${category}-${filters.version}`,
  //   'summary',
  // );
  // if (category === BookingCategory.Export) {
  //   return equipmentSummary?.docs.map(doc => {
  //     return { ...doc.data(), id: doc.id } as EquipmentExportSummary;
  //   }) as any;
  // } else {
  //   return equipmentSummary?.docs.map(doc => {
  //     return { ...doc.data(), id: doc.id } as EquipmentImportSummary;
  //   }) as any;
  // }

  return useMemo(() => {
    return equipmentControl as any;
  }, [equipmentControl]);
}

const getEquipmentSummary = async (
  token: string,
  carrierId: string,
  version: BookingVersion,
  category: BookingCategory,
) => {
  try {
    let url: string;
    if (category === BookingCategory.Export) {
      url = `${process.env.REACT_APP_API_URL}/equipmentControl/getExport?carrierId=${carrierId}&version=${version}&startWeek=14&endWeek=16`;
    } else {
      url = `${process.env.REACT_APP_API_URL}/equipmentControl?carrierId=${carrierId}&version=${version}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const body = await response.json();
      console.log('Body', body);
      return body;
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
      return body;
    }
  } catch (e) {
    console.error('Failed to perform request', e);
  } finally {
  }
};
