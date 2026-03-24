/**
 * WhatsApp Message Generator
 * Generates the official Kaji Cepat report message format
 */

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// ──────────────── Helpers ────────────────

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
        hari: HARI[d.getDay()],
        tanggal: `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`,
        waktu: `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`,
    };
};

const replaceVariables = (text, vars) => {
    let result = text;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
};

// ──────────────── Default Recipients ────────────────

const DEFAULT_RECIPIENTS = [
    { nomor: 1, nama: 'Kepala BNPB RI' },
    { nomor: 2, nama: 'Menteri Sosial RI' },
    { nomor: 3, nama: 'Gubernur Sulteng' },
    { nomor: 4, nama: 'Wakil Gubernur Sulteng' },
    { nomor: 5, nama: 'Ketua DPRD Prov. Sulteng' },
    { nomor: 6, nama: 'Deputi Penanganan Darurat BNPB' },
    { nomor: 7, nama: 'Deputi Logistik dan Peralatan BNPB' },
    { nomor: 8, nama: 'Sekda Prov. Sulteng' },
    { nomor: 9, nama: 'Kadis Sosial Prov. Sulteng' },
    { nomor: 10, nama: 'Kadis Pangan Prov. Sulteng' },
];

// ──────────────── Section Formatters ────────────────

const formatHeader = (recipients = []) => {
    const allRecipients = [...DEFAULT_RECIPIENTS];

    // Add extra recipients beyond default
    for (const r of recipients) {
        if (!allRecipients.find(d => d.nomor === r.nomor)) {
            allRecipients.push(r);
        }
    }

    allRecipients.sort((a, b) => a.nomor - b.nomor);

    let header = '*Kepada Yth.*\n';
    for (const r of allRecipients) {
        header += `*${r.nomor}. ${r.nama}*\n`;
    }
    return header.trim();
};

const formatLokasiJudul = (data) => {
    const villages = data.villages || [];
    if (villages.length === 1) {
        return `Desa ${villages[0].village_name} Kec. ${data.district} Kab. ${data.regency}`;
    }
    return `Kec. ${data.district} Kab. ${data.regency}`;
};

const formatLokasi = (data) => {
    const villages = data.villages || [];
    if (villages.length === 0) {
        return `Kec. ${data.district} Kab. ${data.regency} Prov. ${data.province}`;
    }

    if (villages.length === 1) {
        return `Desa ${villages[0].village_name} Kec. ${data.district} Kab. ${data.regency} Prov. ${data.province}`;
    }

    let text = `Kec. ${data.district} Kab. ${data.regency} Prov. ${data.province}\n`;
    for (const v of villages) {
        text += `• Desa ${v.village_name}\n`;
    }
    return text.trim();
};

const formatDataPerDesa = (items, villages) => {
    if (!items || items.length === 0) return '_Dalam Pendataan_';

    const allPending = items.every(i => i.status === 'PENDING');
    if (allPending) return '_Dalam Pendataan_';

    const allNihil = items.every(i => i.status === 'NIHIL');
    if (allNihil) return '_NIHIL_';

    if (villages.length <= 1) {
        // Single village — flat format
        const item = items[0];
        if (item.status === 'NIHIL') return '_NIHIL_';
        if (item.status === 'PENDING') return 'Dalam Pendataan';

        let text = '';
        if (item.jumlah_kk > 0) text += `• ${item.jumlah_kk} KK\n`;
        if (item.jumlah_jiwa > 0) text += `• ${item.jumlah_jiwa} Jiwa\n`;
        if (item.keterangan) text += `• ${item.keterangan}\n`;
        return text.trim() || 'Dalam Pendataan';
    }

    // Multi village — per-desa breakdown
    let text = '';
    for (const item of items) {
        const villageName = item.village_name || 'Desa tidak diketahui';
        text += `\n${villageName}\n`;

        if (item.status === 'NIHIL') {
            text += '• _NIHIL_\n';
        } else if (item.status === 'PENDING') {
            text += '• _Dalam Pendataan_\n';
        } else {
            if (item.jumlah_kk > 0) text += `• ${item.jumlah_kk} KK\n`;
            if (item.jumlah_jiwa > 0) text += `• ${item.jumlah_jiwa} Jiwa\n`;
            if (item.keterangan) text += `• ${item.keterangan}\n`;
        }
    }
    return text.trim();
};

