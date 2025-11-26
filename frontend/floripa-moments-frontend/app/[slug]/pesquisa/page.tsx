"use client";

import Footer from "@/components/Footer";

export default function GoogleFormPage() {
  return (
    <>
      <main className="w-full min-h-screen flex justify-center items-start p-4 bg-gray-100">
        <div className="w-full max-w-3xl shadow-lg rounded-md overflow-hidden bg-white">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdvaS_tBkejjU1XhU6Kqanx7PkDO3NNIUc430LTHj2LxPmWyA/viewform?embedded=true"
            width="100%"
            height="1673"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="block"
          >
            Carregando…
          </iframe>
        </div>
      </main>
      <Footer />
    </>
  );
}
