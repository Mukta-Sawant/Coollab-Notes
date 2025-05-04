# CollabNote

CollabNote is a real-time collaborative note-taking application that allows users to create, edit, and share notes simultaneously with others. Built with React and Yjs, it provides a seamless collaborative experience where multiple users can see each other's changes instantly.

## Features

- **Real-time Collaboration**: Multiple users can edit the same note simultaneously
- **Automatic Synchronization**: Changes sync automatically across all connected devices
- **Offline Support**: Continue working without an internet connection with local storage backup
- **User Authentication**: Simple username-based login system
- **Note Organization**: Create and manage multiple notes from a central dashboard
- **Persistent Storage**: Notes are saved both locally and on the server for reliability
- **Connection Status**: Visual indicators show when you're online or offline


## Technologies Used

- **Frontend**:
  - React 19.0.0
  - React Router DOM 6.30.0
  - Yjs (for real-time collaboration)
  - Y-WebSocket (for real-time sync)
  - Y-IndexedDB (for offline persistence)
  - Vite 6.3.1 (for development and build)

- **Backend**:
  - Node.js
  - WebSocket server for Yjs synchronization

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

### Installation

1. Clone the repository:
   ```
   git clone "github link"
   cd collab-notes-app
   ```

2. Install client dependencies:
   ```
   cd client
   npm install
   ```

3. Install server dependencies:
   ```
   cd ../server
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

```
cd client
npm run build
```

The built files will be in the `client/dist` directory.

## How to Use

1. **Login**: Enter a username to access the application
2. **Dashboard**: View all your notes and create new ones
3. **Note Editor**: Click on a note to open the editor
4. **Real-time Editing**: Any changes you make are automatically synced with other users
5. **Saving**: Although changes sync automatically, you can manually save to ensure local storage backup


## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Yjs](https://github.com/yjs/yjs) - A CRDT framework for real-time collaboration
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling