const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fieldAssessmentRepo = require('../fieldAssessments/fieldAssessmentRepository');

/**
 * Report Generator Service — generates DOCX (and PDF via LibreOffice) from Juklak data
 */

const TEMPLATE_PATH = path.join(__dirname, 'templates', 'juklak_template.docx');
const OUTPUT_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'reports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Default kelompok rentan structure
 */
const defaultKelompokRentan = () => ({
    bayi: 0, balita: 0, anak: 0, lansia: 0,
    ibu_hamil: 0, ibu_menyusui: 0, disabilitas: 0, orang_sakit: 0,
});

const defaultKelompokKhusus = () => ({
    odgj: 0, wanita_usia_subur: 0,
});

/**
 * Default sektor kebutuhan (12 sektor sesuai Juklak)
 */
const DEFAULT_SEKTOR = [
    'Kesehatan',
    'Penyelamatan dan evakuasi',
    'Air bersih, sanitasi, dan hygiene',
    'Pangan (memperhatikan pola makanan pokok)',
    'Nonpangan',
    'Penampungan dan hunian sementara',
    'Rumah tidak layak huni akibat bencana',
    'Kerusakan prasarana jalan',
    'Kerusakan jembatan',
    'Kerusakan lahan',
    'Sarana utilitas (jaringan listrik, telekomunikasi, dan air bersih)',
    'Prasarana dan sarana lain',
];

/**
 * Flatten the JSONB detail into a flat placeholder object for docxtemplater
 */
