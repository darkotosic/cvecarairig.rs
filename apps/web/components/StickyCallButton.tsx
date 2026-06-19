const callPhoneNumber = '+381629253553';
const displayPhoneNumber = '+381 62 925 3553';

export function StickyCallButton() {
  return (
    <a
      href={`tel:${callPhoneNumber}`}
      aria-label={`Pozovite Cvećaru Irig na ${displayPhoneNumber}`}
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30 sm:bottom-6 sm:right-6 sm:h-16 sm:px-6 sm:text-base"
    >
      <svg
        aria-hidden="true"
        className="h-6 w-6 shrink-0 sm:h-7 sm:w-7"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z"
          fill="currentColor"
        />
      </svg>
      <span>Pozovite</span>
    </a>
  );
}
