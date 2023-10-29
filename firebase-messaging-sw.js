self.addEventListener("install", function (e) {
  console.log("fcm sw install..");
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  console.log("fcm sw activate..");
});

self.addEventListener("push", function (e) {
  const permission = Notification.requestPermission();
  if (permission === "denied") {
    console.log("Alarm Denied");
    return;
  }
  console.log("Alarm Granted");
  console.log("push: ", e.data.json());
  messaging.setBackgroundMessageHandler(function(payload) {
    const notificationTitle = 'New Message 💘';
    const notificationOptions = {
      body: payload.data.message,
    };
  
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
});

self.addEventListener("notificationclick", function (event) {
  console.log("notification click");
  const url = "/";
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCucNljgWlnQc7uWT-UdGvinCo28jRwIuw",
  authDomain: "jhj-chats.firebaseapp.com",
  projectId: "jhj-chats",
  storageBucket: "jhj-chats.appspot.com",
  messagingSenderId: "968225357706",
  appId: "1:968225357706:web:b3dece82d8a2115a99d273",
  measurementId: "G-Q7PE4SZQ00"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