const buildPlaceholders = (assessment) => {
    const d = assessment.detail || {};
    const p = d.pendahuluan || {};
    const pt = d.penduduk_terdampak || {};
    const kr = d.korban || {};
    const pg = d.pengungsi || {};
    const tm = d.tidak_mengungsi || {};
    const ks = d.kerusakan || {};
    const ud = d.upaya_darurat || {};
    const il = d.informasi_lain || {};
    const kp = d.kesimpulan || {};
    const tim = d.tim_trc || {};

    // Kelompok rentan arrays for loops
    const buildKRTable = (data) => {
        const kr_data = data?.kelompok_rentan || defaultKelompokRentan();
        const kk_data = data?.kelompok_khusus || defaultKelompokKhusus();
        return {
            total: data?.total || 0,
            laki_laki: data?.laki_laki || 0,
            perempuan: data?.perempuan || 0,
            kr_bayi: kr_data.bayi || 0,
            kr_balita: kr_data.balita || 0,
            kr_anak: kr_data.anak || 0,
            kr_lansia: kr_data.lansia || 0,
            kr_ibu_hamil: kr_data.ibu_hamil || 0,
            kr_ibu_menyusui: kr_data.ibu_menyusui || 0,
            kr_disabilitas: kr_data.disabilitas || 0,
            kr_orang_sakit: kr_data.orang_sakit || 0,
            kr_total: Object.values(kr_data).reduce((a, b) => a + (Number(b) || 0), 0),
            kk_odgj: kk_data.odgj || 0,
            kk_wanita_usia_subur: kk_data.wanita_usia_subur || 0,
            kk_total: (Number(kk_data.odgj) || 0) + (Number(kk_data.wanita_usia_subur) || 0),
        };
    };

    const ptData = buildKRTable(pt);
    const krData = buildKRTable(kr);
    const pgData = buildKRTable(pg);
    const tmData = buildKRTable(tm);

    // Build sektor kebutuhan array
    const sektorList = kp.sektor_kebutuhan && kp.sektor_kebutuhan.length > 0
        ? kp.sektor_kebutuhan
        : DEFAULT_SEKTOR.map(s => ({ sektor: s, kebutuhan: '' }));

    // Build kebutuhan tindakan array
    const kebutuhanList = d.kebutuhan && d.kebutuhan.length > 0
        ? d.kebutuhan.map((k, i) => ({ no: String.fromCharCode(97 + i), kegiatan: k.kegiatan || '', detail: k.detail || '' }))
        : [{ no: 'a', kegiatan: '', detail: '' }];

    // Tim TRC
    const timAnggota = tim.anggota && tim.anggota.length > 0
        ? tim.anggota
        : [{ no: 1, nama: '', keterangan: 'Ketua Tim' }];

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch { return String(dateStr); }
    };

    return {
        // Pendahuluan
        jenis_kejadian: p.jenis_kejadian || assessment.disaster_type || '',
        lokasi_kejadian: p.lokasi || `${assessment.village || ''}, ${assessment.district || ''}, ${assessment.regency || ''}`.replace(/^, /, ''),
        waktu_kejadian: formatDate(p.waktu_kejadian),
        lama_waktu: p.lama_waktu || '',
        kronologis: p.kronologis || '',

        // Lokasi terpisah
        desa: assessment.village || '',
        kecamatan: assessment.district || '',
        kabupaten: assessment.regency || '',
        provinsi: assessment.province || 'Sulawesi Tengah',

        // Cakupan wilayah
        cakupan_wilayah: d.cakupan_wilayah || '',

        // Penduduk terdampak
        pt_total: ptData.total, pt_laki: ptData.laki_laki, pt_perempuan: ptData.perempuan,
        pt_kr_bayi: ptData.kr_bayi, pt_kr_balita: ptData.kr_balita, pt_kr_anak: ptData.kr_anak,
        pt_kr_lansia: ptData.kr_lansia, pt_kr_ibu_hamil: ptData.kr_ibu_hamil,
        pt_kr_ibu_menyusui: ptData.kr_ibu_menyusui, pt_kr_disabilitas: ptData.kr_disabilitas,
        pt_kr_orang_sakit: ptData.kr_orang_sakit, pt_kr_total: ptData.kr_total,
        pt_kk_odgj: ptData.kk_odgj, pt_kk_wanita_usia_subur: ptData.kk_wanita_usia_subur,
        pt_kk_total: ptData.kk_total,

        // Korban
        korban_meninggal: kr.meninggal || 0,
        korban_mortalitas: kr.mortalitas || '0%',
        korban_luka: kr.luka || 0,
        korban_sakit: kr.sakit || 0,
        korban_hilang: kr.hilang || 0,
        // Korban kelompok rentan (sama struktur)
        kr_total: krData.total, kr_laki: krData.laki_laki, kr_perempuan: krData.perempuan,
        kr_kr_bayi: krData.kr_bayi, kr_kr_balita: krData.kr_balita, kr_kr_anak: krData.kr_anak,
        kr_kr_lansia: krData.kr_lansia, kr_kr_ibu_hamil: krData.kr_ibu_hamil,
        kr_kr_ibu_menyusui: krData.kr_ibu_menyusui, kr_kr_disabilitas: krData.kr_disabilitas,
        kr_kr_orang_sakit: krData.kr_orang_sakit, kr_kr_total: krData.kr_total,
        kr_kk_odgj: krData.kk_odgj, kr_kk_wanita_usia_subur: krData.kk_wanita_usia_subur,
        kr_kk_total: krData.kk_total,

        // Pengungsi
        pg_total: pgData.total, pg_laki: pgData.laki_laki, pg_perempuan: pgData.perempuan,
        pg_jumlah_kk: pg.jumlah_kk || 0,
        pg_kr_bayi: pgData.kr_bayi, pg_kr_balita: pgData.kr_balita, pg_kr_anak: pgData.kr_anak,
        pg_kr_lansia: pgData.kr_lansia, pg_kr_ibu_hamil: pgData.kr_ibu_hamil,
        pg_kr_ibu_menyusui: pgData.kr_ibu_menyusui, pg_kr_disabilitas: pgData.kr_disabilitas,
        pg_kr_orang_sakit: pgData.kr_orang_sakit, pg_kr_total: pgData.kr_total,
        pg_kk_odgj: pgData.kk_odgj, pg_kk_wanita_usia_subur: pgData.kk_wanita_usia_subur,
        pg_kk_total: pgData.kk_total,

        // Tidak mengungsi
        tm_total: tmData.total, tm_laki: tmData.laki_laki, tm_perempuan: tmData.perempuan,
        tm_kr_bayi: tmData.kr_bayi, tm_kr_balita: tmData.kr_balita, tm_kr_anak: tmData.kr_anak,
        tm_kr_lansia: tmData.kr_lansia, tm_kr_ibu_hamil: tmData.kr_ibu_hamil,
        tm_kr_ibu_menyusui: tmData.kr_ibu_menyusui, tm_kr_disabilitas: tmData.kr_disabilitas,
        tm_kr_orang_sakit: tmData.kr_orang_sakit, tm_kr_total: tmData.kr_total,
        tm_kk_odgj: tmData.kk_odgj, tm_kk_wanita_usia_subur: tmData.kk_wanita_usia_subur,
        tm_kk_total: tmData.kk_total,

        // Kerusakan
        rumah_terdampak: ks.rumah_terdampak || 0,
        rumah_tidak_layak: ks.rumah_tidak_layak || 0,
        kerusakan_jalan: ks.jalan || '',
        kerusakan_jembatan: ks.jembatan || '',
        kerusakan_lahan: ks.lahan || '',
        kerusakan_listrik: ks.listrik || '',
        kerusakan_telekomunikasi: ks.telekomunikasi || '',
        kerusakan_air_bersih: ks.air_bersih || '',
        kerusakan_lainnya: ks.lainnya || '',

        // Upaya darurat
        upaya_evakuasi: ud.evakuasi || '',
        upaya_kebutuhan: ud.kebutuhan || '',
        upaya_pemulihan: ud.pemulihan || '',

        // Kebutuhan tindakan (loop)
        kebutuhan_list: kebutuhanList,

        // Informasi lain
        titik_lokasi: il.titik_lokasi || '',
        rencana_penanganan: il.rencana_penanganan || '',
        sumber_informasi: il.sumber_informasi || '',

        // Kesimpulan
        rekomendasi_status: kp.rekomendasi_status || '',
        perkiraan_hari: kp.perkiraan_hari || '',
        alasan_rekomendasi: kp.alasan || '',

        // Sektor kebutuhan (loop)
        sektor_list: sektorList,

        // Tim TRC
        surat_tugas_nomor: tim.surat_tugas_nomor || '',
        surat_tugas_tanggal: tim.surat_tugas_tanggal || '',
        tim_anggota: timAnggota,

        // Meta
        report_code: assessment.report_code || `KC-${assessment.assessment_id}`,
        tahun: new Date().getFullYear().toString(),
    };
};

