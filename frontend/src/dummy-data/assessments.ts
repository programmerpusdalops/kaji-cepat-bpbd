export const dummyAssessments = [
  {
    id: 1, report_id: 1,
    location: { province: "Jawa Barat", regency: "Kota Bandung", district: "Bandung Wetan", village: "Cibeunying", lat: -6.9175, lng: 107.6191 },
    victims: { dead: 2, missing: 1, serious_injury: 5, minor_injury: 12, refugees: 150 },
    house_damage: { heavy: 10, medium: 25, light: 45 },
    facility_damage: { school: 1, worship: 0, health: 1, government: 0 },
    infrastructure_damage: { road: true, bridge: false, electricity: true, water: true, telecom: false },
  },
  {
    id: 2, report_id: 2,
    location: { province: "Jawa Barat", regency: "Kab. Bandung Barat", district: "Lembang", village: "Lembang", lat: -6.8, lng: 107.5 },
    victims: { dead: 0, missing: 0, serious_injury: 2, minor_injury: 5, refugees: 30 },
    house_damage: { heavy: 3, medium: 5, light: 10 },
    facility_damage: { school: 0, worship: 0, health: 0, government: 0 },
    infrastructure_damage: { road: true, bridge: false, electricity: false, water: false, telecom: false },
  },
];

export const dummyImpactData = [
  { lokasi: "Bandung Wetan, Kota Bandung", meninggal: 2, luka: 17, pengungsi: 150, rusak_rumah: 80 },
  { lokasi: "Lembang, Kab. Bandung Barat", meninggal: 0, luka: 7, pengungsi: 30, rusak_rumah: 18 },
  { lokasi: "Tarogong, Kab. Garut", meninggal: 1, luka: 8, pengungsi: 200, rusak_rumah: 35 },
  { lokasi: "Bogor Tengah, Kota Bogor", meninggal: 0, luka: 3, pengungsi: 0, rusak_rumah: 0 },
  { lokasi: "Cimalaka, Kab. Sumedang", meninggal: 0, luka: 2, pengungsi: 80, rusak_rumah: 12 },
];

export const dummyTeamAssignments = [
  { id: 1, report_id: 1, report_code: "LB-2024-001", team_name: "TRC Alpha", leader: "Budi Santoso", total_members: 8, vehicle: "Mobil Rescue", departure_time: "2024-01-15T09:00:00", arrival_estimate: "2024-01-15T10:30:00", status: "DEPLOYED" },
  { id: 2, report_id: 3, report_code: "LB-2024-003", team_name: "TRC Bravo", leader: "Siti Aminah", total_members: 6, vehicle: "Truck Logistik", departure_time: "2024-02-01T05:00:00", arrival_estimate: "2024-02-01T08:00:00", status: "RETURNING" },
];

export const dummyUsers = [
  { id: 1, name: "Admin BPBD", email: "admin@bpbd.go.id", role: "ADMIN", instansi: "BPBD Provinsi", status: "ACTIVE" },
  { id: 2, name: "Operator Pusdalops", email: "pusdalops@bpbd.go.id", role: "PUSDALOPS", instansi: "BPBD Provinsi", status: "ACTIVE" },
  { id: 3, name: "Budi Santoso", email: "budi@bpbd.go.id", role: "TRC", instansi: "BPBD Kota Bandung", status: "ACTIVE" },
  { id: 4, name: "Kepala BPBD", email: "kepala@bpbd.go.id", role: "PIMPINAN", instansi: "BPBD Provinsi", status: "ACTIVE" },
  { id: 5, name: "Siti Aminah", email: "siti@bpbd.go.id", role: "TRC", instansi: "BPBD Kab. Garut", status: "INACTIVE" },
];

export const dummyMasterData = {
  disaster_types: ["Banjir", "Longsor", "Gempa Bumi", "Kebakaran", "Puting Beliung", "Kekeringan", "Tsunami"],
  regions: [
    { province: "Jawa Barat", regencies: ["Kota Bandung", "Kab. Bandung", "Kab. Bandung Barat", "Kota Bogor", "Kab. Garut", "Kab. Sumedang"] },
  ],
  agencies: ["BPBD Provinsi", "BPBD Kota Bandung", "BPBD Kab. Garut", "PMI", "Basarnas", "TNI", "Polri"],
  volunteers: [
    { id: 1, name: "Relawan A", org: "PMI", skill: "Medis" },
    { id: 2, name: "Relawan B", org: "SAR", skill: "Evakuasi" },
    { id: 3, name: "Relawan C", org: "Tagana", skill: "Logistik" },
  ],
};
