# CabGo – Fleet Management and Booking System

A web-based fleet management and cab booking application built using **React.js, Node.js, Express.js, MongoDB, REST APIs, JWT, and Mongoose**.

The application allows customers to browse and book cabs, estimate fares, manage bookings, schedule rides, and track rides. It also allows administrators to manage vehicles, drivers, customers, bookings, and fleet operations. Drivers can view and manage their assigned rides.

## 1. Problem Statement

Many small travel agencies still rely on manual methods such as phone calls, WhatsApp messages, and handwritten records to manage cab bookings, drivers, vehicles, and customer information. These methods can result in booking conflicts, inefficient driver allocation, poor fleet utilization, and difficulty in monitoring business operations.

Customers may also face difficulties in checking vehicle availability, estimating fares, and scheduling rides conveniently.

CabGo is a web-based fleet management and booking system developed to overcome these limitations by providing a centralized platform for managing cab bookings, vehicles, drivers, and customers.

The application allows customers to book cabs online while administrators can manage vehicles, drivers, bookings, and fleet operations through a single platform.

The system supports three main roles:

- Customers
- Administrators
- Drivers

## 2. Project Objective

The main objectives of this project are:

- To provide an online platform for cab booking.
- To allow customers to browse available vehicles.
- To provide pickup and drop location selection.
- To provide dynamic fare estimation.
- To manage customer bookings.
- To provide scheduled booking functionality.
- To provide ride tracking.
- To manage vehicles and fleet availability.
- To manage driver information and availability.
- To assign drivers to customer bookings.
- To provide secure user authentication using JWT.
- To implement role-based access for Users, Admins, and Drivers.
- To provide an administrator dashboard.
- To provide analytics and reports.
- To develop the frontend using React.js.
- To develop REST APIs using Node.js and Express.js.
- To store application data using MongoDB.
- To perform database operations using Mongoose.

## 3. What Does This Project Do?

CabGo is divided into three main modules:

1. Customer Module
2. Admin Module
3. Driver Module

### Customer Registration

A new customer can create an account by providing the required personal information.

The entered details are validated and stored in the MongoDB database.

### Customer Login

Registered customers can log in using their email and password.

After successful authentication, the customer is redirected to the user dashboard.

### User Dashboard

The User Dashboard provides access to:

- Book a Cab
- My Bookings
- Track Ride
- Scheduled Bookings

It also displays the user's recent booking history.

### Cab Booking

The customer can select:

- Pickup location
- Destination
- Vehicle type

The customer can view the estimated fare and confirm the booking.

### Fare Estimation

The system calculates the estimated travel cost based on the selected pickup location, destination, and vehicle type.

The estimated fare is displayed before the booking is confirmed.

### My Bookings

Customers can view their current and previous bookings.

They can check:

- Booking details
- Trip status
- Assigned driver
- Fare details

### Scheduled Bookings

Customers can schedule rides for a future date and time.

### Ride Tracking

The application provides ride tracking functionality so that customers can check the status of their ride.

### User Profile

Customers can view and update their personal information through their profile.

### Admin Dashboard

The Admin Dashboard provides an overview of the travel agency's operations.

It displays:

- Fleet availability
- Booking summaries
- Daily activities
- Earnings
- Recent bookings

### Pending Bookings

The Pending Bookings page displays newly created bookings that are waiting for driver assignment.

The administrator reviews the booking, checks vehicle availability, and assigns an available driver.

### Fleet Management

The Fleet Management module allows administrators to:

- Add new vehicles
- Update vehicle information
- Monitor vehicle availability
- Remove inactive vehicles
- View vehicle status

The system tracks whether a vehicle is currently available, booked, or offline.

### Driver Management

The Driver Management module allows administrators to:

- Add drivers
- Update driver details
- View driver information
- Monitor driver availability
- Assign available drivers to bookings

Driver availability is updated as trips are assigned and completed.

### User Management

Administrators can view registered customers, monitor user activity, and manage customer accounts.

