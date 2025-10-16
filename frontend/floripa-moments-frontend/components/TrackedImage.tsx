// components/TrackedImage.tsx
"use client";

import { useRef } from "react";
import Image from "next/image";

type TrackedImageProps = {
  src: string;
  alt: string;
  imageId: string; // ID da foto para enviar à API
  onDownloadIntent: (id: string) => void; // Função que chama a API
};

export function TrackedImage({
  src,
  alt,
  imageId,
  onDownloadIntent,
}: TrackedImageProps) {
  // Usamos useRef para o timer para não causar re-renderizações
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInteractionStart = () => {
    // Inicia um timer. Se for segurado por 500ms, consideramos "long press"
    pressTimer.current = setTimeout(() => {
      console.log(
        `Intenção de download detectada (long press) para a imagem: ${imageId}`
      );
      onDownloadIntent(imageId);
    }, 500); // 500ms para caracterizar um "long press"
  };

  const handleInteractionEnd = () => {
    // Se o usuário soltar antes do tempo, cancela o timer
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Para desktop, o clique direito é o sinal mais claro
    // e.preventDefault(); // Descomente se quiser substituir o menu nativo (NÃO RECOMENDADO)
    console.log(
      `Intenção de download detectada (context menu) para a imagem: ${imageId}`
    );
    onDownloadIntent(imageId);
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={500}
      className="w-full h-auto rounded-lg object-cover"
      // Eventos para Mobile (touch)
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      // Evento para Desktop (clique direito)
      onContextMenu={handleContextMenu}
      // Fallbacks para mouse caso o onContextMenu não seja suficiente
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd} // Cancela se o mouse sair do elemento
    />
  );
}
