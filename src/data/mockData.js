/* ---------------------------------------------------------------------------
   Mock data layer — stands in for the backend API until it exists.
   Backend dev: replace the exported functions in src/services/api.js with real
   fetch calls. The SHAPES here are the contract; keep them stable.
--------------------------------------------------------------------------- */

// Live platform statistics (Hero "Live Platform Stats" + StatsBar)
export const platformStats = {
  reports: { value: 18420, deltaPct: 12 },
  lgas: { value: 774, deltaPct: 4 },
  resolved: { value: 7312, deltaPct: 9 },
  responseRate: { value: 84, deltaPct: 3 },
}

// A report object — the canonical shape used across map, cards, and detail page.
export const reports = [
  {
    id: 'PE-2026-004218',
    title: 'Collapsed drainage channel blocking access road',
    category: 'roads',
    severity: 'high',
    status: 'open',
    description:
      'The main drainage channel along Bode Thomas has collapsed and is now blocking the access road. During rainfall the whole street floods, cutting off residents for hours.',
    lga: 'Surulere',
    state: 'Lagos',
    coordinates: { lat: 6.5008, lng: 3.3486 },
    confirmations: 124,
    createdAt: '2026-07-08T12:10:00Z',
    photo: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'PE-2026-004203',
    title: 'Primary school with no roof after storm',
    category: 'school',
    severity: 'critical',
    status: 'acknowledged',
    description:
      'The roof of Community Primary School Block B was blown off during last month’s storm. Pupils are being taught under trees. It has been like this for five weeks.',
    lga: 'Yenagoa',
    state: 'Bayelsa',
    coordinates: { lat: 4.9247, lng: 6.2642 },
    confirmations: 89,
    createdAt: '2026-07-07T09:32:00Z',
    photo: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'PE-2026-004190',
    title: 'Dry borehole leaves community without clean water',
    category: 'water',
    severity: 'high',
    status: 'progress',
    description:
      'The public borehole serving over 300 households has been dry for three weeks. Residents now walk 2km to fetch water from an untreated stream.',
    lga: 'Aba North',
    state: 'Abia',
    coordinates: { lat: 5.1315, lng: 7.3667 },
    confirmations: 176,
    createdAt: '2026-07-06T16:45:00Z',
    photo: 'https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'PE-2026-004155',
    title: 'Flooded transformer poses electrocution risk',
    category: 'electricity',
    severity: 'critical',
    status: 'disputed',
    description:
      'A ground-level transformer on Ogui Road is sitting in floodwater. Sparks were seen last night. The LGA marked this resolved but the hazard is still present.',
    lga: 'Enugu North',
    state: 'Enugu',
    coordinates: { lat: 6.4413, lng: 7.4988 },
    confirmations: 241,
    createdAt: '2026-07-05T19:05:00Z',
    photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'PE-2026-004101',
    title: 'Pedestrian bridge railing completely rusted through',
    category: 'bridge',
    severity: 'medium',
    status: 'resolved',
    description:
      'The railing on the footbridge over the expressway had rusted through, leaving a dangerous gap. Following this report the works department replaced the full section.',
    lga: 'Kano Municipal',
    state: 'Kano',
    coordinates: { lat: 12.0022, lng: 8.5919 },
    confirmations: 58,
    createdAt: '2026-07-03T08:20:00Z',
    photo: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'PE-2026-004077',
    title: 'Major pothole cluster on market access road',
    category: 'roads',
    severity: 'high',
    status: 'open',
    description:
      'A cluster of deep potholes on the road leading to the main market has damaged several vehicles and slows traders every morning. Worsens badly after rain.',
    lga: 'Oredo',
    state: 'Edo',
    coordinates: { lat: 6.335, lng: 5.6037 },
    confirmations: 93,
    createdAt: '2026-07-02T11:15:00Z',
    photo: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=60',
  },
]

// Status timeline events for a report detail page (PRD §5.4)
export const sampleTimeline = [
  {
    status: 'open',
    label: 'Submitted',
    date: '2026-07-08T12:10:00Z',
    note: 'Report published to the public map.',
    party: 'Anonymous citizen',
  },
  {
    status: 'acknowledged',
    label: 'Acknowledged',
    date: '2026-07-09T14:30:00Z',
    note: 'We have logged this report and passed it to the works department.',
    party: 'LGA Official, Surulere',
  },
]

// "How PublicEye Works" — 3 steps (Landing §3.1)
export const howItWorks = [
  {
    step: 1,
    title: 'Take a Photo',
    body: 'Point your phone at the broken road, dry borehole or roofless school. Your photo becomes evidence.',
  },
  {
    step: 2,
    title: 'Submit Report',
    body: 'Add a category, severity and a short description. GPS and address fill in automatically — under 90 seconds.',
  },
  {
    step: 3,
    title: 'Track Progress',
    body: 'Your report goes on the public map. Officials respond in the open, and you can dispute false resolutions.',
  },
]
