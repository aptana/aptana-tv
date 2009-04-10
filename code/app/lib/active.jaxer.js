/* ***** BEGIN LICENSE BLOCK *****
 * 
 * Copyright (c) 2009 Aptana, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 * ***** END LICENSE BLOCK ***** */
 
/**
 * @namespace {ActiveSupport} Provides a number of methods from the
 *  Prototype.js framework, without modifying any built in prototypes to
 *  ensure compatibility and portability.
 */
var ActiveSupport = null;

(function(global_context){
ActiveSupport = {
    /**
     * Returns the global context object (window in most implementations).
     * @alias ActiveSupport.getGlobalContext
     * @return {Object}
     */
    getGlobalContext: function getGlobalContext()
    {
        return global_context;
    },
    /**
     * Returns a class if it exists. If the context (default window / global
     * context) does not contain the class, but does have a __noSuchMethod__
     * property, it will attempt to call context[class_name]() to trigger
     * the __noSuchMethod__ handler.
     * @param {String} class_name
     * @param {Object} context
     * @return {Mixed}
     */
    getClass: function getClass(class_name,context)
    {
        context = context || ActiveSupport.getGlobalContext();
        var klass = context[class_name];
        if(!klass)
        {
            var trigger_no_such_method = (typeof(context.__noSuchMethod__) !== 'undefined');
            if(trigger_no_such_method)
            {
                try
                {
                    context[class_name]();
                    klass = context[class_name];
                }
                catch(e)
                {
                    return false;
                }
            }
        }
        return klass;
    },
    /**
     * Logs a message to the available logging resource. Accepts a variable
     * number of arguments.
     * @alias ActiveSupport.log
     */
    log: function log()
    {
        if(typeof(Jaxer) !== 'undefined')
        {
            Jaxer.Log.info.apply(Jaxer.Log,arguments || []);
        }
        else if(typeof(air) !== 'undefined')
        {
            air.Introspector.Console.log.apply(air.Introspector.Console,arguments || []);
        }
        else if(typeof(console) !== 'undefined')
        {
            console.log.apply(console,arguments || []);
        }
    },
    /**
     * Creates an Error object (but does not throw it).
     * @alias ActiveSupport.createError
     * @param {String} message
     * @return {null}
     */
    createError: function createError(message)
    {
        return new Error(message);
    },
    /**
     * @alias ActiveSupport.logErrors
     * @property {Boolean}
     */
    logErrors: true,
    /**
     * @alias ActiveSupport.throwErrors
     * @property {Boolean}
     */
    throwErrors: true,
    /**
     * Accepts a variable number of arguments, that may be logged and thrown in
     * @alias ActiveSupport.throwError
     * @param {Error} error
     * @return {null}
     */
    throwError: function throwError(error)
    {
        if(typeof(error) == 'string')
        {
            error = new Error(error);
        }
        var error_arguments = ActiveSupport.arrayFrom(arguments).slice(1);
        if(ActiveSupport.logErrors)
        {
            ActiveSupport.log.apply(ActiveSupport,['Throwing error:',error].concat(error_arguments));
        }
        if(ActiveSupport.throwErrors)
        {
            var e = ActiveSupport.clone(error);
            e.message = e.message + error_arguments.join(',');
            throw e;
        }
    },
    /**
     * Returns an array from an array or array like object.
     * @alias ActiveSupport.arrayFrom
     * @param {Object} object
     *      Any iterable object (Array, NodeList, arguments)
     * @return {Array}
     */
    arrayFrom: function arrayFrom(object)
    {
        if(!object)
        {
            return [];
        }
        var length = object.length || 0;
        var results = new Array(length);
        while (length--)
        {
            results[length] = object[length];
        }
        return results;
    },
    /**
     * @alias ActiveSupport.isArray
     * @param {mixed} object
     * @return {Boolean}
     */
    isArray: function isArray(object)
    {
        return object && typeof(object) == 'object' && 'length' in object && 'splice' in object && 'join' in object;
    },
    /**
     * Emulates Array.indexOf for implementations that do not support it.
     * @alias ActiveSupport.indexOf
     * @param {Array} array
     * @param {mixed} item
     * @return {Number}
     */
    indexOf: function indexOf(array,item,i)
    {
        i = i || (0);
        var length = array.length;
        if(i < 0)
        {
            i = length + i;
        }
        for(; i < length; i++)
        {
            if(array[i] === item)
            {
                return i;
            }
        }
        return -1;
    },
    /**
     * Returns an array without the given item.
     * @alias ActiveSupport.without
     * @param {Array} arr
     * @param {mixed} item to remove
     * @return {Array}
     */
    without: function without(arr){
        var values = ActiveSupport.arrayFrom(arguments).slice(1);
        var response = [];
        for(var i = 0 ; i < arr.length; i++)
        {
            if(!(ActiveSupport.indexOf(values,arr[i]) > -1))
            {
                response.push(arr[i]);
            }
        }
        return response;
    },
    /**
     * Emulates Prototype's Function.prototype.bind
     * @alias ActiveSupport.bind
     * @param {Function} func
     * @param {Object} object
     *      object will be in scope as "this" when func is called.
     * @return {Function}
     */
    bind: function bind(func, object)
    {
        func.bind = function bind()
        {
            if (arguments.length < 2 && typeof(arguments[0]) === "undefined")
            {
                return this;
            }
            var __method = this;
            var args = ActiveSupport.arrayFrom(arguments);
            var object = args.shift();
            return function bound()
            {
                return __method.apply(object, args.concat(ActiveSupport.arrayFrom(arguments)));
            };
        };
        return func.bind(object);
    },
    /**
     * Emulates Prototype's Function.prototype.curry.
     * @alias ActiveSupport.curry
     * @param {Function} func
     * @return {Function}
     */
    curry: function curry(func)
    {
        func.curry = function curry()
        {
            if (!arguments.length)
            {
                return this;
            }
            var __method = this;
            var args = ActiveSupport.arrayFrom(arguments);
            return function curried()
            {
                return __method.apply(this, args.concat(ActiveSupport.arrayFrom(arguments)));
            };
        };
        return func.curry.apply(func, ActiveSupport.arrayFrom(arguments).slice(1));
    },
    /**
     * Returns a function wrapped around the original function.
     * @alias ActiveSupport.wrap
     * @param {Function} func
     * @param {Function} wrapper
     * @return {Function} wrapped
     * @example
     *
     *     String.prototype.capitalize = String.prototype.capitalize.wrap( 
     *     function(proceed, eachWord) { 
     *         if (eachWord && this.include(" ")) {
     *             // capitalize each word in the string
     *             return this.split(" ").invoke("capitalize").join(" ");
     *         } else {
     *             // proceed using the original function
     *             return proceed(); 
     *         }
     *     });
     */
    wrap: function wrap(func,wrapper)
    {
        func.wrap = function wrap(wrapper){
            var __method = this;
            return function wrapped(){
                return wrapper.apply(this,[ActiveSupport.bind(__method,this)].concat(ActiveSupport.arrayFrom(arguments)));
            };
        };
        return func.wrap(wrapper);
    },
    /**
     * Returns an array of keys from an object.
     * @alias ActiveSupport.keys
     * @param {Object} object
     * @return {Array}
     */
    keys: function keys(object)
    {
        var keysArray = [];
        for (var property in object)
        {
            keysArray.push(property);
        }
        return keysArray;
    },
    /**
     * Emulates Prototype's String.prototype.underscore
     * @alias ActiveSupport.underscore
     * @param {String} str
     * @return {String}
     */
    underscore: function underscore(str)
    {
        return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, function(match){
            match = match.split("");
            return match[0] + '_' + match[1];
        }).replace(/([a-z\d])([A-Z])/g, function(match){
            match = match.split("");
            return match[0] + '_' + match[1];
        }).replace(/-/g, '_').toLowerCase();
    },
    /**
     * Emulates Prototype's String.prototype.camelize
     * @alias ActiveSupport.camelize
     * @param {String} str
     * @param {Boolean} [capitalize]
     * @return {String}
     */
    camelize: function camelize(str, capitalize){
        var camelized,
            parts = str.replace(/\_/g,'-').split('-'), len = parts.length;
        if (len === 1)
        {
            if(capitalize)
            {
                return parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
            }
            else
            {
                return parts[0];
            }
        }
        if(str.charAt(0) === '-')
        {
            camelized = parts[0].charAt(0).toUpperCase() + parts[0].substring(1);
        }
        else
        {
            camelized = parts[0];
        }
        for (var i = 1; i < len; i++)
        {
            camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
        }
        if(capitalize)
        {
            return camelized.charAt(0).toUpperCase() + camelized.substring(1);
        }
        else
        {
            return camelized;
        }
    },
    /**
     * Emulates Prototype's Object.extend
     * @alias ActiveSupport.extend
     * @param {Object} destination
     * @param {Object} source
     * @return {Object}
     */
    extend: function extend(destination, source)
    {
        for (var property in source)
        {
            destination[property] = source[property];
        }
        return destination;
    },
    /**
     * Emulates Prototype's Object.clone
     * @alias ActiveSupport.clone
     * @param {Object} object
     * @return {Object}
     */
    clone: function clone(object)
    {
        return ActiveSupport.extend({}, object);
    },
    
    /**
     * If the value passed is a function the value passed will be returned,
     * otherwise a function returning the value passed will be returned.
     * @alias ActiveSupport.proc
     * @param {mixed} proc
     * @return {Function}
     */
    proc: function proc(proc)
    {
        return typeof(proc) === 'function' ? proc : function(){return proc;};
    },
    
    /**
     * If the value passed is a function, the function is called and the value
     * returned, otherwise the value passed in is returned.
     * @alias ActiveSupport.value
     * @param {mixed} value
     * @return {scalar}
     */
    value: function value(value)
    {
        return typeof(value) === 'function' ? value() : value;
    },
    
    /**
     * If it is the last argument of current function is a function, it will be
     * returned. You can optionally specify the number of calls in the stack to
     * look up.
     * @alias ActiveSupport.block
     * @param {Number} [levels]
     * @return {mixed}
     */
    block: function block(args)
    {
        if(typeof(args) === 'number' || !args)
        {
            var up = arguments.callee;
            for(var i = 0; i <= (args || 0); ++i)
            {
                up = up.caller;
                if(!up)
                {
                    return false;
                }
            }
            args = up.arguments;
        }
        return (args.length === 0 || typeof(args[args.length - 1]) !== 'function') ? false : args[args.length - 1];
    },
    
    /**
     * @alias ActiveSupport.synchronize
     */
    synchronize: function synchronize(execute,finish)
    {
        var scope = {};
        var stack = [];
        stack.waiting = {};
        stack.add = function add(callback){
            var wrapped = ActiveSupport.wrap(callback || function(){},function synchronizationWrapper(proceed){
                var i = null;
                var index = ActiveSupport.indexOf(stack,wrapped);
                stack.waiting[index] = [proceed,ActiveSupport.arrayFrom(arguments)];
                var all_present = true;
                for(i = 0; i < stack.length; ++i)
                {
                    if(!stack.waiting[i])
                    {
                        all_present = false;
                    }
                }
                if(all_present)
                {
                    for(i = 0; i < stack.length; ++i)
                    {
                        var item = stack.waiting[i];
                        item[0].apply(item[0],item[1]);
                        delete stack.waiting[i];
                    }
                }
                if(all_present && i === stack.length)
                {
                    if(finish)
                    {
                        finish(scope);
                    }
                }
            });
            stack.push(wrapped);
            return wrapped;
        };
        execute(stack,scope);
        if(stack.length === 0 && finish)
        {
            finish(scope);
        }
    },
    
    /**
     * @namespace {ActiveSupport.Inflector} A port of Rails Inflector class.
     */
    Inflector: {
        Inflections: {
            plural: [
                [/(quiz)$/i,               "$1zes"  ],
                [/^(ox)$/i,                "$1en"   ],
                [/([m|l])ouse$/i,          "$1ice"  ],
                [/(matr|vert|ind)ix|ex$/i, "$1ices" ],
                [/(x|ch|ss|sh)$/i,         "$1es"   ],
                [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
                [/(hive)$/i,               "$1s"    ],
                [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
                [/sis$/i,                  "ses"    ],
                [/([ti])um$/i,             "$1a"    ],
                [/(buffal|tomat)o$/i,      "$1oes"  ],
                [/(bu)s$/i,                "$1ses"  ],
                [/(alias|status)$/i,       "$1es"   ],
                [/(octop|vir)us$/i,        "$1i"    ],
                [/(ax|test)is$/i,          "$1es"   ],
                [/s$/i,                    "s"      ],
                [/$/,                      "s"      ]
            ],
            singular: [
                [/(quiz)zes$/i,                                                    "$1"     ],
                [/(matr)ices$/i,                                                   "$1ix"   ],
                [/(vert|ind)ices$/i,                                               "$1ex"   ],
                [/^(ox)en/i,                                                       "$1"     ],
                [/(alias|status)es$/i,                                             "$1"     ],
                [/(octop|vir)i$/i,                                                 "$1us"   ],
                [/(cris|ax|test)es$/i,                                             "$1is"   ],
                [/(shoe)s$/i,                                                      "$1"     ],
                [/(o)es$/i,                                                        "$1"     ],
                [/(bus)es$/i,                                                      "$1"     ],
                [/([m|l])ice$/i,                                                   "$1ouse" ],
                [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
                [/(m)ovies$/i,                                                     "$1ovie" ],
                [/(s)eries$/i,                                                     "$1eries"],
                [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
                [/([lr])ves$/i,                                                    "$1f"    ],
                [/(tive)s$/i,                                                      "$1"     ],
                [/(hive)s$/i,                                                      "$1"     ],
                [/([^f])ves$/i,                                                    "$1fe"   ],
                [/(^analy)ses$/i,                                                  "$1sis"  ],
                [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
                [/([ti])a$/i,                                                      "$1um"   ],
                [/(n)ews$/i,                                                       "$1ews"  ],
                [/s$/i,                                                            ""       ]
            ],
            irregular: [
                ['move',   'moves'   ],
                ['sex',    'sexes'   ],
                ['child',  'children'],
                ['man',    'men'     ],
                ['person', 'people'  ]
            ],
            uncountable: [
                "sheep",
                "fish",
                "series",
                "species",
                "money",
                "rice",
                "information",
                "equipment"
            ]
        },
        /**
         * Generates an orginalized version of a number as a string (9th, 2nd, etc)
         * @alias ActiveSupport.Inflector.ordinalize
         * @param {Number} number
         * @return {String}
         */
        ordinalize: function ordinalize(number)
        {
            if (11 <= parseInt(number, 10) % 100 && parseInt(number, 10) % 100 <= 13)
            {
                return number + "th";
            }
            else
            {
                switch (parseInt(number, 10) % 10)
                {
                    case  1: return number + "st";
                    case  2: return number + "nd";
                    case  3: return number + "rd";
                    default: return number + "th";
                }
            }
        },
        /**
         * Generates a plural version of an english word.
         * @alias ActiveSupport.Inflector.pluralize
         * @param {String} word
         * @return {String}
         */
        pluralize: function pluralize(word)
        {
            var i;
            for (i = 0; i < ActiveSupport.Inflector.Inflections.uncountable.length; i++)
            {
                var uncountable = ActiveSupport.Inflector.Inflections.uncountable[i];
                if (word.toLowerCase === uncountable)
                {
                    return uncountable;
                }
            }
            for (i = 0; i < ActiveSupport.Inflector.Inflections.irregular.length; i++)
            {
                var singular = ActiveSupport.Inflector.Inflections.irregular[i][0];
                var plural = ActiveSupport.Inflector.Inflections.irregular[i][1];
                if ((word.toLowerCase === singular) || (word === plural))
                {
                    return plural;
                }
            }
            for (i = 0; i < ActiveSupport.Inflector.Inflections.plural.length; i++)
            {
                var regex = ActiveSupport.Inflector.Inflections.plural[i][0];
                var replace_string = ActiveSupport.Inflector.Inflections.plural[i][1];
                if (regex.test(word))
                {
                    return word.replace(regex, replace_string);
                }
            }
        },
        /**
         * Generates a singular version of an english word.
         * @alias ActiveSupport.Inflector.singularize
         * @param {String} word
         * @return {String}
         */
        singularize: function singularize(word) {
            var i;
            for (i = 0; i < ActiveSupport.Inflector.Inflections.uncountable.length; i++)
            {
                var uncountable = ActiveSupport.Inflector.Inflections.uncountable[i];
                if (word.toLowerCase === uncountable)
                {
                    return uncountable;
                }
            }
            for (i = 0; i < ActiveSupport.Inflector.Inflections.irregular.length; i++)
            {
                var singular = ActiveSupport.Inflector.Inflections.irregular[i][0];
                var plural   = ActiveSupport.Inflector.Inflections.irregular[i][1];
                if ((word.toLowerCase === singular) || (word === plural))
                {
                    return plural;
                }
            }
            for (i = 0; i < ActiveSupport.Inflector.Inflections.singular.length; i++)
            {
                var regex = ActiveSupport.Inflector.Inflections.singular[i][0];
                var replace_string = ActiveSupport.Inflector.Inflections.singular[i][1];
                if (regex.test(word))
                {
                    return word.replace(regex, replace_string);
                }
            }
        }
    },
    /*
     * Date Format 1.2.2
     * (c) 2007-2008 Steven Levithan <stevenlevithan.com>
     * MIT license
     * Includes enhancements by Scott Trenda <scott.trenda.net> and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * http://blog.stevenlevithan.com/archives/date-time-format
     * 
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */
     
    /**
     * See: http://blog.stevenlevithan.com/archives/date-time-format
     * 
     * If convert_to_local_time is true the Date object will be assume to be GMT
     * and be converted from GMT to the local time. Local time will be the local
     * time of the server if running server side, or local time of the client
     * side if running in the browser.
     * @alias ActiveSupport.dateFormat
     * @param {Date} date
     * @param {String} format
     * @param {Boolean} [convert_to_local_time]
     * @return {String}
     * @example
     *     ActiveSupport.dateFormat('yyyy-mm-dd HH:MM:ss');
     */
    dateFormat: function date_format_wrapper()
    {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-\+]\d{4})?)\b/g,
            timezoneClip = /[^\-\+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = "0" + val;
                }
                return val;
            };

        // Regexes and supporting functions are cached through closure
        var dateFormat = function dateFormat(date, mask, utc) {
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length === 1 && (typeof date === "string" || date instanceof String) && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) {
                return ActiveSupport.throwError(new SyntaxError("invalid date"));
            }

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) === "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
        
        // Some common format strings
        dateFormat.masks = {
            "default":      "ddd mmm dd yyyy HH:MM:ss",
            shortDate:      "m/d/yy",
            mediumDate:     "mmm d, yyyy",
            longDate:       "mmmm d, yyyy",
            fullDate:       "dddd, mmmm d, yyyy",
            shortTime:      "h:MM TT",
            mediumTime:     "h:MM:ss TT",
            longTime:       "h:MM:ss TT Z",
            isoDate:        "yyyy-mm-dd",
            isoTime:        "HH:MM:ss",
            isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
            MySQL:          "yyyy-mm-dd HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        };

        // Internationalization strings
        dateFormat.i18n = {
            dayNames: [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            monthNames: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ]
        };
        
        return dateFormat;
    }(),
    /**
     * Serializes an object to a JSON string.
     * @alias ActiveSupport.JSONFromObject
     * @param {Object} object
     * @return {String} json
     */ 
    JSONFromObject: function JSONFromObject(object)
    {
        return ActiveSupport.JSON.stringify(object);
    },
    /**
     * Serializes an object to an XML string.
     * @alias ActiveSupport.XMLFromObject
     * @param {String} outer_key_name
     * @param {Object} object
     * @return {String} xml
     */ 
    XMLFromObject: function XMLFromObject(outer_key_name,object)
    {
        var indent = 0;
        
        var str_repeat = function str_repeat(string,repeat)
        {
            var response = '';
            for(var i = 0; i < repeat; ++i)
            {
                response += string;
            }
            return response;
        };
        
        var serialize_value = function serialize_value(key_name,value,indent)
        {
            var response = '';
            if(typeof(value) === 'string' || typeof(value) === 'number' || typeof(value) === 'boolean')
            {
                response = '<![CDATA[' + (new String(value)).toString() + ']]>';
            }
            else if(typeof(value) === 'object')
            {
                response += String.fromCharCode(10);
                if('length' in value && 'splice' in value)
                {
                    for(var i = 0; i < value.length; ++i)
                    {
                        response += wrap_value(ActiveSupport.Inflector.singularize(key_name) || key_name,value[i],indent + 1);
                    }
                }
                else
                {
                    var object = value.toObject && typeof(value.toObject) === 'function' ? value.toObject() : value;
                    for(key_name in object)
                    {
                        response += wrap_value(key_name,object[key_name],indent + 1);
                    }
                }
                response += str_repeat(' ',4 * indent);
            }
            return response;
        };
        
        var sanitize_key_name = function sanitize_key_name(key_name)
        {
            return key_name.replace(/[\s\_]+/g,'-').toLowerCase();
        };
        
        var wrap_value = function wrap_value(key_name,value,indent)
        {
            key_name = sanitize_key_name(key_name);
            return str_repeat(' ',4 * indent) + '<' + key_name + '>' + serialize_value(key_name,value,indent) + '</' + key_name + '>' + String.fromCharCode(10);
        };
        
        outer_key_name = sanitize_key_name(outer_key_name);
        return '<' + outer_key_name + '>' + serialize_value(outer_key_name,object,0) + '</' + outer_key_name + '>';
    },
    /*
        http://www.JSON.org/json2.js
        2008-07-15

        Public Domain.

        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

        See http://www.JSON.org/js.html

        This file creates a global JSON object containing two methods: stringify
        and parse.

            JSON.stringify(value, replacer, space)
                value       any JavaScript value, usually an object or array.

                replacer    an optional parameter that determines how object
                            values are stringified for objects. It can be a
                            function or an array.

                space       an optional parameter that specifies the indentation
                            of nested structures. If it is omitted, the text will
                            be packed without extra whitespace. If it is a number,
                            it will specify the number of spaces to indent at each
                            level. If it is a string (such as '\t' or '&nbsp;'),
                            it contains the characters used to indent at each level.

                This method produces a JSON text from a JavaScript value.

                When an object value is found, if the object contains a toJSON
                method, its toJSON method will be called and the result will be
                stringified. A toJSON method does not serialize: it returns the
                value represented by the name/value pair that should be serialized,
                or undefined if nothing should be serialized. The toJSON method
                will be passed the key associated with the value, and this will be
                bound to the object holding the key.

                For example, this would serialize Dates as ISO strings.

                    Date.prototype.toJSON = function (key) {
                        function f(n) {
                            // Format integers to have at least two digits.
                            return n < 10 ? '0' + n : n;
                        }

                        return this.getUTCFullYear()   + '-' +
                             f(this.getUTCMonth() + 1) + '-' +
                             f(this.getUTCDate())      + 'T' +
                             f(this.getUTCHours())     + ':' +
                             f(this.getUTCMinutes())   + ':' +
                             f(this.getUTCSeconds())   + 'Z';
                    };

                You can provide an optional replacer method. It will be passed the
                key and value of each member, with this bound to the containing
                object. The value that is returned from your method will be
                serialized. If your method returns undefined, then the member will
                be excluded from the serialization.

                If the replacer parameter is an array, then it will be used to
                select the members to be serialized. It filters the results such
                that only members with keys listed in the replacer array are
                stringified.

                Values that do not have JSON representations, such as undefined or
                functions, will not be serialized. Such values in objects will be
                dropped; in arrays they will be replaced with null. You can use
                a replacer function to replace those with JSON values.
                JSON.stringify(undefined) returns undefined.

                The optional space parameter produces a stringification of the
                value that is filled with line breaks and indentation to make it
                easier to read.

                If the space parameter is a non-empty string, then that string will
                be used for indentation. If the space parameter is a number, then
                the indentation will be that many spaces.

                Example:

                text = JSON.stringify(['e', {pluribus: 'unum'}]);
                // text is '["e",{"pluribus":"unum"}]'


                text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
                // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

                text = JSON.stringify([new Date()], function (key, value) {
                    return this[key] instanceof Date ?
                        'Date(' + this[key] + ')' : value;
                });
                // text is '["Date(---current time---)"]'


            JSON.parse(text, reviver)
                This method parses a JSON text to produce an object or array.
                It can throw a SyntaxError exception.

                The optional reviver parameter is a function that can filter and
                transform the results. It receives each of the keys and values,
                and its return value is used instead of the original value.
                If it returns what it received, then the structure is not modified.
                If it returns undefined then the member is deleted.

                Example:

                // Parse the text. Values that look like ISO date strings will
                // be converted to Date objects.

                myData = JSON.parse(text, function (key, value) {
                    var a;
                    if (typeof value === 'string') {
                        a =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                        if (a) {
                            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                                +a[5], +a[6]));
                        }
                    }
                    return value;
                });

                myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                    var d;
                    if (typeof value === 'string' &&
                            value.slice(0, 5) === 'Date(' &&
                            value.slice(-1) === ')') {
                        d = new Date(value.slice(5, -1));
                        if (d) {
                            return d;
                        }
                    }
                    return value;
                });


        This is a reference implementation. You are free to copy, modify, or
        redistribute.

        This code should be minified before deployment.
        See http://javascript.crockford.com/jsmin.html

        USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
        NOT CONTROL.
    */
    
    /**
     * @namespace {ActiveSupport.JSON} Provides JSON support if a native implementation is not available.
     */
    JSON: function()
    {
        //use native support if available
        if(global_context && 'JSON' in global_context && 'stringify' in global_context.JSON && 'parse' in global_context.JSON)
        {
            return global_context.JSON;
        }
        
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }
        
        Date.prototype.toJSON = function (key) {
            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;
        
        function quote(string) {
            escapeable.lastIndex = 0;
            return escapeable.test(string) ?
                '"' + string.replace(escapeable, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        }
        
        function str(key, holder) {
            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];
            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function' && !ActiveSupport.isArray(value)) {
                value = value.toJSON(key);
            }
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }
            switch (typeof value) {
            case 'string':
                return quote(value.valueOf());
            case 'number':
                return isFinite(value) ? String(value.valueOf()) : 'null';
            case 'boolean':
                return String(value.valueOf());
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                                partial.join(',\n' + gap) + '\n' +
                                    mind + ']' :
                              '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                            mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }
        
        return {
            /**
             * @alias ActiveSupport.JSON.stringify
             * @param {Object} value
             * @return {String}
             */
            stringify: function (value, replacer, space) {
                var i;
                gap = '';
                indent = '';
                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }
                } else if (typeof space === 'string') {
                    indent = space;
                }
                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                         typeof replacer.length !== 'number')) {
                    return ActiveSupport.throwError(new Error('JSON.stringify'));
                }
                return str('', {'': value});
            },
            /**
             * @alias ActiveSupport.JSON.parse
             * @param {String} text
             * @return {Object}
             */
            parse: function (text, reviver) {
                var j;
                
                function walk(holder, key) {
                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }
                
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' + ('0000' +
                                (+(a.charCodeAt(0))).toString(16)).slice(-4);
                    });
                }
                if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                    j = eval('(' + text + ')');
                    return typeof reviver === 'function' ?
                        walk({'': j}, '') : j;
                }
                return ActiveSupport.throwError(new SyntaxError('JSON.parse'));
            }
        };
    }()
};

})(this);

