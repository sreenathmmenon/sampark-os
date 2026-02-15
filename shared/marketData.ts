// ═══════════════════════════════════════════════════════════
// SAMPARK-OS: Shared Market Data (Server & Client)
// Location: shared/marketData.ts
// ═══════════════════════════════════════════════════════════

// Plain TypeScript types (no React dependencies)
export interface FishSpecies {
  id: string;
  english: string;
  malayalam: string;
  tamil: string;
  kannada: string;
  hindi: string;
  bengali: string;
  konkani: string;
  category: "premium" | "bulk" | "export-grade" | "standard";
  retailPrice: number;
  wholesalePrice: number;
  farmgatePrice: number;
  samparkTarget: number;
  perishabilityHours: number;
  coldStorageCostPerDay: number;
}

export interface Harbor {
  id: string;
  name: string;
  localName: string;
  location: string;
  lat: number;
  lng: number;
  distanceFromKadamakudy_km: number;
  fuelCostOneWay: number;
  transitTime_min: number;
  congestionLevel: "low" | "medium" | "high";
  coldStorageAvailable: boolean;
  coldStorageFee: number;
  buyerDensity: "low" | "medium" | "high" | "very_high";
  speciality: string;
}

export interface Buyer {
  id: string;
  name: string;
  localName: string;
  channel: "whatsapp" | "telegram";
  type: string;
  aggressiveness: number;
  typicalBidRange: [number, number];
  avatar: string;
  location: string;
  specialty: string;
}

// ─── FISH SPECIES (Real Kerala prices, Feb 15 2026) ─────────
export const FISH_SPECIES: Record<string, FishSpecies> = {
  karimeen: {
    id: "karimeen",
    english: "Pearl Spot",
    malayalam: "കരിമീൻ",
    tamil: "கருவாலி",
    kannada: "ಕರಿಮೀನ್",
    hindi: "करीमीन",
    bengali: "করিমীন",
    konkani: "कळंजी",
    category: "premium",
    retailPrice: 600,
    wholesalePrice: 380,
    farmgatePrice: 220,
    samparkTarget: 340,
    perishabilityHours: 8,
    coldStorageCostPerDay: 500,
  },
  sardine: {
    id: "sardine",
    english: "Sardine",
    malayalam: "മത്തി",
    tamil: "மத்தி மீன்",
    kannada: "ಭೂತಾಯಿ",
    hindi: "तारली",
    bengali: "সার্ডিন",
    konkani: "तारली",
    category: "bulk",
    retailPrice: 200,
    wholesalePrice: 120,
    farmgatePrice: 60,
    samparkTarget: 95,
    perishabilityHours: 4,
    coldStorageCostPerDay: 500,
  },
  prawns: {
    id: "prawns",
    english: "Tiger Prawns",
    malayalam: "ചെമ്മീൻ",
    tamil: "இறால்",
    kannada: "ಸೀಗಡಿ",
    hindi: "झींगा",
    bengali: "চিংড়ি",
    konkani: "सुंगट",
    category: "premium",
    retailPrice: 500,
    wholesalePrice: 320,
    farmgatePrice: 180,
    samparkTarget: 280,
    perishabilityHours: 6,
    coldStorageCostPerDay: 600,
  },
  kingMackerel: {
    id: "kingMackerel",
    english: "King Mackerel / Seer Fish",
    malayalam: "നെയ്‌മീൻ",
    tamil: "வஞ்சிரம்",
    kannada: "ಅಂಜಲ್",
    hindi: "सुरमई",
    bengali: "সুরমাই",
    konkani: "विसवण",
    category: "premium",
    retailPrice: 700,
    wholesalePrice: 450,
    farmgatePrice: 280,
    samparkTarget: 400,
    perishabilityHours: 10,
    coldStorageCostPerDay: 500,
  },
  pomfret: {
    id: "pomfret",
    english: "Silver Pomfret",
    malayalam: "ആവോലി",
    tamil: "வாவல் மீன்",
    kannada: "ಮಾಂಜಿ",
    hindi: "पापलेट",
    bengali: "পমফ্রেট",
    konkani: "सरंगा",
    category: "premium",
    retailPrice: 600,
    wholesalePrice: 400,
    farmgatePrice: 250,
    samparkTarget: 360,
    perishabilityHours: 10,
    coldStorageCostPerDay: 500,
  },
  redSnapper: {
    id: "redSnapper",
    english: "Red Snapper",
    malayalam: "ചെമ്പല്ലി",
    tamil: "சங்கரா மீன்",
    kannada: "ಕೆಂಪು ಮೀನು",
    hindi: "लाल मछली",
    bengali: "লাল মাছ",
    konkani: "तांबोसो",
    category: "standard",
    retailPrice: 350,
    wholesalePrice: 200,
    farmgatePrice: 110,
    samparkTarget: 175,
    perishabilityHours: 8,
    coldStorageCostPerDay: 500,
  },
  mackerel: {
    id: "mackerel",
    english: "Indian Mackerel",
    malayalam: "അയല",
    tamil: "அயிலை மீன்",
    kannada: "ಬಂಗಡೆ",
    hindi: "बांगड़ा",
    bengali: "ম্যাকেরেল",
    konkani: "बांगडो",
    category: "bulk",
    retailPrice: 300,
    wholesalePrice: 160,
    farmgatePrice: 80,
    samparkTarget: 130,
    perishabilityHours: 4,
    coldStorageCostPerDay: 500,
  },
  tuna: {
    id: "tuna",
    english: "Yellowfin Tuna",
    malayalam: "ചൂര",
    tamil: "சூரை மீன்",
    kannada: "ಗೆದ್ದೆ",
    hindi: "टूना",
    bengali: "টুনা",
    konkani: "गेदार",
    category: "export-grade",
    retailPrice: 500,
    wholesalePrice: 350,
    farmgatePrice: 200,
    samparkTarget: 310,
    perishabilityHours: 12,
    coldStorageCostPerDay: 700,
  },
};

