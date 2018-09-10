import '@fortawesome/fontawesome-free/css/all.min.css';
import './app.css';
import './nav.css';
import './main.css';

const onAnchorClicked = (eventTarget, event) => {
  if (window.location.pathname.replace(/^\//,'') == eventTarget.pathname.replace(/^\//,'') && window.location.hostname == eventTarget.hostname) {
      const elementTarget = document.querySelector(eventTarget.hash);
      if (elementTarget) {
        if (event) event.preventDefault();
        const currentYOffset = document.querySelector('.main-container').scrollTop;
        window.location.hash = eventTarget.hash;
        document.querySelector('.main-container').scroll({
          top: currentYOffset,
          left: 0
        });
        elementTarget.focus({ preventScroll: true });
        smoothScrolling();
      }
    }
};
const smoothScrolling = () => {
  const elementTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  document.querySelector('.main-container').scroll({
    top: elementTarget ? elementTarget.offsetTop : 0,
    left: 0,
    behavior: 'smooth'
  });
}
document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((element) => {
  element.addEventListener('click', (event) => {
    onAnchorClicked(event);
  });
});

document.querySelector('.main-container').addEventListener('scroll', (e) => {
  if (document.querySelector('body').clientWidth <= 880 && e.target.scrollTop > 0) {
    document.querySelector('.profile-overview').className = 'profile-overview hidden';
  } else {
    document.querySelector('.profile-overview').className = 'profile-overview';
  }
});

window.onpopstate = () => smoothScrolling();
document.addEventListener('DOMContentLoaded', () => smoothScrolling());
