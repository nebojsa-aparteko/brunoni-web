import { useEffect, useMemo, useState } from 'react';
import { EquipmentExportSummary, EquipmentImportSummary } from '../model/EquipmentControl';
import {
  EquipmentControlFilterContext,
  useEquipmentControlFilterProviderContext,
} from '../providers/EquipmentControlFilterProvider';
import { BookingCategory, BookingVersion } from '../model/Booking';
import useUser from './useUser';
import { flatMap } from 'lodash';
import { pick, flow, omitBy, isNil } from 'lodash/fp';
import { addWeeks, endOfISOWeek, getISOWeek, getYear, setISOWeek, setYear } from 'date-fns';
import {
  getMultipleWeekDateRange,
  getWeekDate,
} from '../components/equipmentControl/ExportFlowsTable';

export default function useEquipmentSummary<T extends BookingCategory>(
  category: T,
): T extends BookingCategory.Export ? EquipmentExportSummary[] : EquipmentImportSummary[] {
  const [filters] = useEquipmentControlFilterProviderContext();
  const [user] = useUser();
  const [equipmentControl, setEquipmentControl] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = setInterval(() => {
      user
        .getIdToken()
        .then(token => {
          return getEquipmentSummary(
            token,
            filters.carrier?.id === 'HSG'
              ? 'Hamburg Süd'
              : filters.carrier?.id === 'STNN'
                ? 'HUGO STINNES'
                : filters.carrier?.id!,
            BookingVersion.long,
            category,
            filters,
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
  }, [category, filters, user]);

  useEffect(() => {
    user
      .getIdToken()
      .then(token => {
        return getEquipmentSummary(
          token,
          filters.carrier?.id === 'HSG'
            ? 'Hamburg Süd'
            : filters.carrier?.id === 'STNN'
              ? 'HUGO STINNES'
              : filters.carrier?.id!,
          BookingVersion.long,
          category,
          filters,
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
              flatMap(value?.map(e => Object.entries(e)?.map(([k, v]) => ({ id: k, ...v })))),
            );
        },
      );
  }, [category, filters, user]);

  return useMemo(() => equipmentControl as any, [equipmentControl]);
}

const getEquipmentSummary = async (
  token: string,
  carrierId: string,
  version: BookingVersion,
  category: BookingCategory,
  filters: EquipmentControlFilterContext,
) => {
  try {
    const startWeekDate = getWeekDate(filters.year, filters.week);
    const startWeek = getISOWeek(startWeekDate);

    const startWeekYear = getYear(endOfISOWeek(startWeekDate));
    const endWeekDate = endOfISOWeek(addWeeks(startWeekDate, 2));
    const endWeek = getISOWeek(endWeekDate);
    const endWeekYear = getYear(endWeekDate);

    let url: string;
    if (category === BookingCategory.Export) {
      url = `${
        import.meta.env.VITE_REACT_APP_API_URL
      }/equipmentControl/getExport?carrierId=${carrierId}&version=${version}&startWeek=${startWeek}&startWeekYear=${startWeekYear}&endWeek=${endWeek}&endWeekYear=${endWeekYear}&${query(
        flow(omitBy(isNil), pick(['containerTypes']))(filters),
      )}`;
    } else {
      url = `${import.meta.env.VITE_REACT_APP_API_URL}/equipmentControl?carrierId=${carrierId}&version=${version}&${query(
        flow(omitBy(isNil), pick(['containerTypes']))(filters),
      )}`;
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

const query = (params: any) =>
  Object.keys(params)
    .map(k => k + '=' + typeCheck(params[k]))
    .join('&');

const typeCheck = (doc: any) => (Array.isArray(doc) ? doc.join(',') : doc);
