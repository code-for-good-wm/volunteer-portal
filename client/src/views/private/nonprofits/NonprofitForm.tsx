import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useAppSelector } from '../../../store/hooks';
import { selectNonprofitById } from '../../../store/nonprofitsSlice';
import { RootState } from '../../../store/store';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import TextFieldLabel from '../../../components/elements/TextFieldLabel';
import { is501c3StatusOptions, usStates } from '../../../helpers/constants';
import { parsePhone } from '../../../helpers/functions';
import { testEmail, testPhone } from '../../../helpers/validation';
import { createNonprofit, loadNonprofit, updateNonprofit } from '../../../services/nonprofit';
import { Is501c3Status, NonprofitCreate, NonprofitUpdate } from '../../../types/nonprofit';
import { colors } from '../../../material/colors';

type NonprofitFormData = {
  name: string;
  website: string;
  city: string;
  state: string;
  is501c3: Is501c3Status | '';
  einNumber: string;
  description: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const initialForm: NonprofitFormData = {
  name: '',
  website: '',
  city: '',
  state: '',
  is501c3: '',
  einNumber: '',
  description: '',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
};

const NonprofitForm = () => {
  const { nonprofitId } = useParams<{ nonprofitId: string }>();
  const isEdit = !!nonprofitId;

  const [form, setForm] = useState<NonprofitFormData>(initialForm);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();

  const existingNonprofit = useAppSelector((state: RootState) =>
    nonprofitId ? selectNonprofitById(state, nonprofitId) : undefined
  );

  // In edit mode, load the nonprofit and populate the form once available
  useEffect(() => {
    if (nonprofitId) {
      loadNonprofit(nonprofitId);
    }
  }, [nonprofitId]);

  useEffect(() => {
    if (!existingNonprofit) { return; }

    setForm({
      name: existingNonprofit.name,
      website: existingNonprofit.website ?? '',
      city: existingNonprofit.city,
      state: existingNonprofit.state,
      is501c3: existingNonprofit.is501c3,
      einNumber: existingNonprofit.einNumber ?? '',
      description: existingNonprofit.description,
      contactName: existingNonprofit.contactName,
      contactRole: existingNonprofit.contactRole,
      contactEmail: existingNonprofit.contactEmail,
      contactPhone: existingNonprofit.contactPhone ?? '',
      notes: existingNonprofit.notes ?? '',
    });
  }, [existingNonprofit]);

  useEffect(() => {
    const { name, city, state, is501c3, description, contactName, contactRole, contactEmail, contactPhone } = form;

    const requiredFieldsFilled = !!(
      name.trim() && city.trim() && state && is501c3 && description.trim()
      && contactName.trim() && contactRole.trim() && contactEmail.trim()
    );

    const emailValid = testEmail(contactEmail.trim());
    const phoneValid = !contactPhone.trim() || testPhone(parsePhone(contactPhone).number);

    setSubmitDisabled(!(requiredFieldsFilled && emailValid && phoneValid));
  }, [form]);

  const handleField = (field: keyof NonprofitFormData) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePhone = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      contactPhone: parsePhone(value).formatted,
    }));
  };

  const backTarget = isEdit ? `/nonprofits/${nonprofitId}` : '/nonprofits';

  const handleCancel = () => {
    navigate(backTarget);
  };

  const handleSave = () => {
    const success = () => {
      setProcessing(false);
      navigate(backTarget);
    };

    const failure = () => {
      setProcessing(false);
    };

    setProcessing(true);

    if (isEdit && nonprofitId) {
      const nonprofitUpdate: NonprofitUpdate = {
        name: form.name.trim(),
        website: form.website.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        is501c3: form.is501c3 as Is501c3Status,
        einNumber: form.einNumber.trim() || undefined,
        description: form.description.trim(),
        contactName: form.contactName.trim(),
        contactRole: form.contactRole.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim() ? parsePhone(form.contactPhone).number : undefined,
        notes: form.notes.trim() || undefined,
      };

      updateNonprofit(nonprofitId, nonprofitUpdate, { success, failure });
    } else {
      const nonprofitCreate: NonprofitCreate = {
        name: form.name.trim(),
        website: form.website.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        is501c3: form.is501c3 as Is501c3Status,
        einNumber: form.einNumber.trim() || undefined,
        description: form.description.trim(),
        contactName: form.contactName.trim(),
        contactRole: form.contactRole.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim() ? parsePhone(form.contactPhone).number : undefined,
        notes: form.notes.trim() || undefined,
      };

      createNonprofit(nonprofitCreate, { success, failure });
    }
  };

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <a
            onClick={() => navigate(backTarget)}
            style={{ cursor: 'pointer', color: colors.text.secondary, fontSize: 15 }}
          >
            ← Back to {isEdit ? 'nonprofit' : 'nonprofits'}
          </a>

          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            {isEdit ? 'Edit Nonprofit' : 'Add a Nonprofit'}
          </h1>

          <div style={{
            backgroundColor: colors.surface.card,
            borderRadius: 5,
            padding: '36px 40px',
            boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.06), 0px 3px 5px 0px rgba(0,0,0,0.1)',
            maxWidth: 900,
            margin: '24px auto 0',
          }}>
            <h2 style={{ color: colors.text.primary, marginTop: 0 }}>Nonprofit</h2>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Organization name" required />}
                  value={form.name}
                  onChange={handleField('name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Website" />}
                  value={form.website}
                  onChange={handleField('website')}
                  placeholder="example.org"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="City" required />}
                  value={form.city}
                  onChange={handleField('city')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="State" required />}
                  value={form.state}
                  onChange={handleField('state')}
                >
                  {usStates.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="501(c)(3) status" required />}
                  value={form.is501c3}
                  onChange={handleField('is501c3')}
                  helperText="Yes · No · In progress"
                >
                  {is501c3StatusOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="EIN" />}
                  value={form.einNumber}
                  onChange={handleField('einNumber')}
                  placeholder="38-0000000"
                  helperText="Optional. Blank is fine if they don't have it to hand."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="What the organization does" required />}
                  value={form.description}
                  onChange={handleField('description')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Contact name" required />}
                  value={form.contactName}
                  onChange={handleField('contactName')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Contact role" required />}
                  value={form.contactRole}
                  onChange={handleField('contactRole')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  type="email"
                  label={<TextFieldLabel label="Contact email" required />}
                  value={form.contactEmail}
                  onChange={handleField('contactEmail')}
                  error={!!form.contactEmail && !testEmail(form.contactEmail.trim())}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Contact phone" />}
                  value={form.contactPhone}
                  onChange={handlePhone}
                  placeholder="(616) 555-0142"
                  helperText="Optional"
                  error={!!form.contactPhone && !testPhone(parsePhone(form.contactPhone).number)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="dense"
                  label={<TextFieldLabel label="Notes" />}
                  value={form.notes}
                  onChange={handleField('notes')}
                  placeholder="Internal notes about this organization."
                />
              </Grid>
            </Grid>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <StandardButton
                theme="secondary"
                label="Cancel"
                handler={handleCancel}
                disabled={processing}
              />
              <div style={{ flex: 1 }} />
              <div style={{ width: 220 }}>
                <StandardButton
                  label={isEdit ? 'Save Changes' : 'Save as Interested'}
                  handler={handleSave}
                  disabled={submitDisabled || processing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NonprofitForm;
