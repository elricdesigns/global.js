/**
 * Element functions
 * From: objects/Elements.js
 * Terms:  jqo:jquery object, jqt:jquery object target, jq
 * @class Elements
 * @version 3.14
 * @requires jQuery1.3+
 * @requires Cast3.7+
 * @alias Elements
 * @classDescription tools that affect html elements
 * @property {Integer} pxToIn number of pixels in an inch (0 if jQuery not include before)
 * @property {Float} version
 * @property {function} isHTMLElement(domObject) determines if this is a dom element variable
 * @property {function} add(jqo) add a jQuery object to Elements.o[]
 * @property {function} get(integer) get a jQuery object from Elements.o[]
 * @property {function} populate(string,json,rex) populate an html string with json data
 *      <ul>
 *          <li>{{var}} loop recursively if object/function/array, </li>
 *          <li>{{var}} insert var value, </li>
 *          <li>{{var.var.var}} insert var chain value, </li>
 *      </ul>
 * @property {function} populateTags(string,json,tag,rex) populate an html string with json data
 *      <ul>
 *          <li>{{var}} loop recursively if object/function/array, </li>
 *          <li>{{var}} insert var value, </li>
 *          <li>{{var.var.var}} insert var chain value, </li>
 *      </ul>
 * @property {function} overlay(source) tbd
 * @property {function} checkBox(jqo,on,off,boolean) adds custom on/off image to checkbox
 * @property {function} setLinks(jqo) converts elements to links if they have href attribute and optionally target attribute
 * @property {function} centerInParent(target,container) centers target in container (css does a poor job of vertical alignment for liquid elements)
 * @property {function} centerInArea(jqo,width,height) centers an element in an area
 * @property {function} afterResize(jqo) triggers afterresize event for jQuery element
 * @property {function} unifyDimensions(jqo,[width],[height]) makes all jquery elements unified dimensions to largest element.
 * @property {function} resize(jqo,w,h,[speed]) resize element(s) and throw afterresize event
 * @property {function} loading(url,jquery) show a loading image, centered in element {<pre>
 * loading.show() - shows loading image
 * loading.hide() - hides loading image
 * </pre>}
 */
