import { tap, map } from 'rxjs/operators';

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
const smoothScrolling = () => (source) => source.pipe(
  map(() => window.location.hash ? document.querySelector(window.location.hash).offsetTop : 0),
  tap((yOffset) => {
    document.querySelector('.main-container').scroll({
      top: yOffset,
      left: 0,
      // behavior: 'smooth'
    });
  })
);

export { anchorSelection, smoothScrolling };