/**
 * @namespace {ActiveEvent}
 * @example
 * ActiveEvent allows you to create observable events, and attach event
 * handlers to any class or object.
 *
 * Setup
 * -----
 * Before you can use ActiveEvent you must call extend a given class or object
 * with ActiveEvent's methods. If you extend a class, both the class itself
 * will become observable, as well as all of it's instances.
 *
 *     ActiveEvent.extend(MyClass); //class and all instances are observable
 *     ActiveEvent.extend(my_object); //this object becomes observable
 * 
 * Creating Events
 * ---------------
 * You can create an event inside any method of your class or object by calling
 * the notify() method with name of the event followed by any arguments to be
 * passed to observers. You can also have an existing method fire an event with
 * the same name as the method using makeObservable().
 * 
 *     var Message = function(){};
 *     Message.prototype.send = function(text){
 *         //message sending code here...
 *         this.notify('sent',text);
 *     };
 *     ActiveEvent.extend(Message);
 * 
 *     //make an existing method observable
 *     var observable_hash = new Hash({});
 *     ActiveEvent.extend(observable_hash);
 *     observable_hash.makeObservable('set');
 * 
 * Observing Events
 * ----------------
 * To observe an event call the observe() method with the name of the event you
 * want to observe, and the observer function. The observer function will
 * receive any additional arguments passed to notify(). If observing a class,
 * the instance that triggered the event will always be the first argument
 * passed to the observer. observeOnce() works just like observe() in every
 * way, but is only called once.
 * 
 *     Message.observe('sent',function(message,text){
 *         //responds to all sent messages
 *     });
 * 
 *     var m = new Message();
 *     m.observe('sent',function(text){
 *         //this will only be called when "m" is sent
 *     });
 * 
 *     observable_hash.observe('set',function(key,value){
 *         console.log('observable_hash.set: ' + key + '=' + value);
 *     });
 *     observable_hash.observeOnce(function(key,value){
 *         //this will only be called once
 *     });
 * 
 * Control Flow
 * ------------
 * When notify() is called, if any of the registered observers for that event
 * return false, no other observers will be called and notify() will return
 * false. Returning null or not calling return will not stop the event.
 *
 * Otherwise notify() will return an array of the
 * collected return values from any registered observer functions. Observers
 * can be unregistered with the stopObserving() method. If no observer is
 * passed, all observers of that object or class with the given event name
 * will be unregistered. If no event name and no observer is passed, all
 * observers of that object or class will be unregistered.
 *
 *     Message.prototype.send = function(text){
 *         if(this.notify('send',text) === false)
 *             return false;
 *         //message sending code here...
 *         this.notify('sent',text);
 *         return true;
 *     };
 * 
 *     var m = new Message();
 *     
 *     var observer = m.observe('send',function(message,text){
 *         if(text === 'test')
 *             return false;
 *     });
 *     
 *     m.send('my message'); //returned true
 *     m.send('test'); //returned false
 *     
 *     m.stopObserving('send',observer);
 *     
 *     m.send('test'); //returned true</code></pre>
 * 
 * Object.options
 * --------------
 * If an object has an options property that contains a callable function with
 * the same name as an event triggered with <b>notify()</b>, it will be
 * treated just like an instance observer. So the falling code is equivalent.
 *
 *     var rating_one = new Control.Rating('rating_one',{  
 *         afterChange: function(new_value){}    
 *     });  
 *     
 *     var rating_two = new Control.Rating('rating_two');  
 *     rating_two.observe('afterChange',function(new_value){});</code></pre>
 * 
 * MethodCallObserver
 * ------------------
 * The makeObservable() method permanently modifies the method that will
 * become observable. If you need to temporarily observe a method call without
 * permanently modifying it, use the observeMethod(). Pass the name of the
 * method to observe and the observer function will receive all of the
 * arguments passed to the method. An ActiveEvent.MethodCallObserver object is
 * returned from the call to observeMethod(), which has a stop() method on it.
 * Once stop() is called, the method is returned to it's original state. You
 * can optionally pass another function to observeMethod(), if you do the
 * MethodCallObserver will be automatically stopped when that function
 * finishes executing.
 *
 *   var h = new Hash({});
 *   ActiveEvent.extend(h);
 *   
 *   var observer = h.observeMethod('set',function(key,value){
 *       console.log(key + '=' + value);
 *   });
 *   h.set('a','one');
 *   h.set('a','two');
 *   observer.stop();
 *   
 *   //console now contains:
 *   //"a = one"
 *   //"b = two"
 *   
 *   //the following does the same as above
 *   h.observeMethod('set',function(key,value){
 *       console.log(key + '=' + value);
 *   },function(){
 *       h.set('a','one');
 *       h.set('b','two');
 *   });
 */
var ActiveEvent = null;

/**
 * @namespace {ActiveEvent.ObservableObject} After calling
 *  ActiveEvent.extend(object), the given object will inherit the
 *  methods in this namespace. If the given object has a prototype
 *  (is a class constructor), the object's prototype will inherit
 *  these methods as well.
 */

(function(){

ActiveEvent = {};

/**
 * After extending a given object, it will inherit the methods described in
 *  ActiveEvent.ObservableObject.
 * @alias ActiveEvent.extend
 * @param {Object} object
 */
ActiveEvent.extend = function extend(object){
    
    /**
     * Wraps the given method_name with a function that will call the method,
     *  then trigger an event with the same name as the method. This can
     *  safely be applied to virtually any method, including built in
     *  Objects (Array.pop, etc), but cannot be undone.
     * @alias ActiveEvent.ObservableObject.makeObservable
     * @param {String} method_name
     */
    object.makeObservable = function makeObservable(method_name)
    {
        if(this[method_name])
        {
            this._objectEventSetup(method_name);
            this[method_name] = ActiveSupport.wrap(this[method_name],function wrapped_observer(proceed){
                var args = ActiveSupport.arrayFrom(arguments).slice(1);
                var response = proceed.apply(this,args);
                args.unshift(method_name);
                this.notify.apply(this,args);
                return response;
            });
        }
        if(this.prototype)
        {
            this.prototype.makeObservable(method_name);
        }
    };
    
    /**
     * Similiar to makeObservable(), but after the callback is called, the
     *  method will be returned to it's original state and will no longer
     *  be observable.
     * @alias ActiveEvent.ObservableObject.observeMethod
     * @param {String} method_name
     * @param {Function} observe
     * @param {Function} [callback]
     */
    object.observeMethod = function observeMethod(method_name,observer,scope)
    {
        return new ActiveEvent.MethodCallObserver([[this,method_name]],observer,scope);
    };
    
    object._objectEventSetup = function _objectEventSetup(event_name)
    {
        this._observers = this._observers || {};
        this._observers[event_name] = this._observers[event_name] || [];
    };
    
    /**
     * @alias ActiveEvent.ObservableObject.observe
     * @param {String} event_name
     * @param {Function} observer
     * @return {Function} observer
     */
    object.observe = function observe(event_name,observer)
    {
        if(typeof(event_name) === 'string' && typeof(observer) !== 'undefined')
        {
            this._objectEventSetup(event_name);
            if(!(ActiveSupport.indexOf(this._observers[event_name],observer) > -1))
            {
                this._observers[event_name].push(observer);
            }
        }
        else
        {
            for(var e in event_name)
            {
                this.observe(e,event_name[e]);
            }
        }
        return observer;
    };
    
    /**
     * Removes a given observer. If no observer is passed, removes all
     *   observers of that event. If no event is passed, removes all
     *   observers of the object.
     * @alias ActiveEvent.ObservableObject.stopObserving
     * @param {String} [event_name]
     * @param {Function} [observer]
     */
    object.stopObserving = function stopObserving(event_name,observer)
    {
        this._objectEventSetup(event_name);
        if(event_name && observer)
        {
            this._observers[event_name] = ActiveSupport.without(this._observers[event_name],observer);
        }
        else if(event_name)
        {
            this._observers[event_name] = [];
        }
        else
        {
            this._observers = {};
        }
    };
    
    /**
     * Works exactly like observe(), but will stopObserving() after the next
     *   time the event is fired.
     * @alias ActiveEvent.ObservableObject.observeOnce
     * @param {String} event_name
     * @param {Function} observer
     * @return {Function} The observer that was passed in will be wrapped,
     *  this generated / wrapped observer is returned.
     */
    object.observeOnce = function observeOnce(event_name,outer_observer)
    {
        var inner_observer = ActiveSupport.bind(function bound_inner_observer(){
            outer_observer.apply(this,arguments);
            this.stopObserving(event_name,inner_observer);
        },this);
        this._objectEventSetup(event_name);
        this._observers[event_name].push(inner_observer);
        return inner_observer;
    };
    
    /**
     * Triggers event_name with the passed arguments.
     * @alias ActiveEvent.ObservableObject.notify
     * @param {String} event_name
     * @param {mixed} [args]
     * @return {mixed} Array of return values, or false if the event was
     *  stopped by an observer.
     */
    object.notify = function notify(event_name)
    {
        if(!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0))
        {
            return [];
        }
        this._objectEventSetup(event_name);
        var collected_return_values = [];
        var args = ActiveSupport.arrayFrom(arguments).slice(1);
        for(var i = 0; i < this._observers[event_name].length; ++i)
        {
            var response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
            if(response === false)
            {
                return false;
            }
            else
            {
                collected_return_values.push(response);
            }
        }
        return collected_return_values;
    };
    if(object.prototype)
    {
        object.prototype.makeObservable = object.makeObservable;
        object.prototype.observeMethod = object.observeMethod;
        object.prototype._objectEventSetup = object._objectEventSetup;
        object.prototype.observe = object.observe;
        object.prototype.stopObserving = object.stopObserving;
        object.prototype.observeOnce = object.observeOnce;
        
        object.prototype.notify = function notify(event_name)
        {
            if(
              (!object._observers || !object._observers[event_name] || (object._observers[event_name] && object._observers[event_name].length == 0)) &&
              (!this.options || !this.options[event_name]) &&
              (!this._observers || !this._observers[event_name] || (this._observers[event_name] && this._observers[event_name].length == 0))
            )
            {
                return [];
            }
            var args = ActiveSupport.arrayFrom(arguments).slice(1);
            if(object.notify)
            {
                object_args = ActiveSupport.arrayFrom(arguments).slice(1);
                object_args.unshift(this);
                object_args.unshift(event_name);
                object.notify.apply(object,object_args);
            }
            this._objectEventSetup(event_name);
            var collected_return_values = [];
            var response;
            if(this.options && this.options[event_name] && typeof(this.options[event_name]) === 'function')
            {
                response = this.options[event_name].apply(this,args);
                if(response === false)
                {
                    return false;
                }
                else
                {
                    collected_return_values.push(response);
                }
            }
            for(var i = 0; i < this._observers[event_name].length; ++i)
            {
                response = this._observers[event_name][i].apply(this._observers[event_name][i],args);
                if(response === false)
                {
                    return false;
                }
                else
                {
                    collected_return_values.push(response);
                }
            }
            return collected_return_values;
        };
    }
};

ActiveEvent.MethodCallObserver = function MethodCallObserver(methods,observer,scope)
{
    this.stop = function stop(){
        for(var i = 0; i < this.methods.length; ++i)
        {
            this.methods[i][0][this.methods[i][1]] = this.originals[i];
        }
    };
    this.methods = methods;
    this.originals = [];
    for(var i = 0; i < this.methods.length; ++i)
    {
        this.originals.push(this.methods[i][0][this.methods[i][1]]);
        this.methods[i][0][this.methods[i][1]] = ActiveSupport.wrap(this.methods[i][0][this.methods[i][1]],function(proceed){
            var args = ActiveSupport.arrayFrom(arguments).slice(1);
            observer.apply(this,args);
            return proceed.apply(this,args);
        });
    }
    if(scope)
    {
        scope();
        this.stop();
    }
};

var ObservableHash = function ObservableHash(object)
{
    this._object = object || {};
};

ObservableHash.prototype.set = function set(key,value)
{
    this._object[key] = value;
    this.notify('set',key,value);
    return value;
};

ObservableHash.prototype.get = function get(key)
{
    this.notify('get',key);
    return this._object[key];
};

ObservableHash.prototype.unset = function unset(key)
{
    this.notify('unset',key);
    var value = this._object[key];
    delete this._object[key];
    return value;
};

ObservableHash.prototype.toObject = function toObject()
{
    return this._object;
};

ActiveEvent.extend(ObservableHash);

ActiveEvent.ObservableHash = ObservableHash;

})();
 
var ActiveRoutes = null;

