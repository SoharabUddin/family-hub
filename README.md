# 🏡 Family Hub

A complete **family management web app** powered by Google Sheets and hosted on **GitHub Pages**.

**By:** Soharab Uddin Mondal  
👤 GitHub: [SoharabUddin](https://github.com/SoharabUddin)  
📂 Project URL: [family-hub](https://github.com/SoharabUddin/family-hub)  

---

## 📖 Overview

**Family Hub** helps you manage your entire family’s daily life, organized in one place — from members and tasks to expenses and inventory.  
All your data is stored in **Google Sheets**, which serves as the backend database.

You can easily:
- 👨‍👩‍👧 Manage family member details  
- ✅ Create, update, and track tasks  
- 💰 Record income and expenses  
- 📦 Track household items, needs, and items to sell or give  
- 🧮 Calculate monthly estimated expenses  
- ⏰ Keep reminders for birthdays, bills, or events  

---

## ⚙️ Setup Instructions

### 1. Create the Google Spreadsheet

Create a Google Sheet (e.g., **FamilyHub_Data**) and add the following **tabs (sheets)**:

- `FamilyMembers`
- `Tasks`
- `Inventory`
- `Finance`
- `Reminders`

Each sheet must have headers like below:

#### 🧍 FamilyMembers
```
ID | Name | Age | Relation | Contact | BloodGroup | Birthday | Notes
```

#### 🧾 Tasks
```
ID | Task | AssignedTo | Date | Priority | Status | Notes
```

#### 📦 Inventory
```
ID | Item | Quantity | Category | Condition | Location | Needed | ToSellGive | Value | PurchaseDate
```

#### 💵 Finance
```
ID | Date | Description | Amount | Type | PaymentMethod | Notes
```

#### ⏰ Reminders
```
ID | Event | Date | Type | AssignedTo | Notes
```

---

### 2. Add the Apps Script Backend

1. In your Google Sheet, go to **Extensions → Apps Script**.  
2. Paste your `Code.gs` (backend code for CRUD operations).  
3. Click **Deploy → New deployment → Web app**.  
4. Set:
   - **Execute as:** Me  
   - **Who has access:** Anyone  
5. Deploy and copy the **Web App URL**.

---

### 3. Connect Frontend to Backend

In your `script.js`, replace this line:
```js
const API_URL = "YOUR_APPS_SCRIPT_WEB_URL_HERE";
```
with your actual **Google Apps Script Web App URL**.

---

### 4. Deploy on GitHub Pages

1. Make sure your repo has these files:
   ```
   index.html
   style.css
   script.js
   README.md
   ```
2. Commit and push your code to the `main` branch.
3. Go to **Settings → Pages → Source**, then choose:
   ```
   Branch: main / (root)
   ```
4. After saving, your live site will be available at:  
   👉 **https://SoharabUddin.github.io/family-hub/**

---

## 🧠 Features

| Section | Description |
|----------|--------------|
| 👨‍👩‍👧 Family Members | Add, edit, or remove member info (relation, contact, etc.) |
| ✅ Tasks | Create, update, delete, and track progress of daily tasks |
| 💰 Finance | Log income and expenses, view monthly balance summary |
| 📦 Inventory | Manage items you own, mark what’s needed or sellable |
| ⏰ Reminders | Add alerts for events, birthdays, or payment dates |
| 🧮 Expense Estimator | Auto-calculate estimated monthly expenses |
| 🔄 Interconnection | Related sections share data where applicable (e.g., member in tasks) |

---

## 📁 Project Structure

```
/ (root)
├── index.html        # Main webpage
├── style.css         # Styling
├── script.js         # Frontend logic and API handling
├── Code.gs           # Backend (Google Apps Script)
└── README.md         # Project documentation
```

---

## 🔧 Future Enhancements

- 🔐 Google Sign-In for user access control  
- 📊 Charts and dashboards for finances  
- 📅 Calendar view for reminders  
- 🔔 Email or SMS notifications  
- 🌓 Light/Dark theme toggle  
- 📱 Mobile responsive layout  

---

## 🚀 Quick Start

1. Set up the Google Sheet backend.  
2. Deploy Apps Script web app.  
3. Link your web app (`index.html`, `script.js`) to that backend.  
4. Deploy via GitHub Pages.  
5. Visit your site and start managing your family hub!

---

## 💬 Credits

Created with ❤️ by **Soharab Uddin Mondal**  
GitHub: [SoharabUddin](https://github.com/SoharabUddin)  
Project Repo: [family-hub](https://github.com/SoharabUddin/family-hub)  
Live URL: [https://SoharabUddin.github.io/family-hub](https://SoharabUddin.github.io/family-hub)

---

## 🪪 License

This project is open-source and free to use for personal or family management.  
Feel free to modify and enhance as needed.
