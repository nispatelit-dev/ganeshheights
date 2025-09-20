// Application State
let currentUser = null;
let isGuestUser = false;
let currentSection = "dashboard";
let editingContribution = null;
let editingDonation = null;
const THEME_STORAGE_KEY = "uiTheme"; // 'modern' | 'traditional' | 'apple'
// UI filters state (for Apple-style toolbars)
const uiFilters = {
  contribSearch: "",
  contribDate: "",
  contribFlat: "",
  donationSearch: "",
  donationPurpose: "",
  donationDate: "",
};

// Data Storage
let fundContributions = [];

let donations = [];

// Admin credentials
const adminCredentials = {
  username: "admin",
  password: "admin",
};

// Firebase helpers (lazy access so we don't freeze undefined functions)
function isFirebaseReady() {
  return (
    typeof window !== "undefined" &&
    window.firebase &&
    window.firebase.db &&
    window.firebase.fns
  );
}

const Fire = {
  get db() {
    return window.firebase?.db;
  },
  get fns() {
    return window.firebase?.fns;
  },
  col(name) {
    return this.fns.collection(this.db, name);
  },
  doc(name, id) {
    return this.fns.doc(this.db, name, String(id));
  },
};

// Members master data (Ganesh Heights)
const membersByFlat = {
  "GH-101": "URMILABEN HASMUKHBHAI PATEL",
  "GH-104": "JAGRUTIBEN JAYESHKUMAR MODI",
  "GH-201": "BHAVESH PARSOTTAMBHAI PATEL",
  "GH-202": "VAISHALIBEN ALPESHKUMAR DHARIYA",
  "GH-203": "REKHABEN DARSHANKUMAR PATEL",
  "GH-204": "BRIJESH AMRUTLAL PATEL",
  "GH-301": "JIGAR JAYANTIKUMAR BRAHMBHATT",
  "GH-302": "JAYANTIBHAI VIRAMDAS PATEL",
  "GH-303": "ASHOKKUMAR DINESHBHAI PATEL",
  "GH-304": "NISARG RAMESHBHAI PATEL",
  "GH-401": "HARISHKUMAR CHATURBHUI PATEL",
  "GH-402": "RUSHI NAILESHKUMAR PATEL",
  "GH-403": "BHARATBHAI BHOLANATH SHUKLA",
  "GH-404": "INDIRABEN JANAKKUMAR PATEL",
  "GH-501": "MAMTABEN MANOJBHAI PATEL",
  "GH-502": "CHIRAG RAMESHLAL PATEL",
  "GH-503": "SACHIN BHARATBHAI PATEL",
  "GH-504": "YASH PRAFULKUMAR PATEL",
  "GH-601": "RIDHAM SHAILEHBHAI NAYAK",
  "GH-602": "JAGDISHBHAI AMBALAL PATEL",
  "GH-603": "DHAVAL KIRITBHAI PATEL",
  "GH-604": "HIRAL HARIVADAN PATEL",
  "GH-701": "KIRITKUMAR KHUSHALBHAI PATEL",
  "GH-702": "MAULIK AMRUTBHAI PATEL",
  "GH-703": "PRAKASHKUMAR KANTILAL PATEL",
  "GH-704": "RAJNIKANT RAMANBHAI PATEL",
  "GH-801": "NITA PATEL",
  "GH-802": "MAHENDRABHAI CHATURDAS PATEL",
  "GH-803": "GOHIL ROHIT MANUBHAI",
  "GH-804": "RITABEN MAHESHKUMAR PATEL",
  "GH-901": "RINKAL SHANKARBHAI BUTANI",
  "GH-902": "GIRISHBHAI JAMANADAS CHANGELA",
  "GH-903": "CHANDRIKABEN DINESHBHAI PATEL",
  "GH-904": "JIGARKUMAR PRAVINBHAI PATEL",
  "GH-1001": "HARDIK MUKESHKUMAR PATEL",
  "GH-1002": "NIRMALKUMAR HARSHADBHAI PATEL",
  "GH-1003": "JITENDRA BANSILAL GAJJAR",
  "GH-1004": "BHAVANABAHEN MANGALBHAI PATEL",
  "GH-1101": "PATEL MIHIR RAJNIKANT",
  "GH-1102": "KIRITKUMAR JETHALAL PATEL",
  "GH-1103": "ANKIT MOHANBHAI PATEL",
  "GH-1104": "KIRANKUMAR VIKRAMBHAI BHATT",
  "GH-1201": "JASHUMATIBEN KANJIBHAI PATEL",
  "GH-1202": "CHANDULAL JOITARAM PATEL",
  "GH-1203": "SAVAN JAYANTILAL VACHHANI",
  "GH-1204": "CHANDANIBEN CHIRAGKUMAR PATEL",
  "GH-1301": "SUNILGIRI DAHYAGIRI GOSWAMI",
  "GH-1304": "AMRUTBHAI PARSOTTAMDAS PATEL",
};

// Navaratri days master (2025)
const navaratriDays = [
  { day: 1, date: "2025-09-22", label: "૧ — 22 સપ્ટેમ્બર, 2025 — સોમવાર" },
  { day: 2, date: "2025-09-23", label: "૨ — 23 સપ્ટેમ્બર, 2025 — મંગળવાર" },
  { day: 3, date: "2025-09-24", label: "૩ — 24 સપ્ટેમ્બર, 2025 — બુધવાર" },
  { day: 4, date: "2025-09-25", label: "૪ — 25 સપ્ટેમ્બર, 2025 — ગુરુવાર" },
  { day: 5, date: "2025-09-26", label: "૫ — 26 સપ્ટેમ્બર, 2025 — શુક્રવાર" },
  { day: 6, date: "2025-09-27", label: "૬ — 27 સપ્ટેમ્બર, 2025 — શનિવાર" },
  { day: 7, date: "2025-09-28", label: "૭ — 28 સપ્ટેમ્બર, 2025 — રવિવાર" },
  { day: 8, date: "2025-09-29", label: "૮ — 29 સપ્ટેમ્બર, 2025 — સોમવાર" },
  { day: 9, date: "2025-09-30", label: "૯ — 30 સપ્ટેમ્બર, 2025 — મંગળવાર" },
  { day: 10, date: "2025-10-01", label: "૧૦ — 1 ઓક્ટોબર, 2025 — બુધવાર" },
];

function populateNavaratriDayDropdown() {
  const sel = document.getElementById("navaratriDay");
  if (!sel) return;
  sel.innerHTML =
    '<option value="" disabled selected>Select Navaratri Day</option>';
  navaratriDays.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = String(d.day);
    opt.textContent = d.label;
    sel.appendChild(opt);
  });
}

function getNavaratriDateByDay(day) {
  const item = navaratriDays.find((d) => d.day === Number(day));
  return item ? item.date : "";
}

function getNavaratriDayByDate(date) {
  const item = navaratriDays.find((d) => d.date === date);
  return item ? item.day : "";
}

// Firestore sync: subscribe to live changes
async function subscribeToFirestore() {
  if (!isFirebaseReady()) return;
  const { onSnapshot, query, orderBy } = Fire.fns;
  try {
    // Donations live sync
    const qDon = query(Fire.col("donations"), orderBy("id", "asc"));
    onSnapshot(qDon, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push(doc.data()));
      donations = list.map((d) => ({
        id: Number(d.id),
        donorName: d.donorName || "",
        amount: Number(d.amount) || 0,
        purpose: d.purpose || "",
        date: d.date || getCurrentDate(),
        flatNumber: d.flatNumber || "",
        navaratriDay: d.navaratriDay || "",
      }));
      populateFilterOptions && populateFilterOptions();
      renderDonationsTable && renderDonationsTable();
      updateDashboard && updateDashboard();
      updateExportCounts && updateExportCounts();
    });
    // Contributions live sync
    const qCon = query(Fire.col("contributions"), orderBy("id", "asc"));
    onSnapshot(qCon, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push(doc.data()));
      fundContributions = list.map((c) => ({
        id: Number(c.id),
        residentName: c.residentName || "",
        amount: Number(c.amount) || 0,
        date: c.date || getCurrentDate(),
        flatNumber: c.flatNumber || "",
        receivedBy: c.receivedBy || "",
      }));
      populateFilterOptions && populateFilterOptions();
      renderContributionsTable && renderContributionsTable();
      updateDashboard && updateDashboard();
      updateExportCounts && updateExportCounts();
    });
    console.log("[Firestore] realtime listeners attached");
  } catch (e) {
    console.warn("[Firestore] subscription failed", e);
  }
}

