import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiDetectionApi } from '../api/aiDetection';
import { BASE_URL, tokenStore } from '../api/client';
import { useToast } from '../context/ToastContext';
import Field from '../components/Field';
import Loader from '../components/Loader';

const MOCK_CCTVS = [
  { id: 'CCTV-KTM-001', location: 'Tinkune Intersection' },
  { id: 'CCTV-BKT-002', location: 'Suryabinayak Chowk' },
  { id: 'CCTV-LTP-003', location: 'Satdobato Ring Road' },
];

export default function LiveMonitoring() {
  const toast = useToast();
  const navigate = useNavigate();
  
  const [selectedCCTV, setSelectedCCTV] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ML Processing State
  const [activeJob, setActiveJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [violationDetected, setViolationDetected] = useState(false);
  const logsEndRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // New state: 'idle', 'uploading', 'uploaded'
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!activeJob?.jobId) return;

    const token = tokenStore.getAccess();
    const streamUrl = `${BASE_URL}/ai-detection/stream/${activeJob.jobId}?token=${token}`;
    const source = new EventSource(streamUrl);

    source.addEventListener('log', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs(prev => [...prev, data.message]);
        if (data.message.includes('Process exited')) {
            setUploading(false);
            source.close();
        }
      } catch (err) {}
    });

    source.addEventListener('violation', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs(prev => [...prev, `[ALERT] ${data.message}`]);
        setViolationDetected(true);
      } catch (err) {}
    });

    source.addEventListener('close', () => {
      source.close();
      setUploading(false);
    });

    source.onerror = (err) => {
      console.error('EventSource failed:', err);
      source.close();
      setUploading(false);
      setLogs(prev => [...prev, '[SYSTEM] Stream disconnected.']);
    };

    return () => {
      source.close();
    };
  }, [activeJob]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please select a video file first');
      return;
    }
    setUploadStatus('uploading'); 
    setUploading(true);
    setLogs([]);
    setViolationDetected(false);
    setActiveJob(null);
    
    try {
      const formData = new FormData();
      formData.append('media', videoFile);

      const res = await aiDetectionApi.uploadVideo(formData);
      
      if (res && res.jobId) {
        toast.success(res.message || 'Media uploaded and queued for processing');
        setActiveJob({ jobId: res.jobId });
        setUploadStatus('uploaded'); 
      } else {
        throw new Error('No job ID returned');
      }
      setVideoFile(null);
    } catch (err) {
      toast.error(err.message || 'Failed to upload video');
      setUploading(false);
      setUploadStatus('idle');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Live Monitoring</div>
          <div className="page-sub">Monitor live CCTV feeds and test ML detection</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 450px', gap: '2rem' }}>
        {/* Left Column: Feed and Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Live Feed Viewer */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Camera Feed</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <Field label="Select CCTV">
                <select
                  className="input"
                  value={selectedCCTV}
                  onChange={(e) => setSelectedCCTV(e.target.value)}
                >
                  <option value="">-- Choose a camera --</option>
                  {MOCK_CCTVS.map(cctv => (
                    <option key={cctv.id} value={cctv.id}>
                      {cctv.id} ({cctv.location})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div 
              style={{ 
                aspectRatio: '16/9', 
                backgroundColor: '#000', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                border: '1px solid var(--border-color)',
                position: 'relative'
              }}
            >
              {selectedCCTV ? (
                <div style={{ textAlign: 'center' }}>
                  <span className="spinner" style={{ display: 'block', margin: '0 auto 1rem', width: '30px', height: '30px' }} />
                  <p>Connecting to {selectedCCTV}...</p>
                  <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>(Live feed placeholder)</p>
                </div>
              ) : (
                <p>Select a camera to view feed</p>
              )}
            </div>
          </div>

          {/* Manual Video Upload for ML Testing */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Upload for Testing</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginBottom: '1.5rem' }}>
              Upload a local video or image file to pass into the ML models for violation processing.
            </p>
            
            <form onSubmit={handleUpload}>
    <Field label="Media File">
      <input
        type="file"
        accept="image/*,video/*"
        className="input"
        onChange={(e) => setVideoFile(e.target.files[0])}
        disabled={uploadStatus === 'uploading'}
      />
    </Field>

    <button
      type="submit"
      className="btn btn-primary"
      style={{ width: '100%', marginTop: '1rem' }}
      disabled={!videoFile || uploadStatus === 'uploading'}
    >
      {uploadStatus === 'uploading' ? (
        <>
          <span className="spinner" /> Uploading...
        </>
      ) : uploadStatus === 'uploaded' ? (
        'Uploaded'
      ) : (
        'Upload & Process'
      )}
    </button>
  </form>
          </div>
        </div>

        {/* Right Column: ML Processing Terminal */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '800px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--ink-50)' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>ML Processing Workflow</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: '4px 0 0 0' }}>Live detection analysis</p>
          </div>
          
          <div style={{ 
            flex: 1, 
            backgroundColor: '#1e1e1e', 
            color: '#00ff00', 
            fontFamily: 'monospace',
            padding: '16px',
            overflowY: 'auto',
            fontSize: '0.85rem',
            lineHeight: '1.5'
          }}>
            {logs.length === 0 ? (
              <span style={{ color: '#888' }}>{activeJob?.jobId ? 'Connecting to ML stream...' : 'Waiting for video upload...'}</span>
            ) : (
              logs.map((log, index) => {
                const isAlert = log.includes('[ALERT]');
                const isError = log.includes('[ERROR]');
                const isSystem = log.includes('[SYSTEM]');
                
                let textColor = '#00ff00';
                if (isError) textColor = '#ff5252';
                else if (isSystem) textColor = '#42a5f5';
                else if (isAlert) textColor = '#ffeb3b';

                return (
                  <div 
                    key={index} 
                    style={{ 
                      marginBottom: '8px', 
                      wordBreak: 'break-all',
                      color: textColor,
                      fontWeight: isAlert ? 'bold' : 'normal'
                    }}
                  >
                    <span style={{ color: '#888', marginRight: '8px' }}>{new Date().toLocaleTimeString()}</span>
                    {log}
                  </div>
                )
              })
            )}
            <div ref={logsEndRef} />
          </div>
          
          {violationDetected && (
            <div style={{ padding: '16px', backgroundColor: 'var(--civic-gold)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>⚠️ Violation Sent to AI Detections Module!</p>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => navigate('/ai-detections')}
                style={{ width: '100%' }}
              >
                Review AI Detections
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