(function() {
 
/**
 * @alias ActiveRoutes
 * @constructor
 * @param {Array} routes
 * @param {Object} [scope] defaults to window
 * @param {Object} [options]
 * @return {ActiveRoutes}
 * @example
 * ActiveRoutes maps URI strings to method calls, and visa versa. It shares a
 * similar syntax to Rails Routing, but is framework agnostic and can map
 * calls to any type of object. Server side it can be used to map requests for
 * a given URL to a method that will render a page, client side it can be used
 * to provide deep linking and back button / history support for your Ajax
 * application.
 * 
 * Options
 * -------
 * You can pass a hash of options as the third parameter to the ActiveRoutes
 * constructor. This hash can contain the following keys:
 * 
 * - base: default '', the default path / url prefix to be used in a generated url
 * - classSuffix: default '' if it was "Controller", calling "/blog/post/5" would call BlogController.post instead of Blog.post
 * - dispatcher: default ActiveRoutes.prototype.defaultDispatcher, the dispatcher function to be called when dispatch() is called and a route is found
 * - camelizeObjectName: default true, if true, trying to call "blog_controller" through routes will call "BlogController"
 * - camelizeMethodName: default true, if true, trying to call "my_method_name" through routes will call "myMethodName"
 * - camelizeGeneratedMethods: default true, will export generated methods into the scope as "articleUrl" instead of "article_url"
 *
 * Declaring Routes
 * ----------------
 * Wether declared in the constructor, or with addRoute(), routes can have up
 * to three parameters, and can be declared in any of the follow ways:
 * 
 * - "name", "path", {params}
 * - "path", {params}
 * - "path"
 * 
 * The path portion of a route is a URI string. Parameters that will be passed
 * to the method called are represented with a colon. Names are optional, but
 * the path and the params together must declare "object" and "method"
 * parameters. The following are all valid routes:
 * 
 *     var routes = new ActiveRoutes([
 *       ['root','/',{object:'Pages',method:'index'}],
 *       ['contact','/contact',{object:'Pages',method:'contact'}],
 *       ['blog','/blog',{object:'Blog',method:'index'}],
 *       ['post','/blog/post/:id',{object:'Blog',method:'post'}],
 *       ['/pages/*',{object:'Pages',method:'page'}],
 *       ['/:object/:method']
 *     ],Application);
 * 
 * Catch All Routes
 * ----------------
 * If you want to route all requests below a certain path to a given method,
 * place an asterisk in your route. When a matching path is dispatched to
 * that route the path components will be available in an array called "path".
 * 
 *     route_set.addRoute('/wiki/*',{object:'WikiController',method:'page'})
 *     route_set.dispatch('/wiki/a/b/c');
 *     //calls: WikiController.page({object:'WikiController',method:'page',path:['a','b','c']})
 * 
 * Route Requirements
 * ------------------
 * Each route can take a special "requirements" parameter that will not be
 * passed in the params passed to the called method. Each requirement
 * can be a regular expression or a function, which the value of the
 * parameter will be checked against. Each value checked by a regular
 * expression or function is always a string.
 * 
 *     route_set.addRoute('/article/:article_id/:comment_id,{
 *         article_id: /^\d+$/,
 *         comment_id: function(comment_id){
 *             return comment_id.match(/^\d+$/);
 *         }
 *     });
 * 
 * Scope
 * -----
 * You can specify what scope an ActiveRoutes instance will look in to call
 * the specified objects and methods. This defaults to window but can be
 * specified as the second parameter to the constructor.
 * 
 * Generating URLs
 * ---------------
 * The method urlFor() is available on every route set, and can generate a
 * URL from an object. Using the routes declared in the example above:
 * 
 *     routes.urlFor({object:'Blog',method:'post',id:5}) == '/blog/post/5';
 * 
 * If named routes are given, corresponding methods are generated in the
 * passed scope to resolve these urls.
 * 
 *     Application.postUrl({id: 5}) == '/blog/post/5';
 * 
 * To get the params to generate a url, a similar method is generated:
 * 
 *     Application.postParams({id: 5}) == {object:'Blog',method:'post',id:5};
 * 
 * To call a named route directly without round-tripping to a string and
 * back to params use:
 * 
 *     Application.callPost({id: 5});
 *
 * Dispatching
 * -----------
 * To call a given method from a URL string, use the dispatch() method.
 * 
 *     routes.dispatch('/'); //will call Pages.index()
 *     routes.dispatch('/blog/post/5'); //will call Blog.post({id: 5});
 * 
 * History
 * -------
 * Most server side JavaScript implementations will not preserve objects
 * between requests, so the history is not of use. Client side, after each
 * dispatch, the route and parameters are recorded. The history itself is
 * accessible with the "history" property, and is traversable with the
 * next() and back() methods.
 */
ActiveRoutes = function initialize(routes,scope,options)
{
    this.initialized = false;
    this.error = false;
    this.scope = scope || ActiveSupport.getGlobalContext();
    this.routes = [];
    this.index = 0;
    /**
     * @alias ActiveRoutes.prototype.history
     * @property {Array}
     */
    this.history = [];
    this.options = ActiveSupport.extend({
        classSuffix: '',
        camelizeObjectName: true,
        camelizeMethodName: true,
        camelizeGeneratedMethods: true,
        base: '',
        dispatcher: this.defaultDispatcher
    },options || {});
    this.dispatcher = this.options.dispatcher;
    var i;
    for(i = 0; i < routes.length; ++i)
    {
        if(routes[i]) //fix for accidental trailing commas in IE arrays
        {
            this.addRoute.apply(this,routes[i]);
        }
    }
    var current_route_set = this;
    this.scope[this.options.camelizeGeneratedMethods ? 'urlFor' : 'url_for'] = function generatedUrlFor(){
        current_route_set.urlFor.apply(current_route_set,arguments);
    };
    this.initialized = true;
};
ActiveEvent.extend(ActiveRoutes);

/**
 * @alias ActiveRoutes.logging
 * @property {Boolean}
 */
ActiveRoutes.logging = false;

ActiveRoutes.prototype.goToIndex = function goToIndex(index)
{
    if(!this.history[index])
    {
        return false;
    }
    this.index = index;
    this.dispatcher(this.history[this.index]);
    return true;
};

/**
 * Calls to the previous dispatched route in the history.
 * @alias ActiveRoutes.prototype.back
 * @return {Boolean}
 */
ActiveRoutes.prototype.back = function back()
{
    if(this.index == 0)
    {
        return false;
    }
    --this.index;
    this.dispatcher(this.history[this.index]);
    return true;
};

/**
 * Calls to the next dispatched route in the history if back() has already
 * been called.
 * @alias ActiveRoutes.prototype.next
 * @return {Boolean}
 */
ActiveRoutes.prototype.next = function next()
{
    if(this.index >= this.history.length - 1)
    {
        return false;
    }
    ++this.index;
    this.dispatcher(this.history[this.index]);
    return true;
};

/**
 * If match() returns false, the error it generates can be retrieved with this
 *  function.
 * @alias ActiveRoutes.prototype.getError
 * @return {mixed} String or null
 */
ActiveRoutes.prototype.getError = function getError()
{
    return this.error;
};

/**
 * Add a new route to the route set. When adding routes via the constructor
 * routes will be pushed onto the array, if called after the route set is
 * initialized, the route will be unshifted onto the route set (and will
 * have the highest priority).
 * @alias ActiveRoutes.prototype.addRoute
 * @exception {ActiveRoutes.Errors.NoPathInRoute}
 * @exception {ActiveRoutes.Errors.NoObjectInRoute}
 * @exception {ActiveRoutes.Errors.NoMethodInRoute}
 * @example
 * routes.addRoute('route_name','/route/path',{params});<br/>
 * routes.addRoute('/route/path',{params});<br/>
 * routes.addRoute('/route/path');
 */
ActiveRoutes.prototype.addRoute = function addRoute()
{
    var name,path,params,route;
    if(arguments.length == 3)
    {
        name = arguments[0];
        path = arguments[1];
        params = arguments[2];
    }
    else if(arguments.length == 2)
    {
        if(typeof(arguments[0]) == 'string' && typeof(arguments[1]) == 'string')
        {
            name = arguments[0];
            path = arguments[1];
        }
        else
        {
            path = arguments[0];
            params = arguments[1];
        }
    }
    else if(arguments.length == 1)
    {
        path = arguments[0];
    }
    route = {
        name: name,
        path: ActiveRoutes.normalizePath(path),
        params: params || {}
    };
    if(!Validations.hasPath(route))
    {
        return ActiveSupport.throwError(Errors.NoPathInRoute);
    }
    if(!Validations.hasObject(route))
    {
        return ActiveSupport.throwError(Errors.NoObjectInRoute,route.path);
    }
    if(!Validations.hasMethod(route))
    {
        return ActiveSupport.throwError(Errors.NoMethodInRoute,route.path);
    }
    if(this.initialized)
    {
        this.routes.unshift(route);
    }
    else
    {
        this.routes.push(route);
    }
    this.generateMethodsForRoute(route);
};

ActiveRoutes.normalizePathDotDotRegexp = /[^\/\\]+[\/\\]\.\.[\/\\]/;
ActiveRoutes.normalizePath = function normalizePath(path)
{
    //remove hash
    path = path.replace(/\#.+$/,'');
    //remove query string
    path = path.replace(/\?.+$/,'');
    //remove trailing and starting slashes, replace backslashes, replace multiple slashes with a single slash
    path = path.replace(/\/{2,}/g,"/").replace(/\\\\/g,"\\").replace(/(\/|\\)$/,'').replace(/\\/g,'/').replace(/^\//,'');
    while(path.match(ActiveRoutes.normalizePathDotDotRegexp))
    {
        path = path.replace(ActiveRoutes.normalizePathDotDotRegexp,'');
    }
    //replace /index with /
    path = path.replace(/(\/index$|^index$)/i,'');
    return path;
};

var Errors = {
    NoPathInRoute: ActiveSupport.createError('No path was specified in the route'),
    NoObjectInRoute: ActiveSupport.createError('No :object was specified in the route: '),
    NoMethodInRoute: ActiveSupport.createError('No :method was specified in the route: '),
    ObjectDoesNotExist: ActiveSupport.createError('The following object does not exist: '),
    MethodDoesNotExist: ActiveSupport.createError('The following method does not exist: '),
    MethodNotCallable: ActiveSupport.createError('The following method is not callable: '),
    NamedRouteDoesNotExist: ActiveSupport.createError('The following named route does not exist: '),
    UnresolvableUrl: ActiveSupport.createError('Could not resolve the url: ')
};
ActiveRoutes.Errors = Errors;

ActiveRoutes.prototype.checkAndCleanRoute = function checkAndCleanRoute(route,original_path)
{
    if(!route.params.method)
    {
        route.params.method = 'index';
    }
    if(this.options.camelizeObjectName)
    {
        route.params.object = ActiveSupport.camelize(route.params.object,true);
    }
    if(route.params.requirements)
    {
        delete route.params.requirements;
    }
    if(this.options.classSuffix)
    {
        route.params.object += this.options.classSuffix;
    }
    if(!this.objectExists(route.params.object))
    {
        this.error = Errors.ObjectDoesNotExist + route.params.object;
    }
    if(!this.methodExists(route.params.object,route.params.method))
    {
        this.error = Errors.MethodDoesNotExist + route.params.object + '.' + route.params.method;
    }
    if(!this.methodCallable(route.params.object,route.params.method))
    {
        this.error = Errors.MethodNotCallable + route.params.object + '.' + route.params.method;
    }
    if(this.error)
    {
        if(ActiveRoutes.logging)
        {
            ActiveSupport.log('ActiveRoutes: No match for "' + original_path + '" (' + this.error + ')');
        }
        return false;
    }
    else
    {
        if(ActiveRoutes.logging)
        {
            ActiveSupport.log('ActiveRoutes: matched "' + original_path + '" with "' + (route.name || route.path) + '"');
        }
        return route;
    }
};

/**
 * @alias ActiveRoutes.prototype.match
 * @param {String} path
 * @return {mixed} false if no match, otherwise the matching route.
 * @example
 * var route = routes.match('/blog/post/5');<br/>
 * route == {object: 'blog',method: 'post', id: 5};
 */
ActiveRoutes.prototype.match = function(path){
    var original_path = path;
    this.error = false;
    //make sure the path is a copy
    path = ActiveRoutes.normalizePath((new String(path)).toString());
    //handle extension
    var extension = path.match(/\.([^\.]+)$/);
    if(extension)
    {
        extension = extension[1];
        path = path.replace(/\.[^\.]+$/,'');
    }
    var path_components = path.split('/');
    var path_length = path_components.length;
    for(var i = 0; i < this.routes.length; ++i)
    {
        var route = ActiveSupport.clone(this.routes[i]);
        route.params = ActiveSupport.clone(this.routes[i].params || {});
        route.extension = extension;
        route.orderedParams = [];
        
        //exact match
        if(route.path == path)
        {
            return this.checkAndCleanRoute(route,original_path);
        }
        
        //perform full match
        var route_path_components = route.path.split('/');
        var route_path_length = route_path_components.length;
        var valid = true;
        //length of path components must match, but must treat "/blog", "/blog/action", "/blog/action/id" the same
        if(path_length <= route_path_length || route_path_components[route_path_components.length - 1] == '*'){
            for(var ii = 0; ii < route_path_components.length; ++ii)
            {
                var path_component = path_components[ii];
                var route_path_component = route_path_components[ii];
                //catch all
                if(route_path_component.charAt(0) == '*')
                {
                    route.params.path = path_components.slice(ii);
                    return this.checkAndCleanRoute(route,original_path); 
                }
                //named component
                else if(route_path_component.charAt(0) == ':')
                {
                    var key = route_path_component.substr(1);
                    if(path_component && route.params.requirements && route.params.requirements[key] &&
                        !(typeof(route.params.requirements[key]) == 'function'
                            ? route.params.requirements[key]((new String(path_component).toString()))
                            : path_component.match(route.params.requirements[key])))
                    {
                        valid = false;
                        break;
                    }
                    else
                    {
                        if(typeof(path_component) == 'undefined' && key != 'method' && key != 'object' && key != 'id')
                        {
                            valid = false;
                            break;
                        }
                        else
                        {
                            route.params[key] = path_component;
                            route.orderedParams.push(path_component);
                        }
                    }
                }
                else if(path_component != route_path_component)
                {
                    valid = false;
                    break;
                }
            }
            if(valid)
            {
                return this.checkAndCleanRoute(route,original_path);
            }
        }
    }
    return false;
};
 
/**
 * Will match() the given path and call the dispatcher if one is found.
 * @alias ActiveRoutes.prototype.dispatch
 * @param {String} path
 * @exception {ActiveRoutes.Errors.UnresolvableUrl}
 * @example
 *     var routes = new ActiveRoutes([['post','/blog/post/:id',{object:'blog',method: 'post'}]]);
 *     routes.dispatch('/blog/post/5');
 *     //by default calls Blog.post({object:'blog',method: 'post',id: 5});
 */
ActiveRoutes.prototype.dispatch = function dispatch(path)
{
    var route;
    if(typeof(path) == 'string')
    {
        route = this.match(path);
        if(!route)
        {
            if(this.error)
            {
                return ActiveSupport.throwError(this.error);
            }
            else
            {
                return ActiveSupport.throwError(Errors.UnresolvableUrl,path);
            }
        }
    }
    else
    {
        route = {
            params: path
        };
    }
    this.history.push(route);
    this.index = this.history.length - 1;
    if(this.notify('beforeDispatch',route,path) === false)
    {
        return false;
    }
    this.dispatcher(route);
    this.notify('afterDispatch',route,path);
};

/**
 * If no "dispatcher" key is passed into the options to contstruct a route set
 *  this is used. It will call scope.object_name.method_name(route.params)
 * @property {Function}
 * @alias ActiveRoutes.prototype.defaultDispatcher
 */
ActiveRoutes.prototype.defaultDispatcher = function defaultDispatcher(route)
{
    this.scope[route.params.object][route.params.method](route.params);
};

var Validations = {
    hasPath: function(route)
    {
        if(route.path === '')
        {
            return true;
        }
        else
        {
            return !!route.path;
        }
    },
    hasMethod: function(route)
    {
        return !(!route.path.match(':method') && (!route.params || !route.params.method));
    },
    hasObject: function(route)
    {
        return !(!route.path.match(':object') && (!route.params || !route.params.object));
    }
};

ActiveRoutes.prototype.objectExists = function(object_name)
{
    return !!ActiveSupport.getClass(object_name,this.scope);
};

ActiveRoutes.prototype.getMethod = function(object_name,method_name)
{
    if(this.scope[object_name].prototype && this.scope[object_name].prototype[method_name])
    {
        return this.scope[object_name].prototype[method_name];
    }
    else
    {
        return this.scope[object_name][method_name];
    }
};

ActiveRoutes.prototype.methodExists = function(object_name,method_name)
{
    return !(!this.objectExists(object_name) || !this.getMethod(object_name,method_name));
};

ActiveRoutes.prototype.methodCallable = function(object_name,method_name)
{
    return (this.methodExists(object_name,method_name) && (typeof(this.getMethod(object_name,method_name)) === 'function'));
};


ActiveRoutes.Validations = Validations;

ActiveRoutes.prototype.cleanPath = function cleanPath(path,params,only_path)
{
    if(!params.id)
    {
        path = path.replace(/\/?\:id/,'');
    }
    if(params.method == 'index')
    {
        path = path.replace(/\/?\:method/,'');
    }
    path = path.replace(/\/?index$/,'');
    if(path.charAt(0) != '/')
    {
        path = '/' + path;
    }
    path = only_path ? path : this.options.base + path;
    return path;
};

ActiveRoutes.performParamSubstitution = function performParamSubstitution(path,route,params)
{
    for(var p in params)
    {
        if(path.match(':' + p) && params[p])
        {
            if(route.params.requirements && route.params.requirements[p]){
                if(typeof(route.params.requirements[p]) == 'function' && !route.params.requirements[p]((new String(params[p]).toString())))
                {
                    continue;
                }
                else if(!route.params.requirements[p].exec((new String(params[p]).toString())))
                {
                    continue;
                }
            }
            path = path.replace(':' + p,params[p].toString());
        }
    }
    return path;
};

/**
 * @alias ActiveRoutes.prototype.urlFor
 * @param {Object} [params]
 * @return {String}
 * @exception {ActiveRoutes.Errors.NamedRouteDoesNotExistError}
 * @example
 * var routes = new ActiveRoutes([['post','/blog/post/:id',{object:'blog',method: 'post'}]]);<br/>
 * routes.urlFor({object: 'blog',method: 'post', id: 5}) == '/blog/post/5';
 */
ActiveRoutes.prototype.urlFor = function urlFor(params)
{
    var only_path = false;
    if(params.only_path){
        only_path = true;
        delete params.only_path;
    }
  
    //get a named route with no params
    if(typeof(params) == 'string')
    {
        var found = false;
        for(var i = 0; i < this.routes.length; ++i)
        {
            if(this.routes[i].name && this.routes[i].name == params)
            {
                found = i;
                break;
            }
        }
        if(found === false)
        {
            return ActiveSupport.throwError(Errors.NamedRouteDoesNotExistError,params);
        }
        else
        {
            var final_params = {};
            var found_params = ActiveSupport.clone(this.routes[found].params);
            for(var name in found_params)
            {
                final_params[name] = found_params[name];
            }
            if(typeof(arguments[1]) == 'object')
            {
                for(var name in arguments[1])
                {
                    final_params[name] = arguments[1][name];
                }
            }
            return this.urlFor(final_params);
        }
    }
    
    if(!params.method)
    {
        params.method = 'index';
    }
    
    if(this.options.camelizeMethodName)
    {
        params.method = ActiveSupport.camelize(params.method,false);
    }
    
    if(this.options.camelizeObjectName)
    {
        params.object = ActiveSupport.camelize(params.object,true);
    }
    
    //first past for exact match
    for(var i = 0; i < this.routes.length; ++i)
    {
        var route = ActiveSupport.clone(this.routes[i]);
        route.params = ActiveSupport.clone(this.routes[i].params || {});
        var path = route.path;
        if((route.params.method || '').toLowerCase() == (params.method || '').toLowerCase() && (route.params.object || '').toLowerCase() == (params.object || '').toLowerCase())
        {
            path = ActiveRoutes.performParamSubstitution(path,route,params);
            var cleaned = this.cleanPath(path,params,only_path);
            if(!cleaned.match(':'))
            {
                return cleaned;
            }
            
        }
    }
    //match that requires param replacement
    for(var i = 0; i < this.routes.length; ++i)
    {
        var route = ActiveSupport.clone(this.routes[i]);
        route.params = ActiveSupport.clone(this.routes[i].params || {});
        var path = route.path;
        if(route.params.object == params.object)
        {
            path = ActiveRoutes.performParamSubstitution(path,route,params);
            var cleaned = this.cleanPath(path,params,only_path);
            if(!cleaned.match(':'))
            {
                return cleaned;
            }
        }
    }
    return false;
};

ActiveRoutes.prototype.generateMethodsForRoute = function generateMethodsForRoute(route)
{
    var current_route_set = this;
    if(route.name)
    {
        var params_for_method_name = route.name + '_params';
        var url_for_method_name = route.name + '_url';
        var call_method_name = 'call_' + route.name;
        if(current_route_set.options.camelizeGeneratedMethods)
        {
            params_for_method_name = ActiveSupport.camelize(params_for_method_name.replace(/\_/g,'-'));
            url_for_method_name = ActiveSupport.camelize(url_for_method_name.replace(/\_/g,'-'));
            call_method_name = ActiveSupport.camelize(call_method_name.replace(/\_/g,'-'));
        }
        
        current_route_set.scope[params_for_method_name] = function generated_params_for(params){
            var final_params = {};
            for(var name in route.params || {})
            {
                final_params[name] = route.params[name];
            }
            for(var name in params)
            {
                final_params[name] = params[name];
            }
            return final_params;
        };
        
        current_route_set.scope[url_for_method_name] = function generated_url_for(params){
            return current_route_set.urlFor(current_route_set.scope[params_for_method_name](params));
        };
        
        current_route_set.scope[call_method_name] = function generated_call(params){
            return current_route_set.dispatch(current_route_set.scope[params_for_method_name](params));
        };
    }
};

})();
 
var ActiveRecord = null;

(function() {

/**
 * @namespace {ActiveRecord}
 * @example
 * 
 * ActiveRecord.js is a cross browser, cross platform, stand-alone object
 * relational mapper. It shares a very similar vocabulary to the Ruby
 * ActiveRecord implementation, but uses JavaScript idioms and best
 * practices -- it is not a direct port. It can operate using an in memory
 * hash table, or with a SQL back end on the Jaxer platform (SQLite and
 * MySQL), Adobe's AIR (SQLite) and Google Gears (SQLite). Support
 * for the HTML 5 SQL storage spec is planned.
 * 
 * Setup
 * -----
 * To begin using ActiveRecord.js, you will need to include the
 * activerecord.js file and establish a connection. If you do not specify
 * a connection type, one will be automatically chosen.
 * 
 *     ActiveRecord.connect();
 * 
 * You can also specify a specific type of adapter. Jaxer requires
 * pre-configuring of the database for the entire application, and Gears
 * automatically configures the database, so simply passing the type of
 * connection is enough. In all of the SQLite implementations you can
 * optionally specify a database name (browser) or path (Jaxer):
 * 
 *     ActiveRecord.connect(ActiveRecord.Adapters.InMemory); //in JS memory
 *     ActiveRecord.connect(ActiveRecord.Adapters.JaxerMySQL); //Jaxer MySQL
 *     ActiveRecord.connect(ActiveRecord.Adapters.JaxerSQLite); //Jaxer SQLite
 *     ActiveRecord.connect(ActiveRecord.Adapters.AIR); //Adobe AIR
 *     ActiveRecord.connect(ActiveRecord.Adapters.Gears,'my_database'); //Gears or HTML5, name is optional
 *     
 * Once connected you can always execute SQL statements directly:
 * 
 *     ActiveRecord.execute('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, user_id, title, text)');
 *     
 * Logging (to either the Jaxer log or browser console) can be turned on by setting:
 * 
 *     ActiveRecord.logging = true;
 * 
 * InMemory Adapter
 * ----------------
 * If you are using a browser or platform that does not have access to a SQL
 * database, you can use the InMemory adapter which will store your objects
 * in memory. All features (including find by SQL) will still work, but you
 * will not be able to use the Migration features, since there are no table
 * schema. Since your objects will not persist, the second parameter to
 * establish a connection is a hash with the data you would like to use
 * in this format: {table_name: {id: row}}. The InMemory adapter will also
 * trigger three observable events that allow you to write an AJAX
 * persistence layer.
 * 
 *     ActiveRecord.connect(ActiveRecord.Adapters.InMemory,{
 *         table_one: {
 *             1: {row_data},
 *             2: {row_data}
 *         },
 *         table_two: {
 *             1: {row_data},
 *             2: {row_data}
 *         }
 *     });
 * 
 *     ActiveRecord.connection.observe('created',function(table_name,id,data){});
 *     ActiveRecord.connection.observe('updated',function(table_name,id,data){});
 *     ActiveRecord.connection.observe('destroyed',function(table_name,id){});
 *     
 * Defining Your Model
 * -------------------
 * The only rule for all ActiveRecord classes is that the related table in the
 * database must have an auto incrementing 'id' property. If you are working
 * with a database table that already exists, you can create a model psuedo-class
 * using the create() method, passing the table name as the first parameter, and
 * any methods you want to define on that class as the second paramter:
 * 
 *     var Post = ActiveRecord.create('posts',{
 *         getWordCount: function(){
 *             return this.get('text').split(/\s+/).length;
 *         }
 *     });
 * 
 * This both returns the class and stores it inside ActiveRecord.Models.Post. If
 * the table for your model does not yet exist you can use the define() method
 * which takes the desired table as the first argument, the fields as the second
 * and the methods as the third:
 * 
 *     var User = ActiveRecord.define('users',{
 *         username: '',
 *         password: '',
 *         post_count: 0,
 *         profile: {
 *             type: 'TEXT',
 *             value: ''
 *         }
 *     },{
 *         getFormattedProfile: function(){
 *             return Markdown.format(this.get('profile'));
 *         }
 *     });
 * 
 * Class & Instance Methods
 * ------------------------
 * JavaScript does not have true static methods or classes, but in this case any
 * method of the User variable above is refered to as a class method, and any
 * method of a particular user (that the User class would find) is refered to as
 * an instance method. The most important class methods are create() and find():
 * 
 *     var jessica = User.create({
 *         username: 'Jessica',
 *         password: 'rabbit'
 *     });
 * 
 * Add new class or instance methods to all ActiveRecord models in the following
 * way:
 * 
 *     ActiveRecord.ClassMethods.myClassMethod = function(){
 *         //this === model class
 *     };
 *     ActiveRecord.InstanceMethods.myInstanceMethod = function(){
 *         // this === model instance
 *     };
 * 
 * Getters & Setters
 * -----------------
 * It is extremely important to note that all of the attributes/columns of the user
 * are accessible directly for reading (for convenience), but cannot be written
 * directly. You **must** use the set() method to set an attribute, you **should**
 * use the get() method to access all attributes, but you **must** use the get()
 * method if your attribute/column is a method of the object or a JavaScript
 * reserved keyword ('save,'initialize','default', etc).
 * 
 *     jessica.username // 'Jessica'
 *     jessica.get('username'); // 'Jessica'
 *     jessica.username = 'new username';
 *     jessica.get('username'); // 'Jessica'
 *     jessica.set('username','new username');
 *     jessica.get('username'); // 'new username'
 * 
 * When Data is Persisted
 * ----------------------
 * Data is only persisted to the database in three cases: when you explicitly call
 * save() on a record, when you call create() on a record, or create a child record
 * through a relationship (the method will contain the word "create" in this case),
 * or when you call updateAttribute() on a record. In the case of the latter, only
 * the attribute you update will be saved, the rest of the record will not be
 * persisted to the database, even if changes have been made. Calling save() may
 * add an "id" property to the record if it does not exist, but if there are no
 * errors, it's state will otherwise be unchanged. You can call refresh() on any
 * record to ensure it is not out of synch with your database at any time.
 * 
 * Finding Records
 * ---------------
 * If you created the User class using the define() method you automatically have
 * free "finder" methods:
 * 
 *     User.findByUsername('Jessica');
 *     User.findAllByPassword(''); //finds all with blank passwords
 * 
 * Otherwise you can use the base find() method, which takes a hash of options,
 * a numeric id or a complete SQL string:
 * 
 *     var posts = Post.find({
 *         all: true,
 *         order: 'id DESC',
 *         limit: 10
 *     });
 * 
 * Synchronization
 * ---------------
 * It is sometimes useful to keep records that have already been found in synch
 * with the database. Each found record has a synchronize() method that will keep
 * the values of that record in synch with the database. If you pass the parameter
 * synchronize: true to find(), all objects will have their values synchronized,
 * and in addition the result set itself will update as objects are destroyed or
 * created. Both features are relatively expensive operations, and are not
 * automatically garbage collected/stopped when the record or result set goes
 * out of scope, so you will need to explicitly stop both record and result set
 * synchronization.
 * 
 *     var aaron = User.findByName('aaron');
 *     aaron.synchronize();
 * 
 *     var aaron_clone = User.findByName('aaron');
 *     aaron_clone.set('name','Aaron!');
 *     aaron_clone.save();
 * 
 *     aaron.get('name') === 'Aaron!';
 *     aaron.stop(); //record will no longer be synchronized
 * 
 *     var users = User.find({
 *         all: true,
 *         synchronize: true
 *     });
 *     //users contains aaron
 *     aaron.destroy();
 *     //users will no longer contain aaron
 *     users.stop(); //result set will no longer be synchronized
 * 
 * Calculations (count, min, max, etc) can also be synchronized. As a second
 * parameter to the calculation function, pass a hash with a synchronize
 * property that contains a function. That function will be called when the
 * result of the calculation changes. Instead of returning the value of the
 * calculation the initial call to the calculation function will return a
 * function that will stop the synchronization.
 *
 *     var current_count;
 *     var stop = User.count({
 *         synchronize: function(updated_count){
 *             current_count = updated_count;
 *         }
 *     });
 *     var new_user = User.create({...}); //current_count incremented
 *     new_user.destroy();  //current_count decremented
 *     stop();
 *     User.create({...}); //current_count unchanged
 *
 * Lifecycle
 * ---------
 * There are 8 currently supported lifecycle events which allow granular control
 * over your data, and are convenient to build user interface components and
 * interactions around on the client side:
 * 
 * - afterFind
 * - afterInitialize
 * - beforeSave
 * - afterSave
 * - beforeCreate
 * - afterCreate
 * - beforeDestroy
 * - afterDestroy
 * 
 * beforeSave and afterSave are called when both creating (inserting) and saving
 * (updating) a record. You can observe events on all instances of a class, or
 * just a particular instnace:
 * 
 *     User.observe('afterCreate',function(user){
 *         console.log('User with id of ' + user.id + ' was created.');
 *     });
 * 
 *     var u = User.find(5);
 *     u.observe('afterDestroy',function(){
 *         //this particular user was destroyed
 *     });
 * 
 * In the example above, each user that is created will be passed to the first
 * callback. You can also call stopObserving() to remove a given observer, and
 * use the observeOnce() method (same arguments as observe()) method if needed.
 * Alternately, each event name is also a convience method and the following
 * example is functionally equivelent to the prior example:
 * 
 *     User.afterCreate(function(user){
 *         console.log('User with id of ' + user.id + ' was created.');
 *     });
 * 
 *     var u = User.find(5);
 *     u.afterDestroy(function(){
 *         //this particular user was destroyed
 *     });
 * 
 * You can stop the creation, saving or destruction of a record by returning
 * false inside any observers of the beforeCreate, beforeSave and
 * beforeDestroy events respectively:
 * 
 *     User.beforeDestroy(function(user){
 *         if(!allow_deletion_checkbox.checked){
 *             return false; //record will not be destroyed
 *         }
 *     });
 *
 * Returning null, or returning nothing is equivelent to returning true in
 * this context and will not stop the event.
 *     
 * To observe a given event on all models, you can do the following: 
 * 
 *     ActiveRecord.observe('created',function(model_class,model_instance){});
 *     
 * afterFind works differently than all of the other events. It is only available
 * to the model class, not the instances, and is called only when a result set is
 * found. A find first, or find by id call will not trigger the event.
 * 
 *     User.observe('afterFind',function(users,params){
 *         //params contains the params used to find the array of users
 *     });
 *     
 * Validation
 * ----------
 * Validation is performed on each model instance when create() or save() is
 * called. Validation can be applied either by using pre defined validations
 * (validatesPresenceOf, validatesLengthOf, more will be implemented soon), or by
 * defining a valid() method in the class definition. (or by both). If a record is
 * not valid, save() will return false. create() will always return the record,
 * but in either case you can call getErrors() on the record to determine if
 * there are any errors present.
 * 
 *     User = ActiveRecord.define('users',{
 *         username: '',
 *         password: ''
 *     },{
 *         valid: function(){
 *             if(User.findByUsername(this.username)){
 *                 this.addError('The username ' + this.username + ' is already taken.');
 *             }
 *         }
 *     });
 * 
 *     User.validatesPresenceOf('password');
 * 
 *     var user = User.build({
 *         'username': 'Jessica'
 *     });
 * 
 *     user.save(); //false
 *     var errors = user.getErrors(); //contains a list of the errors that occured
 *     user.set('password','rabbit');
 *     user.save(); //true
 *     
 * Relationships
 * -------------
 * Relationships are declared with one of three class methods that are available
 *  to all models:
 * 
 * - belongsTo
 * - hasMany
 * - hasOne
 * 
 * The related model name can be specified in a number of ways, assuming that you
 * have a Comment model already declared, any of the following would work:
 * 
 *     User.hasMany(Comment)
 *     User.hasMany('Comment')
 *     User.hasMany('comment')
 *     User.hasMany('comments')
 * 
 * Each relationship adds various instance methods to each instance of that
 * model. This differs significantly from the Rails "magical array" style of
 * handling relationship logic:
 * 
 * Rails:
 * 
 *     u = User.find(5)
 *     u.comments.length
 *     u.comments.create :title => 'comment title'
 * 
 * ActiveRecord.js:
 * 
 *     var u = User.find(5);
 *     u.getCommentList().length;
 *     u.createComment({title: 'comment title'});
 *
 * You can name the relationship (and thus the generate methods) by passing
 * a name parameter:
 * 
 *     TreeNode.belongsTo(TreeNode,{name: 'parent'});
 *     TreeNode.hasMany(TreeNode,{name: 'child'});
 *     //instance now have, getParent(), getChildList(), methods
 * 
 * Missing Features
 * ----------------
 * ActiveRecord.js will not support all of the advanced features of the Ruby
 * ActiveRecord implementation, but several key features are currently missing
 * and will be added soon:
 * 
 * - complete set of default validations from ActiveRecord::Validations::ClassMethods
 * - ActsAsList
 * - ActsAsTree
 * - hasMany :through (which will likely be the only supported many to many relationship)
*/
ActiveRecord = {
    /**
     * Defaults to false.
     * @alias ActiveRecord.logging
     * @property {Boolean}
     */
    logging: false,
    /**
     * Will automatically create a table when create() is called. Defaults to true.
     * @alias ActiveRecord.autoMigrate
     * @property {Boolean}
     */
     autoMigrate: true,
    /**
     * Tracks the number of records created.
     * @alias ActiveRecord.internalCounter
     * @property {Number}
     */
    internalCounter: 0,
    /**
     * Contains model_name, ActiveRecord.Class pairs.
     * @alias ActiveRecord.Models
     * @property {Object} 
     */
    Models: {},
    /**
     * @namespace {ActiveRecord.Class} Each generated class will inherit all of
     * the methods in this class, in addition to the ones dynamically generated
     * by finders, validators, relationships, or your own definitions.
     */
    /**
     * Contains all methods that will become available to ActiveRecord classes.
     * @alias ActiveRecord.ClassMethods
     * @property {Object} 
     */
    ClassMethods: {},
    /**
     * @namespace {ActiveRecord.Instance} Each found instance will inherit all of
      * the methods in this class, in addition to the ones dynamically generated
      * by finders, validators, relationships, or your own definitions.
     */
    /**
     * Contains all methods that will become available to ActiveRecord instances.
     * @alias ActiveRecord.InstanceMethods
     * @property {Object}
     */
    InstanceMethods: {},
    /**
     * Creates an ActiveRecord class, returning the class and storing it inside
     * ActiveRecord.Models[model_name]. model_name is a singularized,
     * capitalized form of table name.
     * @example
     *     var User = ActiveRecord.create('users');
     *     var u = User.find(5);
     * @alias ActiveRecord.create
     * @param {String} table_name
     * @param {Object} fields
     *      Should consist of column name, default value pairs. If an empty
     *      array or empty object is set as the default, any arbitrary data
     *      can be set and will automatically be serialized when saved. To
     *      specify a specific type, set the value to an object that contains
     *      a "type" key, with optional "length" and "value" keys.
     * @param {Object} [methods]
     * @return {Object}
     */
    create: function create(options, fields, methods)
    {
        if (!ActiveRecord.connection)
        {
            return ActiveSupport.throwError(ActiveRecord.Errors.ConnectionNotEstablished);
        }
        
        if(typeof(options) === 'string')
        {
            options = {
                tableName: options
            };
        }

        //determine proper model name
        var model = null;
        if(!options.modelName)
        {
            var model_name = ActiveSupport.camelize(ActiveSupport.Inflector.singularize(options.tableName) || options.tableName);
            options.modelName = model_name.charAt(0).toUpperCase() + model_name.substring(1);
        }

        //constructor
        model = ActiveRecord.Models[options.modelName] = function initialize(data)
        {
            this.modelName = this.constructor.modelName;
            this.tableName = this.constructor.tableName;
            this.primaryKeyName = this.constructor.primaryKeyName;
            this._object = {};
            for(var key in data)
            {
                //third param is to supress notifications on set
                this.set(key,data[key],true);
            }
            this._errors = [];
            for(var key in this.constructor.fields)
            {
                if(!this.constructor.fields[key].primaryKey)
                {
                    var value = ActiveRecord.connection.fieldOut(this.constructor.fields[key],this.get(key));
                    if(Migrations.objectIsFieldDefinition(value))
                    {
                        value = value.value;
                    }
                    //don't supress notifications on set since these are the processed values
                    this.set(key,value);
                }
            }
            //performance optimization if no observers
            this.notify('afterInitialize', data);
        };
        model.modelName = options.modelName;
        model.tableName = options.tableName;
        model.primaryKeyName = 'id';
        
        //mixin instance methods
        ActiveSupport.extend(model.prototype, ActiveRecord.InstanceMethods);

        //user defined take precedence
        if(methods && typeof(methods) !== 'function')
        {
            ActiveSupport.extend(model.prototype, methods || {});
        }

        //mixin class methods
        ActiveSupport.extend(model, ActiveRecord.ClassMethods);

        //add lifecycle abilities
        ActiveEvent.extend(model);
        
        //clean and set field definition
        if(!fields)
        {
            fields = {};
        }
        var custom_primary_key = false;
        for(var field_name in fields)
        {
            if(typeof(fields[field_name]) === 'object' && fields[field_name].type && !('value' in fields[field_name]))
            {
                fields[field_name].value = null;
            }
            if(typeof(fields[field_name]) === 'object' && fields[field_name].primaryKey)
            {
                custom_primary_key = field_name;
            }
        }
        if(!custom_primary_key)
        {
            fields['id'] = {
                primaryKey: true
            };
        }
        model.fields = fields;
        if(custom_primary_key)
        {
            model.primaryKeyName = custom_primary_key;
        }
        
        //generate finders
        for(var key in model.fields)
        {
            Finders.generateFindByField(model,key);
            Finders.generateFindAllByField(model,key);
        }
        
        //create table for model if autoMigrate enabled
        if(ActiveRecord.autoMigrate)
        {
            Migrations.Schema.createTable(options.tableName,ActiveSupport.clone(model.fields));
        }
        
        return model;
    }
};


/**
 * If the table for your ActiveRecord does not exist, this will define the
 * ActiveRecord and automatically create the table.
 * @alias ActiveRecord.define
 * @param {String} table_name
 * @param {Object} fields
 *      Should consist of column name, default value pairs. If an empty array or empty object is set as the default, any arbitrary data can be set and will automatically be serialized when saved. To specify a specific type, set the value to an object that contains a "type" key, with optional "length" and "value" keys.
 * @param {Object} [methods]
 * @param {Function} [readyCallback]
 *      Must be specified if running in asynchronous mode.
 * @return {Object}
 * @example
 * 
 *     var User = ActiveRecord.define('users',{
 *         name: '',
 *         password: '',
 *         comment_count: 0,
 *         profile: {
 *             type: 'text',
 *             value: ''
 *         },
 *         serializable_field: {}
 *     });
 *     var u = User.create({
 *         name: 'alice',
 *         serializable_field: {a: '1', b: '2'}
 *     }); 
 */
 
ActiveEvent.extend(ActiveRecord);

ActiveRecord.eventNames = [
    'afterInitialize',
    'afterFind',
    'beforeSave',
    'afterSave',
    'beforeCreate',
    'afterCreate',
    'beforeDestroy',
    'afterDestroy'
];

//add lifecycle method names to classes and models (model_instance.beforeDestory() model_class.beforeDestroy())
(function(){
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i)
    {
        ActiveRecord.ClassMethods[ActiveRecord.eventNames[i]] = ActiveRecord.InstanceMethods[ActiveRecord.eventNames[i]] = ActiveSupport.curry(function event_name_delegator(event_name, observer){
            return this.observe(event_name, observer);
        },ActiveRecord.eventNames[i]);
    }
})();

/**
 * Observe an event on all models. observer will be called with model_class, model_instance.
 * @alias ActiveRecord.observe
 * @param {String} event_name
 * @param {Function} observer
 * @return {Array} Array of observers 
 */
ActiveRecord.old_observe = ActiveRecord.observe;
ActiveRecord.observe = function observe(event_name,observer)
{
    for(var i = 0; i < ActiveRecord.eventNames.length; ++i)
    {
        if(ActiveRecord.eventNames[i] === event_name)
        {
            var observers = [];
            var model_observer;
            for(var model_name in ActiveRecord.Models)
            {
                model_observer = ActiveSupport.curry(observer,ActiveRecord.Models[model_name]);
                observers.push(model_observer);
                ActiveRecord.Models[model_name].observe(event_name,model_observer);
            }
            return observers;
        }
    }
    return ActiveRecord.old_observe(event_name,observer);
};

//add lifecycle method names to ActiveRecord (ActiveRecord.beforeDestory)
(function(){
    for (var i = 0; i < ActiveRecord.eventNames.length; ++i)
    {
        ActiveRecord[ActiveRecord.eventNames[i]] = ActiveSupport.curry(function event_name_delegator(event_name, observer){
            ActiveRecord.observe(event_name, observer);
        },ActiveRecord.eventNames[i]);
    }
})();

var Errors = {
    /**
     * @property {String} Error that will be thrown if ActiveRecord is used without a connection.
     */
    ConnectionNotEstablished: ActiveSupport.createError('No ActiveRecord connection is active.'),
    /**
     * @property {String} Error that will be thrown if using InMemory based adapter, and a method called inside a SQL statement cannot be found.
     */
    MethodDoesNotExist: ActiveSupport.createError('The requested method does not exist.'),
    /**
     * @property {String} Error that will be thrown if an unrecognized field type definition is used.
     */
    InvalidFieldType: ActiveSupport.createError('The field type does not exist:')
};

ActiveRecord.Errors = Errors;

ActiveSupport.extend(ActiveRecord.InstanceMethods,{
    /**
     * Sets a given key on the object. You must use this method to set a property, properties assigned directly (instance.key_name = value) will not persist to the database and may cause errors.
     * @alias ActiveRecord.Instance.set
     * @param {String} key
     * @param {mixed} value
     * @param {Boolean} surpress_notifications Defaults to false
     * @return {mixed} the value that was set
     */
    set: function set(key, value, surpress_notifications)
    {
        if (typeof(this[key]) !== "function")
        {
            this[key] = value;
        }
        this._object[key] = value;
        if(!surpress_notifications)
        {
            this.notify('set',key,value);
        }
    },
    /**
     * Get a given key on the object. If your field name is a reserved word, or the name of a method (save, updateAttribute, etc) you must use the get() method to access the property. For convenience non reserved words (title, user_id, etc) can be accessed directly (instance.key_name)
     * @alias ActiveRecord.Instance.get
     * @param {String} key
     * @return {mixed}
     */
    get: function get(key)
    {
        return this._object[key];
    },
    /**
     * Returns a "clean" version of the object, with just the data and no methods.
     * @alias ActiveRecord.Instance.toObject
     * @return {Object}
     */
    toObject: function toObject()
    {
        return ActiveSupport.clone(this._object);
    },
    /**
     * Returns an array of the column names that the instance contains.
     * @alias ActiveRecord.Instance.keys
     * @return {Array}
     */
    keys: function keys()
    {
        var keys_array = [];
        for(var key_name in this._object)
        {
            keys_array.push(key_name);
        }
        return keys_array;
    },
    /**
     * Returns an array of the column values that the instance contains.
     * @alias ActiveRecord.Instance.values
     * @return {Array}
     */
    values: function values()
    {
        var values_array = [];
        for(var key_name in this._object)
        {
            values_array.push(this._object[key_name]);
        }
        return values_array;
    },
    /**
     * Sets a given key on the object and immediately persists that change to the database triggering any callbacks or validation .
     * @alias ActiveRecord.Instance.updateAttribute
     * @param {String} key
     * @param {mixed} value
     */
    updateAttribute: function updateAttribute(key, value)
    {
        this.set(key, value);
        return this.save();
    },
    /**
     * Updates all of the passed attributes on the record and then calls save().
     * @alias ActiveRecord.Instance.updateAttributes
     * @param {Object} attributes
     */
    updateAttributes: function updateAttributes(attributes)
    {
        for(var key in attributes)
        {
            this.set(key, attributes[key]);
        }
        return this.save();
    },
    /**
     * Loads the most current data for the object from the database.
     * @alias ActiveRecord.Instance.reload
     * @return {Boolean}
     */
    reload: function reload()
    {
        if (!this.get(this.constructor.primaryKeyName))
        {
            return false;
        }
        var record = this.constructor.find(this.get(this.constructor.primaryKeyName));
        if (!record)
        {
            return false;
        }
        this._object = {};
        var raw = record.toObject();
        for (var key in raw)
        {
            this.set(key,raw[key]);
        }
        return true;
    },
    /**
     * Persists the object, creating or updating as nessecary. 
     * @alias ActiveRecord.Instance.save
     * @return {Boolean}
     */
    save: function save()
    {
        //callbacks/proxy not working
        if (!this._valid())
        {
            return false;
        }
        //apply field in conversions
        for (var key in this.constructor.fields)
        {
            if(!this.constructor.fields[key].primaryKey)
            {
                //third param is to surpress observers
                this.set(key,ActiveRecord.connection.fieldIn(this.constructor.fields[key],this.get(key)),true);
            }
        }
        if (this.notify('beforeSave') === false)
        {
            return false;
        }
        if ('updated' in this._object)
        {
            this.set('updated',ActiveSupport.dateFormat('yyyy-mm-dd HH:MM:ss'));
        }
        if (!this.get(this.constructor.primaryKeyName))
        {
            if (this.notify('beforeCreate') === false)
            {
                return false;
            }
            if ('created' in this._object)
            {
                this.set('created',ActiveSupport.dateFormat('yyyy-mm-dd HH:MM:ss'));
            }
            ActiveRecord.connection.insertEntity(this.tableName, this.constructor.primaryKeyName, this.toObject());
            this.set(this.constructor.primaryKeyName, ActiveRecord.connection.getLastInsertedRowId());
            Synchronization.triggerSynchronizationNotifications(this,'afterCreate');
            this.notify('afterCreate');
        }
        else
        {
            ActiveRecord.connection.updateEntity(this.tableName, this.constructor.primaryKeyName, this.get(this.constructor.primaryKeyName), this.toObject());
        }
        //apply field out conversions
        for (var key in this.constructor.fields)
        {
            if(!this.constructor.fields[key].primaryKey)
            {
                //third param is to surpress observers
                this.set(key,ActiveRecord.connection.fieldOut(this.constructor.fields[key],this.get(key)),true);
            }
        }
        Synchronization.triggerSynchronizationNotifications(this,'afterSave');
        this.notify('afterSave');
        return this;
    },
    /**
     * Removes the object from the database, but does not destroy the object in memory itself.
     * @alias ActiveRecord.Instance.destroy
     * @return {Boolean}
     */
    destroy: function destroy()
    {
        if (!this.get(this.constructor.primaryKeyName))
        {
            return false;
        }
        if (this.notify('beforeDestroy') === false)
        {
            return false;
        }
        ActiveRecord.connection.deleteEntity(this.tableName,this.constructor.primaryKeyName,this.get(this.constructor.primaryKeyName));
        Synchronization.triggerSynchronizationNotifications(this,'afterDestroy');
        if (this.notify('afterDestroy') === false)
        {
            return false;
        }
        return true;
    },
    /**
     * toJSON and toXML will call this instead of toObject() to get the
     * data they will serialize. By default this calls toObject(), but 
     * you can override this method to easily create custom JSON and XML
     * output.
     * @alias ActiveRecord.Instance.toSerializableObject
     * @return {Object}
     */
    toSerializableObject: function toSerializableObject()
    {
        return this.toObject();
    },
    /**
     * Serializes the record to an JSON string. If object_to_inject is passed
     * that object will override any values of the record.
     * @alias ActiveRecord.Instance.toJSON
     * @param {Object} [object_to_inject]
     * @return {String}
     */
    toJSON: function toJSON(object_to_inject)
    {
        return ActiveSupport.JSON.stringify(ActiveSupport.extend(this.toSerializableObject(),object_to_inject || {}));
    },
    /**
     * Serializes the record to an XML string. If object_to_inject is passed
     * that object will override any values of the record.
     * @alias ActiveRecord.Instance.toXML
     * @param {Object} [object_to_inject]
     * @return {String}
     */
    toXML: function toXML(object_to_inject)
    {
        return ActiveSupport.XMLFromObject(this.modelName,ActiveSupport.extend(this.toSerializableObject(),object_to_inject || {}));
    }
});
ActiveSupport.extend(ActiveRecord.ClassMethods,{
    /**
     * Find a given record, or multiple records matching the passed conditions.
     * @alias ActiveRecord.Class.find
     * @param {mixed} params
     *      Can be an integer to try and find a record by id, a complete SQL statement String, or Object of params, params may contain:
     *          select: Array of columns to select (default ['*'])
     *          where: String or Object
     *          joins: String
     *          order: String
     *          limit: Number
     *          offset: Number
     *          synchronize: Boolean
     * @return {mixed}
     *      If finding a single record, response will be Boolean false or ActiveRecord.Instance. Otherwise an Array of ActiveRecord.Instance s will be returned (which may be empty).
     * @example
     *
     *     var user = User.find(5); //finds a single record
     *     var user = User.find({
     *         first: true,
     *         where: {
     *             id: 5
     *         }
     *     });
     *     var users = User.find(); //finds all
     *     var users = User.find({
     *         where: 'name = "alice" AND password = "' + md5('pass') + '"',
     *         order: 'id DESC'
     *     });
     *     //using the where syntax below, the parameters will be properly escaped
     *     var users = User.find({
     *         where: {
     *             name: 'alice',
     *             password: md5('pass')
     *         }
     *         order: 'id DESC'
     *     });
     *     var users = User.find('SELECT * FROM users ORDER id DESC');
     */
    find: function find(params)
    {
        var result;
        if (!params)
        {
            params = {};
        }
        if (params.first || ((typeof(params) === "number" || (typeof(params) === "string" && params.match(/^\d+$/))) && arguments.length == 1))
        {
            if (params.first)
            {
                //find first
                params.limit = 1;
                result = ActiveRecord.connection.findEntities(this.tableName,params);
            }
            else
            {
                //single id
                result = ActiveRecord.connection.findEntitiesById(this.tableName,this.primaryKeyName,[params]);
            }
            if (result && result.iterate && result.iterate(0))
            {
                return this.build(result.iterate(0));
            }
            else
            {
                return false;
            }
        }
        else
        {
            result = null;
            if (typeof(params) === 'string' && !params.match(/^\d+$/))
            {
                //find by sql
                result = ActiveRecord.connection.findEntities.apply(ActiveRecord.connection,arguments);
            }
            else if (params && ((typeof(params) == 'object' && 'length' in params && 'slice' in params) || ((typeof(params) == 'number' || typeof(params) == 'string') && arguments.length > 1)))
            {
                //find by multiple ids
                var ids = ((typeof(params) == 'number' || typeof(params) == 'string') && arguments.length > 1) ? ActiveSupport.arrayFrom(arguments) : params;
                result = ActiveRecord.connection.findEntitiesById(this.tableName,this.primaryKeyName,ids);
            }
            else
            {
                //result find
                result = ActiveRecord.connection.findEntities(this.tableName,params);
            }
            var response = [];
            if (result)
            {
                result.iterate(ActiveSupport.bind(function result_iterator(row){
                    response.push(this.build(row));
                }, this));
            }
            this.resultSetFromArray(response,params);
            this.notify('afterFind',response,params);
            return response;
        }
    },
    /**
     * Deletes a given id (if it exists) calling any callbacks or validations
     * on the record. If "all" is passed as the ids, all records will be found
     * and destroyed.
     * @alias ActiveRecord.Class.destroy
     * @param {Number} id 
     * @return {Boolean}
     */
    destroy: function destroy(id)
    {
        if(id == 'all')
        {
            var instances = this.find({
                all: true
            });
            var responses = [];
            for(var i = 0; i < instances.length; ++i)
            {
                responses.push(instances[i].destroy());
            }
            return responses;
        }
        else
        {
            var instance = this.find(id);
            if(!instance)
            {
                return false;
            }
            return instance.destroy();
        }
    },
    /**
     * Identical to calling create(), but does not save the record.
     * @alias ActiveRecord.Class.build
     * @param {Object} data
     * @return {ActiveRecord.Instance}
     */
    build: function build(data)
    {
        ++ActiveRecord.internalCounter;
        var record = new this(ActiveSupport.clone(data));
        record.internalCount = parseInt(new Number(ActiveRecord.internalCounter), 10); //ensure number is a copy
        return record;
    },
    /**
     * @alias ActiveRecord.Class.create
     * @param {Object} data 
     * @return {ActiveRecord.Instance}
     * @example
     *     var u = User.create({
     *         name: 'alice',
     *         password: 'pass'
     *     });
     *     u.id //will now contain the id of the user
     */
    create: function create(data)
    {
        var record = this.build(data);
        record.save();
        return record;
    },
    /**
     * @alias ActiveRecord.Class.update
     * @param {Number} id
     * @param {Object} attributes
     * @return {ActiveRecord.Instance}
     * @example
     * 
     *     Article.update(3,{
     *         title: 'New Title'
     *     });
     *     //or pass an array of ids and an array of attributes
     *     Article.update([5,7],[
     *         {title: 'Title for 5'},
     *         {title: 'Title for 7'}
     *     ]);
     */
    update: function update(id, attributes)
    {
        //array of ids and array of attributes passed in
        if(typeof(id.length) !== 'undefined')
        {
            var results = [];
            for(var i = 0; i < id.length; ++i)
            {
                results.push(this.update(id[i], attributes[i]));
            }
            return results;
        }
        else
        {
            var record = this.find(id);
            if(!record)
            {
                return false;
            }
            record.updateAttributes(attributes);
            return record;
        }
    },
    /**
     * @alias ActiveRecord.Class.updateAll
     * @param {Object} updates
     *      A string of updates to make, or a Hash of column value pairs.
     * @param {String} [conditions]
     *      Optional where condition, or Hash of column name, value pairs.
     */
    updateAll: function updateAll(updates, conditions)
    {
        ActiveRecord.connection.updateMultitpleEntities(this.tableName, updates, conditions);
    },
    /**
     * @alias ActiveRecord.Class.transaction
     * @param {Function} proceed
     *      The block of code to execute inside the transaction.
     * @param {Function} [error]
     *      Optional error handler that will be called with an exception if one is thrown during a transaction. If no error handler is passed the exception will be thrown.
     * @example
     *     Account.transaction(function(){
     *         var from = Account.find(2);
     *         var to = Account.find(3);
     *         to.despoit(from.withdraw(100.00));
     *     });
     */
    transaction: function transaction(proceed,error)
    {
        try
        {
            ActiveRecord.connection.transaction(proceed);
        }
        catch(e)
        {
            if(error)
            {
                error(e);
            }
            else
            {
                return ActiveSupport.throwError(e);
            }
        }
    },
    /**
     * Extends a vanilla array with ActiveRecord.ResultSet methods allowing for
     * the construction of custom result set objects from arrays where result 
     * sets are expected. This will modify the array that is passed in and
     * return the same array object.
     * @alias ActiveRecord.Class.resultSetFromArray
     * @param {Array} result_set
     * @param {Object} [params]
     * @return {Array}
     * @example
     *     var one = Comment.find(1);
     *     var two = Comment.find(2);
     *     var result_set = Comment.resultSetFromArray([one,two]);
     */
    resultSetFromArray: function resultSetFromArray(result_set,params)
    {
        if(!params)
        {
            params = {};
        }
        for(var method_name in ResultSet.InstanceMethods)
        {
            result_set[method_name] = ActiveSupport.curry(ResultSet.InstanceMethods[method_name],result_set,params,this);
        }
        if(params.synchronize)
        {
            Synchronization.synchronizeResultSet(this,params,result_set);
        }
        return result_set;
    }
});

ActiveSupport.extend(ActiveRecord.ClassMethods,{
    processCalculationParams: function processCalculationParams(operation,params)
    {
        if(!params)
        {
            params = {};
        }
        if(typeof(params) === 'string')
        {
            params = {
                where: params
            };
        }
        return params;
    },
    performCalculation: function performCalculation(operation,params,sql_fragment)
    {
        if(params && params.synchronize)
        {
            return Synchronization.synchronizeCalculation(this,operation,params);
        }
        else
        {
            return ActiveRecord.connection.calculateEntities(this.tableName,this.processCalculationParams(operation,params),sql_fragment);
        }
    },
    /**
     * options can contain all params that find() can
     * @alias ActiveRecord.Class.count
     * @param {Object} [params] 
     * @return {Number}
     */
    count: function count(params)
    {
        return this.performCalculation('count',params,'COUNT(*)');
    },
    /**
     * options can contain all params that find() can
     * @alias ActiveRecord.Class.average
     * @param {String} column_name
     * @param {Object} [params] 
     * @return {Number}
     */
    average: function average(column_name,params)
    {
        return this.performCalculation('average',params,'AVG(' + column_name + ')');
    },
    /**
     * options can contain all params that find() can
     * @alias ActiveRecord.Class.max
     * @param {String} column_name
     * @param {Object} [params] 
     * @return {Number}
     */
    max: function max(column_name,params)
    {
        return this.performCalculation('max',params,'MAX(' + column_name + ')');
    },
    /**
     * options can contain all params that find() can
     * @alias ActiveRecord.Class.min
     * @param {String} column_name
     * @param {Object} [params] 
     * @return {Number}
     */
    min: function min(column_name,params)
    {
        return this.performCalculation('min',params,'MIN(' + column_name + ')');
    },
    /**
     * options can contain all params that find() can
     * @alias ActiveRecord.Class.sum
     * @param {String} column_name
     * @param {Object} [params]
     * @return {Number}
     */
    sum: function sum(column_name,params)
    {
        return this.performCalculation('sum',params,'SUM(' + column_name + ')');
    },
    /**
     * Returns the first record sorted by id.
     * @alias ActiveRecord.Class.first
     * @return {ActiveRecord.Instance} 
     */
    first: function first()
    {
        return this.find({
            first: true
        });
    },
    /**
     * Returns the last record sorted by id.
     * @alias ActiveRecord.Class.last
     * @return {ActiveRecord.Instance} 
     */
    last: function last()
    {
        return this.find({
            first: true,
            order: this.primaryKeyName + ' DESC'
        });
    }
});
 
 /**
 * @namespace {ActiveRecord.Adapters}
 */
 var Adapters = {};

/**
 * null if no connection is active, or the class that created the connection.
 * @alias ActiveRecord.adapter
 * @property {mixed}
 */
ActiveRecord.adapter = null;

/**
 * null if no connection is active, or the connection object.
 * @alias ActiveRecord.connection
 * @property {mixed}
 */
ActiveRecord.connection = null;

/**
 * Must be called before using ActiveRecord. If the adapter requires arguments, those must be passed in after the type of adapter.
 * @alias ActiveRecord.connect
 * @param {Object} adapter
 * @param {mixed} [args]
 * @example
 * 
 *     ActiveRecord.connect(ActiveRecord.Adapters.JaxerSQLite,'path_to_database_file');
 *     ActiveRecord.adapter === ActiveRecord.Adapters.JaxerSQLite;
 *     ActiveRecord.connection.executeSQL('SELECT * FROM sqlite_master');
 *     //or you can have ActiveRecord try to auto detect the enviornment
 *     ActiveRecord.connect();
 */
ActiveRecord.connect = function connect(adapter)
{   
    if(!adapter)
    {
        ActiveRecord.connection = Adapters.Auto.connect.apply(Adapters.Auto, ActiveSupport.arrayFrom(arguments).slice(1));
        ActiveRecord.adapter = ActiveRecord.connection.constructor;
    }
    else
    {
        ActiveRecord.adapter = adapter;
        ActiveRecord.connection = adapter.connect.apply(adapter, ActiveSupport.arrayFrom(arguments).slice(1));
    }
    ActiveEvent.extend(ActiveRecord.connection);
    if(!ActiveRecord.connection.preventConnectedNotification)
    {
        ActiveRecord.notify('connected');
    }
};

/**
 * Execute a SQL statement on the active connection. If the statement requires arguments they must be passed in after the SQL statement.
 * @alias ActiveRecord.execute
 * @param {String} sql
 * @return {mixed}
 * @example
 *
 *     ActiveRecord.execute('DELETE FROM users WHERE user_id = ?',5);
 */
ActiveRecord.execute = function execute()
{
    if (!ActiveRecord.connection)
    {
        return ActiveSupport.throwError(ActiveRecord.Errors.ConnectionNotEstablished);
    }
    return ActiveRecord.connection.executeSQL.apply(ActiveRecord.connection, arguments);
};

Adapters.InstanceMethods = {
    setValueFromFieldIfValueIsNull: function setValueFromFieldIfValueIsNull(field,value)
    {
        //no value was passed
        if (value === null || typeof(value) === 'undefined')
        {
            //default value was in field specification
            if(Migrations.objectIsFieldDefinition(field))
            {
                var default_value = this.getDefaultValueFromFieldDefinition(field);
                if(typeof(default_value) === 'undefined')
                {
                    return ActiveSupport.throwError(Errors.InvalidFieldType,(field ? (field.type || '[object]') : 'false'));
                }
                return field.value || default_value;
            }
            //default value was set, but was not field specification 
            else
            {
                return field;
            }
        }
        return value;
    },
    getColumnDefinitionFragmentFromKeyAndColumns: function getColumnDefinitionFragmentFromKeyAndColumns(key,columns)
    {
        return key + ' ' + ((typeof(columns[key]) === 'object' && typeof(columns[key].type) !== 'undefined') ? columns[key].type : this.getDefaultColumnDefinitionFragmentFromValue(columns[key]));
    },
    getDefaultColumnDefinitionFragmentFromValue: function getDefaultColumnDefinitionFragmentFromValue(value)
    {
        if (typeof(value) === 'string')
        {
            return 'VARCHAR(255)';
        }
        if (typeof(value) === 'number')
        {
            return 'INT';
        }
        if (typeof(value) == 'boolean')
        {
            return 'TINYINT(1)';
        }
        return 'TEXT';
    },
    getDefaultValueFromFieldDefinition: function getDefaultValueFromFieldDefinition(field)
    {
        return field.value ? field.value : Migrations.fieldTypesWithDefaultValues[field.type ? field.type.replace(/\(.*/g,'').toLowerCase() : ''];
    }
};

ActiveRecord.Adapters = Adapters;

Adapters.SQL = {
    schemaLess: false,
    insertEntity: function insertEntity(table, primary_key_name, data)
    {
        var keys = ActiveSupport.keys(data).sort();
        var values = [];
        var args = [];
        for(var i = 0; i < keys.length; ++i)
        {
            args.push(data[keys[i]]);
            values.push('?');
        }
        args.unshift("INSERT INTO " + table + " (" + keys.join(',') + ") VALUES (" + values.join(',') + ")");
        var response = this.executeSQL.apply(this,args);
        var id = this.getLastInsertedRowId();
        var data_with_id = ActiveSupport.clone(data);
        data_with_id[primary_key_name] = id;
        this.notify('created',table,id,data_with_id);
        return response;
    },
    updateMultitpleEntities: function updateMultitpleEntities(table, updates, conditions)
    {
        var args = [];
        if(typeof(updates) !== 'string')
        {
            var values = [];
            var keys = ActiveSupport.keys(updates).sort();
            for (var i = 0; i < keys.length; ++i)
            {
                args.push(updates[keys[i]]);
                values.push(updates[i] + " = ?");
            }
            updates = values.join(',');
        }
        args.unshift('UPDATE ' + table + ' SET ' + updates + this.buildWhereSQLFragment(conditions, args));
        return this.executeSQL.apply(this, args);
    },
    updateEntity: function updateEntity(table, primary_key_name, id, data)
    {
        var keys = ActiveSupport.keys(data).sort();
        var args = [];
        var values = [];
        for (var i = 0; i < keys.length; ++i)
        {
            args.push(data[keys[i]]);
            values.push(keys[i] + " = ?");
        }
        args.push(id);
        args.unshift("UPDATE " + table + " SET " + values.join(',') + " WHERE " + primary_key_name + " = ?");
        var response = this.executeSQL.apply(this, args);
        this.notify('updated',table,id,data);
        return response;
    },
    calculateEntities: function calculateEntities(table, params, operation)
    {
        var process_count_query_result = function process_count_query_result(response)
        {
            if(!response)
            {
                return 0;
            }
            return parseInt(ActiveRecord.connection.iterableFromResultSet(response).iterate(0)['calculation'], 10);
        };
        var args = this.buildSQLArguments(table, params, operation);
        return process_count_query_result(this.executeSQL.apply(this, args));
    },
    deleteEntity: function deleteEntity(table, primary_key_name, id)
    {
        var args, response;
        if (id === 'all')
        {
            args = ["DELETE FROM " + table];
            var ids = [];
            var ids_result_set = this.executeSQL('SELECT ' + primary_key_name + ' FROM ' + table);
            if(!ids_result_set)
            {
                return null;
            }
            this.iterableFromResultSet(ids_result_set).iterate(function id_collector_iterator(row){
                ids.push(row[primary_key_name]);
            });
            response = this.executeSQL.apply(this,args);
            for(var i = 0; i < ids.length; ++i)
            {
                this.notify('destroyed',table,ids[i]);
            }
            return response;
        }
        else
        {
            args = ["DELETE FROM " + table + " WHERE " + primary_key_name + " = ?",id];
            response = this.executeSQL.apply(this,args);
            this.notify('destroyed',table,id);
            return response;
        }
    },
    findEntitiesById: function findEntityById(table, primary_key_name, ids)
    {
        var response = this.executeSQL.apply(this,['SELECT * FROM ' + table + ' WHERE ' + primary_key_name + ' IN (' + ids.join(',') + ')']);
        if (!response)
        {
            return false;
        }
        else
        {
            return ActiveRecord.connection.iterableFromResultSet(response);
        }
    },
    findEntities: function findEntities(table, params)
    {
        var args;
        if (typeof(table) === 'string' && !table.match(/^\d+$/) && typeof(params) != 'object')
        {
            args = arguments;
        }
        else
        {
            args = this.buildSQLArguments(table, params, false);
        }
        var response = this.executeSQL.apply(this,args);
        if (!response)
        {
            return false;
        }
        else
        {
            return ActiveRecord.connection.iterableFromResultSet(response);
        }
    },
    buildSQLArguments: function buildSQLArguments(table, params, calculation)
    {
        var args = [];
        var sql = 'SELECT ' + (calculation ? (calculation + ' AS calculation') : (params.select ? params.select.join(',') : '*')) + ' FROM ' + table +
            this.buildWhereSQLFragment(params.where, args) +
            (params.joins ? ' ' + params.joins : '') + 
            (params.group ? ' GROUP BY ' + params.group : '') + 
            (params.order ? ' ORDER BY ' + params.order : '') + 
            (params.offset && params.limit ? ' LIMIT ' + params.offset + ',' + params.limit : '') + 
            (!params.offset && params.limit ? ' LIMIT ' + params.limit : '');
        args.unshift(sql);
        return args;
    },
    buildWhereSQLFragment: function buildWhereSQLFragment(fragment, args)
    {
        var where, keys, i;
        if(fragment && typeof(fragment) !== "string")
        {
            where = '';
            keys = ActiveSupport.keys(fragment);
            for(i = 0; i < keys.length; ++i)
            {
                where += keys[i] + " = ? AND ";
                var value;
                if(typeof(fragment[keys[i]]) === 'number')
                {
                    value = fragment[keys[i]];
                }
                else if(typeof(fragment[keys[i]]) == 'boolean')
                {
                    value = parseInt(new Number(fragment[keys[i]]));
                }
                else
                {
                    value = new String(fragment[keys[i]]).toString();
                }
                args.push(value);
            }
            where = ' WHERE ' + where.substring(0,where.length - 4);
        }
        else if(fragment)
        {
            where = ' WHERE ' + fragment;
        }
        else
        {
            where = '';
        }
        return where;
    },
    //schema
    dropTable: function dropTable(table_name)
    {
        return this.executeSQL('DROP TABLE IF EXISTS ' + table_name);
    },
    addIndex: function addIndex(table_name,column_names,options)
    {
        
    },
    renameTable: function renameTable(old_table_name,new_table_name)
    {
        this.executeSQL('ALTER TABLE ' + old_table_name + ' RENAME TO ' + new_table_name);
    },
    removeIndex: function removeIndex(table_name,index_name)
    {
        
    },
    addColumn: function addColumn(table_name,column_name,data_type)
    {
        return this.executeSQL('ALTER TABLE ' + table_name + ' ADD COLUMN ' + this.getColumnDefinitionFragmentFromKeyAndColumns(key,columns));
    },
    fieldIn: function fieldIn(field, value)
    {
        if(value && value instanceof Date)
        {
            return ActiveSupport.dateFormat(value,'yyyy-mm-dd HH:MM:ss',true);
        }
        if(Migrations.objectIsFieldDefinition(field))
        {
            field = this.getDefaultValueFromFieldDefinition(field);
        }
        value = this.setValueFromFieldIfValueIsNull(field,value);
        if (typeof(field) === 'string')
        {
            return (new String(value)).toString();
        }
        if (typeof(field) === 'number')
        {
            return (new String(value)).toString();
        }
        if(typeof(field) === 'boolean')
        {
            return (new String(parseInt(new Number(value), 10))).toString();
        }
        //array or object
        if (typeof(value) === 'object' && !Migrations.objectIsFieldDefinition(field))
        {
            return ActiveSupport.JSON.stringify(value);
        }
    },
    fieldOut: function fieldOut(field, value)
    {
        if(Migrations.objectIsFieldDefinition(field))
        {
            field = this.getDefaultValueFromFieldDefinition(field);
        }
        value = this.setValueFromFieldIfValueIsNull(field,value);
        if (typeof(field) === 'string')
        {
            return value;
        }
        if(typeof(field) === 'boolean')
        {
            if(value === '0' || value === 0 || value === 'false')
            {
                value = false;
            }
            return !!value;
        }
        if (typeof(field) === 'number')
        {
            var trim = function(str)
            {
                return (new String(str)).toString().replace(/^\s+|\s+$/g,"");
            };
            return (trim(value).length > 0 && !(/[^0-9.]/).test(trim(value)) && (/\.\d/).test(trim(value))) ? parseFloat(new Number(value)) : parseInt(new Number(value), 10);
        }
        //array or object (can come from DB (as string) or coding enviornment (object))
        if ((typeof(value) === 'string' || typeof(value) === 'object') && (typeof(field) === 'object' && (typeof(field.length) !== 'undefined' || typeof(field.type) === 'undefined')))
        {
            if (typeof(value) === 'string')
            {
                return ActiveSupport.JSON.parse(value);
            }
            else
            {
                return value;
            }
        }
    }
};

Adapters.SQLite = ActiveSupport.extend(ActiveSupport.clone(Adapters.SQL),{
    createTable: function createTable(table_name,columns)
    {
        var keys = ActiveSupport.keys(columns);
        var fragments = [];
        for (var i = 0; i < keys.length; ++i)
        {
            var key = keys[i];
            if(columns[key].primaryKey)
            {
                fragments.unshift(key + ' INTEGER PRIMARY KEY');
            }
            else
            {
                fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key,columns));
            }
        }
        return this.executeSQL('CREATE TABLE IF NOT EXISTS ' + table_name + ' (' + fragments.join(',') + ')');
    },
    dropColumn: function dropColumn(table_name,column_name)
    {
        this.transaction(ActiveSupport.bind(function drop_column_transaction(){
            var description = ActiveRecord.connection.iterableFromResultSet(ActiveRecord.connection.executeSQL('SELECT * FROM sqlite_master WHERE tbl_name = "' + table_name + '"')).iterate(0);
            var temp_table_name = 'temp_' + table_name;
            ActiveRecord.execute(description['sql'].replace(new RegExp('^CREATE\s+TABLE\s+' + table_name),'CREATE TABLE ' + temp_table_name).replace(new RegExp('(,|\()\s*' + column_name + '[\s\w]+(\)|,)'),function(){
                return (args[1] == '(' ? '(' : '' ) + args[2];
            }));
            ActiveRecord.execute('INSERT INTO ' + temp_table_name + ' SELECT * FROM ' + table_name);
            this.dropTable(table_name);
            this.renameTable(temp_table_name,table_name);
        },this));
    }
});

/**
 * In memory, non persistent storage.
 * @alias ActiveRecord.Adapters.InMemory
 * @property {ActiveRecord.Adapter}
 */
Adapters.InMemory = function InMemory(storage){
    this.storage = typeof(storage) === 'string' ? ActiveSupport.JSON.parse(storage) : (storage || {});
    this.lastInsertId = null;
};

ActiveSupport.extend(Adapters.InMemory.prototype,Adapters.InstanceMethods);

ActiveSupport.extend(Adapters.InMemory.prototype,{
    schemaLess: true,
    entityMissing: function entityMissing(id){
        return {};
    },
    serialize: function serialize()
    {
        return ActiveSupport.JSON.stringify(this.storage);
    },
    log: function log()
    {
        if(!ActiveRecord.logging)
        {
            return;
        }
        if(arguments[0])
        {
            arguments[0] = 'ActiveRecord: ' + arguments[0];
        }
        return ActiveSupport.log.apply(ActiveSupport,arguments || []);
    },
    executeSQL: function executeSQL(sql)
    {
        ActiveRecord.connection.log('Adapters.InMemory could not execute SQL:' + sql);
    },
    insertEntity: function insertEntity(table, primary_key_name, data)
    {
        this.setupTable(table);
        var max = 1;
        var table_data = this.storage[table];
        if(!data.id)
        {
            for(var id in table_data)
            {
                if(parseInt(id, 10) >= max)
                {
                    max = parseInt(id, 10) + 1;
                }
            }
            data.id = max;
        }
        this.lastInsertId = data.id;
        this.storage[table][max] = data;
        this.notify('created',table,data.id,data);
        return true;
    },
    getLastInsertedRowId: function getLastInsertedRowId()
    {
        return this.lastInsertId;
    },
    updateMultitpleEntities: function updateMultitpleEntities(table, updates, conditions)
    {
        
    },
    updateEntity: function updateEntity(table, primary_key_name, id, data)
    {
        this.setupTable(table);
        this.storage[table][id] = data;
        this.notify('updated',table,id,data);
        return true;
    },
    calculateEntities: function calculateEntities(table, params, operation)
    {
        this.setupTable(table);
        var entities = this.findEntities(table,params);
        var parsed_operation = operation.match(/([A-Za-z]+)\(([^\)]+)\)/);
        var operation_type = parsed_operation[1].toLowerCase();
        var column_name = parsed_operation[2];
        switch(operation_type){
            case 'count':
                return entities.length;
            case 'max':
                var max = 0;
                for(var i = 0; i < entities.length; ++i)
                {
                    if(parseInt(entities[i][column_name], 10) > max)
                    {
                        max = parseInt(entities[i][column_name], 10);
                    }
                }
                return max;
            case 'min':
                var min = 0;
                if(entities[0])
                {
                    min = entities[0][column_name];
                }
                for(var i = 0; i < entities.length; ++i)
                {
                    if(entities[i][column_name] < min)
                    {
                        min = entities[i][column_name];
                    }
                }
                return min;
            case 'avg':
            case 'sum':
                var sum = 0;
                for(var i = 0; i < entities.length; ++i)
                {
                    sum += entities[i][column_name];
                }
                return operation_type === 'avg' ? sum / entities.length : sum;
        }
    },
    deleteEntity: function deleteEntity(table, primary_key_name, id)
    {
        this.setupTable(table);
        if(!id || id === 'all')
        {
            for(var id_to_be_deleted in this.storage[table])
            {
                this.notify('destroyed',table,id_to_be_deleted);
            }
            this.storage[table] = {};
            return true;
        }
        else if(this.storage[table][id])
        {
            delete this.storage[table][id];
            this.notify('destroyed',table,id);
            return true;
        }
        return false;
    },
    findEntitiesById: function findEntitiesById(table, primary_key_name, ids)
    {
        var table_data = this.storage[table];
        var response = [];
        for(var i = 0; i < ids.length; ++i)
        {
            var id = parseInt(ids[i],10);
            if(table_data[id])
            {
                response.push(table_data[id]);
            }
        }
        return this.iterableFromResultSet(response);
    },
    findEntities: function findEntities(table, params)
    {
        if (typeof(table) === 'string' && !table.match(/^\d+$/) && typeof(params) != 'object')
        {
            //find by SQL

            //replace ? in SQL strings
            var sql = table;
            var sql_args = ActiveSupport.arrayFrom(arguments).slice(1);
            for(var i = 0; i < sql_args.length; ++i)
            {
                sql = sql.replace(/\?/,typeof(sql_args[i]) == 'number'
                    ? sql_args[i]
                    : '"' + (new String(sql_args[i])).toString().replace(/\"/g,'\\"').replace(/\\/g,'\\\\').replace(/\0/g,'\\0') + '"'
                );
            }
            var response = this.paramsFromSQLString(sql);
            table = response[0];
            params = response[1];
        }
        else if(typeof(params) === 'undefined')
        {
            params = {};
        }
        this.setupTable(table);
        var entity_array = [];
        var table_data = this.storage[table];
        if(params && params.where && params.where.id)
        {
            if(table_data[parseInt(params.where.id, 10)])
            {
                entity_array.push(table_data[parseInt(params.where.id, 10)]);
            }
        }
        else
        {
            for(var id in table_data)
            {
                entity_array.push(table_data[id]);
            }
        }
        var filters = [];
        if(params && params.group)
        {
            filters.push(this.createGroupBy(params.group));
        }
        if(params && params.where)
        {
            filters.push(this.createWhere(params.where));
        }
        if(params && params.order)
        {
            filters.push(this.createOrderBy(params.order));
        }
        if(params && params.limit || params.offset)
        {
            filters.push(this.createLimit(params.limit,params.offset));
        }
        for(var i = 0; i < filters.length; ++i)
        {
            entity_array = filters[i](entity_array);
        }
        return this.iterableFromResultSet(entity_array);
    },
    paramsFromSQLString: function paramsFromSQLString(sql)
    {
        var params = {};
        var select = /\s*SELECT\s+.+\s+FROM\s+(\w+)\s+/i;
        var select_match = sql.match(select); 
        var table = select_match[1];
        sql = sql.replace(select,'');
        var fragments = [
            ['limit',/(^|\s+)LIMIT\s+(.+)$/i],
            ['order',/(^|\s+)ORDER\s+BY\s+(.+)$/i],
            ['group',/(^|\s+)GROUP\s+BY\s+(.+)$/i],
            ['where',/(^|\s+)WHERE\s+(.+)$/i]
        ];
        for(var i = 0; i < fragments.length; ++i)
        {
            var param_name = fragments[i][0];
            var matcher = fragments[i][1];
            var match = sql.match(matcher);
            if(match)
            {
                params[param_name] = match[2];
                sql = sql.replace(matcher,'');
            }
        }
        return [table,params];
    },
    transaction: function transaction(proceed)
    {
        var backup = {};
        for(var table_name in this.storage)
        {
            backup[table_name] = ActiveSupport.clone(this.storage[table_name]);
        }
        try
        {
            proceed();
        }
        catch(e)
        {
            this.storage = backup;
            return ActiveSupport.throwError(e);
        }
    },
    /* PRVIATE */
    iterableFromResultSet: function iterableFromResultSet(result)
    {
        result.iterate = function iterate(iterator)
        {
            if (typeof(iterator) === 'number')
            {
                if (this[iterator])
                {
                    return ActiveSupport.clone(this[iterator]);
                }
                else
                {
                    return false;
                }
            }
            else
            {
                for (var i = 0; i < this.length; ++i)
                {
                    var row = ActiveSupport.clone(this[i]);
                    iterator(row);
                }
            }
        };
        return result;
    },
    setupTable: function setupTable(table)
    {
        if(!this.storage[table])
        {
            this.storage[table] = {};
        }
    },
    createWhere: function createWhere(where)
    {
        if(typeof(where) === 'string'){
            return function json_result_where_processor(result_set)
            {
                var response = [];
                var where_parser = new WhereParser();
                var abstract_syntax_tree = where_parser.parse(where);
                for(var i = 0; i < result_set.length; ++i)
                {
                    if(abstract_syntax_tree.execute(result_set[i],Adapters.InMemory.method_call_handler))
                    {
                        response.push(result_set[i]);
                    }
                }
                return response;
            };
        }else{
            return function json_result_where_processor(result_set)
            {
                var response = [];
                for(var i = 0; i < result_set.length; ++i)
                {
                    var included = true;
                    for(var column_name in where)
                    {
                        if((new String(result_set[i][column_name]).toString()) != (new String(where[column_name]).toString()))
                        {
                            included = false;
                            break;
                        }
                    }
                    if(included)
                    {
                        response.push(result_set[i]);
                    }
                }
                return response;
            };
        }
    },
    createLimit: function createLimit(limit,offset)
    {
        return function json_result_limit_processor(result_set)
        {
            return result_set.slice(offset || 0,limit);
        };
    },
    createGroupBy: function createGroupBy(group_by)
    {
        if(!group_by || group_by == '')
        {
            return function json_result_group_by_processor(result_set)
            {
                return result_set;
            }
        }
        var group_key = group_by.replace(/(^[\s]+|[\s]+$)/g,'');
        return function json_result_group_by_processor(result_set)
        {
            var response = [];
            var indexed_by_group = {};
            for(var i = 0; i < result_set.length; ++i)
            {
                indexed_by_group[result_set[i][group_key]] = result_set[i];
            }
            for(var group_key_value in indexed_by_group)
            {
                response.push(indexed_by_group[group_key_value]);
            }
            return response;
        }
    },
    createOrderBy: function createOrderBy(order_by)
    {
        if(!order_by || order_by === '')
        {
            return function json_result_order_by_processor(result_set)
            {
                return result_set;
            };
        }
        var order_statements = order_by.split(',');
        var trimmed_order_statements = [];
        for(var i = 0; i < order_statements.length; ++i)
        {
            trimmed_order_statements.push(order_statements[i].replace(/(^[\s]+|[\s]+$)/g,'').replace(/[\s]{2,}/g,'').toLowerCase());
        }
        return function json_result_order_by_processor(result_set)
        {
            for(var i = 0; i < trimmed_order_statements.length; ++i)
            {
                var trimmed_order_statements_bits = trimmed_order_statements[i].split(/\s/);
                var column_name = trimmed_order_statements_bits[0];
                var reverse = trimmed_order_statements_bits[1] && trimmed_order_statements_bits[1] === 'desc';
                result_set = result_set.sort(function result_set_sorter(a,b){
                    return a[column_name] < b[column_name] ? -1 : a[column_name] > b[column_name] ? 1 : 0;
                });
                if(reverse)
                {
                    result_set = result_set.reverse();
                }
            }
            return result_set;
        };
    },
    //schema
    createTable: function createTable(table_name,columns)
    {
        if(!this.storage[table_name])
        {
            this.storage[table_name] = {};
        }
    },
    dropTable: function dropTable(table_name)
    {
        delete this.storage[table_name];
    },
    addColumn: function addColumn(table_name,column_name,data_type)
    {
        return; //no action needed
    },
    removeColumn: function removeColumn(table_name,column_name)
    {
        return; //no action needed
    },
    addIndex: function addIndex(table_name,column_names,options)
    {
        return; //no action needed
    },
    removeIndex: function removeIndex(table_name,index_name)
    {
        return; //no action needed
    },
    fieldIn: function fieldIn(field, value)
    {
        if(Migrations.objectIsFieldDefinition(field))
        {
            field = this.getDefaultValueFromFieldDefinition(field);
        }
        value = this.setValueFromFieldIfValueIsNull(field,value);
        return value;
    },
    fieldOut: function fieldOut(field, value)
    {
        if(Migrations.objectIsFieldDefinition(field))
        {
            field = this.getDefaultValueFromFieldDefinition(field);
        }
        value = this.setValueFromFieldIfValueIsNull(field,value);
        return value;
    }
});

Adapters.InMemory.method_call_handler = function method_call_handler(name,row,args)
{
    if(!Adapters.InMemory.MethodCallbacks[name])
    {
        name = name.toLowerCase().replace(/\_[0-9A-Z-a-z]/g,function camelize_underscores(match){
            return match.toUpperCase();
        });
    }
    if(!Adapters.InMemory.MethodCallbacks[name])
    {
        return ActiveSupport.throwError(Errors.MethodDoesNotExist);
    }
    else
    {
        return Adapters.InMemory.MethodCallbacks[name].apply(Adapters.InMemory.MethodCallbacks[name],[row].concat(args || []));
    }
};
Adapters.InMemory.MethodCallbacks = (function(){
    var methods = {};
    var math_methods = ['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','random','round','sin','sqrt','tan'];
    for(var i = 0; i < math_methods.length; ++i)
    {
        methods[math_methods[i]] = (function math_method_generator(i){
            return function generated_math_method(){
                return Math[math_methods[i]].apply(Math.math_methods[i],ActiveSupport.arrayFrom(arguments).slice(1));
            };
        })(i);
    }
    return methods;
})();

Adapters.InMemory.connect = function(storage){
  return new Adapters.InMemory(storage || {});
};
 
/**
 * Default adapter, will try to automatically pick the appropriate adapter
 * for the current environment.
 * @alias ActiveRecord.Adapters.Auto
 * @property {ActiveRecord.Adapter}
 */
Adapters.Auto = {};
Adapters.Auto.connect = function connect()
{
    if(typeof(Jaxer) !== 'undefined')
    {
        if(Jaxer.DB.connection.constructor == Jaxer.DB.MySQL.Connection)
        {
            return Adapters.JaxerMySQL.connect.apply(Adapters.JaxerMySQL.connect,arguments);
        }
        else
        {
            return Adapters.JaxerSQLite.connect.apply(Adapters.JaxerSQLite.connect,arguments);
        }
    }
    else if(typeof(air) !== 'undefined')
    {
        return Adapters.AIR.connect.apply(Adapters.AIR.connect,arguments);
    }
    else
    {
        try{
            return Adapters.Gears.connect.apply(Adapters.Gears.connect,arguments);
        }catch(e){
            return Adapters.InMemory.connect.apply(Adapters.InMemory.connect,arguments);
        }
    }
};

//var WhereLexer;
var WhereParser;

//(function() {

// token types
var $c$ = 0,
    ERROR              = -1,
    AND                = $c$++,
    COMMA              = $c$++,
    EQUAL              = $c$++,
    FALSE              = $c$++,
    GREATER_THAN       = $c$++,
    GREATER_THAN_EQUAL = $c$++,
    IDENTIFIER         = $c$++,
    IN                 = $c$++,
    LESS_THAN          = $c$++,
    LESS_THAN_EQUAL    = $c$++,
    LPAREN             = $c$++,
    NOT_EQUAL          = $c$++,
    NUMBER             = $c$++,
    RPAREN             = $c$++,
    STRING             = $c$++,
    TRUE               = $c$++,
    OR                 = $c$++,
    WHITESPACE         = $c$++;

// this is here mostly for debugging messages
var TypeMap = [];
TypeMap[AND]                = "AND";
TypeMap[COMMA]              = "COMMA";
TypeMap[EQUAL]              = "EQUAL";
TypeMap[FALSE]              = "FALSE";
TypeMap[GREATER_THAN]       = "GREATER_THAN";
TypeMap[GREATER_THAN_EQUAL] = "GREATER_THAN_EQUAL";
TypeMap[IDENTIFIER]         = "IDENTIFIER";
TypeMap[IN]                 = "IN";
TypeMap[LESS_THAN]          = "LESS_THAN";
TypeMap[LESS_THAN_EQUAL]    = "LESS_THAN_EQUAL";
TypeMap[LPAREN]             = "LPAREN";
TypeMap[NOT_EQUAL]          = "NOT_EQUAL";
TypeMap[NUMBER]             = "NUMBER";
TypeMap[RPAREN]             = "RPAREN";
TypeMap[STRING]             = "STRING";
TypeMap[TRUE]               = "TRUE";
TypeMap[OR]                 = "OR";
TypeMap[WHITESPACE]         = "WHITESPACE";

// map operators and keywords to their propery type
var OperatorMap = {
    "&&":    AND,
    ",":     COMMA,
    "||":    OR,
    "<":     LESS_THAN,
    "<=":    LESS_THAN_EQUAL,
    "=":     EQUAL,
    "!=":    NOT_EQUAL,
    ">":     GREATER_THAN,
    ">=":    GREATER_THAN_EQUAL,
    "(":     LPAREN,
    ")":     RPAREN
};
var KeywordMap = {
    "and":   AND,
    "false": FALSE,
    "in":    IN,
    "or":    OR,
    "true":  TRUE
};

// Lexer token patterns
var WHITESPACE_PATTERN = /^\s+/;
var IDENTIFIER_PATTERN = /^[a-zA-Z][a-zA-Z]*/;
var OPERATOR_PATTERN   = /^(?:&&|\|\||<=|<|=|!=|>=|>|,|\(|\))/i;
var KEYWORD_PATTERN    = /^(true|or|in|false|and)\b/i;
var STRING_PATTERN     = /^(?:'(\\.|[^'])*'|"(\\.|[^"])*")/;
var NUMBER_PATTERN     = /^[1-9][0-9]*/;

// Current lexeme to parse
var currentLexeme;

// *** Lexeme class ***

/*
 * Lexeme
 * 
 * @param {Number} type
 * @param {String} text
 */
function Lexeme(type, text)
{
    this.type = type;
    this.typeName = null;
    this.text = text;
}

/*
 * toString
 * 
 * @return {String}
 */
Lexeme.prototype.toString = function toString()
{
    if (this.typeName) 
    {
        return "[" + this.typeName + "]~" + this.text + "~";
    }
    else 
    {
        return "[" + this.type + "]~" + this.text + "~";
    }
};

// *** Lexer class ***

/*
 * WhereLexer
 */
function WhereLexer()
{
    // initialize
    this.setSource(null);
}

/*
 * setSource
 * 
 * @param {String} source
 */
WhereLexer.prototype.setSource = function setSource(source)
{
    this.source = source;
    this.offset = 0;
    this.length = (source !== null) ? source.length : 0;

    currentLexeme = null;
};

/*
 * advance
 */
WhereLexer.prototype.advance = function advance()
{
    var inWhitespace = true;
    var result = null;

    while (inWhitespace) 
    {
        // assume not in whitespace
        inWhitespace = false;

        // clear possible last whitespace result
        result = null;

        if (this.offset < this.length) 
        {
            var match, text, type;

            // NOTE: [KEL] Switching on the first character may speed things up
            // here.

            if ((match = WHITESPACE_PATTERN.exec(this.source)) !== null)
            {
                result = new Lexeme(WHITESPACE, match[0]);
                inWhitespace = true;
            }
            else if ((match = OPERATOR_PATTERN.exec(this.source)) !== null) 
            {
                text = match[0];
                type = OperatorMap[text.toLowerCase()];

                result = new Lexeme(type, text);
            }
            else if ((match = KEYWORD_PATTERN.exec(this.source)) !== null) 
            {
                text = match[0];
                type = KeywordMap[text.toLowerCase()];

                result = new Lexeme(type, text);
            }
            else if ((match = STRING_PATTERN.exec(this.source)) !== null) 
            {
                result = new Lexeme(STRING, match[0]);
            }
            else if ((match = NUMBER_PATTERN.exec(this.source)) !== null) 
            {
                result = new Lexeme(NUMBER, match[0]);
            }
            else if ((match = IDENTIFIER_PATTERN.exec(this.source)) !== null) 
            {
                result = new Lexeme(IDENTIFIER, match[0]);
            }
            else
            {
                result = new Lexeme(ERROR, this.source);
            }

            // assign type name, if we have one
            if (TypeMap[result.type]) 
            {
                result.typeName = TypeMap[result.type];
            }

            // update source state
            var length = result.text.length;
            this.offset += length;
            this.source = this.source.substring(length);
        }
    }

    // expose result
    currentLexeme = result;

    return result;
};

// Binary operator node

/*
 * BinaryOperatorNode
 * 
 * @param {Node} identifier
 * @param {Number} identifier
 * @param {Node} identifier
 */
function BinaryOperatorNode(lhs, operator, rhs)
{
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
}

/*
 * execute
 * 
 * @param {Object} row
 * @param {Function} functionProvider
 */
BinaryOperatorNode.prototype.execute = function execute(row, functionProvider)
{
    var result = null;
    var lhs = this.lhs.execute(row, functionProvider);

    if (this.operator == IN)
    {
        // assume failure
        result = false;

        // see if the lhs value is in the rhs list
        for (var i = 0; i < this.rhs.length; i++)
        {
            var rhs = this.rhs[i].execute(row, functionProvider);

            if (lhs == rhs)
            {
                result = true;
                break;
            }
        }
    }
    else
    {
        var rhs = this.rhs.execute(row, functionProvider);
        
        switch (this.operator)
        {
            case EQUAL:
                result = (lhs === rhs);
                break;
                
            case NOT_EQUAL:
                result = (lhs !== rhs);
                break;
                
            case LESS_THAN:
                result = (lhs < rhs);
                break;
                
            case LESS_THAN_EQUAL:
                result = (lhs <= rhs);
                break;
                
            case GREATER_THAN:
                result = (lhs > rhs);
                break;
                
            case GREATER_THAN_EQUAL:
                result = (lhs >= rhs);
                break;
                
            case AND:
                result = (lhs && rhs);
                break;
                
            case OR:
                result = (lhs || rhs);
                break;
                
            default:
                return ActiveSupport.throwError(new Error("Unknown operator type: " + this.operator));
        }
    }
    
    return result;
};

// Identifer node

/*
 * Parser.IdentifierNode
 * 
 * @param {Object} identifier
 */
function IdentifierNode(identifier)
{
    this.identifier = identifier;
}

/*
 * execute
 * 
 * @param {Object} row
 * @param {Function} functionProvider
 */
IdentifierNode.prototype.execute = function execute(row, functionProvider)
{
    return row[this.identifier];
};

// Function node

/*
 * FunctionNode
 * 
 * @param {String} name
 * @param {Array} args
 */
function FunctionNode(name, args)
{
    this.name = name;
    this.args = args;
}

/*
 * execute
 * 
 * @param {Object} row
 * @param {Function} functionProvider
 */
FunctionNode.prototype.execute = function execute(row, functionProvider)
{
    // evaluate arguments
    var args = new Array(this.args.length);

    for (var i = 0; i < this.args.length; i++)
    {
        args[i] = this.args[i].execute(row, functionProvider);
    }

    // evaluate function and return result
    return functionProvider(this.name, row, args);
};

// Scalar node

/*
 * Parser.ScalarNode
 */
function ScalarNode(value)
{
    this.value = value;
}

/*
 * execute
 * 
 * @param {Object} row
 * @param {Function} functionProvider
 */
ScalarNode.prototype.execute = function execute(row, functionProvider)
{
    return this.value;
};


// Parser class

/*
 * WhereParser
 */
WhereParser = function WhereParser()
{
    this._lexer = new WhereLexer();
};

/*
 * parse
 * 
 * @param {String} source
 */
WhereParser.prototype.parse = function parse(source)
{
    var result = null;

    // clear current lexeme cache
    currentLexeme = null;

    // pass source to lexer
    this._lexer.setSource(source);

    // prime the lexeme pump
    this._lexer.advance();

    // parse it
    while (currentLexeme !== null)
    {
        // fast fail
        switch (currentLexeme.type)
        {
            case IDENTIFIER:
            case FALSE:
            case LPAREN:
            case NUMBER:
            case STRING:
            case TRUE:
                result = this.parseInExpression();
                break;

            default:
                throw new Error("Unrecognized starting token in where-clause:" + this._lexer.currentLexeme);
                return ActiveSupport.throwError(new Error("Unrecognized starting token in where-clause:" + this._lexer.currentLexeme));
        }
    }
    return result;
};

/*
 * parseWhereExpression
 */
WhereParser.prototype.parseInExpression = function parseInExpression()
{
    var result = this.parseOrExpression();

    while (currentLexeme !== null && currentLexeme.type === IN) 
    {
        // advance over 'in'
        this._lexer.advance();

        var rhs = [];

        if (currentLexeme !== null && currentLexeme.type === LPAREN)
        {
            // advance over '('
            this._lexer.advance();

            while (currentLexeme !== null)
            {
                rhs.push(this.parseOrExpression());

                if (currentLexeme !== null && currentLexeme.type === COMMA)
                {
                    this._lexer.advance();
                }
                else
                {
                    break;
                }
            }

            if (currentLexeme !== null && currentLexeme.type === RPAREN)
            {
                this._lexer.advance();

                result = new BinaryOperatorNode(result, IN, rhs);
            }
            else
            {
                return ActiveSupport.throwError(new Error("'in' list did not end with a right parenthesis." + currentLexeme));
            }
        }
        else
        {
            return ActiveSupport.throwError(new Error("'in' list did not start with a left parenthesis"));
        }
    }

    return result;
};

/*
 * parseOrExpression
 */
WhereParser.prototype.parseOrExpression = function parseOrExpression()
{
    var result = this.parseAndExpression();

    while (currentLexeme !== null && currentLexeme.type === OR) 
    {
        // advance over 'or' or '||'
        this._lexer.advance();

        var rhs = this.parseAndExpression();

        result = new BinaryOperatorNode(result, OR, rhs);
    }

    return result;
};

/*
 * parseAndExpression
 */
WhereParser.prototype.parseAndExpression = function parseAndExpression()
{
    var result = this.parseEqualityExpression();

    while (currentLexeme !== null && currentLexeme.type === AND) 
    {
        // advance over 'and' or '&&'
        this._lexer.advance();

        var rhs = this.parseEqualityExpression();

        result = new BinaryOperatorNode(result, AND, rhs);
    }

    return result;
};

/*
 * parseEqualityExpression
 */
WhereParser.prototype.parseEqualityExpression = function parseEqualityExpression()
{
    var result = this.parseRelationalExpression();

    if (currentLexeme !== null) 
    {
        var type = currentLexeme.type;

        switch (type)
        {
            case EQUAL:
            case NOT_EQUAL:
                // advance over '=' or '!='
                this._lexer.advance();

                var rhs = this.parseRelationalExpression();

                result = new BinaryOperatorNode(result, type, rhs);
                break;
        }
    }

    return result;
};

/*
 * parseRelationalExpression
 */
WhereParser.prototype.parseRelationalExpression = function()
{
    var result = this.parseMemberExpression();

    if (currentLexeme !== null) 
    {
        var type = currentLexeme.type;

        switch (type)
        {
            case LESS_THAN:
            case LESS_THAN_EQUAL:
            case GREATER_THAN:
            case GREATER_THAN_EQUAL:
                // advance over '<', '<=', '>' or '>='
                this._lexer.advance();

                var rhs = this.parseMemberExpression();

                result = new BinaryOperatorNode(result, type, rhs);
                break;
        }
    }

    return result;
};

/*
 * parseMemberExpression
 */
WhereParser.prototype.parseMemberExpression = function parseMemberExpression()
{
    var result = null;

    if (currentLexeme !== null) 
    {
        switch (currentLexeme.type)
        {
            case IDENTIFIER:
                result = new IdentifierNode(currentLexeme.text);
                // advance over identifier
                this._lexer.advance();

                if (currentLexeme !== null && currentLexeme.type === LPAREN) 
                {
                    // this is a function
                    var name = result.identifier;
                    var args = [];

                    // advance over '('
                    this._lexer.advance();

                    // process arguments
                    while (currentLexeme !== null && currentLexeme.type !== RPAREN) 
                    {
                        args.push(this.parseOrExpression());

                        if (currentLexeme !== null && currentLexeme.type === COMMA)
                        {
                            this._lexer.advance();
                        }
                    }

                    // advance over ')'
                    if (currentLexeme !== null) 
                    {
                        this._lexer.advance();
                        result = new FunctionNode(name, args);
                    }
                    else 
                    {
                        return ActiveSupport.throwError(new Error("Function argument list was not closed with a right parenthesis."));
                    }
                }
                break;

            case TRUE:
                result = new ScalarNode(true);

                // advance over 'true'
                this._lexer.advance();
                break;

            case FALSE:
                result = new ScalarNode(false);

                // advance over 'false'
                this._lexer.advance();
                break;

            case NUMBER:
                result = new ScalarNode(currentLexeme.text - 0);

                // advance over number
                this._lexer.advance();
                break;

            case STRING:
                var text = currentLexeme.text;

                result = new ScalarNode(text.substring(1, text.length - 1));

                // advance over string
                this._lexer.advance();
                break;

            case LPAREN:
                // advance over '('
                this._lexer.advance();

                result = this.parseOrExpression();

                if (currentLexeme !== null && currentLexeme.type === RPAREN)
                {
                    // advance over ')'
                    this._lexer.advance();
                }
                else
                {
                    return ActiveSupport.throwError(new Error("Missing closing right parenthesis: " + currentLexeme));
                }
                break;
        }
    }

    return result;
};


//})();

//ActiveRecord.WhereLexer = WhereLexer;
ActiveRecord.WhereParser = WhereParser;

var Finders = {
    mergeOptions: function mergeOptions(field_name, value, options)
    {
        if(!options){
            options = {};
        }
        options = ActiveSupport.clone(options);
        if(options.where)
        {
            options.where[field_name] = value;
        }
        else
        {
            options.where = {};
            options.where[field_name] = value;
        }
        return options;
    },
    /**
     * Generates a findByField method for a ActiveRecord.Class (User.findByName)
     * @private
     * @alias ActiveRecord.Finders.generateFindByField
     * @param {Object} ActiveRecord.Class
     * @param {String} field_name
     */
    generateFindByField: function generateFindByField(klass, field_name)
    {
        klass['findBy' + ActiveSupport.camelize(field_name, true)] = ActiveSupport.curry(function generated_find_by_field_delegator(klass, field_name, value, options){
            return klass.find(ActiveSupport.extend(Finders.mergeOptions(field_name, value, options), {
                first: true
            }));
        }, klass, field_name);
    },
    /**
     * Generates a findAllByField method for a ActiveRecord.Class (User.findAllByName)
     * @private
     * @alias ActiveRecord.Finders.generateFindAllByField
     * @param {Object} ActiveRecord.Class
     * @param {String} field_name
     */
    generateFindAllByField: function generateFindAllByField(klass, field_name)
    {
        klass['findAllBy' + ActiveSupport.camelize(field_name, true)] = ActiveSupport.curry(function generated_find_all_by_field_delegator(klass, field_name, value, options){
            return klass.find(ActiveSupport.extend(Finders.mergeOptions(field_name, value, options), {
                all: true
            }));
        }, klass, field_name);
    }
};
ActiveRecord.Finders = Finders;

/**
 * When using any finder method, the returned array will be extended
 * with the methods in this namespace. A returned result set is still
 * an instance of Array.
 * @namespace {ActiveRecord.ResultSet}
 */
var ResultSet = {};

ResultSet.InstanceMethods = {
    /**
     * Re-runs the query that generated the result set. This modifies the
     * array in place and does not return a new array.
     * @alias ActiveRecord.ResultSet.reload
     */
    reload: function reload(result_set,params,model){
        result_set.length = 0;
        var new_response = model.find(ActiveSupport.extend(ActiveSupport.clone(params),{synchronize: false}));
        for(var i = 0; i < new_response.length; ++i)
        {
            result_set.push(new_response[i]);
        }
    },
    /**
     * Builds an array calling toObject() on each instance in the result
     * set, thus reutrning a vanilla array of vanilla objects.
     * @alias ActiveRecord.ResultSet.toArray
     * @return {Array}
     */
    toArray: function toArray(result_set,params,model)
    {
        var items = [];
        for(var i = 0; i < result_set.length; ++i)
        {
            items.push(result_set[i].toObject());
        }
        return items;
    },
    /**
     * @alias ActiveRecord.ResultSet.toJSON
     * @return {String}
     */
    toJSON: function toJSON(result_set,params,model)
    {
        var items = [];
        for(var i = 0; i < result_set.length; ++i)
        {
            items.push(result_set[i].toSerializableObject());
        }
        return ActiveSupport.JSON.stringify(items);
    },
    /**
     * @alias ActiveRecord.ResultSet.toXML
     * @return {String}
     */
    toXML: function toXML(result_set,params,model)
    {
        var items = [];
        for(var i = 0; i < result_set.length; ++i)
        {
            items.push(result_set[i].toSerializableObject());
        }
        return ActiveSupport.XMLFromObject(ActiveSupport.Inflector.pluralize(model.modelName),items);
    }
};

var Relationships = {
    normalizeModelName: function(related_model_name)
    {
        var plural = ActiveSupport.camelize(related_model_name, true);
        var singular = ActiveSupport.Inflector.singularize(plural) || plural;
        return singular || plural;
    },
    normalizeForeignKey: function(foreign_key, related_model_name)
    {
        var plural = ActiveSupport.underscore(related_model_name).toLowerCase();
        var singular = ActiveSupport.Inflector.singularize(plural) || plural;
        if (!foreign_key || typeof(foreign_key) === 'undefined')
        {
            return (singular || plural) + '_id';
        }
        else
        {
            return foreign_key;
        }
    }
};
ActiveRecord.Relationships = Relationships;

/**
 * Sepcifies a 1->1 relationship between models. The foreign key will reside in the related object.
 * @alias ActiveRecord.Class.hasOne
 * @param {String} related_model_name
 *      Can be a plural or singular referring to the related table, the model name, or a reference to the model itself ("users","User" or User would all work).
 * @param {Object} [options]
 *      Can contain {String} "foreignKey", {String} "name", {Boolean} "dependent" keys.
 * @example
 * 
 *     User.hasOne(CreditCard);
 *     var u = User.find(5);
 *     //each User instance will gain the following 3 methods
 *     u.getCreditCard()
 *     u.buildCreditCard()
 *     u.createCreditCard()
 */
ActiveRecord.ClassMethods.hasOne = function hasOne(related_model_name, options)
{
    if(related_model_name && related_model_name.modelName)
    {
        related_model_name = related_model_name.modelName;
    }
    if(!options)
    {
        options = {};
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(related_model_name));
    var class_methods = {};
    var instance_methods = {};
    instance_methods['get' + relationship_name] = ActiveSupport.curry(function getRelated(related_model_name, foreign_key){
        var id = this.get(foreign_key);
        if (id)
        {
            return ActiveRecord.Models[related_model_name].find(id);
        }
        else
        {
            return false;
        }
    }, related_model_name, foreign_key);
    class_methods['build' + relationship_name] = instance_methods['build' + relationship_name] = ActiveSupport.curry(function buildRelated(related_model_name, foreign_key, params){
        return ActiveRecord.Models[related_model_name].build(params || {});
    }, related_model_name, foreign_key);
    instance_methods['create' + relationship_name] = ActiveSupport.curry(function createRelated(related_model_name, foreign_key, params){
        var record = ActiveRecord.Models[related_model_name].create(params || {});
        if(this.get(this.constructor.primaryKeyName))
        {
            this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
        }
        return record;
    }, related_model_name, foreign_key);
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    
    //dependent
    if(options.dependent)
    {
        this.observe('afterDestroy',function destroyRelatedDependent(record){
            var child = record['get' + relationship_name]();
            if(child)
            {
                child.destroy();
            }
        });
    }
};

/**
 * Sepcifies a 1->N relationship between models. The foreign key will reside in the child (related) object.
 * @alias ActiveRecord.Class.hasMany
 * @param {String} related_model_name
 *      Can be a plural or singular referring to the related table, the model name, or a reference to the model itself ("users","User" or User would all work).
 * @param {Object} [options]
 *      Can contain {String} "foreignKey", {Sting} "name", {Boolean} "dependent", {String} "order" and {String} "where" keys.
 * @example
 *
 *     User.hasMany('comments',{
 *         dependent: true
 *     });
 *     var u = User.find(5);
 *     //each User instance will gain the following 5 methods
 *     u.createComment()
 *     u.buildComment()
 *     u.destroyComment()
 *     u.getCommentList() //takes the same options as find()
 *     u.getCommentCount() //takes the same options as count() 
 */
ActiveRecord.ClassMethods.hasMany = function hasMany(related_model_name, options){
    if(related_model_name && related_model_name.modelName)
    {
        related_model_name = related_model_name.modelName;
    }
    if(!options)
    {
        options = {};
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var original_related_model_name = related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, Relationships.normalizeModelName(this.modelName));
    var class_methods = {};
    var instance_methods = {};
    
    if(options.through)
    {
        var through_model_name = Relationships.normalizeModelName(options.through);
        instance_methods['get' + relationship_name + 'List'] = ActiveSupport.curry(function getRelatedListForThrough(through_model_name, related_model_name, foreign_key, params){
            var related_list = this['get' + through_model_name + 'List']();
            var ids = [];
            var response = [];
            for(var i = 0; i < related_list.length; ++i)
            {
                response.push(related_list[i]['get' + related_model_name]());
            }
            return response;
        }, through_model_name, related_model_name, foreign_key);
        
        instance_methods['get' + relationship_name + 'Count'] = ActiveSupport.curry(function getRelatedCountForThrough(through_model_name, related_model_name, foreign_key, params){
            if(!params)
            {
                params = {};
            }
            if(!params.where)
            {
                params.where = {};
            }
            params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
            return ActiveRecord.Models[through_model_name].count(params);
        }, through_model_name, related_model_name, foreign_key);
    }
    else
    {
        instance_methods['destroy' + relationship_name] = class_methods['destroy' + relationship_name] = ActiveSupport.curry(function destroyRelated(related_model_name, foreign_key, params){
            var record = ActiveRecord.Models[related_model_name].find((params && typeof(params.get) === 'function') ? params.get(params.constructor.primaryKeyName) : params);
            if (record)
            {
                return record.destroy();
            }
            else
            {
                return false;
            }
        }, related_model_name, foreign_key);

        instance_methods['get' + relationship_name + 'List'] = ActiveSupport.curry(function getRelatedList(related_model_name, foreign_key, params){
            if(!params)
            {
                params = {};
            }
            if(options.order)
            {
                params.order = options.order;
            }
            if(options.synchronize)
            {
                params.synchronize = options.synchronize;
            }
            if(!params.where)
            {
                params.where = {};
            }
            params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
            params.all = true;
            return ActiveRecord.Models[related_model_name].find(params);
        }, related_model_name, foreign_key);

        instance_methods['get' + relationship_name + 'Count'] = ActiveSupport.curry(function getRelatedCount(related_model_name, foreign_key, params){
            if(!params)
            {
                params = {};
            }
            if(!params.where)
            {
                params.where = {};
            }
            params.where[foreign_key] = this.get(this.constructor.primaryKeyName);
            return ActiveRecord.Models[related_model_name].count(params);
        }, related_model_name, foreign_key);

        instance_methods['build' + relationship_name] = ActiveSupport.curry(function buildRelated(related_model_name, foreign_key, params){
            if(!params)
            {
                params = {};
            }
            params[foreign_key] = this.get(this.constructor.primaryKeyName);
            return ActiveRecord.Models[related_model_name].build(params);
        }, related_model_name, foreign_key);

        instance_methods['create' + relationship_name] = ActiveSupport.curry(function createRelated(related_model_name, foreign_key, params){
            if(!params)
            {
                params = {};
            }
            params[foreign_key] = this.get(this.constructor.primaryKeyName);
            return ActiveRecord.Models[related_model_name].create(params);
        }, related_model_name, foreign_key);
    }
    
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    
    //dependent
    if(options.dependent)
    {
        this.observe('afterDestroy', function destroyDependentChildren(record){
            var list = record['get' + relationship_name + 'List']();
            ActiveRecord.connection.log('Relationships.hasMany destroy ' + list.length + ' dependent ' + related_model_name + ' children of ' + record.modelName);
            for(var i = 0; i < list.length; ++i)
            {
                list[i].destroy();
            }
        });
    }
};

/**
 * Sepcifies a 1<-1 relationship between models. The foreign key will reside in the declaring object.
 * @alias ActiveRecord.Class.belongsTo
 * @param {String} related_model_name
 *      Can be a plural or singular referring to the related table, the model name, or a reference to the model itself ("users","User" or User would all work).
 * @param {Object} [options]
 *      Can contain {String} "foreignKey", {String} name, {String} "counter" keys.
 * @example
 *
 *     Comment.belongsTo('User',{
 *         counter: 'comment_count' //comment count must be a column in User
 *     });
 *     var c = Comment.find(5);
 *     //each Comment instance will gain the following 3 methods
 *     c.getUser()
 *     c.buildUser()
 *     c.createUser()
 */
ActiveRecord.ClassMethods.belongsTo = function belongsTo(related_model_name, options){
    if(related_model_name && related_model_name.modelName)
    {
        related_model_name = related_model_name.modelName;
    }
    if(!options)
    {
        options = {};
    }
    related_model_name = Relationships.normalizeModelName(related_model_name);
    var relationship_name = options.name ? Relationships.normalizeModelName(options.name) : related_model_name;
    var foreign_key = Relationships.normalizeForeignKey(options.foreignKey, related_model_name);
    var class_methods = {};
    var instance_methods = {};
    instance_methods['get' + relationship_name] = ActiveSupport.curry(function getRelated(related_model_name,foreign_key){
        var id = this.get(foreign_key);
        if (id)
        {
            return ActiveRecord.Models[related_model_name].find(id);
        }
        else
        {
            return false;
        }
    }, related_model_name, foreign_key);
    instance_methods['build' + relationship_name] = class_methods['build' + relationship_name] = ActiveSupport.curry(function buildRelated(related_model_name, foreign_key, params){
        var record = ActiveRecord.Models[related_model_name].build(params || {});
        if(options.counter)
        {
            record[options.counter] = 1;
        }
        return record;
    }, related_model_name, foreign_key);
    instance_methods['create' + relationship_name] = ActiveSupport.curry(function createRelated(related_model_name, foreign_key, params){
        var record = this['build' + related_model_name](params);
        if(record.save() && this.get(this.constructor.primaryKeyName))
        {
            this.updateAttribute(foreign_key, record.get(record.constructor.primaryKeyName));
        }
        return record;
    }, related_model_name, foreign_key);
    ActiveSupport.extend(this.prototype, instance_methods);
    ActiveSupport.extend(this, class_methods);
    
    //counter
    if(options.counter)
    {
        this.observe('afterDestroy', function decrementBelongsToCounter(record){
            var child = record['get' + relationship_name]();
            if(child)
            {
                var current_value = child.get(options.counter);
                if(typeof(current_value) === 'undefined')
                {
                    current_value = 0;
                }
                child.updateAttribute(options.counter, Math.max(0, parseInt(current_value, 10) - 1));
            }
        });
        this.observe('afterCreate', function incrementBelongsToCounter(record){
            var child = record['get' + relationship_name]();
            if(child)
            {
                var current_value = child.get(options.counter);
                if(typeof(current_value) === 'undefined')
                {
                    current_value = 0;
                }
                child.updateAttribute(options.counter, parseInt(current_value, 10) + 1);
            }
        });
    }
};
 
/**
 * @namespace {ActiveRecord.Migrations}
 * @example
 * Migrations are a method of versioining the database schema used by your
 * application. All of your migrations must be defined in an object assigned
 * to ActiveRecord.Migrations.migrations. The keys need not be numerically
 * sequential, but must be numeric (i.e. 1,2,3 or 100,200,300).
 *
 * Each migration object must have an up() and down() method which will
 * recieve an ActiveRecord.Migrations.Schema object. createTable() and
 * addColumn() both use the same syntax as define() to specify default
 * values and field types.
 * 
 *     ActiveRecord.Migrations.migrations = {
 *         1: {
 *             up: function(schema){
 *                 schema.createTable('one',{
 *                     a: '',
 *                     b: {
 *                         type: 'TEXT',
 *                         value: 'default'
 *                     }
 *                 });
 *             },
 *             down: function(schema){
 *                 schema.dropTable('one');
 *             }
 *         },
 *         2: {
 *             up: function(schema){
 *                 schema.addColumn('one','c');
 *             },
 *             down: function(schema){
 *                 schema.dropColumn('one','c');
 *             }
 *         }
 *     };
 *     
 *     ActiveRecord.Migrations.migrate(); //will migrate to the highest available (2 in this case)
 *     ActiveRecord.Migrations.migrate(0); //migrates down below 1, effectively erasing the schema
 *     ActiveRecord.Migrations.migrate(1); //migrates to version 1
 */

var Migrations = {
    fieldTypesWithDefaultValues: {
        'tinyint': 0,
        'smallint': 0,
        'mediumint': 0,
        'int': 0,
        'integer': 0,
        'bitint': 0,
        'float': 0,
        'double': 0,
        'bouble precision': 0,
        'real': 0,
        'decimal': 0,
        'numeric': 0,

        'date': '',
        'datetime': '',
        'timestamp': '',
        'time': '',
        'year': '',

        'char': '',
        'varchar': '',
        'tinyblob': '',
        'tinytext': '',
        'blob': '',
        'text': '',
        'mediumtext': '',
        'mediumblob': '',
        'longblob': '',
        'longtext': '',
        
        'enum': '',
        'set': ''
    },    
    migrations: {},
    /**
     * Migrates a database schema to the given version.
     * @alias ActiveRecord.Migrations.migrate
     * @param {Number} target
     */
    migrate: function migrate(target)
    {
        if(typeof(target) === 'undefined' || target === false)
        {
            target = Migrations.max();
        }
        
        Migrations.setup();
        ActiveRecord.connection.log('Migrations.migrate(' + target + ') start.');
        
        var current_version = Migrations.current();
        ActiveRecord.connection.log('Current schema version is ' + current_version);
        
        var migrations, i, versions;
        Migrations.Meta.transaction(function(){
            if(target > current_version)
            {
                migrations = Migrations.collectAboveIndex(current_version,target);
                for(i = 0; i < migrations.length; ++i)
                {
                    ActiveRecord.connection.log('Migrating up to version ' + migrations[i][0]);
                    migrations[i][1].up(Migrations.Schema);
                    Migrations.Meta.create({
                        version: migrations[i][0]
                    });
                }
            }
            else if(target < current_version)
            {
                migrations = Migrations.collectBelowIndex(current_version,target);
                for(i = 0; i < migrations.length; ++i)
                {
                    ActiveRecord.connection.log('Migrating down to version ' + migrations[i][0]);
                    migrations[i][1].down(Migrations.Schema);
                }
                versions = Migrations.Meta.find({
                    all: true
                });
                for(i = 0; i < versions.length; ++i)
                {
                    if(versions[i].get('version') > target)
                    {
                        versions[i].destroy();
                    }
                }
                ActiveRecord.connection.log('Migrate to version ' + target + ' complete.');
            }
            else
            {
                ActiveRecord.connection.log('Current schema version is current, no migrations were run.');
            }
        },function(e){
            ActiveRecord.connection.log('Migration failed: ' + e);
        });
        ActiveRecord.connection.log('Migrations.migrate(' + target + ') finished.');
    },
    /**
     * Returns the current schema version number.
     * @alias ActiveRecord.Migrations.current
     * @return {Number}
     */
    current: function current()
    {
        Migrations.setup();
        return Migrations.Meta.max('version') || 0;
    },
    /**
     * Returns the highest key name in the ActiveRecord.Migrations hash.
     * @alias ActiveRecord.Migrations.max
     * @return {Number}
     */
    max: function max()
    {
        var max_val = 0;
        for(var key_name in Migrations.migrations)
        {
            key_name = parseInt(key_name, 10);
            if(key_name > max_val)
            {
                max_val = key_name;
            }
        }
        return max_val;
    },
    setup: function setMigrationsTable()
    {
        if(!Migrations.Meta)
        {
            Migrations.Meta = ActiveRecord.create('schema_migrations',{
                version: 0
            });
            delete ActiveRecord.Models.SchemaMigrations;
        }
    },
    /**
     * Returns an array of [key_name,migration] pairs in the order they should be run to migrate down.
     * @private
     * @alias ActiveRecord.Migrations.collectBelowIndex
     * @param {Number} index
     * @param {Number} target
     * @return {Array}
     */
    collectBelowIndex: function collectBelowIndex(index,target)
    {
        return [[index,Migrations.migrations[index]]].concat(Migrations.collectMigrations(index,target + 1,'down'));
    },
    /**
     * Returns an array of [key_name,migration] pairs in the order they should be run to migrate up.
     * @private
     * @alias ActiveRecord.Migrations.collectAboveIndex
     * @param {Number} index
     * @param {Number} target
     * @return {Array}
     */
    collectAboveIndex: function collectAboveIndex(index,target)
    {
        return Migrations.collectMigrations(index,target,'up');
    },
    collectMigrations: function collectMigrations(index,target,direction)
    {
        var keys = [];
        for(var key_name in Migrations.migrations)
        {
            key_name = parseInt(key_name, 10);
            if((direction === 'up' && key_name > index) || (direction === 'down' && key_name < index))
            {
                keys.push(key_name);
            }
        }
        keys = keys.sort();
        if(direction === 'down')
        {
            keys = keys.reverse();
        }
        var migrations = [];
        for(var i = 0; i < keys.length; ++i)
        {
            if((direction === 'down' && typeof(target) !== 'undefined' && target > keys[i]) || (direction === 'up' && typeof(target) !== 'undefined' && target < keys[i]))
            {
                break;
            }
            migrations.push([keys[i],Migrations.migrations[keys[i]]]);
        }
        return migrations;
    },
    objectIsFieldDefinition: function objectIsFieldDefinition(object)
    {
        return typeof(object) === 'object' && ActiveSupport.keys(object).length === 2 && ('type' in object) && ('value' in object);
    },
    /**
     * @namespace {ActiveRecord.Migrations.Schema} This object is passed to all migrations as the only parameter.
     */
    Schema: {
        /**
         * @alias ActiveRecord.Migrations.Schema.createTable
         * @param {String} table_name
         * @param {Object} columns
         */
        createTable: function createTable(table_name,columns)
        {
            return ActiveRecord.connection.createTable(table_name,columns);
        },
        /**
         * @alias ActiveRecord.Migrations.Schema.dropTable
         * @param {String} table_name
         */
        dropTable: function dropTable(table_name)
        {
            return ActiveRecord.connection.dropTable(table_name);
        },
        /**
         * @alias ActiveRecord.Migrations.Schema.addColumn
         * @param {String} table_name
         * @param {String} column_name
         * @param {mixed} [data_type]
         */
        addColumn: function addColumn(table_name,column_name,data_type)
        {
            return ActiveRecord.connection.addColumn(table_name,column_name,data_type);
        },
        /**
         * @alias ActiveRecord.Migrations.Schema.dropColumn
         * @param {String} table_name
         * @param {String} column_name
         */
        dropColumn: function removeColumn(table_name,column_name)
        {
            return ActiveRecord.connection.dropColumn(table_name,column_name);
        },
        /**
         * @alias ActiveRecord.Migrations.Schema.addIndex
         * @param {String} table_name
         * @param {Array} column_names
         * @param {Object} options
         */
        addIndex: function addIndex(table_name,column_names,options)
        {
            return ActiveRecord.connection.addIndex(table_name,column_names,options);
        },
        /**
         * @alias ActiveRecord.Migrations.Schema.removeIndex
         * @param {String} table_name
         * @param {String} index_name
         */
        removeIndex: function removeIndex(table_name,index_name)
        {
            return ActiveRecord.connection.removeIndex(table_name,index_name);
        }
    }
};

ActiveRecord.Migrations = Migrations;

ActiveSupport.extend(ActiveRecord.ClassMethods,{
    /**
     * Adds the validator to the _validators array of a given ActiveRecord.Class.
     * @alias ActiveRecord.Class.addValidator
     * @param {Function} validator
     */
    addValidator: function addValidator(validator)
    {
        if(!this._validators)
        {
            this._validators = [];
        }
        this._validators.push(validator);
    },
    /**
     * @alias ActiveRecord.Class.validatesPresenceOf
     * @param {String} field
     * @param {Object} [options]
     */
    validatesPresenceOf: function validatesPresenceOf(field, options)
    {
        options = ActiveSupport.extend({
            
        },options || {});
        this.addValidator(function validates_presence_of_callback(){
            if(!this.get(field) || this.get(field) === '')
            {
                this.addError(options.message || (field + ' is not present.'));
            }
        });
    },
    /**
     * Accepts "min" and "max" numbers as options.
     * @alias ActiveRecord.Class.validatesLengthOf
     * @param {String} field
     * @param {Object} [options]
     */
    validatesLengthOf: function validatesLengthOf(field, options)
    {
        options = ActiveSupport.extend({
            min: 1,
            max: 9999
        },options || {});
        //will run in scope of an ActiveRecord instance
        this.addValidator(function validates_length_of_callback(){
            var value = new String(this.get(field));
            if (value.length < options.min)
            {
                this.addError(options.message || (field + ' is too short.'));
            }
            if (value.length > options.max)
            {
                this.addError(options.message || (field + ' is too long.'));
            }
        });
    }
});
ActiveSupport.extend(ActiveRecord.InstanceMethods,{
    /**
     * @alias ActiveRecord.Instance.addError
     * @param {String} message
     * @param {String} field_name
     */
    addError: function addError(str, field)
    {
        var error = null;
        if(field)
        {
            error = [str,field];
            error.toString = function toString()
            {
                return str;
            };
        }
        else
        {
            error = str;
        }
        this._errors.push(str);
    },
    _valid: function _valid()
    {
        this._errors = [];
        var validators = this._getValidators();
        for (var i = 0; i < validators.length; ++i)
        {
            validators[i].apply(this);
        }
        if (typeof(this.valid) === 'function')
        {
            this.valid();
        }
        ActiveRecord.connection.log('ActiveRecord.valid()? ' + (new String(this._errors.length === 0).toString()) + (this._errors.length > 0 ? '. Errors: ' + (new String(this._errors)).toString() : ''));
        return this._errors.length === 0;
    },
    _getValidators: function _getValidators()
    {
        return this.constructor._validators || [];
    },
    /**
     * @alias ActiveRecord.Instance.getErrors
     * @return {Array}
     */
    getErrors: function getErrors()
    {
        return this._errors;
    }
});
 
ActiveRecord.asynchronous = false; //deprecated until we have HTML5 support

var Synchronization = {};

Synchronization.calculationNotifications = {};

Synchronization.resultSetNotifications = {};

Synchronization.notifications = {};

Synchronization.setupNotifications = function setupNotifications(record)
{
    if(!record.get(record.constructor.primaryKeyName))
    {
        return false;
    }
    if(!Synchronization.notifications[record.tableName])
    {
        Synchronization.notifications[record.tableName] = {};
    }
    if(!Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]])
    {
        Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]] = {};
    }    
    return true;
};

