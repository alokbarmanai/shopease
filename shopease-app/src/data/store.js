// In-memory data store.
// All app data lives here while the server runs.
// Restarting the server resets everything to seed data (BRD §10).

const { createSeedData } = require('./seed');

let data = createSeedData();

// Always access data through this function (see note below).
function getData() {
    return data;
}

// Restore the original seed data. Used by POST /api/test/reset.
function resetData() {
    data = createSeedData();
}

module.exports = { getData, resetData };