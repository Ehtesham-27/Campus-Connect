import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Search,
  UserCheck,
  UserMinus,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { connectionApi } from './connectionApi';
import type {
  AcceptedConnectionItem,
  ConnectionRequestItem,
  ConnectionPeer,
} from './connectionApi';

type TabType = 'connections' | 'requests';

export const ConnectionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [connections, setConnections] = useState<AcceptedConnectionItem[]>([]);
  const [totalConnections, setTotalConnections] = useState<number>(0);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Modal State
  const [selectedPeer, setSelectedPeer] = useState<ConnectionPeer | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [connRes, reqRes] = await Promise.all([
        connectionApi.getAcceptedConnections(),
        connectionApi.getConnectionRequests(),
      ]);
      setConnections(connRes.connections);
      setTotalConnections(connRes.total);
      setIncomingRequests(reqRes.incoming);
      setOutgoingRequests(reqRes.outgoing);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to load connections data.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptRequest = async (requestId: string, senderName: string) => {
    try {
      await connectionApi.acceptRequest(requestId);
      setFeedback({ type: 'success', message: `You are now connected with ${senderName}!` });
      fetchData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to accept invitation.' });
    }
  };

  const handleRejectRequest = async (requestId: string, senderName: string) => {
    try {
      await connectionApi.rejectRequest(requestId);
      setFeedback({ type: 'success', message: `Declined connection invitation from ${senderName}.` });
      fetchData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to decline invitation.' });
    }
  };

  const handleCancelRequest = async (requestId: string, recipientName: string) => {
    try {
      await connectionApi.cancelRequest(requestId);
      setFeedback({ type: 'success', message: `Cancelled connection request to ${recipientName}.` });
      fetchData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to cancel invitation.' });
    }
  };

  const handleRemoveConnection = async (connectionId: string, peerName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${peerName} from your campus connections?`)) {
      return;
    }

    try {
      await connectionApi.removeConnection(connectionId);
      setFeedback({ type: 'success', message: `Removed ${peerName} from connections.` });
      if (selectedPeer && selectedPeer.fullName === peerName) {
        setSelectedPeer(null);
      }
      fetchData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFeedback({ type: 'error', message: error.message || 'Failed to remove connection.' });
    }
  };

  // Filtered connections based on search term
  const filteredConnections = connections.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const p = c.peer;
    return (
      p.fullName.toLowerCase().includes(term) ||
      (p.course && p.course.toLowerCase().includes(term)) ||
      (p.branch && p.branch.toLowerCase().includes(term)) ||
      (p.skills && p.skills.some((s) => s.toLowerCase().includes(term)))
    );
  });

  const totalPending = incomingRequests.length + outgoingRequests.length;

  return (
    <div style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Header Banner */}
      <PageHeader
        title="Connections & Network"
        tagline="Module 5 • Student Network Graph"
        description="Build friendships and professional networks across college departments through peer invitations, accepted connections, and real profiles."
        badgeText="ACTIVE NETWORK"
        badgeVariant="pink"
        action={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="orange"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => navigate('/app/discover')}
            >
              Discover Students
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} icon={<RefreshCw size={14} />}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* Alert Notification */}
      {feedback && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-thick) solid var(--color-ink-black)',
            backgroundColor: feedback.type === 'success' ? 'var(--color-bright-yellow)' : 'var(--color-hot-pink)',
            color: feedback.type === 'success' ? 'var(--color-ink-black)' : 'var(--color-white)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('connections')}
          style={{
            padding: '0.6rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-thick) solid var(--color-ink-black)',
            cursor: 'pointer',
            backgroundColor: activeTab === 'connections' ? 'var(--color-electric-blue)' : 'var(--color-white)',
            color: activeTab === 'connections' ? 'var(--color-white)' : 'var(--color-ink-black)',
            boxShadow: activeTab === 'connections' ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
            transform: activeTab === 'connections' ? 'translate(-2px, -2px)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition-bounce)',
          }}
        >
          <UserCheck size={16} />
          <span>My Connections</span>
          <span
            style={{
              backgroundColor: activeTab === 'connections' ? 'var(--color-bright-yellow)' : 'var(--color-cream)',
              color: 'var(--color-ink-black)',
              padding: '0.1rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 900,
            }}
          >
            {totalConnections}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.6rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-thick) solid var(--color-ink-black)',
            cursor: 'pointer',
            backgroundColor: activeTab === 'requests' ? 'var(--color-hot-pink)' : 'var(--color-white)',
            color: activeTab === 'requests' ? 'var(--color-white)' : 'var(--color-ink-black)',
            boxShadow: activeTab === 'requests' ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
            transform: activeTab === 'requests' ? 'translate(-2px, -2px)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition-bounce)',
          }}
        >
          <Clock size={16} />
          <span>Pending Invitations</span>
          {totalPending > 0 && (
            <span
              style={{
                backgroundColor: activeTab === 'requests' ? 'var(--color-white)' : 'var(--color-vivid-orange)',
                color: activeTab === 'requests' ? 'var(--color-hot-pink)' : 'var(--color-white)',
                padding: '0.1rem 0.5rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 900,
              }}
            >
              {totalPending}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <Card surface="cream" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <RefreshCw
            size={32}
            style={{
              animation: 'spin 1s linear infinite',
              margin: '0 auto var(--space-4) auto',
              color: 'var(--color-electric-blue)',
            }}
          />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Loading Connections...</h3>
          <p style={{ color: 'var(--color-ink-muted)', marginTop: 'var(--space-2)' }}>
            Retrieving your campus network and pending invitations.
          </p>
        </Card>
      ) : activeTab === 'connections' ? (
        <div>
          {/* Search bar inside connections tab */}
          <Card surface="white" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-ink-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search connected peers by name, degree, branch, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  border: 'var(--border-thin) solid var(--color-ink-black)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>
          </Card>

          {filteredConnections.length === 0 ? (
            <Card
              surface="cream"
              style={{
                textAlign: 'center',
                padding: 'var(--space-12)',
                border: 'var(--border-thick) dashed var(--color-ink-black)',
              }}
            >
              <Sparkles size={40} style={{ margin: '0 auto var(--space-3) auto', color: 'var(--color-electric-blue)' }} />
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                {searchTerm ? 'No Connections Matching Search' : 'No Campus Connections Yet'}
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', maxWidth: '440px', margin: 'var(--space-2) auto var(--space-6) auto' }}>
                {searchTerm
                  ? 'Try searching with a different name or technical skill tag.'
                  : 'Expand your campus network! Explore student profiles by course and branch to send your first connection invitation.'}
              </p>
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
                onClick={() => navigate('/app/discover')}
              >
                Browse Student Directory
              </Button>
            </Card>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  Showing {filteredConnections.length} of {totalConnections} Connected Peers
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--space-5)',
                }}
              >
                {filteredConnections.map(({ id: connId, peer }) => (
                  <Card key={connId} surface="white" interactive style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Avatar initials={peer.fullName} size="lg" shape="rounded" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'var(--text-card)',
                            fontWeight: 800,
                            lineHeight: 1.25,
                            color: 'var(--color-ink-black)',
                          }}
                        >
                          {peer.fullName}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                          {peer.course} {peer.branch ? `• ${peer.branch}` : ''}
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                          {peer.college}
                        </p>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    {peer.bio && (
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-ink-black)',
                          margin: 'var(--space-3) 0',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {peer.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {peer.skills && peer.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: 'var(--space-2) 0' }}>
                        {peer.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 700,
                              backgroundColor: 'var(--color-cream)',
                              border: 'var(--border-thin) solid var(--color-ink-black)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {peer.skills.length > 3 && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-muted)', alignSelf: 'center' }}>
                            +{peer.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 'var(--space-3)',
                        borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPeer(peer)}
                      >
                        View Profile
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<UserMinus size={14} />}
                        onClick={() => handleRemoveConnection(connId, peer.fullName)}
                        style={{ color: 'var(--color-hot-pink)' }}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Requests Tab (Incoming & Outgoing) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Section 1: Incoming Invitations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 900 }}>
                Incoming Invitations ({incomingRequests.length})
              </h2>
              {incomingRequests.length > 0 && (
                <Badge variant="orange" size="sm">
                  REQUIRES ACTION
                </Badge>
              )}
            </div>

            {incomingRequests.length === 0 ? (
              <Card surface="cream" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <Check size={28} style={{ margin: '0 auto var(--space-2) auto', color: 'var(--color-electric-blue)' }} />
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                  All caught up! No incoming connection invitations right now.
                </p>
              </Card>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                {incomingRequests.map((req) => {
                  const sender = req.sender!;
                  return (
                    <Card key={req.id} surface="yellow" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Avatar initials={sender.fullName} size="lg" shape="rounded" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800 }}>
                            {sender.fullName}
                          </h3>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                            {sender.course} {sender.branch ? `• ${sender.branch}` : ''}
                          </p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                            {sender.college}
                          </p>
                        </div>
                      </div>

                      {req.message && (
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            fontStyle: 'italic',
                            backgroundColor: 'var(--color-white)',
                            padding: 'var(--space-2) var(--space-3)',
                            borderRadius: 'var(--radius-sm)',
                            border: 'var(--border-thin) solid var(--color-ink-black)',
                            marginTop: 'var(--space-3)',
                          }}
                        >
                          "{req.message}"
                        </p>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: 'var(--space-4)',
                          paddingTop: 'var(--space-3)',
                          borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                        }}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Check size={14} />}
                          style={{ flex: 1 }}
                          onClick={() => handleAcceptRequest(req.id, sender.fullName)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<X size={14} />}
                          onClick={() => handleRejectRequest(req.id, sender.fullName)}
                        >
                          Decline
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Outgoing Sent Invitations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 900 }}>
                Sent Invitations Awaiting Response ({outgoingRequests.length})
              </h2>
            </div>

            {outgoingRequests.length === 0 ? (
              <Card surface="cream" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)' }}>
                  You have no pending outgoing invitations.
                </p>
              </Card>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                {outgoingRequests.map((req) => {
                  const recipient = req.recipient!;
                  return (
                    <Card key={req.id} surface="white" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Avatar initials={recipient.fullName} size="md" shape="rounded" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 800 }}>
                            {recipient.fullName}
                          </h4>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>
                            {recipient.course} {recipient.academicYear ? `• ${recipient.academicYear}` : ''}
                          </p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block', marginTop: '0.2rem' }}>
                            Sent: {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 'var(--space-3)',
                          paddingTop: 'var(--space-3)',
                          borderTop: 'var(--border-thin) solid var(--color-ink-black)',
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<X size={14} />}
                          onClick={() => handleCancelRequest(req.id, recipient.fullName)}
                        >
                          Cancel Invitation
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Peer Profile Modal */}
      {selectedPeer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
          onClick={() => setSelectedPeer(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-thick) solid var(--color-ink-black)',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPeer(null)}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                background: 'var(--color-cream)',
                border: 'var(--border-thick) solid var(--color-ink-black)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <Avatar initials={selectedPeer.fullName} size="xl" shape="rounded" />
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 900,
                  }}
                >
                  {selectedPeer.fullName}
                </h2>
                <Badge variant="blue" size="sm">
                  CONNECTED PEER
                </Badge>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-cream)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-thin) solid var(--color-ink-black)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <GraduationCap size={16} color="var(--color-ink-muted)" />
                <span style={{ fontSize: 'var(--text-xs)' }}>
                  <strong>Degree:</strong> {selectedPeer.course} {selectedPeer.branch ? `(${selectedPeer.branch})` : ''} • {selectedPeer.academicYear}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Briefcase size={16} color="var(--color-ink-muted)" />
                <span style={{ fontSize: 'var(--text-xs)' }}>
                  <strong>Institution:</strong> {selectedPeer.college}
                </span>
              </div>
            </div>

            {selectedPeer.bio && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-muted)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  About
                </h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                  {selectedPeer.bio}
                </p>
              </div>
            )}

            {selectedPeer.skills && selectedPeer.skills.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h4
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-muted)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedPeer.skills.map((skill) => (
                    <Badge key={skill} variant="yellow" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedPeer.interests && selectedPeer.interests.length > 0 && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-muted)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Interests
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {selectedPeer.interests.map((interest) => (
                    <Badge key={interest} variant="pink" size="sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: 'var(--border-thick) solid var(--color-ink-black)', paddingTop: 'var(--space-3)' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedPeer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
