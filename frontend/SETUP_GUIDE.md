# Frontend Setup & Getting Started

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:3000`

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Enterprise Chat
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5173`

## 🗂️ File Structure Explanation

### `/src/types`
TypeScript interfaces and types for the entire application

### `/src/config`
Configuration constants, API endpoints, storage keys

### `/src/services`
- `api.ts` - API client with interceptors and endpoints
- `socket.ts` - WebSocket service for real-time features

### `/src/hooks`
Custom React hooks for:
- Authentication (`useAuth`)
- Channel operations (`useChannels`, `useCreateChannel`, etc.)
- Message operations (`useMessages`, `useSendMessage`, etc.)

### `/src/contexts`
React Context providers:
- `ThemeContext` - Dark mode management

### `/src/components`
Organized by feature:

#### `/common`
Reusable UI components:
- `Button` - Customizable button
- `Input` - Form input field
- `Card` - Container card
- `LoadingSpinner` - Loading indicator
- `EmptyState` - Empty state display
- `SearchInput` - Search field
- `ErrorAlert` - Error message

#### `/layout`
Layout structure:
- `MainLayout` - Main app wrapper
- `Sidebar` - Navigation sidebar
- `Header` - Top navigation

#### `/auth`
Authentication components:
- `LoginForm` - Login page form
- `RegisterForm` - Registration form
- `ProtectedRoute` - Route protection

#### `/channels`
Channel management:
- `ChannelItem` - Channel card
- `ChannelHeader` - Channel title/info
- `CreateChannelModal` - Create channel modal

#### `/messages`
Message components:
- `MessageItem` - Single message bubble
- `MessageList` - Message thread
- `MessageInput` - Message input form
- `OnlineUsers` - Online users sidebar

### `/pages`
Full page components:
- `LoginPage` - Login page
- `RegisterPage` - Registration page
- `ChatPage` - Channel list/browse
- `ChannelPage` - Chat interface
- `SettingsPage` - User settings

### `/styles`
Global CSS:
- `globals.css` - Tailwind + custom styles

### `/utils`
Utility functions:
- `toast.ts` - Toast notifications
- `helpers.ts` - Helper functions

## 🔄 Data Flow

### Authentication Flow
```
LoginForm → useAuth() → api.auth.login() → localStorage → socketService.connect()
```

### Message Flow
```
MessageInput → useSendMessage() → api.messages.create() → socketService emits
↓
socketService receives → queryClient invalidates → MessageList updates
```

### Channel Join Flow
```
ChannelItem → useJoinChannel() → api.channels.join() → socketService.joinChannel()
↓
Server broadcasts → socketService receives → UI updates
```

## 🎯 Key Features Implementation

### Real-time Messaging
- Socket.io event listeners in `ChannelPage`
- Message list automatically refreshes on new events
- Typing indicators through socket events

### Online Users
- `OnlineUsers` component fetches user list
- Socket events update user presence
- Green indicator shows online status

### Channel Management
- Browse all channels in `ChatPage`
- Join/leave channels with one click
- Create new channels with modal form

### Theme Support
- Dark mode toggle in `Header`
- Stored in localStorage via `ThemeContext`
- Applied to entire app via Tailwind's dark mode

## 🐛 Debugging Tips

### Check API Calls
- Open Network tab in DevTools
- Look for requests to `/api/`
- Check response status and data

### Socket Connection
- Check console for socket connection messages
- Verify token is being sent: `socketService.isConnected()`

### React Query
- DevTools visible in bottom right (dev mode)
- See all queries, mutations, and cache

### Component State
- Use React DevTools browser extension
- Inspect component props and hooks

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Size analysis
npm run build -- --report
```

## 📱 Responsive Design

The app uses Tailwind's responsive classes:

- **Mobile First** - Styles apply to all screens by default
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

Key responsive components:
- Sidebar hides on mobile, toggleable
- Message layout adapts
- Channel grid: 1 → 2 → 3 columns

## 🎨 Styling Guidelines

### Colors
- Primary: `primary-500` to `primary-900`
- Gray: `gray-50` to `gray-900`
- Success: `green-*`
- Error: `red-*`

### Spacing
- Use Tailwind spacing scale: `px-4`, `py-2`, etc.
- Gaps between items: `gap-4`

### Dark Mode
- Add `dark:` prefix for dark styles
- Example: `bg-white dark:bg-gray-800`

## ⚙️ Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| VITE_API_BASE_URL | Backend API URL | http://localhost:3000/api |
| VITE_SOCKET_URL | WebSocket URL | http://localhost:3000 |
| VITE_APP_NAME | App name | Enterprise Chat |
| VITE_APP_VERSION | Version | 1.0.0 |

## 🔐 Security Considerations

1. **Token Storage** - JWT stored in localStorage (consider switching to httpOnly cookies)
2. **CORS** - Configure backend to allow frontend origin
3. **XSS Prevention** - React automatically escapes content
4. **Input Validation** - Formik + Yup validation on client
5. **HTTPS** - Use HTTPS in production

## 📞 Common Issues

### "Cannot find module '@/components'"
- Run: `npm install`
- Check `tsconfig.json` path aliases

### "API calls failing"
- Verify backend is running on `http://localhost:3000`
- Check `.env` configuration
- Look at Network tab in DevTools

### "Socket connection failing"
- Ensure backend has Socket.io enabled
- Check VITE_SOCKET_URL matches backend
- Look at console for connection errors

### "Dark mode not working"
- Clear cache: `CTRL+Shift+Delete`
- Check localStorage for theme value
- Verify Tailwind `darkMode: 'class'` in config

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [React Query](https://tanstack.com/query/latest)

## 🚢 Deployment Checklist

- [ ] Environment variables set
- [ ] API base URL updated
- [ ] Backend running and accessible
- [ ] Build completes without errors: `npm run build`
- [ ] No console errors or warnings
- [ ] Test on mobile devices
- [ ] Verify dark mode works
- [ ] Check offline handling (if PWA)

---

**Happy coding! 🎉**
