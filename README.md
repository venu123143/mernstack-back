# 🛍️ Amazon Clone – Ecommerce Application

Live Site 👉 [https://onlinestore.nerchuko.in/](https://onlinestore.nerchuko.in/)

An advanced and feature-rich **Ecommerce Application** built with a powerful Node.js backend and a dynamic frontend. It allows users to explore products, place orders, manage their profiles, and admins to maintain the system seamlessly.

---

## 🚀 Features

### 🛒 Shopping Experience
- Browse a wide range of products across multiple categories.
- Add products to your cart and proceed with secure **Razorpay** payment gateway.
- Place and manage orders easily.
- Responsive design that works flawlessly across all devices (Mobile, Tablet, Desktop).
- Switch between **Dark Mode**, **Light Mode**, or follow **System Default**.

### 🔍 Search & Filter
- Powerful product search with an intuitive user experience.
- Apply various filters to personalize product discovery.

### 📦 Address Management
- Add and manage **multiple shipping addresses** per user.

### 🔐 User Authentication
- Login and Register with Email/Password.
- **Google OAuth Login**.
- **OTP-based login** using Twilio integration.

### 📚 Blog Engagement
- Read and engage with insightful blogs on trends and product information.

### 🛠️ Admin Dashboard
- Manage your ecommerce store with ease:
  - Add / Update / Delete Products.
  - Manage Product Categories.
  - Post and maintain Blogs.
  - Full access to manage the ecommerce backend from one place.

---

## 🧱 Tech Stack

### Backend:
- **Node.js**, **Express.js**, **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Passport.js** (Google OAuth)
- **Twilio** (OTP Login)
- **Razorpay** for payment integration
- **Cloudinary / AWS S3** for image storage
- **Bull / Redis** for background jobs and performance optimization
- **Multer** for file uploads

### Dev Tools:
- **TypeScript**, **Nodemon**, **TS-Node**, **Concurrently**
- **dotenv**, **cookie-parser**, **cors**, **bcrypt**, **jsonwebtoken**

---

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/venu123143/mernstack-back.git
cd amazon-clone

# Install dependencies
npm install

# Start TypeScript compiler and server
npm run start
