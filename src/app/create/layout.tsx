import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Signature | SkySign',
    description: 'Create and sign documents using hand tracking or templates.',
};

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
