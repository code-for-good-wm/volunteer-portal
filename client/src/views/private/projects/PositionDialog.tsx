import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';

import DialogAlert from '../../../components/elements/DialogAlert';
import NumberSpinner from '../../../components/elements/NumberSpinner';
import { colors } from '../../../material/colors';
import {
  createPosition,
  deletePosition,
  updatePosition,
} from '../../../services/position';
import { Position } from '../../../types/position';
import { Role } from '../../../types/profile';
import { roleLabels, roleOptions } from '../../../helpers/roles';

const MAX_SLOT_COUNT = 100;

// MUI components default to Roboto/Helvetica; the designs use the app's Avenir.
const fonts = {
  book: "'Avenir-Book', Arial, Helvetica, sans-serif",
  medium: "'Avenir-Medium', Arial, Helvetica, sans-serif",
  heavy: "'Avenir-Heavy', Arial, Helvetica, sans-serif",
};

const CONTROL_HEIGHT = 52;

const fieldLabelSx = {
  display: 'block',
  mb: 1,
  color: colors.text.primary,
  fontFamily: fonts.heavy,
  fontSize: 16,
  lineHeight: 1.5,
  whiteSpace: 'normal',
};

const buttonTextSx = {
  fontFamily: fonts.heavy,
  fontSize: 14,
  letterSpacing: '1.25px',
};

type PositionDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Called with the saved position after it's created or updated. */
  onSaved?: (position: Position) => void;
  projectId: string;
  projectName?: string;
  nonprofitName?: string;
  /** The position to edit. Leave out to add a new one. */
  position?: Position;
  /** The project's positions. A project has one position per role, so their roles can't be picked again. */
  existingPositions?: Position[];
  /**
   * When editing: how many of the position's slots have someone invited,
   * assigned or confirmed. Those can't be removed, so the count can't go below
   * this and the position can't be deleted while it's above zero.
   */
  lockedSlotCount?: number;
  /** Called after the position being edited is deleted. */
  onDeleted?: (position: Position) => void;
};