Synchronization.triggerSynchronizationNotifications = function triggerSynchronizationNotifications(record,event_name)
{
    var found_records, internal_count_id;
    if(!Synchronization.setupNotifications(record))
    {
        return false;
    }
    if(event_name === 'afterSave')
    {
        found_records = Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]];
        for(internal_count_id in found_records)
        {
            if(internal_count_id !== record.internalCount)
            {
                var found_record = found_records[internal_count_id];
                var keys = found_record.keys();
                for(var i = 0; i < keys.length; ++i)
                {
                    var key_name = keys[i];
                    found_record.set(key_name,record.get(key_name));
                }
                found_record.notify('synchronization:afterSave');
            }
        }
    }
    else if(event_name === 'afterDestroy' || event_name === 'afterCreate')
    {
        if(Synchronization.calculationNotifications[record.tableName])
        {
            for(var synchronized_calculation_count in Synchronization.calculationNotifications[record.tableName])
            {
                Synchronization.calculationNotifications[record.tableName][synchronized_calculation_count]();
            }
        }
        if(Synchronization.resultSetNotifications[record.tableName])
        {
            for(var synchronized_result_set_count in Synchronization.resultSetNotifications[record.tableName])
            {
                var old_result_set = Synchronization.resultSetNotifications[record.tableName][synchronized_result_set_count].resultSet;
                var new_params = ActiveSupport.clone(Synchronization.resultSetNotifications[record.tableName][synchronized_result_set_count].params);
                var new_result_set = record.constructor.find(ActiveSupport.extend(new_params,{synchronize: false}));
                var splices = Synchronization.spliceArgumentsFromResultSetDiff(old_result_set,new_result_set,event_name);
                for(var x = 0; x < splices.length; ++x)
                {
                    if(event_name == 'afterCreate')
                    {
                        var to_synchronize = splices[x].slice(2);
                        for(var s = 0; s < to_synchronize.length; ++s)
                        {
                            to_synchronize[s].synchronize();
                        }
                    }
                    old_result_set.splice.apply(old_result_set,splices[x]);
                }
            }
        }
        if(event_name === 'afterDestroy')
        {
            found_records = Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]];
            for(internal_count_id in found_records)
            {
                if(internal_count_id !== record.internalCount)
                {
                    found_records[internal_count_id].notify('synchronization:afterDestroy');
                    Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]][internal_count_id] = null;
                    delete Synchronization.notifications[record.tableName][record[record.constructor.primaryKeyName]][internal_count_id];
                }
            }
        }
    }
};

