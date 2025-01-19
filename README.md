<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    
</head>
<body>    <h1>Frontend Setup and Usage Guide</h1>
    <p>This guide explains how to set up and run the frontend code for your project. It covers cloning the repository, installing dependencies, configuring Firebase, and running the application using Expo, React Native, and Android Studio. The app communicates with the backend Node.js API available at <a href="https://github.com/HikeMeet/HikeMeet-Backend.git">HikeMeet Backend Repository</a>.</p>
    <hr>
    <div class="section">        <h2>Prerequisites</h2>        <p>Ensure you have the following installed on your system:</p>        <ul>            <li>Node.js (v16.x or higher)</li>            <li>npm or yarn</li>            <li>Expo CLI</li>            <li>React Native</li>            <li>Android Studio (for Android development and emulator)</li>            <li>Git</li>        </ul>    </div>
    <hr>
    <div class="section">        <h2>Steps to Set Up the Frontend</h2>
        <h3>1. Clone the Repository</h3>        <pre><code>git clone &lt;repository_url&gt;
cd &lt;repository_name&gt;</code></pre>
        <h3>2. Install Dependencies</h3>        <pre><code>npm install</code></pre>
        <h3>3. Configure Firebase</h3>        <p>Update the <code>.env</code> file with your Firebase configuration:</p>        <pre><code># Firebase Configuration

FIREBASE_API_KEY=&lt;your_firebase_api_key&gt;
FIREBASE_AUTH_DOMAIN=&lt;your_firebase_auth_domain&gt;
FIREBASE_PROJECT_ID=&lt;your_firebase_project_id&gt;
FIREBASE_STORAGE_BUCKET=&lt;your_firebase_storage_bucket&gt;
FIREBASE_MESSAGING_SENDER_ID=&lt;your_firebase_messaging_sender_id&gt;
FIREBASE_APP_ID=&lt;your_firebase_app_id&gt;
FIREBASE_MEASUREMENT_ID=&lt;your_firebase_measurement_id&gt;

# Local Server URL

EXPO_LOCAL_SERVER=http://localhost:5000</code></pre>

        <h3>4. Start Android Studio Emulator</h3>
        <p>If you plan to use an Android emulator for testing:</p>
        <ol>
            <li>Open Android Studio.</li>
            <li>Go to <strong>Tools &gt; AVD Manager</strong>.</li>
            <li>Select or create an emulator (e.g., Pixel 4, API 30).</li>
            <li>Start the emulator.</li>
        </ol>

        <h3>5. Start the Development Server</h3>
        <p>To run the application in development mode:</p>
        <ul>
            <li><strong>Start the Expo server:</strong>
                <pre><code>npm start</code></pre>
            </li>
            <li><strong>Run the app on Android Emulator:</strong>
                <pre><code>Press 'a' in the terminal to launch the app on the emulator.</code></pre>
            </li>
            <li><strong>Run the app on a physical device:</strong>
                <ol>
                    <li>Install the Expo Go app from the Play Store.</li>
                    <li>Scan the QR code generated by the Expo server.</li>
                </ol>
            </li>
        </ul>

        <h3>6. Directory Structure</h3>
        <pre><code>src/

components/ # Reusable UI components
screens/ # App screens
navigation/ # Navigation setup
hooks/ # Custom hooks
contexts/ # Context API setup
services/ # Firebase and other services
styles/ # Tailwind utility classes and global styles</code></pre>

        <h3>7. Tailwind CSS Configuration</h3>
        <p>Tailwind CSS is configured using <code>tailwind.config.js</code>. You can customize the theme and add additional classes if needed. To use Tailwind in components, use the <code>className</code> attribute.</p>

        <h3>8. Firebase Authentication</h3>
        <p>Firebase Authentication is already set up. To add new auth flows (e.g., Google Sign-In):</p>
        <ol>
            <li>Go to the Firebase Console.</li>
            <li>Enable the desired authentication method under <strong>Authentication &gt; Sign-in method</strong>.</li>
            <li>Update the relevant parts of the code in <code>src/services/authService.ts</code>.</li>
        </ol>

        <h3>9. Backend Integration</h3>
        <p>The frontend communicates with the backend API available at <a href="https://github.com/HikeMeet/HikeMeet-Backend.git">HikeMeet Backend Repository</a>. Ensure the backend server is running locally or deployed to a live environment.</p>
        <p>Update the <code>EXPO_LOCAL_SERVER</code> variable in the <code>.env</code> file with the backend server URL.</p>
    </div>

    <hr>

    <div class="section">
        <h2>Troubleshooting</h2>
        <ul>
            <li><strong>Expo Server Issues:</strong>
                <ul>
                    <li>Ensure the Expo CLI is installed globally (<code>npm install -g expo-cli</code>).</li>
                    <li>Restart the development server.</li>
                </ul>
            </li>
            <li><strong>Firebase Errors:</strong>
                <ul>
                    <li>Ensure the Firebase API key and other credentials are correctly set in the <code>.env</code> file.</li>
                    <li>Verify that the Firebase project has the necessary authentication methods enabled.</li>
                </ul>
            </li>
            <li><strong>Android Emulator Issues:</strong>
                <ul>
                    <li>Check that the emulator is running and connected to the Expo server.</li>
                    <li>Restart the emulator if necessary.</li>
                </ul>
            </li>
        </ul>
    </div>

    <hr>

    <p>Happy coding!</p>

</body>
</html>
