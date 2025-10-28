# Afroverse - AI Photo Transformation & Battle Platform

A full-stack application that allows users to transform their photos using AI-powered African cultural styles and compete in epic battles.

## Features

- **Phone-based Authentication**: WhatsApp OTP verification for seamless signup
- **AI Photo Transformation**: Transform photos with African cultural styles
- **Battle System**: Compete with other users in photo battles
- **Daily Limits**: Free users get 3 transforms per day, Warriors get unlimited
- **Real-time Updates**: WebSocket integration for live battle updates
- **Responsive Design**: Mobile-first design with beautiful UI

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Redis** for caching and rate limiting
- **JWT** for authentication
- **WhatsApp Cloud API** for OTP delivery
- **Winston** for logging

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

## Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB
- Redis
- WhatsApp Business API access

### Backend Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod
   
   # Redis
   redis-server
   ```

4. **Run the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   ```
   http://localhost:3000
   ```

## Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/afroverse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/start` - Start authentication with phone
- `POST /api/auth/verify` - Verify OTP
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Project Structure

```
afroverse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── styles/        # CSS styles
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── package.json
└── shared/               # Shared types and constants
```

## Authentication Flow

1. **Phone Entry**: User enters phone number
2. **OTP Generation**: Server generates 6-digit OTP and stores in Redis
3. **WhatsApp Delivery**: OTP sent via WhatsApp Cloud API
4. **OTP Verification**: User enters OTP, server validates
5. **User Creation**: New user created with auto-generated username
6. **Token Issue**: JWT access + refresh tokens issued
7. **Auto Onboard**: User redirected to transform screen

## Daily Limits Logic

- **Free Users**: 3 transforms per day
- **Warrior Users**: Unlimited transforms
- **Reset Time**: Midnight UTC
- **Tracking**: `transformsUsed` and `dayResetAt` fields in user model

## Security Features

- **Rate Limiting**: 5 auth start requests per hour per IP
- **OTP Protection**: Max 5 attempts per OTP, 5-minute TTL
- **JWT Security**: 15-minute access tokens, 7-day refresh tokens
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Express-validator for request validation

## Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@afroverse.com or join our Discord community.
