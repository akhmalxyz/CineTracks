# **Project Setup & API Documentation**  
**JWT Authentication Service**  
*(For Team Members)*  

---

## **⚙️ Environment Variables (Same level as frontend and backend)**  
Create `.env` file:  
```ini
# PostgreSQL
POSTGRES_USER=Aamir
POSTGRES_PASSWORD=123456
POSTGRES_DB=CineTracks
POSTGRES_PORT=5433
# JWT
JWT_SECRET=YourVeryStrongSecretKeyWithAtLeast32CharactersLong12345
``` 
## **🚀 Quick Start (Docker Setup)**  
Ensure Docker is installed, then run:  

### **1. Start PostgreSQL & Nginx**  
```bash
docker-compose up -d
```  

### **2. Stop Services**  
```bash
docker-compose down
```  

### **3. Access PostgreSQL use same credentials as env file**  
```bash
docker exec -it db psql -U Aamir -d CineTracks
```  

### **4. Add springboot dashboard as extention in vscode and run auth service**  

---

## **🔐 API Routes**  
**Base URL:** `http://localhost:8080/api/auth/`  


---

## **📝 Example Requests**  

## Auth Service

### **1. Register a User and get token**  
```bash
curl --location 'http://localhost:8080/api/auth/register' \
--header 'Content-Type: application/json' \
--data '{
  "username": "testuser",
  "role": "ADMIN",
  "password": "securepassword"
}'
```  

**Response:**  
```json
{
"message":"Registration successful",
"expiresIn":86400000,
"token":"eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjaW5ldHJhY2tzLmNvbSIsInN1YiI6InRlc3R1c2VyIiwiaWF0IjoxNzQzMDk2NjQwLCJleHAiOjE3NDMxODMwNDB9.Too0j6MqDD5U9INXJCv9tsNKM7aBKyqyRZspJIQxjKM"
}
```  

### **2. Login & Get Token**  
```bash
curl --location 'http://localhost:8080/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "username": "testuser",
  "password": "securepassword"
}'
```  
**Response:**  
```json
{
"message":"Login successful",
"expiresIn":86400000,
"token":"eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjaW5ldHJhY2tzLmNvbSIsInN1YiI6InRlc3R1c2VyIiwiaWF0IjoxNzQzMDk2NjQ3LCJleHAiOjE3NDMxODMwNDd9.hYddyAkDOp0PVTNGSkKq-e6JMJW2EDqTLEtRW0K9WPI"
}
```  

### **3. Get user**  
```bash
curl --location 'http://localhost:8080/api/auth/user' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjaW5ldHJhY2tzLmNvbSIsInN1YiI6InRlc3R1c2VyIiwiaWF0IjoxNzQzMDk2NjQ3LCJleHAiOjE3NDMxODMwNDd9.hYddyAkDOp0PVTNGSkKq-e6JMJW2EDqTLEtRW0K9WPI'
```  

**Response:**  
```json
{
"user":{"username":"testuser","role":"ADMIN"},
"message":"Details obtained successfully"
}
```  

### **4. Put user and update token**  
```bash
curl --location --request PUT 'http://localhost:8080/api/auth/user' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjaW5ldHJhY2tzLmNvbSIsInN1YiI6InRlc3R1c2VyIiwiaWF0IjoxNzQzMDk2NjQ3LCJleHAiOjE3NDMxODMwNDd9.hYddyAkDOp0PVTNGSkKq-e6JMJW2EDqTLEtRW0K9WPI' \
--data '{
  "username": "new_username",
  "password": "new_password123"
}'
```  

**Response:**  
```json
{
"token":"eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjaW5ldHJhY2tzLmNvbSIsInN1YiI6Im5ld191c2VybmFtZSIsImlhdCI6MTc0MzA5NjY1NCwiZXhwIjoxNzQzMTgzMDU0fQ.Whi2AIl36vZzkQ5VcSRLvQ6b1pRMaYzpLJiEYmcwpxI",
"expiresIn":86400000,
"username":"new_username",
"message":"User updated successfully"
}
```

