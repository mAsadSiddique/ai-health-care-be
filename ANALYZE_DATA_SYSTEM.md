# Analyze Data System Documentation

## Overview
The analyze data system provides functionality for patients to view their analyzed data with detailed information about doctors and analysis results. It includes filtering capabilities and pagination for efficient data retrieval.

## Features

### Core Functionality
- **List Analyze Data**: Retrieve analyze data with optional filters
- **Get Single Record**: Get detailed information about a specific analyze data record
- **Doctor and Patient Details**: Populated information from User entities
- **Filtering**: Optional filters by ID, doctor ID, and patient ID
- **Pagination**: Efficient data retrieval with page-based navigation

## API Endpoints

### Patient Endpoints
- `GET /patient/analyze-data` - List analyze data with filters and pagination
- `GET /patient/analyze-data/:id` - Get specific analyze data by ID

## Data Models

### PatientAnalyzeData Entity
```typescript
{
  _id: ObjectId,
  analyzingData: any,           // Raw analyzing data
  analyzingResult: any,         // Analysis results
  patientDoctorId: ObjectId,    // Reference to User (Doctor)
  patientId: ObjectId,          // Reference to User (Patient)
  createdAt: Date,
  updatedAt: Date
}
```

### Populated Fields
When retrieving analyze data, the following fields are populated:

#### Doctor Information (patientDoctorId)
- `firstName`: Doctor's first name
- `lastName`: Doctor's last name
- `email`: Doctor's email address
- `phoneNumber`: Doctor's phone number
- `specialization`: Doctor's medical specialization
- `doctorFee`: Doctor's consultation fee
- `qualification`: Doctor's medical qualifications
- `experience`: Years of medical experience
- `licenseNumber`: Medical license number
- `address`: Doctor's address
- `dateOfBirth`: Doctor's date of birth
- `gender`: Doctor's gender
- `age`: Doctor's age
- `emergencyContact`: Emergency contact information

#### Patient Information (patientId)
- `firstName`: Patient's first name
- `lastName`: Patient's last name
- `email`: Patient's email address
- `phoneNumber`: Patient's phone number
- `dateOfBirth`: Patient's date of birth
- `gender`: Patient's gender
- `age`: Patient's age
- `emergencyContact`: Emergency contact information
- `address`: Patient's address

## DTOs

### AnalyzeDataListingDTO
```typescript
{
  pageNumber: number,    // Page number (starts from 1)
  pageSize: number,      // Items per page
  id?: string,           // Optional: Filter by analyze data ID
  doctorId?: string,     // Optional: Filter by doctor ID
  patientId?: string     // Optional: Filter by patient ID
}
```

## Business Rules

### Data Access
- Patients can only access their own analyze data
- Authentication and authorization required for all endpoints
- Role-based access control using GuardsEnum.PATIENT

### Filtering
- All filters are optional
- Multiple filters can be combined
- MongoDB ObjectId validation for ID fields

### Pagination
- Default page size from PaginationDTO
- Page numbers start from 1
- Total count and page calculation included

## Response Structure

### Success Response Format
```json
{
  "message": "analyze data listed below",
  "data": {
    "data": [ /* analyze data objects */ ],
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

### Single Record Response
```json
{
  "message": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "analyzingData": { /* raw data */ },
    "analyzingResult": { /* results */ },
    "patientDoctorId": {
      "firstName": "Dr. John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "specialization": "Cardiology",
      "doctorFee": 150,
      "qualification": "MD, FACC",
      "experience": 15,
      "licenseNumber": "MD12345",
      "address": "123 Medical Center Dr, City, State 12345",
      "dateOfBirth": "1980-05-15T00:00:00.000Z",
      "gender": "male",
      "age": 43,
      "emergencyContact": "+1987654321"
    },
    "patientId": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-08-20T00:00:00.000Z",
      "gender": "female",
      "age": 33,
      "emergencyContact": "+1987654321",
      "address": "456 Health Ave, City, State 12345"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "status": 200
}
```

## Usage Examples

### List Analyze Data with Filters
```bash
GET /patient/analyze-data?doctorId=507f1f77bcf86cd799439011&pageNumber=1&pageSize=10
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "analyze data listed below",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "analyzingData": { /* data */ },
        "analyzingResult": { /* results */ },
        "patientDoctorId": {
          "firstName": "Dr. John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+1234567890",
          "specialization": "Cardiology",
          "doctorFee": 150,
          "qualification": "MD, FACC",
          "experience": 15,
          "licenseNumber": "MD12345",
          "address": "123 Medical Center Dr, City, State 12345",
          "dateOfBirth": "1980-05-15T00:00:00.000Z",
          "gender": "male",
          "age": 43,
          "emergencyContact": "+1987654321"
        },
        "patientId": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@example.com",
          "phoneNumber": "+1234567890",
          "dateOfBirth": "1990-08-20T00:00:00.000Z",
          "gender": "female",
          "age": 33,
          "emergencyContact": "+1987654321",
          "address": "456 Health Ave, City, State 12345"
        },
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  },
  "status": 200
}
```

### Get Single Analyze Data Record
```bash
GET /patient/analyze-data/507f1f77bcf86cd799439012
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "analyzingData": { /* raw data */ },
    "analyzingResult": { /* results */ },
    "patientDoctorId": { /* doctor details */ },
    "patientId": { /* patient details */ },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "status": 200
}
```

## Filtering Examples

### Filter by Doctor ID
```bash
GET /patient/analyze-data?doctorId=507f1f77bcf86cd799439011
```

### Filter by Patient ID
```bash
GET /patient/analyze-data?patientId=507f1f77bcf86cd799439012
```

### Filter by Analyze Data ID
```bash
GET /patient/analyze-data?id=507f1f77bcf86cd799439013
```

### Combine Multiple Filters
```bash
GET /patient/analyze-data?doctorId=507f1f77bcf86cd799439011&pageNumber=1&pageSize=5
```

## Error Handling

### Common Error Responses
- **400 Bad Request**: Invalid filter parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Analyze data not found
- **500 Internal Server Error**: Server-side errors

### Error Response Format
```json
{
  "statusCode": 404,
  "message": "not found",
  "error": "Not Found"
}
```

## Security Features

### Authentication
- JWT-based authentication required for all endpoints
- CommonAuthGuard validates JWT tokens

### Authorization
- RoleGuard enforces role-based access control
- Only patients can access their analyze data
- GuardsEnum.PATIENT restriction

### Data Validation
- Input validation using class-validator
- MongoDB ObjectId validation for ID fields
- Pagination parameter validation

## Performance Considerations

- Database indexes on frequently queried fields
- Pagination to limit result set size
- Efficient population of related entities
- Sorting by creation date for logical ordering

## Database Indexes

The system benefits from indexes on:
- `patientId` for patient-specific queries
- `patientDoctorId` for doctor-specific queries
- `createdAt` for chronological sorting
- Compound indexes for combined filters

## Future Enhancements

- Advanced search capabilities
- Date range filtering
- Result export functionality
- Analytics and reporting
- Real-time notifications
- Data visualization
- Integration with external analysis tools

## Testing

The system includes comprehensive testing with:
- Unit tests for service methods
- Integration tests for API endpoints
- Validation testing for filters
- Authorization testing
- Error handling validation

## Deployment

The analyze data system is integrated with:
- Patient module for proper access control
- Shared services for consistent response handling
- Exception handling for error management
- Logging and monitoring capabilities
