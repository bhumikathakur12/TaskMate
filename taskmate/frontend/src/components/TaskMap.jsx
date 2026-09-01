import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatRupees } from '../constants/categories';

// Leaflet's default marker images don't resolve correctly through Vite's bundler,
// so we build a custom divIcon styled like a dispatch-board pin instead of
// depending on the shipped PNG assets.
const pinIcon = (highlight = false) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${highlight ? '#2FB6A6' : '#FF6A1A'};
      transform: rotate(-45deg);
      border: 2px solid #131B2E;
      box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

function RecenterOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1]]);
  return null;
}

export default function TaskMap({ tasks, center, userLocation, height = '420px' }) {
  const mapCenter = center || [30.3398, 75.5855]; // Jalandhar, Punjab as a sane default

  return (
    <div style={{ height }} className="overflow-hidden rounded-sm border border-board-line">
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange center={center} />

        {userLocation && (
          <Marker position={userLocation} icon={pinIcon(true)}>
            <Popup>You're here</Popup>
          </Marker>
        )}

        {tasks
          .filter((t) => t.location?.coordinates?.length === 2)
          .map((task) => {
            const [lng, lat] = task.location.coordinates;
            return (
              <Marker key={task._id} position={[lat, lng]} icon={pinIcon()}>
                <Popup>
                  <div className="font-body">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm">{formatRupees(task.budget)}</p>
                    <Link to={`/tasks/${task._id}`} className="text-sm text-orange-600 underline">
                      View details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
