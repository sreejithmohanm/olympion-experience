import './globals.css';

export const metadata = {
  title: 'Olympion Workforce Console',
  description:
    'Phase 1 Workforce Console for hiring and assigning digital professionals.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
