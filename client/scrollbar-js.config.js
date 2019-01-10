import {
  tap
} from 'rxjs/operators';
import Scrollbar from 'scrollbar.umd';
import 'scrollbar.css';

// 1. Define custom theme
// Scrollbar.themes.custom = {
// "class" : "custom",
// outside_box : true,
// row_height : 54
// };

// 2. Set default options
// Scrollbar.conf.class = "default";
// Scrollbar.conf.outside_box = true;
// Scrollbar.conf.row_height = 54;

// operators for scrollbar configuration
const scrollbarConfiguration = () => (source) => source.pipe(
  // 3. Start module
  tap(() => Scrollbar.start(true, null, false)),
  // 4. Create scrollbars
  tap(() => Scrollbar.initialize(document.querySelector('.main-container'), true))
);
const refreshScrollbar = () => tap(() => {
  Scrollbar.refresh(document.querySelector('.main-container'))
});

export {
  scrollbarConfiguration,
  refreshScrollbar
};
