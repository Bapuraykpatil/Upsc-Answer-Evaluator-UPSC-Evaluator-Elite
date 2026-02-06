// // // // // // // // // // frontend/js/app.js
// // // // // // // // // // FastAPI integration for: AUTH (REAL OTP) + EVALUATION

// // // // // // // // // const FASTAPI_BASE = `http://${location.hostname}:8000/api/v1`;
// // // // // // // // // const TOKEN_KEY = "access_token";
// // // // // // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // // // // // -------------------- helpers --------------------
// // // // // // // // // async function apiRequest(path, { method = "GET", json, formData, auth = true } = {}) {
// // // // // // // // //   const headers = {};
// // // // // // // // //   let body;

// // // // // // // // //   if (json) {
// // // // // // // // //     headers["Content-Type"] = "application/json";
// // // // // // // // //     body = JSON.stringify(json);
// // // // // // // // //   }
// // // // // // // // //   if (formData) body = formData;

// // // // // // // // //   if (auth) {
// // // // // // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // // // // // //     if (token) headers["Authorization"] = `Bearer ${token}`;
// // // // // // // // //   }

// // // // // // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, { method, headers, body });
// // // // // // // // //   const text = await res.text();
// // // // // // // // //   const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

// // // // // // // // //   if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
// // // // // // // // //   return data;
// // // // // // // // // }

// // // // // // // // // function hasToken() {
// // // // // // // // //   return !!localStorage.getItem(TOKEN_KEY);
// // // // // // // // // }
// // // // // // // // // function clearToken() {
// // // // // // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // // // // // }

// // // // // // // // // function setPendingEmail(email) {
// // // // // // // // //   if (email) localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // // // // // }
// // // // // // // // // function getPendingEmail() {
// // // // // // // // //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim().toLowerCase();
// // // // // // // // // }
// // // // // // // // // function clearPendingEmail() {
// // // // // // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // // // // // }

// // // // // // // // // // -------------------- AUTH (REAL OTP) --------------------
// // // // // // // // // async function registerBackendOtp() {
// // // // // // // // //   const name = document.getElementById("nameField")?.value?.trim() || "Elite Aspirant";
// // // // // // // // //   const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
// // // // // // // // //   const password = document.getElementById("passwordField")?.value?.trim();

// // // // // // // // //   if (!name || !email || !password) throw new Error("Please complete all fields.");
// // // // // // // // //   if (!validateEmail(email)) throw new Error("Enter a valid email.");
// // // // // // // // //   if (!isStrongPassword(password)) {
// // // // // // // // //     throw new Error("Use 8+ chars with uppercase, lowercase, number, and symbol.");
// // // // // // // // //   }

// // // // // // // // //   // Call backend to send OTP
// // // // // // // // //   await apiRequest("/auth/register", { method: "POST", json: { email, password }, auth: false });

// // // // // // // // //   // Save pending email for OTP verify
// // // // // // // // //   setPendingEmail(email);

// // // // // // // // //   // Keep your UI profile working
// // // // // // // // //   localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));

// // // // // // // // //   // Open OTP modal (existing functions from index.html)
// // // // // // // // //   openOtpModal("register");
// // // // // // // // //   showOtpMessage("OTP sent to your email. Check Inbox/Spam and enter it here.", "success");
// // // // // // // // //   showAuthMessage("");
// // // // // // // // // }

// // // // // // // // // async function loginBackend() {
// // // // // // // // //   const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
// // // // // // // // //   const password = document.getElementById("passwordField")?.value?.trim();

// // // // // // // // //   if (!email || !password) throw new Error("Please enter email and password.");

// // // // // // // // //   const loginRes = await apiRequest("/auth/login", { method: "POST", json: { email, password }, auth: false });
// // // // // // // // //   localStorage.setItem(TOKEN_KEY, loginRes.access_token);

// // // // // // // // //   const me = await apiRequest("/users/me", { method: "GET", auth: true });

// // // // // // // // //   const existing = JSON.parse(localStorage.getItem(USER_KEY) || "null");
// // // // // // // // //   localStorage.setItem(USER_KEY, JSON.stringify({ name: existing?.name || "Elite Aspirant", email: me.email }));

// // // // // // // // //   showAuthMessage("Login successful. Welcome back.", "success");
// // // // // // // // //   showApp();
// // // // // // // // // }

// // // // // // // // // // OVERRIDE global functions used by index.html
// // // // // // // // // async function register() {
// // // // // // // // //   try {
// // // // // // // // //     // Ensure app doesn't auto-open due to stale token
// // // // // // // // //     clearToken();
// // // // // // // // //     await registerBackendOtp();
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showAuthMessage(e.message || "Register failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // async function login() {
// // // // // // // // //   try {
// // // // // // // // //     await loginBackend();
// // // // // // // // //   } catch (e) {
// // // // // // // // //     const msg = (e.message || "").toLowerCase();

// // // // // // // // //     // If backend blocks login due to not verified
// // // // // // // // //     if (msg.includes("not verified") || msg.includes("verify otp")) {
// // // // // // // // //       const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
// // // // // // // // //       if (email) setPendingEmail(email);
// // // // // // // // //       openOtpModal("register");
// // // // // // // // //       showOtpMessage("Email not verified. Enter OTP sent to your email.", "error");
// // // // // // // // //       showAuthMessage("Email not verified. Please verify OTP.", "error");
// // // // // // // // //       return;
// // // // // // // // //     }

// // // // // // // // //     showAuthMessage(e.message || "Login failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // async function verifyOtp() {
// // // // // // // // //   try {
// // // // // // // // //     const otp = document.getElementById("otpInput")?.value?.trim();
// // // // // // // // //     const email = getPendingEmail() || document.getElementById("emailField")?.value?.trim()?.toLowerCase();

// // // // // // // // //     if (!email) return showOtpMessage("Email missing. Go back and enter email.", "error");
// // // // // // // // //     if (!otp || otp.length !== 6) return showOtpMessage("Enter the 6-digit OTP.", "error");

// // // // // // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, otp },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // // // // //     clearPendingEmail();

// // // // // // // // //     const me = await apiRequest("/users/me", { method: "GET", auth: true });
// // // // // // // // //     const existing = JSON.parse(localStorage.getItem(USER_KEY) || "null");
// // // // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify({ name: existing?.name || "Elite Aspirant", email: me.email }));

// // // // // // // // //     showOtpMessage("OTP verified. Welcome!", "success");
// // // // // // // // //     setTimeout(() => {
// // // // // // // // //       closeOtpModal();
// // // // // // // // //       showApp();
// // // // // // // // //     }, 600);
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showOtpMessage(e.message || "OTP verification failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // async function resendOtp() {
// // // // // // // // //   try {
// // // // // // // // //     const email = getPendingEmail() || document.getElementById("emailField")?.value?.trim()?.toLowerCase();
// // // // // // // // //     const password = document.getElementById("passwordField")?.value?.trim();

// // // // // // // // //     if (!email) return showOtpMessage("Email missing. Go back and enter email.", "error");
// // // // // // // // //     if (!password) return showOtpMessage("Enter password, then click Resend OTP.", "error");

// // // // // // // // //     await apiRequest("/auth/register", { method: "POST", json: { email, password }, auth: false });
// // // // // // // // //     setPendingEmail(email);

// // // // // // // // //     showOtpMessage("New OTP sent. Check your email.", "success");
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showOtpMessage(e.message || "Resend failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // function protectPage() {
// // // // // // // // //   if (!hasToken()) {
// // // // // // // // //     showAuth("login");
// // // // // // // // //     return false;
// // // // // // // // //   }

// // // // // // // // //   showApp();

// // // // // // // // //   (async () => {
// // // // // // // // //     try {
// // // // // // // // //       const me = await apiRequest("/users/me", { method: "GET", auth: true });
// // // // // // // // //       const existing = JSON.parse(localStorage.getItem(USER_KEY) || "null");
// // // // // // // // //       localStorage.setItem(USER_KEY, JSON.stringify({ name: existing?.name || "Elite Aspirant", email: me.email }));
// // // // // // // // //       updateProfile?.();
// // // // // // // // //     } catch {
// // // // // // // // //       logout();
// // // // // // // // //     }
// // // // // // // // //   })();

// // // // // // // // //   return true;
// // // // // // // // // }

// // // // // // // // // function logout() {
// // // // // // // // //   clearToken();
// // // // // // // // //   clearPendingEmail();
// // // // // // // // //   localStorage.removeItem(USER_KEY);
// // // // // // // // //   showAuth("login");
// // // // // // // // // }

// // // // // // // // // // Expose to global (important)
// // // // // // // // // window.register = register;
// // // // // // // // // window.login = login;
// // // // // // // // // window.verifyOtp = verifyOtp;
// // // // // // // // // window.resendOtp = resendOtp;
// // // // // // // // // window.logout = logout;
// // // // // // // // // window.protectPage = protectPage;

// // // // // // // // // // -------------------- FORCE: block old simulated submit handler --------------------
// // // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // // //   // 1) Force auth form submit to use our login/register ONLY
// // // // // // // // //   const form = document.getElementById("authForm");
// // // // // // // // //   if (form) {
// // // // // // // // //     form.addEventListener(
// // // // // // // // //       "submit",
// // // // // // // // //       async (e) => {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();

// // // // // // // // //         // prevent any auto-open from old token
// // // // // // // // //         clearToken();

// // // // // // // // //         const mode = form.dataset.mode || "login";
// // // // // // // // //         if (mode === "login") await login();
// // // // // // // // //         else await register();
// // // // // // // // //       },
// // // // // // // // //       true // capture phase (runs before old handler)
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // //   // 2) Force OTP buttons
// // // // // // // // //   const verifyBtn = document.getElementById("verifyOtpBtn");
// // // // // // // // //   if (verifyBtn) {
// // // // // // // // //     verifyBtn.addEventListener(
// // // // // // // // //       "click",
// // // // // // // // //       (e) => {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         verifyOtp();
// // // // // // // // //       },
// // // // // // // // //       true
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // //   const resendBtn = document.getElementById("resendOtpBtn");
// // // // // // // // //   if (resendBtn) {
// // // // // // // // //     resendBtn.addEventListener(
// // // // // // // // //       "click",
// // // // // // // // //       (e) => {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         resendOtp();
// // // // // // // // //       },
// // // // // // // // //       true
// // // // // // // // //     );
// // // // // // // // //   }
// // // // // // // // // });
// // // // // // // // // // ===== HARD OVERRIDE: block old index.html auth handlers =====
// // // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // // //   console.log("OTP app.js loaded");

// // // // // // // // //   // Block auth form submit BEFORE it reaches old listeners
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "submit",
// // // // // // // // //     async (e) => {
// // // // // // // // //       if (e.target && e.target.id === "authForm") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();

// // // // // // // // //         // avoid auto-open due to old token
// // // // // // // // //         localStorage.removeItem("access_token");

// // // // // // // // //         const mode = e.target.dataset.mode || "login";
// // // // // // // // //         if (mode === "login") await login();
// // // // // // // // //         else await register(); // this must open OTP modal
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );

// // // // // // // // //   // Force OTP buttons to call backend verify/resend
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "click",
// // // // // // // // //     (e) => {
// // // // // // // // //       if (e.target && e.target.id === "verifyOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         verifyOtp();
// // // // // // // // //       }
// // // // // // // // //       if (e.target && e.target.id === "resendOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         resendOtp();
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );
// // // // // // // // // });
// // // // // // // // // // ===== FORCE OTP FLOW (blocks old index.html simulated submit handlers) =====
// // // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // // //   console.log("OTP app.js loaded and override active");

// // // // // // // // //   // Intercept form submit BEFORE old listeners
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "submit",
// // // // // // // // //     async (e) => {
// // // // // // // // //       if (e.target && e.target.id === "authForm") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();

// // // // // // // // //         // prevent auto-open from stale token
// // // // // // // // //         localStorage.removeItem("access_token");

// // // // // // // // //         const mode = e.target.dataset.mode || "login";
// // // // // // // // //         if (mode === "login") await login();
// // // // // // // // //         else await register(); // must open OTP modal
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );

// // // // // // // // //   // Intercept OTP buttons too
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "click",
// // // // // // // // //     (e) => {
// // // // // // // // //       if (e.target && e.target.id === "verifyOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         verifyOtp();
// // // // // // // // //       }
// // // // // // // // //       if (e.target && e.target.id === "resendOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         resendOtp();
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );
// // // // // // // // // });
// // // // // // // // // // ===== FORCE OTP FLOW (blocks old index.html simulated submit handlers) =====
// // // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // // //   console.log("OTP app.js loaded and override active");

