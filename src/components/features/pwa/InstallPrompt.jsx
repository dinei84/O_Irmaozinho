import { useEffect, useState } from 'react';

const DISMISS_KEY = 'oirmaozinho:pwa-dismissed';
const REAPPEAR_MS = 3 * 24 * 60 * 60 * 1000;

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7 shrink-0 text-pessego"
      aria-hidden="true"
    >
      <circle cx="12" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="4.5" fill="currentColor" />
    </svg>
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsIOS(iOS && !standalone);

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    const recentlyDismissed =
      dismissedAt && Date.now() - dismissedAt < REAPPEAR_MS;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (!standalone && !recentlyDismissed) {
      setShow(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('oirmaozinho:pwa-installed', '1');
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const visible = show && (isIOS || deferredPrompt);
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
      <div className="flex w-full max-w-sm items-start gap-3 rounded-2xl bg-secondary p-4 text-background shadow-2xl">
        <BrandMark />
        <div className="flex-1">
          <p className="font-sans font-bold leading-tight">Instalar o app</p>
          <p className="mt-0.5 font-sans text-sm text-pessego">
            Leia offline, na tela inicial.
          </p>
          {isIOS ? (
            <p className="mt-2 font-sans text-xs text-background/80">
              No Safari, toque em
              <span className="font-semibold"> Compartilhar </span>
              e depois em
              <span className="font-semibold"> “Adicionar à Tela de Início”</span>.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-3 rounded-full bg-pessego px-5 py-2 font-sans font-bold text-text-primary transition-opacity hover:opacity-90"
            >
              Instalar
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dispensar"
          className="shrink-0 rounded-full p-1 text-pessego transition-opacity hover:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
