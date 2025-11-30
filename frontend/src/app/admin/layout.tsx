import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Admin | AV Homologación',
  description: 'Panel de administración de AV Homologación',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

