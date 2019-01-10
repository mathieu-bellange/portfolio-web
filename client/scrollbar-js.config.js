import { tap } from 'rxjs/operators';
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
  tap(() => Scrollbar.start(false, null, false)),
  // 4. Create scrollbars
  tap(() => document.querySelectorAll("[data-scrollbar]").forEach(element => {
    // A. Set run options
		let options = {
			// "class" : "run",
			// outside_box : true,
			// row_height : 54
		};
		// B. Create elements
		Scrollbar.create(element, options, true);
  }))
);

export default scrollbarConfiguration;
