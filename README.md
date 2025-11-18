# TaskFlow Kanban

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A modern, modular Kanban board web application powered by Firebase. Allows users to create accounts, manage projects, and track tasks across "To Do", "In Progress", and "Done" columns. Ideal for collaborative project management.

##  Features

### Authentication
- User registration and login (Firebase Auth).
- Password reset.

### Project Management
- Create projects with name, description, and secret access code.
- Access projects by providing the access code.

### Kanban Board
- Dedicated Kanban board for each project.
- Full CRUD for tasks (Create, Read, Update, Delete).
- Assign tasks to users.
- Drag and drop to change task status.

### Analytics Dashboard
- Project statistics on average completion time.
- Workload visualization per person (assigned tasks).

### Profile Management
- Update username.
- Upload profile picture (Firebase Storage).

### Real-time Updates
- Uses Firestore for instant reflection of all changes.

##  Technologies Used

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript (modular)
- **Backend**: Node.js, Express
- **Database**: Firebase (Firestore, Auth, Storage)
- **Tools**: Vite for Tailwind CSS

##  Project Structure

```
TaskFlow-Kanban/
├── .gitignore
├── README.md
├── index.html          # Main HTML structure
├── package.json        # Node.js server dependencies
├── server.js           # Node.js/Express server to serve files
└── src/
    ├── css/
    │   └── style.css   # Custom CSS styles
    └── js/
        ├── config.js         # Tailwind CSS configuration
        ├── main.js           # Entry point, "conductor"
        ├── utils.js          # Utility functions: toasts, avatars, etc.
        ├── core/
        │   ├── dom.js        # DOM selectors
        │   ├── firebase.js   # Firebase initialization
        │   └── state.js      # Global state management
        └── modules/
            ├── auth.js       # Authentication logic
            ├── dashboard.js  # Dashboard logic
            ├── kanban.js     # Kanban board logic
            ├── profile.js    # Profile modal logic
            └── projects.js   # Projects page logic
```

##  Installation and Launch

### Prerequisites
- Node.js (version 18 or higher) installed on your machine.

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ZouhairChoufa/kanban-project-manager-Mini_jira.git
   cd kanban-project-manager-Mini_jira
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open the application**:
   Open your browser and go to [http://localhost:3000](http://localhost:3000).

##  Usage

- Create an account or log in.
- Create a new project with an access code.
- Add tasks to the Kanban board.
- Assign tasks and drag them between columns.
- View statistics on the dashboard.

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

##  License

This project is licensed under ISC. See the [LICENSE](LICENSE) file for more details.

##  Contact

For any questions or suggestions, open an issue on GitHub or contact the author Me (zouhair.choufa3@gmail.com).