ActiveSupport.extend(ActiveRecord.InstanceMethods,{
    /**
     * Once synchronized a found instance will have it's values updated if
     * other records with the same id change in the database.
     * @alias ActiveRecord.Instance.synchronize
     * @return {null}
     */
    synchronize: function synchronize()
    {
        if(!this.isSynchronized)
        {
            this.isSynchronized = true;
            Synchronization.setupNotifications(this);
            Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount] = this;
        }
    },
    /**
     * Stops the synchronization of the record with the database.
     * @alias ActiveRecord.Instance.stop
     * @return {null}
     */
    stop: function stop()
    {
        Synchronization.setupNotifications(this);
        Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount] = null;
        delete Synchronization.notifications[this.tableName][this[this.constructor.primaryKeyName]][this.internalCount];
    }
});

Synchronization.synchronizedCalculationCount = 0;

Synchronization.synchronizeCalculation = function synchronizeCalculation(klass,operation,params)
{
    ++Synchronization.synchronizedCalculationCount;
    var callback = params.synchronize;
    var callback_params = ActiveSupport.clone(params);
    delete callback_params.synchronize;
    if(!Synchronization.calculationNotifications[klass.tableName])
    {
        Synchronization.calculationNotifications[klass.tableName] = {};
    }
    Synchronization.calculationNotifications[klass.tableName][Synchronization.synchronizedCalculationCount] = (function calculation_synchronization_executer_generator(klass,operation,params,callback){
        return function calculation_synchronization_executer(){
            callback(klass[operation](callback_params));
        };
    })(klass,operation,params,callback);
    Synchronization.calculationNotifications[klass.tableName][Synchronization.synchronizedCalculationCount]();
    return (function calculation_synchronization_stop_generator(table_name,synchronized_calculation_count){
        return function calculation_synchronization_stop(){
            Synchronization.calculationNotifications[table_name][synchronized_calculation_count] = null;
            delete Synchronization.calculationNotifications[table_name][synchronized_calculation_count];
        };
    })(klass.tableName,Synchronization.synchronizedCalculationCount);
};

