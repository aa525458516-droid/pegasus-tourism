import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { LocationDetails } from '../types';
import { POI_LOCATIONS, POILocation, POICategory } from '../data/popularLocations';
import { 
  MapPin, 
  Search, 
  X, 
  Check, 
  Navigation, 
  Building, 
  Plane, 
  Compass,
  Anchor,
  Sparkles,
  Loader2,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationDetails) => void;
  initialLocation?: LocationDetails;
  title?: string;
  defaultType?: 'pickup' | 'destination';
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
  title,
  defaultType = 'pickup',
}) => {
  const { t, language, direction } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string; isLocal?: boolean }[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | POICategory>('all');
  
  const [currentName, setCurrentName] = useState(initialLocation?.name || '');
  const [currentAddress, setCurrentAddress] = useState(initialLocation?.address || '');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      return { lat: initialLocation.latitude, lng: initialLocation.longitude };
    }
    return defaultType === 'pickup' 
      ? { lat: 27.1783, lng: 33.7994 } // Hurghada Airport Terminal 1
      : { lat: 27.3976, lng: 33.6775 }; // El Gouna
  });

  const [selectedPoi, setSelectedPoi] = useState<POILocation | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const primaryMarkerRef = useRef<L.Marker | null>(null);
  const poiLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Helper to get localized name
  const getPoiName = useCallback((poi: POILocation) => {
    if (language === 'de' && poi.nameDe) return poi.nameDe;
    if (language === 'ar' && poi.nameAr) return poi.nameAr;
    return poi.name;
  }, [language]);

  // Create icon for POI markers
  const createPoiIcon = (poi: POILocation) => {
    let bgGradient = 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 100%)';
    let iconSvg = '';
    let borderColor = '#D4AF37';

    switch (poi.category) {
      case 'hotels':
        bgGradient = 'linear-gradient(135deg, #99781B 0%, #D4AF37 100%)';
        borderColor = '#FFFFFF';
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/></svg>`;
        break;
      case 'attractions':
        bgGradient = 'linear-gradient(135deg, #047857 0%, #10B981 100%)';
        borderColor = '#F59E0B';
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        break;
      case 'airports':
        bgGradient = 'linear-gradient(135deg, #0D1B2A 0%, #2563EB 100%)';
        borderColor = '#D4AF37';
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
        break;
      case 'marinas':
        bgGradient = 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)';
        borderColor = '#FFFFFF';
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
        break;
      case 'destinations':
      default:
        bgGradient = 'linear-gradient(135deg, #0D1B2A 0%, #334155 100%)';
        borderColor = '#D4AF37';
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
        break;
    }

    const shortTitle = getPoiName(poi).split('(')[0].trim();

    return L.divIcon({
      className: 'pegasus-poi-pin-container',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${bgGradient};
            border: 2px solid ${borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            transition: transform 0.15s ease-in-out;
          ">
            ${iconSvg}
          </div>
          <div style="
            background: rgba(13, 27, 42, 0.95);
            color: #FFFFFF;
            border: 1px solid rgba(212, 175, 55, 0.7);
            font-size: 10px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 6px;
            margin-top: 2px;
            white-space: nowrap;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            pointer-events: none;
          ">
            ${shortTitle}
          </div>
        </div>
      `,
      iconSize: [140, 52],
      iconAnchor: [70, 14],
      popupAnchor: [0, -20],
    });
  };

  // Render or refresh visible POIs on the map
  const renderPoisOnMap = useCallback(() => {
    if (!mapInstanceRef.current || !poiLayerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const currentZoom = map.getZoom();
    const poiGroup = poiLayerGroupRef.current;
    poiGroup.clearLayers();

    // Filter POIs by category and zoom
    const filteredPois = POI_LOCATIONS.filter((poi) => {
      // Category filter
      if (activeCategory !== 'all' && poi.category !== activeCategory) {
        return false;
      }
      // Dynamic zoom threshold (show all when matching a specific category filter, or if currentZoom >= minZoom)
      if (activeCategory !== 'all') {
        return true;
      }
      return currentZoom >= poi.minZoom;
    });

    filteredPois.forEach((poi) => {
      const marker = L.marker([poi.latitude, poi.longitude], {
        icon: createPoiIcon(poi),
        title: getPoiName(poi),
      });

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.style.padding = '4px';
      popupContent.style.fontFamily = 'inherit';

      popupContent.innerHTML = `
        <div style="border-bottom: 1px solid #EAE4D9; padding-bottom: 6px; margin-bottom: 6px;">
          <span style="
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            background: #0D1B2A;
            color: #D4AF37;
            margin-bottom: 4px;
          ">${poi.badge}</span>
          <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #0D1B2A; line-height: 1.25;">
            ${getPoiName(poi)}
          </h4>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B; line-height: 1.35;">
          ${poi.address}
        </p>
        <button id="poi-select-btn-${poi.id}" style="
          width: 100%;
          background: linear-gradient(135deg, #0D1B2A 0%, #1B263B 100%);
          color: #D4AF37;
          border: 1px solid #D4AF37;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        ">
          <span>✓ ${t('map.selectThisLocation')}</span>
        </button>
      `;

      // Attach button click event
      marker.bindPopup(popupContent, { maxWidth: 280, className: 'pegasus-leaflet-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`poi-select-btn-${poi.id}`);
        if (btn) {
          btn.onclick = () => {
            selectPoi(poi);
            marker.closePopup();
          };
        }
      });

      marker.addTo(poiGroup);
    });
  }, [activeCategory, getPoiName]);

  // Select POI programmatically
  const selectPoi = (poi: POILocation) => {
    setSelectedPoi(poi);
    const resolvedName = getPoiName(poi);
    setCurrentName(resolvedName);
    setCurrentAddress(poi.address);
    setCoords({ lat: poi.latitude, lng: poi.longitude });

    if (mapInstanceRef.current && primaryMarkerRef.current) {
      mapInstanceRef.current.flyTo([poi.latitude, poi.longitude], 15, { duration: 1.2 });
      primaryMarkerRef.current.setLatLng([poi.latitude, poi.longitude]);
    }
  };

  // Reverse geocoding helper via Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const shortName = data.name || data.address?.hotel || data.address?.tourism || data.address?.suburb || data.address?.city || 'Selected Location';
          setCurrentName((prev) => prev && prev !== 'Custom Map Point' ? prev : shortName);
          setCurrentAddress(data.display_name);
        }
      }
    } catch (e) {
      console.warn('Reverse geocode note:', e);
    }
  };

  // Search places (local POIs + Nominatim)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);

    const queryLower = searchQuery.trim().toLowerCase();

    // 1. Search local curated POIs first (instant match)
    const localMatches = POI_LOCATIONS.filter((poi) =>
      poi.name.toLowerCase().includes(queryLower) ||
      poi.nameDe.toLowerCase().includes(queryLower) ||
      poi.nameAr.includes(queryLower) ||
      poi.address.toLowerCase().includes(queryLower)
    ).map((poi) => ({
      display_name: `${getPoiName(poi)} — ${poi.address}`,
      lat: poi.latitude.toString(),
      lon: poi.longitude.toString(),
      isLocal: true,
      poiItem: poi,
    }));

    if (localMatches.length > 0) {
      setSearchResults(localMatches);
      selectSearchResult(localMatches[0]);
      setSearching(false);
      return;
    }

    // 2. Fall back to Nominatim search
    try {
      const q = encodeURIComponent(`${searchQuery.trim()}, Egypt`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=eg&limit=6`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if (data.length > 0) {
          selectSearchResult(data[0]);
        }
      }
    } catch (err) {
      console.error('Location search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item: { display_name: string; lat: string; lon: string; poiItem?: POILocation }) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const namePart = item.display_name.split(',')[0].trim();

    setCoords({ lat, lng });
    setCurrentName(namePart);
    setCurrentAddress(item.display_name);
    setSearchResults([]);

    if (item.poiItem) {
      setSelectedPoi(item.poiItem);
    }

    if (mapInstanceRef.current && primaryMarkerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
      primaryMarkerRef.current.setLatLng([lat, lng]);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // High-contrast luxury pin for the primary selected point
      const primaryPinIcon = L.divIcon({
        className: 'custom-primary-pin',
        html: `
          <div style="position: relative; width: 40px; height: 50px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));">
            <svg width="40" height="50" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 18 44 18 44C18 44 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#0D1B2A"/>
              <path d="M18 2C9.16344 2 2 9.16344 2 18C2 27.3 18 41.5 18 41.5C18 41.5 34 27.3 34 18C34 9.16344 26.8366 2 18 2Z" stroke="#D4AF37" stroke-width="2.5"/>
              <circle cx="18" cy="18" r="8" fill="#D4AF37"/>
              <circle cx="18" cy="18" r="3.5" fill="#0D1B2A"/>
            </svg>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
      });

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 12,
        zoomControl: true,
      });

      // Standard OpenStreetMap tiles - 100% open, reliable, no API key required
      const osmTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      });
      osmTileLayer.addTo(map);

      // Create LayerGroup for POIs
      const poiGroup = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = poiGroup;

      // Add Draggable Primary Marker
      const marker = L.marker([coords.lat, coords.lng], {
        icon: primaryPinIcon,
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords({ lat: Number(pos.lat.toFixed(5)), lng: Number(pos.lng.toFixed(5)) });
        setSelectedPoi(null);
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
        setSelectedPoi(null);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      // Update POIs on zoom
      map.on('zoomend', () => {
        renderPoisOnMap();
      });

      mapInstanceRef.current = map;
      primaryMarkerRef.current = marker;

      // Ensure map dimensions and tiles calculate cleanly as dialog opens
      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 300);
      const t3 = setTimeout(() => map.invalidateSize(), 600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Re-render POIs when active category changes
  useEffect(() => {
    renderPoisOnMap();
  }, [activeCategory, renderPoisOnMap]);

  const handleConfirm = () => {
    const resolvedName = currentName.trim() || `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
    const resolvedAddress = currentAddress.trim() || resolvedName;

    onSelectLocation({
      name: resolvedName,
      address: resolvedAddress,
      latitude: coords.lat,
      longitude: coords.lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  const categoryChips: { id: 'all' | POICategory; label: string; icon: any }[] = [
    { id: 'all', label: language === 'ar' ? 'الكل' : language === 'de' ? 'Alle Orte' : 'All Places', icon: Compass },
    { id: 'hotels', label: language === 'ar' ? 'الفنادق والمنتجعات' : language === 'de' ? 'Hotels & Resorts' : 'Hotels & Resorts', icon: Building },
    { id: 'attractions', label: language === 'ar' ? 'المعالم السياحية' : language === 'de' ? 'Sehenswürdigkeiten' : 'Attractions', icon: Sparkles },
    { id: 'airports', label: language === 'ar' ? 'المطارات' : language === 'de' ? 'Flughäfen' : 'Airports', icon: Plane },
    { id: 'marinas', label: language === 'ar' ? 'الموانئ والمارينا' : language === 'de' ? 'Marinas & Häfen' : 'Marinas', icon: Anchor },
    { id: 'destinations', label: language === 'ar' ? 'المدن والوجهات' : language === 'de' ? 'Hauptreiseziele' : 'Destinations', icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/50 w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]"
        dir={direction}
      >
        {/* Header */}
        <div className="bg-[#0D1B2A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-white">
                {title || (defaultType === 'pickup' ? 'Select Pickup Location' : 'Select Destination')}
              </h3>
              <p className="text-[11px] text-slate-300">
                Explore hotels, resorts, landmarks & airports on the map or click any point to drop pin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Category Filters */}
        <div className="p-3 sm:p-4 bg-[#FBF9F5] border-b border-[#EAE4D9] space-y-2.5 shrink-0">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('map.searchPlaceholder')}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs rounded-xl border border-[#D5CDBD] bg-white focus:outline-hidden focus:border-[#D4AF37] shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] text-xs font-bold hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search</span>
            </button>
          </form>

          {/* Autocomplete dropdown if results returned */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-xl border border-[#D4AF37] shadow-lg p-2 max-h-44 overflow-y-auto space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">
                Matching Places:
              </span>
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSearchResult(res)}
                  className="w-full text-left rtl:text-right px-3 py-2 rounded-lg text-xs hover:bg-[#F8F5EE] text-slate-800 flex items-start justify-between gap-2 transition"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-900 line-clamp-1">{res.display_name}</span>
                  </div>
                  <span className="text-[10px] text-[#D4AF37] font-semibold shrink-0">View on Map</span>
                </button>
              ))}
            </div>
          )}

          {/* POI Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 rtl:mr-0 rtl:ml-1 hidden sm:inline">
              Filter Map:
            </span>
            {categoryChips.map((chip) => {
              const IconComp = chip.icon;
              const isActive = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveCategory(chip.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs border border-[#D4AF37]'
                      : 'bg-white border border-[#EAE4D9] text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-slate-500'}`} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Map Canvas */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] h-[400px] sm:h-[500px] bg-[#F8F5EE] overflow-hidden">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" style={{ minHeight: '380px' }} />

          {/* Floating Instructions Banner */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-11/12 max-w-md text-center">
            <span className="px-3.5 py-1.5 rounded-full bg-[#0D1B2A]/90 text-white text-[11px] font-medium shadow-lg border border-[#D4AF37]/50 backdrop-blur-xs inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              Click any place pin on map or drag the golden marker
            </span>
          </div>

          {/* Quick POI count pill */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-white/90 text-slate-800 text-[10px] font-semibold shadow-xs border border-[#EAE4D9]">
              {POI_LOCATIONS.length} Verified Red Sea & Egypt POIs Loaded
            </span>
          </div>
        </div>

        {/* Footer: Selected Location Card & Confirmation */}
        <div className="p-4 bg-white border-t border-[#EAE4D9] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="w-full sm:flex-1 text-xs">
            <div className="font-bold text-[#0D1B2A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="Selected Location Name..."
                className="font-bold text-sm text-[#0D1B2A] border-b border-dashed border-[#D4AF37] focus:outline-hidden bg-transparent w-full"
              />
            </div>

            <div className="text-slate-500 text-[11px] truncate mt-1" title={currentAddress}>
              {currentAddress || 'Coordinates selected'}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
              <span>Lat: {coords.lat.toFixed(5)}</span>
              <span>•</span>
              <span>Lng: {coords.lng.toFixed(5)}</span>
              {selectedPoi && (
                <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-sans font-semibold">
                  {selectedPoi.badge}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 border border-[#D4AF37] transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('map.confirmLocation')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
