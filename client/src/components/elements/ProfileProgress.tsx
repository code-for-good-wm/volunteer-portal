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

    const isCurrent = index === currentProfileIndex;
    const isComplete = index < currentProfileIndex;

    // Determine dynamic styling
    const additionalStyling = isCurrent ? 'current' : (isComplete ? 'completed' : '');
    const headingStyle = `heading${additionalStyling ? ` ${additionalStyling}` : ''}`;
    const subHeadingStyle = `subHeading${additionalStyling ? ` ${additionalStyling}` : ''}`;

    // Build sub-sections if relevant
    const subHeadings = primarySection.sections?.map((subSection) => {
      return (
        <h3 key={subSection.id} className={subHeadingStyle}>
          {subSection.description}
        </h3>
      );
    });

    return (
      <div key={primarySection.id} className="profileSection">
        <h2 className={headingStyle}>
          {isCurrent && (
            <span className="visually-hidden">Current: </span>
          )}
          {isComplete && (
            <span className="visually-hidden">Completed: </span>
          )}
          <span className="text">
            {primarySection.description}
          </span>
          {isComplete && (
            <span className="icon">
              <img src={Completed} alt="Checkmark in circle" />
            </span>
          )}
        </h2>

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