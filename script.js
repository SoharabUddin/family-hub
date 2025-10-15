/* script.js - Frontend for Family Hub
   - Replace API_URL with your Google Apps Script Web App URL.
   - Sheet names must match those in Apps Script/readme:
     FamilyMembers, Tasks, Inventory, Finance, Reminders
*/

const API_URL = "https://script.google.com/macros/s/AKfycbwtpUy5onDHvIQelknIpp6f4kGwRETjSJpimTo7I1KWnnwBxAbsYV0dF2A3kj8O7Kj4FQ/exec"; // <<---- REPLACE THIS

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

/* -------- Load Data (read) -------- */

async function api(action, sheet, payload = {}) {
  const body = Object.assign({}, payload, { action, sheet });
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function loadAll() {
  await Promise.all([loadFamily(), loadTasks(), loadInventory(), loadFinance(), loadReminders()]);
}

/* --- Family --- */
async function loadFamily() {
  const res = await api('read', SHEETS.family);
  renderList(res, 'familyList', generateFamilyRow);
}

function generateFamilyRow(item) {
  // item is object keyed by header names
  const id = item.ID || item.Id || item.id || "";
  const name = item.Name || "";
  const relation = item.Relation || "";
  const contact = item.Contact || "";
  const meta = `${relation} • ${contact}`;
  return buildRow(id, name, meta, 'family');
}

/* --- Tasks --- */
async function loadTasks() {
  const res = await api('read', SHEETS.tasks);
  renderList(res, 'tasksList', generateTaskRow);
}

function generateTaskRow(item) {
  const id = item.ID || "";
  const title = item.Task || item['Task Name'] || item.Task || "";
  const assigned = item.AssignedTo || item.Assigned || "";
  const date = item.Date || "";
  const status = item.Status || "";
  const meta = `${assigned} • ${date} • ${status}`;
  return buildRow(id, title, meta, 'tasks');
}

/* --- Inventory --- */
async function loadInventory() {
  const res = await api('read', SHEETS.inventory);
  renderList(res, 'inventoryList', generateInventoryRow);
}

function generateInventoryRow(item) {
  const id = item.ID || "";
  const title = item.Item || item['Item Name'] || "";
  const qty = item.Quantity || item.Qty || "";
  const needed = (item.Needed && item.Needed.toString() === "TRUE") ? "Needed" : "";
  const toSell = (item['ToSellGive'] === true || item['ToSellGive'] === "TRUE" || item['To Sell/Give'] === "TRUE") ? "To Sell/Give" : "";
  const meta = `Qty: ${qty} ${needed ? ' • ' + needed : ''} ${toSell ? ' • ' + toSell : ''}`;
  return buildRow(id, title, meta, 'inventory');
}

/* --- Finance --- */
async function loadFinance() {
  const res = await api('read', SHEETS.finance);
  renderList(res, 'financeList', generateFinanceRow);
  renderFinanceSummary(res);
}

function generateFinanceRow(item) {
  const id = item.ID || "";
  const date = item.Date || "";
  const desc = item.Description || item.Desc || "";
  const amount = item.Amount || item.Amounts || item.amount || "";
  const type = item.Type || "";
  const meta = `${type} • ${date} • ${amount}`;
  return buildRow(id, desc, meta, 'finance');
}

function renderFinanceSummary(res) {
  if (!res || !res.rows) return;
  let income = 0, expense = 0;
  for (const r of res.rows) {
    const amt = parseFloat(r.Amount || 0) || 0;
    if ((r.Type || "").toLowerCase() === "income") income += amt;
    else expense += amt;
  }
  const balance = income - expense;
  document.getElementById('financeSummary').innerHTML =
    `<strong>Income:</strong> ${income.toFixed(2)} &nbsp; <strong>Expense:</strong> ${expense.toFixed(2)} &nbsp; <strong>Balance:</strong> ${balance.toFixed(2)}`;
}

/* --- Reminders --- */
async function loadReminders() {
  const res = await api('read', SHEETS.reminders);
  renderList(res, 'remindersList', generateReminderRow);
}

function generateReminderRow(item) {
  const id = item.ID || "";
  const title = item.Event || "";
  const date = item.Date || "";
  const type = item.Type || "";
  const meta = `${type} • ${date}`;
  return buildRow(id, title, meta, 'reminders');
}

/* -------- Render utilities -------- */

function renderList(res, containerId, rowGenerator) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!res || !res.rows || res.rows.length === 0) {
    container.innerHTML = "<div class='row'><div class='meta'>No records</div></div>";
    return;
  }
  res.rows.forEach(r => {
    const el = rowGenerator(r);
    container.appendChild(el);
  });
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
  // Family form
  document.getElementById('familyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      ID: "", // will be generated by backend
      Name: document.getElementById('fm_Name').value,
      Age: document.getElementById('fm_Age').value,
      Relation: document.getElementById('fm_Relation').value,
      Contact: document.getElementById('fm_Contact').value
    };
    await api('create', SHEETS.family, { rowObject: obj });
    e.target.reset();
    await loadFamily();
  });

  // Task form
  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      ID: "",
      Task: document.getElementById('t_Task').value,
      AssignedTo: document.getElementById('t_AssignedTo').value,
      Date: document.getElementById('t_Date').value,
      Priority: document.getElementById('t_Priority').value,
      Status: "Pending"
    };
    await api('create', SHEETS.tasks, { rowObject: obj });
    e.target.reset();
    await loadTasks();
  });

  // Inventory
  document.getElementById('invForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      ID: "",
      Item: document.getElementById('i_Item').value,
      Quantity: document.getElementById('i_Qty').value,
      Category: document.getElementById('i_Category').value,
      Condition: document.getElementById('i_Condition').value,
      Needed: document.getElementById('i_Needed').checked ? "TRUE" : "FALSE",
      ToSellGive: document.getElementById('i_ToSell').checked ? "TRUE" : "FALSE"
    };
    await api('create', SHEETS.inventory, { rowObject: obj });
    e.target.reset();
    await loadInventory();
  });

  // Finance
  document.getElementById('finForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      ID: "",
      Date: document.getElementById('f_Date').value,
      Description: document.getElementById('f_Desc').value,
      Amount: document.getElementById('f_Amount').value,
      Type: document.getElementById('f_Type').value
    };
    await api('create', SHEETS.finance, { rowObject: obj });
    e.target.reset();
    await loadFinance();
  });

  // Reminders
  document.getElementById('remForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      ID: "",
      Event: document.getElementById('r_Event').value,
      Date: document.getElementById('r_Date').value,
      Type: document.getElementById('r_Type').value
    };
    await api('create', SHEETS.reminders, { rowObject: obj });
    e.target.reset();
    await loadReminders();
  });
}

