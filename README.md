# 💸 SmartSplit — Expense Intelligence Platform

> A full-stack expense splitting application that helps groups track shared expenses, calculate balances, and see who owes whom in real time.

🌐 **Live Demo:** https://smart-split-expense-intelligence-pl.vercel.app  
📦 **Backend API:** https://smartsplit-backend-hwzk.onrender.com/api/health

---

## 🎯 Problem It Solves

Groups of friends, flatmates, and colleagues struggle to track shared expenses manually. SmartSplit provides a clean digital platform to add expenses, split them equally or with custom amounts, and instantly see net balances — eliminating the confusion of "who owes whom."

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with BCrypt password hashing
- 👥 **Group Management** — Create groups, invite members, role-based access (Admin/Member)
- 💰 **Expense Tracking** — Add expenses with category tags (Food, Travel, Accommodation, etc.)
- ⚖️ **Split Engine** — Equal split or custom amount per person using BigDecimal precision
- 📊 **Balance Dashboard** — Real-time net balance per member, pie chart by category
- 📱 **Mobile Responsive** — Bottom sheet modals, touch-friendly UI
- 🚀 **Production Deployed** — Docker on Render, React on Vercel

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Java 21 + Spring Boot 3 | REST API framework |
| Spring Security + JWT | Authentication & authorization |
| Spring Data JPA + Hibernate | Database ORM |
| PostgreSQL | Relational database |
| Docker | Containerization |
| Render | Cloud deployment |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework |
| Framer Motion | Animations |
| Recharts | Data visualization |
| Axios | HTTP client with interceptors |
| React Router v6 | Client-side routing |
| Vercel | Frontend deployment |

---
 
## 🏗️ Architecture

Client (React)
↓ HTTPS + JWT Bearer Token
Spring Boot REST API
↓ Spring Data JPA
PostgreSQL Database

**Security flow:**
1. User registers/logs in → receives JWT token
2. Every request includes `Authorization: Bearer <token>`
3. `JwtAuthenticationFilter` validates token before request reaches controller
4. Role-based access: only group ADMINs can add members

---

## 🚀 Local Setup

### Prerequisites
- Java 21
- Maven 3.8+
- PostgreSQL 15+
- Node.js 18+

### Backend
```bash
cd backend
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE smartsplit_db;"

# Set environment variables or update application-local.properties
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env.local
npm run dev
```

Open `http://localhost:5173`

---

## 📁 Project Structure

smartsplit/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/smartsplit/backend/
│   │   ├── config/             # Security, CORS configuration
│   │   ├── controller/         # REST endpoints
│   │   ├── service/            # Business logic
│   │   ├── repository/         # Database layer
│   │   ├── model/              # JPA entities
│   │   ├── dto/                # Request/Response objects
│   │   ├── security/           # JWT filter, utilities
│   │   └── exception/          # Global error handling
│   └── Dockerfile
└── frontend/                   # React application
└── src/
├── api/                # Axios API calls
├── components/         # Reusable components
├── context/            # Auth context
├── pages/              # Route-level components
└── utils/              # Helpers



---

## 🔑 Key Technical Decisions

**Why BigDecimal for money?**  
`double` cannot represent 0.1 exactly in binary. `0.1 + 0.2 = 0.30000000000000004`. For financial calculations, BigDecimal gives exact decimal precision.

**Why JWT over sessions?**  
Sessions require server-side storage. JWT is stateless — the server validates the signature without storing anything. This scales horizontally without sticky sessions.

**Why @Transactional on read methods?**  
With `spring.jpa.open-in-view=false`, the JPA session closes after the repository call. Without `@Transactional(readOnly=true)`, accessing lazy-loaded relationships like `group.getMembers()` throws `LazyInitializationException`.

---

## 👨‍💻 Author

**Prathamesh Shankar Chavan**  
Java Full Stack Developer  
📧 chavanprathamesh813@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/prathameshchavan-dev)  
🐙 [GitHub](https://github.com/prathamesh7120)

---

⭐ If you found this useful, consider giving it a star!