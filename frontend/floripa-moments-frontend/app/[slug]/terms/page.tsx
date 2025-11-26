/* eslint-disable react/no-unescaped-entities */
"use client";

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
    overlayColor: "bg-blue-900/60",
    cardBg: "bg-blue-900/50 backdrop-blur-md",
    titleColor: "text-white",
    bodyColor: "text-gray-200",
    mutedColor: "text-gray-300",
    linkColor: "text-blue-300 underline",
    quoteBorder: "border-blue-400",
    quoteText: "text-blue-200",
  },
  aegea: {
    bgImageSrc: "/aegea/fundo-aegea.jpg",
    overlayColor: "bg-blue-900/60",
    cardBg: "bg-blue-900/50 backdrop-blur-md",
    titleColor: "text-white",
    bodyColor: "text-gray-200",
    mutedColor: "text-gray-300",
    linkColor: "text-blue-300 underline",
    quoteBorder: "border-blue-400",
    quoteText: "text-blue-200",
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

export default function TermsPage() {
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
              Termos e Condições de Uso da Plataforma “Moments”
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
              Bem-vindo(a) à plataforma <strong>“Moments”</strong>{" "}
              (“Plataforma”), uma solução desenvolvida e fornecida pelo Rooftop
              Floripa Square (“Nós”).
            </p>

            <p className={`leading-relaxed mb-6 ${theme.bodyColor}`}>
              Estes Termos e Condições de Uso (“Termos”) regem o seu acesso e
              uso da Plataforma, que permite a você, nosso convidado e usuário
              (“Usuário” ou “Você”), localizar, visualizar, baixar e
              compartilhar suas fotografias e vídeos (“Imagens”) capturados
              durante os eventos realizados no Rooftop Floripa Square, através
              de uma tecnologia de reconhecimento facial.
            </p>

            <blockquote
              className={`border-l-4 pl-4 italic mb-6 
              ${theme.quoteBorder} ${theme.quoteText}`} // Cores da citação dinâmicas
            >
              AO SE CADASTRAR E UTILIZAR A PLATAFORMA, VOCÊ CONFIRMA QUE LEU,
              COMPREENDEU E CONCORDA EM VINCULAR-SE A ESTES TERMOS DE USO E À
              NOSSA POLÍTICA DE PRIVACIDADE.
            </blockquote>

            {/* Seções */}
            <section className="mb-6">
              <h2
                className={`text-lg font-semibold mb-2 
                ${theme.titleColor}`} // Cor do título da seção
              >
                1. Descrição do Serviço
              </h2>
              <p className={`leading-relaxed ${theme.mutedColor}`}>
                A Plataforma "Moments" oferece uma ferramenta para que os
                participantes de eventos (realizados no Rooftop Floripa Square
                ou por empresas terceiras que contrataram nossos serviços)
                possam encontrar suas Imagens de forma rápida e segura. Para
                isso, o Usuário deve realizar um cadastro inicial e fazer o
                upload de uma fotografia pessoal (selfie), que será utilizada
                como referência biométrica para localizar as Imagens em que o
                Usuário aparece no acervo do evento.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                2. Elegibilidade e Cadastro
              </h2>
              <ul
                className={`list-disc list-inside leading-relaxed space-y-2 
                ${theme.mutedColor}`}
              >
                <li>
                  <strong>Idade Mínima:</strong> o uso da Plataforma é
                  estritamente proibido para menores de 12 anos.
                </li>
                <li>
                  <strong>Adolescentes (12 a 17 anos):</strong> o cadastro e uso
                  da Plataforma por adolescentes com idade entre 12 e 17 anos
                  estão condicionados ao consentimento de um dos pais ou
                  responsável legal, que deverá ser fornecido durante o
                  cadastro.
                </li>
                <li>
                  <strong>Veracidade das Informações:</strong> você concorda em
                  fornecer informações verdadeiras e manter seus dados
                  atualizados. A guarda e confidencialidade da senha são de sua
                  exclusiva responsabilidade.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                3. Condições de Uso
              </h2>
              <ul
                className={`list-disc list-inside leading-relaxed space-y-2 
                ${theme.mutedColor}`}
              >
                <li>
                  <strong>Uso Pessoal:</strong> a Plataforma destina-se
                  exclusivamente ao seu uso pessoal e não comercial.
                </li>
                <li>
                  <strong>Ausência de Alternativa:</strong> o acesso às Imagens
                  é oferecido exclusivamente por meio da tecnologia de
                  reconhecimento facial da Plataforma “Moments”.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                4. Propriedade Intelectual e Direitos de Imagem
              </h2>
              <p className={`leading-relaxed mb-4 ${theme.mutedColor}`}>
                O Rooftop Floripa Square é o único titular de todos os direitos
                de propriedade intelectual da Plataforma. Você recebe apenas uma
                licença de uso pessoal, limitada, não exclusiva, intransferível
                e revogável.
              </p>
              <p className={`leading-relaxed mb-4 ${theme.mutedColor}`}>
                É proibido copiar, modificar, distribuir, vender, alugar,
                sublicenciar, fazer engenharia reversa ou criar trabalhos
                derivados a partir da Plataforma sem autorização.
              </p>
              <p className={`leading-relaxed ${theme.mutedColor}`}>
                Quanto às Imagens dos eventos: a titularidade varia conforme o
                evento (próprio do Rooftop ou de terceiros). Você recebe licença
                de uso pessoal das Imagens em que aparece. Reconhece também que
                elas podem ser usadas para portfólio institucional e divulgação.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                5. Privacidade e Proteção de Dados
              </h2>
              <p className={`leading-relaxed ${theme.mutedColor}`}>
                O tratamento de seus dados pessoais, incluindo a selfie (dado
                biométrico), é regido pela nossa Política de Privacidade, parte
                integrante destes Termos.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                6. Isenção de Garantias e Limitação de Responsabilidade
              </h2>
              <ul
                className={`list-disc list-inside leading-relaxed space-y-2 
                ${theme.mutedColor}`}
              >
                <li>
                  A Plataforma é fornecida “no estado em que se encontra”, sem
                  garantias de qualquer tipo.
                </li>
                <li>
                  Não garantimos que a busca retornará 100% das Imagens em que
                  você aparece ou que o serviço estará livre de erros.
                </li>
                <li>
                  O Rooftop Floripa Square não se responsabiliza por danos
                  decorrentes do uso da Plataforma ou das Imagens.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                7. Modificações nos Termos
              </h2>
              <p className={`leading-relaxed ${theme.mutedColor}`}>
                Podemos alterar estes Termos a qualquer momento. A versão mais
                atual estará sempre disponível na Plataforma. O uso contínuo
                após alterações constitui sua aceitação.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                8. Disposições Gerais
              </h2>
              <p className={`leading-relaxed ${theme.mutedColor}`}>
                Estes Termos são regidos pelas leis da República Federativa do
                Brasil. Fica eleito o foro da Comarca de Florianópolis/SC para
                dirimir quaisquer controvérsias.
              </p>
            </section>

            <section>
              <h2 className={`text-lg font-semibold mb-2 ${theme.titleColor}`}>
                9. Contato
              </h2>
              <p className={`leading-relaxed ${theme.mutedColor}`}>
                Em caso de dúvidas sobre estes Termos, entre em contato pelo
                e-mail:{" "}
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
