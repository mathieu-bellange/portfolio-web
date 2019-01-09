/*

	scrollbar.js

*/

// =============================================================================
// -----------------------------------------------------------------------------
// # Module
// -----------------------------------------------------------------------------
// =============================================================================

var Scrollbar = {

	version : "beta",

	//////////////////////////////////////////////////////////////////////////////
	// * Themes
	//////////////////////////////////////////////////////////////////////////////

	themes : {
		test : { "class" : "test", "thumb_margin" : 4 },
		flat : { "class" : "flat", "thumb_margin" : 0 },
		slim : { "class" : "slim", "thumb_margin" : 4 },
		aero : { "class" : "aero", "thumb_margin" : 1 }
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Configuration
	//////////////////////////////////////////////////////////////////////////////

	conf : {

		// -------------------------------------------------------------------------
		// * Tag options (not registered as data-attributes)
		// -------------------------------------------------------------------------

		"class" : "flat", // CSS class for both scrollbars (if multiple then use "class1 class2 class3" syntax - no colon, no comma) -- Default : "flat"
		class_vertical : null, // CSS class for vertical scrollbar (if multiple then use "class1 class2 class3" syntax - no colon, no comma) -- Default : null
		class_horizontal : null, // CSS class for horizontal scrollbar (if multiple then use "class1 class2 class3" syntax - no colon, no comma) -- Default : null
		class_wrapper : null, // CSS class for outer wrapper (if multiple then use "class1 class2 class3" syntax - no colon, no comma) -- Default : null
		wrapper : false, // create outer wrapper for container -- Default : false

		// -------------------------------------------------------------------------
		// * Data-attribute options (registered as data-attributes)
		// -------------------------------------------------------------------------

		top_side : false, // display horizontal scrollbar at top of container -- Default : false
		left_side : false, // display vertical scrollbar at left of container -- Default : false
		expand_box : false, // container expanded while content preserved -- Default : false
		outside_box : false, // scrollbar displayed outside of container -- Default : false

		show_grip : true, // thumb grip is shown -- Default : true
		show_track : true, // scrollbar track is shown -- Default : true
		show_buttons : true, // scrollbar buttons are shown -- Default : true
		show_vertical : true, // vertical scrollbar is shown -- Default : true
		show_horizontal : true, // horizontal scrollbar is shown -- Default : true
		hide_unscrollable : true, // scrollbars are hidden if container isn't scrollable -- Default : true

		thumb_margin : 0, // number of pixels left blank between thumb and track -- Default : 0
		thumb_min_length : 6, // minimal length of thumb in pixels -- Default : 6
		thumb_grip_length : 20, // thumb length in pixels required for grip to be shown -- Default : 20

		row_height : 18, // number of pixels scrolled vertically per row scroll (mouse wheel, buttons click and key up/down press) -- Default : 18
		row_width : 27, // number of pixels scrolled horizontally per row scroll (mouse wheel, buttons click and key left/right press) -- Default : 32
		row_wheel : 5, // number of row(s) scrolled per wheel impulse -- Default : 5

		// -------------------------------------------------------------------------
		// * Experimental options *** NOT RECOMMANDED
		// -------------------------------------------------------------------------

		smooth_scrolling : false, // activate browser smooth scrolling -- Default : false

		// -------------------------------------------------------------------------
		// * Global options (cannot be changed using inline markers or script settings ; configuration override only)
		// -------------------------------------------------------------------------

		delay_row : 20, // time interval between two scroll row auto-fires (milliseconds) -- Default : 20
		delay_page : 60, // time interval between two scroll page auto-fires (milliseconds) -- Default : 60
		delay_wheel : 10, // time elapsed before restoring window wheel event (milliseconds) -- Default : 10
		delay_button : 300, // time elapsed before triggering auto-fire when pressing buttons (milliseconds) -- Default : 300
		delay_select : 10, // time interval between two auto-scrolling by selection triggers (milliseconds) -- Default : 10
		delay_resize : 25, // time elapsed between two container resize triggers (milliseconds) -- Default : 25

		select_max : 20, // maximum number of pixels scrolled per auto-scrolling by selection trigger -- Default : 20
		select_bound : 20, // distance in pixels from container edges below which the auto-scrolling by selection will start -- Default : 20
		select_range : 10, // range of pixels at which the number of pixels auto-scrolled by selection is increased -- Default : 10

		snap_at_bounds : true, // scrollbar sticks to edges when track is clicked -- Default : true
		snap_threshold : 10, // number of pixels below which the scrollbar will become sticky -- Default : 10

		reset_at_limits : true, // reset scroll position when cursor moved far away -- Default : true
		reset_threshold : 200, // number of pixels above which the scroll position is reset (either positive or negative) -- Default : 200

		reverse_wheel_y : false, // wheel up vertical scrollbar to the bottom, wheel down to the top -- Default : false
		reverse_wheel_x : false // wheel up horizontal scrollbar to the right, wheel down to the left -- Default : false

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Constants
	//////////////////////////////////////////////////////////////////////////////

	cons : {
		delay_smooth : 5000, // limit for smooth scrolling thumb reset detection (milliseconds) -- Default : 5000
		delay_dblclick : 25, // time elapsed before refreshing scrollbars after double-clicking over bottom right resize box (milliseconds) -- Default : 25
		resize_box_len : 20 // edge length in pixels of bottom right resize square box -- Default : 20
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Variables
	//////////////////////////////////////////////////////////////////////////////

	vars : {
		target : null, // container element
		source : null, // scrollbar elements
		hovered : null, // last hovered container element
		focused : null, // last focused container element
		clicked : null, // last clicked container element (until mouse button released)
		pointed : null, // last clicked container element (until another element clicked)
		container : {
			selecting : false, // selection over container started flag
			width : 0, // resizable container width
			height : 0, // resizable container height
			scroll_top : 0, // last container scroll top
			scroll_left : 0, // last container scroll left
			scroll_top_max : 0, // editable container scroll top max
			scroll_left_max : 0, // editable container scroll left max
			textarea_move_count : null // number of times the mouse has been moved over a textarea container
		},
		smooth : { // smooth scrolling
			on : false, // timer started flag
			out : null, // timeout variable
		},
		timer : {
			stop : false, // timer stopped flag
			out : null, // timeout variable
			val : null // interval variable
		},
		mouse : {
			down : false,
			x : null, // current cursor horizontal coordinate
			y : null // current cursor vertical coordinate
		},
		thumb : {
			down : false,
			x : 0,
			y : 0,
			top : 0, // last thumb top
			left : 0, // last thumb left
			mouse : { x : 0, y : 0 }, // last thumb cursor coordinates
		},
		track : {
			down : false,
			x : 0,
			y : 0
		},
		minus : {
			down : false
		},
		plus : {
			down : false
		}
	},

	//////////////////////////////////////////////////////////////////////////////
	// * To Camel Case
	//////////////////////////////////////////////////////////////////////////////

	// |> Scrollbar.toCamelCase("attraper_souris_verte") => "attraperSourisVerte"

	toCamelCase(s) { // s = string ; returns string
		s = s.split("_");
		s.forEach(function(e, i, a) {
			if (i > 0) a[i] = a[i].substr(0, 1).toUpperCase() + a[i].substr(1, a[i].length - 1);
		});
		s = s.join("")
		return s;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * To Hyphens
	//////////////////////////////////////////////////////////////////////////////

	// |> Scrollbar.toHyphens("attraper_souris_verte") => "attraper-souris-verte"

	toHyphens(s) { // s = string ; returns string
		return s.replace(/_/g, "-");
	},

	//////////////////////////////////////////////////////////////////////////////
	// * To Value
	// ---------------------------------------------------------------------------
	// > Allowed values : string, integer, true, false, null
	// > Disallowed values : function, object, undefined, NaN, Infinity, etc.
	//////////////////////////////////////////////////////////////////////////////

	// |> Scrollbar.toValue("null") => null

	toValue(s) { // s = string ; returns value
		let i = parseInt(s);
		if (!Number.isNaN(i)) s = i; // integer
		else if (s == "false") s = false; // false
		else if (s == "true") s = true; // true
		else if (s == "null") s = null; // false
		else s = s.toString().replace(/\s+/g, " "); // string
		return s;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Parse Inline Options
	// ---------------------------------------------------------------------------
	// > Recognizes alphanumerical, quotes, underscores, hyphens and white space characters
	// > Unquoted strings evaluation
	// > Semi-colon separator
	// > Empty strings failing
	// > Wrong formats failing
	// > Allowed values passed as strings casting (i.e. "true" => true)
	//////////////////////////////////////////////////////////////////////////////

	// |> Scrollbar.parseInlineOptions("'opt-1': \"False\" ; opt_2  :2.125;opt  3  :  UNDEFINED ; opt_4 :: true") => Object { opt_1: false, opt_2: 2, opt_3: "undefined" }

	parseInlineOptions(s) { // s = string ; returns object
		function stripQuotes(q) { return q.replace(/('|\")/g, "") }
		let a = s.split(";"), l = {};
		let n, r, k, v, i;
		for (n in a) {
			r = a[n].trim();
			r.replace(/([^:]+)\s*:\s*(([A-z]|[0-9]|'|\"|_|-| )+)/, "$1, $2");
			k = RegExp.$1.trim().toLowerCase();
			v = RegExp.$2.trim().toLowerCase();
			k = stripQuotes(k).replace(/(\s|-)+/g, "_");
			v = this.toValue(stripQuotes(v));
			if (!(typeof(v) == "string" && v == "")) l[k] = v;
		} return l;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Container
	//////////////////////////////////////////////////////////////////////////////

	isContainer(q) { // q = DOM element ; returns boolean
		return q.hasAttribute("data-scrollbar");
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Scrollbar
	//////////////////////////////////////////////////////////////////////////////

	isScrollbar(q) { // q = DOM element ; returns boolean
		for (let i = 0; i < 4; i++) { // 3 level node depth ; max => thumb child
			if (q != null) {
				if (q.classList.contains("scrollbar")) return true;
				q = q.parentElement;
			} else break;
		} return false;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Scrollable
	//////////////////////////////////////////////////////////////////////////////

	isScrollable(o, b, c) { // o = container element, b = vertical flag, c = check against size flag ; returns boolean
		let c1 = c ? o.scrollHeight > o.clientHeight
		: o.getAttribute("data-scrollable-vertical") == "true" ? true : false;
		let c2 = c ? o.scrollWidth > o.clientWidth
		: o.getAttribute("data-scrollable-horizontal") == "true" ? true : false;
		if (b == true) return c1; // check vertical
		else if (b == false) return c2; // check horizontal
		else return c1 || c2; // check any
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Vertical
	//////////////////////////////////////////////////////////////////////////////

	isVertical(u) { // u = scrollbar elements ; returns boolean
		return u.sb.classList.contains("vertical");
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Horizontal
	//////////////////////////////////////////////////////////////////////////////

	isHorizontal(u) { // u = scrollbar elements ; returns boolean
		return u.sb.classList.contains("horizontal");
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Editable
	//////////////////////////////////////////////////////////////////////////////

	isEditable(o) { // o = container element ; returns boolean
		return o.tagName == "TEXTAREA" || o.getAttribute("contenteditable") == "true";
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Resizable
	//////////////////////////////////////////////////////////////////////////////

	isResizable(o) { // o = container element ; returns boolean
		let a = ["vertical", "horizontal", "both", "block", "inline"];
		return a.includes(o.style.resize) || a.includes(window.getComputedStyle(o).resize);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Is Wrappable
	//////////////////////////////////////////////////////////////////////////////

	isWrappable(o) { // o = container element ; returns boolean
		return o.tagName != "TEXTAREA";
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Inner Wrapper
	//////////////////////////////////////////////////////////////////////////////

	getInnerWrapper(o) { // o = container element ; returns DOM element
		return o.firstElementChild;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Scrollbar
	//////////////////////////////////////////////////////////////////////////////

	getScrollbar(o, b, c) { // o = container element, b = vertical flag, c = check flag ; returns DOM element or boolean
		if (b == null) b = true; // TEMP -- default to vertical
		let u = b ? o.nextElementSibling : o.previousElementSibling;
		let s = b ? "vertical" : "horizontal";
		if (u != null
		 && u.classList.contains("scrollbar")
		 && u.classList.contains(s)) return c ? true : u;
		return c ? false : undefined;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Has Scrollbar
	//////////////////////////////////////////////////////////////////////////////

	hasScrollbar(o, b) { // o = container element, b = vertical flag ; returns boolean
		return this.getScrollbar(o, b, true);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Elements
	//////////////////////////////////////////////////////////////////////////////

	getElements(o, b) { // o = container element, b = vertical flag ; returns object
		let u = this.getScrollbar(o, b);
		return {
			"sb" : u,
			"ms" : u.querySelector(".minus"),
			"ps" : u.querySelector(".plus"),
			"tk" : u.querySelector(".track"),
			"tb" : u.querySelector(".thumb"),
			"gp" : u.querySelector(".grip")
		};
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Option
	//////////////////////////////////////////////////////////////////////////////

	getOption(s, u) { // s = option name (string), u = scrollbar elements ; returns value
		let v = this.conf[s], t;
		if (u != null) {
			let k = "data-" + this.toHyphens(s);
			if (u.sb.hasAttribute(k)) t = this.toValue(u.sb.getAttribute(k));
			if (t !== undefined) v = t;
		} return v;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Option Config
	//////////////////////////////////////////////////////////////////////////////

	getOptionConfig(s, c) { // s = option name (string), c = configuration (object) ; returns value
		let a = c[s];
		let b = this.conf[s];
		return a != null ? a : b != null ? b : null;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Check Buttons (unactive)
	//////////////////////////////////////////////////////////////////////////////

	checkButtons(o, u, b) { // o = container element, u = scrollbar elements, b = vertical flag (optional)
		if (b == null) b = this.isVertical(u); // TEMP -- Default to vertical
		if (this.isScrollable(o, b)) {
			let n = b ? o.scrollTop : o.scrollLeft;
			let min = 0;
			let max = b ? this.getScrollTopMax(o) : this.getScrollLeftMax(o);
			u.ms.classList.remove("unactive");
			u.ps.classList.remove("unactive");
			if (n == min) u.ms.classList.add("unactive");
			else if (n == max) u.ps.classList.add("unactive");
		} else {
			u.ms.classList.add("unactive");
			u.ps.classList.add("unactive");
		}
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Check Container (focusable)
	//////////////////////////////////////////////////////////////////////////////

	checkContainer(o) { // o = container element
		if (!this.isScrollable(o, true) && !this.isScrollable(o, false)) {
			o.removeAttribute("tabindex");
		} else {
			o.setAttribute("tabindex", "0");
		}
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Set Height
	// ---------------------------------------------------------------------------
	// What ? any vertical scrollbar
	// When ? each time content has changed or container is resized
	//////////////////////////////////////////////////////////////////////////////

	setHeight(o, u) { // o = container element, u = scrollbar elements (optional)

		if (u == null) u = this.getElements(o, true);

		// * Retrieve options
		let top = this.getOption("top_side", u);
		let left = this.getOption("left_side", u);
		let outside = this.getOption("outside_box", u);
		let show_grip = this.getOption("show_grip", u);
		let show_track = this.getOption("show_track", u);
		let show_buttons = this.getOption("show_buttons", u);
		let show_vertical = this.getOption("show_vertical", u);
		let show_horizontal = this.getOption("show_horizontal", u);
		let hide_unscrollable = this.getOption("hide_unscrollable", u);
		let thumb_margin = this.getOption("thumb_margin", u);
		let thumb_min_length = this.getOption("thumb_min_length", u);
		let thumb_grip_length = this.getOption("thumb_grip_length", u);

		// * Get container and content heights
		let h1 = o.offsetHeight; // container height
		let h2 = o.scrollHeight; // content height

		// * Get scrollable flag
		let scrollable = this.isScrollable(o, true, true); // container is scrollable

		// * Get buttons height
		let h_ms = this.getComputedHeight(u.ms);
		let h_ps = this.getComputedHeight(u.ps);

		// * Adjust scrollbar base height
		let s = window.getComputedStyle(u.sb);
		h1 -= parseFloat(s.borderBottomWidth) + parseFloat(s.borderTopWidth); // exclude borders
		if (!outside) {
			let n = this.getComputedHeight(this.getElements(o, false).sb);
			if (show_horizontal && !(hide_unscrollable && !this.isScrollable(o, false, true))) h1 -= n;
			if (this.isResizable(o) && !left && (
				top || (hide_unscrollable && !this.isScrollable(o, false, true))
			)) h1 -= n; // keep resize pad visible
		}

		// * Check container height
		if (h1 <= h_ms + h_ps) { // container height is lower or equal to buttons height
			show_buttons = true;
			show_track = false;
		}

		// * Handle track display
		if (show_track) {
			let h3 = h1 - (h_ms + h_ps); // track outer height
			let h4 = Math.max(0, h3 - (2 * thumb_margin)); // track inner height
			if (h4 <= thumb_min_length) { // track inner height is lower or equal to thumb min-height
				if (!show_buttons) show_buttons = true;
				show_track = false;
			}
			if (show_track) {
				if (show_buttons) {
					u.tk.style.top = h_ms + "px";
					u.tk.style.height = h3 + "px";
				} else {
					u.tk.style.top = 0 + "px";
					u.tk.style.height = h1 + "px";
				}
				if (scrollable) {
					u.tb.style.height = Math.min(Math.max(Math.ceil(h4 / (h2 / h1)), thumb_min_length), h4) + "px";
				} else {
					u.tb.style.height = h4 + "px";
				}
				u.tk.style.display = "";
			}
		}

		// * Hide track
		if (!show_track) {
			u.tk.style.display = "none";
		}

		// * Set scrollbar height
		if (show_buttons && !show_track) u.sb.style.height = (h_ms + h_ps) + "px";
		else u.sb.style.height = h1 + "px";

		// * Handle buttons display
		if (show_buttons) {
			if (show_track) u.ps.style.top = "";
			else u.ps.style.top = h_ps + "px";
			u.ms.style.display = "";
			u.ps.style.display = "";
		} else {
			u.ms.style.display = "none";
			u.ps.style.display = "none";
		}

		// * Set scrollbar controllable
		scrollable ? u.sb.classList.remove("disable") : u.sb.classList.add("disable");

		// * Set scrollbar scrollable
		o.dataset.scrollableVertical = scrollable;

		// * Set scrollbar visibility
		u.sb.style.display = show_vertical && (scrollable || !hide_unscrollable) ? "" : "none";

		// * Set grip visibility
		u.gp.style.display = show_grip && u.tb.offsetHeight >= thumb_grip_length ? "" : "none";

		// * Check container
		this.checkContainer(o);

		// * Reset thumb
		this.resetThumbTop(o);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Set Width
	// ---------------------------------------------------------------------------
	// What ? any horizontal scrollbar
	// When ? each time content has changed or container is resized
	//////////////////////////////////////////////////////////////////////////////

	setWidth(o, u) { // o = container element, u = scrollbar elements (optional)

		if (u == null) u = this.getElements(o, false);

		// * Retrieve options
		let top = this.getOption("top_side", u);
		let left = this.getOption("left_side", u);
		let outside = this.getOption("outside_box", u);
		let show_grip = this.getOption("show_grip", u);
		let show_track = this.getOption("show_track", u);
		let show_buttons = this.getOption("show_buttons", u);
		let show_vertical = this.getOption("show_vertical", u);
		let show_horizontal = this.getOption("show_horizontal", u);
		let hide_unscrollable = this.getOption("hide_unscrollable", u);
		let thumb_margin = this.getOption("thumb_margin", u);
		let thumb_min_length = this.getOption("thumb_min_length", u);
		let thumb_grip_length = this.getOption("thumb_grip_length", u);

		// * Get container and content widths
		let w1 = o.offsetWidth; // container width
		let w2 = o.scrollWidth; // content width

		// * Get scrollable flag
		let scrollable = this.isScrollable(o, false, true); // container is scrollable

		// * Get buttons width
		let w_ms = this.getComputedWidth(u.ms);
		let w_ps = this.getComputedWidth(u.ps);

		// * Adjust scrollbar base width
		let s = window.getComputedStyle(u.sb);
		w1 -= parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth); // exclude borders
		if (!outside) {
			let n = this.getComputedWidth(this.getElements(o, true).sb);
			if (show_vertical && !(hide_unscrollable && !this.isScrollable(o, true, true))) w1 -= n;
			if (this.isResizable(o) && !top && (
				left || (hide_unscrollable && !this.isScrollable(o, true, true))
			)) w1 -= n; // keep resize pad visible
		}

		// * Check container width
		if (w1 <= w_ms + w_ps) { // container width is lower or equal to buttons width
			show_buttons = true;
			show_track = false;
		}

		// * Handle track display
		if (show_track) {
			let w3 = w1 - (w_ms + w_ps); // track outer width
			let w4 = Math.max(0, w3 - (2 * thumb_margin)); // track inner width
			if (w4 <= thumb_min_length) { // track inner width is lower or equal to thumb min-width
				if (!show_buttons) show_buttons = true;
				show_track = false;
			}
			if (show_track) {
				if (show_buttons) {
					u.tk.style.left = w_ms + "px";
					u.tk.style.width = w3 + "px";
				} else {
					u.tk.style.left = 0 + "px";
					u.tk.style.width = w1 + "px";
				}
				if (scrollable) {
					u.tb.style.width = Math.min(Math.max(Math.ceil(w4 / (w2 / w1)), thumb_min_length), w4) + "px";
				} else {
					u.tb.style.width = w4 + "px";
				}
				u.tk.style.display = "";
			}
		}

		// * Hide track
		if (!show_track) {
			u.tk.style.display = "none";
		}

		// * Set scrollbar width
		if (show_buttons && !show_track) u.sb.style.width = (w_ms + w_ps) + "px";
		else u.sb.style.width = w1 + "px";

		// * Handle buttons display
		if (show_buttons) {
			if (show_track) u.ps.style.left = "";
			else u.ps.style.left = w_ps + "px";
			u.ms.style.display = "";
			u.ps.style.display = "";
		} else {
			u.ms.style.display = "none";
			u.ps.style.display = "none";
		}

		// * Set scrollbar controllable
		scrollable ? u.sb.classList.remove("disable") : u.sb.classList.add("disable");

		// * Set Set scrollbar scrollable
		o.dataset.scrollableHorizontal = scrollable;

		// * Set scrollbar visibility
		u.sb.style.display = show_horizontal && (scrollable || !hide_unscrollable) ? "" : "none";

		// * Set grip visibility
		u.gp.style.display = show_grip && u.tb.offsetWidth >= thumb_grip_length ? "" : "none";

		// * Check container
		this.checkContainer(o);

		// * Reset thumb
		this.resetThumbLeft(o);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Set Vertical Position
	// ---------------------------------------------------------------------------
	// What ? any vertical scrollbar (unless an outer wrapper is used)
	// When ? each time container is moved (including margin changing)
	//////////////////////////////////////////////////////////////////////////////

	setVerticalPosition(o, u) { // o = container element, u = scrollbar elements (optional)

		if (u == null) u = this.getElements(o, true);

		// * Retrieve options
		let top = this.getOption("top_side", u);
		let left = this.getOption("left_side", u);
		let outside = this.getOption("outside_box", u);
		let show_horizontal = this.getOption("show_horizontal", u);
		let hide_unscrollable = this.getOption("hide_unscrollable", u);

		// * Set scrollbar vertical position
		if (!outside && top && show_horizontal && !(hide_unscrollable && !this.isScrollable(o, false, true))) {
			u.sb.style.top = (this.getComputedHeight(this.getElements(o, false).sb) + o.offsetTop) + "px";
		} else {
			u.sb.style.top = (o.offsetTop) + "px";
		}

		// * Set scrollbar horizontal position
		if (outside) {
			let s = window.getComputedStyle(u.sb);
			if (left) u.sb.style.left = (o.offsetLeft - u.sb.offsetWidth + parseFloat(s.borderLeftWidth)) + "px";
			else u.sb.style.left = (o.offsetLeft + o.offsetWidth - parseFloat(s.borderRightWidth)) + "px";
		} else {
			if (left) u.sb.style.left = (o.offsetLeft) + "px";
			else u.sb.style.left = (o.offsetLeft + o.offsetWidth - u.sb.offsetWidth) + "px";
		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Set Horizontal Position
	// ---------------------------------------------------------------------------
	// What ? any horizontal scrollbar (unless an outer wrapper is used)
	// When ? each time container is moved (including margin changing)
	//////////////////////////////////////////////////////////////////////////////

	setHorizontalPosition(o, u) { // o = container element, u = scrollbar elements (optional)

		if (u == null) u = this.getElements(o, false);

		// * Retrieve options
		let top = this.getOption("top_side", u);
		let left = this.getOption("left_side", u);
		let outside = this.getOption("outside_box", u);
		let show_vertical = this.getOption("show_vertical", u);
		let hide_unscrollable = this.getOption("hide_unscrollable", u);

		// * Set scrollbar horizontal position
		if (!outside && left && show_vertical && !(hide_unscrollable && !this.isScrollable(o, true, true))) {
			u.sb.style.left = (this.getComputedWidth(this.getElements(o, true).sb) + o.offsetLeft) + "px";
		} else {
			u.sb.style.left = (o.offsetLeft) + "px";
		}

		// * Set scrollbar vertical position
		if (outside) {
			let s = window.getComputedStyle(u.sb);
			if (top) u.sb.style.top = (o.offsetTop - u.sb.offsetHeight + parseFloat(s.borderTopWidth)) + "px";
			else u.sb.style.top = (o.offsetTop + o.offsetHeight - parseFloat(s.borderBottomWidth)) + "px";
		} else {
			if (top) u.sb.style.top = (o.offsetTop) + "px";
			else u.sb.style.top = (o.offsetTop + o.offsetHeight - u.sb.offsetHeight) + "px";
		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Refresh
	//////////////////////////////////////////////////////////////////////////////

	refresh(o, b) { // o = container element, b = vertical flag (optional)

		let r = false; if (b == null) { b = true; r = true }

		let u = this.getElements(o, b);

		// * Set scrollbar size
		b ? this.setHeight(o, u) : this.setWidth(o, u);

		// * Set scrollbar position
		b ? this.setVerticalPosition(o, u) : this.setHorizontalPosition(o, u);

		if (r) this.refresh(o, false);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Set Container Height
	//////////////////////////////////////////////////////////////////////////////

	setContainerHeight(o) {

		let u = this.getElements(o, true);

		// * Retrieve options
		let top = this.getOption("top_side", u);
		let left = this.getOption("left_side", u);
		let expand = this.getOption("expand_box", u);
		let outside = this.getOption("outside_box", u);

		// * Get scrollbar width
		let w_sb = parseFloat(window.getComputedStyle(u.sb).width);

		// * Get buttons height
		let h_ms = parseFloat(window.getComputedStyle(u.ms).height);
		let h_ps = parseFloat(window.getComputedStyle(u.ps).height);

		// * Get container computed styles
		let o_s = window.getComputedStyle(o);

		// * Set container minimal height
		if (parseFloat(o_s.minHeight) < h_ms + h_ps) o.style.minHeight = (h_ms + h_ps) + "px";

		// * Mislay container
		if (outside && left) {
			o.style.marginLeft = w_sb + "px";
		}

		// * Shrink container
		if (!expand && outside) {
			o.style.height = (parseFloat(o_s.height) - w_sb) + "px";
		}

		// * Shrink content
		if (!expand && !outside) {
			if (this.isWrappable(o)) {
				if (left) this.getInnerWrapper(o).style.marginLeft = w_sb + "px";
				else this.getInnerWrapper(o).style.marginRight = w_sb + "px";
			} else {
				o.style.width = (parseFloat(o_s.width) - w_sb) + "px";
				if (left) o.style.paddingLeft =  (parseFloat(o_s.paddingLeft) + w_sb) + "px";
				else o.style.paddingRight =  (parseFloat(o_s.paddingRight) + w_sb) + "px";
			}
		}

		// * Expand container
		if (expand && !outside) {
			if (top) o.style.paddingTop = (parseFloat(o_s.paddingTop) + w_sb) + "px";
			else o.style.paddingBottom = (parseFloat(o_s.paddingBottom) + w_sb) + "px";
		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Set Container Width
	//////////////////////////////////////////////////////////////////////////////

	setContainerWidth(o) {

		let u = this.getElements(o, false);

		// * Retrieve options
		let top = this.getOption("top_side", u);
		let left = this.getOption("left_side", u);
		let expand = this.getOption("expand_box", u);
		let outside = this.getOption("outside_box", u);

		// * Get scrollbar height
		let h_sb = parseFloat(window.getComputedStyle(u.sb).height);

		// * Get buttons width
		let w_ms = parseFloat(window.getComputedStyle(u.ms).width);
		let w_ps = parseFloat(window.getComputedStyle(u.ps).width);

		// * Get container computed styles
		let o_s = window.getComputedStyle(o);

		// * Set container minimal width
		if (parseFloat(o_s.minWidth) < w_ms + w_ps) o.style.minWidth = (w_ms + w_ps) + "px";

		// * Mislay container
		if (outside && top) {
			o.style.marginTop = h_sb + "px";
		}

		// * Shrink container
		if (!expand && outside) {
			o.style.width = (parseFloat(o_s.width) - h_sb) + "px";
		}

		// * Shrink content
		if (!expand && !outside) {
			if (this.isWrappable(o)) {
				if (top) this.getInnerWrapper(o).style.marginTop = h_sb + "px";
				else this.getInnerWrapper(o).style.marginBottom = h_sb + "px";
			} else {
				o.style.height = (parseFloat(o_s.height) - h_sb) + "px";
				if (top) o.style.paddingTop = (parseFloat(o_s.paddingTop) + h_sb) + "px";
				else o.style.paddingBottom = (parseFloat(o_s.paddingBottom) + h_sb) + "px";
			}
		}

		// * Expand container
		if (expand && !outside) {
			if (left) o.style.paddingLeft = (parseFloat(o_s.paddingLeft) + h_sb) + "px";
			else o.style.paddingRight = (parseFloat(o_s.paddingRight) + h_sb) + "px";
		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Initialize Container
	//////////////////////////////////////////////////////////////////////////////

	initializeContainer(o, s) { // s = smooth scrolling flag (boolean)

		// * Set size
		this.setContainerHeight(o);
		this.setContainerWidth(o);

		// -------------------------------------------------------------------------
		// * Raw scrolling
		// -------------------------------------------------------------------------

		if (!s) {

			// * Extend scrollTo() built-in method
			o.scrollTo = function(x, y) {
				Element.prototype.scrollTo.call(this, x, y);
				Scrollbar.resetThumb(this);
			};

			// * Extend scrollBy() built-in method
			o.scrollBy = function(x, y) {
				Element.prototype.scrollBy.call(this, x, y);
				Scrollbar.resetThumb(this);
			};

		}

		// -------------------------------------------------------------------------
		// * Smooth scrolling *** NOT RECOMMANDED (experimental)
		// -------------------------------------------------------------------------

		// |> document.getElementById("container").scrollTo({left: 0, top: 0, behavior: "smooth"})

		else {

			// console.warn("Scrollbar.js -> smooth scrolling enabled (experimental)"); // DEBUG

			let Sb = Scrollbar;

			function startSmoothScrolling(opts) { // s = ScrollToOptions (object)
				clearTimeout(Sb.vars.smooth.out);
				if (opts.behavior == "smooth") {
					Sb.vars.smooth.on = true;
					Sb.vars.smooth.out = setTimeout(function() { Sb.vars.smooth.on = false }, Sb.cons.delay_smooth);
				} else {
					Sb.resetThumb(this);
				}
			}

			// * Extend scrollTo() built-in method
			o.scrollTo = function(q, y) {
				if (arguments.length == 1) { // only one paramter
					Element.prototype.scrollTo.call(this, q); // scroll options
					startSmoothScrolling(q);
				} else { // more than one parameter
					Element.prototype.scrollTo.call(this, q, y); // x-coordinate, y-coordinate
					Sb.resetThumb(this);
				}
			};

			// * Extend scrollBy() built-in method
			o.scrollBy = function(q, y) {
				if (arguments.length == 1) { // only one paramter
					Element.prototype.scrollBy.call(this, q); // scroll options
					startSmoothScrolling(q);
				} else { // more than one parameter
					Element.prototype.scrollBy.call(this, q, y); // x-coordinate, y-coordinate
					Sb.resetThumb(this);
				}
			};

			// * Add scroll event listener
			o.addEventListener("scroll", function() {
				if (Sb.vars.smooth.on == true) Sb.resetThumb(this);
			});

		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Initialize Scrollbar
	//////////////////////////////////////////////////////////////////////////////

	initializeScrollbar(o, b) { // o = container element, b = vertical flag (optional)

		let r = false; if (b == null) { b = true; r = true }

		let u = this.getElements(o, b);

		// * Reset scroll top
		b ? o.scrollTop = 0 : o.scrollLeft = 0;

		// * Set thumb initial position
		let m = this.getOption("thumb_margin", u);
		b ? u.tb.style.top = m  + "px" : u.tb.style.left = m + "px";

		// * Refresh scrollbar
		this.refresh(o, b);

		// * Attach scrollbar events
		this.attachScrollbarEvents(o, u);

		if (r) this.initializeScrollbar(o, false);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Initialize
	//////////////////////////////////////////////////////////////////////////////

	initialize(o, s) { // o = container element, s = smooth scrolling flag (boolean)
		this.initializeContainer(o, s);
		this.initializeScrollbar(o);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Create Elements
	//////////////////////////////////////////////////////////////////////////////

	createElements() { // returns scrollbar elements

		// * Create elements
		let u = {
			sb : document.createElement("div"),
			ms : document.createElement("div"),
			ps : document.createElement("div"),
			tk : document.createElement("div"),
			tb : document.createElement("div"),
			gp : document.createElement("div")
		};

		// * Set elements class
		u.sb.setAttribute("class", "scrollbar");
		u.ms.setAttribute("class", "minus");
		u.ps.setAttribute("class", "plus");
		u.tk.setAttribute("class", "track");
		u.tb.setAttribute("class", "thumb");
		u.gp.setAttribute("class", "grip");

		// * Hide scrollbar
		u.sb.style.display = "none";

		// * Insert elements
		u.sb.appendChild(u.ms);
		u.sb.appendChild(u.tk);
		u.tk.appendChild(u.tb);
		u.tb.appendChild(u.gp);
		u.sb.appendChild(u.ps);

		// * Return elements
		return u;

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Create
	//////////////////////////////////////////////////////////////////////////////

	create(o, c, i) { // o = container element, c = configuration (optional), i = initialize flag (optional)

		let s, l, k;

		// * Set initialize flag
		if (i == null) i = true;

		// * Get local options
		if (c == null || typeof(c) != "object" || Array.isArray(c)) c = {};

		// * Get inline options
		s = o.getAttribute("data-scrollbar");
		if (s.length > 0) {
			l = this.parseInlineOptions(s);
			if (Object.keys(l).length > 0) Object.assign(c, l);
		}

		// * Get theme
		if (c.theme != null) {
			let t = this.themes[c.theme];
			if (Object.keys(l).length > 0) {
				let c1 = c.class != null;
				let c2 = t.class != null;
				let cc = c1 && c2 ? t.class + " " + c.class : c1 ? c.class : t.class;
				Object.assign(c, t);
				c.class = cc;
				delete c.theme;
			}
		}

		// * Create scrollbars elements
		let u_v = this.createElements();
		let u_h = this.createElements();

		// * Set scrollbars classes
		let t_v = u_v.sb.getAttribute("class");
		let t_h = u_h.sb.getAttribute("class");
		let c_v = this.getOptionConfig("class_vertical", c);
		let c_h = this.getOptionConfig("class_horizontal", c);
		let s_v = this.getOptionConfig("class", c);
		let s_h = this.getOptionConfig("class", c);
		s_v = typeof(s_v) == "string" ? t_v + " " + s_v : t_v;
		s_h = typeof(s_h) == "string" ? t_h + " " + s_h : t_h;
		if (c_v != null) s_v += " " + c_v;
		if (c_h != null) s_h += " " + c_h;
		u_v.sb.setAttribute("class", "vertical " + s_v);
		u_h.sb.setAttribute("class", "horizontal " + s_h);

		// * Register inline options
		for (k in c) {
			if (this.conf.hasOwnProperty(k) && c[k] != this.conf[k]) { // WARNING : required duplication (different options for either vertical or horizontal)
				if (k == "class"
				 || k == "class_vertical"
				 || k == "class_horizontal"
				 || k == "class_wrapper"
				 || k == "wrapper") continue; // not registered
				else {
					let s = this.toCamelCase(k);
					u_v.sb.dataset[s] = c[k];
					u_h.sb.dataset[s] = c[k];
				}
			}
		}

		// * Get unregistered variables
		let wrapper = c.wrapper === true || (this.conf.wrapper && c.wrapper !== false);
		let smooth_scrolling = c.smooth_scrolling === true || (this.conf.smooth_scrolling && c.smooth_scrolling !== false)

		// -------------------------------------------------------------------------
		// * DEBUG
		// -------------------------------------------------------------------------
		// for (k in this.conf) if (!c.hasOwnProperty(k)) c[k] = this.conf[k];
		// console.log(c); // DEBUG
		// -------------------------------------------------------------------------

		// * Wrap container (outer wrapper)
		if (wrapper) {
			o.dataset.outerWrapper = true;
			let q = document.createElement("div");
			let s = window.getComputedStyle(o);
			let s_w = this.getOptionConfig("class_wrapper", c);
			if (s_w != null) q.setAttribute("class", s_w);
			q.style.position = s.position == "static" ? "relative" : s.position; // force at least relative
			q.style.top = s.top;
			q.style.left = s.left;
			q.style.right = s.right;
			q.style.bottom = s.bottom;
			q.style.marginTop = s.marginTop;
			q.style.marginLeft = s.marginLeft;
			q.style.marginRight = s.marginRight;
			q.style.marginBottom = s.marginBottom;
			o.style.top = o.style.left = o.style.right = o.style.bottom = 0; // reset position
			o.style.margin = 0; // reset margin
			o.insertAdjacentElement("beforebegin", q);
			q.appendChild(o);
		}

		// * Wrap content (inner wrapper)
		if (this.isWrappable(o)) o.innerHTML = "<div>" + o.innerHTML + "</div>";

		// * Insert scrollbars
		o.insertAdjacentElement("afterend", u_v.sb);
		o.insertAdjacentElement("beforebegin", u_h.sb);

		// * Set content overflowing
		o.style.overflow = "hidden";

		// * Initialize container and scrollbars
		if (i) this.initialize(o, smooth_scrolling);

		// * Attach container events
		this.attachContainerEvents(o);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Remove
	//////////////////////////////////////////////////////////////////////////////

	remove(o, b) { // o = container element, b = vertical flag (optional)

		let r = false; if (b == null) { b = true; r = true }

		let u = this.getElements(o, b);

		if ((b == true && !this.hasScrollbar(o, false)) // has removed vertical and not has horizontal
		 || (b == false && !this.hasScrollbar(o, true))) { // has removed horizontal and not has vertical

			// * Detach container events
			this.detachContainerEvents(o);

			// * Set container unfocusable
			o.removeAttribute("tabindex");

			// * Reset container content overflowing
			o.style.overflow = "";

			// * Unwrap content (inner wrapper)
			o.innerHTML = o.firstElementChild.innerHTML;

			// * Unwrap container (outer wrapper)
			if (o.hasAttribute("data-outer-wrapper")) {
				if (o.getAttribute("data-outer-wrapper") == "true") {
					let q = o.parentElement;
					let s = window.getComputedStyle(q);
					o.style.top = s.top;
					o.style.left = s.left;
					o.style.right = s.right;
					o.style.bottom = s.bottom;
					o.style.marginTop = s.marginTop;
					o.style.marginLeft = s.marginLeft;
					o.style.marginRight = s.marginRight;
					o.style.marginBottom = s.marginBottom;
					q.insertAdjacentElement("beforebegin", o);
					q.parentElement.removeChild(q);
				}
				o.removeAttribute("data-outer-wrapper");
			}

		}

		// * Unset scrollbar scrollable
		b ? o.removeAttribute("data-scrollable-vertical") : o.removeAttribute("data-scrollable-horizontal");

		// * Reset container minimal size
		b ? o.style.minHeight = "" : o.style.minWidth = "";

		// * Remove scrollbar
		u.sb.parentElement.removeChild(u.sb);

		if (r) this.remove(o, false);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Computed Height
	//////////////////////////////////////////////////////////////////////////////

	getComputedHeight(q) { // q = DOM element, b = real height flag
		let l = window.getComputedStyle(q);
		return parseFloat(l.height) + parseFloat(l.borderTopWidth) + parseFloat(l.borderBottomWidth);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Computed Width
	//////////////////////////////////////////////////////////////////////////////

	getComputedWidth(q) { // q = DOM element
		let l = window.getComputedStyle(q);
		return parseFloat(l.width) + parseFloat(l.borderLeftWidth) + parseFloat(l.borderRightWidth);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Track Inner Height
	//////////////////////////////////////////////////////////////////////////////

	getTrackInnerHeight(u) { // u = scrollbar elements ; returns number (pixel)
		return Math.max(0, u.tk.offsetHeight - (2 * this.getOption("thumb_margin", u)));
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Track Inner Width
	//////////////////////////////////////////////////////////////////////////////

	getTrackInnerWidth(u) { // u = scrollbar elements ; returns number (pixel)
		return Math.max(0, u.tk.offsetWidth - (2 * this.getOption("thumb_margin", u)));
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Track Rail Height
	//////////////////////////////////////////////////////////////////////////////

	getTrackRailHeight(u) { // u = scrollbar elements ; returns number (pixel)
		return Math.max(0, this.getTrackInnerHeight(u) - u.tb.offsetHeight);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Track Rail Width
	//////////////////////////////////////////////////////////////////////////////

	getTrackRailWidth(u) { // u = scrollbar elements ; returns number (pixel)
		return Math.max(0, this.getTrackInnerWidth(u) - u.tb.offsetWidth);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Scroll Top Max
	//////////////////////////////////////////////////////////////////////////////

	getScrollTopMax(o) { // o = container element ; returns number (pixel)
		let l = window.getComputedStyle(o);
		let n = parseFloat(l.borderTopWidth) + parseFloat(l.borderBottomWidth);
		return o.scrollHeight + n - o.offsetHeight;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Scroll Left Max
	//////////////////////////////////////////////////////////////////////////////

	getScrollLeftMax(o) { // o = container element ; returns number (pixel)
		let l = window.getComputedStyle(o);
		let n = parseFloat(l.borderLeftWidth) + parseFloat(l.borderRightWidth);
		return o.scrollWidth + n - o.offsetWidth;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Height Ratio
	//////////////////////////////////////////////////////////////////////////////

	getHeightRatio(o, u) { // o = container element, u = scrollbar elements ; returns number (factor)
		let n = this.getTrackRailHeight(u);
		return this.getScrollTopMax(o) / (n == 0 ? 1 : n);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Width Ratio
	//////////////////////////////////////////////////////////////////////////////

	getWidthRatio(o, u) { // o = container element, u = scrollbar elements ; returns number (factor)
		let n = this.getTrackRailWidth(u);
		return this.getScrollLeftMax(o) / (n == 0 ? 1 : n);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Thumb Base Top
	//////////////////////////////////////////////////////////////////////////////

	getThumbBaseTop(u) { // u = scrollbar elements ; returns number (pixel)
		let m = this.getOption("thumb_margin", u);
		return u.sb.offsetTop + u.tk.offsetTop + m;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Thumb Base Left
	//////////////////////////////////////////////////////////////////////////////

	getThumbBaseLeft(u) { // u = scrollbar elements ; returns number (pixel)
		let m = this.getOption("thumb_margin", u);
		return u.sb.offsetLeft + u.tk.offsetLeft + m;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Thumb Top
	//////////////////////////////////////////////////////////////////////////////

	getThumbTop(u) { // u = scrollbar elements ; returns number (pixel)
		return u.tb.offsetTop;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Get Thumb Left
	//////////////////////////////////////////////////////////////////////////////

	getThumbLeft(u) { // u = scrollbar elements ; returns number (pixel)
		return u.tb.offsetLeft;
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Clamp Thumb Top
	//////////////////////////////////////////////////////////////////////////////

	clampThumbTop(u, n) { // u = scrollbar elements, n = number (pixel) ; returns number (pixel)
		let m = this.getOption("thumb_margin", u);
		return Math.floor(Math.min(Math.max(n, m), this.getTrackRailHeight(u) + m));
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Clamp Thumb Left
	//////////////////////////////////////////////////////////////////////////////

	clampThumbLeft(u, n) { // u = scrollbar elements, n = number (pixel) ; returns number (pixel)
		let m = this.getOption("thumb_margin", u);
		return Math.floor(Math.min(Math.max(n, m), this.getTrackRailWidth(u) + m));
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Reset Thumb
	//////////////////////////////////////////////////////////////////////////////

	resetThumb(o, b) { // o = container element, b = vertical flag

		let m, n, u;
		let v = b == null || b == true;
		let h = b == null || b == false;

		// * Adjust scroll left and top (content editable only)
		if (o.getAttribute("contenteditable") == "true") {
			let s = window.getComputedStyle(o);
			if (v && o.scrollLeft <= parseFloat(s.paddingLeft)) o.scrollLeft = 0;
			if (h && o.scrollTop <= parseFloat(s.paddingTop)) o.scrollTop = 0;
		}

		// * Set thumb vertical position
		if (v && this.isScrollable(o, false)) {
			u = this.getElements(o, false); // horizontal scrollbar
			m = this.getOption("thumb_margin", u);
			n = Math.round(o.scrollLeft / this.getWidthRatio(o, u));
			u.tb.style.left = this.clampThumbLeft(u, m + n) + "px";
			this.checkButtons(o, u);
		}

		// * Set thumb horizontal position
		if (h && this.isScrollable(o, true)) {
			u = this.getElements(o, true); // vertical scrollbar
			m = this.getOption("thumb_margin", u);
			n = Math.round(o.scrollTop / this.getHeightRatio(o, u));
			u.tb.style.top = this.clampThumbTop(u, m + n) + "px";
			this.checkButtons(o, u);
		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Reset Thumb Top
	//////////////////////////////////////////////////////////////////////////////

	resetThumbTop(o) { // o = container element
		this.resetThumb(o, false, true);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Reset Thumb Left
	//////////////////////////////////////////////////////////////////////////////

	resetThumbLeft(o) { // o = container element
		this.resetThumb(o, true, false);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Scroll Of
	//////////////////////////////////////////////////////////////////////////////

	scrollOf(o, u, n, d, s) { // o = container element, u = scrollbar elements, n = scroll value (pixel), d = snap at bounds direction (integer), s = no smooth flag (boolean)

		let b = this.isVertical(u);

		let min = 0;
		let max = b ? this.getScrollTopMax(o) : this.getScrollLeftMax(o);

		if (n < 0) n = Math.max((b ? o.scrollTop : o.scrollLeft) + n, min);
		else if (n > 0) n = Math.min((b ? o.scrollTop : o.scrollLeft) + n, max);

		let m = this.getOption("thumb_margin", u);
		let v = b ? this.clampThumbTop(u, Math.round(n / this.getHeightRatio(o, u)) + m)
		: this.clampThumbLeft(u, Math.round(n / this.getWidthRatio(o, u)) + m);

		// * Snap at bounds
		if (d != null && d != 0) {
			let lim = this.conf.snap_threshold;
			let tb_min = m;
			let tb_max = (b ? this.getTrackRailHeight(u) : this.getTrackRailWidth(u)) + m;
			if (d == -1 && v > tb_min && v < lim) { v = tb_min; n = min }
			if (d == 1 && v < tb_max && v > tb_max - lim) { v = tb_max; n = max }
		}

		// * Scroll container
		if (this.getOption("smooth_scrolling", u) && !s) { // smooth scrolling activated and triggered
			b ? o.scrollTo({top: n, behavior: "smooth"}) : o.scrollTo({left: n, behavior: "smooth"});
		} else {
			b ? u.tb.style.top = v + "px" : u.tb.style.left = v + "px";
			b ? o.scrollTop = n : o.scrollLeft = n;
		}

		// * Check buttons
		this.checkButtons(o, u);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Scroll By Pixel
	//////////////////////////////////////////////////////////////////////////////

	scrollByPixel(z) { // z = mouse x or y coordinate (pixel)

		let o = this.vars.target;
		let u = this.vars.source;

		let b = this.isVertical(u);

		let v1 = b ? this.getThumbTop(u) : this.getThumbLeft(u);
		let v2 = b ? this.clampThumbTop(u, z - this.getThumbBaseTop(u) - this.vars.thumb.y)
		: this.clampThumbLeft(u, z - this.getThumbBaseLeft(u) - this.vars.thumb.x);

		if (v2 - v1 != 0) {

			// * Move thumb
			b ? u.tb.style.top = v2 + "px" : u.tb.style.left = v2 + "px";

			// * Scroll container
			let h = b ? this.getTrackRailHeight(u) : this.getTrackRailWidth(u);
			let v = h - (h - v2) - this.getOption("thumb_margin", u);
			let n = Math.round(v * (b ? this.getHeightRatio(o, u) : this.getWidthRatio(o, u)));
			b ? o.scrollTop = n : o.scrollLeft = n;

		}

		// * Check buttons
		this.checkButtons(o, u);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Scroll By Row
	//////////////////////////////////////////////////////////////////////////////

	scrollByRow(o, u, n, s) { // o = container element, u = scrollbar elements, n = number of rows (integer), s = no smooth flag (boolean)

		if (this.vars.timer.stop) return;

		let k = this.isVertical(u) ? "height" : "width";

		n = Math.round(n * this.getOption("row_" + k, u));

		this.scrollOf(o, u, n, null, s);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Scroll By Page
	//////////////////////////////////////////////////////////////////////////////

	scrollByPage(o, u, f) { // o = container element, u = scrollbar elements, f = half-page flag (boolean)

		if (this.vars.timer.stop) return;

		let b = this.isVertical(u);

		let r = u.tb.getBoundingClientRect();
		let n = (b ? o.offsetHeight : o.offsetWidth) / (f ? 2 : 1); // half-page
		let z = b ? this.vars.track.y : this.vars.track.x;
		let d = z < (b ? r.top : r.left) ? -1 : z > (b ? r.bottom : r.right) ? 1 : 0;

		if (d != 0) this.scrollOf(o, u, n * d, this.conf.snap_at_bounds ? d : null);

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Event Handlers
	//////////////////////////////////////////////////////////////////////////////

	evts : {

		// -------------------------------------------------------------------------
		// * Mouse Events
		// -------------------------------------------------------------------------

		enterContainer(e) { // e = mouse event
			let Sb = Scrollbar;
			let o = e.target;
			Sb.vars.hovered = o;
			if (Sb.isResizable(o)) {
				Sb.vars.container.height = o.offsetHeight;
				Sb.vars.container.width = o.offsetWidth;
			}
		},

		leaveContainer() {
			Scrollbar.vars.hovered = null;
		},

		focusContainer() {
			let Sb = Scrollbar;
			Sb.vars.pointed = this;
			Sb.vars.focused = this;
		},

		blurContainer(e) { // e = blur event
			let Sb = Scrollbar;
			Sb.vars.focused = null;
			let q = e.relatedTarget;
			if (q != null
			 && !Sb.isContainer(q)
			 && !Sb.isScrollbar(q)) Sb.vars.pointed = null;
			if (Sb.isEditable(this)) {
				Sb.vars.container.scroll_top = 0;
				Sb.vars.container.scroll_left = 0;
				Sb.vars.container.scroll_top_max = 0;
				Sb.vars.container.scroll_left_max = 0;
			}
		},

		dblClickContainer(e) { // e = mouse event
			let Sb = Scrollbar;
			if (Sb.isResizable(this) && e.target == this) {
				let o = this;
				let r = o.getBoundingClientRect();
				let len = Sb.cons.resize_box_len;
				let lt = r.left + r.width - len;
				let rt = r.left + r.width;
				let tp = r.top + r.height - len;
				let bm = r.top + r.height;
				let x = e.clientX;
				let y = e.clientY;
				if (x >= lt && x <= rt && y >= tp && y <= bm) {
					setTimeout(function() { Sb.refresh(o) }, Sb.cons.delay_dblclick);
				}
			}
		},

		preventWindowWheel() {
			window.onwheel = function() { return false };
			setTimeout(function() { window.onwheel = null }, Scrollbar.conf.delay_wheel);
		},

		wheelOverElement(e, o, u) { // e = wheel event, o = container element, u = scrollbar elements
			let Sb = Scrollbar;
			if (o == null) o = Sb.vars.hovered;
			if (o != null) {
				let b = true; // vertical
				if (e.shiftKey) b = false; // horizontal
				if (u == null) u = Sb.getElements(o, b);
				if (Sb.isScrollable(o, b)) {
					Sb.evts.preventWindowWheel();
					let d = e.deltaY > 0 ? 1 : -1;
					if ((b && Sb.getOption("reverse_wheel_y", u))
					 || (!b && Sb.getOption("reverse_wheel_x", u))) d *= -1;
					let n = Sb.getOption("row_wheel", u) * d;
					Sb.scrollByRow(o, u, n, true); // no smooth
				}
			}
		},

		startSelection() {
			let Sb = Scrollbar;
			let o = Sb.vars.focused;
			if (o != null) {
				if (Sb.isScrollable(o)) {
					let u_v = Sb.getElements(o, true);
					let u_h = Sb.getElements(o, false);
					Sb.vars.container.selecting = true;
					Sb.vars.timer.val = setInterval(function() {
						if (Sb.vars.container.selecting
						 && Sb.vars.mouse.y != null
						 && Sb.vars.mouse.x != null) {
							let len = Sb.conf.select_bound;
							let r = o.getBoundingClientRect();
							if (Sb.isScrollable(o, true)) { // vertical
								let min = r.top + len;
								let max = r.top + r.height - len;
								if (Sb.vars.mouse.y < min) {
									let m = Math.round((min - Sb.vars.mouse.y) / Sb.conf.select_range);
									let n = Math.min(Sb.conf.select_max - 1, m) + 1;
									Sb.scrollByRow(o, u_v, -n / Sb.getOption("row_height", u_v), true); // no smooth
								} else if (Sb.vars.mouse.y > max) {
									let m = Math.round((Sb.vars.mouse.y - max) / Sb.conf.select_range);
									let n = Math.min(Sb.conf.select_max - 1, m) + 1;
									Sb.scrollByRow(o, u_v, n / Sb.getOption("row_height", u_v), true); // no smooth
								}
							}
							if (Sb.isScrollable(o, false)) { // horizontal
								let min = r.left + len;
								let max = r.left + r.width - len;
								if (Sb.vars.mouse.x < min) {
									let m = Math.round((min - Sb.vars.mouse.x) / Sb.conf.select_range);
									let n = Math.min(Sb.conf.select_max - 1, m) + 1;
									Sb.scrollByRow(o, u_h, -n / Sb.getOption("row_width", u_h), true); // no smooth
								} else if (Sb.vars.mouse.x > max) {
									let m = Math.round((Sb.vars.mouse.x - max) / Sb.conf.select_range);
									let n = Math.min(Sb.conf.select_max - 1, m) + 1;
									Sb.scrollByRow(o, u_h, n / Sb.getOption("row_width", u_h), true); // no smooth
								}
							}
						}
					}, Sb.conf.delay_select);
				}
			}
		},

		endSelection() {
			let Sb = Scrollbar;
			Sb.vars.mouse.x = null;
			Sb.vars.mouse.y = null;
			Sb.vars.container.selecting = false;
		},

		mouseDownOverTextarea() {
			Scrollbar.vars.container.textarea_move = 0;
		},

		// -------------------------------------------------------------------------
		// * Drag Events
		// -------------------------------------------------------------------------

		dragOverContainer() {
			Scrollbar.refresh(this);
		},

		dropOverContainer() {
			Scrollbar.refresh(this);
		},

		// -------------------------------------------------------------------------
		// * Keyboard Events
		// -------------------------------------------------------------------------

		pressKeyOnContainer(e) { // e = key event
			let Sb = Scrollbar;
			if (Sb.isEditable(this)) {
				// * Reset Thumb Position
				let scroll_top = this.scrollTop;
				let scroll_left = this.scrollLeft;
				if (scroll_top != Sb.vars.container.scroll_top) Sb.resetThumbTop(this);
				if (scroll_left != Sb.vars.container.scroll_left) Sb.resetThumbLeft(this);
				Sb.vars.container.scroll_top = scroll_top;
				Sb.vars.container.scroll_left = scroll_left;
				// * Reset Scrollbar Position
				if (!(e.altKey || e.ctrlKey || e.shiftKey)) {
					let scroll_top_max = Sb.getScrollTopMax(this);
					let scroll_left_max = Sb.getScrollLeftMax(this);
					if (scroll_top_max != Sb.vars.container.scroll_top_max
					 || scroll_left_max != Sb.vars.container.scroll_left_max) Sb.refresh(this);
					Sb.vars.container.scroll_top_max = scroll_top_max;
					Sb.vars.container.scroll_left_max = scroll_left_max;
				}
			}
		}

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Attach Document Events
	//////////////////////////////////////////////////////////////////////////////

	attachDocumentEvents() {

		// -------------------------------------------------------------------------
		// * Variables
		// -------------------------------------------------------------------------

		let Sb = this;

		// -------------------------------------------------------------------------
		// * Functions
		// -------------------------------------------------------------------------

		function endThumbSlide() {
			Sb.vars.target = null;
			Sb.vars.source = null;
			Sb.vars.container.scroll_top = 0;
			Sb.vars.container.scroll_left = 0;
			Sb.vars.thumb.y = 0;
			Sb.vars.thumb.x = 0;
			Sb.vars.thumb.top = 0;
			Sb.vars.thumb.left = 0;
			Sb.vars.thumb.mouse.x = 0;
			Sb.vars.thumb.mouse.y = 0;
			Sb.vars.thumb.down = false;
		}

		// -------------------------------------------------------------------------
		// * Mouse Events
		// -------------------------------------------------------------------------

		document.addEventListener("mousedown", function(e) {
			Sb.vars.mouse.down = true;
			if (!Sb.isContainer(e.target)
			 && !Sb.isScrollbar(e.target)) Sb.vars.pointed = null;
			else if (Sb.vars.hovered != null) Sb.vars.clicked = Sb.vars.hovered;
			else if (Sb.vars.focused != null && Sb.isScrollbar(e.target)) e.preventDefault(); // prevent container blur
		});

		document.addEventListener("mouseup", function() {
			if (Sb.vars.source != null) {
				Sb.vars.source.tk.classList.remove("active");
				Sb.vars.source.tb.classList.remove("active");
				Sb.vars.source.gp.classList.remove("active");
				Sb.vars.source.ms.classList.remove("active");
				Sb.vars.source.ps.classList.remove("active");
			}
			Sb.vars.mouse.down = false;
			Sb.vars.container.textarea_move = null;
			Sb.evts.endSelection();
			endThumbSlide();
			Sb.vars.clicked = null;
			Sb.vars.track.y = 0;
			Sb.vars.track.x = 0;
			Sb.vars.track.down = false;
			Sb.vars.minus.down = false;
			Sb.vars.plus.down = false;
			Sb.vars.timer.stop = false;
			clearTimeout(Sb.vars.timer.out);
			clearInterval(Sb.vars.timer.val);
		});

		document.addEventListener("mousemove", function(e) {
			// * Selection scroll
			if (Sb.vars.container.selecting) {
				Sb.vars.mouse.x = e.clientX;
				Sb.vars.mouse.y = e.clientY;
			}
			// * Thumb scroll
			else if (Sb.vars.thumb.down) {
				let u = Sb.vars.source;
				let n = Sb.conf.reset_threshold;
				if (Sb.isVertical(u)) {
					let x = Sb.vars.thumb.mouse.x;
					if (e.clientX > x - n && e.clientX < x + n) {
						Sb.scrollByPixel(e.clientY);
					} else {
						Sb.vars.target.scrollTop = Sb.vars.container.scroll_top;
						Sb.vars.source.tb.style.top = Sb.vars.thumb.top + "px";
						Sb.checkButtons(Sb.vars.target, Sb.vars.source);
					}
				} else {
					let y = Sb.vars.thumb.mouse.y;
					if (e.clientY > y - n && e.clientY < y + n) {
						Sb.scrollByPixel(e.clientX);
					} else {
						Sb.vars.target.scrollLeft = Sb.vars.container.scroll_left;
						Sb.vars.source.tb.style.left = Sb.vars.thumb.left + "px";
						Sb.checkButtons(Sb.vars.target, Sb.vars.source);
					}
				}
			}
			// * Track scroll
			else if (Sb.vars.track.down) {
				let u = Sb.vars.source;
				if (Sb.isVertical(u)) Sb.vars.track.y = e.clientY;
				else Sb.vars.track.x = e.clientX;
			}
			// * Resize container
			else if (Sb.vars.mouse.down && Sb.vars.clicked != null && Sb.isResizable(Sb.vars.clicked)) {
				let o = Sb.vars.clicked;
				Sb.vars.timer.out = setTimeout(function() {
					if (o.offsetHeight != Sb.vars.container.height
					 || o.offsetWidth != Sb.vars.container.width) {
						if (Sb.vars.container.selecting) Sb.evts.endSelection();
						Sb.refresh(o);
					}
					Sb.vars.container.height = o.offsetHeight;
					Sb.vars.container.width = o.offsetWidth;
				}, Sb.conf.delay_resize)
			}
			// * Selection scroll (textarea)
			if (!Sb.vars.container.selecting && Sb.vars.container.textarea_move != null) {
				Sb.vars.container.textarea_move++;
				if (Sb.vars.container.textarea_move == 4) Sb.evts.startSelection(); // TEMP -- arbitrary value
			}
		});

		// -------------------------------------------------------------------------
		// * Touch Events
		// -------------------------------------------------------------------------

		document.addEventListener("touchend", function() {
			endThumbSlide();
		});

		document.addEventListener("touchmove", function(e) {
			if (Sb.vars.thumb.down) {
				Sb.scrollByPixel(e.targetTouches[0][Sb.isVertical(Sb.vars.source) ? "clientY" : "clientX"]);
			}
		});

		// -------------------------------------------------------------------------
		// * Keyboard Events
		// -------------------------------------------------------------------------

		/**
			| NOT EDITABLE <<< A   ||   B >>> EDITABLE
			| Space            p+  ||   *
			| Shift + Space    p-  ||   *
			| Page Up          p-  ||   p-
			| Page Down        p+  ||   p+
			| End              0   ||   *
			| Ctrl + End       ^   ||   0
			| Home             1   ||   *
			| Ctrl + Home      ^   ||   1
			| Key Up           v-  ||   *
			| Ctrl + Key Up    0   ||   *
			| Key Down         v+  ||   *
			| Ctrl + Key Down  1   ||   *
			| Key Left         h-  ||   *
			| Key Right        h+  ||   *
		*/

		document.addEventListener("keydown", function(e) {
			if (Sb.vars.focused != null || Sb.vars.pointed != null) {
				let o = Sb.vars.focused == null ? Sb.vars.pointed : Sb.vars.focused;
				let b = true; // keystroke flag
				let k = e.which; // current key
				let e1 = e.ctrlKey && (k == 35 || k == 36); // Ctrl AND End or Home
				let e2 = !e.shiftKey && (k == 33 || k == 34); // NOT Shift AND Page Up or Page Down
				if (e.shiftKey && (k < 32 || k > 36)) return; // Shift AND NOT Space, Page Up, Page Down, End or Home => selection
				if (!Sb.isEditable(o) || e1 || e2) {
					if (e1) b = false;
					let u_v = Sb.getElements(o, true);
					let u_h = Sb.getElements(o, false);
					let c1 = Sb.isScrollable(o, true); // has vertical scrollbar
					let c2 = Sb.isScrollable(o, false); // has horizontal scrollbar
					switch(k) {
						case 32 : // Space
							if (c1) {
								if (e.shiftKey) Sb.scrollOf(o, u_v, -o.offsetHeight); // same as Page Up
								else Sb.scrollOf(o, u_v, o.offsetHeight); // same as Page Down
							} break;
						case 33 : if (c1) Sb.scrollOf(o, u_v, -o.offsetHeight); break; // Page Up
						case 34 : if (c1) Sb.scrollOf(o, u_v, o.offsetHeight); break; // Page Down
						case 35 : if (c1) Sb.scrollOf(o, u_v, Sb.getScrollTopMax(o)); break; // End
						case 36 : if (c1) Sb.scrollOf(o, u_v, 0); break; // Home
						case 38 : // Key Up
							if (c1) {
								if (e.ctrlKey) Sb.scrollOf(o, u_v, 0); // same as Home
								else Sb.scrollByRow(o, u_v, -1, true); // no smooth
							} break;
						case 40 : // Key Down
							if (c1) {
								if (e.ctrlKey) Sb.scrollOf(o, u_v, Sb.getScrollTopMax(o)); // same as End
								else Sb.scrollByRow(o, u_v, 1, true); // no smooth
							} break;
						case 37 : if (c2) Sb.scrollByRow(o, u_h, -1, true); break; // Key Left -- no smooth
						case 39 : if (c2) Sb.scrollByRow(o, u_h, 1, true); break; // Key Right -- no smooth
						default : b = false;
					}
					if (b) e.preventDefault();
				}
			}
		});

		// -------------------------------------------------------------------------
		// * Selection Events
		// -------------------------------------------------------------------------

		document.addEventListener("selectionchange", function(e) {
			if (!Sb.vars.container.selecting && Sb.vars.mouse.down) {
				let sel = window.getSelection();
				if (sel.anchorOffset != sel.focusOffset) Sb.evts.startSelection();
			}
		});

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Attach Scrollbar Events
	//////////////////////////////////////////////////////////////////////////////

	attachScrollbarEvents(o, u) { // o = container element, u = scrollbar elements

		// -------------------------------------------------------------------------
		// * Variables
		// -------------------------------------------------------------------------

		let Sb = this;
		let b = Sb.isVertical(u);

		// -------------------------------------------------------------------------
		// * Functions
		// -------------------------------------------------------------------------

		function beginThumbSlide(x, y) { // x, y = coordinates (pixel)
			Sb.vars.thumb.down = true;
			Sb.vars.target = o;
			Sb.vars.source = u;
			if (b) {
				Sb.vars.container.scroll_top = o.scrollTop;
				Sb.vars.thumb.y = y - (Sb.getThumbBaseTop(u) + Sb.getThumbTop(u));
				Sb.vars.thumb.top = Sb.getThumbTop(u);
				Sb.vars.thumb.mouse.x = x;
			} else {
				Sb.vars.container.scroll_left = o.scrollLeft;
				Sb.vars.thumb.x = x - (Sb.getThumbBaseLeft(u) + Sb.getThumbLeft(u));
				Sb.vars.thumb.left = Sb.getThumbLeft(u);
				Sb.vars.thumb.mouse.y = y;
			}
		}

		// -------------------------------------------------------------------------
		// * Mouse Events
		// -------------------------------------------------------------------------

		u.tk.addEventListener("mouseenter", function() {
			if (Sb.vars.track.down && Sb.vars.source.tk == this) Sb.vars.timer.stop = false;
		});

		u.tk.addEventListener("mouseleave", function() {
			if (Sb.vars.track.down) Sb.vars.timer.stop = true;
		});

		u.ms.addEventListener("mouseenter", function() {
			if (Sb.vars.minus.down && Sb.vars.source.ms == this) Sb.vars.timer.stop = false;
		});

		u.ms.addEventListener("mouseleave", function() {
			if (Sb.vars.minus.down) Sb.vars.timer.stop = true;
		});

		u.ps.addEventListener("mouseenter", function() {
			if (Sb.vars.plus.down && Sb.vars.source.ps == this) Sb.vars.timer.stop = false;
		});

		u.ps.addEventListener("mouseleave", function() {
			if (Sb.vars.plus.down) Sb.vars.timer.stop = true;
		});

		u.tk.addEventListener("mousedown", function(e) {
			if (e.button == 0 && !Sb.vars.thumb.down && Sb.isScrollable(o, b)) {
				this.classList.add("active");
				Sb.vars.source = u;
				Sb.vars.track.x = e.clientX;
				Sb.vars.track.y = e.clientY;
				Sb.vars.track.down = true;
				Sb.scrollByPage(o, u, true);
				Sb.vars.timer.val = setInterval(function() { Sb.scrollByPage(o, u, true) }, Sb.conf.delay_page);
			}
		});

		u.tb.addEventListener("mousedown", function(e) {
			if (e.button == 0 && Sb.isScrollable(o, b)) {
				this.classList.add("active");
				Sb.vars.source = u;
				beginThumbSlide(e.clientX, e.clientY);
			}
		});

		u.gp.addEventListener("mousedown", function(e) {
			if (e.button == 0 && Sb.isScrollable(o, b)) {
				this.classList.add("active");
				Sb.vars.source = u;
			}
		});

		u.ms.addEventListener("mousedown", function(e) {
			if (e.button == 0 && Sb.isScrollable(o, b)) {
				this.classList.add("active");
				Sb.vars.source = u;
				Sb.vars.minus.down = true;
				Sb.vars.timer.out = setTimeout(function() { // auto-fire
					Sb.vars.timer.val = setInterval(function() { Sb.scrollByRow(o, u, -1, true) }, Sb.conf.delay_row);
				}, Sb.conf.delay_button);
			}
		});

		u.ps.addEventListener("mousedown", function(e) {
			if (e.button == 0 && Sb.isScrollable(o, b)) {
				this.classList.add("active");
				Sb.vars.source = u;
				Sb.vars.plus.down = true;
				Sb.vars.timer.out = setTimeout(function() { // auto-fire
					Sb.vars.timer.val = setInterval(function() { Sb.scrollByRow(o, u, 1, true) }, Sb.conf.delay_row);
				}, Sb.conf.delay_button);
			}
		});

		u.ms.addEventListener("click", function() {
			if (Sb.isScrollable(o, b)) Sb.scrollByRow(o, u, -1);
		});

		u.ps.addEventListener("click", function() {
			if (Sb.isScrollable(o, b)) Sb.scrollByRow(o, u, 1);
		});

		u.sb.addEventListener("wheel", function(e) {
			Sb.evts.wheelOverElement(e, o, u);
		});

		// -------------------------------------------------------------------------
		// * Touch Events
		// -------------------------------------------------------------------------

		u.tb.addEventListener("touchstart", function(e) {
			if (Sb.isScrollable(o, b)) beginThumbSlide(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		});

	},

	//////////////////////////////////////////////////////////////////////////////
	// * Attach Container Events
	//////////////////////////////////////////////////////////////////////////////

	attachContainerEvents(o) { // o = container element
		o.addEventListener("mouseenter", this.evts.enterContainer);
		o.addEventListener("mouseleave", this.evts.leaveContainer);
		o.addEventListener("focus", this.evts.focusContainer);
		o.addEventListener("blur", this.evts.blurContainer);
		o.addEventListener("dblclick", this.evts.dblClickContainer);
		o.addEventListener("wheel", this.evts.wheelOverElement);
		o.addEventListener("dragend", this.evts.dragOverContainer);
		o.addEventListener("drop", this.evts.dropOverContainer);
		o.addEventListener("keydown", this.evts.pressKeyOnContainer);
		o.addEventListener("keyup", this.evts.pressKeyOnContainer);
		if (o.tagName == "TEXTAREA") o.addEventListener("mousedown", this.evts.mouseDownOverTextarea);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Detach Container Events
	//////////////////////////////////////////////////////////////////////////////

	detachContainerEvents(o) { // o = container element
		o.removeEventListener("mouseenter", this.evts.enterContainer);
		o.removeEventListener("mouseleave", this.evts.leaveContainer);
		o.removeEventListener("focus", this.evts.focusContainer);
		o.removeEventListener("blur", this.evts.blurContainer);
		o.removeEventListener("wheel", this.evts.wheelOverElement);
		o.removeEventListener("dragend", this.evts.dragOverContainer);
		o.removeEventListener("drop", this.evts.dropOverContainer);
		o.removeEventListener("keydown", this.evts.pressKeyOnContainer);
		o.removeEventListener("keyup", this.evts.pressKeyOnContainer);
		if (o.tagName == "TEXTAREA") o.removeEventListener("mousedown", this.evts.mouseDownOverTextarea);
	},

	//////////////////////////////////////////////////////////////////////////////
	// * Start
	//////////////////////////////////////////////////////////////////////////////

	start(b, c, i) { // b = create flag (optional), c = configuration (optional), initialize flag (optional)
		if (b === undefined) b = true;
		if (i === undefined) i = true;
		if (typeof(c) != "object") c = null;
		Scrollbar.attachDocumentEvents();
		if (b) {
			document.querySelectorAll("[data-scrollbar]").forEach(function(o) {
				Scrollbar.create(o, c, i);
			});
		}
	}

};

// ajout mbellange
export default Scrollbar;
