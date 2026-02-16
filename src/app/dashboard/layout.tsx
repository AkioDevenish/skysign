import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | SkySign',
    description: 'Manage your documents and signatures.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
