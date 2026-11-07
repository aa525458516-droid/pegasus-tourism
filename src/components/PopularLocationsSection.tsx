import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LocationDetails } from '../types';
import { POI_LOCATIONS, POICategory, POILocation } from '../data/popularLocations';
import { 
  Building, 
  MapPin, 
  Sparkles, 
  Plane, 
  Anchor, 
  Check, 
  ArrowUpRight, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface PopularLocationsSectionProps {
  onSelectAsPickup: (loc: LocationDetails) => void;
  onSelectAsDestination: (loc: LocationDetails) => void;
  currentPickupName?: string;
  currentDestinationName?: string;
}

export const PopularLocationsSection: React.FC<PopularLocationsSectionProps> = ({
  onSelectAsPickup,
  onSelectAsDestination,
  currentPickupName,
  currentDestinationName,
}) => {
  const { language, t, direction } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<POICategory>('hotels');

  const categories: { id: POICategory; label: string; icon: any }[] = [
    { id: 'hotels', label: language === 'ar' ? 'الفنادق والمنتجعات' : language === 'de' ? 'Hotels & Resorts' : 'Hotels & Resorts', icon: Building },
    { id: 'destinations', label: language === 'ar' ? 'الوجهات والمدن' : language === 'de' ? 'Reiseziele' : 'Destinations', icon: Compass },
    { id: 'attractions', label: language === 'ar' ? 'المعالم السياحية' : language === 'de' ? 'Sehenswürdigkeiten' : 'Attractions', icon: Sparkles },
    { id: 'airports', label: language === 'ar' ? 'المطارات' : language === 'de' ? 'Flughäfen' : 'Airports', icon: Plane },
    { id: 'marinas', label: language === 'ar' ? 'الموانئ والمارينا' : language === 'de' ? 'Marinas' : 'Marinas', icon: Anchor },
  ];

  const getLocalizedName = (poi: POILocation) => {
    if (language === 'de' && poi.nameDe) return poi.nameDe;
    if (language === 'ar' && poi.nameAr) return poi.nameAr;
    return poi.name;
  };

  const filteredPois = POI_LOCATIONS.filter((p) => p.category === activeCategory);

  const handleSelect = (poi: POILocation, type: 'pickup' | 'destination') => {
    const loc: LocationDetails = {
      name: getLocalizedName(poi),
      address: poi.address,
      latitude: poi.latitude,
      longitude: poi.longitude,
    };
    if (type === 'pickup') {
      onSelectAsPickup(loc);
    } else {
      onSelectAsDestination(loc);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE4D9] p-5 shadow-xs" dir={direction}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#F0ECE1] pb-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>{language === 'ar' ? 'أشهر الوجهات والمعالم السياحية' : language === 'de' ? 'Beliebte Orte & Sehenswürdigkeiten' : 'Popular Locations & POIs'}</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'ar' 
              ? 'اختر مباشرة بنقرة واحدة كمكان انطلاق أو وصول بإحداثيات مؤكدة'
              : language === 'de'
              ? 'Wählen Sie verifizierte Hotels, Resorts und Sehenswürdigkeiten mit einem Klick'
              : 'Select verified hotels, resorts, landmarks & airports directly as Pickup or Destination'}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37] shadow-xs'
                  : 'bg-[#FBF9F5] border border-[#EAE4D9] text-slate-700 hover:bg-slate-100'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D4AF37]' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredPois.map((poi) => {
          const localizedName = getLocalizedName(poi);
          const isSelectedPickup = currentPickupName === localizedName;
          const isSelectedDestination = currentDestinationName === localizedName;

          return (
            <div
              key={poi.id}
              className={`p-3 rounded-xl border text-xs transition flex flex-col justify-between ${
                isSelectedPickup || isSelectedDestination
                  ? 'border-[#D4AF37] bg-[#FDFBF7] shadow-xs'
                  : 'border-[#EAE4D9] bg-[#FBF9F5] hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0D1B2A] px-2 py-0.5 rounded">
                    {poi.badge}
                  </span>
                  {(isSelectedPickup || isSelectedDestination) && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      {isSelectedPickup ? 'Pickup' : 'Dest'}
                    </span>
                  )}
                </div>

                <div className="font-bold text-[#0D1B2A] text-xs leading-snug line-clamp-1">
                  {localizedName}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5" title={poi.address}>
                  {poi.address}
                </div>
              </div>

              {/* Action Buttons: Set as Pickup or Destination */}
              <div className="mt-2.5 pt-2 border-t border-[#EAE4D9] flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelect(poi, 'pickup')}
                  className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white border border-[#D5CDBD] text-slate-700 hover:border-[#D4AF37] hover:text-[#0D1B2A] transition cursor-pointer"
                  title="Set as Pickup Location"
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(poi, 'destination')}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#0D1B2A] text-[#D4AF37] hover:brightness-110 transition cursor-pointer"
                  title="Set as Destination Location"
                >
                  Destination
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
