
import { Link } from "react-router-dom";


function Footer() {
    return (
        <section className="fixed inset-x-0 bottom-0 bg-gradient-to-br from-primary to-primary-strong text-white p-5 z-50 shadow-[0_-10px_25px_rgba(15,23,42,0.25)] flex justify-center gap-4">
            <nav className="flex items-center">
                <ul className="flex list-none gap-8 m-0 p-0">
                    <li>
                        <Link to="/swipe" className="font-semibold uppercase text-xs tracking-widest hover:opacity-70 transition-opacity">SWIPE</Link>
                    </li>
                    <li>
                        <Link to="/groups" className="font-semibold uppercase text-xs tracking-widest hover:opacity-70 transition-opacity">GROUPS</Link>
                    </li>
                    <li>
                        <Link to="/profile" className="font-semibold uppercase text-xs tracking-widest hover:opacity-70 transition-opacity">PROFILE</Link>
                    </li>
                </ul>
            </nav>
        </section>
    );
}

export default Footer;