import { Tour, VehicleOption, CompanySettings } from '../types';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'PEGASUS Hurghada Luxury Tourism & Transfers',
  phone: '+20 [Insert Company Phone - Editable Placeholder]',
  whatsapp: '+20 [Insert WhatsApp Number - Editable Placeholder]',
  email: 'info@[company-domain.com - Editable Placeholder]',
  address: '[Insert Office Street Address, Hurghada, Red Sea, Egypt - Editable Placeholder]',
  emergencyPhone: '+20 [Insert Emergency Dispatch Phone - Editable Placeholder]',
  officeHours: '[Insert Working / Dispatch Hours - Editable Placeholder]',
  licenseNumber: '[Insert Egyptian Ministry of Tourism License No. - Editable Placeholder]',
};

export const INITIAL_VEHICLES: VehicleOption[] = [
  {
    id: 'luxury_sedan',
    name: 'Executive Sedan [Model Customizable by Operator]',
    nameDe: 'Executive Limousine [Modell anpassbar durch Betreiber]',
    nameAr: 'سيدان تنفيذية فاخرة [قابلة للتخصيص من قبل الشركة]',
    category: 'VIP Sedan',
    capacityPassengers: 3,
    capacityLuggage: 3,
    description: '[Vehicle specifications, climate control, and amenities customizable by company operator].',
    descriptionDe: '[Fahrzeugausstattung und Klimatisierung individuell durch Betreiber anpassbar].',
    descriptionAr: '[المواصفات والتجهيزات قابلة للتعديل والتخصيص بواسطة الشركة].',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    features: ['[Up to 3 Passengers - Editable]', '[3 Standard Bags - Editable]', '[A/C Climate Control]', '[Flight Monitoring Option]']
  },
  {
    id: 'vip_minivan',
    name: 'VIP Passenger Minivan [Model Customizable]',
    nameDe: 'VIP Minivan [Modell anpassbar]',
    nameAr: 'حافلة صغيرة VIP [الموديل قابل للتخصيص]',
    category: 'VIP Minivan',
    capacityPassengers: 7,
    capacityLuggage: 8,
    description: '[Spacious passenger van for families or small groups; luggage capacity customizable by operator].',
    descriptionDe: '[Geräumiger Van für Familien und Gruppen; Kapazitäten anpassbar].',
    descriptionAr: '[حافلة ركاب رحبة للعائلات والمجموعات؛ السعة قابلة للتعديل].',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    features: ['[Up to 7 Passengers - Editable]', '[8 Large Bags - Editable]', '[Dual Zone A/C]', '[Child Seats upon Request]']
  },
  {
    id: 'executive_suv',
    name: 'Executive All-Terrain SUV [Model Customizable]',
    nameDe: 'Executive Geländewagen [Modell anpassbar]',
    nameAr: 'سيارة دفع رباعي فارهة [الموديل قابل للتخصيص]',
    category: 'Executive SUV',
    capacityPassengers: 4,
    capacityLuggage: 4,
    description: '[Prestige 4x4 offering road stability and comfort for coastal travel; fleet details customizable].',
    descriptionDe: '[Allradfahrzeug für komfortable Küstenfahrten; Details anpassbar].',
    descriptionAr: '[سيارة دفع رباعي لتنقل مريح؛ التفاصيل قابلة للتعديل].',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    features: ['[Up to 4 Passengers - Editable]', '[4 Bags - Editable]', '[Four-Wheel Drive Comfort]', '[Tinted Glass]']
  },
  {
    id: 'luxury_coach',
    name: 'Executive Minibus / Coach [Capacity Customizable]',
    nameDe: 'Executive Minibus [Kapazität anpassbar]',
    nameAr: 'ميني باص سياحي [السعة قابلة للتخصيص]',
    category: 'VIP Minibus',
    capacityPassengers: 14,
    capacityLuggage: 15,
    description: '[Group touring coach with passenger seating and luggage space customizable by company dispatch].',
    descriptionDe: '[Gruppenbus mit Sitz- und Gepäckraum nach Vorgabe des Betreibers].',
    descriptionAr: '[حافلة للمجموعات الكبيرة بسعة ركاب وحقائب قابلة للتعديل].',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    features: ['[Up to 14 Passengers - Editable]', '[15 Luggage Pieces - Editable]', '[High-Capacity A/C]', '[Audio System]']
  }
];

