const { query, getClient } = require('../../config/database');

/**
 * Rapid Assessment Repository — all DB queries for Kaji Cepat module
 */

// ──────────────── DROPDOWN LIST ────────────────

/**
 * Lightweight list for dropdown selectors (team assignment, field assessment, map)
 */
const findAllForDropdown = async () => {
    const result = await query(`
        SELECT ra.id, ra.disaster_type_id, dt.name AS disaster_type_name,
               ra.province, ra.regency, ra.district, ra.waktu_kejadian, ra.status, ra.created_at
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        ORDER BY ra.created_at DESC
    `);
    return result.rows;
};

// ──────────────── CREATE ────────────────

const create = async (data) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // 1. Insert main assessment
        const assessmentResult = await client.query(`
            INSERT INTO rapid_assessments
                (report_id, disaster_type_id, province, regency, district,
                 waktu_kejadian, waktu_laporan, kronologis, peta_link, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            data.report_id || null,
            data.disaster_type_id,
            data.province || 'Sulawesi Tengah',
            data.regency,
            data.district,
            data.waktu_kejadian,
            data.waktu_laporan,
            data.kronologis || null,
            data.peta_link || null,
            data.status || 'DRAFT',
            data.created_by || null
        ]);
        const assessment = assessmentResult.rows[0];
        const aId = assessment.id;

        // 2. Insert villages
        const villageMap = {};
        if (data.villages && data.villages.length > 0) {
            for (let i = 0; i < data.villages.length; i++) {
                const vResult = await client.query(
                    'INSERT INTO assessment_villages (assessment_id, village_name, sort_order) VALUES ($1, $2, $3) RETURNING id, village_name',
                    [aId, data.villages[i], i]
                );
                villageMap[data.villages[i]] = vResult.rows[0].id;
            }
        }

        // 3. Insert affected (terdampak)
        if (data.affected && data.affected.length > 0) {
            for (const a of data.affected) {
                await client.query(
                    `INSERT INTO assessment_affected (assessment_id, village_id, jumlah_kk, jumlah_jiwa, keterangan, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [aId, villageMap[a.village] || null, a.jumlah_kk || 0, a.jumlah_jiwa || 0, a.keterangan || null, a.status || 'PENDING']
                );
            }
        }

        // 4. Insert refugees (pengungsi)
        if (data.refugees && data.refugees.length > 0) {
            for (const r of data.refugees) {
                await client.query(
                    `INSERT INTO assessment_refugees (assessment_id, village_id, jumlah_kk, jumlah_jiwa, keterangan, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [aId, villageMap[r.village] || null, r.jumlah_kk || 0, r.jumlah_jiwa || 0, r.keterangan || null, r.status || 'PENDING']
                );
            }
        }

        // 5. Insert casualties (korban jiwa)
        if (data.casualties && data.casualties.length > 0) {
            for (const c of data.casualties) {
                await client.query(
                    `INSERT INTO assessment_casualties (assessment_id, village_id, jumlah_kk, jumlah_jiwa, keterangan, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [aId, villageMap[c.village] || null, c.jumlah_kk || 0, c.jumlah_jiwa || 0, c.keterangan || null, c.status || 'PENDING']
                );
            }
        }

        // 6. Insert steps (langkah)
        if (data.steps && data.steps.length > 0) {
            for (let i = 0; i < data.steps.length; i++) {
                const step = typeof data.steps[i] === 'string'
                    ? { langkah: data.steps[i], is_master: false }
                    : data.steps[i];
                await client.query(
                    'INSERT INTO assessment_steps (assessment_id, langkah, is_master, sort_order) VALUES ($1, $2, $3, $4)',
                    [aId, step.langkah, step.is_master || false, i]
                );
            }
        }

        // 7. Insert needs (kebutuhan)
        if (data.needs && data.needs.length > 0) {
            for (let i = 0; i < data.needs.length; i++) {
                const need = typeof data.needs[i] === 'number'
                    ? { need_item_id: data.needs[i], custom_name: null }
                    : data.needs[i];
                await client.query(
                    'INSERT INTO assessment_needs (assessment_id, need_item_id, custom_name, sort_order) VALUES ($1, $2, $3, $4)',
                    [aId, need.need_item_id || null, need.custom_name || null, i]
                );
            }
        }

        // 8. Insert situations
        if (data.situations && data.situations.length > 0) {
            for (let i = 0; i < data.situations.length; i++) {
                await client.query(
                    'INSERT INTO assessment_situations (assessment_id, situasi, sort_order) VALUES ($1, $2, $3)',
                    [aId, data.situations[i], i]
                );
            }
        }

        // 9. Insert sources
        if (data.sources && data.sources.length > 0) {
            for (let i = 0; i < data.sources.length; i++) {
                await client.query(
                    'INSERT INTO assessment_sources (assessment_id, sumber, sort_order) VALUES ($1, $2, $3)',
                    [aId, data.sources[i], i]
                );
            }
        }

        // 10. Insert recipients
        if (data.recipients && data.recipients.length > 0) {
            for (const r of data.recipients) {
                await client.query(
                    'INSERT INTO assessment_recipients (assessment_id, nomor, nama, is_default) VALUES ($1, $2, $3, $4)',
                    [aId, r.nomor, r.nama, r.is_default || false]
                );
            }
        }

        // 11. Insert photos (dokumentasi)
        if (data.photos && data.photos.length > 0) {
            for (const photo of data.photos) {
                const url = typeof photo === 'string' ? photo : photo.photo_url;
                const desc = typeof photo === 'string' ? null : (photo.description || null);
                await client.query(
                    'INSERT INTO assessment_photos (assessment_id, photo_url, description) VALUES ($1, $2, $3)',
                    [aId, url, desc]
                );
            }
        }

        await client.query('COMMIT');
        return assessment;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// ──────────────── FIND ALL ────────────────

const findAll = async (filters = {}) => {
    let sql = `
        SELECT ra.*, dt.name AS disaster_type_name,
               u.name AS created_by_name
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        LEFT JOIN users u ON ra.created_by = u.id
    `;
    const params = [];
    const conditions = [];

    if (filters.status) {
        params.push(filters.status);
        conditions.push(`ra.status = $${params.length}`);
    }
    if (filters.disaster_type_id) {
        params.push(filters.disaster_type_id);
        conditions.push(`ra.disaster_type_id = $${params.length}`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY ra.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
};

// ──────────────── FIND BY ID (full detail) ────────────────

const findById = async (id) => {
    // Main assessment
    const mainResult = await query(`
        SELECT ra.*, dt.name AS disaster_type_name,
               u.name AS created_by_name
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        LEFT JOIN users u ON ra.created_by = u.id
        WHERE ra.id = $1
    `, [id]);

    if (mainResult.rows.length === 0) return null;
    const assessment = mainResult.rows[0];

    // Villages
    const villagesResult = await query(
        'SELECT * FROM assessment_villages WHERE assessment_id = $1 ORDER BY sort_order', [id]
    );
    assessment.villages = villagesResult.rows;

    // Affected
    const affectedResult = await query(`
        SELECT aa.*, av.village_name
        FROM assessment_affected aa
        LEFT JOIN assessment_villages av ON aa.village_id = av.id
        WHERE aa.assessment_id = $1
    `, [id]);
    assessment.affected = affectedResult.rows;

    // Refugees
    const refugeesResult = await query(`
        SELECT ar.*, av.village_name
        FROM assessment_refugees ar
        LEFT JOIN assessment_villages av ON ar.village_id = av.id
        WHERE ar.assessment_id = $1
    `, [id]);
    assessment.refugees = refugeesResult.rows;

    // Casualties
    const casualtiesResult = await query(`
        SELECT ac.*, av.village_name
        FROM assessment_casualties ac
        LEFT JOIN assessment_villages av ON ac.village_id = av.id
        WHERE ac.assessment_id = $1
    `, [id]);
    assessment.casualties = casualtiesResult.rows;

    // Steps
    const stepsResult = await query(
        'SELECT * FROM assessment_steps WHERE assessment_id = $1 ORDER BY sort_order', [id]
    );
    assessment.steps = stepsResult.rows;

    // Needs (with need_item names)
    const needsResult = await query(`
        SELECT an.*, ni.name AS need_item_name, ni.unit AS need_item_unit
        FROM assessment_needs an
        LEFT JOIN need_items ni ON an.need_item_id = ni.id
        WHERE an.assessment_id = $1 ORDER BY an.sort_order
    `, [id]);
    assessment.needs = needsResult.rows;

    // Situations
    const situationsResult = await query(
        'SELECT * FROM assessment_situations WHERE assessment_id = $1 ORDER BY sort_order', [id]
    );
    assessment.situations = situationsResult.rows;

    // Sources
    const sourcesResult = await query(
        'SELECT * FROM assessment_sources WHERE assessment_id = $1 ORDER BY sort_order', [id]
    );
    assessment.sources = sourcesResult.rows;

    // Recipients
    const recipientsResult = await query(
        'SELECT * FROM assessment_recipients WHERE assessment_id = $1 ORDER BY nomor', [id]
    );
    assessment.recipients = recipientsResult.rows;

    // Photos (dokumentasi)
    const photosResult = await query(
        'SELECT * FROM assessment_photos WHERE assessment_id = $1 ORDER BY created_at', [id]
    );
    assessment.photos = photosResult.rows;

    return assessment;
};

// ──────────────── UPDATE ────────────────

const update = async (id, data) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Update main record
        const fields = [];
        const values = [];
        let paramIndex = 0;

        const updatableFields = [
            'disaster_type_id', 'province', 'regency', 'district',
            'waktu_kejadian', 'waktu_laporan', 'kronologis', 'peta_link',
            'status', 'wa_message_cache', 'report_id', 'update_type', 'last_update_time'
        ];

        for (const field of updatableFields) {
            if (data[field] !== undefined) {
                paramIndex++;
                fields.push(`${field} = $${paramIndex}`);
                values.push(data[field]);
            }
        }

        if (fields.length > 0) {
            paramIndex++;
            values.push(id);
            await client.query(
                `UPDATE rapid_assessments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );
        }

        // Delete and re-insert child records
        const childTables = [
            'assessment_villages', 'assessment_affected', 'assessment_refugees',
            'assessment_casualties', 'assessment_steps', 'assessment_needs',
            'assessment_situations', 'assessment_sources', 'assessment_recipients',
            'assessment_photos'
        ];
        for (const table of childTables) {
            await client.query(`DELETE FROM ${table} WHERE assessment_id = $1`, [id]);
        }

        // Re-insert villages
        const villageMap = {};
        if (data.villages && data.villages.length > 0) {
            for (let i = 0; i < data.villages.length; i++) {
                const vResult = await client.query(
                    'INSERT INTO assessment_villages (assessment_id, village_name, sort_order) VALUES ($1, $2, $3) RETURNING id, village_name',
                    [id, data.villages[i], i]
                );
                villageMap[data.villages[i]] = vResult.rows[0].id;
            }
        }

        // Re-insert affected
        if (data.affected && data.affected.length > 0) {
            for (const a of data.affected) {
                await client.query(
                    `INSERT INTO assessment_affected (assessment_id, village_id, jumlah_kk, jumlah_jiwa, keterangan, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [id, villageMap[a.village] || null, a.jumlah_kk || 0, a.jumlah_jiwa || 0, a.keterangan || null, a.status || 'PENDING']
                );
            }
        }

        // Re-insert refugees
        if (data.refugees && data.refugees.length > 0) {
            for (const r of data.refugees) {
                await client.query(
                    `INSERT INTO assessment_refugees (assessment_id, village_id, jumlah_kk, jumlah_jiwa, keterangan, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [id, villageMap[r.village] || null, r.jumlah_kk || 0, r.jumlah_jiwa || 0, r.keterangan || null, r.status || 'PENDING']
                );
            }
        }

        // Re-insert casualties
        if (data.casualties && data.casualties.length > 0) {
            for (const c of data.casualties) {
                await client.query(
                    `INSERT INTO assessment_casualties (assessment_id, village_id, jumlah_kk, jumlah_jiwa, keterangan, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [id, villageMap[c.village] || null, c.jumlah_kk || 0, c.jumlah_jiwa || 0, c.keterangan || null, c.status || 'PENDING']
                );
            }
        }

        // Re-insert steps
        if (data.steps && data.steps.length > 0) {
            for (let i = 0; i < data.steps.length; i++) {
                const step = typeof data.steps[i] === 'string'
                    ? { langkah: data.steps[i], is_master: false }
                    : data.steps[i];
                await client.query(
                    'INSERT INTO assessment_steps (assessment_id, langkah, is_master, sort_order) VALUES ($1, $2, $3, $4)',
                    [id, step.langkah, step.is_master || false, i]
                );
            }
        }

        // Re-insert needs
        if (data.needs && data.needs.length > 0) {
            for (let i = 0; i < data.needs.length; i++) {
                const need = typeof data.needs[i] === 'number'
                    ? { need_item_id: data.needs[i], custom_name: null }
                    : data.needs[i];
                await client.query(
                    'INSERT INTO assessment_needs (assessment_id, need_item_id, custom_name, sort_order) VALUES ($1, $2, $3, $4)',
                    [id, need.need_item_id || null, need.custom_name || null, i]
                );
            }
        }

        // Re-insert situations
        if (data.situations && data.situations.length > 0) {
            for (let i = 0; i < data.situations.length; i++) {
                await client.query(
                    'INSERT INTO assessment_situations (assessment_id, situasi, sort_order) VALUES ($1, $2, $3)',
                    [id, data.situations[i], i]
                );
            }
        }

        // Re-insert sources
        if (data.sources && data.sources.length > 0) {
            for (let i = 0; i < data.sources.length; i++) {
                await client.query(
                    'INSERT INTO assessment_sources (assessment_id, sumber, sort_order) VALUES ($1, $2, $3)',
                    [id, data.sources[i], i]
                );
            }
        }

        // Re-insert recipients
        if (data.recipients && data.recipients.length > 0) {
            for (const r of data.recipients) {
                await client.query(
                    'INSERT INTO assessment_recipients (assessment_id, nomor, nama, is_default) VALUES ($1, $2, $3, $4)',
                    [id, r.nomor, r.nama, r.is_default || false]
                );
            }
        }

        // Re-insert photos (dokumentasi)
        if (data.photos && data.photos.length > 0) {
            for (const photo of data.photos) {
                const url = typeof photo === 'string' ? photo : photo.photo_url;
                const desc = typeof photo === 'string' ? null : (photo.description || null);
                await client.query(
                    'INSERT INTO assessment_photos (assessment_id, photo_url, description) VALUES ($1, $2, $3)',
                    [id, url, desc]
                );
            }
        }

        await client.query('COMMIT');

        // Return updated assessment
        return await findById(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// ──────────────── UPDATE WA CACHE ────────────────

const updateWaCache = async (id, message) => {
    const result = await query(
        'UPDATE rapid_assessments SET wa_message_cache = $1 WHERE id = $2 RETURNING id',
        [message, id]
    );
    return result.rows[0] || null;
};

// ──────────────── UPDATE STATUS ────────────────

const updateStatus = async (id, status) => {
    const result = await query(
        'UPDATE rapid_assessments SET status = $1 WHERE id = $2 RETURNING id, status',
        [status, id]
    );
    return result.rows[0] || null;
};

// ──────────────── UPDATE PETA LINK ────────────────

const updatePetaLink = async (id, petaLink) => {
    const result = await query(
        'UPDATE rapid_assessments SET peta_link = $1 WHERE id = $2 RETURNING id, peta_link',
        [petaLink, id]
    );
    return result.rows[0] || null;
};

// ──────────────── DELETE ────────────────

const deleteById = async (id) => {
    const result = await query('DELETE FROM rapid_assessments WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
};

// ──────────────── WA SEND LOGS ────────────────

const createWaSendLog = async ({ assessment_id, phone_number, message_preview, fonnte_response, status, sent_at }) => {
    const result = await query(
        `INSERT INTO wa_send_logs (assessment_id, phone_number, message_preview, fonnte_response, status, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [assessment_id, phone_number, message_preview, fonnte_response || null, status || 'PENDING', sent_at || null]
    );
    return result.rows[0];
};

const findWaSendLogs = async (assessmentId) => {
    const result = await query(
        'SELECT * FROM wa_send_logs WHERE assessment_id = $1 ORDER BY created_at DESC',
        [assessmentId]
    );
    return result.rows;
};

module.exports = {
    create,
    findAll,
    findAllForDropdown,
    findById,
    update,
    updateWaCache,
    updateStatus,
    updatePetaLink,
    deleteById,
    createWaSendLog,
    findWaSendLogs,
};
