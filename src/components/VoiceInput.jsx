import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPreview = ({ location }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!location) return;

    const { latitude, longitude } = location;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [latitude, longitude],
        15
      );
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude]).addTo(
        mapInstanceRef.current
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [location]);

  return <div style={{ height: '200px', width: '100%' }} ref={mapRef}></div>;
};

const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const recognitionRef = useRef(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationError(null);
      },
      () => setLocationError('Unable to get location, please enable location')
    );
  };

  const startRecording = () => {
    setError(null);
    getLocation();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setShowPreview(false);
      setSuccess(false);
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + text + ' ');
        } else {
          interimTranscript += text;
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      if (transcript.trim()) setShowPreview(true);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const saveTranscript = async () => {
    setError(null);
    try {
      await addDoc(collection(firestore, 'issues'), {
        text: transcript.trim(),
        timestamp: serverTimestamp(),
        status: 'pending',
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : null,
      });
      setTranscript('');
      setShowPreview(false);
      setSuccess(true);
    } catch {
      setError('Failed to save complaint');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Voice Input</h2>

      {locationError && <p style={{ color: 'red' }}>{locationError}</p>}

      <button onClick={isRecording ? stopRecording : startRecording} style={{ marginBottom: 20 }}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      <div>
        <h4>Transcript:</h4>
        <p>{transcript}</p>
      </div>

      {showPreview && (
        <div style={{ marginTop: 20, padding: 10, border: '1px solid #ccc' }}>
          <h4>Preview Complaint</h4>
          <p>{transcript}</p>
          {location && (
            <>
              <p>
                <strong>Location:</strong> {location.latitude.toFixed(5)},{' '}
                {location.longitude.toFixed(5)}
              </p>
              <MapPreview location={location} />
            </>
          )}
          <button onClick={saveTranscript} style={{ marginRight: 10 }}>
            Save Complaint
          </button>
          <button onClick={() => setShowPreview(false)}>Cancel</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Complaint saved successfully!</p>}
    </div>
  );
};

export default VoiceInput;
