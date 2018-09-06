import '@fortawesome/fontawesome-free/css/all.min.css';
import './app.css';

const scroll = (eventTarget) => {
  if (window.location.pathname.replace(/^\//,'') == eventTarget.pathname.replace(/^\//,'') && window.location.hostname == eventTarget.hostname) {
      const elementTarget = document.querySelector(eventTarget.hash);
      if (elementTarget) {
        event.preventDefault();
        window.location.hash = eventTarget.hash;
        document.querySelector('.container').scroll({
          top: elementTarget.offsetTop,
          left: 0,
          behavior: 'smooth'
        });
        elementTarget.focus({ preventScroll: true });
      }
    }
};

document.querySelector('a[href*="#"]:not([href="#"])').addEventListener('click', (event) => {
  scroll(event.currentTarget);
});

document.addEventListener('DOMContentLoaded', () => scroll(document.querySelector(`a[href="${window.location.hash}"]`)));
