import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 🔐 CSRF Protection — automatically attach the CSRF token to every request
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Also read the XSRF-TOKEN cookie (Laravel's default, used when Axios is present)
// and tell Axios to send it back as X-XSRF-TOKEN (decoded) for SPA requests.
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;