Synchronization.synchronizedResultSetCount = 0;

Synchronization.synchronizeResultSet = function synchronizeResultSet(klass,params,result_set)
{
    ++Synchronization.synchronizedResultSetCount;
    if(!Synchronization.resultSetNotifications[klass.tableName])
    {
        Synchronization.resultSetNotifications[klass.tableName] = {};
    }
    Synchronization.resultSetNotifications[klass.tableName][Synchronization.synchronizedResultSetCount] = {
        resultSet: result_set,
        params: params
    };
    for(var i = 0; i < result_set.length; ++i)
    {
        result_set[i].synchronize();
    }
    result_set.stop = (function result_set_synchronization_stop_generator(table_name,synchronized_result_set_count){
        return function stop(){
            for(var i = 0; i < this.length; ++i)
            {
                this[i].stop();
            }
            Synchronization.resultSetNotifications[table_name][synchronized_result_set_count] = null;
            delete Synchronization.resultSetNotifications[table_name][synchronized_result_set_count];
        };
    })(klass.tableName,Synchronization.synchronizedResultSetCount);
};

Synchronization.spliceArgumentsFromResultSetDiff = function spliceArgumentsFromResultSetDiff(a,b,event_name)
{
    var diffs = [];
    if(event_name === 'afterCreate')
    {
        for(var i = 0; i < b.length; ++i)
        {
            if(!a[i] || (a[i] && (a[i][a[i].constructor.primaryKeyName] !== b[i][b[i].constructor.primaryKeyName])))
            {
                diffs.push([i,null,b[i]]);
                break;
            }
        }
    }
    else if(event_name === 'afterDestroy')
    {
        for(var i = 0; i < a.length; ++i)
        {
            if(!b[i] || (b[i] && (b[i][b[i].constructor.primaryKeyName] !== a[i][a[i].constructor.primaryKeyName])))
            {
                diffs.push([i,1]);
                break;
            }
        }
    }
    return diffs;
};

