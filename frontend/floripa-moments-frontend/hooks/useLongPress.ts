// Adicione esta função no topo do seu arquivo, fora do componente.

/**
 * Envia uma métrica para a API para rastrear a intenção de download.
 * @param slug - O slug do evento.
 * @param fileName - A chave/nome do arquivo da imagem.
 */
async function trackDownloadIntent(slug: string, fileName: string) {
  // Busca o token do usuário logado
  const token = localStorage.getItem("user_token"); // ou o nome que você usa para o token de usuário
  if (!token) {
    console.warn(
      "Métrica de download não registrada: token de usuário não encontrado."
    );
    return;
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL; // Certifique-se que sua URL da API está acessível
    await fetch(`${API_URL}/metrics/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_slug: slug,
        file_name: fileName,
      }),
    });
    console.log(`Métrica de download registrada para: ${fileName}`);
  } catch (error) {
    console.error("Falha ao registrar métrica de download:", error);
  }
}
