// Login page (BR-01).

// Already logged in? Go straight to the store.
if (auth.token()) {
    window.location.href = '/products.html';
}

const form = document.getElementById('login-form');
const errorBox = document.querySelector('[data-testid="login-error"]');
const loginButton = document.querySelector('[data-testid="login-button"]');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // stay on this page; JavaScript sends the data

    errorBox.hidden = true;
    loginButton.disabled = true; // prevent double-clicks sending two logins

    try {
        const result = await api('POST', '/auth/login', {
            username: form.username.value.trim(),
            password: form.password.value, // never trim passwords: spaces can be part of them
        });
        auth.save(result);
        window.location.href = '/products.html';
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.hidden = false;
        loginButton.disabled = false;
    }
});