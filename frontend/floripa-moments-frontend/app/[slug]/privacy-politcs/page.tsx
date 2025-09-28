"use client";

import Footer from "@/components/Footer";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <main className="relative w-full min-h-screen flex items-center justify-center">
      {/* Fundo */}
      <Image
        src="/bg-form.png"
        alt="Fundo"
        fill
        className="object-cover"
        priority
      />
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Conteúdo */}
      <div className="relative z-10 max-w-3xl w-full mx-auto px-6 py-12">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl shadow-xl p-8 overflow-y-auto max-h-[80vh]">
          <h1 className="text-2xl font-bold text-center text-white mb-4">
            Política de Privacidade da Plataforma “Moments”
          </h1>

          <p className="text-sm text-gray-300 text-center mb-8">
            Última atualização: 28 de setembro de 2025
          </p>

          <p className="text-gray-200 leading-relaxed mb-6">
            O <strong>Rooftop Floripa Square</strong>, pessoa jurídica de
            direito privado, inscrita no CNPJ sob o nº 41.559.959/0001-49, com
            sede em Florianópolis/SC, leva a sua privacidade a sério e zela pela
            segurança e proteção de dados de todos os seus clientes, parceiros,
            fornecedores e usuários (“Usuários” ou “você”) da plataforma
            “Moments” (“Plataforma”).
          </p>

          <p className="text-gray-200 leading-relaxed mb-6">
            Esta Política de Privacidade (“Política”) destina-se a informá-lo
            sobre o modo como utilizamos e divulgamos informações coletadas em
            seus cadastros e visitas à nossa Plataforma e em mensagens que
            trocamos com você.
          </p>

          <blockquote className="border-l-4 border-yellow-400 pl-4 text-yellow-200 italic mb-6">
            AO ACESSAR A PLATAFORMA, ENVIAR COMUNICAÇÕES OU FORNECER QUALQUER
            TIPO DE DADO PESSOAL, VOCÊ DECLARA ESTAR CIENTE E DE ACORDO COM ESTA
            POLÍTICA DE PRIVACIDADE.
          </blockquote>

          {/* Seções */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              1. Definições
            </h2>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong>Dados Pessoais:</strong> qualquer informação que, direta
                ou indiretamente, identifique ou possa identificar uma pessoa
                natural.
              </li>
              <li>
                <strong>Dados Pessoais Sensíveis:</strong> origem racial,
                religião, opinião política, dados de saúde, biometria etc.
              </li>
              <li>
                <strong>Tratamento de Dados Pessoais:</strong> coleta, uso,
                armazenamento ou exclusão.
              </li>
              <li>
                <strong>Leis de Proteção de Dados:</strong> legislação
                aplicável, incluindo a LGPD (Lei nº 13.709/18).
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              2. Uso de Dados Pessoais
            </h2>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2">
              <li>Localizar suas fotografias e vídeos nos eventos.</li>
              <li>Confirmar ou corrigir informações fornecidas.</li>
              <li>Fins de marketing (com consentimento).</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              3. Dados Pessoais Coletados e Finalidade
            </h2>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong>Cadastro:</strong> nome, sobrenome, telefone, e-mail,
                Instagram.
              </li>
              <li>
                <strong>Selfie:</strong> utilizada apenas para reconhecimento
                facial e deletada após a análise.
              </li>
              <li>
                <strong>Imagens do Evento:</strong> compõem sua galeria pessoal
                e podem ser compartilhadas.
              </li>
            </ul>
          </section>

          {/* ... repetir para as demais seções (4 até 12) no mesmo padrão ... */}

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              12. Contato do DPO
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Encarregado de Proteção de Dados:{" "}
              <a
                href="mailto:moments@floripasquare.com.br"
                className="text-yellow-300 underline"
              >
                moments@floripasquare.com.br
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
