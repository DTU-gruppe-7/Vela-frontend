import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface Props {
    children?: ReactNode;
}

function MainLayout({ children }: Props) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Header />
            <main className="flex-1 p-6 md:p-12 pt-24 pb-28">
                {children ?? <Outlet />}
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;