// One-time fetch at app start so lists hydrate immediately
async function initialFetchFromFirestore() {
  if (!isFirebaseReady()) return;
  try {
    const { getDocs, query, orderBy } = Fire.fns;
    const donSnap = await getDocs(
      query(Fire.col("donations"), orderBy("id", "asc"))
    );
    const donList = [];
    donSnap.forEach((doc) => donList.push(doc.data()));
    donations = donList.map((d) => ({
      id: Number(d.id),
      donorName: d.donorName || "",
      amount: Number(d.amount) || 0,
      purpose: d.purpose || "",
      date: d.date || getCurrentDate(),
      flatNumber: d.flatNumber || "",
      navaratriDay: d.navaratriDay || "",
    }));

    const conSnap = await getDocs(
      query(Fire.col("contributions"), orderBy("id", "asc"))
    );
    const conList = [];
    conSnap.forEach((doc) => conList.push(doc.data()));
    fundContributions = conList.map((c) => ({
      id: Number(c.id),
      residentName: c.residentName || "",
      amount: Number(c.amount) || 0,
      date: c.date || getCurrentDate(),
      flatNumber: c.flatNumber || "",
      receivedBy: c.receivedBy || "",
    }));

    populateFilterOptions && populateFilterOptions();
    renderContributionsTable && renderContributionsTable();
    renderDonationsTable && renderDonationsTable();
    updateDashboard && updateDashboard();
    console.log("[Firestore] initial fetch completed");
  } catch (e) {
    console.warn("[Firestore] initial fetch failed", e);
  }
}

async function upsertDonationToFirestore(donation) {
  if (!isFirebaseReady()) return;
  await Fire.fns.setDoc(Fire.doc("donations", donation.id), {
    ...donation,
    id: Number(donation.id),
  });
}
async function deleteDonationFromFirestore(id) {
  if (!isFirebaseReady()) return;
  await Fire.fns.deleteDoc(Fire.doc("donations", id));
}
async function upsertContributionToFirestore(contribution) {
  if (!isFirebaseReady()) return;
  await Fire.fns.setDoc(Fire.doc("contributions", contribution.id), {
    ...contribution,
    id: Number(contribution.id),
  });
}
async function deleteContributionFromFirestore(id) {
  if (!isFirebaseReady()) return;
  await Fire.fns.deleteDoc(Fire.doc("contributions", id));
}

// Utility Functions
function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateId(array) {
  return array.length > 0 ? Math.max(...array.map((item) => item.id)) + 1 : 1;
}

// UI Helpers for Flats
function generateFlatList() {
  const flats = [];
  const building = "GH";
  for (let floor = 1; floor <= 13; floor++) {
    const units = floor === 1 || floor === 13 ? [1, 4] : [1, 2, 3, 4];
    for (const unit of units) {
      const flat = `${building}-${floor}${String(unit).padStart(2, "0")}`;
      flats.push(flat);
    }
  }
  return flats;
}

function populateFlatDropdown() {
  const sel = document.getElementById("flatNumber");
  if (!sel) return;
  sel.innerHTML = '<option value="" disabled selected>Select Flat</option>';
  for (const flat of generateFlatList()) {
    const opt = document.createElement("option");
    opt.value = flat;
    const member = membersByFlat[flat];
    opt.textContent = member
      ? `${flat} — ${member}`
      : `${flat} (Ganesh Heights)`;
    sel.appendChild(opt);
  }
}

function populateDonationFlatDropdown() {
  const sel = document.getElementById("donationFlatNumber");
  if (!sel) return;
  sel.innerHTML = '<option value="" disabled selected>Select Flat</option>';
  for (const flat of generateFlatList()) {
    const opt = document.createElement("option");
    opt.value = flat;
    const member = membersByFlat[flat];
    opt.textContent = member
      ? `${flat} — ${member}`
      : `${flat} (Ganesh Heights)`;
    sel.appendChild(opt);
  }
}

// Helpers: filtered views for tables
function getFilteredContributions() {
  const term = uiFilters.contribSearch.trim().toLowerCase();
  const date = uiFilters.contribDate;
  const flat = uiFilters.contribFlat;

  // Filter the data first
  const filtered = fundContributions.filter((c) => {
    const matchesTerm =
      !term ||
      c.residentName.toLowerCase().includes(term) ||
      String(c.flatNumber).toLowerCase().includes(term);
    const matchesDate = !date || c.date === date;
    const matchesFlat = !flat || c.flatNumber === flat;
    return matchesTerm && matchesDate && matchesFlat;
  });

  // Helper function to extract numeric part from flat number
  function getFlatNumber(flatStr) {
    if (!flatStr) return 0;
    // Remove all non-digit characters and convert to number
    const num = flatStr.replace(/\D/g, "");
    return parseInt(num, 10) || 0;
  }

  // Then sort the filtered results
  return [...filtered].sort((a, b) => {
    let compareResult = 0;

    switch (currentSort.column) {
      case "flat":
        // Sort by numeric part of flat number
        const aNum = getFlatNumber(a.flatNumber);
        const bNum = getFlatNumber(b.flatNumber);
        compareResult = aNum - bNum;
        break;
      case "date":
        compareResult = new Date(a.date) - new Date(b.date);
        break;
      case "amount":
        compareResult = a.amount - b.amount;
        break;
      case "name":
        compareResult = (a.residentName || "").localeCompare(
          b.residentName || ""
        );
        break;
      default:
        compareResult = 0;
    }

    // Apply sort direction
    return currentSort.direction === "asc" ? compareResult : -compareResult;
  });
}

function getFilteredDonations() {
  const term = uiFilters.donationSearch.trim().toLowerCase();
  const date = uiFilters.donationDate;
  const purpose = uiFilters.donationPurpose.trim().toLowerCase();
  return donations.filter((d) => {
    const matchesTerm =
      !term ||
      d.donorName.toLowerCase().includes(term) ||
      String(d.flatNumber).toLowerCase().includes(term) ||
      d.purpose.toLowerCase().includes(term);
    const matchesDate = !date || d.date === date;
    const matchesPurpose = !purpose || d.purpose.toLowerCase() === purpose;
    return matchesTerm && matchesDate && matchesPurpose;
  });
}

// Populate filter dropdowns from data
function populateFilterOptions() {
  const flatSel = document.getElementById("contribFlatFilter");
  if (flatSel) {
    const flats = Object.keys(membersByFlat);
    const selected = flatSel.value;
    flatSel.innerHTML =
      '<option value="">All Flats</option>' +
      flats.map((f) => `<option value="${f}">${f}</option>`).join("");
    if (selected && flats.includes(selected)) flatSel.value = selected;
  }
  const purposeSel = document.getElementById("donationsPurposeFilter");
  if (purposeSel) {
    const set = new Set(donations.map((d) => d.purpose).filter(Boolean));
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    const selected = purposeSel.value;
    purposeSel.innerHTML =
      '<option value="">All Purposes</option>' +
      arr.map((p) => `<option value="${p}">${p}</option>`).join("");
    if (selected && set.has(selected)) purposeSel.value = selected;
  }
}

// Persistence (IndexedDB)
const DB_NAME = "festivalFundDB";
const DB_VERSION = 1;
const STORE_NAME = "appState";
const STORAGE_KEY = "festivalFundDataV1"; // legacy localStorage key (for migration)

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveStateToDB() {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ key: "state", value: { fundContributions, donations } });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to save data to IndexedDB", e);
  }
}

async function loadStateFromDB() {
  try {
    const db = await openDB();
    const data = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("state");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (data && data.value) {
      const val = data.value;
      if (Array.isArray(val.fundContributions)) {
        fundContributions = val.fundContributions.map((item) => ({
          id: Number(item.id) || generateId([]),
          residentName: String(item.residentName || ""),
          amount: Number(item.amount) || 0,
          date: String(item.date || getCurrentDate()),
          flatNumber: String(item.flatNumber || ""),
          receivedBy: String(item.receivedBy || ""),
        }));
      }
      if (Array.isArray(val.donations)) {
        donations = val.donations.map((item) => ({
          id: Number(item.id) || generateId([]),
          donorName: String(item.donorName || ""),
          amount: Number(item.amount) || 0,
          purpose: String(item.purpose || ""),
          date: String(item.date || getCurrentDate()),
          flatNumber: String(item.flatNumber || ""),
          navaratriDay: Number(item.navaratriDay || "") || "",
        }));
      }
    }
  } catch (e) {
    console.error("Failed to load data from IndexedDB", e);
  }
}

async function migrateFromLocalStorageIfNeeded() {
  try {
    const db = await openDB();
    const existing = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("state");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (existing && existing.value) return; // already have DB state
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed) {
      const payload = {
        fundContributions: Array.isArray(parsed.fundContributions)
          ? parsed.fundContributions.map((item) => ({
              ...item,
              flatNumber: item.flatNumber || "",
              receivedBy: item.receivedBy || "",
            }))
          : [],
        donations: Array.isArray(parsed.donations)
          ? parsed.donations.map((item) => ({
              ...item,
              flatNumber: item.flatNumber || "",
              navaratriDay: item.navaratriDay || "",
            }))
          : [],
      };
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put({ key: "state", value: payload });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      localStorage.removeItem(STORAGE_KEY);
      try {
        showToast("Migrated previous data to secure storage.");
      } catch (_) {}
    }
  } catch (e) {
    console.error("Migration from localStorage failed", e);
  }
}

