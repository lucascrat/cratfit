import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';

const darkStyle = [
    { elementType: "geometry", stylers: [{ color: "#112117" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#2c4c3b" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1bda67" }],
        weight: 1
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0e1626" }],
    },
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    },
    {
        featureType: "transit",
        stylers: [{ visibility: "off" }]
    }
];

// Path drawer component using the Maps JavaScript API
const PathDrawer = ({ positions, center, followUser }) => {
    const map = useMap();
    const geometryLib = useMapsLibrary('geometry');
    const polylineRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        // Create polyline if it doesn't exist
        if (!polylineRef.current) {
            polylineRef.current = new google.maps.Polyline({
                path: [],
                geodesic: true,
                strokeColor: "#1bda67",
                strokeOpacity: 1.0,
                strokeWeight: 6,
                map: map
            });
        }

        // Create marker if it doesn't exist
        if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 3,
                },
                zIndex: 1000
            });
        }

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
        };
    }, [map]);

    // Update path and marker position
    useEffect(() => {
        if (!map || !polylineRef.current || !markerRef.current) return;

        const path = positions.map(p => ({ lat: p.lat, lng: p.lng }));
        polylineRef.current.setPath(path);

        if (positions.length > 0) {
            const lastPos = path[path.length - 1];
            markerRef.current.setPosition(lastPos);
            if (followUser) {
                map.panTo(lastPos);
            }
        } else if (center) {
            markerRef.current.setPosition(center);
            if (followUser) {
                map.panTo(center);
            }
        }
    }, [positions, center, followUser, map]);

    return null;
};

const LiveMap = ({
    positions = [],
    center,
    followUser = true,
    onMapReady,
    zoom = 17,
    mapType = 'roadmap',
    showTraffic = false
}) => {
    const [mapError, setMapError] = useState(false);
    const [currentCenter, setCurrentCenter] = useState(null);

    // Check if API key exists
    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#112117] text-gray-400">
                <div className="text-center">
                    <p className="text-sm mb-2">⚠️ Chave da API não configurada</p>
                    <p className="text-xs">Configure VITE_GOOGLE_MAPS_API_KEY</p>
                </div>
            </div>
        );
    }

    // Calculate the current map center based on positions or center prop
    const mapCenter = center ||
        (positions.length > 0
            ? { lat: positions[positions.length - 1].lat, lng: positions[positions.length - 1].lng }
            : { lat: -5.1889, lng: -40.6678 });

    // Update current center when positions change
    useEffect(() => {
        if (followUser && positions.length > 0) {
            const lastPos = positions[positions.length - 1];
            setCurrentCenter({ lat: lastPos.lat, lng: lastPos.lng });
        } else if (center) {
            setCurrentCenter(center);
        }
    }, [positions, center, followUser]);

    return (
        <div className="w-full h-full bg-[#112117]">
            <APIProvider
                apiKey={GOOGLE_MAPS_API_KEY}
                onLoad={() => {
                    console.log('[LiveMap] Google Maps API loaded successfully');
                    if (onMapReady) onMapReady(true);
                }}
                onError={(error) => {
                    console.error('[LiveMap] Error loading Google Maps API:', error);
                    setMapError(true);
                    if (onMapReady) onMapReady(false);
                }}
            >
                {mapError ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#112117] text-gray-400">
                        <div className="text-center">
                            <p className="text-sm mb-2">⚠️ Erro ao carregar Google Maps</p>
                            <p className="text-xs">Verifique sua conexão e chave de API</p>
                        </div>
                    </div>
                ) : (
                    <Map
                        defaultZoom={zoom}
                        defaultCenter={mapCenter}
                        center={followUser && currentCenter ? currentCenter : undefined}
                        mapTypeId={mapType}
                        styles={mapType === 'roadmap' ? darkStyle : []}
                        disableDefaultUI={true}
                        zoomControl={false}
                        mapTypeControl={false}
                        scaleControl={true}
                        streetViewControl={false}
                        rotateControl={true}
                        fullscreenControl={false}
                        backgroundColor="#112117"
                        tilt={45}
                        className="w-full h-full"
                    >
                        <PathDrawer
                            positions={positions}
                            center={center}
                            followUser={followUser}
                        />
                    </Map>
                )}
            </APIProvider>
        </div>
    );
};

export default LiveMap;
