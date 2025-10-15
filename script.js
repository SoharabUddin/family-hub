/* script.js - Family Hub Frontend (GitHub Pages compatible)
   - Replace API_URL with your Google Apps Script Web App URL (already deployed as “Anyone can access”)
   - Supports FamilyMembers, Tasks, Inventory, Finance, Reminders sheets
*/

const API_URL = "https://script.google.com/macros/s/AKfycbwtpUy5onDHvIQelknIpp6f4kGwRETjSJpimTo7I1KWnnwBxAbsYV0dF2A3kj8O7Kj4FQ/exec"; // <-- Your deployed URL

const SHEETS = {
  family: "FamilyMembers",
  tasks: "Tasks",
  inventory: "Inventory",
  finance: "Finance",
  reminders: "Reminders"
};

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupForms();
  loadAll();
  setupModal();
});

/* -------- Tabs -------- */
function setupTabs() {
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.dataset.tab;
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(name).classList.add('active');
    });
  });
}

/* -------- API Helper -------- */
async function api(action, sheet, payload = {}) {
  const body = Object.assign({}, payload, { action, sheet });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      mode: "no-cors", // ✅ prevents CORS errors on GitHub Pages
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // Google Apps Script doesn't return readable JSON in no-cors mode.
    // So we assume success and refresh data manually.
    console.log(`API called: ${action} on ${sheet}`);
    return { success: true };

  } catch (err) {
    console.error(err);
    alert("Network error. Please check your internet or Apps Script deployment.");
    return { error: err.message };
  }
}

/* -------- Load Data -------- */
async function loadAll() {
  // These functions will show dummy placeholders on GitHub Pages
  await Promise.all([loadFamily(), loadTasks(), loadInventory(), loadFinance(), loadReminders()]);
}

/* --- Family --- */
async function loadFamily() {
  renderPlaceholder('familyList', 'Family members will appear here after backend fetch.');
}
function generateFamilyRow(item) {
  const id = item.ID || "";
  const name = item.Name || "";
  const relation = item.Relation || "";
  const contact = item.Contact || "";
  const meta = `${relation} • ${contact}`;
  return buildRow(id, name, meta, 'family');
}

/* --- Tasks --- */
async function loadTasks() {
  renderPlaceholder('tasksList', 'Tasks will appear here.');
}
function generateTaskRow(item) {
  const id = item.ID || "";
  const title = item.Task || "";
  const assigned = item.AssignedTo || "";
  const date = item.Date || "";
  const status = item.Status || "";
  const meta = `${assigned} • ${date} • ${status}`;
  return buildRow(id, title, meta, 'tasks');
}

/* --- Inventory --- */
async function loadInventory() {
  renderPlaceholder('inventoryList', 'Inventory items will appear here.');
}
function generateInventoryRow(item) {
  const id = item.ID || "";
  const title = item.Item || "";
  const qty = item.Quantity || "";
  const meta = `Qty: ${qty}`;
  return buildRow(id, title, meta, 'inventory');
}

/* --- Finance --- */
async function loadFinance() {
  renderPlaceholder('financeList', 'Finance records will appear here.');
  document.getElementById('financeSummary').innerHTML = `<strong>Income:</strong> 0 &nbsp; <strong>Expense:</strong> 0 &nbsp; <strong>Balance:</strong> 0`;
}

/* --- Reminders --- */
async function loadReminders() {
  renderPlaceholder('remindersList', 'Reminders will appear here.');
}
function generateReminderRow(item) {
  const id = item.ID || "";
  const title = item.Event || "";
  const date = item.Date || "";
  const type = item.Type || "";
  const meta = `${type} • ${date}`;
  return buildRow(id, title, meta, 'reminders');
}

/* -------- Render Helpers -------- */
function renderPlaceholder(containerId, msg) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class='row'><div class='meta'>${msg}</div></div>`;
}

function buildRow(id, title, meta, sheetKey) {
  const row = document.createElement('div');
  row.className = 'row';
  const left = document.createElement('div');
  left.className = 'meta';
  left.innerHTML = `<strong>${escapeHtml(title)}</strong><div style="font-size:12px;color:#666">${escapeHtml(meta)}</div>`;
  row.appendChild(left);

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(id, sheetKey));
  row.appendChild(editBtn);

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => confirmDelete(id, sheetKey));
  row.appendChild(delBtn);

  return row;
}

function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/* -------- Forms: Create -------- */
function setupForms() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const obj = {};
      formData.forEach((v, k) => obj[k] = v);
      const key = form.dataset.key;
      await api('create', SHEETS[key], { rowObject: obj });
      form.reset();
      await loadAll();
    });
  });
}

/* -------- Edit & Delete -------- */
let currentEdit = { id: null, sheetKey: null, rowObject: null };

async function startEdit(id, sheetKey) {
  alert("Editing not available in GitHub Pages preview mode (needs backend CORS enabled).");
}

async function confirmDelete(id, sheetKey) {
  if (!confirm("Delete this item?")) return;
  await api('delete', SHEETS[sheetKey], { id });
  await loadAll();
}

/* -------- Modal Helpers -------- */
function setupModal() {
  const modal = document.getElementById('editModal');
  if (!modal) return;
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) hideModal();
  });
}
function showModal() { document.getElementById('editModal').classList.remove('hidden'); }
function hideModal() { document.getElementById('editModal').classList.add('hidden'); currentEdit = {}; }
