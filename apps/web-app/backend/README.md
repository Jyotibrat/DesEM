# ContentFlow CMS - Backend API

Node.js/Express backend for ContentFlow CMS with MongoDB database.

## 🚀 Features

- **RESTful API** - Clean, organized API endpoints
- **Supabase Authentication** - Secure JWT-based auth with Supabase
- **Authorization** - Role-based access control (Admin, Editor, Author, Viewer)
- **Content Management** - Full CRUD operations for content
- **Media Upload** - File upload with Multer
- **MongoDB** - NoSQL database with Mongoose ODM
- **Validation** - Request validation with express-validator
- **Error Handling** - Centralized error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Create `.env` file**:
```bash
cp .env.example .env
```

3. **Configure environment variables** in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/contentflow
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

4. **Start MongoDB** (if running locally):
```bash
mongod
```

5. **Run the server**:
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000/api`

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `PUT /update-profile` - Update profile (Protected)
- `PUT /change-password` - Change password (Protected)

### Content (`/api/content`)
- `GET /` - Get all content (Public for published, Protected for all)
- `GET /:id` - Get single content
- `POST /` - Create content (Protected - Author+)
- `PUT /:id` - Update content (Protected - Owner/Editor/Admin)
- `DELETE /:id` - Delete content (Protected - Owner/Admin)
- `GET /stats/dashboard` - Get content statistics (Protected)

### Media (`/api/media`)
- `POST /upload` - Upload single file (Protected)
- `POST /upload-multiple` - Upload multiple files (Protected)
- `GET /` - Get all media (Protected)
- `GET /:id` - Get single media (Protected)
- `PUT /:id` - Update media metadata (Protected)
- `DELETE /:id` - Delete media (Protected)

### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get single user (Admin only)
- `PUT /:id` - Update user (Admin only)
- `DELETE /:id` - Delete user (Admin only)

## 🔐 User Roles

- **Admin** - Full access to everything
- **Editor** - Can manage all content and media
- **Author** - Can create and manage own content
- **Viewer** - Read-only access

## 📝 Example Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Content
```bash
POST /api/content
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content...",
  "excerpt": "A brief summary",
  "category": "blog",
  "tags": ["javascript", "nodejs"],
  "status": "published"
}
```

### Upload Media
```bash
POST /api/media/upload
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data

file: <your-file>
alt: "Image description"
caption: "Image caption"
```

## 🗂️ Project Structure

```
backend/
├── models/          # Mongoose models
│   ├── User.js
│   ├── Content.js
│   └── Media.js
├── routes/          # API routes
│   ├── auth.js
│   ├── content.js
│   ├── media.js
│   └── users.js
├── middleware/      # Custom middleware
│   └── auth.js
├── uploads/         # Uploaded files
├── .env.example     # Environment variables template
├── .gitignore
├── package.json
├── server.js        # Main server file
└── README.md
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-restart)
npm run dev

# Run in production mode
npm start
```

## 🧪 Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **multer** - File upload
- **express-validator** - Request validation

## 🚀 Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Set a strong `JWT_SECRET`
4. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

## 📄 License

MIT
