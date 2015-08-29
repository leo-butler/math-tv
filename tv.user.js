// ==UserScript==
// @name         tv Userscript
// @description  Fetching news elements and slideShowing them.
// @include      https://www.ndsu.edu/math/tv/
// @version      1.1
// @downloadURL  https://raw.githubusercontent.com/leo-butler/math-tv/master/tv.user.js
// @grant        none
// ==/UserScript==


var tv = {

    // configuration variables
    time_to_show_slide: 10000,
    iterations_before_reinit: 100,
    // end of configuration variables

    news_elements: [],
    tv_urls: [],
    slideshow_elements: [],
    timeout: null,
    debug: false,
    create_style_sheet: function (s) {
	var sheet = document.createElement('style');
	sheet.innerHTML = s;
	return sheet;
    },
    default_style: function (e) { e.style.display = "none"; },
    show_style: function (e) {
	e.style.display = "block";
    },
    create_iframe: function (url) {
	var ifr = document.createElement("iframe");
	tv.default_style(ifr);
	ifr.name = url;
	ifr.href = url;
	return ifr;
	},
    get_tv_list: function (id) {
	var t = document.getElementById(id);
	return t.getElementsByTagName('a');
    },
    get_urls: function (a) {
	var b=[];
	for (var x=0; x<a.length; x++)
	    b[x] = a[x].href;
	return(b);
    },
    create_slideshow_img: function (url) {
	var div = document.createElement("div");
	var img = document.createElement ("img");
	tv.default_style(div);
	div.appendChild(img);
	div.name = url;
	div.className = "slideshow";
	img.src = url;
	document.body.appendChild(div);
	return div;
	},
    create_slideshow_iframe: function (url) {
	var ifr = document.createElement("iframe");
	tv.default_style(ifr);
	ifr.name = url;
	ifr.src = url;
	ifr.className = "slideshow";
	ifr.onload = function () {
	    var head = ifr.contentDocument.head;
	    head.appendChild(tv.create_style_sheet(".shrinkToFit {\n\
						   display: block;\n\
						   margin-left: auto;\n\
						   margin-right: auto;\n\
						  };"));
	    };
	document.body.appendChild(ifr);
	return ifr;
    },
    create_slideshow_element: function (url) {
	// typo3 serves up html files using a directory-like url ending in /
	var ishtml = url.substr(-1) == "/";
	if (ishtml) {
	    return tv.create_slideshow_iframe(url);
	} else {
	    return tv.create_slideshow_img(url);
	}
    },
    get_slideshow_elements: function () {
	return document.getElementsByClassName("slideshow");
    },
    do_slideshow: function () {
	var s=0, ifr, n=0;
	var slideshow = function () {
	    n++;
	    if (n<tv.iterations_before_reinit) {
		if (tv.slideshow_elements.length>0) {
		    ifr = tv.slideshow_elements[s];
		    tv.default_style(ifr);
		    s = (s+1) % tv.slideshow_elements.length;
		    ifr = tv.slideshow_elements[s];
		    tv.show_style(ifr);
		} else {
		    tv.slideshow_elements = tv.get_slideshow_elements();
		    n--;
		}
	    } else {
		window.location.reload(true);
		tv.init();
	    }
	    tv.timeout = setTimeout(slideshow, tv.time_to_show_slide);
	};
	slideshow();
    },
    mapcar: function(f,a) {
	a.map(f);
    },
    insert_this_script: function (head) {
	// debugging GM scripts is lousy, so we insert this script as a
	// regular JS script and run that
	if(document.getElementById('tv.user.js')==null) {
	    // run the script as an ordinary JS script in the document scope
	    var e = document.createElement("script");
	    e.src = 'https://www.ndsu.edu/pubweb/~lebutler/tv.user.js';
	    e.type="text/javascript";
	    e.id = "tv.user.js";
	    head.appendChild(e);
	}},
    setup_style_sheet: function (head) {
	head.appendChild(tv.create_style_sheet("html, body { margin: 0; padding: 0; height: 100%; }\n\
					       .slideshow {\n\
					       position: absolute;\n\
					       top: 0; left: 0; width: 100%; height: 100%;\n\
					       border: none; padding-top: 32px;\n\
					       box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;\n\
					      }\n\
					       .slideshow img {\n\
						   display: block;\n\
						   margin-left: auto;\n\
						   margin-right: auto;\n\
					           height: 100%;\n\
						  };"));
    },
    setup_page_elements: function () {
	// zero out current page elements
	var children = document.body.children;
	for (var i=0; i<children.length; i++) {
	    var child = children[i];
	    child.style.display = "none";
	}
	// set defaults for current page
	document.body.style.backgroundColor = "white";
	document.body.style.color = "black";
    },
    clear_timeout: function () {
	if(tv.timeout !== null) clearTimeout(tv.timeout);
    },
    init: function () {
	tv.clear_timeout();
	
	var head = document.head;
	if(tv.debug) tv.insert_this_script(head);
	tv.setup_style_sheet(head);
	tv.setup_page_elements();

	// get urls and create slideshow
	tv.tv_urls = tv.get_urls(tv.get_tv_list('main'));
	tv.mapcar(tv.create_slideshow_element,tv.tv_urls);
	tv.slideshow_elements = tv.get_slideshow_elements();
	tv.do_slideshow();
    }
};


// GO!
document.body.onload = tv.init;
