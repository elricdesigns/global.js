/** ***********************************
 * global.js
 * Recommend compliance with  Standard ECMA-262 3rd Edition - December 1999 (http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf)
 * Should exist in compliance with IE6+, NN3+, C1+
 * All code should have safe wrappers and error fallback to ensure no script failures under any conditions (versions, third-party, browsers)
 * Uses psudo minification (class based LF) for live error pin-pointing
 *************************************** */
/**
 * Safe/Defaults variable casting and type detection
 * from: objects/Cast.js
 * dependancies: javascript 1.0
 */
var Cast={
    v:3.7,
    cint:function(b,c){"undefined"==typeof c&&(c=0);if("undefined"==typeof b)return c;b=parseInt(b,10);return isNaN(b)?c:b},
    cfloat:function(b,c){"undefined"==typeof c&&(c=0);if("undefined"==typeof b)return c;b=parseFloat(b,10);return isNaN(b)?c:b},
    isNumber:function(b){return"number"==typeof b||"object"==typeof b&&b&&b.constructor==Number?!0:!1},
    cobject:function(b,c){"undefined"==typeof c&&(c={});return"object"==typeof b&&b?b:c},
    isObject:function(b){return"object"==typeof b&&b?!0:!1},
    carray:function(b,c){"undefined"==typeof c&&(c=[]);if("undefined"==typeof b||!b)return c;if(this.isArray(b))return b;if("function"==typeof b.toArray)return b.toArray();if("object"==typeof b.toArray){c=[];for(var d in b)b.hasOwnProperty(d)&&c.push(b[d]);return c}return[b]},
    isArray:function(b){return"array"==typeof b||"object"==typeof b&&b&&b.constructor==Array?!0:!1},
    cstring:function(b,c){"undefined"==typeof c&&(c="");return"undefined"==typeof b?c:b+""},
    isString:function(b){return"string"==typeof b||"object"==typeof b&&b&&b.constructor==String?!0:!1},
    cboolean:function(b,c){"undefined"==typeof c&&(c=!1);return"undefined"==typeof b?c:!!b},
    isBoolean:function(b){return"boolean"==typeof b||"object"==typeof b&&b&&b.constructor==Boolean?!0:!1},
    cjson:function(b,c){if(!this.isObject(b)&&this.isString(b))if("undefined"!=typeof JSON)try{b=JSON.parse(b)}catch(d){b={error:d.message}}else try{b=eval("("+b+")")}catch(e){b={error:e.message}}return"undefined"!=typeof c&&"object"!=typeof b?c:this.cobject(b)},
    csjson:function(b,c){if(this.isObject(b))if("undefined"!=typeof JSON)try{b=JSON.stringify(b)}catch(d){b={error:d.message}}else{a=[];for(i in b)obj.hasOwnProperty(prop)&&(this.isObject(i[b])?a.push('"'+this.cstring(b)+'":'+this.csjson(i[b])+""):a.push('"'+this.cstring(b)+'":"'+this.cstring(i[b])+'"'));return"{"+a.join()+"}"}return"undefined"!=typeof c?c:this.cstring(b)},
    cjquery:function(b,c){"undefined"==typeof c&&(c=jQuery());return"undefined"!=typeof b&&b?jQuery(b):c},
    isJquery:function(b){return"object"==typeof b&&b&&b.jquery?!0:!1},
    cdate:function(b,c){"undefined"==typeof c&&(c=Date());if("undefined"==typeof b)return c;b=Date.parse(b);return isNaN(b)?c:b},
    isDate:function(b){return"object"==typeof b&&b&&b.constructor==Date?!0:!1},
    cdefault:function(b,c){"undefined"==typeof c&&(c=null);return"undefined"==typeof b?c:b},
    isFunction:function(b){return"function"==typeof b||"object"==typeof b&&b&&b.constructor==Function?!0:!1},
    isRecursive:function(b){return Cast.isArray(b)||Cast.isFunction(b)||"object"==typeof b&&b.constructor==Object||b.constructor==Array||b.constructor==Function?!0:!1},
    ctree:function(b,c,d){c="undefined"==typeof c?null:c;d=Cast.carray(d,[]);if(3<arguments.length)for(var e=2;e<arguments.length;e++)d.push(arguments[e]);return d.length&&"object"==typeof b&&d[0]in b?(e=d.shift(),d.length?this.ctree.call(this,b[e],c,d):b[e]):c},
    cjqxhr:function(b,c){if("object"==typeof b||"function"==typeof b){if("done"in b&&"fail"in b&&"always"in b)return b;if("success"in b&&"error"in b&&"complete"in b)return b.done=b.success,b.fail=b.error,b.always=b.complete,b}c=Cast.cstring(c);if("undefined"!=typeof jQuery&&"Deferred"in jQuery){var d=new jQuery.Deferred;b?d.resolve(c,"success",d):d.reject(d,"error",c);return d.promise()}return b?{message:c,done:function(b){b(this.message,"success",this)},fail:function(b){},always:function(b){b(this,"success",this.message)}}:{message:c,done:function(b){},fail:function(c){c(b,"error",this.message)},always:function(c){c(b,"error",this.message)}}}
};
/**
 * Ensure base objects for older browsers (for lightweight sake the functionality isn't recreated, just made not to error)
 * window.console.log/console.log
 * JSON.stringify/JSON.parse
 * jQueryVersion {float}
 */
