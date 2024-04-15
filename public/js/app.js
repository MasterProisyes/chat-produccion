import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  getDocs,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBSbvwJer4wX_PnoCWNLZcsx4eVOwqxssI",
  authDomain: "elnombredealfredo.firebaseapp.com",
  projectId: "elnombredealfredo",
  storageBucket: "elnombredealfredo.appspot.com",
  messagingSenderId: "834831575513",
  appId: "1:834831575513:web:befda854a3fd7f415691c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth(app);

// Google Sign-In function
function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(user);
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error(errorMessage);
    });
}

// Obtener referencia al formulario y al contenedor de imágenes
const form = document.getElementById("image-form");
const messageInput = document.getElementById("message-input");
const chatContainer = document.getElementById("chatcontainer");
const deleteButton = document.getElementById("delete-button");
const saveTextButton = document.getElementById("save-text-button");
const recordButton = document.getElementById("record-button");
const stopButton = document.getElementById("stop-button");
const fileInput = document.getElementById("file-input");

// Subir imagen a Firestore en base64 y guardar la URL en Firestore
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (event) {
    const base64String = event.target.result.split(",")[1];

    await addDoc(collection(db, "messages"), {
      imageUrl: base64String,
      message: messageInput.value,
      timestamp: new Date(),
    });

    messageInput.value = "";
  };

  reader.readAsDataURL(file);
});

// Resto del código...


// Función para borrar todos los documentos
deleteButton.addEventListener("click", async function () {
  const querySnapshot = await getDocs(collection(db, "messages"));
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  });

  chatContainer.innerHTML = "";
});

// Guardar texto en Firestore
saveTextButton.addEventListener("click", async function () {
  const message = messageInput.value;

  if (message.trim() !== "") {
    await addDoc(collection(db, "messages"), {
      message: message,
      timestamp: new Date(),
    });

    messageInput.value = "";
  }
});

let mediaRecorder;
let audioChunks = [];

recordButton.addEventListener("click", async () => {
  audioChunks = [];
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const storageRef = ref(
      storage,
      "audios/" + new Date().toISOString() + ".wav"
    );
    await uploadBytes(storageRef, audioBlob);
    const audioUrl = await getDownloadURL(storageRef);
    saveAudioUrlToFirestore(audioUrl);
  };
  mediaRecorder.start();
});

stopButton.addEventListener("click", () => {
  mediaRecorder.stop();
});

async function saveAudioUrlToFirestore(audioUrl) {
  await addDoc(collection(db, "messages"), {
    audioUrl: audioUrl,
    message: "Audio message",
    timestamp: new Date(),
  });
}

// Actualizar la lista de mensajes en la interfaz cuando haya un cambio en Firestore
// Actualizar la lista de mensajes en la interfaz cuando haya un cambio en Firestore
onSnapshot(
  query(collection(db, "messages"), orderBy("timestamp", "asc")),
  (querySnapshot) => {
    chatContainer.innerHTML = ""; // Limpiar el contenedor de mensajes

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Crear un elemento para mostrar la marca de tiempo
      const timestampElement = document.createElement("div");
      timestampElement.textContent = new Date(
        data.timestamp.toMillis()
      ).toLocaleString();
      // Crear un elemento para el mensaje
      const messageElement = document.createElement("div");

      // Mostrar el mensaje en función de su tipo
      if (data.imageUrl) {
        // Si es una imagen, crear un elemento de imagen
        const imageMessage = document.createElement("div");
        imageMessage.innerHTML = `
          <img src="${data.imageUrl}" class="chat-image" />
          <div class="chat-text">${data.message}</div>
        `;
        messageElement.appendChild(imageMessage);
      } else if (data.audioUrl) {
        // Si es un audio, crear un reproductor de audio
        const audioMessage = document.createElement("div");
        audioMessage.innerHTML = `
          <audio controls>
            <source src="${data.audioUrl}" type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          <div class="chat-text">${data.message}</div>
        `;
        messageElement.appendChild(audioMessage);
      } else {
        // Si es un mensaje de texto, mostrar el texto
        const textMessage = document.createElement("div");
        textMessage.textContent = data.message;
        messageElement.appendChild(textMessage);
      }

      // Agregar la marca de tiempo al elemento del mensaje
      messageElement.appendChild(timestampElement);

      // Agregar el mensaje al contenedor de mensajes
      chatContainer.appendChild(messageElement);
    });
  }
);

// Subir imagen al storage y guardar la URL en Firestore
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  form.querySelector('button[type="submit"]').disabled = true; // Deshabilitar el botón para evitar múltiples envíos


  const file = fileInput.files[0];
  const storageRef = ref(storage, "images/" + file.name);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  const message = messageInput.value;
})
