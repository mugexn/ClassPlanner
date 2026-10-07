# 📅 Class Planner

A web app for teachers and instructors to manage their class schedules, make-up classes and notes on a monthly calendar, and to generate an editable Daily Time Record (DTR) with hours rendered per day. It supports multiple users with a built-in admin who can manage every account.

## ✨ Features

### 🔐 Accounts & Roles
- 🔑 Log in and create an account with email and password
- 🛡️ Built-in admin account; everyone else who signs up is automatically a regular user
- 👤 Account button showing the user's display name, where they can view and edit their display name and password

### 🗓️ Calendar
- 📆 Monthly calendar view with color-coded dots for lecture, lab, make-up classes and suspensions
- 🔽 Month and year dropdowns for quick navigation, plus previous, next and Today buttons
- 👆 Tap any day to see its classes, make-up classes, notes, and daily lab and lecture hours

### 📚 Class Schedules
- 🔁 Weekly schedule tab to add, edit and delete classes
- 🎓 Apply a schedule across a whole semester date range (for example August to January)
- 📌 Pick several days at once (Mon, Wed, Fri) for the same class
- 📝 Each class has subject, time, course and section, and class type (lab or lecture)
- ➕ Make-up classes for a specific date
- 🗒️ Daily notes

### ⚠️ Smart Scheduling
- 🚨 Conflict warnings when a class and a make-up class overlap
- 🕐 Vacant time shown when a day is selected

### 🔔 Notifications
- 💬 Popup notifications for every add, edit and delete action
- 🔴 Notification bell with history and an unread red dot that clears once read
- 🙈 Notifications are private to each user

### 🧾 Daily Time Record (DTR)
- ✏️ Editable monthly DTR with morning and afternoon arrival and departure
- ⏱️ Automatic hours rendered per day and monthly totals
- 🧪 Lab and lecture hours calculated per day from the schedule
- 🖨️ Print-friendly layout

### 👑 Admin Tools
- 👥 Users tab listing all users
- ➕ Add new users with display name, email and password
- 🔧 Edit any user's display name, email and password
- 🗑️ Delete users
- 👀 View any user's schedule and DTR

### 🎨 Interface
- 🌈 Modern, responsive UI with color-coded buttons
- 🧩 Icons throughout for easy scanning

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| ⚛️ Frontend | React 18 |
| ⚡ Build tool | Vite |
| 🎨 Styling | Tailwind CSS |
| 🔣 Icons | Lucide React |
| 🗄️ Database | Supabase (PostgreSQL) |
| 🔒 Authentication | Supabase Auth |
| 🛡️ Security | Row Level Security (RLS) policies |
| ☁️ Server logic | Supabase Edge Functions (Deno / TypeScript) |

## 👨🏻‍💻 Developer
- 🐺 Mugexn