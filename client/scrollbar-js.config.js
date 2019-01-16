import {
  tap
} from 'rxjs/operators';
import Scrollbar from 'scrollbar-js';
import 'scrollbar-js/src/scrollbar.css';

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
const scrollbarConfiguration = () =>
  // 3. Start module
  tap(() => Scrollbar.start(true, { 'window_bar': true, 'show_horizontal': false }, true)
);

export default scrollbarConfiguration;
