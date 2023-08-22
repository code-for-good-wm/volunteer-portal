import { currentSection } from '../../store/profileSlice';
import { useAppSelector } from '../../store/hooks';

import Completed from '../../assets/icons/section-complete.png';

import { profileStructure } from '../../helpers/constants';
import { getDisplayedProfileSections } from '../../helpers/functions';

const ProfileProgress = () => {
  const currentProfileSection = useAppSelector(currentSection);
  const currentProfileIndex = profileStructure.findIndex((primarySection) => {
    return primarySection.id === currentProfileSection;
  }); // -1 if not found; 0 or above if found

  // Pull roles from the current user data,
  // then dynamically update the UI based on the user roles
  const displayedSections = getDisplayedProfileSections();

  // Build UI
  const content = profileStructure.map((primarySection, index) => {
    if (!displayedSections.includes(primarySection.id)) {
      return;
    }
    // Determine dynamic styling
    let additionalStyling;
    if (index === currentProfileIndex) {
      additionalStyling = 'current';
    } else if (index < currentProfileIndex) {
      additionalStyling = 'completed';
    }

    const headingStyle = `heading${additionalStyling ? ` ${additionalStyling}` : ''}`;
    const subHeadingStyle = `subHeading${additionalStyling ? ` ${additionalStyling}` : ''}`;

    // Build sub-sections if relevant
    const subHeadings = primarySection.sections?.map((subSection) => {
      return (
        <span key={subSection.id} className={subHeadingStyle}>
          {subSection.description}
        </span>
      );
    });

    return (
      <div key={primarySection.id} className="profileSection">
        <div className={headingStyle}>
          <span className="text">
            {primarySection.description}
          </span>
          {index < currentProfileIndex && (
            <span className="icon">
              <img src={Completed} alt="Checkmark in circle" />
            </span>
          )}
        </div>
        {subHeadings && subHeadings.length > 0 && (
          <div className="subSections">
            {subHeadings}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="profileProgressContainer">
      {content}
    </div>
  );
};

export default ProfileProgress;