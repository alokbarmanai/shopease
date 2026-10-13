// An error that carries an HTTP status code (see ARCHITECTURE.md §3).
// Services throw it; the server turns it into { "error": "<message>" }.

class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

module.exports = AppError;