import type { SearchOut, UserOut } from "./types";

// 🔹 Buscar fotos a partir da selfie
export async function searchFaces(
  eventSlug: string,
  file: File
): Promise<SearchOut> {
  const fd = new FormData();
  fd.append("selfie", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/search/${eventSlug}`,
    {
      method: "POST",
      body: fd,
    }
  );

  if (!res.ok) throw new Error("Erro ao buscar fotos");
  return res.json();
}

// 🔹 Upload de uma foto avulsa (admin)
export async function ingestPhoto(eventSlug: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/ingest/${eventSlug}/photo`,
    {
      method: "POST",
      body: fd,
    }
  );
  if (!res.ok) throw new Error("Erro ao enviar foto");
  return res.json();
}

// 🔹 Upload em lote (admin)
export async function bulkUpload(
  eventSlug: string,
  files: File[],
  user: string,
  pass: string
) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/${eventSlug}/bulk`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${user}:${pass}`),
      },
      body: fd,
    }
  );
  if (!res.ok) throw new Error("Erro no bulk upload");
  return res.json();
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔹 Tipos corrigidos (sem senha)
export type RegisterForm = {
  name: string;
  email: string;
  whatsapp?: string;
  instagram?: string;
  accepted_lgpd: boolean;
};

// 🔹 Cadastro de usuário comum (ou retorna se já existir)
export async function registerUser(form: RegisterForm): Promise<UserOut> {
  const res = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erro no cadastro");
  }

  return res.json();
}
