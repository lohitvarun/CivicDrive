import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Camera, MapPin, Calendar, Car, FileText, Send, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export const NewReport = () => {
  const { token, addToast, setActiveTab } = useAuth();
  const [loading, setLoading] = useState(false);

  const [violationType, setViolationType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [location, setLocation] = useState('');
  const [violationTime, setViolationTime] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    // Set default datetime to local current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setViolationTime(now.toISOString().slice(0, 16));
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      addToast('Image size must be less than 3MB', 'warn');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target.result);
      setPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!violationType || !vehicleNumber || !location || !violationTime) {
      addToast('Please fill in all required fields marked with *', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          violation_type: violationType,
          vehicle_number: vehicleNumber.toUpperCase().trim(),
          location: location.trim(),
          violation_time: violationTime,
          photo_url: photoUrl,
          description: description.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      addToast(`Report ${data.report.report_code} submitted successfully!`, 'success');
      setActiveTab('my-reports');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#4aa3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={22} /> Report Traffic Violation
        </h2>
        <p style={{ color: '#9bb0ca', fontSize: '0.85rem', marginTop: '4px' }}>
          Fill in details of the traffic incident accurately. Submissions are reviewed by traffic authorities.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Violation Type */}
          <div className="form-group">
            <label>Violation Type *</label>
            <select
              className="form-control"
              value={violationType}
              onChange={e => setViolationType(e.target.value)}
              required
            >
              <option value="">-- Select Violation Category --</option>
              <option value="Over Speeding">Over Speeding</option>
              <option value="Red Light Jump">Red Light Jump</option>
              <option value="No Helmet">No Helmet</option>
              <option value="Wrong Side Driving">Wrong Side Driving</option>
              <option value="Drunken Driving">Drunken Driving</option>
              <option value="Illegal Parking">Illegal Parking</option>
              <option value="Using Mobile While Driving">Using Mobile While Driving</option>
              <option value="No Seat Belt">No Seat Belt</option>
              <option value="Triple Riding">Triple Riding</option>
              <option value="Triple Riding / Rash Driving">Triple Riding / Rash Driving</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Vehicle Number */}
          <div className="form-group">
            <label>Vehicle License Plate *</label>
            <div style={{ position: 'relative' }}>
              <Car size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '42px', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '1px' }}
                placeholder="e.g. MH12 AB 1234"
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location *</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '42px' }}
                placeholder="Street / Junction / Landmark / City"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-group">
            <label>Date & Time of Incident *</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
              <input
                type="datetime-local"
                className="form-control"
                style={{ paddingLeft: '42px' }}
                value={violationTime}
                onChange={e => setViolationTime(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Upload Photo Evidence */}
        <div className="form-group" style={{ marginTop: '10px' }}>
          <label>Upload Photo / Evidence</label>
          <div
            style={{
              border: '2px dashed rgba(255,255,255,0.18)',
              borderRadius: '14px',
              padding: '20px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('fileUploadInput').click()}
          >
            <input
              id="fileUploadInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            {photoPreview ? (
              <div>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ maxHeight: '200px', borderRadius: '10px', objectFit: 'cover', margin: '0 auto', display: 'block' }}
                />
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#4aa3ff', fontWeight: 600 }}>
                  Click to replace photo
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#9bb0ca' }}>
                <Camera size={36} color="#4aa3ff" />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e4edf7' }}>
                  Click or drag photo evidence here
                </span>
                <span style={{ fontSize: '0.75rem', color: '#7188a4' }}>
                  PNG, JPG or WEBP (Max size: 3MB)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Description */}
        <div className="form-group">
          <label>Additional Description / Observations</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Provide any additional details (traffic signal status, direction of travel, etc.)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-emerald"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Submitting Report...' : (
            <>
              <Send size={18} /> Submit Violation Report
            </>
          )}
        </button>
      </form>
    </div>
  );
};