### Analytics

The Analytics module provides:

- Booking statistics
- Fleet utilization
- Driver activity
- Revenue information

This helps administrators evaluate business performance.

### Driver Dashboard

The Driver Dashboard displays trips assigned to the logged-in driver.

Drivers can view:

- Pickup location
- Destination
- Customer information
- Vehicle details
- Trip status

## 4. Key Features

The main features of the application are:

- Customer registration
- Customer login
- JWT authentication
- Role-based access
- Vehicle browsing
- Cab booking
- Pickup and drop location selection
- Fare estimation
- Booking management
- Scheduled bookings
- Ride tracking
- User profile management
- Admin dashboard
- Pending booking management
- Fleet management
- Vehicle availability tracking
- Driver management
- Driver assignment
- User management
- Driver dashboard
- Trip status management
- Analytics and reports
- Revenue monitoring
- REST API communication
- MongoDB database integration

## 5. Technologies Used

### Frontend

- React.js
- JavaScript
- JSX
- HTML
- CSS
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Leaflet
- Leaflet
- Recharts
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express.js
- REST APIs
- Mongoose
- JWT
- bcryptjs
- Express Validator
- Multer
- CORS
- Morgan

### Database

- MongoDB

### Development Tools

- Visual Studio Code
- MongoDB
- Git
- GitHub
- npm
- Postman

### Deployment & DevOps

- Docker
- Docker Compose
- Jenkins
- AWS EC2

## 6. How the Project Works

The application follows a frontend-backend architecture.

The overall flow is:

                    User
                      |
                      v
              React Frontend
             Vite + Tailwind CSS
                      |
                Axios Requests
                      |
                      v
              Node.js + Express
                 REST APIs
                      |
                  Controller
                      |
                   Service
                      |
                    Model
                      |
                  Mongoose
                      |
                      v
                  MongoDB

The role-based flow is:

                       CabGo
                         |
          ┌──────────────┼──────────────┐
          |              |              |
          v              v              v
      Customer         Admin         Driver
          |              |              |
       Book Cab      Manage Fleet    View Rides
       View Booking  Manage Drivers  Manage Trips
       Track Ride    Manage Users
       Profile       Analytics
       Scheduled     Bookings
       Rides

The backend is organized using separate Routes, Controllers, Models, Middleware, Services, and Configuration folders.

## 7. Database

MongoDB is used as the database for the application.

Mongoose is used to define schemas and perform database operations.

The main collections are:

- **Users** – Stores registered customer information.
- **Admins** – Stores administrator details.
- **Drivers** – Stores driver information and availability status.
- **Cars** – Stores vehicle details including availability and type.
- **Bookings** – Stores customer booking information, trip details, assigned driver, and booking status.

CRUD operations are implemented for managing the application data.

## 8. Authentication and Authorization

CabGo uses **JSON Web Tokens (JWT)** for authentication.

The authentication process works as follows:

        User Registration
               |
               v
           User Login
               |
               v
       Verify Credentials
               |
               v
       Generate JWT Token
               |
               v
    Access Protected Resources
               |
               v
         Check User Role
               |
               v
       Allow Authorized Access

Passwords are encrypted using **bcryptjs** before being stored in MongoDB.

The system provides role-based access for:

- User
- Admin
- Driver

Each role can access only the functionalities assigned to it.

## 9. REST API

The React frontend communicates with the backend using REST APIs.

Axios is used to send requests from the frontend to the Express.js backend.

The backend processes the requests and communicates with MongoDB using Mongoose.

The APIs handle:

- User authentication
- Vehicle management
- Driver management
- Cab booking
- Driver assignment
- Fare estimation
- Booking status management
- Dashboard analytics

The application uses the following HTTP methods:

- **GET** – Retrieve data
- **POST** – Create new data
- **PUT** – Update existing data
- **DELETE** – Delete data

Postman was used to test the APIs before integrating them with the frontend.

## 10. How to Run the Project

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB
- Git

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd cabgo
