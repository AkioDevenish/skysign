import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Document | SkySign',
    description: 'Securely sign documents online.',
};

export default function SignLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
