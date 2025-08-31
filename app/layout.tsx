import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'CodeTribe - Real-time Collaborative Code Editor',
  description: 'Real-time collaborative code editor for seamless team collaboration with multi-language support, live preview, and integrated communication.',
  keywords: 'collaborative code editor, real-time coding, programming, team collaboration',
  authors: [{ name: 'CodeTribe Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}