// // // // // // // // //   // Intercept form submit BEFORE old listeners
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "submit",
// // // // // // // // //     async (e) => {
// // // // // // // // //       if (e.target && e.target.id === "authForm") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();

// // // // // // // // //         // prevent auto-open from stale token
// // // // // // // // //         localStorage.removeItem("access_token");

// // // // // // // // //         const mode = e.target.dataset.mode || "login";
// // // // // // // // //         if (mode === "login") await login();
// // // // // // // // //         else await register(); // must open OTP modal
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );

// // // // // // // // //   // Intercept OTP buttons too
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "click",
// // // // // // // // //     (e) => {
// // // // // // // // //       if (e.target && e.target.id === "verifyOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         verifyOtp();
// // // // // // // // //       }
// // // // // // // // //       if (e.target && e.target.id === "resendOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         e.stopPropagation();
// // // // // // // // //         resendOtp();
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );
// // // // // // // // // });
// // // // // // // // // frontend/js/app.js
// // // // // // // // // FASTAPI + REAL OTP + JWT AUTH (CLEAN & FINAL)
// // // // // // // // //const FASTAPI_BASE = "http://localhost:8000/api/v1";
// // // // // // // // //const FASTAPI_BASE = "http://localhost:8000/api/v1";
// // // // // // // // //const FASTAPI_BASE = "http://192.168.0.102:8000/api/v1";
// // // // // // // // //const FASTAPI_BASE = "http://192.168.0.110:8000/api/v1";
// // // // // // // // // const FASTAPI_BASE = "http://192.168.0.102:8000/api/v1";



// // // // // // // // // //const FASTAPI_BASE = `http://${location.hostname}:8000/api/v1`;
// // // // // // // // // const TOKEN_KEY = "access_token";
// // // // // // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // API HELPER
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // async function apiRequest(
// // // // // // // // //   path,
// // // // // // // // //   { method = "GET", json, formData, auth = true } = {}
// // // // // // // // // ) {
// // // // // // // // //   const headers = {};
// // // // // // // // //   let body;

// // // // // // // // //   if (json) {
// // // // // // // // //     headers["Content-Type"] = "application/json";
// // // // // // // // //     body = JSON.stringify(json);
// // // // // // // // //   }

// // // // // // // // //   if (formData) body = formData;

// // // // // // // // //   if (auth) {
// // // // // // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // // // // // //     if (token) headers["Authorization"] = `Bearer ${token}`;
// // // // // // // // //   }

// // // // // // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // // // // // // //     method,
// // // // // // // // //     headers,
// // // // // // // // //     body,
// // // // // // // // //   });

// // // // // // // // //   const text = await res.text();
// // // // // // // // //   let data = null;
// // // // // // // // //   try {
// // // // // // // // //     data = text ? JSON.parse(text) : null;
// // // // // // // // //   } catch {
// // // // // // // // //     data = text;
// // // // // // // // //   }

// // // // // // // // //   if (!res.ok) {
// // // // // // // // //     throw new Error(data?.detail || `HTTP ${res.status}`);
// // // // // // // // //   }

// // // // // // // // //   return data;
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // TOKEN / OTP HELPERS
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // function hasToken() {
// // // // // // // // //   return !!localStorage.getItem(TOKEN_KEY);
// // // // // // // // // }
// // // // // // // // // function clearToken() {
// // // // // // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // // // // // }
// // // // // // // // // function setPendingEmail(email) {
// // // // // // // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // // // // // }
// // // // // // // // // function getPendingEmail() {
// // // // // // // // //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "")
// // // // // // // // //     .trim()
// // // // // // // // //     .toLowerCase();
// // // // // // // // // }
// // // // // // // // // function clearPendingEmail() {
// // // // // // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // AUTH : REGISTER (SEND OTP)
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // async function register() {
// // // // // // // // //   try {
// // // // // // // // //     clearToken();

// // // // // // // // //     const name =
// // // // // // // // //       document.getElementById("nameField")?.value?.trim() ||
// // // // // // // // //       "Elite Aspirant";
// // // // // // // // //     const email = document
// // // // // // // // //       .getElementById("emailField")
// // // // // // // // //       ?.value?.trim()
// // // // // // // // //       ?.toLowerCase();
// // // // // // // // //     const password =
// // // // // // // // //       document.getElementById("passwordField")?.value?.trim();

// // // // // // // // //     if (!email || !password)
// // // // // // // // //       throw new Error("Please fill all required fields.");
// // // // // // // // //     if (!validateEmail(email))
// // // // // // // // //       throw new Error("Enter a valid email address.");
// // // // // // // // //     if (!isStrongPassword(password))
// // // // // // // // //       throw new Error(
// // // // // // // // //         "Password must be 8+ chars with upper, lower, number & symbol."
// // // // // // // // //       );

// // // // // // // // //     await apiRequest("/auth/register", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, password },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     setPendingEmail(email);
// // // // // // // // //     localStorage.setItem(
// // // // // // // // //       USER_KEY,
// // // // // // // // //       JSON.stringify({ name, email })
// // // // // // // // //     );

