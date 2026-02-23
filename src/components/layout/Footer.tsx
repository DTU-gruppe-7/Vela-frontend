import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Produkt',
      links: [
        { label: 'Funktioner', href: '/features' },
        { label: 'Priser', href: '/pricing' },
        { label: 'Integrationer', href: '/integrations' },
        { label: 'Opdateringer', href: '/changelog' },
      ],
    },
    {
      title: 'Virksomhed',
      links: [
        { label: 'Om os', href: '/about' },
        { label: 'Karriere', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Presse', href: '/press' },
      ],
    },
    {
      title: 'Ressourcer',
      links: [
        { label: 'Hjælpecenter', href: '/help' },
        { label: 'Dokumentation', href: '/docs' },
        { label: 'Guides', href: '/guides' },
        { label: 'API', href: '/api' },
      ],
    },
    {
      title: 'Juridisk',
      links: [
        { label: 'Privatlivspolitik', href: '/privacy' },
        { label: 'Vilkår & betingelser', href: '/terms' },
        { label: 'Cookiepolitik', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <FaInstagram />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <FaTwitter />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FaLinkedinIn />, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/src/assets/vela-logo.svg" alt="Vela Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">Vela</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              Den smarte platform der gør det nemt at organisere, samarbejde og skabe resultater sammen.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">
                Tilmeld dig vores nyhedsbrev
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Din e-mail"
                  className="flex-1 px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Tilmeld
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Swipe. Alle rettigheder forbeholdes.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;