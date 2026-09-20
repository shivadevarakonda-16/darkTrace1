import React from 'react';
import ActivityTimeline from '../ActivityTimeline';

/** "Timeline" tab: chronological activity log for this actor. */
export default function TimelineTab({ events }) {
  return (
    <div className="soc-card p-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-clock-history text-info fs-5"></i>
        <h5 className="text-dark mb-0">Activity timeline</h5>
      </div>
      <ActivityTimeline events={events} />
    </div>
  );
}