// ─── HARBORS (Real GPS, real distances from Kadamakudy) ─────
export const HARBORS: Harbor[] = [
  {
    id: "kochi_harbor",
    name: "Kochi Fishing Harbor",
    localName: "കൊച്ചി ഫിഷിംഗ് ഹാർബർ",
    location: "Thoppumpady, Kochi",
    lat: 9.9312,
    lng: 76.2673,
    distanceFromKadamakudy_km: 12,
    fuelCostOneWay: 780,
    transitTime_min: 45,
    congestionLevel: "high",
    coldStorageAvailable: true,
    coldStorageFee: 500,
    buyerDensity: "very_high",
    speciality: "Export-grade buyers, premium wholesale",
  },
  {
    id: "vypin",
    name: "Vypin Harbor",
    localName: "വൈപ്പിൻ ഹാർബർ",
    location: "Vypin Island, Kochi",
    lat: 9.9853,
    lng: 76.229,
    distanceFromKadamakudy_km: 8,
    fuelCostOneWay: 520,
    transitTime_min: 30,
    congestionLevel: "low",
    coldStorageAvailable: false,
    coldStorageFee: 0,
    buyerDensity: "medium",
    speciality: "Local retail, restaurants",
  },
  {
    id: "fort_kochi",
    name: "Fort Kochi Landing",
    localName: "ഫോർട്ട് കൊച്ചി",
    location: "Fort Kochi",
    lat: 9.9658,
    lng: 76.2424,
    distanceFromKadamakudy_km: 10,
    fuelCostOneWay: 650,
    transitTime_min: 35,
    congestionLevel: "medium",
    coldStorageAvailable: false,
    coldStorageFee: 0,
    buyerDensity: "medium",
    speciality: "Tourist restaurants, premium hotels",
  },
  {
    id: "munambam",
    name: "Munambam Harbor",
    localName: "മുനമ്പം ഹാർബർ",
    location: "Munambam, Ernakulam",
    lat: 10.178,
    lng: 76.1714,
    distanceFromKadamakudy_km: 28,
    fuelCostOneWay: 1820,
    transitTime_min: 90,
    congestionLevel: "medium",
    coldStorageAvailable: true,
    coldStorageFee: 400,
    buyerDensity: "high",
    speciality: "Bulk sardine/mackerel buyers",
  },
  {
    id: "chellanam",
    name: "Chellanam Harbor",
    localName: "ചെല്ലാനം ഹാർബർ",
    location: "Chellanam, Ernakulam",
    lat: 9.851,
    lng: 76.266,
    distanceFromKadamakudy_km: 15,
    fuelCostOneWay: 975,
    transitTime_min: 55,
    congestionLevel: "low",
    coldStorageAvailable: true,
    coldStorageFee: 350,
    buyerDensity: "low",
    speciality: "Prawns specialist market",
  },
];