// Toast Notification System
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  toast.innerHTML = `
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

// Reusable confirmation modal helper
async function showConfirm(title, message) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const msgEl = document.getElementById("confirmMessage");
  const okBtn = document.getElementById("confirmOk");
  const cancelBtn = document.getElementById("confirmCancel");
  const overlay = modal ? modal.querySelector(".modal-overlay") : null;
  if (!modal || !titleEl || !msgEl || !okBtn || !cancelBtn) {
    console.warn("[Confirm] Modal elements missing", {
      modal: !!modal,
      title: !!titleEl,
      msg: !!msgEl,
      ok: !!okBtn,
      cancel: !!cancelBtn,
    });
    return confirm(message || "Are you sure?");
  }

  titleEl.textContent = title || "Confirm";
  msgEl.textContent = message || "Are you sure?";

  // Make visible
  modal.classList.remove("hidden");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  return new Promise((resolve) => {
    function cleanup(result) {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      if (overlay) overlay.removeEventListener("click", onCancel);
      resolve(result);
    }
    function onOk() {
      cleanup(true);
    }
    function onCancel() {
      cleanup(false);
    }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    if (overlay) overlay.addEventListener("click", onCancel);
  });
}

// Expose a test hook for debugging the modal quickly in console
window.testConfirm = () =>
  showConfirm("Test Confirm", "If you see this, the modal is wired correctly.");

// Modal Confirmation System
function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const messageEl = document.getElementById("confirmMessage");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  if (!modal || !titleEl || !messageEl || !yesBtn || !noBtn) return;

  titleEl.textContent = title;
  messageEl.textContent = message;

  // Remove previous event listeners by cloning
  const newYesBtn = yesBtn.cloneNode(true);
  const newNoBtn = noBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
  noBtn.parentNode.replaceChild(newNoBtn, noBtn);

  // Add new event listeners
  newYesBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    onConfirm();
  });

  newNoBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.classList.remove("hidden");
}

// Authentication Functions
function login(username, password) {
  console.log("Login attempt:", username, password);

  if (
    username.trim() === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    currentUser = username;
    isGuestUser = false;
    updateUserStatus();
    switchToMainApp();
    showToast("Login successful! Welcome to Festival Fund Manager.");
    return true;
  }

  console.log("Login failed");
  showToast("Invalid username or password. Please try again.", "error");
  return false;
}

function loginAsGuest() {
  currentUser = "Guest";
  isGuestUser = true;
  updateUserStatus();
  switchToMainApp();
  showToast("Viewing in guest mode. Some features are disabled.", "info");
}

function logout() {
  const wasGuest = isGuestUser;
  currentUser = null;
  isGuestUser = false;
  updateUserStatus();
  switchToLoginScreen();
  clearForms();
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.reset();
  showToast(
    wasGuest ? "Exited guest mode." : "Logged out successfully.",
    "info"
  );
}

function updateUserStatus() {
  const userStatusElement = document.getElementById("currentUserDisplay");
  const logoutBtn = document.getElementById("logoutBtn");
  const addContributionBtn = document.getElementById("addContributionBtn");
  const addDonationBtn = document.getElementById("addDonationBtn");

  if (currentUser) {
    if (userStatusElement) {
      userStatusElement.textContent = currentUser;
    }
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }

    // Show/hide action buttons based on user type
    if (isGuestUser) {
      document.body.classList.add("guest-mode");
      if (addContributionBtn) addContributionBtn.style.display = "none";
      if (addDonationBtn) addDonationBtn.style.display = "none";
    } else {
      document.body.classList.remove("guest-mode");
      if (addContributionBtn) addContributionBtn.style.display = "inline-flex";
      if (addDonationBtn) addDonationBtn.style.display = "inline-flex";
    }
  } else {
    if (userStatusElement) {
      userStatusElement.textContent = "Guest";
    }
    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }
  }
}

// Navigation Functions
function switchSection(sectionName) {
  console.log("Switching to section:", sectionName);

  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Remove active class from all nav tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show selected section
  const targetSection = document.getElementById(sectionName);
  const targetTab = document.querySelector(`[data-section="${sectionName}"]`);

  if (targetSection) {
    targetSection.classList.add("active");
    console.log("Section activated:", sectionName);
  }
  if (targetTab) {
    targetTab.classList.add("active");
    console.log("Tab activated:", sectionName);
  }

  currentSection = sectionName;

  // Update content based on section
  if (sectionName === "dashboard") {
    updateDashboard();
  } else if (sectionName === "contributions") {
    renderContributionsTable();
    hideContributionForm();
  } else if (sectionName === "donations") {
    renderDonationsTable();
    hideDonationForm();
  } else if (sectionName === "export") {
    updateExportCounts();
  }
}

function switchToMainApp() {
  const loginScreen = document.getElementById("loginScreen");
  const mainApp = document.getElementById("mainApp");

  if (loginScreen) {
    loginScreen.style.display = "none";
  }

  if (mainApp) {
    mainApp.style.display = "block";
    mainApp.classList.remove("hidden");
  }

  // Initialize dashboard and other components
  updateDashboard();
  renderContributionsTable();
  renderDonationsTable();
  updateExportCounts();

  // Ensure dashboard is the active section
  switchSection("dashboard");
}

function switchToLoginScreen() {
  const loginScreen = document.getElementById("loginScreen");
  const mainApp = document.getElementById("mainApp");

  if (mainApp) {
    mainApp.style.display = "none";
    mainApp.classList.add("hidden");
  }

  if (loginScreen) {
    loginScreen.style.display = "flex";
    loginScreen.classList.remove("hidden");
  }
}

// Dashboard Functions
function updateDashboard() {
  const totalContributions = fundContributions.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);

  const totalContributionsEl = document.getElementById("totalContributions");
  const contributionsCountEl = document.getElementById("contributionsCount");
  const totalDonationsEl = document.getElementById("totalDonations");
  const donationsCountEl = document.getElementById("donationsCount");

  if (totalContributionsEl)
    totalContributionsEl.textContent = formatAmount(totalContributions);
  if (contributionsCountEl)
    contributionsCountEl.textContent = `${fundContributions.length} contributions`;
  if (totalDonationsEl)
    totalDonationsEl.textContent = formatAmount(totalDonations);
  if (donationsCountEl)
    donationsCountEl.textContent = `${donations.length} donations`;
}

function updateDashboardSummary() {
  const contributions = getFilteredContributions();
  const totalContributions = contributions.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalDonations = donations.reduce((sum, item) => sum + item.amount, 0);

  const totalContributionsEl = document.getElementById("totalContributions");
  const contributionsCountEl = document.getElementById("contributionsCount");
  const totalDonationsEl = document.getElementById("totalDonations");
  const donationsCountEl = document.getElementById("donationsCount");

  if (totalContributionsEl) {
    totalContributionsEl.textContent = `₹${totalContributions.toLocaleString(
      "en-IN"
    )}`;
  }
  if (contributionsCountEl) {
    contributionsCountEl.textContent = `${contributions.length} contribution${
      contributions.length !== 1 ? "s" : ""
    }`;
  }
  if (totalDonationsEl) {
    totalDonationsEl.textContent = `₹${totalDonations.toLocaleString("en-IN")}`;
  }
  if (donationsCountEl) {
    donationsCountEl.textContent = `${donations.length} donation${
      donations.length !== 1 ? "s" : ""
    }`;
  }
}

// Fund Contributions Functions
function renderContributionsTable() {
  const tbody = document.getElementById("contributionsTableBody");
  if (!tbody) return;

  // Update the table headers with sort indicators
  updateTableHeaders();

  const filtered = getFilteredContributions();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <h3>No contributions found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new contribution."
          }</p>
        </td>
      </tr>`;

    // Clear mobile view if it exists
    const existingMobileContainer =
      document.querySelector(".data-table-mobile");
    if (existingMobileContainer) {
      existingMobileContainer.innerHTML = `
        <div class="empty-state">
          <h3>No contributions found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new contribution."
          }</p>
        </div>`;
    }
    return;
  }

  // Generate mobile cards
  const mobileContainer = document.createElement("div");
  mobileContainer.className = "data-table-mobile";

  filtered.forEach((contribution, index) => {
    const card = document.createElement("div");
    card.className = "data-card";

    // Card header with Flat and Amount
    const header = document.createElement("div");
    header.className = "data-card__header";
    header.innerHTML = `
      <h3 class="data-card__title">${contribution.flatNumber || "N/A"}</h3>
      <span class="amount">${formatAmount(contribution.amount)}</span>
    `;

    // Card content
    const content = document.createElement("div");
    content.className = "data-card__content";
    content.innerHTML = `
      <div class="data-row">
        <span class="data-label">Resident Name:</span>
        <span class="data-value">${contribution.residentName || "N/A"}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Date:</span>
        <span class="data-value">${formatDate(contribution.date)}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Received By:</span>
        <span class="data-value">${contribution.receivedBy || "N/A"}</span>
      </div>
    `;

    // Actions (for non-guest users)
    if (!isGuestUser) {
      const actions = document.createElement("div");
      actions.className = "data-actions";
      actions.innerHTML = `
        <button class="btn btn--outline btn--sm" onclick="editContribution(${contribution.id})">Edit</button>
        <button class="btn btn--outline btn--sm" onclick="deleteContribution(${contribution.id})">Delete</button>
      `;
      card.appendChild(actions);
    }

    card.prepend(header, content);
    mobileContainer.appendChild(card);
  });

  // Insert or update the mobile container
  const tableContainer =
    tbody.closest(".table-responsive") ||
    tbody.closest(".card__body") ||
    tbody.closest("section");
  const existingMobileContainer =
    tableContainer.querySelector(".data-table-mobile");

  if (existingMobileContainer) {
    existingMobileContainer.replaceWith(mobileContainer);
  } else {
    tableContainer.insertBefore(mobileContainer, tableContainer.firstChild);
  }

  // Regular table (hidden on mobile)
  tbody.innerHTML = filtered
    .map(
      (contribution, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${contribution.flatNumber || ""}</td>
        <td>${contribution.residentName}</td>
        <td class="amount">${formatAmount(contribution.amount)}</td>
        <td>${formatDate(contribution.date)}</td>
        <td>${contribution.receivedBy || ""}</td>
        ${
          !isGuestUser
            ? `
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn btn--outline btn--sm" onclick="editContribution(${contribution.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="deleteContribution(${contribution.id})">Delete</button>
          </div>
        </td>
        `
            : ""
        }
      </tr>
    `
    )
    .join("");
}

function showContributionForm() {
  const form = document.getElementById("contributionForm");
  const dateInput = document.getElementById("contributionDate");
  const nameInput = document.getElementById("residentName");

  if (form) form.classList.remove("hidden");
  if (dateInput) dateInput.value = getCurrentDate();
  if (nameInput) nameInput.focus();
}

function hideContributionForm() {
  const form = document.getElementById("contributionForm");
  if (form) form.classList.add("hidden");
  clearContributionForm();
}

function clearContributionForm() {
  const formElement = document.getElementById("contributionFormElement");
  const editIdInput = document.getElementById("editContributionId");
  const titleElement = document.getElementById("contributionFormTitle");

  if (formElement) formElement.reset();
  if (editIdInput) editIdInput.value = "";
  if (titleElement) titleElement.textContent = "Add New Contribution";

  editingContribution = null;
}

function validateContribution(residentName, amount, date, flatNumber) {
  const errors = [];

  if (!flatNumber || !flatNumber.trim()) {
    errors.push("Flat number is required");
  }

  if (!residentName.trim()) {
    errors.push("Resident name is required");
  }

  if (!amount || amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (!date) {
    errors.push("Date is required");
  }

  // Prevent duplicate entry for the same flat and date
  const duplicate = fundContributions.find(
    (c) =>
      c.flatNumber === flatNumber &&
      c.date === date &&
      (!editingContribution || c.id !== editingContribution.id)
  );

  if (duplicate) {
    errors.push("A contribution for this flat on this date already exists");
  }

  return errors;
}

function addContribution(residentName, amount, date, flatNumber, receivedBy) {
  const errors = validateContribution(residentName, amount, date, flatNumber);
  if (errors.length > 0) {
    showToast(errors.join(". "), "error");
    return false;
  }

  const newContribution = {
    id: generateId(fundContributions),
    residentName: residentName.trim(),
    amount: parseFloat(amount),
    date: date,
    flatNumber: flatNumber,
    receivedBy: receivedBy.trim(),
  };

  fundContributions.push(newContribution);
  renderContributionsTable();
  hideContributionForm();
  updateDashboard();
  showToast(`Contribution from ${residentName} added successfully!`);
  if (isFirebaseReady()) {
    upsertContributionToFirestore(newContribution).catch(console.error);
  } else {
    saveStateToDB().catch((err) => console.error(err));
  }
  return true;
}

function editContribution(id) {
  const contribution = fundContributions.find((c) => c.id === id);
  if (!contribution) return;

  editingContribution = contribution;

  const editIdInput = document.getElementById("editContributionId");
  const nameInput = document.getElementById("residentName");
  const amountInput = document.getElementById("contributionAmount");
  const dateInput = document.getElementById("contributionDate");
  const titleElement = document.getElementById("contributionFormTitle");
  const flatSel = document.getElementById("flatNumber");
  const receivedByInput = document.getElementById("receivedBy");

  if (editIdInput) editIdInput.value = id;
  if (nameInput) nameInput.value = contribution.residentName;
  if (amountInput) amountInput.value = contribution.amount;
  if (dateInput) dateInput.value = contribution.date;
  if (titleElement) titleElement.textContent = "Edit Contribution";
  if (flatSel) flatSel.value = contribution.flatNumber || "";
  if (receivedByInput) receivedByInput.value = contribution.receivedBy || "";

  showContributionForm();
}

function updateContribution(
  id,
  residentName,
  amount,
  date,
  flatNumber,
  receivedBy
) {
  const errors = validateContribution(residentName, amount, date, flatNumber);
  if (errors.length > 0) {
    showToast(errors.join(". "), "error");
    return false;
  }

  const index = fundContributions.findIndex((c) => c.id === id);
  if (index === -1) return false;

  fundContributions[index] = {
    id: id,
    residentName: residentName.trim(),
    amount: parseFloat(amount),
    date: date,
    flatNumber: flatNumber,
    receivedBy: receivedBy.trim(),
  };

  renderContributionsTable();
  hideContributionForm();
  updateDashboard();
  showToast(`Contribution from ${residentName} updated successfully!`);
  if (isFirebaseReady()) {
    upsertContributionToFirestore(fundContributions[index]).catch(
      console.error
    );
  } else {
    saveStateToDB().catch((err) => console.error(err));
  }
  return true;
}

async function deleteContribution(id) {
  const index = fundContributions.findIndex((c) => c.id === id);
  if (index === -1) return;
  const contribution = fundContributions[index];
  const ok = await showConfirm(
    "Delete Contribution",
    `Are you sure you want to delete the contribution from ${contribution.residentName}?`
  );
  if (!ok) return;
  try {
    if (isFirebaseReady()) await deleteContributionFromFirestore(id);
    fundContributions.splice(index, 1);
    renderContributionsTable();
    updateDashboard();
    showToast("Contribution deleted successfully", "success");
  } catch (e) {
    console.error("Failed to delete contribution", e);
    showToast("Failed to delete contribution", "error");
  }
}

// Donations Functions
function renderDonationsTable() {
  const tbody = document.getElementById("donationsTableBody");
  if (!tbody) return;
  const filtered = getFilteredDonations();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <h3>No donations found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new donation."
          }</p>
        </td>
      </tr>`;

    // Clear mobile view if it exists
    const existingMobileContainer = document.querySelector(".donations-mobile");
    if (existingMobileContainer) {
      existingMobileContainer.innerHTML = `
        <div class="empty-state">
          <h3>No donations found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new donation."
          }</p>
        </div>`;
    }
    return;
  }

  // Generate mobile cards
  const mobileContainer = document.createElement("div");
  mobileContainer.className = "data-table-mobile donations-mobile";

  filtered.forEach((donation, index) => {
    const card = document.createElement("div");
    card.className = "data-card";

    // Card header with Flat and Amount
    const header = document.createElement("div");
    header.className = "data-card__header";
    header.innerHTML = `
      <h3 class="data-card__title">${donation.flatNumber || "N/A"}</h3>
      <span class="amount">${formatAmount(donation.amount)}</span>
    `;

    // Card content
    const content = document.createElement("div");
    content.className = "data-card__content";
    content.innerHTML = `
      <div class="data-row">
        <span class="data-label">Donor Name:</span>
        <span class="data-value">${donation.donorName || "N/A"}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Purpose:</span>
        <span class="data-value">${donation.purpose || "N/A"}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Date:</span>
        <span class="data-value">${formatDate(donation.date)}</span>
      </div>
      ${
        donation.navaratriDay
          ? `
      <div class="data-row">
        <span class="data-label">Navaratri Day:</span>
        <span class="data-value">${donation.navaratriDay}</span>
      </div>`
          : ""
      }
    `;

    // Actions (for non-guest users)
    if (!isGuestUser) {
      const actions = document.createElement("div");
      actions.className = "data-actions";
      actions.innerHTML = `
        <button class="btn btn--outline btn--sm" onclick="editDonation(${donation.id})">Edit</button>
        <button class="btn btn--outline btn--sm" onclick="deleteDonation(${donation.id})">Delete</button>
      `;
      card.appendChild(actions);
    }

    card.prepend(header, content);
    mobileContainer.appendChild(card);
  });

  // Insert or update the mobile container
  const tableContainer =
    tbody.closest(".table-responsive") ||
    tbody.closest(".card__body") ||
    tbody.closest("section");
  const existingMobileContainer =
    tableContainer.querySelector(".donations-mobile");

  if (existingMobileContainer) {
    existingMobileContainer.replaceWith(mobileContainer);
  } else {
    tableContainer.insertBefore(mobileContainer, tableContainer.firstChild);
  }

  // Regular table (hidden on mobile)
  tbody.innerHTML = filtered
    .map(
      (donation, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${donation.flatNumber || ""}</td>
        <td>${donation.donorName || ""}</td>
        <td class="amount">${formatAmount(donation.amount)}</td>
        <td>${donation.purpose || ""}</td>
        <td>${formatDate(donation.date)}</td>
        ${
          !isGuestUser
            ? `
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn btn--outline btn--sm" onclick="editDonation(${donation.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="deleteDonation(${donation.id})">Delete</button>
          </div>
        </td>
        `
            : ""
        }
      </tr>
    `
    )
    .join("");
}

function showDonationForm() {
  const form = document.getElementById("donationForm");
  const dateInput = document.getElementById("donationDate");
  const nameInput = document.getElementById("donorName");

  if (form) form.classList.remove("hidden");
  if (dateInput) dateInput.value = getCurrentDate();
  if (nameInput) nameInput.focus();
}

function hideDonationForm() {
  const form = document.getElementById("donationForm");
  if (form) form.classList.add("hidden");
  clearDonationForm();
}

function clearDonationForm() {
  const formElement = document.getElementById("donationFormElement");
  const editIdInput = document.getElementById("editDonationId");
  const titleElement = document.getElementById("donationFormTitle");

  if (formElement) formElement.reset();
  if (editIdInput) editIdInput.value = "";
  if (titleElement) titleElement.textContent = "Add New Donation";

  editingDonation = null;
}

function validateDonation(donorName, amount, purpose, date, flatNumber) {
  const errors = [];

  if (!flatNumber || !flatNumber.trim()) {
    errors.push("Flat number is required");
  }

  if (!donorName.trim()) {
    errors.push("Donor name is required");
  }

  if (!amount || amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (!purpose || !purpose.trim()) {
    errors.push("Purpose is required");
  }

  if (!date) {
    errors.push("Date is required");
  }

  // Check for duplicates (same flat, purpose, and date)
  const duplicate = donations.find(
    (d) =>
      d.flatNumber === flatNumber &&
      d.purpose.toLowerCase() === purpose.toLowerCase() &&
      d.date === date &&
      (!editingDonation || d.id !== editingDonation.id)
  );

  if (duplicate) {
    errors.push(
      "A donation for this flat and purpose on this date already exists"
    );
  }

  return errors;
}

function addDonation(
  donorName,
  amount,
  purpose,
  date,
  flatNumber,
  navaratriDay
) {
  const errors = validateDonation(donorName, amount, purpose, date, flatNumber);
  if (errors.length > 0) {
    showToast(errors.join(". "), "error");
    return false;
  }

  const newDonation = {
    id: generateId(donations),
    donorName: donorName.trim(),
    amount: parseFloat(amount),
    purpose: purpose.trim(),
    date: date,
    flatNumber: flatNumber,
    navaratriDay: navaratriDay ? Number(navaratriDay) : "",
  };

  donations.push(newDonation);
  renderDonationsTable();
  hideDonationForm();
  updateDashboard();
  showToast(`Donation from ${donorName} added successfully!`);
  if (isFirebaseReady()) {
    upsertDonationToFirestore(newDonation).catch(console.error);
  } else {
    saveStateToDB().catch((err) => console.error(err));
  }
  return true;
}

function editDonation(id) {
  const donation = donations.find((d) => d.id === id);
  if (!donation) return;

  editingDonation = donation;

  const editIdInput = document.getElementById("editDonationId");
  const nameInput = document.getElementById("donorName");
  const amountInput = document.getElementById("donationAmount");
  const purposeInput = document.getElementById("donationPurpose");
  const dateInput = document.getElementById("donationDate");
  const titleElement = document.getElementById("donationFormTitle");
  const flatSel = document.getElementById("donationFlatNumber");
  const daySel = document.getElementById("navaratriDay");
  const purposeSel = document.getElementById("donationPurposeSelect");
  const purposeOther = document.getElementById("donationPurposeOther");

  if (editIdInput) editIdInput.value = id;
  if (nameInput) nameInput.value = donation.donorName;
  if (amountInput) amountInput.value = donation.amount;
  if (purposeSel) {
    // If current purpose matches one of the options, select it; else choose Other and fill box
    const options = Array.from(purposeSel.options).map((o) => o.value);
    if (options.includes(donation.purpose)) {
      purposeSel.value = donation.purpose;
      if (purposeOther) {
        purposeOther.value = "";
        purposeOther.disabled = true;
      }
    } else {
      purposeSel.value = "Other";
      if (purposeOther) {
        purposeOther.disabled = false;
        purposeOther.value = donation.purpose;
      }
    }
  }
  if (dateInput) dateInput.value = donation.date;
  if (titleElement) titleElement.textContent = "Edit Donation";
  if (flatSel) flatSel.value = donation.flatNumber || "";
  if (daySel)
    daySel.value = donation.navaratriDay ? String(donation.navaratriDay) : "";
  if (daySel && dateInput && daySel.value) {
    dateInput.value = getNavaratriDateByDay(daySel.value);
  }

  showDonationForm();
}

function updateDonation(
  id,
  donorName,
  amount,
  purpose,
  date,
  flatNumber,
  navaratriDay
) {
  const errors = validateDonation(donorName, amount, purpose, date, flatNumber);
  if (errors.length > 0) {
    showToast(errors.join(". "), "error");
    return false;
  }

  const index = donations.findIndex((d) => d.id === id);
  if (index === -1) return false;

  donations[index] = {
    id: id,
    donorName: donorName.trim(),
    amount: parseFloat(amount),
    purpose: purpose.trim(),
    date: date,
    flatNumber: flatNumber,
    navaratriDay: navaratriDay ? Number(navaratriDay) : "",
  };

  renderDonationsTable();
  hideDonationForm();
  updateDashboard();
  showToast(`Donation from ${donorName} updated successfully!`);
  if (isFirebaseReady()) {
    upsertDonationToFirestore(donations[index]).catch(console.error);
  } else {
    saveStateToDB().catch((err) => console.error(err));
  }
  return true;
}

async function deleteDonation(id) {
  const index = donations.findIndex((d) => d.id === id);
  if (index === -1) return;
  const donation = donations[index];
  const ok = await showConfirm(
    "Delete Donation",
    `Are you sure you want to delete the donation from ${donation.donorName}?`
  );
  if (!ok) return;
  try {
    if (isFirebaseReady()) await deleteDonationFromFirestore(id);
    donations.splice(index, 1);
    renderDonationsTable();
    updateDashboard();
    showToast("Donation deleted successfully", "success");
  } catch (e) {
    console.error("Failed to delete donation", e);
    showToast("Failed to delete donation", "error");
  }
}

// Export Functions
function updateExportCounts() {
  const contributionsCountEl = document.getElementById(
    "exportContributionsCount"
  );
  const donationsCountEl = document.getElementById("exportDonationsCount");

  if (contributionsCountEl)
    contributionsCountEl.textContent = fundContributions.length;
  if (donationsCountEl) donationsCountEl.textContent = donations.length;
}

function exportData() {
  const exportData = {
    exportDate: new Date().toISOString(),
    summary: {
      totalContributions: fundContributions.reduce(
        (sum, item) => sum + item.amount,
        0
      ),
      totalDonations: donations.reduce((sum, item) => sum + item.amount, 0),
      contributionsCount: fundContributions.length,
      donationsCount: donations.length,
    },
    fundContributions: fundContributions,
    donations: donations,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `festival-fund-data-${getCurrentDate()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Data exported successfully!");
}

// Theme helpers
function applyTheme(theme) {
  const body = document.body;
  if (!body) return;
  body.classList.remove("theme-modern", "theme-traditional", "theme-apple");
  if (theme === "traditional") {
    body.classList.add("theme-traditional");
  } else if (theme === "apple") {
    body.classList.add("theme-apple");
  } else {
    body.classList.add("theme-modern");
  }
  const sel = document.getElementById("themeSelect");
  if (sel)
    sel.value =
      theme === "traditional"
        ? "traditional"
        : theme === "apple"
        ? "apple"
        : "modern";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_) {}
}

function initThemeFromStorage() {
  let theme = "apple"; // default to Apple
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (["traditional", "modern", "apple"].includes(saved)) theme = saved;
  } catch (_) {}
  applyTheme(theme);
}

// Utility Functions
function clearForms() {
  clearContributionForm();
  clearDonationForm();
  hideContributionForm();
  hideDonationForm();
}

// Initialize Application
async function initializeApp() {
  console.log("Initializing application...");
  // Apply saved theme early
  initThemeFromStorage();

  // If Firebase is available, subscribe to real-time updates; otherwise fall back
  if (isFirebaseReady()) {
    // Fetch existing data first so lists are populated on refresh
    await initialFetchFromFirestore();
    await subscribeToFirestore();
  } else {
    await migrateFromLocalStorageIfNeeded();
    await loadStateFromDB();
    populateFilterOptions();
    renderContributionsTable();
    renderDonationsTable();
    updateDashboard();
  }

  // Set up login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      login(username, password);
    });
  }

  // Set up logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Set up navigation tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const section = this.dataset.section;
      switchSection(section);
    });
  });

  // Contributions form wiring
  const addContributionBtn = document.getElementById("addContributionBtn");
  if (addContributionBtn) {
    addContributionBtn.addEventListener("click", () => {
      populateFlatDropdown();
      showContributionForm();
    });
  }

  const cancelContributionBtn = document.getElementById(
    "cancelContributionBtn"
  );
  if (cancelContributionBtn) {
    cancelContributionBtn.addEventListener("click", hideContributionForm);
  }

  const contributionFormElement = document.getElementById(
    "contributionFormElement"
  );
  if (contributionFormElement) {
    populateFlatDropdown();
    const flatSel = document.getElementById("flatNumber");
    const nameInput = document.getElementById("residentName");
    if (flatSel && nameInput) {
      flatSel.addEventListener("change", () => {
        const selected = flatSel.value;
        if (membersByFlat[selected]) {
          nameInput.value = membersByFlat[selected];
        }
      });
    }
    contributionFormElement.addEventListener("submit", function (e) {
      e.preventDefault();
      const residentName = document.getElementById("residentName").value;
      const amount = document.getElementById("contributionAmount").value;
      const date = document.getElementById("contributionDate").value;
      const flatNumber = document.getElementById("flatNumber").value;
      const receivedBy = document.getElementById("receivedBy").value;
      const editId = document.getElementById("editContributionId").value;
      if (editId) {
        updateContribution(
          parseInt(editId),
          residentName,
          amount,
          date,
          flatNumber,
          receivedBy
        );
      } else {
        addContribution(residentName, amount, date, flatNumber, receivedBy);
      }
    });
  }

  // Donations form wiring
  const addDonationBtn = document.getElementById("addDonationBtn");
  if (addDonationBtn) {
    addDonationBtn.addEventListener("click", () => {
      populateDonationFlatDropdown();
      populateNavaratriDayDropdown();
      showDonationForm();
    });
  }

  const cancelDonationBtn = document.getElementById("cancelDonationBtn");
  if (cancelDonationBtn) {
    cancelDonationBtn.addEventListener("click", hideDonationForm);
  }

  const donationFormElement = document.getElementById("donationFormElement");
  if (donationFormElement) {
    populateDonationFlatDropdown();
    populateNavaratriDayDropdown();
    const donationFlatSel = document.getElementById("donationFlatNumber");
    const donorNameInput = document.getElementById("donorName");
    if (donationFlatSel && donorNameInput) {
      donationFlatSel.addEventListener("change", () => {
        const selected = donationFlatSel.value;
        if (membersByFlat[selected]) {
          donorNameInput.value = membersByFlat[selected];
        }
      });
    }
    const daySel = document.getElementById("navaratriDay");
    const dateInput = document.getElementById("donationDate");
    if (daySel && dateInput) {
      daySel.addEventListener("change", () => {
        const d = getNavaratriDateByDay(daySel.value);
        if (d) dateInput.value = d;
      });
    }
    const purposeSel = document.getElementById("donationPurposeSelect");
    const purposeOther = document.getElementById("donationPurposeOther");
    if (purposeSel && purposeOther) {
      purposeSel.addEventListener("change", () => {
        const isOther = purposeSel.value === "Other";
        purposeOther.disabled = !isOther;
        if (!isOther) purposeOther.value = "";
      });
    }
    donationFormElement.addEventListener("submit", function (e) {
      e.preventDefault();
      const donorName = document.getElementById("donorName").value;
      const amount = document.getElementById("donationAmount").value;
      const purposeSelEl = document.getElementById("donationPurposeSelect");
      const purposeOtherEl = document.getElementById("donationPurposeOther");
      const purpose =
        purposeSelEl && purposeSelEl.value === "Other"
          ? (purposeOtherEl.value || "").trim()
          : (purposeSelEl.value || "").trim();
      const date = document.getElementById("donationDate").value;
      const flatNumber = document.getElementById("donationFlatNumber").value;
      const navaratriDay = document.getElementById("navaratriDay")
        ? document.getElementById("navaratriDay").value
        : "";
      const editId = document.getElementById("editDonationId").value;
      if (editId) {
        updateDonation(
          parseInt(editId),
          donorName,
          amount,
          purpose,
          date,
          flatNumber,
          navaratriDay
        );
      } else {
        addDonation(donorName, amount, purpose, date, flatNumber, navaratriDay);
      }
    });
  }

  // Export
  const exportDataBtn = document.getElementById("exportDataBtn");
  if (exportDataBtn) {
    exportDataBtn.addEventListener("click", exportData);
  }

  // Theme toggle wiring
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    initThemeFromStorage();
    themeSelect.addEventListener("change", () => {
      const val = ["apple", "traditional", "modern"].includes(themeSelect.value)
        ? themeSelect.value
        : "apple";
      applyTheme(val);
    });
  }

  // Confirm modal overlay click to close (compatible with new modal)
  const confirmModal = document.getElementById("confirmModal");
  if (confirmModal) {
    confirmModal.addEventListener("click", function (e) {
      if (e.target === this || e.target.classList.contains("modal-overlay")) {
        this.classList.remove("show");
      }
    });
  }

  // Add event listener for skip login button
  const skipLoginBtn = document.getElementById("skipLoginBtn");
  if (skipLoginBtn) {
    skipLoginBtn.addEventListener("click", loginAsGuest);
  }

  console.log("Application initialized successfully");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initializeApp);

