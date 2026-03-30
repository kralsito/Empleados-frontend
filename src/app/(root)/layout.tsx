
import Sidebar from '@/components/sidebar';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-transparent lg:h-screen lg:overflow-hidden lg:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:h-screen lg:px-8 lg:py-6">
                <div className="min-h-full rounded-[2rem] border border-black/8 bg-[var(--surface)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-8">
                {children}
                </div>
            </main>
        </div>
    );
}
