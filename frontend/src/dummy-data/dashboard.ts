export const dashboardStats = {
  total_disaster: 47,
  total_victims: 1250,
  total_refugees: 3420,
  total_damage: 892,
};

export const disasterByType = [
  { name: "Banjir", value: 18, color: "hsl(217, 91%, 60%)" },
  { name: "Longsor", value: 12, color: "hsl(24, 95%, 53%)" },
  { name: "Gempa", value: 8, color: "hsl(0, 72%, 51%)" },
  { name: "Kebakaran", value: 9, color: "hsl(45, 93%, 47%)" },
];

export const disasterTrend = [
  { month: "Jan", kejadian: 3 },
  { month: "Feb", kejadian: 5 },
  { month: "Mar", kejadian: 2 },
  { month: "Apr", kejadian: 7 },
  { month: "May", kejadian: 4 },
  { month: "Jun", kejadian: 6 },
  { month: "Jul", kejadian: 8 },
  { month: "Aug", kejadian: 3 },
  { month: "Sep", kejadian: 5 },
  { month: "Oct", kejadian: 2 },
  { month: "Nov", kejadian: 1 },
  { month: "Dec", kejadian: 1 },
];

export const mapPoints = [
  { id: 1, lat: -6.9175, lng: 107.6191, jenis_bencana: "Banjir", status: "VERIFIED", lokasi: "Bandung Selatan" },
  { id: 2, lat: -6.8, lng: 107.5, jenis_bencana: "Longsor", status: "NEW", lokasi: "Lembang" },
  { id: 3, lat: -7.25, lng: 107.8, jenis_bencana: "Gempa", status: "MONITORING", lokasi: "Garut" },
  { id: 4, lat: -6.7, lng: 106.8, jenis_bencana: "Kebakaran", status: "VERIFIED", lokasi: "Bogor" },
  { id: 5, lat: -7.0, lng: 107.7, jenis_bencana: "Banjir", status: "ASSIGNED", lokasi: "Sumedang" },
];