// Clear All Data
async function clearAllData() {
  try {
    // Firestore: delete all docs if configured
    if (isFirebaseReady()) {
      const { getDocs } = Fire.fns;
      const dels = [];
      const donSnap = await getDocs(Fire.col("donations"));
      donSnap.forEach((d) => dels.push(deleteDonationFromFirestore(d.id)));
      const conSnap = await getDocs(Fire.col("contributions"));
      conSnap.forEach((d) => dels.push(deleteContributionFromFirestore(d.id)));
      await Promise.allSettled(dels);
    }
    // Delete IndexedDB database (fallback)
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve(); // proceed anyway
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}

    fundContributions = [];
    donations = [];
    editingContribution = null;
    editingDonation = null;

    updateDashboard();
    renderContributionsTable();
    renderDonationsTable();
    updateExportCounts();

    showToast("All data cleared successfully.", "warning");
  } catch (e) {
    console.error("Failed to clear data", e);
    showToast("Failed to clear data. Please try again.", "error");
  }
}

// Helper function to escape HTML (for security)
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
}

// Add event listener for refresh button
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refreshDashboardBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", updateDashboardSummary);
  }

  // Update dashboard when switching to it
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.section === "dashboard") {
        updateDashboardSummary();
      }
    });
  });

  // Initial dashboard update
  updateDashboardSummary();
});

