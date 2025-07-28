// src/components/Footer.jsx
import { Instagram, Facebook, Send } from "lucide-react";
import { FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 px-4 mt-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm gap-4">
        <p className="text-center md:text-left text-white">
          © {new Date().getFullYear()} Quesia. Todos los derechos reservados.
        </p>

        <div className="flex gap-4 items-center justify-center">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/quees_ia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/16tCkmXBzp/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition"
            title="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>

          {/* Threads */}
<a
  href="https://www.threads.net/@quees_ia"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-purple-400 transition"
  title="Threads"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M254.5 32C136.6 32 64 111.6 64 215.5c0 72.3 48.1 138.6 132.5 160.2 9.3-6.4 18.1-13.7 26.3-21.9-49.1-12.2-81.4-52.6-81.4-106.7 0-80.3 60.4-137.3 145.1-137.3 73.6 0 130.6 52.1 130.6 129.3 0 92.8-78.4 168.1-185.1 168.1-21.4 0-44.6-3.5-63.2-8.6-9.4 11.6-21.4 22.3-34.5 30.7 32.3 9.7 70.7 14.6 102.4 14.6 130.3 0 224.1-88.3 224.1-203.4C446.3 116.7 361.9 32 254.5 32z"/>
  </svg>
</a>


          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@quees_ia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
            title="TikTok"
          >
            <FaTiktok className="w-5 h-5" />
          </a>

          {/* X (Twitter) */}
          <a
            href="https://x.com/quees_ia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
            title="X (Twitter)"
          >
            <FaXTwitter className="w-5 h-5" />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@Quees_IA"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition"
            title="YouTube"
          >
            <FaYoutube className="w-5 h-5" />
          </a>
        </div>

        <div className="flex flex-wrap gap-4 justify-center md:justify-end text-center md:text-right">
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
