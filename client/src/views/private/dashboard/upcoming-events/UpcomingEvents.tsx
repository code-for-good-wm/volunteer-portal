import { useState } from 'react';

import { EventAttendanceUpdate } from '../../../../types/event';
import { updateEventAttendance } from '../../../../services/event';
import { useAppSelector } from '../../../../store/hooks';
import { selectUpcomingEventsAndAttendance } from '../../../../store/selectors/eventAndAttendanceSelectors';

import EventCard from '../../../../components/cards/EventCard';

const UpcomingEvents = () => {
  const upcomingEventsWithAttendanceData = useAppSelector(selectUpcomingEventsAndAttendance);

  const [processing, setProcessing] = useState(false);

  const handleSaveAttendance = (eventId: string, attendanceUpdate: EventAttendanceUpdate) => {
    setProcessing(true);

    const success = () => {
      setProcessing(false);
    };

    const failure = () => {
      setProcessing(false);
    };
    
    updateEventAttendance({attendanceUpdate, eventId, success, failure});
  };

  const eventCards = upcomingEventsWithAttendanceData.map((ea) => {
    return (
      <EventCard processing={processing}
        key={ea.key}
        event={ea.event}
        attendance={ea.attendance}
        handler={handleSaveAttendance} />
    );
  });

  return (
    <div className="eventCardContainer">
      { eventCards }
    </div>
  );
};

export default UpcomingEvents;