// Aarati Schedule Data and Functions
let aaratiSchedule = [
  { id: 1, date: "2025-09-22", day: "સોમવાર", flatNumbers: [] },
  { id: 2, date: "2025-09-23", day: "મંગળવાર", flatNumbers: [] },
  { id: 3, date: "2025-09-24", day: "બુધવાર", flatNumbers: [] },
  { id: 4, date: "2025-09-25", day: "ગુરુવાર", flatNumbers: [] },
  { id: 5, date: "2025-09-26", day: "શુક્રવાર", flatNumbers: [] },
  { id: 6, date: "2025-09-27", day: "શનિવાર", flatNumbers: [] },
  { id: 7, date: "2025-09-28", day: "રવિવાર", flatNumbers: [] },
  { id: 8, date: "2025-09-29", day: "સોમવાર", flatNumbers: [] },
  { id: 9, date: "2025-09-30", day: "મંગળવાર", flatNumbers: [] },
  { id: 10, date: "2025-10-01", day: "બુધવાર", flatNumbers: [] },
];

// Format date to display as "22 સપ્ટેમ્બર, 2025"
function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("gu-IN", options);
}

// Render the Aarati Schedule table
function renderAaratiSchedule() {
  const tbody = document.getElementById("aaratiScheduleBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  aaratiSchedule.forEach((entry, index) => {
    const tr = document.createElement("tr");
    tr.dataset.id = entry.id;

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${formatDisplayDate(entry.date)}</td>
      <td>${entry.day}</td>
      <td>
        <div class="flat-tags" id="flats-${entry.id}">
          ${entry.flatNumbers
            .map(
              (flat) =>
                `<span class="flat-tag">${flat}
              <button class="flat-remove" data-id="${entry.id}" data-flat="${flat}">&times;</button>
            </span>`
            )
            .join("")}
        </div>
        <div class="flat-input-group">
          <input type="text" class="flat-input" id="flat-input-${entry.id}" 
                 placeholder="Add flat number (e.g., GH-101)" />
          <button class="btn btn--small btn--primary add-flat" data-id="${
            entry.id
          }">Add</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Add event listeners for flat input
  document.querySelectorAll(".add-flat").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      const input = document.getElementById(`flat-input-${id}`);
      const flatNumber = input.value.trim().toUpperCase();

      if (flatNumber && flatNumber.match(/^GH-\d{3}$/)) {
        const entry = aaratiSchedule.find((e) => e.id === id);
        if (entry && !entry.flatNumbers.includes(flatNumber)) {
          entry.flatNumbers.push(flatNumber);
          renderAaratiSchedule();
          saveAaratiSchedule();
        }
        input.value = "";
      } else {
        showToast("Please enter a valid flat number (e.g., GH-101)", "error");
      }
    });
  });

  // Add event listeners for flat removal
  document.querySelectorAll(".flat-remove").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(button.dataset.id);
      const flatNumber = button.dataset.flat;
      const entry = aaratiSchedule.find((e) => e.id === id);

      if (entry) {
        entry.flatNumbers = entry.flatNumbers.filter((f) => f !== flatNumber);
        renderAaratiSchedule();
        saveAaratiSchedule();
      }
    });
  });

  // Allow pressing Enter in flat input
  document.querySelectorAll(".flat-input").forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const id = parseInt(input.id.replace("flat-input-", ""));
        const addButton = document.querySelector(`.add-flat[data-id="${id}"]`);
        if (addButton) addButton.click();
      }
    });
  });
}