// // // // // // // // //     openOtpModal("register");
// // // // // // // // //     showOtpMessage(
// // // // // // // // //       "OTP sent to your email. Check inbox / spam.",
// // // // // // // // //       "success"
// // // // // // // // //     );
// // // // // // // // //     showAuthMessage("");
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showAuthMessage(e.message || "Registration failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // AUTH : LOGIN
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // async function login() {
// // // // // // // // //   try {
// // // // // // // // //     const email = document
// // // // // // // // //       .getElementById("emailField")
// // // // // // // // //       ?.value?.trim()
// // // // // // // // //       ?.toLowerCase();
// // // // // // // // //     const password =
// // // // // // // // //       document.getElementById("passwordField")?.value?.trim();

// // // // // // // // //     if (!email || !password)
// // // // // // // // //       throw new Error("Enter email and password.");

// // // // // // // // //     const res = await apiRequest("/auth/login", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, password },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);

// // // // // // // // //     const me = await apiRequest("/users/me", { auth: true });
// // // // // // // // //     localStorage.setItem(
// // // // // // // // //       USER_KEY,
// // // // // // // // //       JSON.stringify({ name: "Elite Aspirant", email: me.email })
// // // // // // // // //     );

// // // // // // // // //     showAuthMessage("Login successful.", "success");
// // // // // // // // //     showApp();
// // // // // // // // //   } catch (e) {
// // // // // // // // //     const msg = (e.message || "").toLowerCase();

// // // // // // // // //     if (msg.includes("verify") || msg.includes("otp")) {
// // // // // // // // //       setPendingEmail(
// // // // // // // // //         document
// // // // // // // // //           .getElementById("emailField")
// // // // // // // // //           ?.value?.trim()
// // // // // // // // //           ?.toLowerCase()
// // // // // // // // //       );
// // // // // // // // //       openOtpModal("register");
// // // // // // // // //       showOtpMessage("Please verify OTP.", "error");
// // // // // // // // //       return;
// // // // // // // // //     }

// // // // // // // // //     showAuthMessage(e.message || "Login failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // OTP VERIFY
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // async function verifyOtp() {
// // // // // // // // //   try {
// // // // // // // // //     const otp = document.getElementById("otpInput")?.value?.trim();
// // // // // // // // //     const email =
// // // // // // // // //       getPendingEmail() ||
// // // // // // // // //       document
// // // // // // // // //         .getElementById("emailField")
// // // // // // // // //         ?.value?.trim()
// // // // // // // // //         ?.toLowerCase();

// // // // // // // // //     if (!otp || otp.length !== 6)
// // // // // // // // //       throw new Error("Enter 6-digit OTP.");
// // // // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, otp },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // // // // //     clearPendingEmail();

// // // // // // // // //     const me = await apiRequest("/users/me", { auth: true });
// // // // // // // // //     localStorage.setItem(
// // // // // // // // //       USER_KEY,
// // // // // // // // //       JSON.stringify({ name: "Elite Aspirant", email: me.email })
// // // // // // // // //     );

// // // // // // // // //     showOtpMessage("OTP verified successfully.", "success");
// // // // // // // // //     setTimeout(() => {
// // // // // // // // //       closeOtpModal();
// // // // // // // // //       showApp();
// // // // // // // // //     }, 600);
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showOtpMessage(e.message || "OTP verification failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // RESEND OTP (CORRECT API)
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // async function resendOtp() {
// // // // // // // // //   try {
// // // // // // // // //     const email = getPendingEmail();
// // // // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // // // //     await apiRequest("/auth/resend-otp", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     showOtpMessage("OTP resent to your email.", "success");
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showOtpMessage(e.message || "Resend failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // PROTECT ROUTE
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // function protectPage() {
// // // // // // // // //   if (!hasToken()) {
// // // // // // // // //     showAuth("login");
// // // // // // // // //     return false;
// // // // // // // // //   }

// // // // // // // // //   showApp();

// // // // // // // // //   (async () => {
// // // // // // // // //     try {
// // // // // // // // //       const me = await apiRequest("/users/me", { auth: true });
// // // // // // // // //       localStorage.setItem(
// // // // // // // // //         USER_KEY,
// // // // // // // // //         JSON.stringify({ name: "Elite Aspirant", email: me.email })
// // // // // // // // //       );
// // // // // // // // //       updateProfile?.();
// // // // // // // // //     } catch {
// // // // // // // // //       logout();
// // // // // // // // //     }
// // // // // // // // //   })();

// // // // // // // // //   return true;
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // LOGOUT
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // function logout() {
// // // // // // // // //   clearToken();
// // // // // // // // //   clearPendingEmail();
// // // // // // // // //   localStorage.removeItem(USER_KEY);
// // // // // // // // //   showAuth("login");
// // // // // // // // // }

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // GLOBAL EXPORTS (IMPORTANT)
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // window.register = register;
// // // // // // // // // window.login = login;
// // // // // // // // // window.verifyOtp = verifyOtp;
// // // // // // // // // window.resendOtp = resendOtp;
// // // // // // // // // window.logout = logout;
// // // // // // // // // window.protectPage = protectPage;

// // // // // // // // // // -------------------------------------------------
// // // // // // // // // // HARD OVERRIDE OF OLD index.html HANDLERS
// // // // // // // // // // -------------------------------------------------
// // // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // // //   console.log("FastAPI OTP auth active");

// // // // // // // // //   // Intercept auth form submit (capture phase)
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "submit",
// // // // // // // // //     async (e) => {
// // // // // // // // //       if (e.target?.id !== "authForm") return;

// // // // // // // // //       e.preventDefault();
// // // // // // // // //       e.stopImmediatePropagation();

// // // // // // // // //       clearToken();

// // // // // // // // //       const mode = e.target.dataset.mode || "login";
// // // // // // // // //       if (mode === "login") await login();
// // // // // // // // //       else await register();
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );

// // // // // // // // //   // Intercept OTP buttons
// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "click",
// // // // // // // // //     (e) => {
// // // // // // // // //       if (e.target?.id === "verifyOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         verifyOtp();
// // // // // // // // //       }

// // // // // // // // //       if (e.target?.id === "resendOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         e.stopImmediatePropagation();
// // // // // // // // //         resendOtp();
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );
// // // // // // // // // });
// // // // // // // // // ===============================
// // // // // // // // // CONFIG
// // // // // // // // // ===============================
// // // // // // // // // const FASTAPI_BASE = "http://192.168.0.102:8000/api/v1";
// // // // // // // // // const TOKEN_KEY = "access_token";
// // // // // // // // // const USER_KEY = "user_profile";
// // // // // // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // // // // // ===============================
// // // // // // // // // // API HELPER
// // // // // // // // // // ===============================
// // // // // // // // // async function apiRequest(
// // // // // // // // //   path,
// // // // // // // // //   { method = "GET", json, formData, auth = true } = {}
// // // // // // // // // ) {
// // // // // // // // //   const headers = {};
// // // // // // // // //   let body;

// // // // // // // // //   if (json) {
// // // // // // // // //     headers["Content-Type"] = "application/json";
// // // // // // // // //     body = JSON.stringify(json);
// // // // // // // // //   }

// // // // // // // // //   if (formData) body = formData;

// // // // // // // // //   if (auth) {
// // // // // // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // // // // // //     if (token) headers["Authorization"] = `Bearer ${token}`;
// // // // // // // // //   }

// // // // // // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // // // // // // //     method,
// // // // // // // // //     headers,
// // // // // // // // //     body,
// // // // // // // // //   });

// // // // // // // // //   const text = await res.text();
// // // // // // // // //   let data = null;
// // // // // // // // //   try {
// // // // // // // // //     data = text ? JSON.parse(text) : null;
// // // // // // // // //   } catch {
// // // // // // // // //     data = text;
// // // // // // // // //   }

// // // // // // // // //   if (!res.ok) {
// // // // // // // // //     throw new Error(data?.detail || `HTTP ${res.status}`);
// // // // // // // // //   }

// // // // // // // // //   return data;
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // TOKEN / OTP HELPERS
// // // // // // // // // // ===============================
// // // // // // // // // function clearToken() {
// // // // // // // // //   localStorage.removeItem("access_token");
// // // // // // // // // }

// // // // // // // // // function clearToken() {
// // // // // // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // // // // // }

// // // // // // // // // function setPendingEmail(email) {
// // // // // // // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // // // // // }
// // // // // // // // // function getPendingEmail() {
// // // // // // // // //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim();
// // // // // // // // // }
// // // // // // // // // function clearPendingEmail() {
// // // // // // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // REGISTER → SEND OTP (NO LOGIN)
// // // // // // // // // // ===============================
// // // // // // // // // async function register() {
// // // // // // // // //   try {
// // // // // // // // //     clearToken();

// // // // // // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // // // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // // // // // //     if (!email || !password) throw new Error("Fill all fields.");

// // // // // // // // //     await apiRequest("/auth/register", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, password },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     setPendingEmail(email);

// // // // // // // // //     openOtpModal("register");
// // // // // // // // //     showOtpMessage("OTP sent to your email.", "success");
// // // // // // // // //     showAuthMessage("");
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showAuthMessage(e.message || "Register failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // LOGIN (BLOCK IF OTP NOT VERIFIED)
// // // // // // // // // // ===============================
// // // // // // // // // async function login() {
// // // // // // // // //   try {
// // // // // // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // // // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // // // // // //     if (!email || !password) throw new Error("Enter email & password.");

// // // // // // // // //     const res = await apiRequest("/auth/login", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, password },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     // ✅ LOGIN ONLY HERE
// // // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);

// // // // // // // // //     const me = await apiRequest("/users/me", { auth: true });
// // // // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // // // // //     showAuthMessage("Login successful", "success");
// // // // // // // // //     showApp();
// // // // // // // // //   } catch (e) {
// // // // // // // // //     const msg = (e.message || "").toLowerCase();

// // // // // // // // //     if (msg.includes("verify") || msg.includes("otp")) {
// // // // // // // // //       setPendingEmail(
// // // // // // // // //         document.getElementById("emailField").value.trim().toLowerCase()
// // // // // // // // //       );
// // // // // // // // //       openOtpModal("register");
// // // // // // // // //       showOtpMessage("Verify OTP to continue.", "error");
// // // // // // // // //       return;
// // // // // // // // //     }

// // // // // // // // //     showAuthMessage(e.message || "Login failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // VERIFY OTP → ISSUE TOKEN
// // // // // // // // // // ===============================
// // // // // // // // // async function verifyOtp() {
// // // // // // // // //   try {
// // // // // // // // //     const otp = document.getElementById("otpInput").value.trim();
// // // // // // // // //     const email = getPendingEmail();

// // // // // // // // //     if (!otp || otp.length !== 6) throw new Error("Enter valid OTP.");
// // // // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email, otp },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     // ✅ LOGIN ONLY AFTER OTP
// // // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // // // // //     clearPendingEmail();

// // // // // // // // //     const me = await apiRequest("/users/me", { auth: true });
// // // // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // // // // //     showOtpMessage("OTP verified. Logging in...", "success");
// // // // // // // // //     setTimeout(() => {
// // // // // // // // //       closeOtpModal();
// // // // // // // // //       showApp();
// // // // // // // // //     }, 500);
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showOtpMessage(e.message || "OTP verification failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // RESEND OTP
// // // // // // // // // // ===============================
// // // // // // // // // async function resendOtp() {
// // // // // // // // //   try {
// // // // // // // // //     const email = getPendingEmail();
// // // // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // // // //     await apiRequest("/auth/resend-otp", {
// // // // // // // // //       method: "POST",
// // // // // // // // //       json: { email },
// // // // // // // // //       auth: false,
// // // // // // // // //     });

// // // // // // // // //     showOtpMessage("OTP resent.", "success");
// // // // // // // // //   } catch (e) {
// // // // // // // // //     showOtpMessage(e.message || "Resend failed", "error");
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // LOGOUT
// // // // // // // // // // ===============================
// // // // // // // // // function logout() {
// // // // // // // // //   clearToken();
// // // // // // // // //   clearPendingEmail();
// // // // // // // // //   localStorage.removeItem(USER_KEY);
// // // // // // // // //   showAuth("login");
// // // // // // // // // }

// // // // // // // // // // ===============================
// // // // // // // // // // GLOBAL EXPORTS
// // // // // // // // // // ===============================
// // // // // // // // // window.register = register;
// // // // // // // // // window.login = login;
// // // // // // // // // window.verifyOtp = verifyOtp;
// // // // // // // // // window.resendOtp = resendOtp;
// // // // // // // // // window.logout = logout;

// // // // // // // // // // ===============================
// // // // // // // // // // OVERRIDE OLD HANDLERS
// // // // // // // // // // ===============================
// // // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // // //   console.log("FastAPI OTP auth active");

// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "submit",
// // // // // // // // //     async (e) => {
// // // // // // // // //       if (e.target?.id !== "authForm") return;
// // // // // // // // //       e.preventDefault();
// // // // // // // // //       e.stopImmediatePropagation();

// // // // // // // // //       clearToken();

// // // // // // // // //       const mode = e.target.dataset.mode || "login";
// // // // // // // // //       if (mode === "login") await login();
// // // // // // // // //       else await register();
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );

// // // // // // // // //   document.addEventListener(
// // // // // // // // //     "click",
// // // // // // // // //     (e) => {
// // // // // // // // //       if (e.target?.id === "verifyOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         verifyOtp();
// // // // // // // // //       }
// // // // // // // // //       if (e.target?.id === "resendOtpBtn") {
// // // // // // // // //         e.preventDefault();
// // // // // // // // //         resendOtp();
// // // // // // // // //       }
// // // // // // // // //     },
// // // // // // // // //     true
// // // // // // // // //   );
// // // // // // // // // });
// // // // // // // // // ===============================
// // // // // // // // // CONFIG
// // // // // // // // // ===============================
// // // // // // // // const FASTAPI_BASE = "http://192.168.0.102:8000/api/v1";
// // // // // // // // const TOKEN_KEY = "access_token";
// // // // // // // // const USER_KEY = "user_profile";
// // // // // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // // // // ===============================
// // // // // // // // // API HELPER
// // // // // // // // // ===============================
// // // // // // // // async function apiRequest(
// // // // // // // //   path,
// // // // // // // //   { method = "GET", json, formData, auth = true } = {}
// // // // // // // // ) {
// // // // // // // //   const headers = {};
// // // // // // // //   let body;

// // // // // // // //   if (json) {
// // // // // // // //     headers["Content-Type"] = "application/json";
// // // // // // // //     body = JSON.stringify(json);
// // // // // // // //   }

// // // // // // // //   if (formData) body = formData;

// // // // // // // //   if (auth) {
// // // // // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // // // // //     if (token) headers["Authorization"] = `Bearer ${token}`;
// // // // // // // //   }

// // // // // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // // // // // //     method,
// // // // // // // //     headers,
// // // // // // // //     body,
// // // // // // // //   });

// // // // // // // //   const text = await res.text();
// // // // // // // //   let data;
// // // // // // // //   try {
// // // // // // // //     data = text ? JSON.parse(text) : null;
// // // // // // // //   } catch {
// // // // // // // //     data = text;
// // // // // // // //   }

// // // // // // // //   if (!res.ok) {
// // // // // // // //     throw new Error(data?.detail || `HTTP ${res.status}`);
// // // // // // // //   }

// // // // // // // //   return data;
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // TOKEN / OTP HELPERS
// // // // // // // // // ===============================
// // // // // // // // function clearToken() {
// // // // // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // // // // }

// // // // // // // // function setPendingEmail(email) {
// // // // // // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // // // // }

// // // // // // // // function getPendingEmail() {
// // // // // // // //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim();
// // // // // // // // }

// // // // // // // // function clearPendingEmail() {
// // // // // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // REGISTER → SEND OTP (NO LOGIN)
// // // // // // // // // ===============================
// // // // // // // // async function register() {
// // // // // // // //   try {
// // // // // // // //     clearToken();

// // // // // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // // // // //     if (!email || !password) throw new Error("Fill all fields.");

// // // // // // // //     await apiRequest("/auth/register", {
// // // // // // // //       method: "POST",
// // // // // // // //       json: { email, password },
// // // // // // // //       auth: false,
// // // // // // // //     });

// // // // // // // //     setPendingEmail(email);

// // // // // // // //     openOtpModal("register");
// // // // // // // //     showOtpMessage("OTP sent to your email.", "success");
// // // // // // // //     showAuthMessage("");
// // // // // // // //   } catch (e) {
// // // // // // // //     showAuthMessage(e.message || "Register failed", "error");
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // LOGIN (BLOCK IF OTP NOT VERIFIED)
// // // // // // // // // ===============================
// // // // // // // // async function login() {
// // // // // // // //   try {
// // // // // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // // // // //     if (!email || !password) throw new Error("Enter email & password.");

// // // // // // // //     const res = await apiRequest("/auth/login", {
// // // // // // // //       method: "POST",
// // // // // // // //       json: { email, password },
// // // // // // // //       auth: false,
// // // // // // // //     });

// // // // // // // //     // ✅ LOGIN ONLY HERE
// // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);

// // // // // // // //     const me = await apiRequest("/users/me", { auth: true });
// // // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // // // //     showAuthMessage("Login successful", "success");
// // // // // // // //     showApp();
// // // // // // // //   } catch (e) {
// // // // // // // //     const msg = (e.message || "").toLowerCase();

// // // // // // // //     if (msg.includes("verify") || msg.includes("otp")) {
// // // // // // // //       setPendingEmail(
// // // // // // // //         document.getElementById("emailField").value.trim().toLowerCase()
// // // // // // // //       );
// // // // // // // //       openOtpModal("register");
// // // // // // // //       showOtpMessage("Verify OTP to continue.", "error");
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     showAuthMessage(e.message || "Login failed", "error");
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // VERIFY OTP → ISSUE TOKEN
// // // // // // // // // ===============================
// // // // // // // // async function verifyOtp() {
// // // // // // // //   try {
// // // // // // // //     const otp = document.getElementById("otpInput").value.trim();
// // // // // // // //     const email = getPendingEmail();

// // // // // // // //     if (!otp || otp.length !== 6) throw new Error("Enter valid OTP.");
// // // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // // // // //       method: "POST",
// // // // // // // //       json: { email, otp },
// // // // // // // //       auth: false,
// // // // // // // //     });

// // // // // // // //     // ✅ LOGIN ONLY AFTER OTP
// // // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // // // //     clearPendingEmail();

// // // // // // // //     const me = await apiRequest("/users/me", { auth: true });
// // // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // // // //     showOtpMessage("OTP verified. Logging in...", "success");
// // // // // // // //     setTimeout(() => {
// // // // // // // //       closeOtpModal();
// // // // // // // //       showApp();
// // // // // // // //     }, 500);
// // // // // // // //   } catch (e) {
// // // // // // // //     showOtpMessage(e.message || "OTP verification failed", "error");
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // RESEND OTP
// // // // // // // // // ===============================
// // // // // // // // async function resendOtp() {
// // // // // // // //   try {
// // // // // // // //     const email = getPendingEmail();
// // // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // // //     await apiRequest("/auth/resend-otp", {
// // // // // // // //       method: "POST",
// // // // // // // //       json: { email },
// // // // // // // //       auth: false,
// // // // // // // //     });

// // // // // // // //     showOtpMessage("OTP resent.", "success");
// // // // // // // //   } catch (e) {
// // // // // // // //     showOtpMessage(e.message || "Resend failed", "error");
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // LOGOUT
// // // // // // // // // ===============================
// // // // // // // // function logout() {
// // // // // // // //   clearToken();
// // // // // // // //   clearPendingEmail();
// // // // // // // //   localStorage.removeItem(USER_KEY);
// // // // // // // //   showAuth("login");
// // // // // // // // }

// // // // // // // // // ===============================
// // // // // // // // // GLOBAL EXPORTS
// // // // // // // // // ===============================
// // // // // // // // window.register = register;
// // // // // // // // window.login = login;
// // // // // // // // window.verifyOtp = verifyOtp;
// // // // // // // // window.resendOtp = resendOtp;
// // // // // // // // window.logout = logout;

// // // // // // // // // ===============================
// // // // // // // // // OVERRIDE OLD HANDLERS
// // // // // // // // // ===============================
// // // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // // //   console.log("FastAPI OTP auth active");

// // // // // // // //   document.addEventListener(
// // // // // // // //     "submit",
// // // // // // // //     async (e) => {
// // // // // // // //       if (e.target?.id !== "authForm") return;
// // // // // // // //       e.preventDefault();
// // // // // // // //       e.stopImmediatePropagation();

// // // // // // // //       clearToken();

// // // // // // // //       const mode = e.target.dataset.mode || "login";
// // // // // // // //       if (mode === "login") await login();
// // // // // // // //       else await register();
// // // // // // // //     },
// // // // // // // //     true
// // // // // // // //   );

// // // // // // // //   document.addEventListener(
// // // // // // // //     "click",
// // // // // // // //     (e) => {
// // // // // // // //       if (e.target?.id === "verifyOtpBtn") {
// // // // // // // //         e.preventDefault();
// // // // // // // //         verifyOtp();
// // // // // // // //       }
// // // // // // // //       if (e.target?.id === "resendOtpBtn") {
// // // // // // // //         e.preventDefault();
// // // // // // // //         resendOtp();
// // // // // // // //       }
// // // // // // // //     },
// // // // // // // //     true
// // // // // // // //   );
// // // // // // // // });
// // // // // // // /*********************************************************
// // // // // // //  * CONFIG
// // // // // // //  *********************************************************/
// // // // // // // const FASTAPI_BASE = "http://192.168.0.102:8000/api/v1";

// // // // // // // const TOKEN_KEY = "access_token";
// // // // // // // const USER_KEY = "user_profile";
// // // // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // // /*********************************************************
// // // // // // //  * API HELPER
// // // // // // //  *********************************************************/
// // // // // // // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// // // // // // //   const headers = {};

// // // // // // //   if (json) headers["Content-Type"] = "application/json";

// // // // // // //   if (auth) {
// // // // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // // // //     if (token) headers["Authorization"] = `Bearer ${token}`;
// // // // // // //   }

// // // // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // // // // //     method,
// // // // // // //     headers,
// // // // // // //     body: json ? JSON.stringify(json) : undefined,
// // // // // // //   });

// // // // // // //   const text = await res.text();
// // // // // // //   let data = null;
// // // // // // //   try {
// // // // // // //     data = text ? JSON.parse(text) : null;
// // // // // // //   } catch {
// // // // // // //     data = text;
// // // // // // //   }

// // // // // // //   if (!res.ok) {
// // // // // // //     throw new Error(data?.detail || `HTTP ${res.status}`);
// // // // // // //   }

// // // // // // //   return data;
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * TOKEN / OTP HELPERS
// // // // // // //  *********************************************************/
// // // // // // // function clearToken() {
// // // // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // // // }

// // // // // // // function setPendingEmail(email) {
// // // // // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // // // }

// // // // // // // function getPendingEmail() {
// // // // // // //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim().toLowerCase();
// // // // // // // }

// // // // // // // function clearPendingEmail() {
// // // // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * REGISTER → SEND OTP ONLY
// // // // // // //  *********************************************************/
// // // // // // // async function register() {
// // // // // // //   try {
// // // // // // //     clearToken();

// // // // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // // // //     if (!email || !password) throw new Error("Fill all fields.");

// // // // // // //     await apiRequest("/auth/register", {
// // // // // // //       method: "POST",
// // // // // // //       json: { email, password },
// // // // // // //       auth: false,
// // // // // // //     });

// // // // // // //     setPendingEmail(email);
// // // // // // //     openOtpModal("register");
// // // // // // //     showOtpMessage("OTP sent to your email.", "success");
// // // // // // //     showAuthMessage("");
// // // // // // //   } catch (e) {
// // // // // // //     showAuthMessage(e.message, "error");
// // // // // // //   }
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * LOGIN (BLOCKED UNTIL OTP VERIFIED)
// // // // // // //  *********************************************************/
// // // // // // // async function login() {
// // // // // // //   try {
// // // // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // // // //     if (!email || !password) throw new Error("Enter email and password.");

// // // // // // //     const res = await apiRequest("/auth/login", {
// // // // // // //       method: "POST",
// // // // // // //       json: { email, password },
// // // // // // //       auth: false,
// // // // // // //     });

// // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);

// // // // // // //     const me = await apiRequest("/users/me");
// // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // // //     showAuthMessage("Login successful", "success");
// // // // // // //     showApp();
// // // // // // //   } catch (e) {
// // // // // // //     if (e.message.toLowerCase().includes("otp")) {
// // // // // // //       setPendingEmail(
// // // // // // //         document.getElementById("emailField").value.trim().toLowerCase()
// // // // // // //       );
// // // // // // //       openOtpModal("register");
// // // // // // //       showOtpMessage("Please verify OTP.", "error");
// // // // // // //       return;
// // // // // // //     }
// // // // // // //     showAuthMessage(e.message, "error");
// // // // // // //   }
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * VERIFY OTP → ISSUE TOKEN
// // // // // // //  *********************************************************/
// // // // // // // async function verifyOtp() {
// // // // // // //   try {
// // // // // // //     const otp = document.getElementById("otpInput").value.trim();
// // // // // // //     const email = getPendingEmail();

// // // // // // //     if (!otp || otp.length !== 6) throw new Error("Enter valid OTP.");
// // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // // // //       method: "POST",
// // // // // // //       json: { email, otp },
// // // // // // //       auth: false,
// // // // // // //     });

// // // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // // //     clearPendingEmail();

// // // // // // //     const me = await apiRequest("/users/me");
// // // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // // //     showOtpMessage("OTP verified. Logging in...", "success");
// // // // // // //     setTimeout(() => {
// // // // // // //       closeOtpModal();
// // // // // // //       showApp();
// // // // // // //     }, 500);
// // // // // // //   } catch (e) {
// // // // // // //     showOtpMessage(e.message, "error");
// // // // // // //   }
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * RESEND OTP
// // // // // // //  *********************************************************/
// // // // // // // async function resendOtp() {
// // // // // // //   try {
// // // // // // //     const email = getPendingEmail();
// // // // // // //     if (!email) throw new Error("Email missing.");

// // // // // // //     await apiRequest("/auth/resend-otp", {
// // // // // // //       method: "POST",
// // // // // // //       json: { email },
// // // // // // //       auth: false,
// // // // // // //     });

// // // // // // //     showOtpMessage("OTP resent.", "success");
// // // // // // //   } catch (e) {
// // // // // // //     showOtpMessage(e.message, "error");
// // // // // // //   }
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * LOGOUT
// // // // // // //  *********************************************************/
// // // // // // // function logout() {
// // // // // // //   clearToken();
// // // // // // //   clearPendingEmail();
// // // // // // //   localStorage.removeItem(USER_KEY);
// // // // // // //   showAuth("login");
// // // // // // // }

// // // // // // // /*********************************************************
// // // // // // //  * EXPORTS
// // // // // // //  *********************************************************/
// // // // // // // window.register = register;
// // // // // // // window.login = login;
// // // // // // // window.verifyOtp = verifyOtp;
// // // // // // // window.resendOtp = resendOtp;
// // // // // // // window.logout = logout;

// // // // // // // /*********************************************************
// // // // // // //  * FORM INTERCEPT (IMPORTANT)
// // // // // // //  *********************************************************/
// // // // // // // window.addEventListener("DOMContentLoaded", () => {
// // // // // // //   console.log("FastAPI OTP auth active");

// // // // // // //   document.addEventListener(
// // // // // // //     "submit",
// // // // // // //     async (e) => {
// // // // // // //       if (e.target?.id !== "authForm") return;
// // // // // // //       e.preventDefault();
// // // // // // //       e.stopImmediatePropagation();

// // // // // // //       clearToken();
// // // // // // //       const mode = e.target.dataset.mode || "login";
// // // // // // //       if (mode === "login") await login();
// // // // // // //       else await register();
// // // // // // //     },
// // // // // // //     true
// // // // // // //   );

// // // // // // //   document.addEventListener(
// // // // // // //     "click",
// // // // // // //     (e) => {
// // // // // // //       if (e.target?.id === "verifyOtpBtn") {
// // // // // // //         e.preventDefault();
// // // // // // //         verifyOtp();
// // // // // // //       }
// // // // // // //       if (e.target?.id === "resendOtpBtn") {
// // // // // // //         e.preventDefault();
// // // // // // //         resendOtp();
// // // // // // //       }
// // // // // // //     },
// // // // // // //     true
// // // // // // //   );
// // // // // // // });
// // // // // // /**************** CONFIG ****************/
// // // // // // const FASTAPI_BASE = "http://192.168.0.102:8000/api/v1";

// // // // // // const TOKEN_KEY = "access_token";
// // // // // // const USER_KEY = "user_profile";
// // // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // /**************** HELPERS ****************/
// // // // // // function clearToken() {
// // // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // // }

// // // // // // function setPendingEmail(email) {
// // // // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // // }

// // // // // // function getPendingEmail() {
// // // // // //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim().toLowerCase();
// // // // // // }

// // // // // // function clearPendingEmail() {
// // // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // // }

// // // // // // /**************** API ****************/
// // // // // // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// // // // // //   const headers = { "Content-Type": "application/json" };

// // // // // //   if (auth) {
// // // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // // //     if (token) headers.Authorization = `Bearer ${token}`;
// // // // // //   }

// // // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // // // //     method,
// // // // // //     headers,
// // // // // //     body: json ? JSON.stringify(json) : null,
// // // // // //   });

// // // // // //   const data = await res.json().catch(() => ({}));

// // // // // //   if (!res.ok) {
// // // // // //     throw new Error(data.detail || "Request failed");
// // // // // //   }

// // // // // //   return data;
// // // // // // }

// // // // // // /**************** REGISTER ****************/
// // // // // // async function register() {
// // // // // //   try {
// // // // // //     clearToken();

// // // // // //     const email = emailField.value.trim().toLowerCase();
// // // // // //     const password = passwordField.value.trim();

// // // // // //     if (!email || !password) throw new Error("Fill all fields");

// // // // // //     await apiRequest("/auth/register", {
// // // // // //       method: "POST",
// // // // // //       json: { email, password },
// // // // // //       auth: false,
// // // // // //     });

// // // // // //     setPendingEmail(email);
// // // // // //     openOtpModal("register");
// // // // // //     showOtpMessage("OTP sent to your email", "success");
// // // // // //   } catch (e) {
// // // // // //     showAuthMessage(e.message, "error");
// // // // // //   }
// // // // // // }

// // // // // // /**************** LOGIN ****************/
// // // // // // async function login() {
// // // // // //   try {
// // // // // //     const email = emailField.value.trim().toLowerCase();
// // // // // //     const password = passwordField.value.trim();

// // // // // //     const res = await apiRequest("/auth/login", {
// // // // // //       method: "POST",
// // // // // //       json: { email, password },
// // // // // //       auth: false,
// // // // // //     });

// // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // //     const me = await apiRequest("/users/me");
// // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // //     showApp();
// // // // // //   } catch (e) {
// // // // // //     if (e.message.toLowerCase().includes("otp")) {
// // // // // //       setPendingEmail(emailField.value.trim().toLowerCase());
// // // // // //       openOtpModal("register");
// // // // // //       showOtpMessage("Verify OTP first", "error");
// // // // // //       return;
// // // // // //     }
// // // // // //     showAuthMessage(e.message, "error");
// // // // // //   }
// // // // // // }

// // // // // // /**************** VERIFY OTP ****************/
// // // // // // async function verifyOtp() {
// // // // // //   try {
// // // // // //     const otp = otpInput.value.trim();
// // // // // //     const email = getPendingEmail();

// // // // // //     if (!otp || otp.length !== 6) throw new Error("Invalid OTP");

// // // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // // //       method: "POST",
// // // // // //       json: { email, otp },
// // // // // //       auth: false,
// // // // // //     });

// // // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // // //     clearPendingEmail();

// // // // // //     const me = await apiRequest("/users/me");
// // // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // // // // //     closeOtpModal();
// // // // // //     showApp();
// // // // // //   } catch (e) {
// // // // // //     showOtpMessage(e.message, "error");
// // // // // //   }
// // // // // // }

// // // // // // /**************** RESEND OTP ****************/
// // // // // // async function resendOtp() {
// // // // // //   const email = getPendingEmail();
// // // // // //   if (!email) return;

// // // // // //   await apiRequest("/auth/resend-otp", {
// // // // // //     method: "POST",
// // // // // //     json: { email },
// // // // // //     auth: false,
// // // // // //   });

// // // // // //   showOtpMessage("OTP resent", "success");
// // // // // // }

// // // // // // /**************** LOGOUT ****************/
// // // // // // function logout() {
// // // // // //   clearToken();
// // // // // //   clearPendingEmail();
// // // // // //   localStorage.removeItem(USER_KEY);
// // // // // //   showAuth("login");
// // // // // // }

// // // // // // /**************** GLOBAL EXPORTS ****************/
// // // // // // window.register = register;
// // // // // // window.login = login;
// // // // // // window.verifyOtp = verifyOtp;
// // // // // // window.resendOtp = resendOtp;
// // // // // // window.logout = logout;
// // // // // // window.clearToken = clearToken;

// // // // // // /**************** FORM OVERRIDE ****************/
// // // // // // document.addEventListener("submit", (e) => {
// // // // // //   if (e.target?.id !== "authForm") return;
// // // // // //   e.preventDefault();

// // // // // //   const mode = e.target.dataset.mode || "login";
// // // // // //   mode === "login" ? login() : register();
// // // // // // });
// // // // // // ===============================
// // // // // // CONFIG
// // // // // // ===============================
// // // // // const FASTAPI_BASE = "http://192.168.0.107:8000/api/v1";
// // // // // const TOKEN_KEY = "access_token";
// // // // // const USER_KEY = "user_profile";
// // // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // // // ===============================
// // // // // // API HELPER
// // // // // // ===============================
// // // // // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// // // // //   const headers = { "Content-Type": "application/json" };

// // // // //   if (auth) {
// // // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // // //     if (token) headers.Authorization = `Bearer ${token}`;
// // // // //   }

// // // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // // //     method,
// // // // //     headers,
// // // // //     body: json ? JSON.stringify(json) : undefined,
// // // // //   });

// // // // //   const data = await res.json().catch(() => null);

// // // // //   if (!res.ok) {
// // // // //     throw new Error(data?.detail || "Request failed");
// // // // //   }
// // // // //   return data;
// // // // // }

// // // // // // ===============================
// // // // // // STORAGE HELPERS
// // // // // // ===============================
// // // // // function clearToken() {
// // // // //   localStorage.removeItem(TOKEN_KEY);
// // // // // }
// // // // // function setPendingEmail(email) {
// // // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // // }
// // // // // function getPendingEmail() {
// // // // //   return localStorage.getItem(PENDING_OTP_EMAIL_KEY);
// // // // // }
// // // // // function clearPendingEmail() {
// // // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // // }

// // // // // // ===============================
// // // // // // REGISTER → SEND OTP ONLY
// // // // // // ===============================
// // // // // async function register() {
// // // // //   try {
// // // // //     clearToken();

// // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // //     if (!email || !password) throw new Error("Fill all fields");

// // // // //     await apiRequest("/auth/register", {
// // // // //       method: "POST",
// // // // //       json: { email, password },
// // // // //       auth: false,
// // // // //     });

// // // // //     setPendingEmail(email);
// // // // //     openOtpModal("register");
// // // // //     showOtpMessage("OTP sent to email", "success");
// // // // //   } catch (e) {
// // // // //     showAuthMessage(e.message, "error");
// // // // //   }
// // // // // }

// // // // // // ===============================
// // // // // // LOGIN (BLOCK IF OTP NOT VERIFIED)
// // // // // // ===============================
// // // // // async function login() {
// // // // //   try {
// // // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // // //     const password = document.getElementById("passwordField").value.trim();

// // // // //     const res = await apiRequest("/auth/login", {
// // // // //       method: "POST",
// // // // //       json: { email, password },
// // // // //       auth: false,
// // // // //     });

// // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // //     const me = await apiRequest("/users/me");
// // // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));
// // // // //     showApp();
// // // // //   } catch (e) {
// // // // //     if (e.message.toLowerCase().includes("verify")) {
// // // // //       setPendingEmail(email);
// // // // //       openOtpModal("register");
// // // // //     } else {
// // // // //       showAuthMessage(e.message, "error");
// // // // //     }
// // // // //   }
// // // // // }

// // // // // // ===============================
// // // // // // VERIFY OTP → LOGIN
// // // // // // ===============================
// // // // // async function verifyOtp() {
// // // // //   try {
// // // // //     const otp = document.getElementById("otpInput").value.trim();
// // // // //     const email = getPendingEmail();

// // // // //     const res = await apiRequest("/auth/verify-otp", {
// // // // //       method: "POST",
// // // // //       json: { email, otp },
// // // // //       auth: false,
// // // // //     });

// // // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // // //     clearPendingEmail();
// // // // //     showApp();
// // // // //   } catch (e) {
// // // // //     showOtpMessage(e.message, "error");
// // // // //   }
// // // // // }

// // // // // // ===============================
// // // // // // RESEND OTP
// // // // // // ===============================
// // // // // async function resendOtp() {
// // // // //   const email = getPendingEmail();
// // // // //   await apiRequest("/auth/resend-otp", {
// // // // //     method: "POST",
// // // // //     json: { email },
// // // // //     auth: false,
// // // // //   });
// // // // //   showOtpMessage("OTP resent", "success");
// // // // // }

// // // // // // ===============================
// // // // // // LOGOUT
// // // // // // ===============================
// // // // // function logout() {
// // // // //   clearToken();
// // // // //   clearPendingEmail();
// // // // //   localStorage.removeItem(USER_KEY);
// // // // //   showAuth("login");
// // // // // }

// // // // // // ===============================
// // // // // // EXPORTS
// // // // // // ===============================
// // // // // window.register = register;
// // // // // window.login = login;
// // // // // window.verifyOtp = verifyOtp;
// // // // // window.resendOtp = resendOtp;
// // // // // window.logout = logout;

// // // // // // ===============================
// // // // // // INIT
// // // // // // ===============================
// // // // // document.addEventListener("DOMContentLoaded", () => {
// // // // //   console.log("FastAPI OTP auth active");
// // // // // });
// // // // /**************** CONFIG ****************/
// // // // const FASTAPI_BASE = "http://192.168.0.107:8000/api/v1";
// // // // const TOKEN_KEY = "access_token";
// // // // const USER_KEY = "user_profile";
// // // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // // /**************** API HELPER ****************/
// // // // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// // // //   const headers = { "Content-Type": "application/json" };

// // // //   if (auth) {
// // // //     const token = localStorage.getItem(TOKEN_KEY);
// // // //     if (token) headers.Authorization = `Bearer ${token}`;
// // // //   }

// // // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // // //     method,
// // // //     headers,
// // // //     body: json ? JSON.stringify(json) : undefined,
// // // //   });

// // // //   const data = await res.json().catch(() => null);
// // // //   if (!res.ok) throw new Error(data?.detail || "Request failed");
// // // //   return data;
// // // // }

// // // // /**************** STORAGE ****************/
// // // // function clearToken() {
// // // //   localStorage.removeItem(TOKEN_KEY);
// // // // }
// // // // function setPendingEmail(email) {
// // // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // // }
// // // // function getPendingEmail() {
// // // //   return localStorage.getItem(PENDING_OTP_EMAIL_KEY);
// // // // }
// // // // function clearPendingEmail() {
// // // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // // }

// // // // /**************** REGISTER ****************/
// // // // async function register() {
// // // //   try {
// // // //     clearToken();

// // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // //     const password = document.getElementById("passwordField").value.trim();

// // // //     await apiRequest("/auth/register", {
// // // //       method: "POST",
// // // //       json: { email, password },
// // // //       auth: false,
// // // //     });

// // // //     setPendingEmail(email);
// // // //     openOtpModal("register");
// // // //     showOtpMessage("OTP sent to email", "success");
// // // //   } catch (e) {
// // // //     showAuthMessage(e.message, "error");
// // // //   }
// // // // }

// // // // /**************** LOGIN ****************/
// // // // async function login() {
// // // //   try {
// // // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // // //     const password = document.getElementById("passwordField").value.trim();

// // // //     const res = await apiRequest("/auth/login", {
// // // //       method: "POST",
// // // //       json: { email, password },
// // // //       auth: false,
// // // //     });

// // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // //     const me = await apiRequest("/users/me");
// // // //     localStorage.setItem(USER_KEY, JSON.stringify(me));
// // // //     showApp();
// // // //   } catch (e) {
// // // //     if (e.message.toLowerCase().includes("verify")) {
// // // //       setPendingEmail(email);
// // // //       openOtpModal("register");
// // // //     } else {
// // // //       showAuthMessage(e.message, "error");
// // // //     }
// // // //   }
// // // // }

// // // // /**************** OTP VERIFY ****************/
// // // // async function verifyOtp() {
// // // //   try {
// // // //     const otp = document.getElementById("otpInput").value.trim();
// // // //     const email = getPendingEmail();

// // // //     const res = await apiRequest("/auth/verify-otp", {
// // // //       method: "POST",
// // // //       json: { email, otp },
// // // //       auth: false,
// // // //     });

// // // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // // //     clearPendingEmail();
// // // //     showApp();
// // // //   } catch (e) {
// // // //     showOtpMessage(e.message, "error");
// // // //   }
// // // // }

// // // // /**************** RESEND OTP ****************/
// // // // async function resendOtp() {
// // // //   const email = getPendingEmail();
// // // //   await apiRequest("/auth/resend-otp", {
// // // //     method: "POST",
// // // //     json: { email },
// // // //     auth: false,
// // // //   });
// // // //   showOtpMessage("OTP resent", "success");
// // // // }

// // // // /**************** LOGOUT ****************/
// // // // function logout() {
// // // //   clearToken();
// // // //   clearPendingEmail();
// // // //   localStorage.removeItem(USER_KEY);
// // // //   showAuth("login");
// // // // }

// // // // /**************** EXPORT ****************/
// // // // window.register = register;
// // // // window.login = login;
// // // // window.verifyOtp = verifyOtp;
// // // // window.resendOtp = resendOtp;
// // // // window.logout = logout;

// // // // document.addEventListener("DOMContentLoaded", () => {
// // // //   console.log("FastAPI OTP auth active");
// // // // });
// // // /* ===============================
// // //    GLOBAL CONSTANTS (DECLARE ONCE)
// // // ================================ */
// // // const FASTAPI_BASE = "http://192.168.0.107:8000/api/v1";
// // // const TOKEN_KEY = "access_token";
// // // const USER_KEY = "user_profile";

// // // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // /* ===============================
// // //    API HELPER
// // // ================================ */
// // // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// // //   const headers = {};
// // //   let body;

// // //   if (json) {
// // //     headers["Content-Type"] = "application/json";
// // //     body = JSON.stringify(json);
// // //   }

// // //   if (auth) {
// // //     const token = localStorage.getItem(TOKEN_KEY);
// // //     if (token) headers["Authorization"] = `Bearer ${token}`;
// // //   }

// // //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// // //     method,
// // //     headers,
// // //     body,
// // //   });

// // //   const data = await res.json().catch(() => ({}));

// // //   if (!res.ok) {
// // //     throw new Error(data.detail || "Request failed");
// // //   }

// // //   return data;
// // // }

// // // /* ===============================
// // //    TOKEN HELPERS (ONLY ONCE)
// // // ================================ */
// // // function clearToken() {
// // //   localStorage.removeItem(TOKEN_KEY);
// // // }

// // // function setPendingEmail(email) {
// // //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // // }

// // // function getPendingEmail() {
// // //   return localStorage.getItem(PENDING_OTP_EMAIL_KEY);
// // // }

// // // function clearPendingEmail() {
// // //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // // }

// // // /* ===============================
// // //    REGISTER → SEND OTP
// // // ================================ */
// // // async function register() {
// // //   try {
// // //     clearToken();

// // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // //     const password = document.getElementById("passwordField").value.trim();

// // //     if (!email || !password) {
// // //       throw new Error("Email and password required");
// // //     }

// // //     await apiRequest("/auth/register", {
// // //       method: "POST",
// // //       json: { email, password },
// // //       auth: false,
// // //     });

// // //     setPendingEmail(email);
// // //     openOtpModal("register");
// // //     showOtpMessage("OTP sent to your email", "success");

// // //   } catch (err) {
// // //     showAuthMessage(err.message, "error");
// // //   }
// // // }

// // // /* ===============================
// // //    VERIFY OTP
// // // ================================ */
// // // async function verifyOtp() {
// // //   try {
// // //     const otp = document.getElementById("otpInput").value.trim();
// // //     const email = getPendingEmail();

// // //     if (!otp || otp.length !== 6) {
// // //       throw new Error("Enter valid OTP");
// // //     }

// // //     const res = await apiRequest("/auth/verify-otp", {
// // //       method: "POST",
// // //       json: { email, otp },
// // //       auth: false,
// // //     });

// // //     localStorage.setItem(TOKEN_KEY, res.access_token);
// // //     clearPendingEmail();

// // //     const me = await apiRequest("/users/me");
// // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // //     closeOtpModal();
// // //     showApp();

// // //   } catch (err) {
// // //     showOtpMessage(err.message, "error");
// // //   }
// // // }

// // // /* ===============================
// // //    LOGIN
// // // ================================ */
// // // async function login() {
// // //   try {
// // //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// // //     const password = document.getElementById("passwordField").value.trim();

// // //     const res = await apiRequest("/auth/login", {
// // //       method: "POST",
// // //       json: { email, password },
// // //       auth: false,
// // //     });

// // //     localStorage.setItem(TOKEN_KEY, res.access_token);

// // //     const me = await apiRequest("/users/me");
// // //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// // //     showApp();

// // //   } catch (err) {
// // //     showAuthMessage(err.message, "error");
// // //   }
// // // }

// // // /* ===============================
// // //    LOGOUT
// // // ================================ */
// // // function logout() {
// // //   clearToken();
// // //   clearPendingEmail();
// // //   localStorage.removeItem(USER_KEY);
// // //   showAuth("login");
// // // }

// // // /* ===============================
// // //    EXPORTS
// // // ================================ */
// // // window.register = register;
// // // window.login = login;
// // // window.verifyOtp = verifyOtp;
// // // window.logout = logout;
// // /* ===============================
// //    GLOBAL CONSTANTS (DECLARE ONCE)
// // ================================ */
// // const FASTAPI_BASE = "http://10.46.232.142:8000/api/v1";

// // const TOKEN_KEY = "access_token";
// // const USER_KEY = "user_profile";
// // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // /* ===============================
// //    TOKEN HELPERS
// // ================================ */
// // function clearToken() {
// //   localStorage.removeItem(TOKEN_KEY);
// // }

// // function setPendingEmail(email) {
// //   localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// // }

// // function getPendingEmail() {
// //   return (localStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim();
// // }

// // function clearPendingEmail() {
// //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // }

// // /* ===============================
// //    API HELPER
// // ================================ */
// // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// //   const headers = {};
// //   let body;

// //   if (json) {
// //     headers["Content-Type"] = "application/json";
// //     body = JSON.stringify(json);
// //   }

// //   if (auth) {
// //     const token = localStorage.getItem(TOKEN_KEY);
// //     if (token) headers["Authorization"] = `Bearer ${token}`;
// //   }

// //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// //     method,
// //     headers,
// //     body,
// //   });

// //   const data = await res.json().catch(() => ({}));

// //   if (!res.ok) {
// //     throw new Error(data.detail || "Request failed");
// //   }

// //   return data;
// // }

// // /* ===============================
// //    REGISTER → SEND OTP ONLY
// // ================================ */
// // async function register() {
// //   try {
// //     clearToken();

// //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// //     const password = document.getElementById("passwordField").value.trim();

// //     if (!email || !password) throw new Error("Fill all fields");

// //     await apiRequest("/auth/register", {
// //       method: "POST",
// //       json: { email, password },
// //       auth: false,
// //     });

// //     setPendingEmail(email);
// //     openOtpModal("register");
// //     showOtpMessage("OTP sent to email", "success");
// //   } catch (e) {
// //     showAuthMessage(e.message, "error");
// //   }
// // }

// // /* ===============================
// //    LOGIN
// // ================================ */
// // async function login() {
// //   try {
// //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// //     const password = document.getElementById("passwordField").value.trim();

// //     const res = await apiRequest("/auth/login", {
// //       method: "POST",
// //       json: { email, password },
// //       auth: false,
// //     });

// //     localStorage.setItem(TOKEN_KEY, res.access_token);

// //     const me = await apiRequest("/users/me");
// //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// //     showApp();
// //   } catch (e) {
// //     if (e.message.toLowerCase().includes("otp")) {
// //       setPendingEmail(email);
// //       openOtpModal("register");
// //       return;
// //     }
// //     showAuthMessage(e.message, "error");
// //   }
// // }

// // /* ===============================
// //    VERIFY OTP
// // ================================ */
// // async function verifyOtp() {
// //   try {
// //     const otp = document.getElementById("otpInput").value.trim();
// //     const email = getPendingEmail();

// //     const res = await apiRequest("/auth/verify-otp", {
// //       method: "POST",
// //       json: { email, otp },
// //       auth: false,
// //     });

// //     localStorage.setItem(TOKEN_KEY, res.access_token);
// //     clearPendingEmail();

// //     const me = await apiRequest("/users/me");
// //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// //     closeOtpModal();
// //     showApp();
// //   } catch (e) {
// //     showOtpMessage(e.message, "error");
// //   }
// // }

// // /* ===============================
// //    RESEND OTP
// // ================================ */
// // async function resendOtp() {
// //   const email = getPendingEmail();
// //   await apiRequest("/auth/resend-otp", {
// //     method: "POST",
// //     json: { email },
// //     auth: false,
// //   });
// // }

// // /* ===============================
// //    LOGOUT
// // ================================ */
// // function logout() {
// //   clearToken();
// //   clearPendingEmail();
// //   localStorage.removeItem(USER_KEY);
// //   showAuth("login");
// // }

// // /* ===============================
// //    EXPORTS
// // ================================ */
// // window.register = register;
// // window.login = login;
// // window.verifyOtp = verifyOtp;
// // window.resendOtp = resendOtp;
// // window.logout = logout;

// // console.log("✅ FastAPI OTP frontend loaded");
// // ===============================
// // GLOBAL KEYS (DECLARE ONCE)
// // ===============================
// // const FASTAPI_BASE = "http://192.168.0.107:8000/api/v1";
// // const TOKEN_KEY = "access_token";
// // const USER_KEY = "user_profile";
// // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // // ===============================
// // // BASIC HELPERS
// // // ===============================
// // function clearToken() {
// //   localStorage.removeItem(TOKEN_KEY);
// // }

// // function showAuthMessage(msg, type = "error") {
// //   const el = document.getElementById("authMessage");
// //   if (!el) return;
// //   el.textContent = msg;
// //   el.style.color = type === "success" ? "green" : "red";
// // }

// // function showApp() {
// //   console.log("✅ Logged in, app opened");
// // }

// // // ===============================
// // // API REQUEST
// // // ===============================
// // async function apiRequest(path, { method = "GET", json, auth = true } = {}) {
// //   const headers = {};
// //   let body;

// //   if (json) {
// //     headers["Content-Type"] = "application/json";
// //     body = JSON.stringify(json);
// //   }

// //   if (auth) {
// //     const token = localStorage.getItem(TOKEN_KEY);
// //     if (token) headers["Authorization"] = `Bearer ${token}`;
// //   }

// //   const res = await fetch(`${FASTAPI_BASE}${path}`, {
// //     method,
// //     headers,
// //     body,
// //   });

// //   const data = await res.json().catch(() => null);

// //   if (!res.ok) {
// //     throw new Error(data?.detail || "Request failed");
// //   }

// //   return data;
// // }

// // // ===============================
// // // LOGIN
// // // ===============================
// // async function login() {
// //   try {
// //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// //     const password = document.getElementById("passwordField").value.trim();

// //     if (!email || !password) {
// //       showAuthMessage("Enter email and password");
// //       return;
// //     }

// //     const res = await apiRequest("/auth/login", {
// //       method: "POST",
// //       json: { email, password },
// //       auth: false,
// //     });

// //     localStorage.setItem(TOKEN_KEY, res.access_token);

// //     const me = await apiRequest("/users/me");
// //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// //     showAuthMessage("Login successful", "success");
// //     showApp();
// //   } catch (e) {
// //     showAuthMessage(e.message);
// //   }
// // }

// // // ===============================
// // // REGISTER (OTP FLOW)
// // // ===============================
// // async function register() {
// //   try {
// //     clearToken();

// //     const email = document.getElementById("emailField").value.trim().toLowerCase();
// //     const password = document.getElementById("passwordField").value.trim();

// //     if (!email || !password) {
// //       showAuthMessage("Fill all fields");
// //       return;
// //     }

// //     await apiRequest("/auth/register", {
// //       method: "POST",
// //       json: { email, password },
// //       auth: false,
// //     });

// //     localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
// //     showAuthMessage("OTP sent to email", "success");
// //   } catch (e) {
// //     showAuthMessage(e.message);
// //   }
// // }

// // // ===============================
// // // OTP VERIFY
// // // ===============================
// // async function verifyOtp() {
// //   try {
// //     const otp = document.getElementById("otpInput").value.trim();
// //     const email = localStorage.getItem(PENDING_OTP_EMAIL_KEY);

// //     if (!otp || !email) {
// //       showAuthMessage("OTP or email missing");
// //       return;
// //     }

// //     const res = await apiRequest("/auth/verify-otp", {
// //       method: "POST",
// //       json: { email, otp },
// //       auth: false,
// //     });

// //     localStorage.setItem(TOKEN_KEY, res.access_token);
// //     localStorage.removeItem(PENDING_OTP_EMAIL_KEY);

// //     const me = await apiRequest("/users/me");
// //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// //     showAuthMessage("OTP verified. Logged in.", "success");
// //     showApp();
// //   } catch (e) {
// //     showAuthMessage(e.message);
// //   }
// // }

// // // ===============================
// // // EXPORT TO HTML
// // // ===============================
// // window.login = login;
// // window.register = register;
// // window.verifyOtp = verifyOtp;

// // console.log("✅ FastAPI OTP frontend loaded");
// // ===============================
// // CONFIG
// // ===============================
// // const FASTAPI_BASE = "http://192.168.0.107:8000/api/v1";

// // const TOKEN_KEY = "access_token";
// // const USER_KEY = "user_profile";
// // const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // /**
// //  * IMPORTANT: Set this to match your FastAPI login endpoint:
// //  * - If backend uses OAuth2PasswordRequestForm => "form"
// //  * - If backend expects JSON {email,password} => "json"
// //  */
// // const LOGIN_PAYLOAD_MODE = "form"; // <-- change to "json" if your backend needs JSON

// // /**
// //  * IMPORTANT: Set this to match your FastAPI register schema field name.
// //  * Common ones: "full_name" or "name"
// //  * If your backend register schema requires full_name, set to "full_name"
// //  */
// // const REGISTER_NAME_KEY = "full_name"; // <-- adjust to match Swagger exactly

// // // Optional redirects (change to your real pages)
// // const REDIRECT_AFTER_REGISTER = "otp.html";
// // const REDIRECT_AFTER_LOGIN = "dashboard.html";

// // // ===============================
// // // BASIC HELPERS
// // // ===============================
// // function $(id) {
// //   return document.getElementById(id);
// // }

// // function getValue(id, { trim = true, lower = false } = {}) {
// //   const el = $(id);
// //   if (!el) return "";
// //   let v = el.value ?? "";
// //   v = trim ? String(v).trim() : String(v);
// //   if (lower) v = v.toLowerCase();
// //   return v;
// // }

// // function clearSession() {
// //   localStorage.removeItem(TOKEN_KEY);
// //   localStorage.removeItem(USER_KEY);
// //   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// // }

// // function showAuthMessage(msg, type = "error") {
// //   const el = $("authMessage");
// //   if (!el) return;
// //   el.textContent = msg;
// //   el.style.color = type === "success" ? "green" : "red";
// // }

// // function showApp() {
// //   // You can replace this with your real dashboard open logic
// //   console.log("✅ Logged in, app opened");
// //   if (REDIRECT_AFTER_LOGIN) window.location.href = REDIRECT_AFTER_LOGIN;
// // }

// // // ===============================
// // // API REQUEST (JSON + FORM)
// // // ===============================
// // async function apiRequest(
// //   path,
// //   { method = "GET", json, form, auth = true, timeoutMs = 15000 } = {}
// // ) {
// //   const headers = {};
// //   let body;

// //   if (json !== undefined) {
// //     headers["Content-Type"] = "application/json";
// //     body = JSON.stringify(json);
// //   }

// //   if (form !== undefined) {
// //     headers["Content-Type"] = "application/x-www-form-urlencoded";
// //     body = new URLSearchParams(form).toString();
// //   }

// //   if (auth) {
// //     const token = localStorage.getItem(TOKEN_KEY);
// //     if (token) headers["Authorization"] = `Bearer ${token}`;
// //   }

// //   const controller = new AbortController();
// //   const t = setTimeout(() => controller.abort(), timeoutMs);

// //   let res;
// //   try {
// //     res = await fetch(`${FASTAPI_BASE}${path}`, {
// //       method,
// //       headers,
// //       body,
// //       signal: controller.signal,
// //     });
// //   } catch (err) {
// //     // This catches network issues like ERR_CONNECTION_TIMED_OUT
// //     throw new Error(
// //       "Cannot reach backend. Check FASTAPI_BASE, uvicorn --host 0.0.0.0, firewall, and IP."
// //     );
// //   } finally {
// //     clearTimeout(t);
// //   }

// //   const rawText = await res.text();
// //   let data = null;
// //   try {
// //     data = rawText ? JSON.parse(rawText) : null;
// //   } catch {
// //     data = rawText || null;
// //   }

// //   if (!res.ok) {
// //     // FastAPI validation errors often come as {detail: [...]}
// //     if (data && typeof data === "object" && data.detail) {
// //       // Make 422/400 details readable
// //       if (Array.isArray(data.detail)) {
// //         const msg = data.detail
// //           .map((d) => `${(d.loc || []).join(".")}: ${d.msg}`)
// //           .join(" | ");
// //         throw new Error(msg || "Request failed");
// //       }
// //       throw new Error(String(data.detail));
// //     }
// //     throw new Error(typeof data === "string" && data ? data : "Request failed");
// //   }

// //   return data;
// // }

// // // ===============================
// // // LOGIN
// // // ===============================
// // async function login() {
// //   try {
// //     showAuthMessage("");

// //     const email = getValue("emailField", { trim: true, lower: true });
// //     const password = getValue("passwordField", { trim: false });

// //     if (!email || !password) {
// //       showAuthMessage("Enter email and password");
// //       return;
// //     }

// //     let res;

// //     if (LOGIN_PAYLOAD_MODE === "form") {
// //       // For OAuth2PasswordRequestForm in FastAPI
// //       // NOTE: field name must be "username" (even if you use email as username)
// //       res = await apiRequest("/auth/login", {
// //         method: "POST",
// //         form: { username: email, password },
// //         auth: false,
// //       });
// //     } else {
// //       // For JSON login schema in FastAPI
// //       res = await apiRequest("/auth/login", {
// //         method: "POST",
// //         json: { email, password },
// //         auth: false,
// //       });
// //     }

// //     if (res?.access_token) {
// //       localStorage.setItem(TOKEN_KEY, res.access_token);
// //     } else {
// //       throw new Error("Login succeeded but access_token not found in response.");
// //     }

// //     // Fetch profile
// //     const me = await apiRequest("/users/me", { method: "GET", auth: true });
// //     localStorage.setItem(USER_KEY, JSON.stringify(me));

// //     showAuthMessage("Login successful", "success");
// //     showApp();
// //   } catch (e) {
// //     showAuthMessage(e.message);
// //   }
// // }

// // // ===============================
// // // REGISTER (OTP FLOW)
// // // ===============================
// // async function register() {
// //   try {
// //     showAuthMessage("");
// //     clearSession();

// //     // If you have a full name field on register page, use it.
// //     // If not present and your backend requires it, registration will fail (and you'll see the exact error).
// //     const fullName = getValue("fullNameField", { trim: true }); // optional input id="fullNameField"
// //     const email = getValue("emailField", { trim: true, lower: true });
// //     const password = getValue("passwordField", { trim: false });

// //     if (!email || !password) {
// //       showAuthMessage("Fill all fields");
// //       return;
// //     }

// //     // Build payload to match FastAPI register schema
// //     const payload = { email, password };

// //     // Only include name if the input exists (prevents sending empty field)
// //     if (fullName) payload[REGISTER_NAME_KEY] = fullName;

// //     await apiRequest("/auth/register", {
// //       method: "POST",
// //       json: payload,
// //       auth: false,
// //     });

// //     localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);

// //     showAuthMessage("OTP sent to email", "success");

// //     if (REDIRECT_AFTER_REGISTER) window.location.href = REDIRECT_AFTER_REGISTER;
// //   } catch (e) {
// //     showAuthMessage(e.message);
// //   }
// // }

// // // ===============================
// // // OTP VERIFY
// // // ===============================
// // async function verifyOtp() {
// //   try {
// //     showAuthMessage("");

// //     const otp = getValue("otpInput", { trim: true });
// //     const email = localStorage.getItem(PENDING_OTP_EMAIL_KEY);

// //     if (!otp || !email) {
// //       showAuthMessage("OTP or email missing");
// //       return;
// //     }

// //     const res = await apiRequest("/auth/verify-otp", {
// //       method: "POST",
// //       json: { email, otp },
// //       auth: false,
// //     });

// //     /**
// //      * Some backends return access_token on OTP verify (auto-login),
// //      * others only return a success message (then user must login).
// //      */
// //     if (res?.access_token) {
// //       localStorage.setItem(TOKEN_KEY, res.access_token);

// //       const me = await apiRequest("/users/me", { method: "GET", auth: true });
// //       localStorage.setItem(USER_KEY, JSON.stringify(me));

// //       localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// //       showAuthMessage("OTP verified. Logged in.", "success");
// //       showApp();
// //       return;
// //     }

// //     // If no token returned, just mark OTP done and send user to login:
// //     localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// //     showAuthMessage("OTP verified. Please login.", "success");
// //     window.location.href = "index.html";
// //   } catch (e) {
// //     showAuthMessage(e.message);
// //   }
// // }

// // // ===============================
// // // EXPORT TO HTML
// // // ===============================
// // window.login = login;
// // window.register = register;
// // window.verifyOtp = verifyOtp;

// // console.log("✅ FastAPI OTP frontend loaded");
// const FASTAPI_BASE = "http://192.168.0.107:8000/api/v1";
// const TOKEN_KEY = "access_token";
// const USER_KEY = "user_profile";
// const PENDING_OTP_EMAIL_KEY = "pending_otp_email";

// // ---- helpers ----
// function setMsg(msg, type = "error") {
//   // use your existing UI function if present
//   if (typeof window.showAuthMessage === "function") window.showAuthMessage(msg, type);
//   else console.log(type.toUpperCase() + ":", msg);
// }

// function setOtpMsg(msg, type = "error") {
//   if (typeof window.showOtpMessage === "function") window.showOtpMessage(msg, type);
//   else console.log("OTP:", msg);
// }

// function clearSession() {
//   localStorage.removeItem(TOKEN_KEY);
//   localStorage.removeItem(USER_KEY);
//   localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
// }

// async function apiRequest(path, { method = "GET", json, form, auth = true } = {}) {
//   const headers = {};
//   let body;

//   if (json !== undefined) {
//     headers["Content-Type"] = "application/json";
//     body = JSON.stringify(json);
//   }
//   if (form !== undefined) {
//     headers["Content-Type"] = "application/x-www-form-urlencoded";
//     body = new URLSearchParams(form).toString();
//   }

//   if (auth) {
//     const token = localStorage.getItem(TOKEN_KEY);
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${FASTAPI_BASE}${path}`, { method, headers, body });
//   const text = await res.text();

//   let data;
//   try { data = text ? JSON.parse(text) : null; } catch { data = text; }

//   if (!res.ok) {
//     // FastAPI validation details
//     if (data && typeof data === "object" && data.detail) {
//       if (Array.isArray(data.detail)) {
//         const msg = data.detail.map(d => `${(d.loc||[]).join(".")}: ${d.msg}`).join(" | ");
//         throw new Error(msg);
//       }
//       throw new Error(String(data.detail));
//     }
//     throw new Error(typeof data === "string" ? data : "Request failed");
//   }

//   return data;
// }

// // ---- AUTH ----
// async function login() {
//   try {
//     setMsg("");
//     const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
//     const password = document.getElementById("passwordField")?.value ?? "";

//     if (!email || !password) {
//       setMsg("Please enter email and password.", "error");
//       return;
//     }

//     // Try OAuth2 form first (most common FastAPI)
//     let data;
//     try {
//       data = await apiRequest("/auth/login", {
//         method: "POST",
//         form: { username: email, password },
//         auth: false,
//       });
//     } catch (e) {
//       // fallback to JSON login
//       data = await apiRequest("/auth/login", {
//         method: "POST",
//         json: { email, password },
//         auth: false,
//       });
//     }

//     localStorage.setItem(TOKEN_KEY, data.access_token);

//     const me = await apiRequest("/users/me", { method: "GET", auth: true });
//     localStorage.setItem(USER_KEY, JSON.stringify(me));

//     setMsg("Login successful. Welcome back.", "success");
//     if (typeof window.showApp === "function") window.showApp();
//   } catch (err) {
//     const msg = err?.message || "Login failed";

//     // If backend indicates OTP required, open OTP modal
//     if (msg.toLowerCase().includes("otp")) {
//       const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
//       if (email) localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
//       if (typeof window.openOtpModal === "function") window.openOtpModal("login");
//       setOtpMsg("Please verify OTP to continue.", "error");
//       return;
//     }

//     setMsg(msg, "error");
//   }
// }

// async function register() {
//   try {
//     setMsg("");
//     clearSession();

//     const fullName = document.getElementById("nameField")?.value?.trim();
//     const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
//     const password = document.getElementById("passwordField")?.value ?? "";

//     if (!fullName || !email || !password) {
//       setMsg("Please complete all fields.", "error");
//       return;
//     }

//     // IMPORTANT: adjust "full_name" to "name" if your backend expects that
//     await apiRequest("/auth/register", {
//       method: "POST",
//       json: { full_name: fullName, email, password },
//       auth: false,
//     });

//     localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);

//     if (typeof window.openOtpModal === "function") window.openOtpModal("register");
//     setOtpMsg("OTP sent. Please verify.", "success");
//   } catch (err) {
//     setMsg(err?.message || "Register failed", "error");
//   }
// }

// async function verifyOtp() {
//   try {
//     setOtpMsg("");
//     const otp = document.getElementById("otpInput")?.value?.trim();
//     const email = localStorage.getItem(PENDING_OTP_EMAIL_KEY);

//     if (!email) {
//       setOtpMsg("Email missing. Please register/login again.", "error");
//       return;
//     }
//     if (!otp || otp.length !== 6) {
//       setOtpMsg("Enter valid 6-digit OTP.", "error");
//       return;
//     }

//     const res = await apiRequest("/auth/verify-otp", {
//       method: "POST",
//       json: { email, otp },
//       auth: false,
//     });

//     if (res?.access_token) {
//       localStorage.setItem(TOKEN_KEY, res.access_token);
//       const me = await apiRequest("/users/me", { method: "GET", auth: true });
//       localStorage.setItem(USER_KEY, JSON.stringify(me));
//     }

//     localStorage.removeItem(PENDING_OTP_EMAIL_KEY);

//     setOtpMsg("OTP verified. Continuing...", "success");
//     setTimeout(() => {
//       if (typeof window.closeOtpModal === "function") window.closeOtpModal();
//       if (typeof window.showApp === "function") window.showApp();
//     }, 400);

//   } catch (err) {
//     setOtpMsg(err?.message || "OTP verification failed", "error");
//   }
// }

// // expose to your HTML
// window.login = login;
// window.register = register;
// window.verifyOtp = verifyOtp;

// // optional: expose apiRequest for debugging
// window.apiRequest = apiRequest;

// console.log("✅ FastAPI auth integration loaded");
/* ================================
   UPSC Evaluator Elite – app.js
   FastAPI + JWT + OTP (REAL FLOW)
================================ */

const AUTH_API_BASE_KEY = window.AUTH_API_BASE_KEY || "UPSC_AUTH_BASE";
window.AUTH_API_BASE_KEY = AUTH_API_BASE_KEY;
//const DEFAULT_AUTH_BASE =
  // window.location.hostname === "localhost"
  //   ? "http://127.0.0.1:8000/api/v1"
  //   : `http://${window.location.hostname}:8000/api/v1`;
  //const DEFAULT_AUTH_BASE = "https://arena-pac-spreading-tom.trycloudflare.com/api/v1";
  const DEFAULT_AUTH_BASE = "https://upsc-answer-evaluator-upsc-evaluator.onrender.com/api/v1";


// LAN / production

function getAuthBase() {
  const normalize = (value) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) return "";
    if (/[<>]/.test(trimmed) || /YOUR_BACKEND_IP/i.test(trimmed)) return "";
    return trimmed.replace(/\/+$/, "");
  };

  const storedRaw = localStorage.getItem(AUTH_API_BASE_KEY);
  const stored = normalize(storedRaw);
  if (stored && stored.includes(":8001")) {
    const fixed = stored.replace(":8001", ":8000");
    localStorage.setItem(AUTH_API_BASE_KEY, fixed);
    return fixed;
  }
  if (stored) return stored;

  localStorage.setItem(AUTH_API_BASE_KEY, DEFAULT_AUTH_BASE);
  return DEFAULT_AUTH_BASE;
}

