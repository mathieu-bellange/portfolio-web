import { tap } from 'rxjs/operators';

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

export { anchorSelection, smoothScrolling };
