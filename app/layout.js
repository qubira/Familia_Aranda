import "./globals.css";

export const metadata = {
  title: "Evento Deportivo Familiar Aranda",
  description:
    "Inscríbete y compite representando a tu equipo en el Evento Deportivo Familiar Aranda.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
