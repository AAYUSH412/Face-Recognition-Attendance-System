# 🔐 Sample Login Credentials

## Generated from Database Seeding

### Admin Users
- **Email:** akash.kumar1@student.edu
- **Password:** password123
- **Role:** admin

### Testing Instructions
1. Use any of the admin emails above to login to the admin panel
2. Use any faculty or student email (pattern: firstname.lastname[number]@domain.edu)
3. All users have the same password: `password123`

### Sample API Test (using curl)
```bash
# Login to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "akash.kumar1@student.edu",
    "password": "password123"
  }'

# Use the returned token to access protected endpoints
curl -X GET http://localhost:4000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Database Collections Now Contain:
- **8 Departments** (CS, IT, ECE, ME, CE, EE, MATH, PHY)
- **118 Users** (3 admins, 15 faculty, 100 students)
- **25 Events** (various types and dates)
- **2,627 Attendance Records** (30 days of data)
- **668 Event Attendance Records** (event participation data)

### Next Steps:
1. Start your server: `npm run dev`
2. Test login with admin credentials above
3. Explore the admin panel functionality
4. Import the Postman collection for API testing
5. Test your React frontend with the seeded data

---
*All data is randomly generated for development and testing purposes.*