// Save schedule to localStorage
function saveAaratiSchedule() {
  try {
    localStorage.setItem("aaratiSchedule", JSON.stringify(aaratiSchedule));
  } catch (e) {
    console.error("Error saving schedule:", e);
  }
}

// Load schedule from localStorage
function loadAaratiSchedule() {
  try {
    const saved = localStorage.getItem("aaratiSchedule");
    if (saved) {
      aaratiSchedule = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading schedule:", e);
  }
}

// Add a new Aarati entry
function addAaratiEntry() {
  const newId =
    aaratiSchedule.length > 0
      ? Math.max(...aaratiSchedule.map((e) => e.id)) + 1
      : 1;
  const newDate = new Date(aaratiSchedule[aaratiSchedule.length - 1].date);
  newDate.setDate(newDate.getDate() + 1);

  const days = [
    "રવિવાર",
    "સોમવાર",
    "મંગળવાર",
    "બુધવાર",
    "ગુરુવાર",
    "શુક્રવાર",
    "શનિવાર",
  ];
  const dayName = days[newDate.getDay()];

  aaratiSchedule.push({
    id: newId,
    date: newDate.toISOString().split("T")[0],
    day: dayName,
    flatNumbers: [],
  });

  saveAaratiSchedule();
  renderAaratiSchedule();
}

// Delete an Aarati entry
function deleteAaratiEntry(id) {
  showConfirm(
    "Delete Entry",
    "Are you sure you want to delete this entry?",
    () => {
      aaratiSchedule = aaratiSchedule.filter((entry) => entry.id !== id);
      saveAaratiSchedule();
      renderAaratiSchedule();
      showToast("Entry deleted successfully");
    }
  );
}

// Initialize Aarati Schedule
document.addEventListener("DOMContentLoaded", () => {
  // Load saved schedule
  loadAaratiSchedule();

  // Add event listener for Add Entry button
  const addBtn = document.getElementById("addAaratiEntryBtn");
  if (addBtn) {
    addBtn.addEventListener("click", addAaratiEntry);
  }

  // Initial render
  renderAaratiSchedule();
});

// Add these variables at the top with other state variables
let currentSort = { column: "flat", direction: "asc" }; // Default sort by flat ascending
let currentDonationSort = { column: "flat", direction: "asc" }; // Default sort by flat ascending

// Update the getFilteredContributions function to include sorting
function getFilteredContributions() {
  const term = uiFilters.contribSearch.trim().toLowerCase();
  const date = uiFilters.contribDate;
  const flat = uiFilters.contribFlat;

  // Filter the data first
  const filtered = fundContributions.filter((c) => {
    const matchesTerm =
      !term ||
      c.residentName.toLowerCase().includes(term) ||
      String(c.flatNumber).toLowerCase().includes(term);
    const matchesDate = !date || c.date === date;
    const matchesFlat = !flat || c.flatNumber === flat;
    return matchesTerm && matchesDate && matchesFlat;
  });

  // Helper function to extract numeric part from flat number
  const getFlatNumber = (flatStr) => {
    if (!flatStr) return 0;
    // Remove all non-digit characters and convert to number
    const num = flatStr.replace(/\D/g, "");
    return parseInt(num, 10) || 0;
  };

  // Then sort the filtered results
  return [...filtered].sort((a, b) => {
    let compareResult = 0;

    switch (currentSort.column) {
      case "flat":
        // Sort by numeric part of flat number
        const aNum = getFlatNumber(a.flatNumber);
        const bNum = getFlatNumber(b.flatNumber);
        compareResult = aNum - bNum;
        break;
      case "date":
        compareResult = new Date(a.date) - new Date(b.date);
        break;
      case "amount":
        compareResult = a.amount - b.amount;
        break;
      case "name":
        compareResult = (a.residentName || "").localeCompare(
          b.residentName || ""
        );
        break;
      default:
        compareResult = 0;
    }

    // Apply sort direction
    return currentSort.direction === "asc" ? compareResult : -compareResult;
  });
}

function getFilteredDonations() {
  const term = uiFilters.donationSearch.trim().toLowerCase();
  const date = uiFilters.donationDate;
  const purpose = uiFilters.donationPurpose.trim().toLowerCase();

  // Filter the data first
  const filtered = donations.filter((d) => {
    const matchesTerm =
      !term ||
      d.donorName.toLowerCase().includes(term) ||
      String(d.flatNumber).toLowerCase().includes(term) ||
      d.purpose.toLowerCase().includes(term);
    const matchesDate = !date || d.date === date;
    const matchesPurpose = !purpose || d.purpose.toLowerCase() === purpose;
    return matchesTerm && matchesDate && matchesPurpose;
  });

  // Helper function to extract numeric part from flat number
  const getFlatNumber = (flatStr) => {
    if (!flatStr) return 0;
    const num = flatStr.replace(/\D/g, "");
    return parseInt(num, 10) || 0;
  };

  // Then sort the filtered results
  return [...filtered].sort((a, b) => {
    let compareResult = 0;

    switch (currentDonationSort.column) {
      case "flat":
        const aFlatNum = getFlatNumber(a.flatNumber);
        const bFlatNum = getFlatNumber(b.flatNumber);
        compareResult = aFlatNum - bFlatNum;
        break;
      case "date":
        compareResult = new Date(a.date) - new Date(b.date);
        break;
      case "amount":
        compareResult = a.amount - b.amount;
        break;
      case "donor":
        compareResult = (a.donorName || "").localeCompare(b.donorName || "");
        break;
      default:
        compareResult = 0;
    }

    // Apply sort direction
    return currentDonationSort.direction === "asc"
      ? compareResult
      : -compareResult;
  });
}

// Add this function to handle header clicks
function handleSort(column) {
  if (currentSort.column === column) {
    // Toggle direction if clicking the same column
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    // New column, default to ascending
    currentSort.column = column;
    currentSort.direction = "asc";
  }
  renderContributionsTable();
}

function handleDonationSort(column) {
  if (currentDonationSort.column === column) {
    // Toggle direction if clicking the same column
    currentDonationSort.direction =
      currentDonationSort.direction === "asc" ? "desc" : "asc";
  } else {
    // New column, default to ascending
    currentDonationSort.column = column;
    currentDonationSort.direction = "asc";
  }
  renderDonationsTable();
}

// Update the renderContributionsTable function to include sort indicators
function renderContributionsTable() {
  const tbody = document.getElementById("contributionsTableBody");
  if (!tbody) return;

  // Update the table headers with sort indicators
  updateTableHeaders();

  const filtered = getFilteredContributions();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <h3>No contributions found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new contribution."
          }</p>
        </td>
      </tr>`;

    // Clear mobile view if it exists
    const existingMobileContainer =
      document.querySelector(".data-table-mobile");
    if (existingMobileContainer) {
      existingMobileContainer.innerHTML = `
        <div class="empty-state">
          <h3>No contributions found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new contribution."
          }</p>
        </div>`;
    }
    return;
  }

  // Generate mobile cards
  const mobileContainer = document.createElement("div");
  mobileContainer.className = "data-table-mobile";

  filtered.forEach((contribution, index) => {
    const card = document.createElement("div");
    card.className = "data-card";

    // Card header with Flat and Amount
    const header = document.createElement("div");
    header.className = "data-card__header";
    header.innerHTML = `
      <h3 class="data-card__title">${contribution.flatNumber || "N/A"}</h3>
      <span class="amount">${formatAmount(contribution.amount)}</span>
    `;

    // Card content
    const content = document.createElement("div");
    content.className = "data-card__content";
    content.innerHTML = `
      <div class="data-row">
        <span class="data-label">Resident Name:</span>
        <span class="data-value">${contribution.residentName || "N/A"}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Date:</span>
        <span class="data-value">${formatDate(contribution.date)}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Received By:</span>
        <span class="data-value">${contribution.receivedBy || "N/A"}</span>
      </div>
    `;

    // Actions (for non-guest users)
    if (!isGuestUser) {
      const actions = document.createElement("div");
      actions.className = "data-actions";
      actions.innerHTML = `
        <button class="btn btn--outline btn--sm" onclick="editContribution(${contribution.id})">Edit</button>
        <button class="btn btn--outline btn--sm" onclick="deleteContribution(${contribution.id})">Delete</button>
      `;
      card.appendChild(actions);
    }

    card.prepend(header, content);
    mobileContainer.appendChild(card);
  });

  // Insert or update the mobile container
  const tableContainer =
    tbody.closest(".table-responsive") ||
    tbody.closest(".card__body") ||
    tbody.closest("section");
  const existingMobileContainer =
    tableContainer.querySelector(".data-table-mobile");

  if (existingMobileContainer) {
    existingMobileContainer.replaceWith(mobileContainer);
  } else {
    tableContainer.insertBefore(mobileContainer, tableContainer.firstChild);
  }

  // Regular table (hidden on mobile)
  tbody.innerHTML = filtered
    .map(
      (contribution, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${contribution.flatNumber || ""}</td>
        <td>${contribution.residentName}</td>
        <td class="amount">${formatAmount(contribution.amount)}</td>
        <td>${formatDate(contribution.date)}</td>
        <td>${contribution.receivedBy || ""}</td>
        ${
          !isGuestUser
            ? `
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn btn--outline btn--sm" onclick="editContribution(${contribution.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="deleteContribution(${contribution.id})">Delete</button>
          </div>
        </td>
        `
            : ""
        }
      </tr>
    `
    )
    .join("");
}

