import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ActorHeader from '../components/actor-detail/ActorHeader';
import ActorTabs from '../components/actor-detail/ActorTabs';
import AttributionsTab from '../components/actor-detail/AttributionsTab';
import IdentifiersTab from '../components/actor-detail/IdentifiersTab';
import InfrastructureTab from '../components/actor-detail/InfrastructureTab';
import CaseContextPanel from '../components/actor-detail/CaseContextPanel';
import TimelineTab from '../components/actor-detail/TimelineTab';

/**
 * Actor Detail page. This component only owns data-fetching and which tab
 * is active — all the actual tab content lives in components/actor-detail/,
 * one file per tab, so each piece stays easy to find and edit on its own.
 */
export default function ActorDetailView({ actorId, onNavigate }) {
  const [actor, setActor] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('attributions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (actorId) {
      loadActorDetail(actorId);
    }
  }, [actorId]);

  const loadActorDetail = async (id) => {
    try {
      setLoading(true);
      const [actorRes, timelineRes] = await Promise.all([
        api.getActorById(id),
        api.getActorTimeline(id)
      ]);
      setActor(actorRes.data);
      setTimeline(timelineRes.data || []);
      setSelectedLinkIndex(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-info" role="status"></div>
        <span className="ms-3 text-secondary">Loading profile...</span>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="alert alert-danger p-4">
        <h5>Couldn't load this profile</h5>
        <p>{error || 'Actor not found'}</p>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => onNavigate('actors')}>
          &larr; Back to actor list
        </button>
      </div>
    );
  }

  const links = actor.topLinks || [];

  return (
    <div className="actor-detail-view">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => onNavigate('actors')}
        >
          <i className="bi bi-arrow-left"></i>
          <span>Back to actor list</span>
        </button>

        <button
          className="btn btn-sm btn-outline-info d-flex align-items-center gap-2"
          onClick={() => onNavigate('export', { actorId: actor.id })}
        >
          <i className="bi bi-file-earmark-pdf"></i>
          <span>Export report</span>
        </button>
      </div>

      <ActorHeader actor={actor} onNavigate={onNavigate} />

      <ActorTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        linkCount={links.length}
        timelineCount={timeline.length}
      />

      {activeTab === 'attributions' && (
        <AttributionsTab
          actor={actor}
          links={links}
          selectedIndex={selectedLinkIndex}
          onSelect={setSelectedLinkIndex}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'identifiers' && <IdentifiersTab actor={actor} />}

      {activeTab === 'infra' && <InfrastructureTab infrastructure={actor.infrastructure} />}

      {activeTab === 'timeline' && <TimelineTab events={timeline} />}

      <CaseContextPanel caseContext={actor.caseContext} />
    </div>
  );
}
