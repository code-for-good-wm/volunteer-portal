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
  const { name, phone, profile } = user;
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
        phone,
      },
      contactInfo: {
        linkedInUrl,
        websiteUrl,
        portfolioUrl,
      },
      extraStuff: {
        previousVolunteer: !!previousVolunteer, // Could be undefined
        shirtSize,
        dietaryRestrictions,
      },
      accessibilityRequirements,
      agreements: {
        termsAndConditions: !!agreements?.termsAndConditions, // Convert to boolean
        photoRelease: !!agreements?.photoRelease, // Convert to boolean
        codeOfConduct: !!agreements?.codeOfConduct, // Convert to boolean
      }
    }
  );
};