const TOKEN_KEY = "access_token";
const USER_KEY = window.USER_KEY || "UPSC_USER";
const PENDING_OTP_EMAIL_KEY = "pending_otp_email";
const OTP_CONTEXT_KEY = "UPSC_OTP_CONTEXT";
const OTP_MESSAGE_KEY = "UPSC_OTP_MESSAGE";
const OTP_DEV_KEY = "UPSC_OTP_DEV";
const OTP_RESEND_SECONDS = 60;
let otpResendTimer = null;

/* ---------- helpers ---------- */
function setMsg(msg, type = "error") {
  if (typeof window.showAuthMessage === "function")
    window.showAuthMessage(msg, type);
  else console.log(type.toUpperCase(), msg);
}

function setOtpMsg(msg, type = "error") {
  if (typeof window.showOtpMessage === "function")
    window.showOtpMessage(msg, type);
  else console.log("OTP:", msg);
}

function setOtpStatus(msg = "") {
  const statusEl = document.getElementById("otpStatus");
  if (statusEl) statusEl.textContent = msg;
}

function startOtpFlow(context, message, otp) {
  localStorage.setItem(OTP_CONTEXT_KEY, context);
  if (message) localStorage.setItem(OTP_MESSAGE_KEY, message);
  else localStorage.removeItem(OTP_MESSAGE_KEY);
  if (otp) localStorage.setItem(OTP_DEV_KEY, String(otp));
  else localStorage.removeItem(OTP_DEV_KEY);

  if (typeof window.openOtpModal === "function") {
    window.openOtpModal(context);
  } else {
    window.location.href = `otp.html?context=${encodeURIComponent(context)}`;
  }
}

