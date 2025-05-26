
# 🎟️ Ticket Management Interface (Headout)

A full-stack web application for Headout’s internal QA team to manage and update ticket data, based on listing types (`new_listing` or `multi_variant`). This interface allows teams to fetch, edit, and submit data for tours, vendors, contacts, and cancellation policies with retry-safe error handling.

---

## 🌐 Live Preview

> **Deployed with Lovable**  
🔗 [Project URL](https://lovable.dev/projects/83090ab3-c652-4022-a264-339d26f32912)

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
![Dropdown](./screenshots/Screenshot%202025-05-26%20at%2011.08.34%20AM.png)

### 2. 🧾 Ticket Info Fetched  
![Ticket Info](./screenshots/Screenshot%202025-05-26%20at%2011.08.47%20AM.png)

### 3. ⚙️ Action Buttons + Editable Fields  
![Actions & Form](./screenshots/Screenshot%202025-05-26%20at%2011.09.06%20AM.png)

### 4. ✏️ Editable Contact Info  
![Edit Contact](./screenshots/Screenshot%202025-05-26%20at%2011.09.16%20AM.png)

### 5. 📤 Updated Data Reflected  
![Updated Output](./screenshots/Screenshot%202025-05-26%20at%2011.09.43%20AM.png)

### 6. 🧪 Debug Console View  
![Console Debug](./screenshots/Screenshot%202025-05-26%20at%2011.09.53%20AM.png)

### 7. 🗃 Supabase Table View  
![Database View](./screenshots/Screenshot%202025-05-26%20at%2011.10.09%20AM.png)

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
