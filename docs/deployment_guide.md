# Military Asset Management System - Deployment Guide

## Overview
This document provides instructions for deploying the Military Asset Management System. The system consists of a Node.js/Express backend with MongoDB database and a React frontend.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance or cloud-based like MongoDB Atlas)
- npm or yarn package manager

## Backend Deployment

### Local Deployment
1. Navigate to the backend directory:
   ```
   cd military-asset-management/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the `src/config` directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment
1. Set environment variables for production:
   ```
   NODE_ENV=production
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   PORT=5000
   ```

2. Start the production server:
   ```
   npm start
   ```

### Deployment on Render
1. Create a new Web Service on Render
2. Connect your repository
3. Configure the service:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Add the environment variables listed above

## Frontend Deployment

### Local Deployment
1. Navigate to the frontend directory:
   ```
   cd military-asset-management/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```
   npm start
   ```

### Production Build
1. Set the production API URL in `.env`:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

2. Build the frontend:
   ```
   npm run build
   ```

3. The build folder can be deployed to any static hosting service

### Deployment on Render, Netlify, or Vercel
1. Create a new Static Site on your chosen platform
2. Connect your repository
3. Configure the build settings:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Add the environment variables listed above

## Full-Stack Deployment on Render
For a complete deployment on Render:

1. Deploy the backend as a Web Service
2. Deploy the frontend as a Static Site
3. Configure the frontend's REACT_APP_API_URL to point to your backend Web Service URL
4. Ensure CORS is properly configured in the backend to accept requests from your frontend domain

## Database Setup
1. Create a MongoDB database (local or MongoDB Atlas)
2. Update the MONGO_URI in your environment variables to point to your database
3. The application will automatically create the required collections on first run

## Initial Setup After Deployment
1. Access the application and register an admin user
2. Use the admin account to create bases and equipment types
3. Create additional user accounts with appropriate roles
4. Begin using the system to track assets

## Troubleshooting
- If you encounter CORS issues, ensure the backend is configured to accept requests from your frontend domain
- For database connection issues, verify your MONGO_URI is correct and accessible from your deployment environment
- Check the application logs for specific error messages
