import Button from '@mui/material/Button';

import { colors } from '../../material/colors';

type RowActionButtonProps = {
  label: string;
  onClick: () => void;
  /** Filled for rows that need attention (e.g. "Review"); outlined otherwise. */
  emphasis?: boolean;
  /** Describe the target for screen readers, e.g. "Open Weekend for Good 2026". */
  'aria-label'?: string;
};

/**
 * The call to action at the end of an admin table row. Every table uses this so
 * row actions look the same: a small dark button, filled when the row needs
 * attention and outlined otherwise.
 */
const RowActionButton = (props: RowActionButtonProps) => {
  const { label, onClick, emphasis, 'aria-label': ariaLabel } = props;

  return (
    <Button
      variant={emphasis ? 'contained' : 'outlined'}
      size="small"
      disableElevation
      aria-label={ariaLabel}
      sx={
        emphasis
          ? { backgroundColor: colors.primary.dark }
          : { borderColor: colors.primary.dark, color: colors.primary.dark }
      }
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export default RowActionButton;
