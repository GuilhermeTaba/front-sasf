const API_URL = import.meta.env.VITE_API_URL;
 
const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-USER-ID": localStorage.getItem("userId"),
});

export const listarEventos = async () => {
  const res = await fetch(`${API_URL}/agenda/eventos`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar eventos");
  return res.json();
};

export const criarEvento = async (evento) => {
  const res = await fetch(`${API_URL}/agenda/eventos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(evento),
  });
  if (!res.ok) throw new Error("Erro ao criar evento");
  return res.json();
};

export const editarEvento = async (id, evento) => {
  const res = await fetch(`${API_URL}/agenda/eventos/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(evento),
  });
  if (!res.ok) throw new Error("Erro ao editar evento");
  return res.json();
};

export const atualizarStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/agenda/eventos/${id}/status?status=${status}`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao atualizar status");
  return res.json();
};

export const cancelarEvento = async (id) => {
  const res = await fetch(`${API_URL}/agenda/eventos/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao cancelar evento");
};

export const listarOrientadores = async () => {
  const res = await fetch(`${API_URL}/orientadores`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar orientadores");
  return res.json();
};

export const listarTecnicos = async () => {
  const res = await fetch(`${API_URL}/tecnicos`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar técnicos");
  return res.json();
};

export const listarFamilias = async () => {
  const res = await fetch(`${API_URL}/familias`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar famílias");
  return res.json();
};