function renderDonationsTable() {
  const tbody = document.getElementById("donationsTableBody");
  if (!tbody) return;

  // Update the table headers with sort indicators
  updateDonationTableHeaders();

  const filtered = getFilteredDonations();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <h3>No donations found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new donation."
          }</p>
        </td>
      </tr>`;

    // Clear mobile view if it exists
    const existingMobileContainer = document.querySelector(".donations-mobile");
    if (existingMobileContainer) {
      existingMobileContainer.innerHTML = `
        <div class="empty-state">
          <h3>No donations found</h3>
          <p>${
            isGuestUser
              ? "No data to display."
              : "Try clearing filters or add a new donation."
          }</p>
        </div>`;
    }
    return;
  }

  // Generate mobile cards
  const mobileContainer = document.createElement("div");
  mobileContainer.className = "data-table-mobile donations-mobile";

  filtered.forEach((donation, index) => {
    const card = document.createElement("div");
    card.className = "data-card";

    // Card header with Flat and Amount
    const header = document.createElement("div");
    header.className = "data-card__header";
    header.innerHTML = `
      <h3 class="data-card__title">${donation.flatNumber || "N/A"}</h3>
      <span class="amount">${formatAmount(donation.amount)}</span>
    `;

    // Card content
    const content = document.createElement("div");
    content.className = "data-card__content";
    content.innerHTML = `
      <div class="data-row">
        <span class="data-label">Donor Name:</span>
        <span class="data-value">${donation.donorName || "N/A"}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Purpose:</span>
        <span class="data-value">${donation.purpose || "N/A"}</span>
      </div>
      <div class="data-row">
        <span class="data-label">Date:</span>
        <span class="data-value">${formatDate(donation.date)}</span>
      </div>
      ${
        donation.navaratriDay
          ? `
      <div class="data-row">
        <span class="data-label">Navaratri Day:</span>
        <span class="data-value">${donation.navaratriDay}</span>
      </div>`
          : ""
      }
    `;

    // Actions (for non-guest users)
    if (!isGuestUser) {
      const actions = document.createElement("div");
      actions.className = "data-actions";
      actions.innerHTML = `
        <button class="btn btn--outline btn--sm" onclick="editDonation(${donation.id})">Edit</button>
        <button class="btn btn--outline btn--sm" onclick="deleteDonation(${donation.id})">Delete</button>
      `;
      card.appendChild(actions);
    }

    card.prepend(header, content);
    mobileContainer.appendChild(card);
  });

  // Insert or update the mobile container
  const tableContainer =
    tbody.closest(".table-responsive") ||
    tbody.closest(".card__body") ||
    tbody.closest("section");
  const existingMobileContainer =
    tableContainer.querySelector(".donations-mobile");

  if (existingMobileContainer) {
    existingMobileContainer.replaceWith(mobileContainer);
  } else {
    tableContainer.insertBefore(mobileContainer, tableContainer.firstChild);
  }

  // Regular table (hidden on mobile)
  tbody.innerHTML = filtered
    .map(
      (donation, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${donation.flatNumber || ""}</td>
        <td>${donation.donorName || ""}</td>
        <td class="amount">${formatAmount(donation.amount)}</td>
        <td>${donation.purpose || ""}</td>
        <td>${formatDate(donation.date)}</td>
        ${
          !isGuestUser
            ? `
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn btn--outline btn--sm" onclick="editDonation(${donation.id})">Edit</button>
            <button class="btn btn--outline btn--sm" onclick="deleteDonation(${donation.id})">Delete</button>
          </div>
        </td>
        `
            : ""
        }
      </tr>
    `
    )
    .join("");
}

