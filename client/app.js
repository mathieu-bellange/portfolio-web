import '@fortawesome/fontawesome-free/css/all.min.css';
import './app.css';
import './nav.css';
import './main.css';

const scroll = (eventTarget) => {
  if (window.location.pathname.replace(/^\//,'') == eventTarget.pathname.replace(/^\//,'') && window.location.hostname == eventTarget.hostname) {
      const elementTarget = document.querySelector(eventTarget.hash);
      if (elementTarget) {
        event.preventDefault();
        window.location.hash = eventTarget.hash;
        document.querySelector('.main-container').scroll({
          top: elementTarget.offsetTop,
          left: 0,
          behavior: 'smooth'
        });
        elementTarget.focus({ preventScroll: true });
      }
    }
};
document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((element) => {
  element.addEventListener('click', (event) => {
    scroll(event.currentTarget);
  });
});

document.addEventListener('DOMContentLoaded', () => scroll(document.querySelector(`a[href="${window.location.hash}"]`)));
document.querySelector('.main-container').addEventListener('scroll', (e) => {
  if (document.querySelector('body').clientWidth <= 880 && e.target.scrollTop > 0) {
    document.querySelector('.profile-overview').className = 'profile-overview hidden';
  } else {
    document.querySelector('.profile-overview').className = 'profile-overview';
  }
});
