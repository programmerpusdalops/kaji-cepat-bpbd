const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fieldAssessmentRepo = require('../fieldAssessments/fieldAssessmentRepository');

/**
 * Report Generator Service
 * 
 * DOCX: Uses docxtemplater to fill the real .docx template (format_w.docx)
 * PDF:  Converts the generated DOCX via LibreOffice headless, with Puppeteer+EJS fallback
 */

// Path to the REAL Word template (format_w.docx) — user edits placeholders here
const TEMPLATE_PATH = path.join(__dirname, '..', '..', '..', 'templete', 'format_w.docx');
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

    // Convert all numeric values to strings so docxtemplater renders them properly
    const stringify = (val) => (val === null || val === undefined) ? '' : String(val);

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
        pt_total: stringify(ptData.total), pt_laki: stringify(ptData.laki_laki), pt_perempuan: stringify(ptData.perempuan),
        pt_kr_bayi: stringify(ptData.kr_bayi), pt_kr_balita: stringify(ptData.kr_balita), pt_kr_anak: stringify(ptData.kr_anak),
        pt_kr_lansia: stringify(ptData.kr_lansia), pt_kr_ibu_hamil: stringify(ptData.kr_ibu_hamil),
        pt_kr_ibu_menyusui: stringify(ptData.kr_ibu_menyusui), pt_kr_disabilitas: stringify(ptData.kr_disabilitas),
        pt_kr_orang_sakit: stringify(ptData.kr_orang_sakit), pt_kr_total: stringify(ptData.kr_total),
        pt_kk_odgj: stringify(ptData.kk_odgj), pt_kk_wanita_usia_subur: stringify(ptData.kk_wanita_usia_subur),
        pt_kk_total: stringify(ptData.kk_total),

        // Korban
        korban_meninggal: stringify(kr.meninggal || 0),
        korban_mortalitas: kr.mortalitas || '0%',
        korban_luka: stringify(kr.luka || 0),
        korban_sakit: stringify(kr.sakit || 0),
        korban_hilang: stringify(kr.hilang || 0),
        // Korban kelompok rentan (sama struktur)
        kr_total: stringify(krData.total), kr_laki: stringify(krData.laki_laki), kr_perempuan: stringify(krData.perempuan),
        kr_kr_bayi: stringify(krData.kr_bayi), kr_kr_balita: stringify(krData.kr_balita), kr_kr_anak: stringify(krData.kr_anak),
        kr_kr_lansia: stringify(krData.kr_lansia), kr_kr_ibu_hamil: stringify(krData.kr_ibu_hamil),
        kr_kr_ibu_menyusui: stringify(krData.kr_ibu_menyusui), kr_kr_disabilitas: stringify(krData.kr_disabilitas),
        kr_kr_orang_sakit: stringify(krData.kr_orang_sakit), kr_kr_total: stringify(krData.kr_total),
        kr_kk_odgj: stringify(krData.kk_odgj), kr_kk_wanita_usia_subur: stringify(krData.kk_wanita_usia_subur),
        kr_kk_total: stringify(krData.kk_total),

        // Pengungsi
        pg_total: stringify(pgData.total), pg_laki: stringify(pgData.laki_laki), pg_perempuan: stringify(pgData.perempuan),
        pg_jumlah_kk: stringify(pg.jumlah_kk || 0),
        pg_kr_bayi: stringify(pgData.kr_bayi), pg_kr_balita: stringify(pgData.kr_balita), pg_kr_anak: stringify(pgData.kr_anak),
        pg_kr_lansia: stringify(pgData.kr_lansia), pg_kr_ibu_hamil: stringify(pgData.kr_ibu_hamil),
        pg_kr_ibu_menyusui: stringify(pgData.kr_ibu_menyusui), pg_kr_disabilitas: stringify(pgData.kr_disabilitas),
        pg_kr_orang_sakit: stringify(pgData.kr_orang_sakit), pg_kr_total: stringify(pgData.kr_total),
        pg_kk_odgj: stringify(pgData.kk_odgj), pg_kk_wanita_usia_subur: stringify(pgData.kk_wanita_usia_subur),
        pg_kk_total: stringify(pgData.kk_total),

        // Tidak mengungsi
        tm_total: stringify(tmData.total), tm_laki: stringify(tmData.laki_laki), tm_perempuan: stringify(tmData.perempuan),
        tm_kr_bayi: stringify(tmData.kr_bayi), tm_kr_balita: stringify(tmData.kr_balita), tm_kr_anak: stringify(tmData.kr_anak),
        tm_kr_lansia: stringify(tmData.kr_lansia), tm_kr_ibu_hamil: stringify(tmData.kr_ibu_hamil),
        tm_kr_ibu_menyusui: stringify(tmData.kr_ibu_menyusui), tm_kr_disabilitas: stringify(tmData.kr_disabilitas),
        tm_kr_orang_sakit: stringify(tmData.kr_orang_sakit), tm_kr_total: stringify(tmData.kr_total),
        tm_kk_odgj: stringify(tmData.kk_odgj), tm_kk_wanita_usia_subur: stringify(tmData.kk_wanita_usia_subur),
        tm_kk_total: stringify(tmData.kk_total),

        // Kerusakan
        rumah_terdampak: stringify(ks.rumah_terdampak || 0),
        rumah_tidak_layak: stringify(ks.rumah_tidak_layak || 0),
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
        perkiraan_hari: stringify(kp.perkiraan_hari || ''),
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
 * Generate DOCX using docxtemplater — reads the real .docx template and fills placeholders.
 * Preserves all original formatting, fonts, tables, and styling from the template.
 */
