import { ChipProps } from '@mui/material/Chip';
import { Status } from '../types/event';

export const statusChipProps: Record<
  Status,
  { label: string; color: ChipProps['color'] }
> = {
  draft: { label: 'Draft', color: 'warning' },
  upcoming: { label: 'Upcoming', color: 'success' },
  active: { label: 'Active', color: 'primary' },
  complete: { label: 'Complete', color: 'default' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

export const statusDescriptions: Record<Status, string> = {
  draft: 'Not visible to volunteers yet',
  upcoming: 'Live on the volunteer home screen',
  active: 'Currently in progress',
  complete: 'This event has concluded',
  cancelled: 'This event was cancelled',
};
