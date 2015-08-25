// ==UserScript==
// @name         tv Userscript
// @description  Fetching news elements and slideShowing them.
// @include      https://www.ndsu.edu/math/tv/
// @version     1
// @grant        none
// ==/UserScript==


var tv = {

    // configuration variables
    time_to_show_slide: 3000,
    iterations_before_reinit: 100,
    news_urls: new Array( "http://localhost:8080/news-0.html"  , "http://localhost:8080/news-1.html" ),
    // end of configuration variables

    news_iframes: [],
    slideshow_iframes: [],
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
    get_news_list_iframe: function (name) {
	var ifr_list;
	if (typeof(name) == "string") {
	    ifr_list = document.getElementsByName(name)[0].contentDocument.getElementsByName("iframe");
	} else {
	    ifr_list = name.contentDocument.getElementsByName("iframe");
	}
	return ifr_list[0];
    },
    get_news_list_items: function (ifr) {
	return ifr.contentDocument.getElementsByClassName("news-latest-container")[0].getElementsByTagName("li");
	},
    get_anchors: function (a) { 
	var b=[]; 
	for (var x=0; x<a.length; x++) 
	    b[x] = a[x].getElementsByTagName("a")[0].href; 
	return(b);
    },
    create_news_iframe: function (url) {
	var ifr = document.createElement("iframe");
	tv.default_style(ifr);
	ifr.name = url;
	ifr.src = url;
	ifr.onload = function () {
	    ifr.news_list_iframe = tv.get_news_list_iframe(ifr);
	    ifr.news_items = tv.get_news_list_items(ifr.news_list_iframe);
	    ifr.news_items_urls = tv.get_anchors(ifr.news_items);
	    for (var u=0; u<ifr.news_items_urls.length; u++) {
		var url = ifr.news_items_urls[u];
		tv.create_slideshow_iframe(url);
	    };
	};
	document.body.appendChild(ifr);
	return ifr;
    },
    create_slideshow_iframe: function (url) {
	var ifr = document.createElement("iframe");
	tv.default_style(ifr);
	ifr.name = url;
	ifr.src = url;
	ifr.className = "slideshow";
	document.body.appendChild(ifr);
	return ifr;
    },
    get_slideshow_iframes: function () {
	return document.getElementsByClassName("slideshow");
    },
    do_slideshow: function () {
	var s=0, ifr, n=0;
	var slideshow = function () {
	    n++;
	    if (n<tv.iterations_before_reinit) {
		if (tv.slideshow_iframes.length>0) {
		    ifr = tv.slideshow_iframes[s];
		    tv.default_style(ifr);
		    s = (s+1) % tv.slideshow_iframes.length;
		    ifr = tv.slideshow_iframes[s];
		    tv.show_style(ifr);
		} else {
		    tv.slideshow_iframes = tv.get_slideshow_iframes();
		    n--;
		}
	    } else {
		window.location.reload();
		tv.init();
	    }
	    setTimeout(slideshow, tv.time_to_show_slide);
	};
	slideshow();
    },
    mapcar: function(f,a) {
	a.map(f);
    },
    init: function () {
	alert("fired");
	tv.news_iframes = tv.mapcar(tv.create_news_iframe, tv.news_urls);
	tv.slideshow_iframes = tv.get_slideshow_iframes();
	tv.do_slideshow();
    }
};

tv.init();
