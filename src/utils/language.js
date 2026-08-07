export const syncGoogleTranslate = (lang) => {
  const cookies = document.cookie.split('; ');
  const googtransCookie = cookies.find(row => row.startsWith('googtrans='));
  const currentVal = googtransCookie ? googtransCookie.split('=')[1] : null;

  const expectedVal = lang === 'en' ? null : `/en/${lang}`;
  
  const isEnMismatch = lang === 'en' && currentVal && currentVal !== '/en/en';
  const isOtherMismatch = lang !== 'en' && currentVal !== expectedVal;

  if (isEnMismatch || isOtherMismatch) {
    if (lang === 'en') {
      document.cookie = "googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    }

    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = lang;
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  }
};
