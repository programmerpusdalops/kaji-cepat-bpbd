/**
 * CLI entry point: Run database migrations
 * Usage: node src/database/migrate.js
 */
const { runMigrations } = require('./migrationRunner');
const logger = require('../utils/logger');

// Import all migrations in order
const migrations = [
    require('./migrations/001_create_tables'),
    require('./migrations/002_add_is_active_to_users'),
    require('./migrations/003_create_master_data_tables'),
    require('./migrations/004_create_map_objects'),
    require('./migrations/005_update_map_objects_photos'),
    require('./migrations/006_create_need_items_and_team_members'),
    require('./migrations/007_create_rapid_assessment_tables'),
    require('./migrations/008_migrate_to_rapid_assessments'),
    require('./migrations/009_field_assessment_juklak'),
];

(async () => {
    try {
        await runMigrations(migrations);
        logger.info('Migration process completed.');
        process.exit(0);
    } catch (error) {
        logger.error('Migration process failed:', error.message);
        process.exit(1);
    }
})();
