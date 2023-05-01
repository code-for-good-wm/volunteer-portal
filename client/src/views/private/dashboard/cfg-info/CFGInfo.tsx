import StandardButton from '../../../../components/buttons/StandardButton';

const CFGInfo = () => {
  return (
    <div className="contentCard dashboardCard">
      <p>Thank you for registering as a volunteer for Code for Good.</p>
      <p>We&apos;re super excited to have you!</p>
      <p>Learn more about our mission - and how you play a vital role! - on our website.</p>
      <div className="dashboardCardButtonContainer">
        <StandardButton
          label="codeforgoodwm.org"
          link="https://codeforgoodwm.org/"
        />
      </div>
    </div>
  );
};

export default CFGInfo;