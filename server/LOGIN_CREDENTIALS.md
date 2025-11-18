# 🔐 Sample Login Credentials

## Generated from Database Seeding

### 👑 Admin Users
- **Email:** admin@college.edu
- **Password:** admin123
- **Role:** admin
- **Registration ID:** ADMIN123

### 👨‍🏫 Faculty Users
- **Email:** facultyfacerecognition@gmail.com
- **Password:** facultyface123
- **Role:** faculty
- **Registration ID:** FAC001

### 👨‍🎓 Student Users
- **Email:** facerecognition@gmail.com
- **Password:** facestudent123
- **Role:** student
- **Registration ID:** STU0001

### Other Generated Users
- **Email:** akash.kumar1@student.edu (and other generated emails)
- **Password:** password123
- **Role:** admin/faculty/student

### Testing Instructions
1. Use the hardcoded admin email (admin@college.edu) to login to the admin panel
2. Use the hardcoded faculty email (facultyfacerecognition@gmail.com) for faculty testing
3. Use the hardcoded student email (facerecognition@gmail.com) for student testing
4. Use any other generated email (pattern: firstname.lastname[number]@domain.edu) with password123

### Sample API Test (using curl)
```bash
# Login with hardcoded admin credentials
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123"
  }'

# Login with hardcoded student credentials
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "facerecognition@gmail.com",
    "password": "facestudent123"
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
