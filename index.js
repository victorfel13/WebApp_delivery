const agregarComidaForm = document.getElementById("agregar-comida-form");
const inputNuevaComida = document.getElementById("nueva-comida");
const selectComida = document.getElementById("select-comida");
const formularioPedido = document.getElementById("formulario-pedido");
const tablaPedidos = document.getElementById("tabla-pedidos");
const listaResumen = document.getElementById("lista-resumen");
const totalPrecioElemento = document.getElementById("total-precio");
const btnBorrarTodo = document.getElementById("borrar-todo");
const btnDescargarDatos = document.getElementById("descargar-datos");

// Nuevas variables para filtro y orden
const filtroComida = document.getElementById("filtro-comida");
const btnOrdenarHora = document.getElementById("ordenar-hora");
const btnOrdenarListo = document.getElementById("ordenar-listo");

let resumenCantidades = {};
let comidas = [];
let pedidos = [];

// Función para guardar comidas y pedidos en localStorage
function guardarDatos() {
  localStorage.setItem("comidas", JSON.stringify(comidas));
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// Función para cargar comidas y pedidos desde localStorage
function cargarDatos() {
  const comidasGuardadas = JSON.parse(localStorage.getItem("comidas"));
  const pedidosGuardados = JSON.parse(localStorage.getItem("pedidos"));
  if (Array.isArray(comidasGuardadas)) {
    comidas = comidasGuardadas;
  } else {
    comidas = ["Empanizado", "Plancha"]; // comidas base
  }
  if (Array.isArray(pedidosGuardados)) {
    pedidos = pedidosGuardados;
  } else {
    pedidos = [];
  }
}

// Actualiza las opciones del select comidas y filtro comidas
function actualizarSelectComidas() {
  // Select para agregar pedido
  selectComida.innerHTML =
    '<option value="" disabled selected>Selecciona una comida</option>';
  comidas.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    selectComida.appendChild(option);
  });

  // Select para filtro de comida
  filtroComida.innerHTML = '<option value="todas" selected>Todas</option>';
  comidas.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    filtroComida.appendChild(option);
  });
}

// Añade una comida nueva
function agregarOpcionComida(nombreComida) {
  if (!comidas.includes(nombreComida)) {
    comidas.push(nombreComida);
    guardarDatos();
    actualizarSelectComidas();
    actualizarResumen();
  }
}

