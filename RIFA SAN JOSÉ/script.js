import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ AQUÍ DEBE ESTAR TU CONFIGURACIÓN REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL", // <--- Asegúrate de que sea la tuya
  authDomain: "rifa-san-jose-cip-3794a.firebaseapp.com",
  projectId: "rifa-san-jose-cip-3794a",
  storageBucket: "rifa-san-jose-cip-3794a.appspot.com",
  messagingSenderId: "911602166928",
  appId: "TU_APP_ID_REAL",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const gridContainer = document.getElementById("grid-numeros");
const modal = document.getElementById("modal");
const numSeleccionadoSpan = document.getElementById("numero-seleccionado");
const inputNombre = document.getElementById("nombre");
const inputCelular = document.getElementById("celular");
let numeroActual = null;

function crearGrid() {
  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, "0");
    const div = document.createElement("div");
    div.classList.add("numero");
    div.id = `num-${numStr}`;
    div.textContent = numStr;
    div.addEventListener("click", () => abrirModal(numStr));
    gridContainer.appendChild(div);
  }
}

function escucharRifa() {
  const q = query(collection(db, "rifa"));

  onSnapshot(q, (snapshot) => {
    document.querySelectorAll(".numero").forEach((el) => {
      el.classList.remove("ocupado");
      el.title = "Disponible";
    });

    snapshot.forEach((doc) => {
      const data = doc.data();
      const numStr = doc.id;
      const elemento = document.getElementById(`num-${numStr}`);
      if (elemento) {
        elemento.classList.add("ocupado");
        elemento.title = `Ocupado por: ${data.nombre}`;
      }
    });
  });
}

function abrirModal(numero) {
  const elemento = document.getElementById(`num-${numero}`);
  if (elemento.classList.contains("ocupado")) {
    alert("Este número ya está ocupado. Por favor elige otro.");
    return;
  }
  numeroActual = numero;
  numSeleccionadoSpan.textContent = numero;
  inputNombre.value = "";
  inputCelular.value = "";
  modal.classList.remove("oculto");
}

function cerrarModal() {
  modal.classList.add("oculto");
  numeroActual = null;
}

async function confirmarApartado() {
  const nombre = inputNombre.value.trim();
  const celular = inputCelular.value.trim();

  if (!nombre || !celular) {
    alert("Por favor llena todos los campos.");
    return;
  }

  try {
    const docRef = doc(db, "rifa", numeroActual);
    const docSnap = await getDocs(
      query(collection(db, "rifa"), where("__name__", "==", numeroActual)),
    );

    if (!docSnap.empty) {
      alert("¡Lo sentimos! Alguien acaba de apartar este número. Elige otro.");
      cerrarModal();
      return;
    }

    await setDoc(docRef, {
      nombre: nombre,
      celular: celular,
      fecha: new Date().toISOString(),
    });

    alert(
      `¡Listo! Has apartado el número ${numeroActual}. Recuerda pagar por Nequi para confirmar.`,
    );
    cerrarModal();
  } catch (error) {
    console.error("Error al guardar: ", error);
    alert("Hubo un error al guardar. Revisa tu conexión a internet.");
  }
}

document
  .getElementById("btn-confirmar")
  .addEventListener("click", confirmarApartado);
document.getElementById("btn-cancelar").addEventListener("click", cerrarModal);

crearGrid();
escucharRifa();
