# User Authentication & CRUD API

## Overview
This project implements a robust RESTful API for user management, authentication, and authorization using Node.js, Express, and Mongoose. It supports full CRUD operations on user resources, incorporates JWT-based authentication, and features role-based access control.

## Features
-   **Node.js**: Backend JavaScript runtime environment for building scalable network applications.
-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js, used for routing and middleware management.
-   **MongoDB (via Mongoose)**: NoSQL database for flexible data storage, with Mongoose providing ODM for schema definition and interaction.
-   **JWT Authentication**: Secure user authentication using JSON Web Tokens for stateless session management.
-   **Role-Based Access Control (RBAC)**: Middleware for restricting access to resources based on user roles (`owner`, `admin`, `user`).
-   **Data Validation**: Joi schemas enforce strict validation rules for incoming request payloads (e.g., email format, password strength).
-   **Password Hashing**: Bcrypt for securely hashing and salting user passwords.
-   **Email Domain Validation**: Utility to verify the existence of an email's domain via DNS MX records.
-   **Environment Configuration**: Dotenv for managing environment variables securely.

## Getting Started

### Installation
To set up and run this project locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/njaumatilda/PRODIGY_BD_04.git
    cd PRODIGY_BD_04
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Server**:
    ```bash
    npm start
    ```
    For development with automatic restarts:
    ```bash
    npm run dev
    ```

### Environment Variables
Create a `.env` file in the root directory of the project with the following variables:

```
PORT=
DB_URL=
SALT=
JWT_KEY=
```

*   `PORT`: The port number on which the Express server will listen.
*   `DB_URL`: The connection string for your MongoDB instance.
*   `SALT`: The number of salt rounds to use for bcrypt password hashing.
*   `JWT_KEY`: A secret key used to sign and verify JSON Web Tokens.

## API Documentation

### Base URL
`http://localhost:<PORT>` (e.g., `http://localhost:8000`)

### Authentication Endpoints

#### `POST /auth/users/register`
Registers a new user account.

**Request**:
```json
{
  "name": "JOHN DOE",
  "email": "john.doe@example.com",
  "password": "StrongPassword123!",
  "role": "user"
}
```
*   `name` (string, required): User's name. Must be between 3 and 20 characters, trimmed, and uppercase.
*   `email` (string, required): User's email address. Must be a valid email format, trimmed, lowercase, and unique. The domain will be validated.
*   `password` (string, required): User's password. Must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character.
*   `role` (string, required): User's role. Must be one of `owner`, `admin`, or `user`.

**Response**:
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "65b2111d4e028b17a1a2b3c4",
    "name": "JOHN DOE",
    "email": "john.doe@example.com",
    "role": "user",
    "__v": 0
  }
}
```

**Errors**:
-   `400 Bad Request`: Validation error (e.g., invalid email format, weak password, invalid role, invalid email domain).
-   `409 Conflict`: Email is already in use.
-   `500 Internal Server Error`: Server-side error.

#### `POST /auth/users/login`
Authenticates a user and provides a JWT token.

**Request**:
```json
{
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
}
```
*   `email` (string, required): User's email address.
*   `password` (string, required): User's password.

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65b2111d4e028b17a1a2b3c4",
    "name": "JOHN DOE",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

**Errors**:
-   `400 Bad Request`: Validation error (e.g., missing email or password).
-   `401 Unauthorized`: Invalid credentials (e.g., incorrect password).
-   `404 Not Found`: User not found with the provided email.
-   `500 Internal Server Error`: Server-side error.

### User Management Endpoints (Protected by JWT and Role-Based Access)

All endpoints under `/users` require a valid JWT `Authorization` header in the format `Bearer <token>`.

#### `GET /users`
Retrieves a list of all users.

**Request**:
Requires `Authorization: Bearer <token>` header.

**Response**:
```json
[
  {
    "_id": "65b2111d4e028b17a1a2b3c4",
    "name": "JOHN DOE",
    "email": "john.doe@example.com",
    "password": "hashedpassword",
    "role": "user",
    "__v": 0
  },
  {
    "_id": "65b2111d4e028b17a1a2b3c5",
    "name": "JANE SMITH",
    "email": "jane.smith@example.com",
    "password": "hashedpassword",
    "role": "admin",
    "__v": 0
  }
]
```

**Errors**:
-   `401 Unauthorized`: Missing, invalid, or expired authentication token.
-   `500 Internal Server Error`: Server-side error.

#### `GET /users/:id`
Retrieves a single user by their ID.

**Request**:
Requires `Authorization: Bearer <token>` header.

**Response**:
```json
{
  "_id": "65b2111d4e028b17a1a2b3c4",
  "name": "JOHN DOE",
  "email": "john.doe@example.com",
  "password": "hashedpassword",
  "role": "user",
  "__v": 0
}
```

**Errors**:
-   `400 Bad Request`: Invalid ID format.
-   `401 Unauthorized`: Missing, invalid, or expired authentication token.
-   `404 Not Found`: User not found.
-   `500 Internal Server Error`: Server-side error.

#### `POST /users`
Creates a new user. (Accessible only by `admin` role)

**Request**:
Requires `Authorization: Bearer <token>` header (from an `admin` user).
```json
{
  "name": "ALICE BROWN",
  "email": "alice.brown@example.com",
  "password": "SecurePassword123!",
  "role": "user"
}
```
*   `name` (string, required): User's name.
*   `email` (string, required): User's email address.
*   `password` (string, required): User's password.
*   `role` (string, required): User's role.

**Response**:
```json
{
  "message": "User created successfully by admin",
  "user": {
    "_id": "65b2111d4e028b17a1a2b3c6",
    "name": "ALICE BROWN",
    "email": "alice.brown@example.com",
    "role": "user",
    "__v": 0
  }
}
```

**Errors**:
-   `400 Bad Request`: Validation error (e.g., invalid email, weak password, invalid role, invalid email domain).
-   `401 Unauthorized`: Missing, invalid, or expired authentication token.
-   `403 Forbidden`: User role does not have permissions to create users.
-   `409 Conflict`: Email is already in use.
-   `500 Internal Server Error`: Server-side error.

#### `PATCH /users/:id`
Updates an existing user's information. (Users can only update their own profile.)

**Request**:
Requires `Authorization: Bearer <token>` header (where `token.id` matches `:id`).
```json
{
  "name": "JOHN CENA",
  "age": 35
}
```
*   `name` (string, optional): New name for the user.
*   `email` (string, optional): New email for the user. Must be valid and not in use.
*   `age` (number, optional): New age for the user. Must be positive, between 18 and 90.

**Response**:
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "65b2111d4e028b17a1a2b3c4",
    "name": "JOHN CENA",
    "email": "john.doe@example.com",
    "password": "hashedpassword",
    "age": 35,
    "role": "user",
    "__v": 0
  }
}
```

