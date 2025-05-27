
# 🎟️ Ticket Management Interface (Headout)

A full-stack web application for Headout’s internal QA team to manage and update ticket data, based on listing types (`new_listing` or `multi_variant`). This interface allows teams to fetch, edit, and submit data for tours, vendors, contacts, and cancellation policies with retry-safe error handling.


---

## 🛠️ Tech Stack

| Layer      | Tech Used                                        |
|------------|--------------------------------------------------|
| Frontend   | React + TypeScript + Tailwind CSS (via Vite & shadcn-ui) |
| Backend    | Node.js + Express (API Calls & Data Handling)    |
| Database   | Supabase (used for demo; MongoDB initially planned) |

---

## 📁 Folder Structure

```
├── src
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── styles/
│   └── App.tsx
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <REPO_URL>
cd ticket-management-interface
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Project

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app locally.

---

## 📸 UI Overview (Screenshots)

> Create a `/screenshots` folder in the root of your GitHub repo and upload all screenshots inside it. Then use the GitHub UI or git commands to push the images.  
> These filenames must match exactly.

### 1. 🎯 Dashboard with Ticket Dropdown  
![Dropdown](./screenshots/ticket-dashboard-empty.png)

### 2. 🧾 Ticket Info Fetched  
![Ticket Info](./screenshots/ticket-dashboard-new-listing.png)

### 3. ⚙️ Action Buttons + Editable Fields  
![Actions & Form](./screenshots/contact-info-display.png)

### 4. ✏️ Editable Contact Info  
![Edit Contact](./screenshots/contact-info-edit.png)

### 5. 📤 Updated Data Reflected  
![Updated Output](./screenshots/contact-info-updated.png)

### 6. 🧪 Debug Console View  
![Console Debug](./screenshots/console-logs-working.png)

### 7. 🗃 Supabase Table View  
![Database View](./screenshots/supabase-contact-table.png)

---

## 💡 Features

- Ticket selection dropdown with search
- Fetches ticket, tour, vendor data via API
- Conditional workflow based on listingType
- Editable fields for contact and cancellation policy
- Retry-safe updates with top-level error section
- Data synced to Supabase (MongoDB support planned)

---

## 📌 Future Enhancements

- Switch to MongoDB as primary database
- Add authentication for QA team access
- Real-time dashboard analytics (audit progress, failures)
- Mobile responsiveness and dark mode

---

## 📬 Feedback

For feedback or collaboration requests, feel free to reach out!
