export interface DisasterReport {
  id: number;
  report_code: string;
  disaster_type: string;
  location: string;
  village: string;
  district: string;
  regency: string;
  report_source: string;
  description: string;
  latitude: number;
  longitude: number;
  report_time: string;
  status: "NEW" | "VERIFIED" | "REJECTED" | "MONITORING";
  photos?: string[];
}

export const dummyReports: DisasterReport[] = [
  {
    id: 1, report_code: "LB-2024-001", disaster_type: "Banjir", location: "Jl. Merdeka No. 10",
    village: "Cibeunying", district: "Bandung Wetan", regency: "Kota Bandung",
    report_source: "Masyarakat", description: "Banjir setinggi 1 meter akibat hujan deras selama 6 jam. Beberapa rumah terendam dan warga mengungsi ke tempat yang lebih tinggi.",
    latitude: -6.9175, longitude: 107.6191, report_time: "2024-01-15T08:30:00", status: "VERIFIED",
  },
  {
    id: 2, report_code: "LB-2024-002", disaster_type: "Longsor", location: "Jl. Raya Lembang",
    village: "Lembang", district: "Lembang", regency: "Kab. Bandung Barat",
    report_source: "Relawan", description: "Tanah longsor menutup jalan utama dan menimpa 3 rumah warga.",
    latitude: -6.8, longitude: 107.5, report_time: "2024-01-20T14:15:00", status: "NEW",
  },
  {
    id: 3, report_code: "LB-2024-003", disaster_type: "Gempa", location: "Kec. Tarogong",
    village: "Tarogong", district: "Tarogong Kidul", regency: "Kab. Garut",
    report_source: "BMKG", description: "Gempa bumi 5.2 SR mengguncang wilayah Garut. Beberapa bangunan mengalami keretakan.",
    latitude: -7.25, longitude: 107.8, report_time: "2024-02-01T03:45:00", status: "MONITORING",
  },
  {
    id: 4, report_code: "LB-2024-004", disaster_type: "Kebakaran", location: "Pasar Baru",
    village: "Tegallega", district: "Bogor Tengah", regency: "Kota Bogor",
    report_source: "Damkar", description: "Kebakaran di area pasar menghanguskan 15 kios pedagang.",
    latitude: -6.7, longitude: 106.8, report_time: "2024-02-10T22:00:00", status: "VERIFIED",
  },
  {
    id: 5, report_code: "LB-2024-005", disaster_type: "Banjir", location: "Desa Cimalaka",
    village: "Cimalaka", district: "Cimalaka", regency: "Kab. Sumedang",
    report_source: "Kepala Desa", description: "Banjir bandang dari sungai Cimanuk menggenangi area persawahan dan permukiman.",
    latitude: -7.0, longitude: 107.7, report_time: "2024-02-15T06:00:00", status: "NEW",
  },
  {
    id: 6, report_code: "LB-2024-006", disaster_type: "Longsor", location: "Jl. Ciwidey",
    village: "Ciwidey", district: "Ciwidey", regency: "Kab. Bandung",
    report_source: "Masyarakat", description: "Longsor kecil menutup sebagian jalan menuju Kawah Putih.",
    latitude: -7.1, longitude: 107.4, report_time: "2024-03-01T10:30:00", status: "REJECTED",
  },
];
