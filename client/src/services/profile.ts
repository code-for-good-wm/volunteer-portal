import { store } from '../store/store';

/**
 * Pull the user's saved profile and return an object with
 * data organized for the 'getting started' view
 */
export const getGettingStartedProfileData = () => {
  const appState = store.getState();
  const { user } = appState.auth;

  // If no user data, return undefined
  if (!user) {
    return;
  }

  // Pull profile and return data
  const { name, email, phone, profile } = user;
  const {
    linkedInUrl,
    websiteUrl,
    portfolioUrl,
    previousVolunteer,
    shirtSize,
    dietaryRestrictions,
    accessibilityRequirements,
    agreements
  } = profile;

  return (
    {
      basicInfo: {
        name,
        email,
        phone,
      },
      contactInfo: {
        linkedInUrl,
        websiteUrl,
        portfolioUrl,
      },
      previousVolunteer: !!previousVolunteer, // Could be undefined
      shirtSize,
      dietaryRestrictions,
      accessibilityRequirements,
      termsAndConditions: !!agreements?.termsAndConditions, // Convert to boolean
      photoRelease: !!agreements?.photoRelease, // Convert to boolean
      codeOfConduct: !!agreements?.codeOfConduct, // Convert to boolean
    }
  );
};