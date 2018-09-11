import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { anchorSelection, smoothScrolling } from './observable.operators';
import './app.css';
import './nav.css';
import './main.css';

document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((element) => {
  fromEvent(element, 'click')
    .pipe(
      anchorSelection(),
      smoothScrolling()
    ).subscribe(() => {});
});

fromEvent(document.querySelector('.main-container'), 'scroll')
  .pipe(filter(() => document.querySelector('body').clientWidth <= 880))
  .subscribe((e) => {
    document.querySelector('.profile-overview').className = `profile-overview ${e.target.scrollTop > 0 ? 'hidden' : ''}`;
  });

window.onpopstate = () => smoothScrolling();
fromEvent(document, 'DOMContentLoaded')
  .pipe(smoothScrolling())
  .subscribe(() => {});
