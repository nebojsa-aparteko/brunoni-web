import {
  ChecklistItem,
  ChecklistItemValueDocument,
  ShortChecklistItem,
  ShortChecklistItemValueDocument,
} from '../components/bookings/checklist/ChecklistItemModel';

export const shortenedChecklist = (item: ChecklistItem | undefined) => {
  return item ? ({ id: item.id, label: item.label, checked: !!item.checked } as ShortChecklistItem) : undefined;
};
export const shortenedDocumentValue = (item: ChecklistItemValueDocument | undefined) => {
  return item
    ? ({ name: item.name, url: item.url, isInternal: item.isInternal || true } as ShortChecklistItemValueDocument)
    : undefined;
};