ActiveRecord.Synchronization = Synchronization;

})();
 
(function(){

ActiveRecord.Adapters.MySQL = ActiveSupport.extend(ActiveSupport.clone(ActiveRecord.Adapters.SQL),{
    createTable: function createTable(table_name,columns)
    {
        var keys = ActiveSupport.keys(columns);
        var fragments = [];
        for (var i = 0; i < keys.length; ++i)
        {
            var key = keys[i];
            if(columns[key].primaryKey)
            {
                fragments.unshift(key + ' INT NOT NULL AUTO_INCREMENT');
                fragments.push('PRIMARY KEY(' + key + ')');
            }
            else
            {
                fragments.push(this.getColumnDefinitionFragmentFromKeyAndColumns(key,columns));
            }
        }
        return this.executeSQL('CREATE TABLE IF NOT EXISTS ' + table_name + ' (' + fragments.join(',') + ') ENGINE=InnoDB');
    },
    dropColumn: function dropColumn(table_column,column_name)
    {
        return this.executeSQL('ALTER TABLE ' + table_name + ' DROP COLUMN ' + key);
    }
});

})();

(function(){

/**
 * Adapter for Jaxer configured with SQLite
 * @alias ActiveRecord.Adapters.JaxerSQLite
 * @property {ActiveRecord.Adapter}
 */ 
ActiveRecord.Adapters.JaxerSQLite = function JaxerSQLite(){
    ActiveSupport.extend(this,ActiveRecord.Adapters.InstanceMethods);
    ActiveSupport.extend(this,ActiveRecord.Adapters.SQLite);
    ActiveSupport.extend(this,{
        log: function log()
        {
            if (!ActiveRecord.logging)
            {
                return;
            }
            if (arguments[0])
            {
                arguments[0] = 'ActiveRecord: ' + arguments[0];
            }
            return ActiveSupport.log.apply(ActiveSupport,arguments || {});
        },
        executeSQL: function executeSQL(sql)
        {
            ActiveRecord.connection.log("Adapters.JaxerSQLite.executeSQL: " + sql + " [" + ActiveSupport.arrayFrom(arguments).slice(1).join(',') + "]");
            var response = Jaxer.DB.execute.apply(Jaxer.DB.connection, arguments);
            return response;
        },
        getLastInsertedRowId: function getLastInsertedRowId()
        {
            return Jaxer.DB.lastInsertId;
        },
        iterableFromResultSet: function iterableFromResultSet(result)
        {
            result.iterate = function iterate(iterator)
            {
                if (typeof(iterator) === 'number')
                {
                    if (this.rows[iterator])
                    {
                        return ActiveSupport.clone(this.rows[iterator]);
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    for (var i = 0; i < this.rows.length; ++i)
                    {
                        var row = ActiveSupport.clone(this.rows[i]);
                        delete row['$values'];
                        iterator(row);
                    }
                }
            };
            return result;
        },
        transaction: function transaction(proceed)
        {
            try
            {
                ActiveRecord.connection.executeSQL('BEGIN');
                proceed();
                ActiveRecord.connection.executeSQL('COMMIT');
            }
            catch(e)
            {
                ActiveRecord.connection.executeSQL('ROLLBACK');
                return ActiveSupport.throwError(e);
            }
        }
    });
};
ActiveRecord.Adapters.JaxerSQLite.connect = function connect(path)
{
    Jaxer.DB.connection = new Jaxer.DB.SQLite.createDB({
        PATH: Jaxer.Dir.resolve(path || 'ActiveRecord.sqlite')
    });
    return new ActiveRecord.Adapters.JaxerSQLite();
};

})();
 
(function(){
  
/**
 * Adapter for Jaxer configured with MySQL.
 * @alias ActiveRecord.Adapters.JaxerMySQL
 * @property {ActiveRecord.Adapter}
 */ 
ActiveRecord.Adapters.JaxerMySQL = function JaxerMySQL(){
    ActiveSupport.extend(this,ActiveRecord.Adapters.InstanceMethods);
    ActiveSupport.extend(this,ActiveRecord.Adapters.MySQL);
    ActiveSupport.extend(this,{
        log: function log()
        {
            if (!ActiveRecord.logging)
            {
                return;
            }
            if (arguments[0])
            {
                arguments[0] = 'ActiveRecord: ' + arguments[0];
            }
            return ActiveSupport.log.apply(ActiveSupport,arguments || []);
        },
        executeSQL: function executeSQL(sql)
        {
            ActiveRecord.connection.log("Adapters.JaxerMySQL.executeSQL: " + sql + " [" + ActiveSupport.arrayFrom(arguments).slice(1).join(',') + "]");
            var response = Jaxer.DB.execute.apply(Jaxer.DB.connection, arguments);
            return response;
        },
        getLastInsertedRowId: function getLastInsertedRowId()
        {
            return Jaxer.DB.lastInsertId;
        },
        iterableFromResultSet: function iterableFromResultSet(result)
        {
            result.iterate = function iterate(iterator)
            {
                if (typeof(iterator) === 'number')
                {
                    if (this.rows[iterator])
                    {
                        return ActiveSupport.clone(this.rows[iterator]);
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    for(var i = 0; i < this.rows.length; ++i)
                    {
                        var row = ActiveSupport.clone(this.rows[i]);
                        delete row['$values'];
                        iterator(row);
                    }
                }
            };
            return result;
        },
        transaction: function transaction(proceed)
        {
            try
            {
                ActiveRecord.connection.executeSQL('BEGIN');
                proceed();
                ActiveRecord.connection.executeSQL('COMMIT');
            }
            catch(e)
            {
                ActiveRecord.connection.executeSQL('ROLLBACK');
                return ActiveSupport.throwError(e);
            }
        }
    });
};

ActiveRecord.Adapters.JaxerMySQL.connect = function connect(options)
{
    if(!options)
    {
        options = {};
    }
    for(var key in options)
    {
        options[key.toUpperCase()] = options[key];
    }
    Jaxer.DB.connection = new Jaxer.DB.MySQL.Connection(ActiveSupport.extend({
        HOST: 'localhost',
        PORT: 3306,
        USER: 'root',
        PASS: '',
        NAME: 'jaxer'
    },options));
    return new ActiveRecord.Adapters.JaxerMySQL();
};

})();

var ActiveView = null;

(function(){

ActiveView = {};

ActiveView.logging = false;

ActiveView.create = function create(structure,methods)
{
    if(typeof(options) === 'function')
    {
        options = {
            structure: options
        };
    }
    var klass = function klass(){
        this.initialize.apply(this,arguments);
    };
    ActiveSupport.extend(klass,ClassMethods);
    ActiveSupport.extend(klass.prototype,methods || {});
    ActiveSupport.extend(klass.prototype,InstanceMethods);
    klass.prototype.structure = structure || ActiveView.defaultStructure;
    ActiveEvent.extend(klass);
    return klass;
};

ActiveView.defaultStructure = function defaultStructure()
{
    return ActiveView.Builder.div();
};

ActiveView.makeArrayObservable = function makeArrayObservable(array)
{
    ActiveEvent.extend(array);
    array.makeObservable('shift');
    array.makeObservable('unshift');
    array.makeObservable('pop');
    array.makeObservable('push');
    array.makeObservable('splice');
};

/**
 * This method is not usually called directly but is utilized by data
 * bindings and ActiveControllers.
 * 
 * This method is normalizes or renders a variety of inputs. Strings or
 * Element objects are returned untouched, ActiveView instances will have
 * their DOM container returned, ActiveView classes will be rendered and
 * the DOM container returned. If a function is passed in it will be called
 * with the passed scope. That function should return a string or Element.
 * 
 * @alias ActiveView.render
 * @param {mixed} content
 * @param {Object} [scope]
 * @return {mixed}
 */
ActiveView.render = function render(content,scope)
{
    if(!scope)
    {
        scope = {};
    }
    
    //if content is a function, that function can return nodes or an ActiveView class or instance
    if(typeof(content) === 'function' && !content.prototype.structure)
    {
        content = content(scope);
    }
    
    if(content && (typeof(content) == 'string' || content.nodeType == 1))
    {
        return content;
    }
    else if(content && content.container && content.container.nodeType == 1)
    {
        //is ActiveView instance
        return content.container;
    }
    else if(content && content.prototype && content.prototype.structure)
    {
        //is ActiveView class
        return new content(scope).container;
    }
    return ActiveSupport.throwError(Errors.InvalidContent);
};

var InstanceMethods = {
    initialize: function initialize(scope,parent)
    {
        this.parent = parent;
        this.setupScope(scope);
        if(ActiveView.logging)
        {
            ActiveSupport.log('ActiveView: initialized with scope:',scope);
        }
        this.builder = ActiveView.Builder;
        ActiveView.generateBinding(this);
        this.container = this.structure();
        if(!this.container || !this.container.nodeType || this.container.nodeType !== 1)
        {
            return ActiveSupport.throwError(Errors.ViewDoesNotReturnContainer,typeof(this.container),this.container);
        }
        for(var key in this.scope._object)
        {
            this.scope.set(key,this.scope._object[key]);
        }
    },
    setupScope: function setupScope(scope)
    {
        this.scope = (scope ? (scope.toObject ? scope : new ActiveEvent.ObservableHash(scope)) : new ActiveEvent.ObservableHash({}));
        for(var key in this.scope._object)
        {
            var item = this.scope._object[key];
            if((item !== null && typeof item === "object" && 'splice' in item && 'join' in item) && !item.observe)
            {
                ActiveView.makeArrayObservable(item);
            }
        }
    },
    get: function get(key)
    {
        return this.scope.get(key);
    },
    set: function set(key,value)
    {
        if((value !== null && typeof value === "object" && 'splice' in value && 'join' in value) && !value.observe)
        {
            ActiveView.makeArrayObservable(value);
        }
        return this.scope.set(key,value);
    },
    registerEventHandler: function registerEventHandler(element,event_name,observer)
    {
      this.eventHandlers.push([element,event_name,observer]);
    }
};

var ClassMethods = {

};

var Errors = {
    ViewDoesNotReturnContainer: ActiveSupport.createError('The view constructor must return a DOM element. Returned: '),
    InvalidContent: ActiveSupport.createError('The content to render was not a string, DOM element or ActiveView.'),
    MismatchedArguments: ActiveSupport.createError('Incorrect argument type passed: ')
};

var Builder = {
    createElement: function createElement(tag,attributes)
    {
        var global_context = ActiveSupport.getGlobalContext();
        var ie = !!(global_context.attachEvent && !global_context.opera);
        attributes = attributes || {};
        tag = tag.toLowerCase();
        if(ie && attributes.name)
        {
            tag = '<' + tag + ' name="' + attributes.name + '">';
            delete attributes.name;
        }
        var element = Builder.extendCreatedElement(global_context.document.createElement(tag));
        Builder.writeAttribute(element,attributes);
        return element;
    },
    extendCreatedElement: function extendCreatedElement(element)
    {
        return element;
    },
    writeAttribute: function writeAttribute(element,name,value)
    {
        var transitions = {
            className: 'class',
            htmlFor:   'for'
        };
        var attributes = {};
        if(typeof name === 'object')
        {
            attributes = name;
        }
        else
        {
            attributes[name] = typeof(value) === 'undefined' ? true : value;
        }
        for(var attribute_name in attributes)
        {
            name = transitions[attribute_name] || attribute_name;
            value = attributes[attribute_name];
            if(value === false || value === null)
            {
                element.removeAttribute(name);
            }
            else if(value === true)
            {
                element.setAttribute(name,name);
            }
            else
            {
                element.setAttribute(name,value);
            }
        }
        return element;
    },
    addMethods: function addMethods(methods)
    {
        ActiveSupport.extend(Builder,methods || {});
    }
};

(function builder_generator(){
    var tags = ("A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY " +
        "BR BUTTON CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM FIELDSET " +
        "FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX "+
        "KBD LABEL LEGEND LI LINK MAP MENU META NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P "+
        "PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD "+
        "TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR").split(/\s+/);
    var global_context = ActiveSupport.getGlobalContext();
    for(var t = 0; t < tags.length; ++t)
    {
        var tag = tags[t];
        (function tag_iterator(tag){
            Builder[tag.toLowerCase()] = Builder[tag] = function tag_generator(){
                var i, argument, attributes, text_nodes, elements, element;
                text_nodes = [];
                elements = [];
                for(i = 0; i < arguments.length; ++i)
                {
                    argument = arguments[i];
                    if(typeof(argument) === 'undefined' || argument === null || argument === false)
                    {
                        continue;
                    }
                    if(typeof(argument) === 'function')
                    {
                        argument = argument();
                    }
                    if(typeof(argument) !== 'string' && typeof(argument) !== 'number' && !(argument !== null && typeof argument === "object" && 'splice' in argument && 'join' in argument) && !(argument && argument.nodeType === 1))
                    {
                        attributes = argument;
                    }
                    else if(argument !== null && typeof argument === "object" && 'splice' in argument && 'join' in argument)
                    {
                        elements = argument;
                    }
                    else if((argument && argument.nodeType === 1) || typeof(argument) === 'string' || typeof(argument) === 'number')
                    {
                        elements.push(argument);
                    }
                }
                element = Builder.createElement(tag,attributes);
                for(i = 0; i < elements.length; ++i)
                {
                    element.appendChild((elements[i] && elements[i].nodeType === 1) ? elements[i] : global_context.document.createTextNode((new String(elements[i])).toString()));
                }
                return element;
            };
        })(tag);
    }
})();

ActiveView.Builder = Builder;

ActiveView.generateBinding = function generateBinding(instance)
{
    instance.binding = {};
    instance.binding.update = function update(element)
    {
        if(!element || !element.nodeType === 1)
        {
            return ActiveSupport.throwError(Errors.MismatchedArguments,'expected Element, recieved ',typeof(element),element);
        }
        return {
            from: function from(observe_key)
            {
                var object = instance.scope;
                if(arguments.length === 2)
                {
                    object = arguments[1];
                    observe_key = arguments[2];
                }
                
                var transformation = null;
                var condition = function default_condition(){
                    return true;
                };
                
                var transform = function transform(callback)
                {
                    if(!callback || typeof(callback) !== 'function')
                    {
                        return ActiveSupport.throwError(Errors.MismatchedArguments,'expected Function, recieved ',typeof(callback),callback);
                    }
                    transformation = callback;
                    return {
                        when: when
                    };
                };

                var when = function when(callback)
                {
                    if(!callback || typeof(callback) !== 'function')
                    {
                        return ActiveSupport.throwError(Errors.MismatchedArguments,'expected Function, recieved ',typeof(callback),callback);
                    }
                    condition = callback;
                    return {
                        transform: transform
                    };
                };

                object.observe('set',function update_from_observer(set_key,value){
                    if(observe_key == set_key)
                    {
                        if(condition())
                        {
                            element.innerHTML = transformation ? transformation(value) : value;
                        }
                    }
                });
                
                return {
                    transform: transform,
                    when: when
                };
            }
        };
    };

    instance.binding.collect = function collect(view)
    {
        if(!view)
        {
            return ActiveSupport.throwError(Errors.MismatchedArguments,'expected string, ActiveView class or function, recieved ',typeof(view),view);
        }
        return {
            from: function from(collection)
            {
                if(!collection || (typeof(collection) !== 'object' && typeof(collection) !== 'string'))
                {
                    return ActiveSupport.throwError(Errors.MismatchedArguments,'expected array, recieved ',typeof(collection),collection);
                }
                return {
                    into: function into(element)
                    {
                        if(!element || !element.nodeType === 1)
                        {
                            return ActiveSupport.throwError(Errors.MismatchedArguments,'expected Element, recieved ',typeof(element),element);
                        }
                        //if a string is passed make sure that the view is re-built when the key is set
                        if(typeof(collection) === 'string')
                        {
                            var collection_name = collection;
                            instance.scope.observe('set',function collection_key_change_observer(key,value){
                                if(key == collection_name)
                                {
                                    element.innerHTML = '';
                                    instance.binding.collect(view).from(value).into(element);
                                }
                            });
                        }
                        else
                        {
                            //loop over the collection when it is passed in to build the view the first time
                            var collected_elements = [];
                            for(var i = 0; i < collection.length; ++i)
                            {
                                var generated_element = ActiveView.render(view,collection[i]);
                                element.appendChild(generated_element);
                                collected_elements.push(element.childNodes[element.childNodes.length - 1]);
                            }
                            //these handlers will add or remove elements from the view as the collection changes
                            if(collection.observe)
                            {
                                collection.observe('pop',function pop_observer(){
                                    collected_elements[collected_elements.length - 1].parentNode.removeChild(collected_elements[collected_elements.length - 1]);
                                    collected_elements.pop();
                                });
                                collection.observe('push',function push_observer(item){
                                    var generated_element = ActiveView.render(view,item);
                                    element.appendChild(generated_element);
                                    collected_elements.push(element.childNodes[element.childNodes.length - 1]);
                                });
                                collection.observe('unshift',function unshift_observer(item){
                                    var generated_element = ActiveView.render(view,item);
                                    element.insertBefore(generated_element,element.firstChild);
                                    collected_elements.unshift(element.firstChild);
                                });
                                collection.observe('shift',function shift_observer(){
                                    element.removeChild(element.firstChild);
                                    collected_elements.shift(element.firstChild);
                                });
                                collection.observe('splice',function splice_observer(index,to_remove){
                                    var children = [];
                                    var i;
                                    for(i = 2; i < arguments.length; ++i)
                                    {
                                        children.push(arguments[i]);
                                    }
                                    if(to_remove)
                                    {
                                        for(i = index; i < (index + to_remove); ++i)
                                        {
                                            collected_elements[i].parentNode.removeChild(collected_elements[i]);
                                        }
                                    }
                                    for(i = 0; i < children.length; ++i)
                                    {
                                        var generated_element = ActiveView.render(view,children[i]);
                                        element.insertBefore((typeof(generated_element) === 'string'
                                            ? document.createTextNode(generated_element)
                                            : generated_element
                                        ),element.childNodes[index + i]);
                                        children[i] = element.childNodes[index + i];
                                    }
                                    collected_elements.splice.apply(collected_elements,[index,to_remove].concat(children));
                                });
                            }
                        }
                    }
                };
            }
        };
    };

    instance.binding.when = function when(outer_key)
    {
        var outer_keys;
        if(arguments.length > 1)
        {
            outer_keys = ActiveSupport.arrayFrom(arguments);
        }
        else if(ActiveSupport.isArray(outer_key))
        {
            outer_keys = outer_key;
        }
        else
        {
            outer_keys = [outer_key];
        }
        return {
            changes: function changes(callback)
            {
                if(!callback || typeof(callback) !== 'function')
                {
                    return ActiveSupport.throwError(Errors.MismatchedArguments,'expected Function, recieved ',typeof(callback),callback);
                }
                instance.scope.observe('set',function changes_observer(inner_key,value){
                    for(var i = 0; i < outer_keys.length; ++i)
                    {
                        if(outer_keys[i] == inner_key)
                        {
                            callback(value);
                        }
                    }
                });
            }
        };
    };
};

ActiveView.Template = {
    create: function create(src,helpers)
    {
        var klass = function klass(){};
        klass.helpers = {};
        ActiveSupport.extend(klass.helpers,helpers || {});
        ActiveSupport.extend(klass.helpers,ActiveView.Template.Helpers);
        ActiveSupport.extend(klass,ActiveView.Template.ClassMethods);
        klass.template = ActiveView.Template.generateTemplate(src);
        return klass;
    }
};

ActiveView.Template.generateTemplate = function generateTemplate(source)
{
    try
    {
        // Original Implementation: Simple JavaScript Templating
        // John Resig - http://ejohn.org/ - MIT Licensed
        var processed_source = source
            .replace(/<%([^\=](.+?))\)(\s*)%>/g,'<%$1);$3%>') //fix missing semi-colons
            .replace(/[\r\t\n]/g, " ")
            .replace(/'(?=[^%]*%>)/g,"\t")
            .split("'").join("\\'")
            .split("\t").join("'")
            .replace(/<%=(.+?)%>/g, "',$1,'")
            .split("<%").join("');")
            .split("%>").join("p.push('")
        ;        
        return new Function("data",[
            "var p = [];",
            "var print = function(){p.push.apply(p,arguments);};",
            "with(this.helpers){with(data){p.push('",
            processed_source,
            "');}}",
            "return p.join('');"
        ].join(''));
    }
    catch(e)
    {
        ActiveSupport.throwError(ActiveView.Template.Errors.CompilationFailed,'input:',source,'processed:',processed_source,e);
    }
};

ActiveView.Template.Errors = {
    CompilationFailed: ActiveSupport.createError('The template could not be compiled:')
};

ActiveView.Template.ClassMethods = {
    render: function render(data)
    {
        return ActiveSupport.bind(this.template,this)(data);
    }
};

ActiveView.Template.Helpers = {};

})();

var ActiveController = null;

(function(){

ActiveController = {};

ActiveController.logging = false;

ActiveController.create = function create(actions,methods)
{
    var klass = function klass(container,parent,params){
        this.container = container;
        this.setRenderTarget(this.container);
        this.parent = parent;
        this.children = [];
        this.params = params || {};
        this.scope = new ActiveEvent.ObservableHash({});
        this.initialize();
    };
    ActiveSupport.extend(klass,ClassMethods);
    for(var action_name in actions || {})
    {
        if(typeof(actions[action_name]) == 'function')
        {
            ActiveController.createAction(klass,action_name,actions[action_name]);
        }
        else
        {
            //plain old property
            klass.prototype[action_name] = actions[action_name];
        }
    }
    ActiveSupport.extend(klass.prototype,InstanceMethods);
    ActiveSupport.extend(klass.prototype,methods || {});
    ActiveEvent.extend(klass);
    return klass;
};

ActiveController.createDefaultContainer = function createDefaultContainer()
{
    var global_context = ActiveSupport.getGlobalContext();
    var div = ActiveView.Builder.div();
    if(!global_context.document.body)
    {
        return ActiveSupport.throwError(Errors.BodyNotAvailable);
    }
    global_context.document.body.appendChild(div);
    return div;
};

ActiveController.createAction = function createAction(klass,action_name,action)
{
    klass.prototype[action_name] = function action_wrapper(){
        this.notify('beforeCall',action_name,this.params);
        this.renderLayout();
        ActiveSupport.bind(action,this)();
        this.notify('afterCall',action_name,this.params);
    };
};

var InstanceMethods = {
    initialize: function initialize()
    {
        
    },
    get: function get(key)
    {
        return this.scope.get(key);
    },
    set: function set(key,value)
    {
        return this.scope.set(key,value);
    },
    render: function render(params)
    {
        if(typeof(params) !== 'object')
        {
            return ActiveSupport.throwError(Errors.InvalidRenderParams);
        }
        for(var flag_name in params || {})
        {
            if(!RenderFlags[flag_name])
            {
                if(ActiveController.logging)
                {
                    ActiveSupport.log('ActiveController: render() failed with params:',params);
                }
                return ActiveSupport.throwError(Errors.UnknownRenderFlag,flag_name);
            }
            ActiveSupport.bind(RenderFlags[flag_name],this)(params[flag_name],params);
        }
        return params;
    },
    getRenderTarget: function getRenderTarget()
    {
        return this.renderTarget;
    },
    setRenderTarget: function setRenderTarget(target)
    {
        this.renderTarget = target;
    },
    renderLayout: function renderLayout()
    {
        if(this.layout && !this.layoutRendered && typeof(this.layout) == 'function')
        {
            this.layoutRendered = true;
            this.container.innerHtml = '';
            this.container.appendChild(this.layout.bind(this)());
        }
    }
};
ActiveController.InstanceMethods = InstanceMethods;

var RenderFlags = {
    view: function view(view_class,params)
    {
        if(typeof(view_class) === 'string')
        {
            var klass = ActiveSupport.getClass(view_class);
            if(!klass)
            {
                return ActiveSupport.throwError(Errors.ViewDoesNotExist,view_class);
            }
        }
        else
        {
            klass = view_class;
        }
        var response = ActiveView.render(klass,params.scope || this.scope);
        var container = params.target || this.getRenderTarget();
        if(container)
        {
            container.innerHTML = '';
            container.appendChild(response);
        }
    },
    text: function text(text,params)
    {
        var container = params.target || this.getRenderTarget();
        if(container)
        {
            container.innerHTML = text;
        }
    },
    target: function target(target,params)
    {
        //target only available for text + view, needs no processing
    },
    scope: function scope(scope,params)
    {
        //scope only available for text + view, needs no processing
    }
};
ActiveController.RenderFlags = RenderFlags;

var ClassMethods = {
    createAction: function wrapAction(action_name,action)
    {
        return ActiveController.createAction(this,action_name,action);
    }
};
ActiveController.ClassMethods = ClassMethods;

var Errors = {
    BodyNotAvailable: ActiveSupport.createError('Controller could not attach to a DOM element, no container was passed and document.body is not available'),
    InvalidRenderParams: ActiveSupport.createError('The parameter passed to render() was not an object.'),
    UnknownRenderFlag: ActiveSupport.createError('The following render flag does not exist: '),
    ViewDoesNotExist: ActiveSupport.createError('The specified view does not exist: ')
};
ActiveController.Errors = Errors;

})();

ActiveController.Errors.FileDoesNotExist = 'Could not find the file to render: ';

ActiveController.Server = {};

ActiveController.Server.Response = {
    setStatus: function setStatus(status_code,reason_phrase){},
    setContents: function setContents(contents){},
    setHeader: function addHeader(key,value){},
    getHeader: function getHeader(key,value){},
    removeHeader: function removeHeader(key){},
    redirect: function redirect(url,status_code,reason_phrase){}
};

ActiveController.Server.Request = {
    getData: function getData(){},
    getQuery: function getQuery(){},
    getMethod: function getMethod(){},
    getURI: function getURI(){},
    getExtension: function getExtension(){}
};

ActiveController.Server.IO = {
    exists: function exists(path){},
    load: function load(path){},
    read: function read(path){},
    grep: function grep(path,pattern,recursive){}
};

ActiveController.Server.Environment = {
    isProduction: function isProduction(){},
    getApplicationRoot: function getApplicationRoot(){}
};

ActiveController.Server.parseParams = function parseParams(params)
{
    var result = {};
    
    for (var p in params)
    {
        // convert format for easier splitting
        var dotted_name = p.replace(/\[[^\]]+\]/g, function(a) { return "." + a.substring(1, a.length - 1)});
        
        // split into steps
        var parts = dotted_name.split(".");
        
        if (parts.length == 1)
        {
            // no index, so use the property value directly
            result[p] = params[p];
        }
        else
        {
            // we have indexes, so process each step
            var current_object = result;
            var next_part = parts[0];
            
            for (var i = 1; i < parts.length; i++)
            {
                // update current part that we're processing now
                var current_part = next_part;
                
                // look ahead to next part - needed to determine the type of composite to use for current_part
                next_part = parts[i];
                
                if (current_object.hasOwnProperty(current_part) == false)
                {
                    if (next_part.match(/^(?:[0-9]|[1-9][0-9]+)$/))
                    {
                        // process as array
                        current_object[current_part] = [];
                    }
                    else
                    {
                        // process as object
                        current_object[current_part] = {};
                    }
                }
                // NOTE: may want else-clause to verify we don't have
                // conflicting index types (name and number on same object)
                
                // update the current object based on the current part
                current_object = current_object[current_part];
            }
            
            // assign value onto current object using last part
            current_object[parts[parts.length - 1]] = params[p];
        }
    }
    return result;
};

ActiveController.Server.StatusCodes = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",

    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    226: "IM Used",
    
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    426: "Upgrade Required",
    
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    507: "Insufficient Storage",
    510: "Not Extended"
};

