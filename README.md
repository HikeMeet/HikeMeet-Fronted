<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HikeMeet Frontend</title>
</head>
<body>

  <h1>HikeMeet Frontend</h1>
  <p>The <strong>HikeMeet</strong> app is designed for hiking enthusiasts, allowing users to connect with others and stay updated on hiking-related events, posts, and profiles.</p>

  <h2>Key Features:</h2>
  <ul>
    <li><strong>User Authentication:</strong> Sign up, login, and email verification for users.</li>
    <li><strong>Personal Profile:</strong> Allows users to create and manage their profiles, including username, bio, and profile picture.</li>
    <li><strong>Settings Management:</strong> Includes options like changing passwords, logging out, and deleting accounts.</li>
    <li><strong>Persistent Login:</strong> Users stay logged in even after closing the app, until they choose to log out manually.</li>
    <li><strong>Password Reset:</strong> Users can request a password reset via email if they forget their password.</li>
    <li><strong>Responsive Design:</strong> Built with React Native and styled using Tailwind CSS.</li>
  </ul>

  <h2>Installation</h2>

  <h3>Prerequisites:</h3>
  <ul>
    <li><strong>Node.js:</strong> Make sure you have Node.js installed. <a href="https://nodejs.org/en/download/">Download Node.js</a></li>
    <li><strong>Expo CLI:</strong> Install Expo CLI for running the app locally. <a href="https://docs.expo.dev/get-started/installation/">Install Expo CLI</a
shell
Copy
></li>
</ul> <h3>Steps to Install:</h3> <pre> 1. Clone the repository: ```bash git clone https://github.com/username/HikeMeet-Frontend.git cd HikeMeet-Frontend ```
Install dependencies:
bash
Copy
npm install
</pre> <h3>Running the App:</h3> <p>To run the app locally, use the following command:</p> <pre> npm start </pre> <p>This will launch Expo and allow you to open the app on your mobile device or web browser using Expo Go.</p> <h2>Environments</h2> <h3>1. Main Environment</h3> <p>This environment is used for development and local testing. Configuration for this environment is stored in the .env file.</p> <h3>2. Production Environment</h3> <p>This environment is used after development for the production-ready build. The .env file contains configuration for the live application.</p> <h3>Example .env File:</h3> <pre> # Firebase Configuration (Local) FIREBASE_API_KEY=your_firebase_api_key FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain FIREBASE_PROJECT_ID=your_firebase_project_id FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id FIREBASE_APP_ID=your_firebase_app_id FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
Local Server URL
EXPO_LOCAL_SERVER=http://localhost:3000 </pre>

<h2>Firebase Configuration</h2> <p>The Firebase setup is done in the firebaseConfig.js file, where we initialize Firebase Authentication and Firestore. This allows the app to handle user sign-in, registration, and data storage.</p> <h3>Example Firebase Initialization:</h3> <pre> import { initializeApp } from "firebase/app"; import { getFirestore } from "firebase/firestore"; import { initializeAuth } from "firebase/auth"; import AsyncStorage from "@react-native-async-storage/async-storage";
const firebaseConfig = { apiKey: process.env.FIREBASE_API_KEY, authDomain: process.env.FIREBASE_AUTH_DOMAIN, projectId: process.env.FIREBASE_PROJECT_ID, storageBucket: process.env.FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID, appId: process.env.FIREBASE_APP_ID, measurementId: process.env.FIREBASE_MEASUREMENT_ID, };

const FIREBASE_APP = initializeApp(firebaseConfig); export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, { persistence: reactNativePersistence(AsyncStorage), });

export const FIREBASE_DB = getFirestore(FIREBASE_APP); </pre>

<h2>App Flow</h2> <ul> <li><strong>Landing Page:</strong> The initial page for new users to sign up and existing users to log in.</li> <li><strong>Login Page:</strong> Users can enter their credentials (email and password) to log in.</li> <li><strong>Profile Page:</strong> Displays the user's profile information such as name, bio, and recent posts.</li> <li><strong>Register Page:</strong> Allows new users to register by filling in their personal details and password.</li> <li><strong>Settings Page:</strong> Users can change their password, log out, or delete their account from the settings.</li> </ul> <h2>Pages Description</h2> <h3>1. Register Page</h3> <p>This page allows users to sign up by entering their personal details, including username, first name, last name, email, password, and birthdate. It also includes validation for the user’s age (must be 18 or older) and password strength.</p> <h3>2. Login Page</h3> <p>Users can log in to the app with their email and password. If the user is logged in and their email is not verified, they will be redirected to the Verify Email Page.</p> <h3>3. Reset Password (Forgot Password) Page</h3> <p>This page allows users to reset their password by sending a verification code to their email. Users must enter their email, and upon verification, they can reset their password.</p> <h3>4. Verify Email Page</h3> <p>Once the user has registered, they need to verify their email. A verification code is sent to the user's email, and once verified, they can access their profile.</p> <h3>5. Profile Page</h3> <p>The profile page shows the user's personal information and posts. It includes options to edit the profile and navigate to settings.</p> <h3>6. Settings Page</h3> <p>From the settings page, users can log out, delete their account, or update their password.</p> <h2>Running the Code Locally</h2> <p>Once the app is installed, run the following command to start the local development environment:</p> <pre> npm start </pre> <h2>Useful Links</h2> <ul> <li><a href="https://reactnative.dev/docs/getting-started">React Native Documentation</a></li> <li><a href="https://docs.expo.dev/">Expo Documentation</a></li> </ul> <h2>Contributing</h2> <p>Feel free to submit pull requests (PRs) for bug fixes, improvements, or new features. Please ensure that the code is well-tested before submitting your PR.</p> </body> </html> ```
Key Points:
This HTML file provides a structured README for your HikeMeet app, explaining the features, installation steps, environment setup, and description of important pages.
It also includes links for relevant documentation, contributing guidelines, and provides detailed explanations for various sections of the app.