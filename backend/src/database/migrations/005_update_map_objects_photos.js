const name = '005_update_map_objects_photos';
const { query } = require('../../config/database');

/**
 * Migration 005: Update map_objects for multi-photo support
 * - Change photo_path from VARCHAR(255) to TEXT (to store JSON array)
 * - Migrate existing single photo_path values into array format
 */

const up = async () => {
    // 1. Change column type to TEXT
    await query(`ALTER TABLE map_objects ALTER COLUMN photo_path TYPE TEXT`);

    // 2. Migrate existing single values to JSON array format
    await query(`
        UPDATE map_objects 
        SET photo_path = '["' || photo_path || '"]'
        WHERE photo_path IS NOT NULL 
          AND photo_path != '' 
          AND photo_path NOT LIKE '[%'
    `);

    console.log('  ✅ Migration 005: photo_path updated to TEXT (JSON array)');
};

const down = async () => {
    await query(`ALTER TABLE map_objects ALTER COLUMN photo_path TYPE VARCHAR(255)`);
    console.log('  ⬇️ Migration 005 rolled back');
};

module.exports = { name, up, down };
