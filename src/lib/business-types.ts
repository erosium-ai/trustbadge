// 🔑 Keywords: business types lock, schema.org type mapping, header texture families, v1.1 industry list
// The LOCKED 34-type industry list (Ike approved 2026-07-10 09:16 GMT+7).
// Single source of truth for: (1) schema.org @type, (2) header texture family,
// (3) builder dropdown labels. Mirrored in schema-page/src/lib/business-types.ts
// — keep both copies in sync.

export interface BusinessTypeDef {
  value: string; // stored in pages.metadata.business_type
  label: string; // dropdown label
  schemaType: string; // schema.org @type (real types only)
  texture: TextureKey; // header texture family
}

export type TextureKey =
  | "copper-water"
  | "circuit"
  | "blueprint"
  | "brushstroke"
  | "roofline"
  | "leaf"
  | "toolbox"
  | "keycut"
  | "ripple"
  | "hexshield"
  | "airflow"
  | "gear"
  | "gloss"
  | "streaks"
  | "softshapes"
  | "route"
  | "linefade"
  | "motion"
  | "aperture"
  | "notebook"
  | "woodgrain"
  | "steel"
  | "storefront"
  | "steam"
  | "fenceline"
  | "trowel"
  | "brick"
  | "glasspane"
  | "tilegrid"
  | "none";

export const BUSINESS_TYPES: BusinessTypeDef[] = [
  { value: "plumber", label: "Plumber", schemaType: "Plumber", texture: "copper-water" },
  { value: "electrician", label: "Electrician", schemaType: "Electrician", texture: "circuit" },
  { value: "builder_carpenter", label: "Builder / Carpenter", schemaType: "GeneralContractor", texture: "blueprint" },
  { value: "painter", label: "Painter", schemaType: "HousePainter", texture: "brushstroke" },
  { value: "roofer", label: "Roofer", schemaType: "RoofingContractor", texture: "roofline" },
  { value: "landscaper", label: "Landscaper / Gardener", schemaType: "Landscaping", texture: "leaf" },
  { value: "concreter_paver", label: "Concreter / Paver", schemaType: "GeneralContractor", texture: "blueprint" },
  { value: "handyman", label: "Handyman", schemaType: "HomeAndConstructionBusiness", texture: "toolbox" },
  { value: "locksmith", label: "Locksmith", schemaType: "Locksmith", texture: "keycut" },
  { value: "pool_care", label: "Pool care", schemaType: "HomeAndConstructionBusiness", texture: "ripple" },
  { value: "pest_control", label: "Pest control", schemaType: "PestControl", texture: "hexshield" },
  { value: "aircon_refrigeration", label: "Air con / Refrigeration", schemaType: "HVACBusiness", texture: "airflow" },
  { value: "mechanic", label: "Mechanic / Auto repairs", schemaType: "AutoRepair", texture: "gear" },
  { value: "detailing_carwash", label: "Mobile detailing / Car wash", schemaType: "AutoWash", texture: "gloss" },
  { value: "cleaner", label: "Cleaner (home / commercial)", schemaType: "HousekeepingService", texture: "streaks" },
  { value: "babysitter_childcare", label: "Babysitter / Childcare", schemaType: "ChildCare", texture: "softshapes" },
  { value: "removalist", label: "Removalist", schemaType: "MovingCompany", texture: "route" },
  { value: "pet_care", label: "Dog groomer / Pet care", schemaType: "LocalBusiness", texture: "softshapes" },
  { value: "hairdresser_barber", label: "Hairdresser / Barber", schemaType: "HairSalon", texture: "linefade" },
  { value: "beauty_nails", label: "Beauty / Nails", schemaType: "BeautySalon", texture: "linefade" },
  { value: "fitness_pt", label: "Personal trainer / Fitness", schemaType: "ExerciseGym", texture: "motion" },
  { value: "photographer", label: "Photographer", schemaType: "LocalBusiness", texture: "aperture" },
  { value: "tutor", label: "Tutor / Lessons", schemaType: "LocalBusiness", texture: "notebook" },
  { value: "cabinet_maker", label: "Cabinet maker", schemaType: "HomeAndConstructionBusiness", texture: "woodgrain" },
  { value: "welder_metalworker", label: "Welder / Metal worker", schemaType: "HomeAndConstructionBusiness", texture: "steel" },
  { value: "retail", label: "Retail / Shop", schemaType: "Store", texture: "storefront" },
  { value: "hospitality", label: "Hospitality (café / restaurant / bar)", schemaType: "FoodEstablishment", texture: "steam" },
  { value: "fencer", label: "Fencer", schemaType: "HomeAndConstructionBusiness", texture: "fenceline" },
  { value: "renderer", label: "Renderer", schemaType: "HomeAndConstructionBusiness", texture: "trowel" },
  { value: "bricklayer", label: "Bricklayer", schemaType: "HomeAndConstructionBusiness", texture: "brick" },
  { value: "plasterer", label: "Plasterer", schemaType: "HomeAndConstructionBusiness", texture: "trowel" },
  { value: "glass_repairs", label: "Glass repairs / installs", schemaType: "HomeAndConstructionBusiness", texture: "glasspane" },
  { value: "tiler", label: "Tiler", schemaType: "HomeAndConstructionBusiness", texture: "tilegrid" },
  { value: "other", label: "Other / Something else", schemaType: "LocalBusiness", texture: "none" },
];

