import "./globals.css";

export const metadata = {
  title: "Evento Deportivo Familiar Aranda",
  description:
    "Inscríbete y compite representando a tu equipo en el Evento Deportivo Familiar Aranda.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Rubik:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="/admin" className="admin-quick-btn">
          🔐 Admin
        </a>
        {children}
      </body>
    </html>
  );
}
