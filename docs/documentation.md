# Military Asset Management System - Documentation

## Project Overview

The Military Asset Management System is a comprehensive solution designed to enable commanders and logistics personnel to manage the movement, assignment, and expenditure of critical military assets across multiple bases. The system provides transparency, streamlines logistics operations, and ensures accountability through a secure, role-based access control system.

### Key Features

- **Dashboard**: Displays key metrics with filtering capabilities
- **Purchases Management**: Record and track asset purchases
- **Transfers Management**: Facilitate asset transfers between bases
- **Assignments & Expenditures**: Track asset assignments and expenditures
- **Role-Based Access Control**: Different access levels for Admin, Base Commander, and Logistics Officer
- **Transaction Logging**: Comprehensive audit trail of all system activities

## Tech Stack & Architecture

### Backend
- **Node.js/Express**: Provides a robust and scalable RESTful API
- **MongoDB**: NoSQL database for flexible data storage and retrieval
- **JWT Authentication**: Secure token-based authentication
- **Middleware**: Custom middleware for RBAC and transaction logging

### Frontend
- **React**: Modern UI library for building interactive user interfaces
- **TypeScript**: Adds static typing for improved code quality and developer experience
- **Context API**: State management for authentication and alerts
- **React Router**: Client-side routing for single-page application
- **Axios**: HTTP client for API communication

### Architecture
The application follows a modern client-server architecture:
- **Client**: React single-page application
- **Server**: Express RESTful API
- **Database**: MongoDB document store

This architecture was chosen for its scalability, flexibility, and developer productivity. The separation of concerns between frontend and backend allows for independent scaling and maintenance.

## Data Models / Schema

### User
- **name**: User's full name
- **email**: Unique email for authentication
- **password**: Encrypted password
- **role**: Admin, Base Commander, or Logistics Officer
- **assignedBase**: Reference to Base (for non-admin users)

### Base
- **name**: Base name
- **location**: Geographic location
- **description**: Optional description

### EquipmentType
- **name**: Equipment type name
- **category**: Weapon, Vehicle, Ammunition, or Other
- **description**: Optional description

### Asset
- **equipmentType**: Reference to EquipmentType
- **base**: Reference to Base
- **quantity**: Current quantity available
- **openingBalance**: Opening balance for reporting period
- **closingBalance**: Closing balance for reporting period
- **assigned**: Quantity currently assigned
- **expended**: Quantity expended

### Purchase
- **equipmentType**: Reference to EquipmentType
- **base**: Reference to Base
- **quantity**: Quantity purchased
- **purchaseDate**: Date of purchase
- **purchaseOrder**: Purchase order reference
- **createdBy**: Reference to User
- **notes**: Optional notes

### Transfer
- **equipmentType**: Reference to EquipmentType
- **fromBase**: Source base reference
- **toBase**: Destination base reference
- **quantity**: Quantity transferred
- **transferDate**: Date of transfer
- **transferOrder**: Transfer order reference
- **status**: Pending, In Transit, Completed, or Cancelled
- **createdBy**: Reference to User
- **notes**: Optional notes

### Assignment
- **equipmentType**: Reference to EquipmentType
- **base**: Reference to Base
- **quantity**: Quantity assigned
- **assignedTo**: Person or unit assigned to
- **assignmentDate**: Date of assignment
- **returnDate**: Date of return (if applicable)
- **status**: Assigned, Returned, or Expended
- **createdBy**: Reference to User
- **notes**: Optional notes

### TransactionLog
- **action**: Type of action (purchase, transfer, assignment, etc.)
- **user**: Reference to User who performed the action
- **details**: Details of the transaction
- **ipAddress**: IP address of the request
- **timestamp**: Date and time of the transaction

## RBAC Explanation

The system implements Role-Based Access Control (RBAC) with three distinct roles:

### Admin
- Full access to all data and operations
- Can manage bases and equipment types
- Can view and manage all purchases, transfers, and assignments
- Can register new users

### Base Commander
- Access limited to their assigned base
- Can view dashboard metrics for their base
- Can manage purchases, transfers, and assignments for their base
- Cannot manage bases or equipment types

### Logistics Officer
- Limited access to their assigned base
- Can view dashboard metrics for their base
- Can record purchases and initiate transfers
- Can manage assignments and expenditures
- Cannot manage bases or equipment types

RBAC is enforced through middleware that checks the user's role and assigned base before allowing access to protected routes. The frontend also implements route protection to prevent unauthorized access to admin-only pages.

## API Logging

All transactions in the system are logged for auditing purposes using the TransactionLog model. The logging middleware captures:

- The type of action performed
- The user who performed the action
- Details of the transaction (method, URL, request body, etc.)
- IP address of the request
- Timestamp

Sensitive information (like passwords) is automatically redacted from the logs. GET requests are not logged to reduce noise, focusing only on state-changing operations.

This comprehensive logging system ensures accountability and provides an audit trail for all operations performed in the system.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd military-asset-management/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `src/config` directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd military-asset-management/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

### Production Deployment
1. Build the frontend:
   ```
   cd military-asset-management/frontend
   npm run build
   ```

2. Set environment variables for production:
   ```
   NODE_ENV=production
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   ```

3. Start the production server:
   ```
   cd military-asset-management/backend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Bases
- `GET /api/v1/bases` - Get all bases (filtered by user role)
- `GET /api/v1/bases/:id` - Get single base
- `POST /api/v1/bases` - Create new base (Admin only)
- `PUT /api/v1/bases/:id` - Update base (Admin only)
- `DELETE /api/v1/bases/:id` - Delete base (Admin only)

### Equipment Types
- `GET /api/v1/equipment-types` - Get all equipment types
- `GET /api/v1/equipment-types/:id` - Get single equipment type
- `POST /api/v1/equipment-types` - Create new equipment type (Admin only)
- `PUT /api/v1/equipment-types/:id` - Update equipment type (Admin only)
- `DELETE /api/v1/equipment-types/:id` - Delete equipment type (Admin only)

### Assets
- `GET /api/v1/assets` - Get all assets (filtered by user role)
- `GET /api/v1/assets/:id` - Get single asset
- `GET /api/v1/assets/dashboard` - Get dashboard metrics

### Purchases
- `GET /api/v1/purchases` - Get all purchases (filtered by user role)
- `GET /api/v1/purchases/:id` - Get single purchase
- `POST /api/v1/purchases` - Create new purchase
- `PUT /api/v1/purchases/:id` - Update purchase (Admin only)
- `DELETE /api/v1/purchases/:id` - Delete purchase (Admin only)

### Transfers
- `GET /api/v1/transfers` - Get all transfers (filtered by user role)
- `GET /api/v1/transfers/:id` - Get single transfer
- `POST /api/v1/transfers` - Create new transfer
- `PUT /api/v1/transfers/:id` - Update transfer status
- `DELETE /api/v1/transfers/:id` - Delete transfer (Admin only)

### Assignments
- `GET /api/v1/assignments` - Get all assignments (filtered by user role)
- `GET /api/v1/assignments/:id` - Get single assignment
- `POST /api/v1/assignments` - Create new assignment
- `PUT /api/v1/assignments/:id` - Update assignment status
- `DELETE /api/v1/assignments/:id` - Delete assignment (Admin only)
