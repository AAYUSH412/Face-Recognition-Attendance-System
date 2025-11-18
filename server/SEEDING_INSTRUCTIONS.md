# Database Seeding Instructions

## 🌱 How to Populate Your Database with Sample Data

### Prerequisites
1. Make sure MongoDB is running
2. Your `.env.local` file is configured with the correct MongoDB URI
3. Server dependencies are installed (`npm install`)

### Running the Data Seeder

#### Method 1: Using npm script (Recommended)
```bash
cd server
npm run seed
```

#### Method 2: Direct execution
```bash
cd server
node seedData.js
```

### What Data Will Be Created

The seeder will generate:

#### 📊 **Departments (8 total)**
- Computer Science (CS)
- Information Technology (IT)
- Electronics & Communication (ECE)
- Mechanical Engineering (ME)
- Civil Engineering (CE)
- Electrical Engineering (EE)
- Mathematics (MATH)
- Physics (PHY)

#### 👥 **Users (118 total)**
- **3 Admin users** with full system access
- **15 Faculty users** (professors and teachers)
- **100 Student users** from various departments

#### 🎯 **Events (25 total)**
- Tech symposiums, cultural fests, workshops
- Career fairs, hackathons, conferences
- Various attendee types (all, department-specific, user-specific)

#### ✅ **Attendance Records**
- **30 days** of historical attendance data
- Realistic check-in/check-out times
- Various attendance methods (face recognition, QR code, manual)
- 70-90% attendance rate per day

#### 🎪 **Event Attendance**
- Attendance records for each event
- 40-80% attendance rate per event
- Realistic participation patterns

### Default Login Credentials

**Password for all users:** `password123`

**Sample Admin Login:**
- Check the console output after running the seeder for specific admin email addresses
- All emails follow the pattern: `firstname.lastname@domain.edu`

### Testing Your API

#### Option 1: Using Postman
1. Import the collection file: `Face_Recognition_Attendance_API.postman_collection.json`
2. Set the base URL variable to your server URL (default: `http://localhost:4000/api`)
3. Use the authentication endpoints to get tokens
4. Test all the endpoints with the seeded data

#### Option 2: Manual Testing
1. Start your server: `npm run dev`
2. Use any API client (Postman, Insomnia, curl)
3. Login with seeded user credentials
4. Test the endpoints with the generated data

### Useful API Endpoints to Test

```bash
# Health check
GET /api/demo/health

# Login (get token)
POST /api/auth/login
{
  "email": "admin.email@college.edu",
  "password": "password123"
}

# Get all departments
GET /api/departments
Authorization: Bearer <token>

# Get all users
GET /api/users
Authorization: Bearer <token>

# Get all events
GET /api/events
Authorization: Bearer <token>

# Get attendance records
GET /api/attendance
Authorization: Bearer <token>
```

### Database Reset

To clear all data and reseed:
1. The seeder automatically clears existing data before inserting new data
2. Just run `npm run seed` again

### Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check your `.env.local` file for correct MONGODB_URI
- Verify network connectivity

**Seeding Errors:**
- Check console output for specific error messages
- Ensure all required dependencies are installed
- Verify your schema files are correct

**No Data Showing:**
- Check if seeding completed successfully
- Verify your API endpoints are working
- Check database connection in your main application

### Sample Data Statistics

After successful seeding, you should see:
- 8 departments
- 118 users (3 admins, 15 faculty, 100 students)
- 25 events
- ~2000+ attendance records
- ~500+ event attendance records

### Next Steps

1. **Start your server:** `npm run dev`
2. **Test frontend:** Make sure your React apps can connect and display the data
3. **Explore admin panel:** Login as admin to see management features
4. **Test student features:** Login as student to see user features
5. **Verify attendance:** Check attendance marking and history features

---

*Generated data is for development and testing purposes only. All names, emails, and information are randomly generated and fictional.*