// Parsear cantidad (con media, individual, etc)
function parseCantidad(texto) {
  texto = texto.toLowerCase();
  if (texto.includes("media") || texto.includes("1/2")) {
    const n = parseInt(texto) || 1;
    return n * 0.5;
  }
  if (texto.includes("individual")) {
    const n = parseInt(texto) || 1;
    return n;
  }
  const match = texto.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

// Actualiza la tabla y resumen en pantalla
function actualizarResumen() {
  resumenCantidades = {};
  comidas.forEach((c) => (resumenCantidades[c] = 0));

  pedidos.forEach((pedido) => {
    const cantidad = parseCantidad(pedido.cantidad);
    if (!resumenCantidades[pedido.comida])
      resumenCantidades[pedido.comida] = 0;
    resumenCantidades[pedido.comida] += cantidad;
  });

  // Actualizar lista resumen
  listaResumen.innerHTML = "";
  for (const comida in resumenCantidades) {
    const li = document.createElement("li");
    li.textContent = `${comida}: ${resumenCantidades[comida]}`;
    listaResumen.appendChild(li);
  }

  // Actualizar total precio
  let total = pedidos.reduce(
    (acc, p) => acc + parseFloat(p.precio || 0),
    0
  );
  totalPrecioElemento.textContent = `Total de Precio: $${total.toFixed(
    2
  )}`;
}

// Renderizar tabla de pedidos en el DOM
// Recibe pedidos a mostrar, por defecto muestra todos
function renderizarTabla(pedidosAMostrar = pedidos) {
  tablaPedidos.innerHTML = "";
  pedidosAMostrar.forEach((pedido, index) => {
    const fila = document.createElement("tr");

    ["cliente", "comida", "cantidad", "hora", "precio"].forEach(
      (prop) => {
        const td = document.createElement("td");
        td.textContent = pedido[prop];
        fila.appendChild(td);
      }
    );

    // Checkbox Listo
    const tdCheck = document.createElement("td");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = pedido.listo || false;
    check.addEventListener("change", () => {
      pedidos[index].listo = check.checked;
      if (check.checked) {
        fila.classList.add("listo");
      } else {
        fila.classList.remove("listo");
      }
      guardarDatos();
    });
    tdCheck.appendChild(check);
    fila.appendChild(tdCheck);

    if (pedido.listo) {
      fila.classList.add("listo");
    }

    // Acciones: Editar y Eliminar
    const tdAcciones = document.createElement("td");
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => {
      if (!confirm("¿Estás seguro de que deseas editar este pedido?"))
        return;

      formularioPedido.cliente.value = pedido.cliente;
      formularioPedido.comida.value = pedido.comida;
      formularioPedido.cantidad.value = pedido.cantidad;
      formularioPedido.hora.value = pedido.hora;
      formularioPedido.precio.value = pedido.precio;

      pedidos.splice(index, 1);
      guardarDatos();
      renderizarTabla();
      actualizarResumen();
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => {
      if (!confirm("¿Estás seguro de que deseas eliminar este pedido?"))
        return;

      pedidos.splice(index, 1);
      guardarDatos();
      renderizarTabla();
      actualizarResumen();
    });

    tdAcciones.appendChild(btnEditar);
    tdAcciones.appendChild(btnEliminar);
    fila.appendChild(tdAcciones);

    tablaPedidos.appendChild(fila);
  });
}

// Inicializa la aplicación
function init() {
  cargarDatos();
  actualizarSelectComidas();
  renderizarTabla();
  actualizarResumen();
}

// Eventos
agregarComidaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nueva = inputNuevaComida.value.trim();
  if (nueva === "") return;
  if (comidas.some((c) => c.toLowerCase() === nueva.toLowerCase())) {
    alert("Esa comida ya está en la lista.");
    inputNuevaComida.value = "";
    return;
  }
  agregarOpcionComida(nueva);
  inputNuevaComida.value = "";
});

formularioPedido.addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevoPedido = {
    cliente: formularioPedido.cliente.value,
    comida: formularioPedido.comida.value,
    cantidad: formularioPedido.cantidad.value,
    hora: formularioPedido.hora.value,
    precio: formularioPedido.precio.value,
    listo: false,
  };
  pedidos.push(nuevoPedido);
  guardarDatos();
  renderizarTabla();
  actualizarResumen();
  formularioPedido.reset();
  selectComida.selectedIndex = 0;
});

// FILTRO por comida
filtroComida.addEventListener("change", () => {
  const valorFiltro = filtroComida.value;
  if (valorFiltro === "todas") {
    renderizarTabla(pedidos);
  } else {
    const pedidosFiltrados = pedidos.filter(
      (pedido) => pedido.comida === valorFiltro
    );
    renderizarTabla(pedidosFiltrados);
  }
});

// Ordenar por hora (ascendente)
btnOrdenarHora.addEventListener("click", () => {
  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });
  renderizarTabla(pedidosOrdenados);
});

// Ordenar por estado listo (los listos primero)
btnOrdenarListo.addEventListener("click", () => {
  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    return b.listo - a.listo;
  });
  renderizarTabla(pedidosOrdenados);
});

btnBorrarTodo.addEventListener("click", () => {
  if (!confirm("¿Seguro quieres borrar todos los pedidos y comidas?"))
    return;
  comidas = ["Empanizado", "Plancha"];
  pedidos = [];
  guardarDatos();
  actualizarSelectComidas();
  renderizarTabla();
  actualizarResumen();
});

btnDescargarDatos.addEventListener("click", () => {
  const datos = {
    comidas,
    pedidos,
  };
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(datos, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download = "datos_pedidos.json";
  a.click();
});

init();
