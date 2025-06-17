export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 px-4 mt-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm gap-2 md:gap-4">
        <p className="text-center md:text-left text-white">
          © {new Date().getFullYear()} Quesia. Todos los derechos reservados.
        </p>
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