const BY_VALUE = new Map(BUSINESS_TYPES.map((t) => [t.value, t]));

export function getBusinessType(value: unknown): BusinessTypeDef | null {
  if (typeof value !== "string") return null;
  return BY_VALUE.get(value.trim().toLowerCase()) ?? null;
}

/**
 * schema.org @type for a profile. Returns an array with the specific type
 * FIRST plus LocalBusiness as fallback so consumers that only understand
 * LocalBusiness still parse the entity. Plain LocalBusiness types return the
 * single string (no point in a duplicate array).
 */
export function schemaTypeFor(value: unknown): string | string[] {
  const def = getBusinessType(value);
  if (!def || def.schemaType === "LocalBusiness") return "LocalBusiness";
  return [def.schemaType, "LocalBusiness"];
}

// ---------------------------------------------------------------------------
// Header textures — subtle inline-SVG patterns rendered UNDER the ink
// gradient at low opacity. Abstract only; never photos. Each returns a CSS
// background-image data URI. Stroke colour is a light slate so it whispers
// through the ink overlay.
// ---------------------------------------------------------------------------

function svgUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const TEXTURES: Record<TextureKey, string | null> = {
  "copper-water": svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'><path d='M0 20 Q15 8 30 20 T60 20 T90 20 T120 20' fill='none' stroke='#cbd5e1' stroke-width='1.5'/><path d='M0 32 Q15 22 30 32 T60 32 T90 32 T120 32' fill='none' stroke='#cbd5e1' stroke-width='1'/></svg>`
  ),
  circuit: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><path d='M10 10h30v20h30M10 50h20v20h40' fill='none' stroke='#cbd5e1' stroke-width='1.5'/><circle cx='10' cy='10' r='2.5' fill='#cbd5e1'/><circle cx='70' cy='30' r='2.5' fill='#cbd5e1'/><circle cx='70' cy='70' r='2.5' fill='#cbd5e1'/></svg>`
  ),
  blueprint: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M0 0h60v60H0z' fill='none' stroke='#cbd5e1' stroke-width='0.75'/><path d='M30 0v60M0 30h60' stroke='#cbd5e1' stroke-width='0.5'/></svg>`
  ),
  brushstroke: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='50'><path d='M0 25 C30 10 60 40 90 22 C110 12 125 30 140 25' fill='none' stroke='#cbd5e1' stroke-width='6' stroke-linecap='round' opacity='0.7'/></svg>`
  ),
  roofline: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M0 40 L25 15 L50 40 L75 15 L100 40' fill='none' stroke='#cbd5e1' stroke-width='1.5'/></svg>`
  ),
  leaf: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><path d='M20 70 Q20 40 45 35 Q45 60 20 70Z' fill='none' stroke='#cbd5e1' stroke-width='1.25'/><path d='M60 40 Q60 15 82 12 Q82 33 60 40Z' fill='none' stroke='#cbd5e1' stroke-width='1.25'/></svg>`
  ),
  toolbox: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><path d='M15 25 l14 14 m-4-18 a8 8 0 1 0 8 8' fill='none' stroke='#cbd5e1' stroke-width='1.5'/><path d='M55 60 h24 m-12-12 v24' stroke='#cbd5e1' stroke-width='1.5'/></svg>`
  ),
  keycut: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'><path d='M0 20 h20 v-6 h8 v6 h10 v-9 h8 v9 h14 v-5 h8 v5 h20 v-8 h8 v8 h24' fill='none' stroke='#cbd5e1' stroke-width='1.5'/></svg>`
  ),
  ripple: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='12' fill='none' stroke='#cbd5e1' stroke-width='1'/><circle cx='50' cy='50' r='26' fill='none' stroke='#cbd5e1' stroke-width='0.75'/><circle cx='50' cy='50' r='42' fill='none' stroke='#cbd5e1' stroke-width='0.5'/></svg>`
  ),
  hexshield: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='80'><path d='M35 8 L62 24 V56 L35 72 L8 56 V24 Z' fill='none' stroke='#cbd5e1' stroke-width='1.25'/></svg>`
  ),
  airflow: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='130' height='60'><path d='M5 15 h70 a10 10 0 1 1-8 16 M5 35 h95 a8 8 0 1 0-6-13 M5 50 h55' fill='none' stroke='#cbd5e1' stroke-width='1.5' stroke-linecap='round'/></svg>`
  ),
  gear: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><circle cx='45' cy='45' r='16' fill='none' stroke='#cbd5e1' stroke-width='1.5'/><circle cx='45' cy='45' r='6' fill='none' stroke='#cbd5e1' stroke-width='1.25'/><path d='M45 24v-8M45 74v-8M66 45h8M16 45h8M60 30l6-6M24 66l6-6M60 60l6 6M24 24l6 6' stroke='#cbd5e1' stroke-width='1.5'/></svg>`
  ),
  gloss: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='70'><path d='M10 60 L60 10 M40 65 L95 12 M75 68 L130 15' stroke='#cbd5e1' stroke-width='2' stroke-linecap='round' opacity='0.8'/></svg>`
  ),
  streaks: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='60'><path d='M0 15 h90 M20 30 h110 M0 45 h70' stroke='#cbd5e1' stroke-width='1.5' stroke-linecap='round'/></svg>`
  ),
  softshapes: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><circle cx='30' cy='35' r='18' fill='none' stroke='#cbd5e1' stroke-width='1'/><circle cx='85' cy='75' r='24' fill='none' stroke='#cbd5e1' stroke-width='0.75'/><circle cx='95' cy='25' r='9' fill='none' stroke='#cbd5e1' stroke-width='1'/></svg>`
  ),
  route: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='130' height='80'><path d='M10 65 Q40 60 50 40 T95 20 H120' fill='none' stroke='#cbd5e1' stroke-width='1.5' stroke-dasharray='6 5'/><rect x='6' y='58' width='12' height='12' fill='none' stroke='#cbd5e1' stroke-width='1.25'/><circle cx='120' cy='20' r='4' fill='none' stroke='#cbd5e1' stroke-width='1.25'/></svg>`
  ),
  linefade: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60'><path d='M10 12 h100 M10 26 h76 M10 40 h52 M10 54 h28' stroke='#cbd5e1' stroke-width='1.5' stroke-linecap='round'/></svg>`
  ),
  motion: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='60'><path d='M10 45 Q45 10 75 30 T135 18' fill='none' stroke='#cbd5e1' stroke-width='2' stroke-linecap='round'/><path d='M10 55 Q50 28 85 42 T135 34' fill='none' stroke='#cbd5e1' stroke-width='1' stroke-linecap='round'/></svg>`
  ),
  aperture: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='110' height='110'><circle cx='55' cy='55' r='34' fill='none' stroke='#cbd5e1' stroke-width='1.25'/><path d='M55 21 L70 55 L55 89 M21 55 L55 45 L89 55' fill='none' stroke='#cbd5e1' stroke-width='0.9'/></svg>`
  ),
  notebook: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='36'><path d='M0 12 h100 M0 28 h100' stroke='#cbd5e1' stroke-width='0.75'/><path d='M14 0 v36' stroke='#cbd5e1' stroke-width='0.75' stroke-dasharray='2 3'/></svg>`
  ),
  woodgrain: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='60'><path d='M0 12 Q60 6 150 14 M0 28 Q70 20 150 30 M0 45 Q55 40 150 46' fill='none' stroke='#cbd5e1' stroke-width='1'/><ellipse cx='60' cy='28' rx='14' ry='5' fill='none' stroke='#cbd5e1' stroke-width='0.75'/></svg>`
  ),
  steel: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60'><path d='M0 8 h120 M0 22 h120 M0 36 h120 M0 50 h120' stroke='#cbd5e1' stroke-width='0.6'/><path d='M85 10 l6 10 l-8-4 l7 12' fill='none' stroke='#cbd5e1' stroke-width='1.25' stroke-linecap='round'/></svg>`
  ),
  storefront: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='110' height='70'><path d='M15 30 h80 v32 h-80 Z M15 30 l6-14 h68 l6 14 M45 62 v-18 h20 v18' fill='none' stroke='#cbd5e1' stroke-width='1.25'/></svg>`
  ),
  steam: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='80'><path d='M30 55 Q26 45 32 38 Q38 31 34 22 M50 55 Q46 45 52 38 Q58 31 54 22 M70 55 Q66 45 72 38' fill='none' stroke='#cbd5e1' stroke-width='1.5' stroke-linecap='round'/><path d='M18 62 h58' stroke='#cbd5e1' stroke-width='1.5' stroke-linecap='round'/></svg>`
  ),
  fenceline: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='60'><path d='M12 15 v34 M34 15 v34 M56 15 v34 M78 15 v34 M2 24 h86 M2 40 h86' stroke='#cbd5e1' stroke-width='1.25'/></svg>`
  ),
  trowel: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='70'><path d='M5 55 Q45 20 90 38 Q120 50 145 30' fill='none' stroke='#cbd5e1' stroke-width='5' stroke-linecap='round' opacity='0.6'/></svg>`
  ),
  brick: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='48'><path d='M0 0h96M0 16h96M0 32h96M0 48h96' stroke='#cbd5e1' stroke-width='0.75'/><path d='M24 0v16M72 0v16M0 16v16M48 16v16M96 16v16M24 32v16M72 32v16' stroke='#cbd5e1' stroke-width='0.75'/></svg>`
  ),
  glasspane: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='110' height='110'><rect x='12' y='12' width='86' height='86' fill='none' stroke='#cbd5e1' stroke-width='1'/><path d='M22 40 L45 17 M30 70 L75 25' stroke='#cbd5e1' stroke-width='1.25' stroke-linecap='round'/></svg>`
  ),
  tilegrid: svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><path d='M0 0h50v50H0z' fill='none' stroke='#cbd5e1' stroke-width='1'/></svg>`
  ),
  none: null,
};

/** CSS background-image for a business type's header texture (or null). */
export function textureFor(value: unknown): string | null {
  const def = getBusinessType(value);
  if (!def) return null;
  return TEXTURES[def.texture] ?? null;
}
