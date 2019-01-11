import { fromEvent, Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import Scrollbar from 'scrollbar';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { anchorSelection, smoothScrolling } from './observable.operators';
import scrollbarConfiguration from 'scrollbar-js.config';
import './loading.css';
import './app.css';
import './nav.css';
import './main.css';

// smoothScrolling after history change
const onPopStateSubject = new Subject();
onPopStateSubject.pipe(
  smoothScrolling()
).subscribe(() => {});
window.onpopstate = () => onPopStateSubject.next();

document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((element) => {
  fromEvent(element, 'click')
    .pipe(
      filter(event => window.location.pathname.replace(/^\//,'') == event.currentTarget.pathname.replace(/^\//,'')
        && window.location.hostname == event.currentTarget.hostname),
      filter(event => document.querySelector(event.currentTarget.hash)),
      tap(event => event.preventDefault()),
      map(event => event.currentTarget),
      anchorSelection(),
      smoothScrolling()
    ).subscribe(() => {});
});

fromEvent(document.querySelector('.main-container'), 'scroll')
  .pipe(filter(() => document.querySelector('body').clientWidth <= 880))
  .subscribe((e) => {
    document.querySelector('.profile-overview').className = `profile-overview ${e.target.scrollTop > 0 ? 'hidden' : ''}`;
  });

fromEvent(document.querySelector('.main-container'), 'scroll')
  .subscribe(() => {
    Scrollbar.refresh(document.querySelector('.main-container'))
  });

fromEvent(document.querySelector('.loading-panel'), 'transitionend')
  .pipe(filter(event => event.propertyName === 'opacity'))
  .subscribe(() => document.querySelector('.loading-panel').remove());

fromEvent(window, 'load')
  .pipe(
    scrollbarConfiguration(),
    smoothScrolling()
  )
  .subscribe(() => document.querySelector('.loading-panel').className += ' hidden');