/** Add a position to a project, or edit one when `position` is given. */
const PositionDialog = (props: PositionDialogProps) => {
  const {
    open,
    onClose,
    onSaved,
    projectId,
    projectName,
    nonprofitName,
    position,
    existingPositions = [],
    lockedSlotCount = 0,
    onDeleted,
  } = props;
  const isEdit = !!position;

  const takenRoles = new Set(
    existingPositions
      .filter((existing) => existing._id !== position?._id)
      .map((existing) => existing.role),
  );

  const [role, setRole] = useState<Role | ''>('');
  const [slotCount, setSlotCount] = useState<number | null>(0);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const minSlotCount = isEdit ? Math.max(1, lockedSlotCount) : 0;

  // Each time the dialog opens, start from the position being edited, or empty.
  useEffect(() => {
    if (open) {
      setRole(position?.role ?? '');
      setSlotCount(position?.slotCount ?? 0);
      setSaving(false);
      setConfirmingDelete(false);
    }
  }, [open, position]);

  const canSave =
    role !== '' &&
    !takenRoles.has(role) &&
    slotCount !== null &&
    Number.isInteger(slotCount) &&
    slotCount >= Math.max(1, minSlotCount) &&
    slotCount <= MAX_SLOT_COUNT &&
    !saving;

  const handleRoleChange = (event: SelectChangeEvent<Role | ''>) => {
    setRole(event.target.value as Role | '');
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSave = async () => {
    // canSave already guarantees a role and a valid count.
    if (!canSave) {
      return;
    }
    setSaving(true);
    const values = { role, slotCount, notes: position?.notes };
    const saved = position
      ? await updatePosition(projectId, position._id, values)
      : await createPosition(projectId, values);
    setSaving(false);
    if (saved) {
      onSaved?.(saved);
      onClose();
    }
  };

  const handleDelete = async () => {
    setConfirmingDelete(false);
    if (!position) {
      return;
    }
    setSaving(true);
    const deleted = await deletePosition(projectId, position._id);
    setSaving(false);
    if (deleted) {
      onDeleted?.(position);
      onClose();
    }
  };

  const subtitle = [projectName, nonprofitName].filter(Boolean).join(' · ');
  const title = isEdit ? 'Edit position' : 'Add a position';
  const saveLabel = isEdit ? 'Save changes' : 'Add position';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="position-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 28px rgba(25, 27, 37, 0.12)',
          overflow: 'hidden',
          fontFamily: fonts.book,
          '& .MuiInputBase-root, & .MuiFormHelperText-root': {
            fontFamily: fonts.book,
          },
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          padding: '28px 32px 22px',
          borderBottom: `1px solid ${colors.border.default}`,
        }}
      >
        <div>
          <h2
            id="position-dialog-title"
            style={{
              margin: 0,
              color: colors.text.primary,
              fontFamily: fonts.medium,
              fontWeight: 400,
              fontSize: '1.75rem',
              lineHeight: 1.25,
              letterSpacing: 0,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                margin: '6px 0 0',
                color: colors.text.secondary,
                fontSize: 16,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          sx={{ color: colors.text.secondary, mt: -0.5, mr: -1 }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      {/* Body */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 160px',
          gap: 24,
          alignItems: 'start',
          padding: '28px 32px 32px',
        }}
      >
        <div>
          <InputLabel id="position-role-label" sx={fieldLabelSx}>
            Role *
          </InputLabel>
          <Select
            labelId="position-role-label"
            id="position-role"
            value={role}
            onChange={handleRoleChange}
            displayEmpty
            fullWidth
            renderValue={(selected) =>
              selected ? (
                roleOptions.find((option) => option.value === selected)?.label
              ) : (
                <span style={{ color: colors.text.placeholder }}>
                  Select Role
                </span>
              )
            }
            MenuProps={{
              PaperProps: {
                sx: { '& .MuiMenuItem-root': { fontFamily: fonts.book } },
              },
            }}
            sx={{
              height: CONTROL_HEIGHT,
              borderRadius: '6px',
              backgroundColor: colors.surface.card,
              color: colors.text.primary,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border.default,
              },
              '& .MuiSelect-select': { fontSize: 16 },
            }}
          >
            {roleOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={takenRoles.has(option.value)}
              >
                {option.label}
                {takenRoles.has(option.value) && (
                  <span
                    style={{
                      marginLeft: 8,
                      color: colors.text.secondary,
                      fontSize: 14,
                    }}
                  >
                    already added
                  </span>
                )}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div>
          <InputLabel htmlFor="position-slot-count" sx={fieldLabelSx}>
            How many people? *
          </InputLabel>
          <NumberSpinner
            id="position-slot-count"
            min={minSlotCount}
            max={MAX_SLOT_COUNT}
            value={slotCount}
            onValueChange={(value) => setSlotCount(value)}
            aria-describedby="position-slot-count-help"
            sx={{
              width: '100%',
              // One fixed height so the buttons and the number box line up.
              '& .MuiButton-root': {
                height: CONTROL_HEIGHT,
                minWidth: 48,
                flex: '0 0 48px',
                backgroundColor: colors.surface.subtle,
                borderColor: colors.border.default,
              },
              '& .MuiButton-root:not(.Mui-disabled)': {
                color: colors.text.primary,
              },
              '& .MuiOutlinedInput-root': { height: CONTROL_HEIGHT },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border.default,
              },
              '& .MuiOutlinedInput-input': {
                py: 0,
                fontFamily: fonts.medium,
                fontSize: 18,
                color: colors.text.primary,
              },
            }}
          />
          <FormHelperText
            id="position-slot-count-help"
            sx={{
              mt: 1.5,
              mx: 0,
              color: colors.text.secondary,
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            Creates this many open slots on the project.
          </FormHelperText>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 24,
          padding: '20px 32px',
          backgroundColor: colors.surface.subtle,
          borderTop: `1px solid ${colors.border.default}`,
        }}
      >
        {position && (
          <Tooltip
            title={
              lockedSlotCount > 0
                ? `People are invited to or confirmed in ${lockedSlotCount === 1 ? 'a slot' : `${lockedSlotCount} slots`}, so this position can't be deleted.`
                : ''
            }
          >
            {/* The span lets the tooltip show while the button is disabled. */}
            <span style={{ marginRight: 'auto' }}>
              <Button
                onClick={() => setConfirmingDelete(true)}
                disabled={saving || lockedSlotCount > 0}
                sx={{ ...buttonTextSx, color: colors.status.error, px: 2 }}
              >
                Delete position
              </Button>
            </span>
          </Tooltip>
        )}
        <Button
          onClick={handleClose}
          disabled={saving}
          sx={{ ...buttonTextSx, color: colors.text.secondary, px: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={!canSave}
          sx={{
            ...buttonTextSx,
            backgroundColor: colors.primary.dark,
            color: '#fff',
            borderRadius: '4px',
            px: 4,
            height: CONTROL_HEIGHT,
            '&:hover': { backgroundColor: colors.primary.dark },
            // Stay dark when disabled, as in the design, just faded.
            '&.Mui-disabled': {
              backgroundColor: colors.primary.dark,
              color: '#fff',
              opacity: 0.5,
            },
          }}
        >
          {saving ? 'Saving…' : saveLabel}
        </Button>
      </div>

      {position && (
        <DialogAlert
          visible={confirmingDelete}
          title={`Delete the ${roleLabels[position.role] ?? position.role} position?`}
          message={`This removes the position and its ${position.slotCount} open ${position.slotCount === 1 ? 'slot' : 'slots'}. It can't be undone.`}
          okLabel="Delete"
          handleOk={handleDelete}
          handleCancel={() => setConfirmingDelete(false)}
          handleClose={() => setConfirmingDelete(false)}
        />
      )}
    </Dialog>
  );
};

export default PositionDialog;
