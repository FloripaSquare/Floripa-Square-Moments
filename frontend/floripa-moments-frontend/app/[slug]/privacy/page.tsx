"use client"; // Necessário para usar hooks

import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation"; // Importar o hook

// --- Definição do Tema ---
interface Theme {
  bgImageSrc: string;
  overlayColor: string;
  cardBg: string;
  titleColor: string;
  bodyColor: string;
  mutedColor: string;
  linkColor: string;
  quoteBorder: string;
  quoteText: string;
}

// Objeto de temas, espelhando a lógica da sua RegisterPage
const themes: Record<string, Theme> = {
  fs: {
    bgImageSrc: "/base-moments.jpg", // Imagem de fundo escura
    overlayColor: "bg-orange",
    cardBg: "bg-orange/50 backdrop-blur-md", // Fundo do card escuro
    titleColor: "text-white",
    bodyColor: "text-gray-200",
    mutedColor: "text-gray-300",
    linkColor: "text-yellow-300 underline",
    quoteBorder: "border-yellow-400",
    quoteText: "text-yellow-200",
  },
  kotai: {
    bgImageSrc: "/kotai/fundo-kotai.jpg",
    overlayColor: "bg-black/40",
    cardBg: "bg-black/50 backdrop-blur-md",
    titleColor: "text-white",
    bodyColor: "text-gray-200",
    mutedColor: "text-gray-300",
    linkColor: "text-blue-400 underline",
    quoteBorder: "border-blue-500",
    quoteText: "text-blue-300",
  },
  aegea: {
    bgImageSrc: "/aegea/fundo-aegea.jpg",
    overlayColor: "bg-black/40",
    cardBg: "bg-black/50 backdrop-blur-md",
    titleColor: "text-white",
    bodyColor: "text-gray-200",
    mutedColor: "text-gray-300",
    linkColor: "text-blue-400 underline",
    quoteBorder: "border-blue-500",
    quoteText: "text-blue-300",
  },
  default: {
    bgImageSrc: "", // Sem imagem de fundo, usará um sólido
    overlayColor: "bg-transparent", // Sem overlay
    cardBg: "bg-white", // Fundo do card branco
    titleColor: "text-gray-900",
    bodyColor: "text-gray-700",
    mutedColor: "text-gray-500",
    linkColor: "text-blue-600 underline",
    quoteBorder: "border-blue-500",
    quoteText: "text-blue-700 italic",
  },
};