window.console     = console     = typeof window.console == 'undefined' ? {}: window.console;
window.console.log = console.log = typeof window.console.log == 'undefined' ? function(){}: window.console.log;
var jQueryVersion = 0;
if (typeof jQuery == 'function') {
    jQueryVersion = jQuery.fn.jquery;
    jQueryVersion = jQueryVersion.split(".").slice(0,2).join("."); //only want the first increment e.g. 1.7.55 = 1.7
    jQueryVersion = Cast.cfloat(jQueryVersion,0);
}
/**
 * Parse the URL
 * dependancies: javascript 1.0, w3c DOM 1.0, Cast 1.1+
 * from: objects/URL.js
 */
var URL={
    version:1.3,
    cookieMax:4E3,
    href:Cast.cstring(window.location.href),            //http://somewhere.domain.com:21/hi.html?v=3&c=2#chapter
    host:Cast.cstring(window.location.hostname),        //somewhere.domain.com
    domain:"",                                          //domain.com
    hash:Cast.cstring(window.location.hash),            //#chapter
    port:Cast.cstring(window.location.port),            //21
    protocol:Cast.cstring(window.location.protocol),    //http:
    path:"",                                            //'/folder/file.dat'
    file:"",
    //v=3&c=2
    query:1<Cast.cstring(window.location.search).split("?").length?Cast.cstring(window.location.search).split("?")[1]:Cast.cstring(window.location.search),
    
    setDefaults:function(){this.getDomain();this.getPath()},
    getDomain:function(){this.domain=Cast.cstring(this.hostname);var a=this.domain.split(".");if(1>a.length){for(var a=this.href.split("/"),b=0;b<a.length&&-1==a[b].indexOf(".");b++);a=a[b].split(".")}2<a.length&&a.shift();return this.domain=a.join(".")},
    getPath:function(){var a=this.href.match(/[^:][^/][^/]\/([^\?\#]*)/);a?1<a.length&&(a=a[1]):a="";return this.path=a},
    getQuery:function(a){a=Cast.cstring(a);if(!a)return this.query;for(var b=this.query.split("&"),c=0;c<b.length&&b[c].substr(0,b[c].indexOf("="))!=a;c++);return b[c].substr(0,b[c].indexOf("="))!=a?"":b[c].substr(b[c].indexOf("=")+1)},
    setQuery:function(a,b){a=Cast.cjson(a);b=Cast.isString(b)?b:this.query;var c=b.split("&"),d={},e;for(e in c)(k2=Cast.cstring(c[e].split("=")[0]))&&(d[k2]=Cast.cstring(c[e].split("=")[1]));for(e in a)d[e]=Cast.cstring(a[e]);if("function"==typeof jQuery)return jQuery.param(d);c="";for(e in d)c+="&"+e+"="+d[e];return c.replace(/^&/,"")},
    encode:function(a){return"undefined"==typeof encodeURIComponent?escape(a):encodeURIComponent(a)},
    decode:function(a){return"undefined"==typeof decodeURIComponent?unescape(a):decodeURIComponent(a)},
    setCookie:function(a,b,c,d){var e="",f="",f=new Date;c=Cast.cstring(c,"/");b=this.encode(Cast.cstring(b));Cast.cint(d)&&(f.setTime(f.getTime()+864E5*d),e="; expires="+f.toGMTString());f=a+"="+b+e+"; path="+c;if(f.length>this.cookieMax)return!1;try{document.cookie=f}catch(g){return!1}return!0},
    getCookie:function(a){try{var b=document.cookie}catch(c){b=""}var d;a+="=";for(var e=b.split(";"),b=0;b<e.length;b++){for(d=e[b];" "==d.charAt(0);)d=d.substring(1,d.length);if(0==d.indexOf(a))return this.decode(d.substring(a.length,d.length))}return null},
    getCookies:function(){try{var a=document.cookie}catch(b){a=""}for(var c,d=a.split(";"),e={},a=0;a<d.length;a++)c=d[a].indexOf("="),d[a].substr(0,c).trim(),e[c]=this.decode(d[a].substr(c+1));return e}
};
URL.setDefaults();
/**
 * Element and Image global objects
 * From: objects/Elements.js
 * dependancies:  jQuery 1.6+, Cast3.5+, DOMImage
 */
var Elements={
    version:3.14,
    o:[],
    tick:200,
    timeout:!1,
    getPxToIn:function(){return Cast.cint(jQuery("<div style='display:block;position:relative;width:1in;margin:0px;padding:0px;border:none;' />").width())},
    pxToIn:"function"==typeof jQuery?this.getPxToIn():0,
    isHTMLNode:function(a){return"object"===typeof Node?a instanceof Node:a&&"object"===typeof a&&"number"===typeof a.nodeType&&"string"===typeof a.nodeName},
    isHTMLElement:function(a){return"object"===typeof HTMLElement?a instanceof HTMLElement:a&&"object"===typeof a&&null!==a&&1===a.nodeType&&"string"===typeof a.nodeName},
    isHTMLObject:function(a){return Elements.isHTMLElement()||Elements.isHTMLNode()},
    getSelector:function(a){(a=jQuery(this).parents().map(function(){return this.tagName}).get().reverse().join(" "))&&(a+=" "+$(this)[0].nodeName);var b=jQuery(this).attr("id");b&&(a+="#"+b);(b=jQuery(this).attr("class"))&&(a+="."+jQuery.trim(b).replace(/\s/gi,"."));return a},
    add:function(a){var b=Elements.o.length;Elements.o[b]=Cast.cjquery(a);return b},
    get:function(a){a=Cast.cint(a);return a<Elements.o.length?Elements.o[a]:jQuery()},
    loadFile:function(a,b,c){b=Cast.cstring(b,"text");c=Cast.cobject(c);return Cast.cjqxhr(jQuery.ajax({url:a,data:c,dataType:b}))},
    populate:function(a,b,c){c="undefined"==typeof c?/\{\{(.+?)\}\}/g:c;return a.replace(c,function(e,g){var h=Cast.cstring(g).split("."),d=Cast.ctree(b,!1,g)||Cast.ctree(b,null,h)||Cast.ctree(b,null,parseInt(g)),l="";if(Cast.isRecursive(d))return Elements.populate(a,d,c);if(null!=d)return d;"function"==typeof jQuery&&h.length&&jQuery.ajax({url:g,async:!1,dataType:"text",success:function(a){l+=Elements.populate(a,b,c)}});return l})},
    populateTags:function(a,b,c,e,g){var h,d,l,f,m,n;e=Cast.cboolean(e,!0);c="undefined"==typeof c?"tpl":c;Cast.isArray(c)||(c=[c]);for(l=0;l<c.length;l++)for(f=Elements.getRootTags(a,c[l]),d=0;d<f.length;d++)if(m=Cast.ctree(f[d].attr,"","key"),m=Cast.ctree(b,null,m)||b,(n=Cast.ctree(f[d].attr,"","rex"))&&m&&!RegExp(n).test(m))f.html="";else if(Cast.cboolean(Cast.ctree(f[d].attr,!1,"loop"))&&Cast.isRecursive(m)){n="";for(h in m)m[h].$0=h,n+=Elements.populate(Elements.populateTags(f[d].html,m[h],c,e,g),m[h],g);f.replace(d,n,e)}else f.replace(d,Elements.populate(Elements.populateTags(f[d].html,m,c,e,g),m,g),e);return f.html},
    getRootTags:function(a,b,c){var e=function(a,b,c){for(;c<b.length&&"/"===a.charAt(b[c]+1);c++);return c},g=function(a){var b=1,c={};for(a=a.replace(/ +(?= )/g,"").split(" ");b<a.length;b++)a[b]=a[b].split("="),a[b].length&&a[b][0]&&(c[a[b][0]]=((a[b][1]||"")+"").replace(/^['"]|['"]$/g,""));return c};b=function(a,b){for(var c=RegExp("</?"+b+"(>| [^>]*)","g"),e=[],d=0;-1!==(l=a.substr(d).search(c));)d+=l,e.push(d++);return e}(a,b);var h=e(a,b,0),d=[];c=Cast.cint(c,1E3);for(var l=0,f=h;f<c&&f<b.length;f++)"/"===a.charAt(b[f]+1)?l--:l++,0===l&&b[h]!==b[f]&&(k=a.indexOf(">",b[h]),k<b[f]&&d.push({pos:[b[h],a.indexOf(">",b[f])+1],ipos:[k+1,b[f]],attr:g(a.substring(b[h],k)),tag:a.substring(b[h],k+1),html:k<b[f]?a.substring(k+1,b[f]):""}),f=h=e(a,b,f),l=1);d.length=d.length;d.html=a;d.replace=function(a,b,c){var d=this.html.length;this.html="undefined"==typeof c?this.html.substr(0,this[a].pos[0])+b+this.html.substr(this[a].pos[1]):this.html.substr(0,this[a].ipos[0])+b+this.html.substr(this[a].ipos[1]);for(d-=this.html.length;a<this.length;a++)this[a].pos[0]-=d,this[a].pos[1]-=d,this[a].ipos[0]-=d,this[a].ipos[1]-=d};return d},
    overlay:function(a){return Cast.cjqxhr(!1,"function not created")},
    checkBox:function(a,b,c,e){a=Cast.cjquery(a);if(!a.length)return jQuery();e=Cast.cboolean(e);a.after("<img />");var g=a.next("img");g.attr("imgOn",b).attr("imgOff",c).attr("src",e?b:c).show();e?a.attr("checked","checked"):a.removeAttr("checked");a.hide();g.click(function(){var a=jQuery(this).prev();a.attr("checked")?a.removeAttr("checked"):a.attr("checked","checked");a.change()});a.change(function(a){a=jQuery(a.target).next("img");a.attr("src",a.attr(jQuery(this).attr("checked")?"imgOn":"imgOff"));return!0});return g},
    setLink:function(a){a=Cast.cjquery(a);a.css("cursor","pointer");a.click(function(){var a=jQuery(this),c=Cast.cstring(a.attr("href")),a=Cast.cstring(a.attr("target"));c&&(a?window.open(c,a):window.location.href=c)});return this},
    //getContainer:function(a,b){var c=jQuery();b=Cast.cobject(b);Cast.isString(b.parent)?c=a.parents(b.parent):Cast.isObject(b.parent)?c=Cast.cjquery(b.parent):Cast.cboolean(b.parent)&&(c=a.parent());c.length&&(b.width=c.width(),b.height=c.height());if(Cast.cint(b.width)&&Cast.cint(b.height))return{width:b.width,height:b.height,jq:c};c=a.parent();c.length||(c=jQuery(window));return{width:c.width(),height:c.height(),jq:c}},
    //centerParentResize:function(a,b){return Elements.centerInParent(a,b)},
    centerInParent:function(a,b){a=Cast.cjquery(a);b=Cast.cjquery(b);Elements.center(a,b);if("function"!=typeof b.on)return b.bind("resize",function(){Elements.center(a,b)});Elements.startAfterResizeEvent(b);return jQuery(b).on("afterresize",{jqp:b,jqe:a},function(a){Elements.center(a.data.jqe,a.data.jqp)})},
    //centerParent:function(a,b){return Elements.center(a,b)},
    center:function(a,b){var c=b.outerWidth()||b.width(),e=b.outerHeight()||b.height();return Elements.centerInArea(a,c,e)},
    centerInArea:function(a,b,c){var e=Cast.cstring(a.css("position"));return"absolute"==e||"fixed"==e?a.css({left:Math.round(b/2-(a.outerWidth()||a.width())/2)+"px",top:Math.round(c/2-(a.outerHeight()||a.height())/2)+"px"}):a.css({"margin-left":Math.round(b/2-(a.outerWidth()||a.width())/2)+"px","margin-top":Math.round(c/2-(a.outerHeight()||a.height())/2)+"px"})},
    toggle:function(a,b,c){c=Cast.cjson(c);a=Cast.cjquery(a);b=Cast.cjquery(b);c.j=Elements.add(a);c.t=Cast.cboolean(c.t,!0);c.w=Cast.cboolean(c.w,!1);c.h=Cast.cboolean(c.h,!0);if(!a.width()||!a.height()){var e=a.clone().css({height:"auto",width:"auto"}).appendTo("body");c.h&&(c.h=e.height());c.w&&(c.w=e.width());e.remove()}c.w&&(c.w=Math.max(a.width(),Cast.cint(c.w)));c.h&&(c.h=Math.max(a.height(),Cast.cint(c.h)));b.data("toggle",Cast.csjson(c));b.click(function(b){var c=jQuery(b.target),d=Cast.cjson(c.data("toggle"));d.t=Cast.cboolean(d.t);b=Cast.cint(d.w);var e=Cast.cint(d.h),f=Elements.get(Cast.cint(d.j));b&&(d.t?f.animate({width:0},function(){d.t=!1;c.data("toggle",Cast.csjson(d))}):f.animate({width:b},function(){d.t=!0;c.data("toggle",Cast.csjson(d))}));e&&(d.t?f.animate({height:0},function(){d.t=!1;c.data("toggle",Cast.csjson(d))}):f.animate({height:e},function(){d.t=!0;c.data("toggle",Cast.csjson(d))}));a.trigger("toggled")})},
    startAfterResizeEvent:function(a){"undefined"==typeof Elements.startAfterResizeEventOn&&("undefined"==typeof a&&(a=window),Elements.startAfterResizeEventOn=!0,Elements.timeout=!1,$(a).on("resize",{jqp:a},function(){Elements.windowTime=new Date;!1===Elements.timeout&&(Elements.timeout=!0,setTimeout(Elements.triggerAfterResize,Elements.tick))}))},
    triggerAfterResize:function(a){new Date-Elements.windowTime<Elements.tick?setTimeout(Elements.triggerAfterResize,Elements.tick):(Elements.timeout=!1,jQuery(window).trigger("afterresize"))},
    afterResize:function(a,b){b=Cast.cobject();return jQuery(window).on("afterresize",b,a)},
    elementData:function(a,b,c){var e={};a=Cast.cjquery(a);"object"==typeof b?(c=b,b="default"):(b=Cast.cstring(b))||(b="default");Cast.cjson(c);a.each(function(){e=Cast.cjson(a.data(b));jQuery.extend(e,c);a.data(b,e)});return e},
    unifyDimensions:function(a,b,c){var e=0,g=0;b=Cast.cboolean(b,!0);c=Cast.cboolean(c,!0);a=Cast.cjquery(a);a.each(function(){ajqo=$(this);ajqo.width()>e&&(e=ajqo.width());ajqo.height()>g&&(g=ajqo.height())});a.each(function(){ajqo=$(this);b&&ajqo.width(e);c&&ajqo.height(g)});return a},
    resize:function(a,b,c,e){Cast.isNumber(b)&&(b=Cast.cint(b)+"px");Cast.isNumber(c)&&(c=Cast.cint(c)+"px");b||(b=a.width()+"px");c||(c=a.height()+"px");e=Cast.cint(e);return 0<e?a.stop().animate({width:b,height:c},e,function(){a.trigger("afterresize")}):a.css({width:b,height:c}).trigger("afterresize")},
    loading:function(a,b){Elements.loading.img=$();a=Cast.cstring(a);b=Cast.cjquery(b);b.length||(b=jQuery("body"));if(!a||!b.length)return console.log("Elements.loading img error"),jQuery();Elements.loading.img=jQuery('<img src="'+a+'" style="display:none;" />');Elements.loading.img.appendTo(b);Elements.loading.img.load(function(){$(this).css({position:"fixed","z-index":1E4,left:"50%",top:"50%","margin-left":"-"+Elements.loading.img.width/2+"px","margin-top":"-"+Elements.loading.img.height/2+"px"})}).error(function(){console.log("Elements.loading img '"+a+"' does not exist")});Elements.loading.src=a;return Elements.loading.img},
    //Layout.js
    unit:function(a,b){a=Cast.carray(Cast.cstring(a).match(/([\-\.0-9]+)([a-zA-Z%]*)/));return Cast.cstring(b)?Elements.unitConvert([Cast.cstring(a[1])?a[1]:"0",Cast.cstring(a[2])?a[2]:"px"],b):[Cast.cstring(a[1])?a[1]:"0",Cast.cstring(a[2])?a[2]:"px"]},
    stats:function(a,b){a=Cast.cjquery(a);b=Cast.cstring(b);console.log(b+"\n  outerwidth: "+Elements.unit(a.outerWidth(!0),"px")+" - "+Elements.unit(a.outerWidth(!0),"in")+"\n  width:      "+Elements.unit(a.width(),"px")+" - "+Elements.unit(a.width(),"in")+"\n  outerHeight:"+Elements.unit(a.outerHeight(!0),"px")+" - "+Elements.unit(a.outerHeight(!0),"in")+"\n  height:     "+Elements.unit(a.height(),"px")+" - "+Elements.unit(a.height(),"in")+"\n")},
    unitConvert:function(a,b,c){if(a[1]==b)return a;"in"==b?("px"==a[1]?a[0]=Cast.cfloat(a[0])/Elements.pxToIn:"em"==a[1]?a[0]=12/Elements.pxToIn:"%"==a[1]&&(a[0]=Elements.innerSpace(c)/a[0]/Elements.pxToIn),a[1]="in"):"px"==b?("in"==a[1]?a[0]=Cast.cfloat(a[0])*Elements.pxToIn:"em"==a[1]?a[0]=12:"%"==a[1]&&(a[0]=parseInt(Elements.innerSpace(c)/a[0])),a[1]="px"):"%"==b?("in"==a[1]?a[0]=Elements.innerSpace(c)/a[0]/Elements.pxToIn:"px"==a[1]?a[0]=Elements.innerSpace(c)/a[0]:"em"==a[1]&&(a[0]=Elements.innerSpace(c)/a[0]/12),a[1]="%"):"em"==b&&(a[0]=1,a[1]="%");return a},
    innerSpace:function(a){var b={width:[0,"px"],height:[0,"px"]},c=!1;"undefined"==typeof a&&(a=window);if(a===window||a==document)c=!0;a=Cast.cjquery(a);if(!a.length)return b;c&&(b.width[0]-=Elements.unit($("body").css("padding-left"),"px")[0]+Elements.unit($("body").css("padding-right"),"px")[0],b.height[0]-=Elements.unit($("body").css("padding-top"),"px")[0]+Elements.unit($("body").css("padding-bottom"),"px")[0]);b.width[0]+=a.width();b.height[0]+=a.height();return b},
    getWidth:function(a,b,c){c=Cast.cstring(c,"px");b=Cast.cjson(b);return[Cast.cstring(b.width)?Elements.unit(b.width,"px")[0]:Math.min(Math.max(a.outerWidth(!0),Elements.unit(b["min-width"],"px")[0]),Cast.cstring(b["max-width"])?Elements.unit(b["max-width"],"px")[0]:a.outerWidth(!0)),c]},
    inlineJustify:function(a,b,c){b=Cast.cjquery(b);c=Cast.cjson(c);Elements.startAfterResizeEvent(window);jQuery(window).on("afterresize",{jqow:Elements.getWidth(b,c),jqc:Cast.cjquery(a),jqo:b,jqop:b.outerWidth(!0)-b.width()+Cast.cint(c.offset)},function(a){a.data.jqcw=Elements.unit(Elements.innerSpace(a.data.jqc).width,"px");var c=parseInt(a.data.jqcw[0]/parseInt(a.data.jqcw[0]/a.data.jqow[0]));b.width(c-a.data.jqop)});jQuery(window).trigger("afterresize")}
};
Elements.loading.show=function(){Elements.loading.img.length&&Elements.loading.img.fadeIn()};
Elements.loading.hide=function(){Elements.loading.img.length&&Elements.loading.img.fadeOut()};
var Images={
    version:1.3,
    setLoaded:function(a,b){b=Cast.cboolean(b,!0);Cast.cjquery(a).data("loaded",b);return this},
    isLoaded:function(a){return Cast.cboolean(Cast.cjquery(a).data("loaded"))},
    loadImages:function(a){a=Cast.cjquery(a);var b=this;return jQuery.Deferred(function(c){a.each(function(d,e){b.loadImage(jQuery(e)).done(function(b,e,g){d>=a.length-1&&c.resolve(a)})});a.length||c.reject(a,"no image elements to preload")}).promise()},
    loadImage:function(a){var b=this;return jQuery.Deferred(function(c){a=Cast.cjquery(a);var d=new Image,e=Cast.cstring(a.attr("src"));d.onload=function(){Elements.elementData(a,{owidth:d.width,oheight:d.height});b.setLoaded(a);c.resolve(d.width,d.height,a)};d.onerror=function(b){Elements.elementData(a,{owidth:a.width(),oheight:a.height()});c.reject(a.width(),a.height(),a,"invalid src: "+e)};d.src=e;d.complete&&(Elements.elementData(a,{owidth:d.width,oheight:d.height}),b.setLoaded(a),c.resolve(d.width,d.height,a))}).promise()},
    getRatioW:function(a,b){var c=Cast.cobject(Elements.elementData(a)),c=Cast.cint(c.owidth)/Cast.cint(c.oheight);return isNaN(c)?0:b*c},
    getRatioH:function(a,b){var c=Cast.cobject(Elements.elementData(a)),c=Cast.cint(c.oheight)/Cast.cint(c.owidth);return isNaN(c)?0:b*c},
    resizeW:function(a,b,c){return Elements.resize(a,b,this.getRatioH(a,b),c)},
    resizeH:function(a,b,c){return Elements.resize(a,this.getRatioW(a,b),b,c)},
    fitInParent:function(a,b,c,d){b=Elements.getContainer(a,b);return this.fitInArea(a,b.width,b.height,c,d)},
    fitInArea:function(a,b,c,d,e){e=Cast.cboolean(e);return e==Math.abs(a.width()-b)<Math.abs(a.height()-c)?this.resizeW(a,b,d):this.resizeH(a,c,d)},
    fitImages:function(a,b){a=Cast.cjquery(a);var c=this;return jQuery.Deferred(function(d){a.each(function(e,f){c.fitImage(jQuery(f),b).done(function(b,c,f){e>=a.length-1&&d.resolve(f)})});a.length||d.reject(a)}).promise()},
    fitImage:function(a,b){var c=this;return this.loadImage(a).done(function(a,e,f){data={parent:!1,width:0,height:0,speed:0,bound:!0};jQuery.extend(data,Cast.cobject(b));Elements.elementData(f,"container",data);a=Elements.getContainer(f,data);c.fitInArea(f,a.width,a.height,data.speed,!data.bound)})},
    exists:function(a){return jQuery.Deferred(function(b){"undefined"!=typeof a&&a||b.reject(b,"fail","blank url","");jQuery("<img src='"+a+"' />").load(function(){b.resolve(a,"success",b)}).error(function(){b.reject(b,"fail","error loading image",a)})}).promise()},
    svg:function(a,b){a=Cast.cjquery(a);b=Cast.cstring(b);if(!Images.svgSupported())return a;a.each(function(){var a=$(this);b||(b=Cast.cstring(a.attr("svg")));"img"==a.prop("tagName")?a.attr("src",b):a.attr("background-image","url("+b+")")});return a},
    svgSupported:function(){if("undefined"!=typeof Images.bSvgSupported)return Images.bSvgSupported;var a=document.createElement("img");a.setAttribute("src","data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D");Images.bSvgSupported=a.complete;return Images.bSvgSupported}
};
/**
 * User location functions
 * dependancies:  jQuery 1.6+, Cast, URL, Images
 */
var Location={
    version:1.2,
    urlLocations:"http://www1."+URL.domain+"/load_locations",
    urlUserLocation:"http://www1."+URL.domain+"/ext_api/detect_location.php",
    
    getList:function(a,b,c){a=Cast.cstring(a);b=Cast.cstring(b);c=Cast.cstring(c);a||(a="country");return Cast.cjson(jQuery.get(this.urlLocations+("?type="+a+"&code="+b+(c?"&char2="+c:""))))},
    getCountries:function(a){a=Cast.cstring(a);return this.getList("country_code","",a)},
    getStates:function(a,b){a=Cast.cstring(a)?a:"US";b=Cast.cstring(b);return this.getList("state_code", a,b)},
    getCities:function(a){a=Cast.cstring(a);return this.getList("city_id",a)},
    
    getLocation:function(){return jQuery.Deferred(function(a){jQuery.ajax({url:Location.urlUserLocation,type:"GET",crossDomain:!0,async:!1,contentType:"application/json",jsonpCallback:"jsonDetectLocation",dataType:"jsonp",data:{CALLBACK:"t"},success:function(b,c,d){"object"!=typeof b&&a.reject(d,"failed","invalid location data",b);a.resolve(b,"success",d)},error:function(b,c,d){a.reject(b,c,d,{})}})}).promise()},
    getImage:function(a){(a= Cast.cstring(a))||(a="1280x720");return $.Deferred(function(b){Location.getLocation().done(function(c,d,f){var e="http://pod."+URL.domain+"/geo/"+a+"/";Images.exists(e+c.sel_locCity+".jpg").done(function(a){b.resolve(a,"city",c)}).fail(function(a,d,f){Images.exists(e+c.sel_locState+".jpg").done(function(a){b.resolve(a,"state",c)}).fail(function(a,d,f){Images.exists(e+c.sel_locCountry+".jpg").done(function(a){b.resolve(a,"country",c)}).fail(function(a,d,e){b.reject(b,"failed","image from detect location could not be resolved", c)})})})})}).promise()},
    imageTest:function(){Location.getImage().done(function(a,b){console.log("location image loaded("+b+"): "+a)}).fail(function(a,b,c){console.log("location image error: "+c)});return this}
};
/*  SWFObject v2.2 <http://code.google.com/p/swfobject/>
    playFlv({
        "flv": "flv/movie.flv",
        "swf": "swf/flv_player.swf",
        "width": "358",
        "height": "636",
        "endOfVideoCallback": function () {
            $('#video-bg').fadeOut('slow');
            $('#after-image').fadeIn('slow');
        },
        "id": "video"
    });
*/
var playFlv = function(options)
{
    if (typeof swfobject == 'undefined')
        var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
    
    var defaults = {
        "id":     "",
        "flv":    "",
        "swf":    "flv_player.swf",
        "wmode":  "transparent",
        "width":  "0",
        "height": "0",
        "endOfVideoCallback":function(){}
    };
    options = jQuery.extend(true, {}, defaults, options);
    
    swfobject.addLoadEvent(function(){
        var flashvars = {
            "video": options['flv'],
            "endOfVideoCallback": options['endOfVideoCallback']
        };
        var params = {
            "wmode": options['wmode'] //for IE
        };
        var attributes = {
            "wmode": options['wmode']
        };
        
        swfobject.embedSWF(
            options['swf'], 
            options['id'], 
            options['height'], 
            options['width'], 
            "9.0.0",
            "expressInstall.swf", 
            flashvars, 
            params, 
            attributes
        );
    });
};