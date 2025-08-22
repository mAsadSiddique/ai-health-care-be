# Appointment System Documentation

## Overview
The appointment system provides a comprehensive solution for managing medical appointments between patients and doctors. It includes role-based access control, appointment scheduling, status management, and administrative oversight.

## Features

### Core Functionality
- **Patient Appointment Booking**: Patients can book appointments with available doctors
- **Doctor Appointment Creation**: Doctors can create appointments for patients
- **Appointment Status Management**: Support for PENDING, APPROVED, REJECTED, and COMPLETED statuses
- **Conflict Detection**: Prevents double-booking and time overlaps
- **Role-Based Access Control**: Different endpoints for patients, doctors, and admins
- **Pagination and Filtering**: Advanced search and filtering capabilities

### Appointment Statuses
- **PENDING**: Initial status when appointment is created
- **APPROVED**: Doctor has approved the appointment
- **REJECTED**: Appointment was rejected (with reason)
- **COMPLETED**: Appointment has been completed

## API Endpoints

### Patient Endpoints
- `POST /appointments/book` - Book a new appointment
- `GET /appointments/` - Get patient's appointments
- `GET /appointments/:id` - Get specific appointment details
- `DELETE /appointments/:id/cancel` - Cancel an appointment

### Doctor Endpoints
- `POST /appointments/doctor/create` - Create appointment for patient
- `PUT /appointments/doctor/status` - Update appointment status
- `GET /appointments/doctor/` - Get doctor's appointments

### Admin Endpoints
- `GET /admin/appointments` - Get all appointments (with filters)
- `GET /admin/appointments/:id` - Get specific appointment details
- `PUT /admin/appointments/:id/status` - Update appointment status
- `DELETE /admin/appointments/:id` - Delete appointment

## Response Structure

All API responses follow a consistent structure using the `SharedService`:

### Success Response
```json
{
  "message": "Success message from RESPONSE_MESSAGES enum",
  "data": { /* response data */ },
  "status": 200
}
```

### Error Response
Errors are handled through the `ExceptionService` and follow standard HTTP status codes:
- **400 Bad Request**: Validation errors, business rule violations
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

## Data Models

### Appointment Entity
```typescript
{
  _id: ObjectId,
  patientId: ObjectId,        // Reference to User (Patient)
  doctorId: ObjectId,         // Reference to User (Doctor)
  appointmentDateTime: Date,   // Scheduled date and time
  duration: number,            // Duration in minutes (15-480)
  description: string,         // Appointment description
  status: AppointmentStatus,   // Current status
  doctorFee: number,          // Doctor's fee for the appointment
  rejectionReason?: string,    // Reason if rejected
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date
}
```

### DTOs
- **BookAppointmentDTO**: For patient appointment booking
- **DoctorCreateAppointmentDTO**: For doctor appointment creation
- **UpdateAppointmentStatusDTO**: For status updates
- **AppointmentsListingDTO**: For listing with filters and pagination

## Business Rules

### Appointment Booking
- Patients can only book appointments with verified doctors
- Doctor must have a valid fee set
- No time conflicts allowed
- Duration must be between 15 minutes and 8 hours

### Status Transitions
- PENDING → APPROVED/REJECTED
- APPROVED → COMPLETED (cannot be rejected after approval)
- REJECTED → Cannot be approved (requires new appointment)

### Cancellation Rules
- Patients can only cancel their own appointments
- Cancellation must be at least 24 hours in advance
- Only PENDING or APPROVED appointments can be cancelled

### Conflict Detection
- Prevents overlapping appointments for the same doctor
- Considers appointment duration when checking conflicts
- Only checks PENDING and APPROVED appointments

## Security Features

### Authentication
- JWT-based authentication required for all endpoints
- CommonAuthGuard validates JWT tokens

### Authorization
- RoleGuard enforces role-based access control
- Different endpoints require different user types
- Admin endpoints restricted to admin users only

### Data Validation
- Input validation using class-validator
- MongoDB ObjectId validation
- Date and time validation
- Business rule validation

