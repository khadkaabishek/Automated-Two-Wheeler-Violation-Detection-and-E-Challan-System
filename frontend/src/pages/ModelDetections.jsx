import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiDetectionApi } from '../api/aiDetection';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { BASE_URL } from '../api/client';

export default function ModelDetections() {
  const toast = useToast();
  const navigate = useNavigate();
  
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewImage, setViewImage] = useState(null);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const res = await aiDetectionApi.listDetections('PENDING');
      setDetections(res.detections || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch detections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
    
    // Poll every 10 seconds for new detections while on this page
    const interval = setInterval(fetchDetections, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscard = async (id) => {
    if (!window.confirm("Discard this false positive?")) return;
    try {
      await aiDetectionApi.updateDetection(id, 'DISCARDED');
      toast.success('Detection discarded');
      setDetections(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDiscardAll = async () => {
    if (!window.confirm("Are you sure you want to discard ALL pending detections? This cannot be undone.")) return;
    try {
      const res = await aiDetectionApi.discardAll();
      toast.success(res.message || 'All pending detections discarded');
      setDetections([]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleIssueChallan = (detection) => {
    // Navigate to Challans page and open the Create Modal with this data pre-filled
    navigate('/challans', {
      state: {
        autoOpenCreate: true,
        aiDetectionId: detection.id,
        aiPlateNumber: detection.plateNumber,
        aiViolations: JSON.parse(detection.violations || '[]'),
        aiSnapshotUrl: detection.snapshotUrl,
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">AI Model Detections</div>
          <div className="page-sub">Review raw detections from the Live Monitoring ML pipeline</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {detections.length > 0 && (
            <button className="btn btn-outline" style={{ borderColor: 'var(--civic-red)', color: 'var(--civic-red)' }} onClick={handleDiscardAll}>
              Discard All
            </button>
          )}
          <button className="btn btn-ghost" onClick={fetchDetections}>
            Refresh
          </button>
        </div>
      </div>

      {loading && detections.length === 0 ? (
        <Loader />
      ) : detections.length === 0 ? (
        <div className="card">
          <EmptyState title="No pending detections" desc="Upload a video in Live Monitoring to trigger AI detection." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {detections.map(det => {
            const violationNames = JSON.parse(det.violations || '[]');
            const imageUrl = det.snapshotUrl ? `${BASE_URL.replace('/api/v1', '')}${det.snapshotUrl}` : null;
            
            return (
              <div key={det.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{ height: '220px', backgroundColor: '#000', position: 'relative', cursor: imageUrl ? 'pointer' : 'default' }}
                  onClick={() => imageUrl && setViewImage(imageUrl)}
                >
                  {imageUrl ? (
                    <>
                      <img 
                        src={imageUrl} 
                        alt="Violation Snapshot" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} 
                           onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                           onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                        <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>View Image</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                      No image available
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--civic-red)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                    {new Date(det.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '2px', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                    {det.plateNumber}
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Detected Violations
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {violationNames.map(v => (
                        <span key={v} className="chip chip--violation" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>{v}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ flex: 1 }}
                      onClick={() => handleDiscard(det.id)}
                    >
                      Discard
                    </button>
                    <button 
                      className="btn btn-warn" 
                      style={{ flex: 2 }}
                      onClick={() => handleIssueChallan(det)}
                    >
                      Issue Challan
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Image Modal */}
      {viewImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setViewImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
            <button 
              onClick={() => setViewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <img 
              src={viewImage} 
              alt="Violation Zoom" 
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
