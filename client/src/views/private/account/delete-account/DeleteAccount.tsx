import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { getAuth, signOut } from 'firebase/auth';

import { FormAlertState } from '../../../../types/forms';

import TextFieldLabel from '../../../../components/elements/TextFieldLabel';
import StandardButton from '../../../../components/buttons/StandardButton';
import FormAlert from '../../../../components/elements/FormAlert';
import DialogAlert from '../../../../components/elements/DialogAlert';

import { FormControl, TextField } from '@mui/material';

import { deleteUserAccount } from '../../../../services/account';

type DeleteAccountForm = {
  password: string,
};

const DeleteAccount = () => {
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [form, setForm] = useState<DeleteAccountForm>({
    password: '',
  });
  const [alert, setAlert] = useState<FormAlertState>({
    show: false,
    text: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Test for form validity
  useEffect(() => {
    const passwordTrimmed = form.password.trim();

    if (passwordTrimmed) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [form]);

  const resetAlert = () => {
    setAlert({
      show: false,
      text: '',
    });
  };

  const toggleModal = () => {
    setShowModal(prevState => !prevState);
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      password: value,
    }));
    if (alert.show) {
      resetAlert();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    toggleModal();
  };

  const handleConfirm = () => {
    toggleModal();

    const auth = getAuth();
    const passwordTrimmed = form.password.trim();

    // Build callbacks
    const success = () => {
      setProcessing(false);
      setForm((prevState) => ({
        ...prevState,
        password: '',
      }));
      // Sign user out of application
      signOut(auth).catch((e) => console.error(e));
    };

    const failure = (message: string) => {
      setProcessing(false);
      setAlert({
        show: true,
        text: message,
        severity: 'error'
      });
    };

    // Attempt deletion
    setProcessing(true);
    deleteUserAccount({
      password: passwordTrimmed,
      success,
      failure,
    });
  };

  return (
    <>
      <DialogAlert
        visible={showModal}
        title="Are you sure?"
        message="Deleting your account will remove all account and profile data.  This cannot be undone."
        okLabel="Yes, Delete"
        handleClose={toggleModal}
        handleCancel={toggleModal}
        handleOk={handleConfirm}
      />
      <div className="contentCard accountCard">
        <h2>
          Delete Account
        </h2>
        <div className="divider" />
        <form className="accountForm" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            fullWidth
            margin="dense"
            size="medium"
            id="deleteAccountPassword"
            name="deleteAccountPassword"
            type="password"
            label={<TextFieldLabel label="Current Password" />}
            value={form.password}
            onChange={handlePassword}
          />
          <FormControl
            fullWidth
            margin="normal"
          >
            <StandardButton
              type="submit"
              theme="warning"
              label="Delete Account"
              disabled={submitDisabled || processing}
            />
          </FormControl>
          { alert.show && (
            <FormAlert
              theme={alert.severity}
              spacing="tight"
              content={alert.text}
            />
          )}
        </form>
      </div>
    </>
  );
};

export default DeleteAccount;