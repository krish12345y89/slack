# Enterprise Chat Frontend

A production-ready React frontend for real-time chat applications built with TypeScript, Tailwind CSS, and Socket.io.

## 🚀 Features

- **Real-time Messaging** - Instant message delivery with Socket.io
- **Channel Management** - Create, join, and leave channels
- **User Presence** - See who's online in real-time
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Mode** - Built-in dark theme support
- **Type Safety** - Full TypeScript support
- **Performance Optimized** - React Query for efficient data fetching
- **Enterprise Ready** - Production-grade error handling and logging

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🛠️ Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable components
│   │   ├── layout/         # Layout components
│   │   ├── auth/           # Auth components
│   │   ├── channels/       # Channel components
│   │   └── messages/       # Message components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── services/           # API & Socket services
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   ├── config/             # Configuration
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Configuration

Edit `.env` to configure:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Enterprise Chat
VITE_APP_VERSION=1.0.0
```

## 🎨 Components

### Common Components
- **Button** - Customizable button with variants
- **Input** - Form input with validation
- **Card** - Card container component
- **LoadingSpinner** - Loading indicator
- **EmptyState** - Empty state display
- **SearchInput** - Search field component
- **ErrorAlert** - Error display component

### Layout Components
- **MainLayout** - Main application layout
- **Sidebar** - Navigation sidebar
- **Header** - Top navigation header

### Auth Components
- **LoginForm** - User login form
- **RegisterForm** - User registration form
- **ProtectedRoute** - Route protection wrapper

### Channel Components
- **ChannelItem** - Channel list item
- **ChannelHeader** - Channel header display
- **CreateChannelModal** - Create channel modal

### Message Components
- **MessageItem** - Single message display
- **MessageList** - Messages list with grouping
- **MessageInput** - Message input field
- **OnlineUsers** - Online users display

## 🔌 Services

### API Service (`src/services/api.ts`)
Handles all HTTP requests to the backend with:
- Request/response interceptors
- Automatic token management
- Error handling
- TypeScript support

### Socket Service (`src/services/socket.ts`)
Manages WebSocket connections for:
- Real-time messaging
- User presence tracking
- Channel events
- Connection management

## 🎣 Custom Hooks

- `useAuth()` - Authentication state and methods
- `useChannels()` - Channel list and operations
- `useMessages()` - Message fetching and operations
- `useCreateChannel()` - Create new channel
- `useJoinChannel()` - Join a channel
- `useLeaveChannel()` - Leave a channel
- `useSendMessage()` - Send message
- `useUpdateMessage()` - Edit message
- `useDeleteMessage()` - Delete message

## 🎯 Usage Examples

### Authenticate User
```typescript
const { login, register, logout, user } = useAuth();

await login.mutate({ email: 'user@example.com', password: 'password' });
```

### Get Channels
```typescript
const { data: channels, isLoading } = useChannels();
```

### Send Message
```typescript
const sendMessage = useSendMessage();
sendMessage.mutate({ channelId: 'ch-123', content: 'Hello!' });
```

## 🌙 Theme Support

The app supports light and dark modes with automatic detection:

```typescript
const { theme, toggleTheme } = useTheme();
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📚 Dependencies

- **react** - UI library
- **react-router-dom** - Routing
- **@tanstack/react-query** - Server state management
- **axios** - HTTP client
- **socket.io-client** - WebSocket client
- **formik + yup** - Form validation
- **tailwindcss** - CSS framework
- **react-hot-toast** - Toast notifications
- **lucide-react** - Icon library

## 🐛 Debugging

### Enable React Query DevTools
DevTools are automatically enabled in development mode at the bottom right of the screen.

### Environment Variable for Debug
```env
VITE_DEBUG=true
```

## 📋 Best Practices

1. **Keep components small** - Split into smaller, reusable components
2. **Use TypeScript** - Define proper types for all data
3. **Error handling** - Always handle errors gracefully
4. **Loading states** - Show loading indicators for async operations
5. **Optimization** - Use React.memo and useMemo for performance
6. **Accessibility** - Include proper ARIA labels and semantic HTML

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ by the Enterprise Chat Team**