### **5. Delete user **  
```bash
curl --location --request DELETE 'http://localhost:8080/api/auth/user' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjaW5ldHJhY2tzLmNvbSIsInN1YiI6Im5ld191c2VybmFtZSIsImlhdCI6MTc0MzA5NjY1NCwiZXhwIjoxNzQzMTgzMDU0fQ.Whi2AIl36vZzkQ5VcSRLvQ6b1pRMaYzpLJiEYmcwpxI' \
--data ''
```  

**Response:**  
```json
{
"username":"new_username",
"message":"User deleted successfully"
}
```
 
---

## **🔧 Troubleshooting**  
1. **Token Errors?**  
   - Ensure `JWT_SECRET` matches between runs.  
   - Check expiration time (`JWT_EXPIRATION`).  

2. **PostgreSQL Connection Issues?**  
   - Verify credentials in `.env` match `docker-compose.yml`.  

3. **Role-Based Access Failing?**  
   - Use `"role": "ADMIN"` during registration for admin endpoints.  

---

## **📌 Notes for Teammates**  
- Tokens **expire** (default: 3600000seconds).  
- Always include `Authorization: Bearer <token>` for protected routes.  
- **Never commit secrets** (`.env`, `JWT_SECRET`) to Git!  

--- 

✅ **Ready to go!** Deploy with confidence. 🚀



post http://localhost:8083/api/watchlist/movies
example input
{
  "username": "new_username",
  "movieId": "950387",
  "status": "PLAN_TO_WATCH"
}
output 
{
    "id": 2,
    "username": "new_username",
    "movieId": "950387",
    "status": "PLAN_TO_WATCH",
    "createdAt": 1744710638332,
    "updatedAt": 1744710638332
}

GET http://localhost:8083/api/watchlist/movies/new_username
example 
output 
[
    {
        "id": 2,
        "username": "new_username",
        "movieId": "950387",
        "status": "PLAN_TO_WATCH",
        "createdAt": 1744710638332,
        "updatedAt": 1744710638332
    }
]


PUT http://localhost:8083/api/watchlist/movies/new_username/950387
example input 
{
  "status": "COMPLETED"
}
output 
{
    "id": 2,
    "username": "new_username",
    "movieId": "950387",
    "status": "COMPLETED",
    "createdAt": 1744710638332,
    "updatedAt": 1744710653917
}

DELETE http://localhost:8083/api/watchlist/movies/new_username/950387
example 
output 204 no content

POST http://localhost:8083/api/watchlist/tvshows
example input 
{
  "username": "new_username",
  "tvShowId": "1396",
  "currentSeason": 1,
  "currentEpisode": 3,
  "status": "CURRENTLY_WATCHING"
}
output 
{
    "id": 2,
    "username": "new_username",
    "tvShowId": "1396",
    "currentSeason": 1,
    "currentEpisode": 3,
    "status": "CURRENTLY_WATCHING",
    "createdAt": 1744710676314,
    "updatedAt": 1744710676314
}


GET http://localhost:8083/api/watchlist/tvshows/new_username
example
output
[
    {
        "id": 2,
        "username": "new_username",
        "tvShowId": "1396",
        "currentSeason": 1,
        "currentEpisode": 3,
        "status": "CURRENTLY_WATCHING",
        "createdAt": 1744710676314,
        "updatedAt": 1744710676314
    }
]

PUT http://localhost:8083/api/watchlist/tvshows/new_username/1396
example input 
{
  "username": "new_username",
  "tvShowId": "1396",
  "currentSeason": 5,
  "currentEpisode": 16,
  "status": "COMPLETED"
}
output
{
    "id": 2,
    "username": "new_username",
    "tvShowId": "1396",
    "currentSeason": 5,
    "currentEpisode": 16,
    "status": "COMPLETED",
    "createdAt": 1744710676314,
    "updatedAt": 1744710697828
}

DELETE http://localhost:8083/api/watchlist/movies/new_username/1396
example
output 204 no content