import { useState } from 'react';
import { aiDetectionApi } from '../api/aiDetection';
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
  
  const [selectedCCTV, setSelectedCCTV] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please select a video file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('evidenceVideo', videoFile);

      const res = await aiDetectionApi.uploadVideo(formData);
      toast.success(res.message || 'Video uploaded and queued for processing');
      setVideoFile(null);
    } catch (err) {
      toast.error(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
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

      <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
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
                {/* 
                  When actual live feed is available, replace this with an RTSP player or <video> tag
                */}
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
            Upload a local video file to pass into the ML models for violation processing.
          </p>
          
          <form onSubmit={handleUpload}>
            <Field label="Video File">
              <input
                type="file"
                accept="video/mp4,video/mpeg,video/quicktime,video/webm"
                className="input"
                onChange={(e) => setVideoFile(e.target.files[0])}
                disabled={uploading}
              />
            </Field>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={!videoFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner" /> Uploading...
                </>
              ) : (
                'Upload & Process'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