const formatNumberedList = (items) => {
    if (!items || items.length === 0) return '-';
    return items.map((item, i) => `${i + 1}. ${typeof item === 'string' ? item : item.text}`).join('\n');
};

const formatBulletList = (items) => {
    if (!items || items.length === 0) return '-';
    return items.map(item => `• ${typeof item === 'string' ? item : item.text}`).join('\n');
};

// ──────────────── Main Generator ────────────────

/**
 * Generate the WhatsApp message from a full assessment data object
 * @param {Object} data - Full assessment object from repository (with all child records)
 * @returns {string} Formatted WhatsApp message
 */
const generateWhatsAppMessage = (data) => {
    const vars = {
        kabupaten: data.regency || '',
        kecamatan: data.district || '',
        jenis_bencana: data.disaster_type_name || '',
    };

    const waktuLaporan = formatDate(data.waktu_laporan);
    const waktuKejadian = formatDate(data.waktu_kejadian);
    const lokasiJudul = formatLokasiJudul(data);

    // Build steps text
    const stepsText = (data.steps || []).map((s, i) => {
        const text = replaceVariables(s.langkah, vars);
        return `${i + 1}. ${text}`;
    }).join('\n') || '-';

    // Build needs text
    const needsText = (data.needs || []).map((n, i) => {
        const name = n.need_item_name || n.custom_name || 'Item';
        return `${i + 1}. ${name}`;
    }).join('\n') || '-';

    // Build situations text
    const situationsText = (data.situations || []).map((s, i) => {
        return `${i + 1}. ${s.situasi}`;
    }).join('\n') || '-';

    // Build sources text
    const sourcesText = (data.sources || []).map((s, i) => {
        const text = replaceVariables(s.sumber, vars);
        return `${i + 1}. ${text}`;
    }).join('\n') || '-';

    // Build the message
    const message = `${formatHeader(data.recipients || [])}

Izin melaporkan Informasi Kejadian *${data.disaster_type_name} ${lokasiJudul}* sebagai berikut :

📌 *JENIS BENCANA*
${data.disaster_type_name}

📌 *TERIMA LAPORAN*
Hari : ${waktuLaporan.hari}
Tanggal : ${waktuLaporan.tanggal}
Waktu : ${waktuLaporan.waktu} WITA

📌 *WAKTU KEJADIAN*
Hari : ${waktuKejadian.hari}
Tanggal : ${waktuKejadian.tanggal}
Waktu : ${waktuKejadian.waktu} WITA

📌 *LOKASI/TEMPAT KEJADIAN*
${formatLokasi(data)}

📌 *KRONOLOGIS*
${data.kronologis || '-'}

📌 *TERDAMPAK*
${formatDataPerDesa(data.affected, data.villages || [])}

📌 *PENGUNGSI*
${formatDataPerDesa(data.refugees, data.villages || [])}

📌 *KORBAN JIWA*
${formatDataPerDesa(data.casualties, data.villages || [])}

📌 *LANGKAH YANG DILAKSANAKAN*
${stepsText}

📌 *KEBUTUHAN MENDESAK*
${needsText}

📌 *SITUASI AKHIR*
${situationsText}

📌 *TITIK LOKASI*
${data.peta_link || 'Belum tersedia'}

📌 *SUMBER*
${sourcesText}

*TERTANDA:*
*Ir. Asbudianto, S.T., M.Si*
*Plt. KEPALA PELAKSANA BPBD PROV. SULTENG*`;

    return message;
};

module.exports = {
    generateWhatsAppMessage,
    formatDate,
    DEFAULT_RECIPIENTS,
};