/* -------- Edit & Delete -------- */

let currentEdit = { id: null, sheetKey: null, headers: null, rowObject: null };

async function startEdit(id, sheetKey) {
  // Load sheet to get headers and the record
  const res = await api('read', SHEETS[sheetKey]);
  if (!res || !res.rows) return alert("Failed to load data");
  const item = res.rows.find(r => {
    const candidate = (r.ID || r.Id || r.id || "").toString();
    return candidate === id.toString();
  });
  if (!item) return alert("Record not found");

  currentEdit.id = id;
  currentEdit.sheetKey = sheetKey;
  currentEdit.rowObject = item;
  currentEdit.headers = res.headers || Object.keys(item);

  // Build a simple dynamic edit form
  const container = document.getElementById('editForm');
  container.innerHTML = "";
  currentEdit.headers.forEach(h => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginBottom = '6px';
    const el = document.createElement(h.toLowerCase().includes('date') ? 'input' : 'input');
    el.value = item[h] || "";
    el.dataset.field = h;
    if (h.toLowerCase().includes('date')) el.type = 'date';
    if (h.toLowerCase().includes('amount') || h.toLowerCase().includes('age') || h.toLowerCase().includes('qty')) el.type = 'number';
    el.style.width = '100%';
    label.innerHTML = `<strong>${h}</strong><br/>`;
    label.appendChild(el);
    container.appendChild(label);
  });

  document.getElementById('editTitle').innerText = `Edit ${sheetKey}`;
  showModal();
}

document.getElementById('saveEdit').addEventListener('click', async () => {
  const inputs = Array.from(document.querySelectorAll('#editForm input, #editForm select, #editForm textarea'));
  const rowObj = {};
  inputs.forEach(inp => {
    const k = inp.dataset.field;
    if (k) rowObj[k] = inp.value;
  });
  // Ensure ID is kept
  rowObj.ID = currentEdit.id;

  await api('update', SHEETS[currentEdit.sheetKey], { id: currentEdit.id, rowObject: rowObj });
  hideModal();
  await loadAll();
});

document.getElementById('cancelEdit').addEventListener('click', () => {
  hideModal();
});

async function confirmDelete(id, sheetKey) {
  if (!confirm("Delete this item? This action cannot be undone.")) return;
  const res = await api('delete', SHEETS[sheetKey], { id });
  if (res && res.success) {
    await loadAll();
  } else {
    alert(res.error || "Delete failed");
  }
}

/* -------- Modal helpers -------- */
function setupModal() {
  const modal = document.getElementById('editModal');
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) hideModal();
  });
}
function showModal() { document.getElementById('editModal').classList.remove('hidden'); }
function hideModal() { document.getElementById('editModal').classList.add('hidden'); currentEdit = { id: null, sheetKey: null }; }