ActiveSupport.extend(ActiveController.InstanceMethods,{
    head: function head(status)
    {
        this.render({
            nothing: true,
            status: status || 200
        });
    }
});

ActiveSupport.extend(ActiveController.RenderFlags,{
    text: function text(text,params)
    {
        ActiveController.Server.Response.setHeader('Content-Type','text/plain')
        ActiveController.Server.Response.setContents(text);
    },
    json: function json(json,params)
    {
        if(typeof(json) != 'string')
        {
            json = (typeof(json.toJSON) == 'function' ? json.toJSON() : JSON.stringify(json));
        }
        ActiveController.Server.Response.setHeader('Content-Type','application/json');
        ActiveController.Server.Response.setContents(json);
    },
    xml: function xml(xml,params)
    {
        if(typeof(xml) == 'xml')
        {
            xml = xml.toString();
        }
        if(xml && typeof(xml.toXML) == 'function')
        {
            xml = xml.toXML();
        }
        ActiveController.Server.Response.setHeader('Content-Type','text/xml');
        ActiveController.Server.Response.setContents(xml);
    },
    html: function html(html,params)
    {
        ActiveController.Server.Response.setHeader('Content-Type','text/html');
        this.set('content',html);
        this.applyLayout();
        ActiveController.Server.Response.setContents(this.get('content'));
    },
    file: function file(file,params)
    {
        ActiveController.Server.Response.setHeader('Content-Type','text/html');
        var file = ActiveController.Server.Environment.getApplicationRoot() + '/views/' + file;
        if(!ActiveController.Server.IO.exists(file))
        {
            ActiveSupport.throwError(ActiveController.Errors.FileDoesNotExist,file);
        }
        var content = ActiveView.Template.create(ActiveController.Server.IO.read(file)).render(this.scope._object);
        this.set('content',content);
        this.applyLayout();
        ActiveController.Server.Response.setContents(this.get('content'));
    },    
    nothing: function nothing(nothing,params)
    {
        ActiveController.Server.Response.setContents('');
    },
    status: function status(status,params)
    {
        if(typeof(status) == 'string')
        {
            for(var status_code in ActiveController.Server.StatusCodes)
            {
                if(ActiveController.Server.StatusCodes[status_code] == status || ActiveSupport.underscore(ActiveController.Server.StatusCodes[status_code].replace(/\-/g,' ')).toLowerCase() == status)
                {
                    ActiveController.Server.Response.setStatus(status_code,ActiveController.Server.StatusCodes[status_code]);
                    break;
                }
            }
        }
        else
        {
            ActiveController.Server.Response.setStatus(status,ActiveController.Server.StatusCodes[status_code]);
        }
    }
});

ActiveView.Template.Helpers.render = function render(params,scope)
{
    var file = ActiveController.Server.Environment.getApplicationRoot() + '/views/' + params.partial;
    if(!ActiveController.Server.IO.exists(file))
    {
        ActiveSupport.throwError(ActiveController.Errors.FileDoesNotExist,file);
    }
    return ActiveView.Template.create(ActiveController.Server.IO.read(file)).render(scope || {});
};

ActiveController.InstanceMethods.applyLayout = function applyLayout()
{
    if(this.layout && !this.layoutRendered && this.layout.file)
    {
        var layout_file = Jaxer.request.app.configPath + '/app/views/' + this.layout.file;
        if(!ActiveController.Server.IO.exists(layout_file))
        {
            ActiveController.Errors.FileDoesNotExist + layout_file;
        }
        this.layoutRendered = true;
        this.set('content',ActiveView.Template.create(ActiveController.Server.IO.read(layout_file)).render(this.scope._object));
    }
};
 
ActiveController.Server.Response = {
    setStatus: function setStatus(status_code,reason_phrase)
    {
        Jaxer.response.statusCode = status_code;
        if(reason_phrase)
        {
            Jaxer.response.reasonPhrase = reason_phrase;
        }
    },
    setContents: function setContents(contents)
    {
        Jaxer.response.setContents(contents);
    },
    setHeader: function addHeader(key,value)
    {
        Jaxer.response.headers[key] = value;
    },
    getHeader: function getHeader(key,value)
    {
        return Jaxer.response.headers[key];
    },
    removeHeader: function removeHeader(key)
    {
        Jaxer.response.headers[key];
    },
    redirect: function redirect(url,status_code,reason_phrase)
    {
        if(status_code)
        {
            Jaxer.response.setStatus(status_code,reason_phrase);
        }
        Jaxer.response.redirect(url);
        Jaxer.response.exit();
    }
};

ActiveController.Server.Request = {
    getData: function getData()
    {
        return Jaxer.request.data;
    },
    getQuery: function getQuery()
    {
        return Jaxer.request.parsedUrl.queryParts;
    },
    getMethod: function getMethod()
    {
        return (Jaxer.request.data._method ? Jaxer.request.data._method : Jaxer.request.action).toLowerCase();
    },
    getURI: function getURI()
    {
        return Jaxer.request.uri;
    },
    getExtension: function getExtension()
    {
		var endIndex = (Jaxer.request.uri.indexOf('?') > -1) ? Jaxer.request.uri.indexOf('?') : Jaxer.request.uri.length;
        return Jaxer.request.uri.substring(0, endIndex).split('.').pop();
        // return (Jaxer.request.uri.split('.').pop() || '').replace(/\?.*$/,'').replace(/\#.*$/,'');
    }
};

ActiveController.Server.IO = {
    exists: function exists(path)
    {
        return Jaxer.File.exists(path);
    },
    load: function load(path)
    {
        return Jaxer.load('file://' + path,null,'server');
    },
    read: function read(path)
    {
        return Jaxer.File.read(path);
    },
    grep: function grep(path,pattern,recursive)
    {
        return Jaxer.Dir.grep(path,{
            pattern: pattern,
            recursive: typeof(recursive) == 'undefined' ? true : recursive
        });
    }
};

ActiveController.Server.Environment = {
    isProduction: function isProduction()
    {
        return Jaxer.Config.DEV_MODE;
    },
    getApplicationRoot: function getApplicationRoot()
    {
        return Application.Config.root + 'app'
    }
};
