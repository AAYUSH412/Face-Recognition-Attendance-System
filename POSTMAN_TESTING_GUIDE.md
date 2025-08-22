# Face Recognition Attendance System - Postman Collection

This repository contains a comprehensive Postman collection for testing the Face Recognition Attendance System API with sample test data.

## Files Included

1. `Face-Recognition-Attendance-System.postman_collection.json` - Main Postman collection
2. `Face-Recognition-Attendance-System.postman_environment.json` - Environment variables
3. `POSTMAN_TESTING_GUIDE.md` - This guide

## Quick Setup

### 1. Import Collection and Environment
1. Open Postman
2. Click "Import" button
3. Import both JSON files:
   - `Face-Recognition-Attendance-System.postman_collection.json`
   - `Face-Recognition-Attendance-System.postman_environment.json`
4. Select the imported environment from the dropdown in top right

### 2. Start Your Server
Make sure your server is running on `http://localhost:4000`

```bash
cd server
npm run dev
```

## Collection Structure

### 🚀 Demo Setup
- **Setup Demo Data**: Creates sample departments, users, and events
- **Cleanup Demo Data**: Removes all demo data

### 🔐 Authentication
- **Register Users**: Admin, Faculty, and Student registration
- **Login**: Login endpoints for different user types
- **Get Current User**: Retrieve current user information

### 🏢 Departments
- **Create Departments**: Computer Science, IT, Electronics
- **Get All Departments**: List all departments
- **Update Department**: Modify department information

### 👥 Users
- **Get All Users**: Admin endpoint to view all users
- **Get User by ID**: Retrieve specific user details
- **Add Face Data**: Upload face images for recognition
- **Change Password**: Update user password

### 📅 Events
- **Create Events**: Tech seminars, workshops, guest lectures
- **Get Events**: All, upcoming, today's events
- **Update Events**: Modify event details
- **QR Code Management**: Generate and regenerate QR codes
- **Event Attendance**: Mark and verify attendance
- **Get Attendees**: View event participant lists

### ⏰ Attendance
- **Manual Attendance**: Check-in/check-out manually
- **Face Recognition**: Mark attendance with face images
- **Today's Attendance**: Get current day records
- **My Attendance**: Personal attendance history
- **Statistics**: Attendance analytics
- **Admin Functions**: View, update, export, delete records

## Usage Guide

### Step 1: Setup Demo Data (Optional)
Run the "Setup Demo Data" request to create sample departments, users, and events.

### Step 2: Authentication Flow
1. **Register users** or use demo data
2. **Login** with created credentials
3. Tokens are automatically saved to environment variables

### Step 3: Test Core Features

#### For Students/Faculty:
1. Login with student/faculty credentials
2. Mark attendance (manual or face recognition)
3. View personal attendance records
4. Register for events
5. View available events

#### For Administrators:
1. Login with admin credentials
2. Create/manage departments
3. View all users and attendance records
4. Create/manage events
5. Export attendance data
6. Update/verify attendance records

## Sample Test Data

### Users Created
- **Admin**: admin@college.edu / admin123
- **Faculty**: john.smith@college.edu / faculty123
- **Student**: alice.johnson@student.college.edu / student123

### Departments
- Computer Science & Engineering
- Information Technology
- Electronics & Communication

### Events
- AI and Machine Learning Seminar
- React.js Development Workshop
- Industry Expert Guest Lecture
- Hackathon 2025

## Authentication

The collection uses Bearer token authentication. Tokens are automatically:
- Generated upon login/registration
- Stored in environment variables
- Used in subsequent requests

### Environment Variables
- `baseUrl`: Server base URL (default: http://localhost:4000)
- `authToken`: Current user authentication token
- `adminToken`: Admin user authentication token
- `userId`: Current user ID
- `departmentId`: Sample department ID
- `eventId`: Sample event ID
- `attendanceId`: Sample attendance record ID

## API Endpoints Covered

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user

### Users (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /:id` - Get user by ID (admin)
- `POST /face` - Add face data
- `DELETE /face/:imageId` - Remove face data
- `PUT /password` - Change password

### Departments (`/api/departments`)
- `GET /` - Get all departments
- `POST /` - Create department (admin)
- `PUT /:id` - Update department (admin)

### Events (`/api/events`)
- `GET /` - Get events (with filters)
- `POST /` - Create event
- `GET /:id` - Get event by ID
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `POST /:id/regenerate-qr` - Regenerate QR code
- `POST /verify-attendance` - Verify QR attendance
- `GET /:id/attendees` - Get event attendees

### Attendance (`/api/attendance`)
- `POST /mark-manual` - Manual attendance
- `POST /mark` - Face recognition attendance
- `GET /today` - Today's attendance
- `GET /me` - My attendance records
- `GET /stats` - Attendance statistics
- `GET /` - All attendance records (admin)
- `PUT /:id` - Update attendance (admin)
- `GET /export` - Export attendance data (admin)
- `DELETE /:id` - Delete attendance (admin)

### Demo (`/api/demo`)
- `POST /setup` - Setup demo data
- `DELETE /cleanup` - Cleanup demo data

## Testing Scenarios

### 1. Basic Flow
1. Setup demo data
2. Login as different user types
3. Create departments and events
4. Mark attendance
5. View reports

### 2. Face Recognition Flow
1. Register user
2. Upload face data
3. Mark attendance with face image
4. Verify attendance records

### 3. Event Management Flow
1. Create event
2. Generate QR code
3. Mark attendance via QR
4. View attendee list

### 4. Admin Management Flow
1. Login as admin
2. View all users and attendance
3. Update/verify records
4. Export data

## Error Handling

The collection includes various test cases for:
- Invalid credentials
- Missing required fields
- Unauthorized access
- Duplicate entries
- Non-existent resources

## Notes

- Ensure your server is running before testing
- Some endpoints require admin privileges
- Face data uses base64 encoded images
- QR codes are generated automatically for events
- Attendance records are date-based
- Export functionality provides CSV format

## Support

For issues or questions:
1. Check server logs for backend errors
2. Verify environment variables are set
3. Ensure proper authentication tokens
4. Review request/response in Postman console