// ─── BUYERS (Realistic Kerala wholesale names) ──────────────
export const BUYERS: Buyer[] = [
  {
    id: "KFE",
    name: "Kochi Fresh Exports",
    localName: "കൊച്ചി ഫ്രഷ് എക്സ്‌പോർട്ട്സ്",
    channel: "whatsapp",
    type: "export",
    aggressiveness: 0.8,
    typicalBidRange: [0.85, 0.95],
    avatar: "🏢",
    location: "Thoppumpady, Kochi",
    specialty: "Export to Gulf countries",
  },
  {
    id: "MWS",
    name: "Marina Wholesale Seafood",
    localName: "മറീന വോൾസെയിൽ സീഫുഡ്",
    channel: "whatsapp",
    type: "wholesale",
    aggressiveness: 0.6,
    typicalBidRange: [0.9, 1.05],
    avatar: "🐟",
    location: "Mattancherry, Kochi",
    specialty: "Premium hotel supply chain",
  },
  {
    id: "PKF",
    name: "Paravur Kadal Foods",
    localName: "പരവൂർ കടൽ ഫുഡ്സ്",
    channel: "whatsapp",
    type: "processor",
    aggressiveness: 0.7,
    typicalBidRange: [0.8, 0.92],
    avatar: "🏭",
    location: "Paravur",
    specialty: "Fish processing & packaging",
  },
  {
    id: "HKC",
    name: "Hotel Kerala Cafe Chain",
    localName: "ഹോട്ടൽ കേരള കഫേ ചെയിൻ",
    channel: "telegram",
    type: "hospitality",
    aggressiveness: 0.4,
    typicalBidRange: [0.7, 0.85],
    avatar: "🍛",
    location: "Ernakulam",
    specialty: "Restaurant chain, daily supply",
  },
  {
    id: "SCM",
    name: "Saravana Canteen & Mess",
    localName: "ശരവണ കാന്റീൻ & മെസ്",
    channel: "telegram",
    type: "canteen",
    aggressiveness: 0.3,
    typicalBidRange: [0.6, 0.75],
    avatar: "🍽️",
    location: "Kalamassery",
    specialty: "Bulk hostel/canteen supply",
  },
  {
    id: "VFS",
    name: "Vypeen Fresh Stall",
    localName: "വൈപ്പിൻ ഫ്രഷ് സ്റ്റാൾ",
    channel: "telegram",
    type: "retail",
    aggressiveness: 0.5,
    typicalBidRange: [0.75, 0.88],
    avatar: "🛒",
    location: "Vypin Island",
    specialty: "Local retail, walk-in customers",
  },
  {
    id: "GGE",
    name: "Gulf Gate Exports Pvt Ltd",
    localName: "ഗൾഫ് ഗേറ്റ് എക്സ്‌പോർട്ട്സ്",
    channel: "whatsapp",
    type: "export",
    aggressiveness: 0.9,
    typicalBidRange: [0.95, 1.1],
    avatar: "✈️",
    location: "Willingdon Island, Kochi",
    specialty: "Air-freight to Dubai & Saudi",
  },
];

// ─── FUEL CONSTANTS (Kerala, Feb 2026) ──────────────────────
export const FUEL = {
  dieselPricePerLitre: 95.0,
  marineDieselPricePerLitre: 92.0,
  avgBoatConsumption_LperKm: 0.65,
  avgBoatSpeed_kmph: 18,
};

// ─── UTILITY FUNCTIONS ──────────────────────────────────────
export function calculateFuelCost(distance_km: number): number {
  const litersNeeded = distance_km * FUEL.avgBoatConsumption_LperKm;
  return Math.round(litersNeeded * FUEL.marineDieselPricePerLitre);
}

export function calculateNetMargin(
  bidPerKg: number,
  weightKg: number,
  fuelCost: number,
  coldStorageFee: number = 500,
) {
  const gross = bidPerKg * weightKg;
  const net = gross - fuelCost - coldStorageFee;
  return { gross, fuelCost, riskBuffer: coldStorageFee, net };
}

// Helper to get fish by species name (case-insensitive)
export function findFishByName(speciesName: string): FishSpecies | null {
  const normalized = speciesName.toLowerCase().trim();

  for (const fish of Object.values(FISH_SPECIES)) {
    if (
      fish.english.toLowerCase().includes(normalized) ||
      fish.malayalam === speciesName ||
      fish.id === normalized
    ) {
      return fish;
    }
  }

  return null;
}