/**
 * Generate DOCX directly using html-to-docx and EJS
 */
const generateDocx = async (assessmentId) => {
    const assessment = await fieldAssessmentRepo.findByIdFull(assessmentId);
    if (!assessment) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const ejsTemplatePath = path.join(__dirname, 'templates', 'juklak_template_docx.ejs');
    if (!fs.existsSync(ejsTemplatePath)) {
        const error = new Error('Template EJS untuk DOCX tidak ditemukan.');
        error.statusCode = 500;
        throw error;
    }

    const placeholders = buildPlaceholders(assessment);
    
    // Render HTML from EJS template
    const ejs = require('ejs');
    const htmlContent = await ejs.renderFile(ejsTemplatePath, placeholders);

    // Use html-to-docx to convert HTML string to Word Document
    const HTMLtoDOCX = require('html-to-docx');
    
    const fileBuffer = await HTMLtoDOCX(htmlContent, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
        margins: { top: 1440, bg: 1440, left: 1440, right: 1440 } // 1 inch margins
    });

    const filename = `Kaji_Cepat_${assessment.report_code || assessmentId}_${Date.now()}.docx`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, fileBuffer);

    return { path: outputPath, filename };
};

/**
 * Generate PDF directly using Puppeteer and EJS
 */
const generatePdf = async (assessmentId) => {
    const assessment = await fieldAssessmentRepo.findByIdFull(assessmentId);
    if (!assessment) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const ejsTemplatePath = path.join(__dirname, 'templates', 'juklak_template.ejs');
    if (!fs.existsSync(ejsTemplatePath)) {
        const error = new Error('Template EJS tidak ditemukan.');
        error.statusCode = 500;
        throw error;
    }

    // Build the data for the template
    const placeholders = buildPlaceholders(assessment);
    
    // Render HTML from EJS template
    const ejs = require('ejs');
    const htmlContent = await ejs.renderFile(ejsTemplatePath, placeholders);

    // Use Puppeteer to convert HTML to PDF
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const filename = `Kaji_Cepat_${assessment.report_code || assessmentId}_${Date.now()}.pdf`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        return { path: outputPath, filename };
    } finally {
        await browser.close();
    }
};

module.exports = {
    generateDocx,
    generatePdf,
    buildPlaceholders,
    DEFAULT_SEKTOR,
};
