const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const teamAssignmentRepo = require('../teamAssignments/teamAssignmentRepository');

/**
 * Surat Tugas Generator Service
 * 
 * Generates Surat Tugas documents using format_st_template.docx.
 * All ST data is now read from the team_assignments DB record (no payload needed).
 */

const TEMPLATE_PATH = path.join(__dirname, '..', '..', '..', 'templete', 'format_st_template.docx');
const OUTPUT_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'surat-tugas');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Build placeholder data from assignment record (all data from DB)
 */
const buildPlaceholders = (assignment) => {
    // Team members array for table 1
    const timMembers = [];
    timMembers.push({
        no: '1',
        nama: assignment.leader || '',
        keterangan: 'Ketua Tim',
    });

    if (assignment.members && assignment.members.length > 0) {
        assignment.members.forEach((member, idx) => {
            timMembers.push({
                no: String(idx + 2),
                nama: member.name || '',
                keterangan: 'Anggota',
            });
        });
    }

    // Table 2 (confirmation) — same data with different keys
    const tim2Members = timMembers.map(m => ({
        no2: m.no,
        nama2: m.nama,
        keterangan2: m.keterangan,
    }));

    return {
        // Bencana info (from rapid assessment via join)
        jenis_bencana: assignment.disaster_type || '',
        desa: assignment.desa || '',
        kecamatan: assignment.district || '',
        kabupaten: assignment.regency || '',

        // Surat info (from team_assignments columns)
        nomor_surat: assignment.nomor_surat || '',
        tanggal: assignment.tanggal_surat || '',
        bulan: assignment.bulan_surat || '',
        tahun: assignment.tahun_surat || new Date().getFullYear().toString(),

        // Tim tables (loop)
        tim: timMembers,
        tim2: tim2Members,

        // Signatures
        nama_ketua: assignment.leader || '',
        nama_aparat_desa: assignment.nama_aparat_desa || '',

        // Tembusan
        kabupaten_tembusan: assignment.regency || '',
    };
};

/**
 * Generate DOCX Surat Tugas — all data from DB
 */
const generateDocx = async (assignmentId) => {
    const assignment = await teamAssignmentRepo.findById(assignmentId);
    if (!assignment) {
        const error = new Error('Penugasan tim tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    assignment.members = await teamAssignmentRepo.findMembersByAssignmentId(assignmentId);

    if (!fs.existsSync(TEMPLATE_PATH)) {
        const error = new Error(`Template Surat Tugas tidak ditemukan di: ${TEMPLATE_PATH}`);
        error.statusCode = 500;
        throw error;
    }

    const templateContent = fs.readFileSync(TEMPLATE_PATH);
    const zip = new PizZip(templateContent);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
        nullGetter: () => '',
    });

    const placeholders = buildPlaceholders(assignment);
    doc.render(placeholders);

    const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
    });

    const safeNomor = (assignment.nomor_surat || assignmentId).toString().replace(/\//g, '-');
    const filename = `Surat_Tugas_${safeNomor}_${Date.now()}.docx`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, buf);

    return { path: outputPath, filename };
};

const isLibreOfficeAvailable = () => {
    try {
        execSync('which soffice 2>/dev/null || which libreoffice 2>/dev/null', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
};

const convertDocxToPdf = (docxPath) => {
    const cmd = `soffice --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${docxPath}"`;
    execSync(cmd, { timeout: 30000, stdio: 'pipe' });

    const basename = path.basename(docxPath, '.docx');
    const pdfPath = path.join(OUTPUT_DIR, `${basename}.pdf`);

    if (!fs.existsSync(pdfPath)) {
        throw new Error('LibreOffice conversion gagal — file PDF tidak ditemukan.');
    }

    return pdfPath;
};

const generatePdf = async (assignmentId) => {
    if (!isLibreOfficeAvailable()) {
        const error = new Error('LibreOffice tidak tersedia. Install LibreOffice untuk generate PDF.');
        error.statusCode = 501;
        throw error;
    }

    const { path: docxPath } = await generateDocx(assignmentId);
    try {
        const pdfPath = convertDocxToPdf(docxPath);
        const filename = path.basename(pdfPath);
        return { path: pdfPath, filename };
    } finally {
        try { fs.unlinkSync(docxPath); } catch { /* ignore */ }
    }
};

module.exports = {
    generateDocx,
    generatePdf,
    buildPlaceholders,
};
