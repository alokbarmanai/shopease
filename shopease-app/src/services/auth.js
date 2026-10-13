// Login rules from BRD BR-01.

const crypto = require('crypto');
const { getData } = require('../data/store');
const AppError = require('./AppError');

function login(username, password) {
    if (!username || !password) {
        throw new AppError(400, 'Username and password are required');
    }

    const user = getData().users.find((u) => u.username === username);

    // Same message for "unknown user" and "wrong password" (see note below).
    if (!user || user.password !== password) {
        throw new AppError(401, 'Invalid username or password');
    }

    // Checked only AFTER the password is correct (see note below).
    if (user.locked) {
        throw new AppError(403, 'Your account is locked. Please contact support');
    }

    // Create a random session token and remember who it belongs to.
    const token = crypto.randomUUID();
    getData().sessions[token] = user.username;

    return { token, username: user.username, fullName: user.fullName };
}

function logout(token) {
    delete getData().sessions[token];
}

// Returns the username for a valid token, or null.
function getUsernameForToken(token) {
    return getData().sessions[token] || null;
}

module.exports = { login, logout, getUsernameForToken };