function startOtpResendTimer(seconds = OTP_RESEND_SECONDS) {
  const btn = document.getElementById("resendOtpBtn");
  if (!btn) return;
  let remaining = Math.max(0, Number(seconds) || OTP_RESEND_SECONDS);
  if (otpResendTimer) clearInterval(otpResendTimer);
  if (remaining === 0) {
    btn.disabled = false;
    btn.textContent = "Resend OTP";
    setOtpStatus("");
    return;
  }
  btn.disabled = true;
  btn.textContent = `Resend OTP (${remaining}s)`;
  setOtpStatus("You can resend OTP after the timer ends.");
  otpResendTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(otpResendTimer);
      otpResendTimer = null;
      btn.disabled = false;
      btn.textContent = "Resend OTP";
      setOtpStatus("");
      return;
    }
    btn.textContent = `Resend OTP (${remaining}s)`;
  }, 1000);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
}

/* ---------- API helper ---------- */
async function apiRequest(
  path,
  { method = "GET", json, form, auth = true } = {}
) {
  const headers = {};
  let body;

  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form).toString();
  }

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getAuthBase()}${path}`, {
    method,
    headers,
    body,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (res.status === 401 && auth) {
    clearSession();
    if (window.showAuth) window.showAuth("login");
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    let message = "Request failed";
    if (data?.detail) {
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail))
        message = data.detail.map(d => d.msg).join(" | ");
      else if (data.detail.message) message = data.detail.message;
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

/* ================= AUTH ================= */

/* ---------- LOGIN ---------- */
async function login() {
  let email = "";
  try {
    setMsg("");

    email = document.getElementById("emailField").value.trim().toLowerCase();
    const password = document.getElementById("passwordField").value;

    if (!email || !password) {
      setMsg("Please enter email and password.");
      return;
    }

    const res = await apiRequest("/auth/login", {
      method: "POST",
      json: { email, password },
      auth: false,
    });

    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
    startOtpFlow("login", "OTP sent. Please verify to continue.", res?.otp);

  } catch (err) {
    const msg = err?.message || "Login failed";
    const lower = msg.toLowerCase();
    if (lower.includes("not verified") || lower.includes("verify otp")) {
      if (email) localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
      startOtpFlow("register", "Email not verified. Enter OTP sent to your email.");
      setMsg("Email not verified. Please verify OTP.", "error");
      return;
    }
    setMsg(msg);
  }
}

/* ---------- REGISTER ---------- */
async function register() {
  try {
    setMsg("");
    clearSession();

    const name = document.getElementById("nameField").value.trim();
    const email = document.getElementById("emailField").value.trim().toLowerCase();
    const password = document.getElementById("passwordField").value;

    if (!name || !email || !password) {
      setMsg("Please complete all fields.");
      return;
    }

    const res = await apiRequest("/auth/register", {
      method: "POST",
      json: { email, password, full_name: name },
      auth: false,
    });

    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
    if (typeof window.showAuth === "function") window.showAuth("register");
    startOtpFlow("register", "OTP sent. Verify to continue.", res?.otp);

  } catch (err) {
    const msg = err?.message || "Registration failed";
    const lower = msg.toLowerCase();
    if (
      lower.includes("already registered") ||
      lower.includes("already exists") ||
      lower.includes("email already registered")
    ) {
      try {
        const loginRes = await apiRequest("/auth/login", {
          method: "POST",
          json: { email, password },
          auth: false,
        });
        localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
        startOtpFlow("login", "Account exists. OTP sent to login.", loginRes?.otp);
      } catch (loginErr) {
        setMsg("Account already exists. Password may be incorrect.", "error");
      }
      return;
    }
    if (msg.toLowerCase().includes("otp email failed") || msg.toLowerCase().includes("smtp")) {
      setMsg("Could not send OTP email. Please check SMTP settings on the server.", "error");
      return;
    }
    setMsg(msg);
  }
}

/* ---------- VERIFY OTP ---------- */
async function verifyOtp() {
  try {
    setOtpMsg("");

    const otp = document.getElementById("otpInput").value.trim();
    const email = localStorage.getItem(PENDING_OTP_EMAIL_KEY);

    if (!email) {
      setOtpMsg("Session expired. Please login again.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setOtpMsg("Enter valid 6-digit OTP.");
      return;
    }

    const context =
      document.getElementById("otpModal")?.dataset?.context ||
      localStorage.getItem(OTP_CONTEXT_KEY) ||
      "register";

    if (context === "reset") {
      const newPassword = prompt("Enter a new strong password");
      if (!newPassword) {
        setOtpMsg("Password reset cancelled.");
        return;
      }
      if (typeof window.isStrongPassword === "function" && !window.isStrongPassword(newPassword)) {
        setOtpMsg("Password must be 8+ chars with uppercase, lowercase, number, and symbol.");
        return;
      }
      await apiRequest("/auth/reset-password", {
        method: "POST",
        json: { email, otp, new_password: newPassword },
        auth: false,
      });
      localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
      setOtpMsg("Password reset successful. Please login.", "success");
      setTimeout(() => {
        window.closeOtpModal();
        window.showAuth?.("login");
      }, 500);
      startOtpResendTimer(0);
      return;
    }

    const flow = context === "login" ? "login" : "register";
    const data = await apiRequest("/auth/verify-otp", {
      method: "POST",
      json: { email, otp, flow },
      auth: false,
    });
    localStorage.removeItem(PENDING_OTP_EMAIL_KEY);

    const saveMinimalUser = () => {
      const fallback = { email, name: "Elite Aspirant" };
      localStorage.setItem(USER_KEY, JSON.stringify(fallback));
    };

    if (data?.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      try {
        const me = await apiRequest("/users/me");
        localStorage.setItem(USER_KEY, JSON.stringify(me));
      } catch {
        saveMinimalUser();
      }
    } else {
      saveMinimalUser();
    }

    const goToApp = () => {
      localStorage.setItem("UPSC_FORCE_APP", "1");
      if (window.location.pathname.toLowerCase().includes("otp.html")) {
        window.location.href = "index2.html?forceApp=1";
        return;
      }
      if (typeof window.showApp === "function") window.showApp();
    };

    if (flow === "register") {
      setOtpMsg("Registration successful. Logging you in...", "success");
      setTimeout(() => {
        window.closeOtpModal?.();
        goToApp();
      }, 600);
      startOtpResendTimer(0);
      return;
    }

    setOtpMsg("Login successful. Welcome!", "success");

    setTimeout(() => {
      window.closeOtpModal?.();
      goToApp();
    }, 500);
    startOtpResendTimer(0);

  } catch (err) {
    setOtpMsg(err.message || "OTP verification failed");
  }
}

/* ---------- RESEND OTP ---------- */
async function resendOtp() {
  try {
    setOtpMsg("");
    const context = document.getElementById("otpModal")?.dataset?.context || "register";
    const email =
      localStorage.getItem(PENDING_OTP_EMAIL_KEY) ||
      document.getElementById("emailField")?.value?.trim()?.toLowerCase();

    if (!email) {
      setOtpMsg("Email missing. Please enter your email.", "error");
      return;
    }

    if (context === "reset") {
      await apiRequest("/auth/request-password-reset", {
        method: "POST",
        json: { email },
        auth: false,
      });
      localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
      setOtpMsg("Reset OTP resent. Check your email.", "success");
      startOtpResendTimer(OTP_RESEND_SECONDS);
      return;
    }

    const flow = context === "login" ? "login" : "register";
    const res = await apiRequest("/auth/resend-otp", {
      method: "POST",
      json: { email, flow },
      auth: false,
    });

    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
    setOtpMsg("OTP resent. Check your email.", "success");
    if (res?.otp) setOtpMsg(`OTP (dev): ${res.otp}`, "success");
    startOtpResendTimer(OTP_RESEND_SECONDS);
  } catch (err) {
    setOtpMsg(err.message || "Resend OTP failed");
  }
}

/* ---------- REQUEST PASSWORD RESET ---------- */
async function requestPasswordReset() {
  try {
    setMsg("");
    const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
    if (!email) {
      setMsg("Enter your registered email to reset password.", "error");
      return;
    }
    await apiRequest("/auth/request-password-reset", {
      method: "POST",
      json: { email },
      auth: false,
    });
    localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
    window.openOtpModal?.("reset");
    setOtpMsg("Reset OTP sent to your email.", "success");
  } catch (err) {
    setMsg(err?.message || "Password reset request failed", "error");
  }
}

/* ---------- LOGOUT ---------- */
function logout() {
  clearSession();
  window.showAuth("login");
}

/* ---------- expose ---------- */
window.login = login;
window.register = register;
window.verifyOtp = verifyOtp;
window.resendOtp = resendOtp;
window.requestPasswordReset = requestPasswordReset;
window.logout = logout;
window.apiRequest = apiRequest;
window.startOtpResendTimer = startOtpResendTimer;
window.openOtpFromLogin = (context = "register") => {
  const email = document.getElementById("emailField")?.value?.trim()?.toLowerCase();
  if (email) localStorage.setItem(PENDING_OTP_EMAIL_KEY, email);
  if (typeof window.openOtpModal === "function") {
    window.openOtpModal(context);
  } else {
    setMsg("OTP modal not available. Please refresh.", "error");
  }
};

console.log("✅ FastAPI auth + real OTP loaded");