var Elements = {
    version : 3.14,
    o       : [],     //stored jquery elements (attach id# to element)
    tick    : 200,    //resize timer tick for 'afterresize' event
    timeout : false,  //performing resize
    pxToIn  : typeof jQuery == 'function' ? this.getPxToIn(): 0,  //physical aspect ratio
    /**
     * Elements.getPxToIn
     * Returns the number of pixels in a physical area inch
     * @method
     * @return {Integer} pixels
     */
    getPxToIn : function()
    {
        return Cast.cint(jQuery("<div style='display:block;position:relative;width:1in;margin:0px;padding:0px;border:none;' />").width());
    },
    /**
     * Elements.isHTMLNode
     * @method
     * @memberOf Elements
     * @param {HTMLObject/jQuery/Object}
     * @return {Boolean} if type node
     */
    isHTMLNode : function(o){
        return (
            typeof Node === "object" ? o instanceof Node : 
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
    },
    /**
     * Elements.isHTMLElement
     * @method
     * @memberOf Elements
     * @param {HTMLObject|jQuery|Object}
     * @return {Boolean} if type html element
     */
    isHTMLElement : function(o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    },
    /**
     * Elements.isHTMLObject
     * @method
     * @param {HTMLObject|jQuery|Object} o
     * @return {Boolean} if type html object
     */
    isHTMLObject : function(o){
        return (Elements.isHTMLElement() || Elements.isHTMLNode());
    },
    /**
     * Elements.getSelector - gets a text selector for element
     * @method
     * @param {HTMLObject|jQuery|Object} o
     * @return {string} the selector
     */
    getSelector : function(o){
        var selector = jQuery(this).parents()
                        .map(function() { return this.tagName; })
                        .get().reverse().join(" ");
    
        if (selector) { 
          selector += " "+ $(this)[0].nodeName;
        }
    
        var id = jQuery(this).attr("id");
        if (id) { 
          selector += "#"+ id;
        }
    
        var classNames = jQuery(this).attr("class");
        if (classNames) {
          selector += "." + jQuery.trim(classNames).replace(/\s/gi, ".");
        }
    
        return selector;
    },
    /**
     * Elements.add
     * Adds a jQuery object to Elements.o array and returns the array index (used by Elements.get).  
     * Good for when you need attach an object reference to an element.
     * @method
     * @param {HTMLObject|jQuery|Selector-String} o
     * @return {Integer} index
     */
    add : function(o) {
        var ie = Elements.o.length;
        Elements.o[ie] = Cast.cjquery(o);
        return ie;
    },
    /**
     * Elements.get
     * Get a jQuery object added via Elements.add. 
     * @param {Integer} o
     * @return {jQuery} index
     */
    get : function(ie) {
        ie = Cast.cint(ie);
        if (ie < Elements.o.length)
            return Elements.o[ie];
        return jQuery();
    },
    /**
     * loadFile simple ajax loader
     * @param {url-string} url - the source file url
     * @param {string} [type] - "json" | "text" | "html"  default: text
     * @param {json} data - the data to post
     * @return {jQueryXHR} new template
     */
    loadFile : function(url, type, data) 
    {
        type = Cast.cstring(type, "text");
        data = Cast.cobject(data);
        
        return Cast.cjqxhr(jQuery.ajax({
            url: url,
            data: data,
            dataType: type
        }));
    },
    /**
     * populate fills a string with json data using regular expression replace.
     * @todo a file embeding method better than non-async
     * @todo what about numerical keys?
     * @param {string} source - the source template
     * @param {json|object|string-json} struct - keys and values to replace
     * @param {string} [rex] - the regular expression to replace, uses second result
     * @return {string} new template
     * @example
     *      <ul>
     *          <li>{{var.var.var}} use periods to traverse down next level</li>
     *          <li>{{var}} if object, loop over this entry recursively</li>
     *          <li>{{var}} if variable found, show this value</li>
     *          <li>{{var}} if variable not found, assume file and load as next template, </li>
     *      </ul>
     */
    populate : function(template, struct, rex) 
    {
        rex = typeof rex == 'undefined' ? /\{\{(.+?)\}\}/g : rex;
        
        return template.replace(rex, function($0,$1){
            var item  = Cast.cstring($1).split("."),
                value = Cast.ctree(struct, false, $1)              //try getting value directly
                        || Cast.ctree(struct, null, item)          //then chaining down tree via periods
                        || Cast.ctree(struct, null, parseInt($1)), //then the numeric index
                r = "";
            
            //recurse down template assuming same object format repeating (function/array/object)
            if (Cast.isRecursive(value))
                return Elements.populate(template, value, rex);
            
            //replace the value (string/int/boolean)
            if (value != null)
                return value;
            
            //if we couldn't find the value, assume it's a file pointer to a template
            if (typeof jQuery == 'function' && item.length)
                jQuery.ajax({
                    url      : $1,
                    async    : false,
                    dataType : "text",
                    success  : function(data) {
                        r += Elements.populate(data, struct, rex);
                    }
                });
            
            return r;
        });
    },
    /**
     * Elements.populateTags
     * @param string template the html text
     * @param json struct the json used to populate the template
     * @param string|array tag the tag to search for
     * @param boolean false: replace tag or true: replace inside tag
     * @param string|RegExp the replace pattern to search for
     * @example <pre>
     *      &lt;tpl&gt;Text to populate {{key}}
     *          &lt;tpl loop="1" key="index"&gt;loop through this key {{value}}&lt;tpl&gt;
     *          &lt;tpl regex="/1|true/"&gt;only show if true {{value}}&lt;tpl&gt;
     *      &lt;tpl&gt;
     * </pre>
     */
    populateTags : function(template, struct, tag, treplace, regex)
    {
        var i, j, k, tags, key, value, rex, s;
        treplace = Cast.cboolean(treplace,true);
        tag  = typeof tag == 'undefined' ? "tpl" : tag;
        if (! Cast.isArray(tag))
            tag = [tag];
        
        for (k=0;k<tag.length;k++) {
            tags = Elements.getRootTags(template, tag[k]); //jquery was too slow and not accurate
            
            for (j=0;j<tags.length;j++) {
                   //get attributes
                   key   = Cast.ctree(tags[j].attr,"","key");
                   value = Cast.ctree(struct,null,key) || struct;
                   rex   = Cast.ctree(tags[j].attr,"","rex");
                   
                   //RegExp display instructions show/don't show
                   if (rex && value && ! RegExp(rex).test(value)) {
                       tags.html = "";
                       continue;
                   }
                   
                   //Loop tag
                   if (Cast.cboolean(Cast.ctree(tags[j].attr, false, "loop"))
                       && Cast.isRecursive(value)
                   ) {
                       s = "";
                       for (i in value) {
                           value[i]['$0'] = i;
                           s += Elements.populate(
                               Elements.populateTags(tags[j].html,value[i],tag,treplace,regex),
                               value[i],
                               regex
                           );
                       }
                       tags.replace(j,s,treplace);
                       continue;
                   }
                   
                   //Non-Loop Tag
                   tags.replace(
                       j,
                       Elements.populate(
                           Elements.populateTags(tags[j].html,value,tag,treplace,regex),
                           value,
                           regex
                       ),
                       treplace
                   );
            } //tags loop
        } //tag loop
        
        return tags.html;
    },
    /**
     * Elements.getRootTags gets object of all the root tags
     * @todo move functions out to elements as private
     * @return Object <pre>
     * [#]
        "pos"  : array [# before tag, # after tag],
        "attr" : json attributes,
        "tag"  : <tag >,
        "html" : innerHTML
     * [html] : the html
     * replace(#, html) - replace tag innerHTML
     * </pre>
     */
    getRootTags : function(html,tag,max)
    {
        var findStart = function(html,a,start)
            {
                for(var i=start;i<a.length && html.charAt(a[i]+1)==='/';i++);return i;
            },
            findTags = function(html,tag)
            {//re = RegExp('<[/]?'+tag+'(.*)[>]','g'), RegExp('<[/]?'+tag+'[ >]','g')RegExp('<[/]?'+tag+'(>|[ ](.+)>)','g')
                var re = RegExp('</?'+tag+'(>| [^>]*)','g'), 
                    a = [], 
                    k = 0;
                while ((i=html.substr(k).search(re))!==-1) { 
                    k=k+i;
                    a.push(k++);
                }
                return a;
            },
            getAttributes = function(tag)
            {
                var j=1, 
                    tags = {},
                    tmp  = tag
                            .replace(/ +(?= )/g,'')
                            .split(" ");
                for(; j<tmp.length; j++) {
                    tmp[j] = tmp[j].split("=");
                    if (tmp[j].length && tmp[j][0]) 
                        tags[tmp[j][0]] = ((tmp[j][1] || "")+"").replace(/^['"]|['"]$/g, '');
                }
                return tags;
            },
            a     = findTags(html,tag),
            start = findStart(html,a,0),
            tags  = [];
        max = Cast.cint(max,1000);
        
        for(var i=0, j=start;j<max && j<a.length;j++){
            if (html.charAt(a[j]+1)==='/') i--;
            else i++;
            if (i===0 && a[start] !== a[j]) {
                k = html.indexOf(">", a[start]);
                if (k<a[j])
                    tags.push({
                        "pos"  : [a[start], html.indexOf(">", a[j])+1],
                        "ipos" : [k+1, a[j]],
                        "attr" : getAttributes(html.substring(a[start],k)),
                        "tag"  : html.substring(a[start],k+1),
                        "html" : k<a[j] ? html.substring(k+1,a[j]) : ""
                    });
//document.write(k + " " + tags.length + " " + typeof tags[tags.length-1] + "<BR>");
                j = start = findStart(html,a,j); 
                i=1;
            }
        }
        
        tags.length = tags.length;
        tags.html = html;
        tags.replace = function(i, s, b) {
            var k, len = this.html.length;
            if (typeof b == 'undefined') //innerHTML
                this.html = this.html.substr(0,this[i].pos[0]) + s + this.html.substr(this[i].pos[1]);
            else //outerHTML
                this.html = this.html.substr(0,this[i].ipos[0]) + s + this.html.substr(this[i].ipos[1]);
            len = len - this.html.length;
            for(k=i;k<this.length;k++) {
                this[k].pos[0]-=len;
                this[k].pos[1]-=len;
                this[k].ipos[0]-=len;
                this[k].ipos[1]-=len;
            }
        };
        return tags;
    },
    /**
     * Elements.overlay
     * <div>Simple overlay generation.  fadeIn when content loaded.</div>
     * @todo create this function
     * @param {json} settings
     *      <ul>{
     *          <li>"url"  : {string} target url html contents</li>
     *          <li>"html" : {string} html contents</li>
     *      }</ul>
     * @return {jqxhr} done, fail and always methods are returned
     */
    overlay : function(source)
    {
        return Cast.cjqxhr(false, 'function not created');
    },
    /**
     * Assign custom images to the checkbox on/off state.  
     * Changes original checkbox state and works seamlessly in forms.  
     * Works down to IE6, then gracefully degrades into a regular checkbox.
     * @method
     * @memberOf Elements
     * @param {string|jquery} cb - the checkbox element
     * @param {url} imgOn - the checked image link
     * @param {url} imgOff - the unchecked image link
     * @param {boolean} [bOn] - default checked state
     * @return {jquery} the new check element
     * @fires change
     */
    checkBox : function(cb, imgOn, imgOff, bOn) 
    {
        cb = Cast.cjquery(cb);
        if (! cb.length)
            return jQuery();
        
        bOn = Cast.cboolean(bOn);
        
        cb.after("<img />");
        var customBox = cb.next("img");
        
        customBox
            .attr("imgOn", imgOn)
            .attr("imgOff", imgOff)
            .attr("src", ((bOn)?imgOn:imgOff) )
            .show();
        
        if(bOn)
            cb.attr('checked', 'checked');
        else
            cb.removeAttr('checked'); //override css setting
        
        cb.hide();
            
        customBox.click(function() {
            var jqCheck = jQuery(this).prev(); 
            if ( ! jqCheck.attr('checked')) 
                jqCheck.attr('checked', 'checked');
            else
                jqCheck.removeAttr('checked');
            jqCheck.change();
        });
        
        cb.change(function(e){
            var cust = jQuery(e.target).next("img");
            cust.attr("src", cust.attr(((!!jQuery(this).attr('checked'))?"imgOn":"imgOff")) );
            return true;
        });
        
        return customBox;
    },
    /**
     * With attributes href and target, converts any element into an anchor/link (e.g. <div href='link.html'></div>)
     * @param {jquery|string} s - selector or object to add link to (tracks clicks)
     * @return {this}
     */
    setLink : function(s) 
    {
        s = Cast.cjquery(s);
        s.css("cursor", "pointer");
        s.click(function() {
            var e = jQuery(this);
            var href = Cast.cstring(e.attr("href"));
            var target = Cast.cstring(e.attr("target"));
            if (href) {
                if(target)
                    window.open(href, target);
                else
                    window.location.href = href;
            }
        });
        return this;
    },
    /**
     * Determines width and height of container based on container options
     * @deprecated will be removed after Images.fitInParent and fitImage are updated
     * @param {jquery} ele - the contained jquery element
     * @param {json} options - container options
     *      <ul>{
     *          <li>"parent" : {HTMLobject|jQuery}</li>
     *          <li>"width"  : {Integer}</li>
     *          <li>"height" : {Integer}</li>
     *      }</ul>
     * @return {json} width/height - defaults to window width/height
     */
    getContainer : function(ele, container)
    {
        var parent = jQuery();
        container  = Cast.cobject(container);
        
        //Check if parent search is defined (accepts search string, jquery objects and html elements)
        if ( Cast.isString(container.parent) ) {
            parent = ele.parents(container.parent);
        }
        else if ( Cast.isObject(container.parent) ) {
            parent = Cast.cjquery(container.parent);
        }
        else if ( Cast.cboolean(container.parent) ) {
            parent = ele.parent();
        }
        
        //override width/height
        if ( parent.length ) {
            container.width  = parent.width();
            container.height = parent.height();
        }
        
        if ( Cast.cint(container.width) && Cast.cint(container.height) )
            return {"width":container.width, "height":container.height, "jq": parent};
        
        parent = (ele.parent());
        if ( ! parent.length )
            parent = jQuery(window);
            
        return {"width":parent.width(), "height":parent.height(), "jq": parent};
    },
    /**
     * @deprecated use centerInParent instead
     */
    centerParentResize : function(jqe, jqp)
    {return Elements.centerInParent(jqe,jqp);},
    /**
     * Center element into parent and re-center element on 'afterresize' events.  Invokes event if not already invoked.
     * @param {selector|jquery|HTMLElement} jqp parent container (usually window)
     * @param {selector|jquery} jqe centered element
     * @return {jquery} jqe
     */
    centerInParent : function(jqe, jqp)
    {
        jqe = Cast.cjquery(jqe);
        jqp = Cast.cjquery(jqp);
        Elements.center(jqe, jqp);
        
        //pre jQuery 1.8
        if (typeof jqp.on != 'function')
            return jqp.bind('resize', function(){
                Elements.center(jqe, jqp);
            });
        
        Elements.startAfterResizeEvent(jqp);
        return jQuery(jqp).on('afterresize', 
            {"jqp":jqp,"jqe":jqe},
            function(e){
                Elements.center(e.data.jqe, e.data.jqp);
            }
        );
    },
    /**
     * @deprecated use center instead
     */
    centerParent : function(jqe, jqp)
    {return Elements.center(jqe,jqp);},
    /**
     * Center element in parent element
     * @param {jquery} jqe centered element
     * @param {jquery} jqp parent container (usually window)
     * @return {jquery} jqe
     */
    center : function(jqe, jqp)
    {
        var w = (jqp.outerWidth() || jqp.width()),
            h = (jqp.outerHeight() || jqp.height());
        
        return Elements.centerInArea(jqe,w,h);
    },
    /**
     * Center element in a specified height/width pixels
     * @deprecated centerArea became centerInArea
     * @param {jquery} jqe centered element
     * @param {int} width
     * @param {int} height
     * @return {jquery} jqe
     */
    centerInArea : function(jqe, w, h)
    {
        var pos = Cast.cstring(jqe.css("position"));
        if ( pos == "absolute" || pos == "fixed")
            return jqe.css({
                "left" : Math.round( (w/2) - ((jqe.outerWidth() || jqe.width())/2) ) + "px", 
                "top"  : Math.round( (h/2) - ((jqe.outerHeight() || jqe.height())/2) ) + "px"
            });
        return jqe.css({
            "margin-left" : Math.round( (w/2) - ((jqe.outerWidth() || jqe.width())/2) ) + "px", 
            "margin-top"  : Math.round( (h/2) - ((jqe.outerHeight() || jqe.height())/2) ) + "px"
        });
    },
    /**
     * toggle - clicking jqt will toggle jqo open/closed
     * uses Elements.add to keep entire tree in memory - probably need another way to go about it
     * @deprecated use jQuery toggle instead
     * @param {jquery/string} jqo - target element
     * @param {jquery/string} jqt - triggering element
     * @param {json} opts - options
     * {<pre>
     *  "w" : {int|bool} resize width
     *  "h" : {int|bool} resize height
     *  "t" : {boolean} is open/closed (default open)
     * </pre>}
     * @fires toggled
     */
    toggle : function(jqo, jqt, opts)
    {
        opts = Cast.cjson(opts);  //options: w=width use, h=height use, t=start open/closed
        jqo  = Cast.cjquery(jqo); //toggle target
        jqt  = Cast.cjquery(jqt); //toggle trigger
        opts["j"] = Elements.add(jqo); //convert to jquery object to int to attach to data
        opts["t"] = Cast.cboolean(opts["t"],true); //default open
        opts["w"] = Cast.cboolean(opts["w"],false);
        opts["h"] = Cast.cboolean(opts["h"],true);
        if (! (jqo.width() && jqo.height())) { //closed, get size through clone
            var elem = jqo.clone().css({"height":"auto","width":"auto"}).appendTo("body");
            if(opts["h"])
                opts["h"] = elem.height();
            if(opts["w"])
                opts["w"] = elem.width();
            elem.remove();
        }
        if (opts["w"])
            opts["w"] = Math.max(jqo.width(), Cast.cint(opts["w"])); //use target width, unless passed width is larger
        if (opts["h"])
            opts["h"] = Math.max(jqo.height(), Cast.cint(opts["h"])); //use target height, unless passed width is larger
        
        jqt.data("toggle", Cast.csjson(opts));
        
        jqt.click(function(ev){
            var ajqo = jQuery(ev.target),
                o = Cast.cjson(ajqo.data("toggle"));
            o["t"] = Cast.cboolean(o["t"]);
            var w = Cast.cint(o["w"]),
                h = Cast.cint(o["h"]),
                j = Elements.get(Cast.cint(o["j"]));
            if (w)
                if(o["t"]) //is open, close
                    j.animate({"width":0},function(){
                        o["t"] = false;
                        ajqo.data("toggle",Cast.csjson(o));
                    });
                else //is closed, open
                    j.animate({"width":w},function(){
                        o["t"] = true;
                        ajqo.data("toggle",Cast.csjson(o));
                    });
            if (h)
                if(o["t"]) //is open, close
                    j.animate({"height":0},function(){
                        o["t"] = false;
                        ajqo.data("toggle",Cast.csjson(o));
                    });
                else //is closed, open
                    j.animate({"height":h},function(){
                        o["t"] = true;
                        ajqo.data("toggle",Cast.csjson(o));
                    });
            jqo.trigger("toggled");
        });
    },
    /**
     * called once
     * The 'afterresize' event triggers after a window is resized.  This speeds up actions that rely on window size.  
     * This function starts the afterresize event. It only needs to be called once per jqp (self checks if it's already called.)
     * @param {HTMLObject|jQuery} [jqp] basically this is the window object 99% of the time
     */
    startAfterResizeEvent : function(jqp)
    {
        if (typeof Elements.startAfterResizeEventOn != 'undefined') //run only once - should probably force a run at startup
            return;
        if (typeof jqp == 'undefined')
            jqp = window;
        Elements.startAfterResizeEventOn = true;
        Elements.timeout = false;
    
        $(jqp).on('resize', 
            {"jqp":jqp},
            function() {
                Elements.windowTime = new Date();
                if (Elements.timeout === false) {
                    Elements.timeout = true;
                    setTimeout(Elements.triggerAfterResize, Elements.tick);
                }
            }
        );
    },
    /**
     * triggers "afterresize" event
     * @fires afterresize
     */
    triggerAfterResize : function(e)
    {
        if (new Date() - Elements.windowTime < Elements.tick) {
            setTimeout(Elements.triggerAfterResize, Elements.tick);
        } else {
            Elements.timeout = false;
            /**
             * afterResize event.
             * @event afterresize
             * @type {jQuery:event}
             */
            jQuery(window).trigger("afterresize");
        } 
    },
    /**
     * calls afterresize event (aka $(window).on('afterresize', function(){});)
     * @param function
     * @return jqxhr
     */
    afterResize : function(f, d)
    {
        d = Cast.cobject();
        return jQuery(window).on('afterresize', d, f);
    },
    /**
     * Stores data on the element.  This function needs updating.
     * @private
     * @param {jquery} jqo - the jquery element
     * @param {string} [dataSet] - the subset of data to save
     * @param {json} [data] - the data to save
     * @return {json} the image data
     */
    elementData : function(jqo, set, newData)
    {
        var data = {};
        jqo = Cast.cjquery(jqo);
        if (typeof set == 'object') {
            newData = set;
            set = "default";
        } else {
            set = Cast.cstring(set);
            if ( ! set )
                set = "default";
        }
        Cast.cjson(newData);
        
        jqo.each(function(){
            data = Cast.cjson(jqo.data(set));
            jQuery.extend(data, newData);
            jqo.data(set, data);
        });
        
        return data;
    },
    /**
     * Resizes all matches to the largest dimensions
     * @param {jquery|selector-string} jqo - many jquery objects
     * @param {boolean} w - unify width
     * @param {boolean} h - unify height
     * @return {jquery} jqo - .length = 0 on error
     */
    unifyDimensions : function(jqo, w, h)
    {
        var maxw = 0,
            maxh = 0;
        w   = Cast.cboolean(w,true);
        h   = Cast.cboolean(h,true);
        jqo = Cast.cjquery(jqo);
        jqo.each(function(){
            ajqo = $(this);
            if (ajqo.width() > maxw)
                maxw = ajqo.width();//Math.max(ajqo.width(), ajqo.outerWidth());
            if (ajqo.height() > maxh)
                maxh = ajqo.height();//Math.max(ajqo.height(), ajqo.outerHeight());
        });
        jqo.each(function(){
            ajqo = $(this);
            if (w)
                ajqo.width(maxw);
            if (h)
                ajqo.height(maxh);
        });
        return jqo;
    },
    /**
     * Resizes element to new width/height all css units accepted
     * @param {jquery|selector-string} jqo - one jquery object
     * @param {string|int} w - new width
     * @param {string|int} h - new height
     * @param {int} effect - speed to animate to new size (0 = instant)
     * @return {jQuery} object - use "afterresize" event
     * @fires afterresize
     */
    resize : function(jqo,w,h,effect)
    {
        if ( Cast.isNumber(w) )
            w = Cast.cint(w)+"px";
        if ( Cast.isNumber(h) )
            h = Cast.cint(h)+"px";
        if (!w)
            w = jqo.width()+"px";
        if (!h)
            h = jqo.height()+"px";
        effect = Cast.cint(effect);
    
        if ( effect > 0 )
            return jqo.stop().animate({
                "width"  : w,
                "height" : h
            }, effect, function(){
                jqo.trigger("afterresize");
            });
    
        return jqo.css({
            "width"  : w,
            "height" : h
        }).trigger("afterresize");
    },
    /**
     * Creates a loading image, centered in the container.  Uses methods:
     * <ul>
     *      <li>Elements.loading.show()</li>
     *      <li>Elements.loading.hide()</li>
     * </ul>
     * @param {string} src - the image url
     * @param {selector-string|jquery} [container] - the container element - defaults to body
     * @return {jquery} the created image
     */
    loading : function(src,container)
    {
        Elements.loading.img  = $();
        src = Cast.cstring(src);
        container = Cast.cjquery(container);
        if (! container.length)
            container = jQuery("body");
        
        if (! (src && container.length)) {
            console.log("Elements.loading img error");
            return jQuery();
        }
        
        Elements.loading.img  = jQuery("<img src=\"" + src + "\" style=\"display:none;\" />");
        Elements.loading.img.appendTo(container);
        
        Elements.loading.img.load(function() {
            $(this).css({
                'position'    : 'fixed',
                'z-index'     : 10000,
                'left'        : '50%',
                'top'         : '50%',
                'margin-left' : '-' + (Elements.loading.img.width/2) + 'px',
                'margin-top'  : '-' + (Elements.loading.img.height/2) + 'px'
            });
        }).error(function(){
            console.log("Elements.loading img '"+ src +"' does not exist");
        });
        
        Elements.loading.src = src;
        return Elements.loading.img;
    }
    
};  //Elements: functions shared across all elements

/**
 * Elements.loading.show
 * shows a loading image, after Elements.loading is called
 * @memberof Elements.loading
 */
Elements.loading.show = function() 
{
    if (Elements.loading.img.length)
        Elements.loading.img.fadeIn();
};
/**
 * Elements.loading.show
 * hides the loading image
 * @memberof Elements.loading
 */
Elements.loading.hide = function() 
{
    if (Elements.loading.img.length)
        Elements.loading.img.fadeOut();
};


