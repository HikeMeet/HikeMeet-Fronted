import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDEaZ1g62ZbD-m4c5tPOpUpyuWV-cn1QF4', //updated
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'hikemeet-a918c', //updated
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

export default app;
