import { fromEvent } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './app.css';
import './nav.css';
import './main.css';

const anchorSelection = () => tap((event) => {
  const eventTarget = event.currentTarget;
  if (window.location.pathname.replace(/^\//,'') == eventTarget.pathname.replace(/^\//,'') && window.location.hostname == eventTarget.hostname) {
      const elementTarget = document.querySelector(eventTarget.hash);
      if (elementTarget) {
        event.preventDefault();
        const currentYOffset = document.querySelector('.main-container').scrollTop;
        window.location.hash = eventTarget.hash;
        elementTarget.focus({ preventScroll: true });
        document.querySelector('.main-container').scroll({
          top: currentYOffset,
          left: 0
        });
      }
    }
});
const smoothScrolling = () => tap(() => {
  const elementTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  document.querySelector('.main-container').scroll({
    top: elementTarget ? elementTarget.offsetTop : 0,
    left: 0,
    behavior: 'smooth'
  });
});
document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((element) => {
  fromEvent(element, 'click')
    .pipe(
      anchorSelection(),
      smoothScrolling()
    ).subscribe(() => {
      console.log('ok');
    });
});

fromEvent(document.querySelector('.main-container'), 'scroll')
  .pipe(filter(() => document.querySelector('body').clientWidth <= 880))
  .subscribe((e) => {
    document.querySelector('.profile-overview').className = `profile-overview ${e.target.scrollTop > 0 ? 'hidden' : ''}`;
  });

window.onpopstate = () => smoothScrolling();
fromEvent(document, 'DOMContentLoaded')
  .pipe(smoothScrolling())
  .subscribe(() => {
    console.log('ok');
  });