// Add this helper function to update table headers with sort indicators
function updateTableHeaders() {
  const headers = {
    flat: document.querySelector("th:nth-child(2)"),
    name: document.querySelector("th:nth-child(3)"),
    amount: document.querySelector("th:nth-child(4)"),
    date: document.querySelector("th:nth-child(5)"),
  };

  // Reset all headers
  Object.values(headers).forEach((header) => {
    if (header) {
      header.classList.remove("sort-asc", "sort-desc");
      header.style.cursor = "pointer";
    }
  });

  // Update the current sort column
  const currentHeader = headers[currentSort.column];
  if (currentHeader) {
    currentHeader.classList.add(`sort-${currentSort.direction}`);
  }
}

function updateDonationTableHeaders() {
  const headers = {
    flat: document.querySelector("#donationsTable th:nth-child(2)"),
    donor: document.querySelector("#donationsTable th:nth-child(3)"),
    amount: document.querySelector("#donationsTable th:nth-child(4)"),
    purpose: document.querySelector("#donationsTable th:nth-child(5)"),
    date: document.querySelector("#donationsTable th:nth-child(6)"),
  };

  // Reset all headers
  Object.values(headers).forEach((header) => {
    if (header) {
      header.classList.remove("sort-asc", "sort-desc");
      header.style.cursor = "pointer";
    }
  });

  // Update the current sort column
  const currentHeader = headers[currentDonationSort.column];
  if (currentHeader) {
    currentHeader.classList.add(`sort-${currentDonationSort.direction}`);
  }
}

// Update the initializeApp function to add click handlers for table headers
document.addEventListener("DOMContentLoaded", () => {
  // ... existing code ...

  // Add click handlers to table headers for sorting
  const table = document.querySelector(".data-table thead");
  if (table) {
    table.addEventListener("click", (e) => {
      const th = e.target.closest("th");
      if (!th) return;

      const index = Array.from(th.parentNode.children).indexOf(th);
      const columns = [
        "#",
        "flat",
        "name",
        "amount",
        "date",
        "receivedBy",
        "actions",
      ];
      const column = columns[index];

      if (["flat", "date", "amount", "name"].includes(column)) {
        handleSort(column);
      }
    });
  }

  // Add click handlers to donation table headers for sorting
  const donationTable = document.querySelector("#donationsTable thead");
  if (donationTable) {
    donationTable.addEventListener("click", (e) => {
      const th = e.target.closest("th");
      if (!th) return;

      const index = Array.from(th.parentNode.children).indexOf(th);
      const columns = [
        "#",
        "flat",
        "donor",
        "amount",
        "purpose",
        "date",
        "actions",
      ];
      const column = columns[index];

      if (["flat", "date", "amount", "donor", "purpose"].includes(column)) {
        handleDonationSort(column);
      }
    });
  }

  // ... rest of the initialization code ...
});
