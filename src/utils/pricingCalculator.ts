/**
 * PEGASUS Excursion Reference & Pricing Estimation Helper
 * Configurable by PEGASUS Admin in the Admin Dashboard.
 */

export interface ExcursionBenchmarkPrice {
  id: string;
  tour: string;
  tourAr: string;
  adultPriceEur: number;
  childPriceEur: number;
  durationText: string;
  destination: string;
  category: 'marine' | 'cultural' | 'safari' | 'city';
}

export const EXCURSION_BENCHMARK_PRICES: ExcursionBenchmarkPrice[] = [
  {
    id: 'kairo',
    tour: 'Cairo - Pyramids of Giza & Egyptian Museum',
    tourAr: 'القاهرة والجيزة والأهرامات والمتحف',
    adultPriceEur: 220,
    childPriceEur: 110,
    durationText: 'Full Day (~18h)',
    destination: 'Cairo & Giza',
    category: 'cultural',
  },
  {
    id: 'luxor',
    tour: 'Luxor - Valley of the Kings & Karnak Temple',
    tourAr: 'الأقصر ومعابد الكرنك ووادي الملوك',
    adultPriceEur: 185,
    childPriceEur: 90,
    durationText: 'Full Day (~16h)',
    destination: 'Luxor',
    category: 'cultural',
  },
  {
    id: 'orangebay',
    tour: 'Orange Bay & Giftun Island Boat Trip',
    tourAr: 'جزيرة أورانج باي (الجفتون)',
    adultPriceEur: 70,
    childPriceEur: 35,
    durationText: 'Full Day (~8:30 - 16:30)',
    destination: 'Orange Bay / Giftun Island',
    category: 'marine',
  },
  {
    id: 'marsaalam',
    tour: 'Marsa Alam - Abu Dabbab Sea Turtle Bay',
    tourAr: 'مرسى علم وخليج السلاحف أبو دباب',
    adultPriceEur: 99,
    childPriceEur: 49,
    durationText: 'Full Day (~12h)',
    destination: 'Marsa Alam',
    category: 'marine',
  },
  {
    id: 'delfintour',
    tour: 'Dolphin House Reef Excursion',
    tourAr: 'رحلة الدلافين والسباحة في الشعاب',
    adultPriceEur: 85,
    childPriceEur: 40,
    durationText: 'Full Day',
    destination: 'Red Sea Marine Park',
    category: 'marine',
  },
  {
    id: 'coralgarden',
    tour: 'Coral Garden Snorkeling Trip',
    tourAr: 'كورال جاردن والحدائق المرجانية',
    adultPriceEur: 75,
    childPriceEur: 40,
    durationText: 'Full Day',
    destination: 'Coral Garden Reefs',
    category: 'marine',
  },
  {
    id: 'elgouna',
    tour: 'El Gouna Lagoon City & Marina',
    tourAr: 'الجونة وجولة القنوات المائية',
    adultPriceEur: 60,
    childPriceEur: 35,
    durationText: 'Half Day / Full Day',
    destination: 'El Gouna',
    category: 'city',
  },
  {
    id: 'quadtour',
    tour: 'Safari Quad & Spider Adventure',
    tourAr: 'سفاري صحراء الدبابات والبيتش باجي',
    adultPriceEur: 45,
    childPriceEur: 25,
    durationText: '3 - 4 Hours',
    destination: 'Hurghada Desert',
    category: 'safari',
  },
  {
    id: 'citytour',
    tour: 'Hurghada City Tour',
    tourAr: 'جولة استكشاف مدينة الغردقة والبلد',
    adultPriceEur: 40,
    childPriceEur: 20,
    durationText: 'ca. 3 Hours',
    destination: 'Hurghada City & Marina',
    category: 'city',
  },
];

export const BENCHMARK_ROUTES = EXCURSION_BENCHMARK_PRICES.map((item) => ({
  destination: item.tour,
  destinationAr: item.tourAr,
  officialPriceEur: item.adultPriceEur,
  durationText: item.durationText,
}));

/**
 * Calculates suggested trip quote, operational vehicle cost, and margin
 * mapped to PEGASUS internal excursion reference ranges.
 */
export function calculateSuggestedTripPrice(distanceKmOrDestination: number | string): {
  distanceKm: number;
  suggestedPriceEur: number;
  internalCostEur: number;
  marginEur: number;
  tourName?: string;
} {
  if (typeof distanceKmOrDestination === 'string') {
    const term = distanceKmOrDestination.toLowerCase();
    const matched = EXCURSION_BENCHMARK_PRICES.find(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.tour.toLowerCase().includes(term) ||
        p.tourAr.includes(term) ||
        p.destination.toLowerCase().includes(term)
    );
    if (matched) {
      const price = matched.adultPriceEur;
      const internalCost = Math.round((price * 0.65) / 5) * 5;
      return {
        distanceKm: 0,
        suggestedPriceEur: price,
        internalCostEur: internalCost,
        marginEur: price - internalCost,
        tourName: matched.tour,
      };
    }
  }

  const km = typeof distanceKmOrDestination === 'number' ? distanceKmOrDestination : 60;

  let price = 70;
  if (km > 400) {
    price = 220;
  } else if (km > 300) {
    price = 185;
  } else if (km > 200) {
    price = 99;
  } else if (km > 80) {
    price = 85;
  } else if (km > 40) {
    price = 60;
  } else {
    price = 40;
  }

  const internalCostEur = Math.round((price * 0.65) / 5) * 5;
  return {
    distanceKm: km,
    suggestedPriceEur: price,
    internalCostEur,
    marginEur: price - internalCostEur,
  };
}
