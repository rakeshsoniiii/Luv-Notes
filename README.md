# 💝 Luv Notes

A modern, feature-rich note-taking web application built with React and Firebase, featuring beautiful themes, AI-powered tools, and comprehensive note management capabilities.

**[Live Demo](https://your-demo-link.com) • [Report a Bug](https://www.google.com/search?q=https://github.com/your-repo/issues/new) • [Request a Feature](https://www.google.com/search?q=https://github.com/your-repo/issues/new)**

\<br/\>

\<p align="center"\>
\<img src="https://www.google.com/search?q=https://via.placeholder.com/800x450.png%3Ftext%3DLuv%2BNotes%2BApp%2BDemo" alt="Luv Notes Demo GIF" /\>
\</p\>

## ✨ Table of Contents

  - [Features](https://www.google.com/search?q=%23-features)
  - [🛠️ Tech Stack](https://www.google.com/search?q=%23%EF%B8%8F-tech-stack)
  - [🚀 Getting Started](https://www.google.com/search?q=%23-getting-started)
  - [🏗️ Project Structure](https://www.google.com/search?q=%23%EF%B8%8F-project-structure)
  - [🎨 Theming System](https://www.google.com/search?q=%23-theming-system)
  - [🌐 Deployment](https://www.google.com/search?q=%23-deployment)
  - [🔒 Security Configuration](https://www.google.com/search?q=%23-security-configuration)
  - [🤝 Contributing](https://www.google.com/search?q=%23-contributing)
  - [📄 License](https://www.google.com/search?q=%23-license)
  - [🙏 Acknowledgments](https://www.google.com/search?q=%23-acknowledgments)

## 🌟 Features

### 🎨 **Beautiful UI & Theming**

  - **Light/Dark Mode**: Toggle between light and dark themes for your comfort.
  - **Custom Love Themes**: Personalize your workspace with custom accent colors.
  - **Responsive Design**: A flawless experience on desktop, tablet, and mobile.
  - **Smooth Animations**: Elegant transitions and hover effects for a delightful UX.

### 📝 **Note Management**

  - **Rich Text Editor**: A full-featured editor with comprehensive formatting options.
  - **Color-Coded Notes**: Organize your notes visually with beautiful colors.
  - **Archive & Hide**: Keep your workspace clean with archive and hide features.
  - **Search & Filter**: Find any note in seconds with powerful search capabilities.

### 🚀 **Advanced Features**

  - **Export to PDF/Word**: Save and share your notes in multiple formats.
  - **Automatic Backups**: Never lose your work with the automatic backup system.
  - **Version History**: Track changes and restore previous versions of your notes.
  - **AI-Powered Tools**: Enhance your writing and creativity with AI assistance.

### 🔐 **Security & Privacy**

  - **User Authentication**: Secure login and registration powered by Firebase Auth.
  - **Hidden Notes**: Protect sensitive information with password-protected notes.
  - **Data Encryption**: Your data is stored safely and securely.

## 🛠️ Tech Stack

This project leverages a modern, robust, and scalable tech stack.

| Category                | Technology                                                                                                  | Why We Chose It                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Frontend Framework** | [React 18](https://reactjs.org/)                                                                            | Component-based architecture, great performance with Virtual DOM, and a massive ecosystem.                   |
| **UI & Styling** | [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) (with CSS Variables)                               | Native, performant, and perfect for dynamic theming without extra libraries.                                 |
| **Icons** | [Lucide React](https://lucide.dev/)                                                                         | Lightweight, tree-shakable, and beautifully consistent SVG icons.                                            |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/)                                                             | Elegant, lightweight, and highly customizable toast notifications.                                           |
| **Routing** | [React Router DOM](https://reactrouter.com/)                                                                | The industry standard for client-side routing in React applications.                                         |
| **Backend & Database** | [Firebase](https://firebase.google.com/) (Auth, Firestore)                                                  | Excellent free tier, real-time data sync, secure authentication, and seamless React integration.             |
| **File Export** | [jsPDF](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/), [docx](https://docx.js.org/), [file-saver](https://www.google.com/search?q=https://github.com/eligrey/FileSaver.js) | Pure client-side generation of PDF & Word documents, requiring no server-side processing.                  |
| **Data Persistence** | [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)                        | Instant, client-side storage perfect for backups, version history, and offline features.                   |

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

  - Node.js (v16 or higher)
  - NPM or Yarn
  - Git
  - A free [Firebase](https://firebase.google.com/) account

### Installation Guide

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-username/luv-notes.git
    cd luv-notes
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Set Up Firebase & Environment Variables**

    \<details\>
    \<summary\>Click for step-by-step Firebase configuration\</summary\>

    1.  **Create a Firebase Project**

          - Go to the [Firebase Console](https://console.firebase.google.com/) and click "Create a project".
          - Give your project a name (e.g., "luv-notes") and follow the setup steps.

    2.  **Enable Authentication**

          - In your project dashboard, go to `Authentication` -\> `Sign-in method`.
          - Enable the `Email/Password` provider.

    3.  **Create a Firestore Database**

          - Go to `Firestore Database` -\> `Create database`.
          - Start in **test mode** for development purposes. This allows open read/write access.
          - Choose a location for your database.

    4.  **Get Firebase Config**

          - Go to `Project settings` (gear icon) -\> `General`.
          - Scroll down to "Your apps" and click the web icon (`</>`).
          - Register your app and copy the `firebaseConfig` object.

    5.  **Configure Environment Variables**

          - Create a file named `.env` in the root of your project.
          - Add your Firebase credentials to it:

        <!-- end list -->

        ```env
        REACT_APP_FIREBASE_API_KEY=your_api_key
        REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        REACT_APP_FIREBASE_PROJECT_ID=your_project_id
        REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        REACT_APP_FIREBASE_APP_ID=your_app_id
        ```

    \</details\>

4.  **Start the Development Server**

    ```bash
    npm start
    ```

    The application will be available at `http://localhost:3000`.

5.  **Build for Production**

    ```bash
    npm run build
    ```

    This creates an optimized production-ready build in the `build` folder.

## 🏗️ Project Structure

The project follows a standard component-based architecture to keep the code organized and maintainable.

```
src/
├── components/   # Reusable React components
│   ├── AI/
│   ├── Layout/   # Header, Footer, etc.
│   ├── Notes/    # Note-related components
│   └── UI/       # Buttons, Modals, etc.
├── contexts/     # React Context for global state
├── services/     # Business logic (Firebase, Export)
├── styles/       # Global CSS and themes
└── App.js        # Main application component
```

## 🎨 Theming System

The app uses CSS Custom Properties (Variables) for a powerful and dynamic theming system. This allows for instant theme switching between light, dark, and user-defined custom themes without a page reload.

```css
:root {
  --primary-color: #ff6b9d;
  --accent-color: #ffc1cc;
  --background-color: #ffffff;
  --text-color: #333333;
}
```

## 🌐 Deployment

This application is ready for deployment on any static hosting service.

| Service         | Why Choose It                                         | Quick Start                                                                    |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Vercel** | **(Recommended)** Best-in-class support for React apps. | `npm i -g vercel && vercel`                                                    |
| **Netlify** | Excellent build tools and a generous free tier.       | Connect your Git repo and set build command to `npm run build`.                |
| **GitHub Pages**| Free, simple, and integrated directly with your repo. | Use the `gh-pages` package. See [docs](https://www.google.com/search?q=https://create-react-app.dev/docs/deployment/%23github-pages). |
| **Firebase Hosting** | Seamless integration with your Firebase backend.  | `firebase init hosting && firebase deploy`                                   |

### Continuous Integration (CI/CD)

A sample GitHub Actions workflow to deploy to Vercel on every push to `main`:

\<details\>
\<summary\>View example `vercel-deploy.yml`\</summary\>

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

\</details\>

## 🔒 Security Configuration

### Firestore Rules

To secure your database in production, use these Firestore rules. They ensure that users can only read and write their own notes.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users to access their own notes
    match /users/{userId}/notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome\! If you have a suggestion or find a bug, please open an issue.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🙏 Acknowledgments

  - React Team
  - Firebase Team
  - All the open-source libraries that made this project possible.

-----

\<p align="center"\>
Made with ❤️ for note-taking enthusiasts everywhere\!
\</p\>
