import { tap } from 'rxjs/operators';

const anchorSelection = () => tap((eventTarget) => {
  // save yOffset before location change
  const currentYOffset = document.querySelector('.main-container').scrollTop;
  window.location.hash = eventTarget.hash;
  document.querySelector(eventTarget.hash).focus({ preventScroll: true });
  // scroll on the yOffset before the location change
  document.querySelector('.main-container').scroll({
    top: currentYOffset,
    left: 0
  });
});
const smoothScrolling = () => tap(() => {
  document.querySelector('.main-container').scroll({
    top: window.location.hash ? document.querySelector(window.location.hash).offsetTop : 0,
    left: 0,
    behavior: 'smooth'
  });
});

export { anchorSelection, smoothScrolling };
