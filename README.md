## 1.Video
https://drive.google.com/drive/folders/1EM53lsxrH5Uv_wsIsO7oh8elBQzSNuWB?usp=drive_link

# Comparison of Session-Based vs JWT Authentication

This project hosts two independent, parallel applications to compare **Session-Based (Stateful)** authentication and **JWT-Based (Stateless)** authentication. Both applications share equivalent business logic, database entities, and user interfaces, with differences only in the authentication mechanism and request-response flow.

---

## 1. Project Structure

```
authentication-vs/
├── docker-compose.yaml   # Configures MySQL 8 container (port 3306)
├── init.sql              # Pre-creates session_db and jwt_db
├── session-backend/      # Spring Boot application (port 8081) using HTTP sessions
├── session-frontend/     # React (Vite) application (port 5173) using HTTP sessions
├── jwt-backend/          # Spring Boot application (port 8082) using stateless JWT tokens
└── jwt-frontend/         # React (Vite) application (port 5174) using in-memory access tokens
```

---

## 2. Authentication Mechanics

### Session-Based Application (Stateful)
* **Token Mechanism**: Standard `HttpSession` backed by an automatic browser cookie (`JSESSIONID`).
* **Server State**: Active sessions are cached in server memory.
* **Security**: Cookie uses `HttpOnly` and `SameSite=Strict` flags. Immune to script-based XSS theft.
* **Logout & Revocation**: Calling logout instantly invalidates the session in server memory.

### JWT-Based Application (Stateless)
* **Token Mechanism**: 
  * **Access Token**: Short-lived (1 minute), stored in-memory in JavaScript State (XSS safe). Passed in the `Authorization: Bearer <token>` header.
  * **Refresh Token**: Long-lived (24 hours), stored in an `HttpOnly`, `SameSite=Strict` cookie. Passed automatically to refresh access tokens.
* **Server State**: None. Token signatures are validated locally.
* **Logout & Revocation**: Manual logout blacklists the access token in a database table until expiration, and deletes the refresh token.
* **Silent Refresh**: On access token expiration, Axios interceptors silently request a new access token using the refresh cookie.

---

## 3. How to Run the Applications

### Step 1: Start the MySQL Database
Navigate into `authentication-vs/` and run Docker Compose:
```bash
cd authentication-vs
docker compose up -d
```

### Step 2: Run the Backends
Open separate terminal instances and run the Spring Boot backends:

* **Session Backend (Port 8081)**:
  ```bash
  cd authentication-vs/session-backend
  mvn spring-boot:run
  ```

* **JWT Backend (Port 8082)**:
  ```bash
  cd authentication-vs/jwt-backend
  mvn spring-boot:run
  ```

*Note: Default users `user` (password `password123`) and `admin` (password `admin123`) are seeded automatically on startup.*

### Step 3: Run the Frontends
Install dependencies and run the React clients:

* **Session Frontend (Port 5173)**:
  ```bash
  cd authentication-vs/session-frontend
  npm install
  npm run dev
  ```

* **JWT Frontend (Port 5174)**:
  ```bash
  cd authentication-vs/jwt-frontend
  npm install
  npm run dev
  ```

---

## 4. Verification and Swagger Documentation
Once the services are active, you can access the Swagger documentation for both REST APIs:

* **Session Swagger UI**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
* **JWT Swagger UI**: [http://localhost:8082/swagger-ui/index.html](http://localhost:8082/swagger-ui/index.html)
