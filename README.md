# TWOEM Online Productions - Student Management System

A comprehensive web-based student management system built with FastAPI, React, and MongoDB.

## Features

### For Administrators:
- **Student Management**: Create, view, update, and delete student profiles
- **Academic Records**: Track student performance across multiple subjects
- **Finance Management**: Monitor fee payments and outstanding balances
- **Certificate Management**: Upload and manage student certificates
- **Notifications**: Send notifications and announcements to students with attachments
- **Resources Management**: Upload categorized PDF study materials by subject
- **WiFi Management**: Configure and share WiFi credentials with connection guides
- **Downloads Management**: Manage public and private downloadable files
- **Password Reset Management**: Approve/reject student password reset requests

### For Students:
- **Profile Management**: View and update personal information
- **Academic Progress**: View grades and performance metrics
- **Finance Tracking**: Check fee status and payment history
- **Certificate Downloads**: Download certificates when eligible (60%+ average, fees cleared)
- **Notifications**: Receive important announcements with attachments
- **Study Resources**: Access categorized PDF notes and materials by subject
- **WiFi Access**: View network credentials and connection instructions
- **File Downloads**: Access public files and view private files (admin-only access)

### Technical Features:
- **JWT Authentication**: Secure role-based access (admin/student)
- **File Management**: Base64 encoding for secure file storage
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Dynamic content updates
- **MongoDB Integration**: Scalable NoSQL database
- **RESTful APIs**: Well-documented API endpoints

## Technology Stack

### Backend:
- **FastAPI**: Modern, fast web framework for Python
- **MongoDB**: NoSQL database with Motor async driver
- **JWT**: Secure token-based authentication
- **bcrypt**: Password hashing
- **Python 3.11**: Latest Python features

### Frontend:
- **React 19**: Latest React with hooks and context
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB
- Yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twoem-website
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn server:app --reload --port 8001
   
   # Terminal 2 - Frontend
   cd frontend
   yarn start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

## Default Admin Account

- **Username**: admin
- **Password**: Twoemweb@2020

*Change the default password after first login for security.*

## Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=twoem_database
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Deployment

### Render.com Deployment

This project is configured for easy deployment on Render.com:

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Render**: Import your GitHub repository to Render
3. **Environment Variables**: Configure the required environment variables in Render dashboard
4. **Auto-deploy**: The `render.yaml` file will automatically configure your services

### Docker Deployment

```bash
# Build the image
docker build -t twoem-website .

# Run the container
docker run -p 8000:8000 -e MONGO_URL="your-mongo-url" twoem-website
```

## API Documentation

Once the backend is running, visit `/docs` for interactive API documentation:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Project Structure

```
twoem-website/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js        # Main App component
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── images/               # Application images
├── render.yaml          # Render deployment config
├── Dockerfile          # Docker configuration
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the TWOEM Online Productions team.

---

Built with ❤️ by TWOEM Online Productions