export const INITIAL_TOURS: Tour[] = [
  {
    id: 'tour-luxor-day-trip',
    title: 'Private Luxor Cultural Day Trip [Editable Title]',
    titleDe: 'Private Kultur-Tagestour nach Luxor [Anpassbarer Titel]',
    titleAr: 'رحلة الأقصر الثقافية الخاصة [عنوان قابل للتعديل]',
    category: 'historical',
    destination: 'Luxor [Customizable]',
    duration: '[Full Day Schedule - Customizable by Operator]',
    pricePerPerson: null,
    priceMode: 'request',
    priceNotice: '[Price on Request / Editable Placeholder]',
    description: '[Customizable itinerary: Private excursion from Hurghada to Luxor. Monument visits, Nile crossing, lunch arrangements, and Egyptologist guide subject to client preferences and operator booking confirmation].',
    descriptionDe: '[Individuelles Programm: Privatausflug von Hurghada nach Luxor. Besichtigungen und Reiseleitung nach Absprache].',
    descriptionAr: '[برنامج قابل للتخصيص: رحلة خاصة من الغردقة إلى الأقصر. زيارة المعالم والمرشد حسب تفضيلات العميل وتأكيد الشركة].',
    highlights: [
      '[Valley of the Kings / Royal Tombs - Customizable]',
      '[Temple of Queen Hatshepsut - Customizable]',
      '[Karnak Temple Complex - Customizable]',
      '[Colossi of Memnon - Customizable]',
      '[Lunch Arrangement - Customizable by Operator]'
    ],
    included: [
      '[Private A/C Transport from Hurghada - Editable]',
      '[Licensed Egyptologist Guide - Language upon Request]',
      '[Monuments Entry Tickets - Subject to Itinerary]',
      '[Bottled Water - Subject to Operator]'
    ],
    excluded: [
      '[Optional Tomb Access Supplements - Discretionary]',
      '[Personal Souvenirs & Purchases]',
      '[Driver & Guide Gratuities - Discretionary]'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    active: true,
    displayOrder: 1
  },
  {
    id: 'tour-cairo-pyramids-museum',
    title: 'Private Cairo & Giza Day Excursion [Editable Title]',
    titleDe: 'Private Tagestour nach Kairo & Gizeh [Anpassbarer Titel]',
    titleAr: 'رحلة القاهرة والجيزة الخاصة [عنوان قابل للتعديل]',
    category: 'historical',
    destination: 'Cairo [Customizable]',
    duration: '[Full Day / Flight Option - Customizable by Operator]',
    pricePerPerson: null,
    priceMode: 'request',
    priceNotice: '[Price on Request / Editable Placeholder]',
    description: '[Customizable itinerary: Private visit to the Giza Plateau, the Great Sphinx, and the Egyptian Museum in Cairo. Transportation by road or domestic flight customizable by company operator].',
    descriptionDe: '[Individuelles Programm: Besuch der Pyramiden von Gizeh, der Sphinx und des Ägyptischen Museums. Ablauf nach Absprache].',
    descriptionAr: '[برنامج قابل للتخصيص: زيارة خاصة لأهرامات الجيزة وأبو الهول والمتحف المصري بالقاهرة حسب رغبة العميل].',
    highlights: [
      '[Giza Plateau & Great Pyramids - Customizable]',
      '[The Great Sphinx - Customizable]',
      '[Egyptian Museum Collections - Customizable]',
      '[Lunch Option - Subject to Confirmation]'
    ],
    included: [
      '[Private Vehicle Transport from Hurghada / El Gouna - Editable]',
      '[Licensed Guide Service - Editable]',
      '[Plateau & Museum Entrance Access - Subject to Booking]',
      '[Road Tolls and Permits - Editable]'
    ],
    excluded: [
      '[Great Pyramid Interior Entry - Optional]',
      '[Special Museum Galleries - Optional]',
      '[Gratuities - Discretionary]'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    active: true,
    displayOrder: 2
  },
  {
    id: 'tour-marsa-alam-dolphin-house',
    title: 'Marsa Alam Marine & Snorkeling Excursion [Editable Title]',
    titleDe: 'Marsa Alam Meeres- & Schnorchelausflug [Anpassbarer Titel]',
    titleAr: 'رحلة مرسى علم البحرية والسنوركلينج [عنوان قابل للتعديل]',
    category: 'marine',
    destination: 'Marsa Alam [Customizable]',
    duration: '[Full Day Schedule - Customizable by Operator]',
    pricePerPerson: null,
    priceNotice: '[Price on Request / Editable Placeholder]',
    description: '[Customizable itinerary: Private coastal transfer south to Marsa Alam marine areas for boat cruising and guided snorkeling. Wildlife sightings subject to nature].',
    descriptionDe: '[Individuelles Programm: Transfer nach Marsa Alam zu Schnorchelgebieten. Wildtierbeobachtung wetterabhängig].',
    descriptionAr: '[برنامج قابل للتخصيص: انتقال خاص إلى شواطئ ومحميات مرسى علم للسنوركلينج والرحلات البحرية].',
    highlights: [
      '[Coastal Marine Sanctuary Cruise - Customizable]',
      '[Guided Snorkeling Stops - Subject to Weather]',
      '[Marine Life Spotting - Nature Dependent]',
      '[Lunch Buffet Onboard - Customizable]'
    ],
    included: [
      '[Private Transfer to Departure Marina - Editable]',
      '[Boat Cruise & Snorkeling Gear - Subject to Operator]',
      '[Lunch & Soft Drinks Onboard - Editable]',
      '[National Park Conservation Permits - Subject to Regulation]'
    ],
    excluded: [
      '[Underwater Photography Services - Optional]',
      '[Personal Expenses]'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    active: true,
    priceMode: 'request',
    displayOrder: 3
  },
  {
    id: 'tour-redsea-desert-safari',
    title: 'Red Sea Desert Safari & Bedouin Experience [Editable Title]',
    titleDe: 'Wüstensafari am Roten Meer [Anpassbarer Titel]',
    titleAr: 'سفاري صحراء البحر الأحمر والعشاء البدوي [عنوان قابل للتعديل]',
    category: 'safari',
    destination: 'Hurghada Desert [Customizable]',
    duration: '[Afternoon & Evening - Customizable by Operator]',
    pricePerPerson: null,
    priceMode: 'request',
    priceNotice: '[Price on Request / Editable Placeholder]',
    description: '[Customizable itinerary: Guided desert expedition in the Red Sea mountains. Quad bike driving, buggy riding, and Bedouin dinner subject to safety briefing and operator schedule].',
    descriptionDe: '[Individuelles Programm: Geführte Wüstentour mit Quad und Beduinen-Abendessen nach Absprache].',
    descriptionAr: '[برنامج قابل للتخصيص: جولة صحراوية بين جبال البحر الأحمر وركوب الدراجات الرباعية وعشاء بدوي].',
    highlights: [
      '[Guided Quad Trail - Customizable]',
      '[Desert Buggy Ride - Subject to Availability]',
      '[Traditional Bedouin Tea & Hospitality - Customizable]',
      '[Open-Air Dinner - Subject to Operator Package]'
    ],
    included: [
      '[Hotel Pickup and Drop-off - Editable]',
      '[Quad Bike & Safety Helmet - Subject to Safety Protocol]',
      '[Desert Experience & Hospitality - Editable]',
      '[Dinner and Non-Alcoholic Beverages - Editable]'
    ],
    excluded: [
      '[Dust Scarf & Safety Goggles - Available Onsite]',
      '[Discretionary Tips]'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    active: true,
    displayOrder: 4
  },
  {
    id: 'tour-giftun-orange-bay',
    title: 'Giftun Island & Marine Waters Yacht Excursion [Editable Title]',
    titleDe: 'Giftun Insel & Rotes Meer Bootsausflug [Anpassbarer Titel]',
    titleAr: 'رحلة جزيرة الجفتون البحرية باليخت [عنوان قابل للتعديل]',
    category: 'marine',
    destination: 'Hurghada Islands [Customizable]',
    duration: '[Day Cruise - Customizable by Operator]',
    pricePerPerson: null,
    priceMode: 'request',
    priceNotice: '[Price on Request / Editable Placeholder]',
    description: '[Customizable itinerary: Yacht cruise to Giftun Island / Orange Bay marine locations. Snorkeling stops and island stay subject to maritime authority permits and weather conditions].',
    descriptionDe: '[Individuelles Programm: Bootsfahrt zur Giftun-Insel. Ablauf wetter- und behördenabhängig].',
    descriptionAr: '[برنامج قابل للتخصيص: إبحار باليخت إلى جزيرة الجفتون وشواطئها حسب تصاريح الملاحة وحالة الطقس].',
    highlights: [
      '[Giftun Island Sandy Beach Access - Customizable]',
      '[Open Water Snorkeling Stops - Weather Dependent]',
      '[Fresh Lunch Buffet Onboard - Editable]',
      '[Relaxed Sea Cruise - Customizable Schedule]'
    ],
    included: [
      '[Transfer to Hurghada Marina - Editable]',
      '[Boat Ticket & Snorkeling Equipment - Editable]',
      '[Lunch & Refreshments Onboard - Editable]',
      '[Island Conservation Entry Fees - Subject to Regulation]'
    ],
    excluded: [
      '[Private Beach Cabana Rentals - Optional]',
      '[Personal Expenses]'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    active: true,
    displayOrder: 5
  },
  {
    id: 'tour-elgouna-city-lagoon',
    title: 'El Gouna Resort Discovery & Lagoon Tour [Editable Title]',
    titleDe: 'El Gouna Entdeckungstour [Anpassbarer Titel]',
    titleAr: 'جولة منتجع الجونة واستكشاف البحيرات [عنوان قابل للتعديل]',
    category: 'daytrip',
    destination: 'El Gouna [Customizable]',
    duration: '[Half Day - Customizable by Operator]',
    pricePerPerson: null,
    priceMode: 'request',
    priceNotice: '[Price on Request / Editable Placeholder]',
    description: '[Customizable itinerary: Private chauffeured tour of El Gouna resort town, including the Abu Tig Marina, Tamr Henna square, and lagoon boat cruise option].',
    descriptionDe: '[Individuelles Programm: Private Tour nach El Gouna mit Marina und Lagunenfahrt nach Absprache].',
    descriptionAr: '[برنامج قابل للتخصيص: جولة خاصة في منتجع الجونة ومارينا اليخوت والبحيرات حسب الرغبة].',
    highlights: [
      '[Abu Tig Marina Promenade - Customizable]',
      '[Lagoon Motorboat Cruise Option - Customizable]',
      '[Downtown Tamr Henna - Customizable]',
      '[Flexible Private Chauffeur Schedule]'
    ],
    included: [
      '[Private Roundtrip Transfer from Hurghada - Editable]',
      '[Lagoon Boat Ticket Option - Subject to Booking]',
      '[Chilled Refreshments Onboard - Editable]'
    ],
    excluded: [
      '[Café and Restaurant Orders]',
      '[Personal Souvenirs]'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    active: true,
    displayOrder: 6
  }
];

export const POPULAR_LOCATIONS = [
  'Hurghada International Airport (HRG) Terminal 1',
  'Hurghada International Airport (HRG) Terminal 2',
  'Hurghada City Hotels & Promenade (Mamsha)',
  'El Gouna (All Hotels, Villas & Marina)',
  'Makadi Bay Resorts',
  'Sahl Hasheesh Bay & Old Town',
  'Soma Bay & Safaga Port',
  'El Quseir Heritage Hotels',
  'Port Ghalib & Marsa Alam Airport (RMF)',
  'Marsa Alam Southern Resorts',
  'Luxor (Nile Cruise / Hotels)',
  'Cairo / Giza (Hotels / Airport)'
];

export const GALLERY_ITEMS = [
  {
    id: 'g1',
    category: 'fleet',
    title: 'Executive Chauffeur Vehicle [Representative Photo]',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g2',
    category: 'luxor',
    title: 'Karnak Temple Hypostyle Columns, Luxor',
    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g3',
    category: 'cairo',
    title: 'The Great Sphinx & Pyramids of Giza, Cairo',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g4',
    category: 'marine',
    title: 'Giftun Island & Red Sea Marine Waters',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g5',
    category: 'marine',
    title: 'Marine Life in the Red Sea',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g6',
    category: 'safari',
    title: 'Desert Dunes & Mountains, Red Sea',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g7',
    category: 'fleet',
    title: 'VIP Minivan Passenger Interior [Representative Photo]',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g8',
    category: 'luxor',
    title: 'Valley of the Kings Vista, Luxor',
    imageUrl: 'https://images.unsplash.com/photo-1566192091743-5966a6079984?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'g9',
    category: 'daytrip',
    title: 'El Gouna Abu Tig Marina, Red Sea',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80'
  }
];
