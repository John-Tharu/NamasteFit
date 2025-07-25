# NamasteFit: Fitness & Yoga Subscription Platform

---

## Table of Contents
- [Overview](#overview)  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Screenshots](#screenshots)  
- [Setup Instructions](#setup-instructions)  
- [Challenges Faced](#challenges-faced)  
- [Future Improvements](#future-improvements)  
- [Contributing](#contributing)  

---

## Overview

NamasteFit is a subscription-based fitness and yoga platform built specifically for the Nepali audience. It empowers users to access curated workout content, attend live classes, and follow personalized plans from their homes. The platform aims to simplify health and wellness by providing a structured, community-driven subscription model, making fitness accessible and consistent across Nepal.

---

## Features

- **JWT-Based Authentication & Authorization**  
  Secure login with role-based access control for Admins and Users.

- **Login with Google & GitHub**  
  OAuth2 authentication for seamless sign-in via Google and GitHub.

- **Password Reset via Email Link**  
  Secure token-based password reset system.

- **Subscription Plan Management**  
  Access content based on active subscription plans.

- **Live Class Scheduling**  
  Admins can schedule live yoga/fitness sessions; users attend based on their plan.

- **CRUD Operations**  
  Backend management for users, workouts, classes, and subscription plans.

- **User Dashboard**  
  Personalized dashboard showing class schedules, active plans, and progress.

- **Admin Panel**  
  Tools for admins to create, edit, and manage sessions, users, and subscription content.

- **Scalable Backend Architecture**  
  Designed for easy integration of payments, analytics, and notifications.

- **Planned Payment Integration**  
  Research in progress to integrate local gateways like Khalti and Esewa.

---

## Technologies Used

- **Languages:** JavaScript  
- **Backend Framework:** Node.js, Express.js  
- **Database:** MySQL  
- **ORM:** Drizzle  
- **Authentication:** JWT (JSON Web Tokens), OAuth 2.0 (Google & GitHub)  
- **Email Services:** Resend Node Package (for password reset emails), MJML  
- **Version Control:** Git, GitHub  
- **API Testing & Debugging:** Postman  
- **Development Tools:**  
  - dotenv (environment variables)  
  - node --watch (auto-reloading server)  
  - argon2 (password hashing)  
  - zod (validation)

---

## Screenshots

### Homepage  


### Login Page  
![Homepage](./views/partials/Homepage.png)

### Register Page  
![Homepage](./views/partials/Registerpage.png)

### Plan Page  
![Homepage](./views/partials/Planpage.png)

### Subscription Page  
![Homepage](./views/partials/Scubscribepage.png)

### User Dashboard  
![Homepage](./views/partials/Userpage.png)

### Profile Page  
![Homepage](./views/partials/Userprofile.png)

### Admin Dashboard  
![Homepage](./views/partials/Admindashboard.png)
![Homepage](./views/partials/Listuser.png)

---

## Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/John-Tharu/NamasteFit
cd NamasteFit

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Rename `.env.example` to `.env` and update with your settings:
# Example variables:
PORT=YOUR_PORT_NUMBER
MY_SECRET="YOUR_SECRET_KEY"
DATABASE_URL="YOUR_MYSQL_URL/DB_NAME"
JWT_SECRET="YOUR_JWT_SECRET"
HOST="YOUR_WEBSITE_HOST"
RESEND_API_KEY="YOUR_RESEND_API_KEY"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"

# 4. Start the development server with auto-reload
node --watch ./app.js

```
## Challenges Faced

- **JWT Expiry & Token Refresh Logic:**  
  Implemented refresh token mechanism and planned silent renewal for smoother user experience.

- **Email Reset Link Logic:**  
  Ensured secure password resets using expiring JWT tokens and user ID in reset URLs.

- **OAuth Integration (Google & GitHub):**  
  Managed callback URL complexities via environment variables and proper redirect URIs.

- **Payment Integration (Ongoing):**  
  Researching Khalti API integration due to limited documentation and test environments.

- **GitHub Push Conflicts:**  
  Adopted best Git practices with regular pulls, feature branches, and clear commits.

---

## Future Improvements

- Integrate payment gateways like Khalti and Stripe for secure online payments.

- Implement token auto-refresh and silent login for improved UX.

- Develop frontend UI for both users and admins.

- Add real-time notifications for live sessions.

- Optimize deployment and scalability using CI/CD pipelines.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request to discuss improvements or bug fixes.