## Error Handling

### Exception Service Usage
The system uses the `ExceptionService` for consistent error handling:

```typescript
// For not found errors
this.exceptionService.sendNotFoundException(RESPONSE_MESSAGES.APPOINTMENT_NOT_FOUND)

// For bad request errors
this.exceptionService.sendBadRequestException(RESPONSE_MESSAGES.APPOINTMENT_TIME_CONFLICT)

// For forbidden errors
this.exceptionService.sendForbiddenException(RESPONSE_MESSAGES.FORBIDDEN)
```

### Business Logic Errors
- Doctor not found or blocked
- Patient not found or blocked
- Appointment time conflicts
- Invalid status transitions
- Insufficient cancellation notice

## Usage Examples

### Booking an Appointment
```bash
POST /appointments/book
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "doctorId": "507f1f77bcf86cd799439011",
  "appointmentDateTime": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "description": "Regular checkup"
}
```

**Response:**
```json
{
  "message": "appointment booked successfully",
  "data": { /* appointment object */ },
  "status": 200
}
```

### Updating Appointment Status
```bash
PUT /appointments/doctor/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439011",
  "status": "approved"
}
```

**Response:**
```json
{
  "message": "appointment status updated successfully",
  "data": { /* updated appointment object */ },
  "status": 200
}
```

### Getting Appointments with Filters
```bash
GET /appointments/doctor/?status=pending&date=2024-01-15&pageNumber=1&pageSize=10
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "appointments listed below",
  "data": {
    "data": [ /* appointment objects */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "status": 200
}
```

## Response Messages

The system uses standardized response messages from the `RESPONSE_MESSAGES` enum:

### Appointment Success Messages
- `APPOINTMENT_BOOKED_SUCCESSFULLY`: "appointment booked successfully"
- `APPOINTMENT_CREATED_SUCCESSFULLY`: "appointment created successfully"
- `APPOINTMENT_STATUS_UPDATED`: "appointment status updated successfully"
- `APPOINTMENT_CANCELLED_SUCCESSFULLY`: "appointment cancelled successfully"
- `APPOINTMENT_DELETED_SUCCESSFULLY`: "appointment deleted successfully"
- `APPOINTMENT_LISTING`: "appointments listed below"

### Appointment Error Messages
- `APPOINTMENT_NOT_FOUND`: "appointment not found"
- `APPOINTMENT_TIME_CONFLICT`: "appointment time conflicts with existing appointment"
- `APPOINTMENT_CANNOT_APPROVE_REJECTED`: "cannot approve a rejected appointment"
- `APPOINTMENT_CANNOT_REJECT_APPROVED`: "cannot reject an approved appointment"
- `APPOINTMENT_REJECTION_REASON_REQUIRED`: "rejection reason is required when rejecting an appointment"
- `APPOINTMENT_CANNOT_CANCEL_WITHIN_24H`: "appointments can only be cancelled at least 24 hours in advance"
- `APPOINTMENT_CANNOT_DELETE_APPROVED`: "cannot delete approved or completed appointments"
- `DOCTOR_FEE_NOT_SET`: "doctor fee is not set"

## Database Indexes

The system includes optimized database indexes for:
- Patient appointments by patientId and appointmentDateTime
- Doctor appointments by doctorId and appointmentDateTime
- Appointment status queries
- General appointment date queries

## Performance Considerations

- Pagination implemented for large result sets
- Database indexes for common query patterns
- Efficient conflict detection algorithms
- Minimal database queries through proper population

## Future Enhancements

- Email notifications for appointment changes
- Calendar integration
- Recurring appointment support
- Video consultation integration
- Payment processing integration
- Appointment reminders
- Analytics and reporting

## Testing

The system includes comprehensive testing with:
- Unit tests for service methods
- Integration tests for API endpoints
- E2E tests for complete workflows
- Validation testing for business rules

## Deployment

The appointment system is containerized with Docker and includes:
- Environment-specific configuration
- Health checks
- Logging and monitoring
- Database migration scripts