const generateDocx = async (assessmentId) => {
    const assessment = await fieldAssessmentRepo.findByIdFull(assessmentId);
    if (!assessment) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    // Verify template exists
    if (!fs.existsSync(TEMPLATE_PATH)) {
        const error = new Error(`Template DOCX tidak ditemukan di: ${TEMPLATE_PATH}`);
        error.statusCode = 500;
        throw error;
    }

    // Read the real .docx template
    const templateContent = fs.readFileSync(TEMPLATE_PATH);
    const zip = new PizZip(templateContent);

    // Initialize docxtemplater with the template
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        // Use {{ }} delimiters to match the template's placeholder format
        delimiters: { start: '{{', end: '}}' },
        // Don't throw on undefined tags — render empty string instead
        nullGetter: () => '',
    });

    // Build data from assessment
    const placeholders = buildPlaceholders(assessment);

    // DEBUG: Tampilkan data ke terminal agar bisa dilihat user
    console.log("================ DATA PLACEHOLDERS UNTUK WORD ================");
    console.log(JSON.stringify(placeholders, null, 2));
    console.log("==============================================================");

    // Render the template with data
    doc.render(placeholders);

    // Generate the output buffer
    const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });

    const filename = `Kaji_Cepat_${assessment.report_code || assessmentId}_${Date.now()}.docx`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, buf);

    return { path: outputPath, filename };
};

/**
 * Check if LibreOffice is available on the system
 */
const isLibreOfficeAvailable = () => {
    try {
        execSync('which soffice 2>/dev/null || which libreoffice 2>/dev/null', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
};

/**
 * Convert DOCX to PDF using LibreOffice headless (most accurate conversion)
 */
const convertDocxToPdfLibreOffice = (docxPath) => {
    const cmd = `soffice --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${docxPath}"`;
    execSync(cmd, { timeout: 30000, stdio: 'pipe' });

    // LibreOffice outputs the PDF with the same basename
    const basename = path.basename(docxPath, '.docx');
    const pdfPath = path.join(OUTPUT_DIR, `${basename}.pdf`);

    if (!fs.existsSync(pdfPath)) {
        throw new Error('LibreOffice conversion gagal — file PDF tidak ditemukan.');
    }

    return pdfPath;
};

/**
 * Generate PDF — Strategy:
 * 1. First try: Generate DOCX via docxtemplater → convert to PDF via LibreOffice (best quality)
 * 2. Fallback:  Use Puppeteer + EJS template if LibreOffice is not installed
 */
const generatePdf = async (assessmentId) => {
    // ─── Strategy 1: DOCX → PDF via LibreOffice ───
    if (isLibreOfficeAvailable()) {
        const { path: docxPath } = await generateDocx(assessmentId);
        try {
            const pdfPath = convertDocxToPdfLibreOffice(docxPath);
            const filename = path.basename(pdfPath);
            return { path: pdfPath, filename };
        } finally {
            // Clean up the intermediate DOCX file
            try { fs.unlinkSync(docxPath); } catch { /* ignore */ }
        }
    }

    // ─── Strategy 2 (Fallback): Puppeteer + EJS ───
    console.warn('[ReportGenerator] LibreOffice not found — falling back to Puppeteer+EJS for PDF.');

    const assessment = await fieldAssessmentRepo.findByIdFull(assessmentId);
    if (!assessment) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const ejsTemplatePath = path.join(__dirname, 'templates', 'juklak_template.ejs');
    if (!fs.existsSync(ejsTemplatePath)) {
        const error = new Error('Template EJS tidak ditemukan (fallback PDF).');
        error.statusCode = 500;
        throw error;
    }

    const placeholders = buildPlaceholders(assessment);

    const ejs = require('ejs');
    const htmlContent = await ejs.renderFile(ejsTemplatePath, placeholders);

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
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
            margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
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
