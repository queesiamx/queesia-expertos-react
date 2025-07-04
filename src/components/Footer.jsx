import { Instagram, Facebook, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 px-4 mt-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm gap-4">
        <p className="text-center md:text-left text-white">
          © {new Date().getFullYear()} Quesia. Todos los derechos reservados.
        </p>

        <div className="flex gap-4 items-center">
          <a
            href="https://www.instagram.com/quees_ia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/share/16tCkmXBzp/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition"
            title="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://www.threads.net/@quees_ia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition"
            title="Threads"
          >
            <Send className="w-5 h-5 rotate-45" />
          </a>
        </div>

        <div className="flex gap-4">
          <a
            href="/terminos"
            className="text-white hover:text-primary-soft transition"
          >
            Términos y Condiciones
          </a>
          <a
            href="/privacidad"
            className="text-white hover:text-primary-soft transition"
          >
            Aviso de Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