export default function PrivacyPage() {
  // --- Lógica de Tema ---
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  // Seleciona o tema com base no slug, ou usa "default"
  const theme = themes[slug || "default"];

  return (
    // 1. Wrapper principal: 'relative' para ancorar o fundo,
    //    'flex flex-col min-h-screen' para o layout sticky footer.
    <div
      className={`relative flex flex-col min-h-screen 
      ${!theme.bgImageSrc ? "bg-gray-100" : ""}`} // Fallback de cor
    >
      {/* 2. Fundo e Overlay: posicionados atrás do conteúdo com z-0 */}
      {theme.bgImageSrc && (
        <Image
          src={theme.bgImageSrc}
          alt="Fundo"
          fill
          className="object-cover z-0" // Fica no 'fundo'
          priority
        />
      )}
      {/* Overlay (agora dinâmico) */}
      <div className={`absolute inset-0 ${theme.overlayColor} z-0`} />

      {/* 3. Conteúdo Principal:
             'relative z-10' para ficar sobre o fundo.
             'flex-grow' para empurrar o footer para baixo.
             'flex items-center justify-center' para centralizar o card. */}
      <main className="relative z-10 w-full flex-grow flex items-center justify-center">
        {/* 4. O Card de Conteúdo */}
        <div className="max-w-3xl w-full mx-auto px-6 py-12">
          <div
            className={`rounded-2xl shadow-xl p-8 overflow-y-auto max-h-[80vh] 
            ${theme.cardBg}`} // Classe do card dinâmica
          >
            <h1
              className={`text-2xl font-bold text-center mb-4 
              ${theme.titleColor}`} // Cor do título dinâmica
            >
              Política de Privacidade da Plataforma “Moments”
            </h1>

            <p
              className={`text-sm text-center mb-8 
              ${theme.mutedColor}`} // Cor do subtítulo dinâmica
            >
              Última atualização: 28 de setembro de 2025
            </p>

            <p
              className={`leading-relaxed mb-6 
              ${theme.bodyColor}`} // Cor do corpo do texto dinâmica
            >
              O <strong>Rooftop Floripa Square</strong>, pessoa jurídica de
              direito privado, inscrita no CNPJ sob o nº 41.559.959/0001-49, com
              sede em Florianópolis/SC, leva a sua privacidade a sério e zela
              pela segurança e proteção de dados de todos os seus clientes,
              parceiros, fornecedores e usuários (“Usuários” ou “você”) da
              plataforma “Moments” (“Plataforma”).
            </p>

            <p className={`leading-relaxed mb-6 ${theme.bodyColor}`}>
              Esta Política de Privacidade (“Política”) destina-se a informá-lo
              sobre o modo como utilizamos e divulgamos informações coletadas em
              seus cadastros e visitas à nossa Plataforma e em mensagens que
              trocamos com você.
            </p>

            <blockquote
              className={`border-l-4 pl-4 italic mb-6 
              ${theme.quoteBorder} ${theme.quoteText}`} // Cores da citação dinâmicas
            >
              AO ACESSAR A PLATAFORMA, ENVIAR COMUNICAÇÕES OU FORNECER QUALQUER
              TIPO DE DADO PESSOAL, VOCÊ DECLARA ESTAR CIENTE E DE ACORDO COM
              ESTA POLÍTICA DE PRIVACIDADE.
            </blockquote>

            {/* Seções */}
            <section className="mb-6">
              <h2
                className={`text-lg font-semibold mb-2 
                ${theme.titleColor}`} // Cor do título da seção
              >
                1. Definições
              </h2>
              <ul
                className={`list-disc list-inside leading-relaxed space-y-2 
                ${theme.mutedColor}`} // Cor do texto da lista
              >
                <li>
                  <strong>Dados Pessoais:</strong> qualquer informação que,
                  direta ou indiretamente, identifique ou possa identificar uma
                  pessoa natural.
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
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                2. Uso de Dados Pessoais
              </h2>
              <ul
                className={`list-disc list-inside space-y-2 ${theme.mutedColor}`}
              >
                <li>Localizar suas fotografias e vídeos nos eventos.</li>
                <li>Confirmar ou corrigir informações fornecidas.</li>
                <li>Fins de marketing (com consentimento).</li>
                <li>Cumprir obrigações legais e regulatórias.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                3. Dados Pessoais Coletados e Finalidade
              </h2>
              <ul
                className={`list-disc list-inside space-y-2 ${theme.mutedColor}`}
              >
                <li>
                  <strong>Cadastro:</strong> nome, sobrenome, telefone, e-mail,
                  Instagram.
                </li>
                <li>
                  <strong>Selfie:</strong> utilizada apenas para reconhecimento
                  facial e deletada após a análise.
                </li>
                <li>
                  <strong>Imagens do Evento:</strong> compõem sua galeria
                  pessoal e podem ser compartilhadas.
                </li>
              </ul>
            </section>

            {/* --- SEÇÕES COMPLETAS 4-11 --- */}

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                4. Compartilhamento de Dados Pessoais
              </h2>
              <p className={`leading-relaxed mb-4 ${theme.bodyColor}`}>
                O Rooftop Floripa Square poderá compartilhar seus dados pessoais
                com:
              </p>
              <ul
                className={`list-disc list-inside space-y-2 ${theme.mutedColor}`}
              >
                <li>
                  Fotógrafos parceiros e organizadores do evento para o qual
                  você se cadastrou.
                </li>
                <li>
                  Provedores de serviços de tecnologia (ex: AWS) para
                  armazenamento em nuvem.
                </li>
                <li>
                  Autoridades judiciais, administrativas ou governamentais
                  competentes, sempre que houver determinação legal.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                5. Direitos dos Titulares de Dados
              </h2>
              <p className={`leading-relaxed mb-4 ${theme.bodyColor}`}>
                Nos termos da LGPD, você tem o direito de:
              </p>
              <ul
                className={`list-disc list-inside space-y-2 ${theme.mutedColor}`}
              >
                <li>Confirmar a existência de tratamento dos seus dados.</li>
                <li>Acessar seus dados pessoais.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>
                  Solicitar a anonimização, bloqueio ou eliminação de dados
                  desnecessários.
                </li>
                <li>Revogar o consentimento a qualquer momento.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                6. Segurança dos Dados
              </h2>
              <p className={`leading-relaxed ${theme.bodyColor}`}>
                Utilizamos medidas técnicas e administrativas para proteger seus
                dados pessoais de acessos não autorizados e de situações
                acidentais ou ilícitas de destruição, perda, alteração ou
                comunicação.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                7. Armazenamento de Dados e Término do Tratamento
              </h2>
              <p className={`leading-relaxed ${theme.bodyColor}`}>
                Seus dados pessoais serão mantidos pelo tempo necessário para
                cumprir as finalidades para as quais foram coletados, ou para
                cumprimento de obrigações legais. As selfies de cadastro são
                deletadas imediatamente após o processo de reconhecimento
                facial.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                8. Cookies e Tecnologias Semelhantes
              </h2>
              <p className={`leading-relaxed ${theme.bodyColor}`}>
                Nossa Plataforma utiliza cookies essenciais para o seu
                funcionamento (como tokens de login) e cookies de análise (para
                entender como os usuários interagem com o site). Você pode
                gerenciar suas preferências de cookies através do seu navegador.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                9. Transferência Internacional de Dados
              </h2>
              <p className={`leading-relaxed ${theme.bodyColor}`}>
                Os dados coletados, including as fotos dos eventos, são
                armazenados em servidores de nuvem (Amazon Web Services - AWS)
                localizados nos Estados Unidos. Ao concordar com esta Política,
                você consente explicitamente com essa transferência
                internacional.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                10. Alterações nesta Política de Privacidade
              </h2>
              <p className={`leading-relaxed ${theme.bodyColor}`}>
                Podemos atualizar esta Política a qualquer momento. A data da
                última atualização estará sempre indicada no topo deste
                documento. Recomendamos que você revise esta Política
                periodicamente.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                11. Legislação e Foro
              </h2>
              <p className={`leading-relaxed ${theme.bodyColor}`}>
                Esta Política será regida e interpretada de acordo com as leis
                da República Federativa do Brasil, especialmente a Lei nº
                13.709/2018 (LGPD). Fica eleito o foro da Comarca de
                Florianópolis/SC para dirimir quaisquer controvérsias.
              </p>
            </section>

            {/* --- FIM DAS SEÇÕES COMPLETAS --- */}

            <section>
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                12. Contato do DPO
              </h2>
              <p className={`${theme.mutedColor} leading-relaxed`}>
                Encarregado de Proteção de Dados:{" "}
                <a
                  href="mailto:moments@floripasquare.com.br"
                  className={theme.linkColor} // Cor do link dinâmica
                >
                  moments@floripasquare.com.br
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* 5. Footer: agora é irmão do <main> e fica no fim do flex-col.
             'relative z-10' para ficar sobre o fundo. */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
