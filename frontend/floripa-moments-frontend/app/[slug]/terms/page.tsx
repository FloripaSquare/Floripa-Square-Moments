/* eslint-disable react/no-unescaped-entities */
"use client";

import Footer from "@/components/Footer";
import Image from "next/image";

export default function TermsPage() {
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
            Termos e Condições de Uso da Plataforma “Moments”
          </h1>

          <p className="text-sm text-gray-300 text-center mb-8">
            Última atualização: 28 de setembro de 2025
          </p>

          <p className="text-gray-200 leading-relaxed mb-6">
            Bem-vindo(a) à plataforma <strong>“Moments”</strong> (“Plataforma”),
            uma solução desenvolvida e fornecida pelo Rooftop Floripa Square
            (“Nós”).
          </p>

          <p className="text-gray-200 leading-relaxed mb-6">
            Estes Termos e Condições de Uso (“Termos”) regem o seu acesso e uso
            da Plataforma, que permite a você, nosso convidado e usuário
            (“Usuário” ou “Você”), localizar, visualizar, baixar e compartilhar
            suas fotografias e vídeos (“Imagens”) capturados durante os eventos
            realizados no Rooftop Floripa Square, através de uma tecnologia de
            reconhecimento facial.
          </p>

          <blockquote className="border-l-4 border-yellow-400 pl-4 text-yellow-200 italic mb-6">
            AO SE CADASTRAR E UTILIZAR A PLATAFORMA, VOCÊ CONFIRMA QUE LEU,
            COMPREENDEU E CONCORDA EM VINCULAR-SE A ESTES TERMOS DE USO E À
            NOSSA POLÍTICA DE PRIVACIDADE.
          </blockquote>

          {/* Seções */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              1. Descrição do Serviço
            </h2>
            <p className="text-gray-300 leading-relaxed">
              A Plataforma "Moments" oferece uma ferramenta para que os
              participantes de eventos (realizados no Rooftop Floripa Square ou
              por empresas terceiras que contrataram nossos serviços) possam
              encontrar suas Imagens de forma rápida e segura. Para isso, o
              Usuário deve realizar um cadastro inicial e fazer o upload de uma
              fotografia pessoal (selfie), que será utilizada como referência
              biométrica para localizar as Imagens em que o Usuário aparece no
              acervo do evento.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              2. Elegibilidade e Cadastro
            </h2>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong>Idade Mínima:</strong> o uso da Plataforma é
                estritamente proibido para menores de 12 anos.
              </li>
              <li>
                <strong>Adolescentes (12 a 17 anos):</strong> o cadastro e uso
                da Plataforma por adolescentes com idade entre 12 e 17 anos
                estão condicionados ao consentimento de um dos pais ou
                responsável legal, que deverá ser fornecido durante o cadastro.
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
            <h2 className="text-lg font-semibold text-white mb-2">
              3. Condições de Uso
            </h2>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2">
              <li>
                <strong>Uso Pessoal:</strong> a Plataforma destina-se
                exclusivamente ao seu uso pessoal e não comercial.
              </li>
              <li>
                <strong>Ausência de Alternativa:</strong> o acesso às Imagens é
                oferecido exclusivamente por meio da tecnologia de
                reconhecimento facial da Plataforma “Moments”.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              4. Propriedade Intelectual e Direitos de Imagem
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              O Rooftop Floripa Square é o único titular de todos os direitos de
              propriedade intelectual da Plataforma. Você recebe apenas uma
              licença de uso pessoal, limitada, não exclusiva, intransferível e
              revogável.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              É proibido copiar, modificar, distribuir, vender, alugar,
              sublicenciar, fazer engenharia reversa ou criar trabalhos
              derivados a partir da Plataforma sem autorização.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Quanto às Imagens dos eventos: a titularidade varia conforme o
              evento (próprio do Rooftop ou de terceiros). Você recebe licença
              de uso pessoal das Imagens em que aparece. Reconhece também que
              elas podem ser usadas para portfólio institucional e divulgação.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              5. Privacidade e Proteção de Dados
            </h2>
            <p className="text-gray-300 leading-relaxed">
              O tratamento de seus dados pessoais, incluindo a selfie (dado
              biométrico), é regido pela nossa Política de Privacidade, parte
              integrante destes Termos.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              6. Isenção de Garantias e Limitação de Responsabilidade
            </h2>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-2">
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
            <h2 className="text-lg font-semibold text-white mb-2">
              7. Modificações nos Termos
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Podemos alterar estes Termos a qualquer momento. A versão mais
              atual estará sempre disponível na Plataforma. O uso contínuo após
              alterações constitui sua aceitação.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              8. Disposições Gerais
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do
              Brasil. Fica eleito o foro da Comarca de Florianópolis/SC para
              dirimir quaisquer controvérsias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              9. Contato
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Em caso de dúvidas sobre estes Termos, entre em contato pelo
              e-mail:{" "}
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
