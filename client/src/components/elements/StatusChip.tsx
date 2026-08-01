import Chip from '@mui/material/Chip';
import { colors } from '../../material/colors';

export type StatusChipTheme = 'teal' | 'success' | 'neutral';

type StatusChipProps = {
  label: string;
  theme: StatusChipTheme;
};

const themeStyles: Record<StatusChipTheme, { backgroundColor: string, color: string }> = {
  teal: { backgroundColor: colors.teal.tint, color: colors.teal.deep },
  success: { backgroundColor: colors.status.successSurface, color: colors.status.success },
  neutral: { backgroundColor: colors.status.neutralSurface, color: colors.status.neutral },
};

/** A small pill used to display record status (e.g. project/nonprofit review state) */
const StatusChip = (props: StatusChipProps) => {
  const { label, theme } = props;
  const { backgroundColor, color } = themeStyles[theme];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor,
        color,
        fontWeight: 700,
        fontSize: '0.75rem',
      }}
    />
  );
};

export default StatusChip;