**Errors**:
-   `400 Bad Request`: Validation error (e.g., invalid name length, invalid email, invalid age, invalid ID format, invalid email domain).
-   `401 Unauthorized`: Missing, invalid, or expired authentication token, or the token's user ID does not match the `:id` parameter.
-   `404 Not Found`: User to update not found.
-   `500 Internal Server Error`: Server-side error.

#### `DELETE /users/:id`
Deletes a single user by their ID. (Accessible only by `admin` or `owner` roles)

**Request**:
Requires `Authorization: Bearer <token>` header (from an `admin` or `owner` user).

**Response**:
```json
{
  "message": "User deleted successfully",
  "user": {
    "_id": "65b2111d4e028b17a1a2b3c4",
    "name": "JOHN DOE",
    "email": "john.doe@example.com",
    "password": "hashedpassword",
    "role": "user",
    "__v": 0
  }
}
```

**Errors**:
-   `400 Bad Request`: Invalid ID format.
-   `401 Unauthorized`: Missing, invalid, or expired authentication token.
-   `403 Forbidden`: User role does not have permissions to delete users.
-   `404 Not Found`: User not found.
-   `500 Internal Server Error`: Server-side error.

#### `DELETE /users`
Deletes all users from the database. (Accessible only by `admin` or `owner` roles)

**Request**:
Requires `Authorization: Bearer <token>` header (from an `admin` or `owner` user).

**Response**:
```json
{
  "message": "Users deleted successfully",
  "users": {
    "acknowledged": true,
    "deletedCount": 3
  }
}
```

**Errors**:
-   `401 Unauthorized`: Missing, invalid, or expired authentication token.
-   `403 Forbidden`: User role does not have permissions to delete all users.
-   `500 Internal Server Error`: Server-side error.

## Technologies Used

| Technology | Description                                                               |
| :--------- | :------------------------------------------------------------------------ |
| Node.js    | A JavaScript runtime built on Chrome's V8 JavaScript engine.              |
| Express.js | Fast, unopinionated, minimalist web framework for Node.js.                |
| Mongoose   | MongoDB object data modeling (ODM) for Node.js.                           |
| MongoDB    | A document-oriented NoSQL database program.                               |
| bcrypt     | A library for hashing passwords.                                          |
| dotenv     | Loads environment variables from a `.env` file.                           |
| Joi        | Powerful schema description language and data validator for JavaScript.   |
| jsonwebtoken | An implementation of JSON Web Tokens for authentication.                  |
| dns/promises | Node.js built-in module for DNS lookups using Promises.                   |

## Contributing
Contributions are welcome! If you'd like to contribute, please follow these guidelines:

*   Fork the repository.
*   Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
*   Make your changes and ensure they adhere to the project's coding style.
*   Write clear and concise commit messages.
*   Push your branch and open a pull request.

## Author Info
**Matilda Njau**

*   LinkedIn: [https://linkedin.com/in/matildanjau](https://linkedin.com/in/matildanjau)
*   Twitter: [@matildanjau](https://twitter.com/matildanjau)

---
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)