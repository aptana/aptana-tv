/**
 * Converts valid urls to links inside of a string
 * 
 * @param {String} string
 * @return {String} the string with links in it
 */
function add_links(string)
{
	return string.replace(/(ftp|http|https|file):\/\/[\S]+(\b|$)/gim,'<a href="$&" target="_blank">$&</a>').replace(/([^\/])(www[\S]+(\b|$))/gim,'$1<a href="http://$2" target="_blank">$2</a>');
}

/**
 * Parses mysql datetime string and returns javascript Date object
 * 
 * @param {String} string has to be in this format: 2007-06-05 15:26:02
 * @return {Date}
 */
function date_from_string(string) {
  var parts = string.replace(/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/,"$1 $2 $3 $4 $5 $6").split(' ');
  return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
}

/**
 * Generates a normalized file name for uploaded files (stripping all spaces, lowercase, etc.)
 * 
 * @param {String} file the file name to normalize
 * @return {String} the normalized file name
 */
function generate_file_name(file)
{
	return strtolower(file).replace(/[^a-zA-Z0-9\._\-]/, '');
}

/**
 * Generates a "slug" from a string.  Used in generating permalink URLs.
 * 
 * @param {String} string The string to "slugify"
 * @return {String} The slug
 */
function generate_slug(string, object)
{
	var slug 	= strtolower(string).replace(/\s/g , '-').replace(/[^a-zA-Z0-9\-\s]/, '');
	var i 		= '';
	var exists 	= true;
	
	while (exists)
	{
		exists = slug_exists(slug + i, (!object) ? 'video' : object);
		
		if(!exists)
		{
			break;
		}
		
		i = (i == '') ? 1 : i++;
	}
	
	return slug + i;
}

/**
 * Returns the number of comments awaiting moderation
 * 
 */
function get_comment_moderation_count()
{
	var sql = 'SELECT COUNT(*) FROM comments WHERE is_active=1 AND approved=0';
	
	return Jaxer.DB.execute(sql).singleResult;
}

/**
 * Returns the appropriate CSS class for a tag
 * 
 * @param {Number} tag_count
 * @param {Number} max_count
 * @return {String} the css class
 */
function get_tag_class(tag_count, max_count)
{
	var percent = Math.floor((tag_count / max_count) * 100);
	var tag_class = 'smallest';
	
	if(percent >= 20 && percent < 40)
	{
		tag_class = 'small';
	}
	else if (percent >= 40 && percent < 60)
	{
		tag_class = 'medium';
	}
	else if (percent >= 60 && percent < 80)
	{
		tag_class = 'large';
	}
	else if (percent >= 80)
	{
		tag_class = 'largest';
	}
	
	return tag_class;
}

/**
 * Gets the thumbnail and link of a video for either a category or learning path
 * 
 * @param {String} entity Either "category" or "learning path"
 * @param {Number} entity_id The id of the entity we need a video for
 * @return {String} the video link and thumb
 */
function get_video_thumb(entity, entity_id)
{
	var entity_sql = 'SELECT videos.* FROM videos';
	var ref_info = '?ref=';
	
	switch(entity)
	{
		case 'learning path':
			entity_sql += ' JOIN learning_path_items ON video_id=videos.id WHERE learning_path_id=' + entity_id + ' AND date_published <= NOW() AND videos.is_active = 1 ORDER BY play_order ASC LIMIT 1';
			ref_info += 'learn&refId=' + entity_id;
			break;
		default:
			entity_sql += ' JOIN categorizations ON video_id=videos.id WHERE category_id=' + entity_id + ' AND date_published <= NOW() AND videos.is_active = 1 ORDER BY RAND() LIMIT 1';
			ref_info += 'topic&refId=' + entity_id;
	}
	
	var video = Video.find(entity_sql);
	
	if(video.length == 0)
	{
		return false;
	}
	
	video = video[0];
	
	var return_html = '<div class="video-thumb-small png-fix">';
	return_html +=	'<a href="' + videoUrl({ slug: video.slug }) + ref_info + '" title="Watch this video"><img src="' + site_info('base') + 'images_videos_thumbs/thumb_small_' + video.image_file  + '" alt="" /></a>';
	return_html +=	'</div>';
	
	return return_html;
}

/**
 * Returns whether or not the current page is the home page
 * 
 * @return {Boolean}
 */
function is_home()
{
	var route = Application.routes.history[Application.routes.history.length - 1];
	
	return route.path == '' ? true : false;
}

/**
 * Returns whether or not the current page is the specified page
 * 
 * @param {String} page_name The name of the page to check for
 * @return {Boolean}
 */
function is_page(page_name)
{
	var web_root = (Application.Config.web_root == '/') ? '' : Application.Config.web_root;
    var page = Jaxer.request.uri.substring(Jaxer.request.uri.indexOf('/' + web_root) + (web_root.length + 1));
	var endIndex = (page.indexOf('?') > -1) ? page.indexOf('?') : page.length;
	
	if(page.substring(0, endIndex).indexOf(page_name) != -1)
	{
		return true;
	}
	
	return false;
}

/**
 * Returns whether or not a user is logged in
 * 
 * @return {Boolean}
 */
function is_logged_in()
{
	if(!('user_id' in Jaxer.session) || Jaxer.session['user_id'] == false)
	{
		return false;
	}
	
	return true;
}

/**
 * Builds breadcrumbs for the learning path pages
 * 
 * @param {String} separator The html to use between breadcrumb items
 * @param {String} The name of the current video
 * @param {String} The slug of the current learning path
 */
function learning_breadcrumbs(separator, video, slug)
{
	var base		= site_info('base');
	var slug		= (!slug) ? Application.routes.history[Application.routes.history.length - 1].params.slug : slug;
	var separator	= (!separator) ? ' &raquo; ' : separator;
	
	// if we've got a slug, build the breadcrumbs
	if(slug)
	{
		var returnHtml = '<a href="' + base + 'learn" title="Learn">Learn</a>' + separator;
		returnHtml += (!video) ? '<strong>' + LearningPath.findBySlug(slug).name + '</strong>' : '<a href="' + learnUrl({ slug: slug }) + '">' + LearningPath.findBySlug(slug).name + '</a>' + separator + '<strong>' + video + '</strong>';

		// if logged in, add the edit link
		returnHtml += (is_logged_in() && !is_page('videos')) ? ' [<a href="' + learningPathEditUrl({ slug: slug }) + '">Edit Learning Path</a>]' : '';
		
		return returnHtml;		
	}
	
	// no slug, just return the current page
	return '<strong>Learn</strong>';
}

/**
 * Returns a formatted date from a date object.
 * 
 * This function exists, so all dates can be standardized across the site.  It is just a wrapper for ActiveSupport.dateFormat,
 * which supports the following flags:
 * 
 * flags = {
 *	    d:    d,
 *	    dd:   pad(d),
 *	    ddd:  dF.i18n.dayNames[D],
 *	    dddd: dF.i18n.dayNames[D + 7],
 *	    m:    m + 1,
 *	    mm:   pad(m + 1),
 *	    mmm:  dF.i18n.monthNames[m],
 *	    mmmm: dF.i18n.monthNames[m + 12],
 *	    yy:   String(y).slice(2),
 *	    yyyy: y,
 *	    h:    H % 12 || 12,
 *	    hh:   pad(H % 12 || 12),
 *	    H:    H,
 *	    HH:   pad(H),
 *	    M:    M,
 *	    MM:   pad(M),
 *	    s:    s,
 *	    ss:   pad(s),
 *	    l:    pad(L, 3),
 *	    L:    pad(L > 99 ? Math.round(L / 10) : L),
 *	    t:    H < 12 ? "a"  : "p",
 *	    tt:   H < 12 ? "am" : "pm",
 *	    T:    H < 12 ? "A"  : "P",
 *	    TT:   H < 12 ? "AM" : "PM",
 *	    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
 *	    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
 *	        ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
 *	};
 *
 * @param {Object} dateObject
 * @return {String} The formatted date
 */
function pretty_date(dateObject, includeTime)
{
	if(typeof(dateObject) == 'string')
	{
		dateObject = date_from_string(dateObject);
	}
	
	if(includeTime)
	{
		return ActiveSupport.dateFormat(dateObject, 'dddd, mmm d, yyyy h:MM tt', true);
	}
	
	return ActiveSupport.dateFormat(dateObject, 'dddd, mmm d, yyyy', true);
}

/**
 * Checks to see if a user is logged in, and if they aren't, redirect them to login
 * 
 * This function also accepts two paramters to allow the user to be redirected to the page 
 * they previously visited if needed.
 * 
 * @param {String} returnController
 * @param {String} returnAction
 */
function require_login(returnController, returnAction)
{
	if(is_logged_in())
	{
		return false;
	}
	
	var c = new LoginController;
    c.params = 
	{
        "returnController": returnController || false,
        "returnAction": returnAction || false
    }
	c.index();
	
	return true;
}

/**
 * Returns a user to the page specified by controller and action
 * 
 * @param {String} controller
 * @param {String} action
 * @param {Object} params
 */
function return_to_page(controller, action, params)
{
	var c = new window[controller]();
	c.params = params || {};
	c[action]();
}

/**
 * Shows the 404 error page
 */
function show_404()
{
	var c = new IndexController;
    c.params = {};
	c.not_found();
}

/**
 * Returns information about the site.
 * 
 * This function is a handy way to get basic info about the site.  It is intended for use
 * within template files.
 * 
 * The following information is currently available:
 *  - base: The base URL of the site including trailing slash (i.e. /path/to/app/)
 *  - css_url: The base URL of the site's css directory, including trailing slash
 *  - js_url: The base URL of site's javascript directory, including trailing slash
 *  
 * You would want to modify these things according to your site's setup if you aren't using 
 * the default path names (such as stylesheets or javascripts)
 * 
 * @param {String} info The information to return
 * @return {String}
 */
function site_info(info)
{
	switch(info)
	{
		// the "web_root" config var
		case 'base':
			return Application.Config.web_root;
			break;
		case 'css_url':
			return Application.Config.web_root + 'stylesheets/';
			break;
		case 'js_url':
			return Application.Config.web_root + 'javascripts/';
			break;
		case 'host':
			return 'http://' + Jaxer.request.env.HTTP_HOST;
			break;
	}
}

/**
 * Finds out if a video slug exists
 * 
 * @param {String} slug
 * @return {Boolean}
 */
function slug_exists(slug, object)
{
	switch(object)
	{
		case 'video':
			return (!Video.findBySlug(slug)) ? false : true;
			break;
		case 'tag':
			return (!Tag.findBySlug(slug)) ? false : true;
			break;
	}
}

/**
 * Returns a comma separated list of tag links for a video
 * 
 * @param {Array} tags
 * @return {String} the list of tags
 */
function tag_list(tags)
{
	var return_html = [];
	
	tags.forEach(function(tag) {
		return_html.push('<a href="' + exploreTagsUrl({ slug: tag.slug }) + '">' + tag.tag + '</a>');
	});
	
	return return_html.join(', ');
}

/**
 * Builds breadcrumbs for the topics pages
 * 
 * @param {String} separator The html to use between breadcrumb items
 */
function topic_breadcrumbs(separator, video, slug)
{
	var base		= site_info('base');
	var slug		= (!slug) ? Application.routes.history[Application.routes.history.length - 1].params.slug : slug;
	var separator	= (!separator) ? ' &raquo; ' : separator;

	// if we've got a slug, build the breadcrumbs	
	if(slug)
	{
		var returnHtml = '<a href="' + base + 'topics" title="Topics">Topics</a>' + separator;
		returnHtml += (!video) ? '<strong>' + Category.findBySlug(slug).name + '</strong>' : '<a href="' + topicUrl({ slug: slug }) + '">' + Category.findBySlug(slug).name + '</a>' + separator + '<strong>' + video + '</strong>'
		
		return returnHtml;
	}
	
	// no slug, just return the current page
	return '<strong>Topics</strong>';
}

/**
 * Returns a comma-separated list of topic links for a video
 * 
 * @param {Array} topics
 * @return {String} the list of topics
 */
function topic_list(topics)
{
	var return_html = [];
	
	topics.forEach(function(topic) {
		return_html.push('<a href="' + topicUrl({ slug: topic.slug }) + '">' + topic.name + '</a>');
	});
	
	return return_html.join(', ');
}

/**
 * Shortens a paragraph to the specified number of words, appending postfix to the end if the
 * paragraph was shortened.
 * 
 * @param {String} string
 * @param {Number} num_words
 * @param {String} postfix
 * @return {String} The truncated string
 */
function truncate_words(string, num_words, postfix)
{
	var string_as_array = string.split(' ');
	var postfix = (string_as_array.length <= num_words) ? '' : postfix || '...';
	
	return string_as_array.splice(0, num_words).join(' ') + postfix;
}

/**
 * Returns the provided user's avatar image HTML
 * 
 * @param {Object} user
 * @return {String} the user's avatar in an img tag
 */
function user_avatar(user)
{
	var return_html = '<img src="' + Application.Config.web_root + 'images_avatars/';
	return_html += (user.avatar_file == '') ? 'default.jpg' : 'thumb_small_' + user.avatar_file;
	return_html += '" alt="' + user.first_name + '" class="avatar" />';
	
	return return_html;
}

/**
 * Updates the tags for a video
 * 
 * @param {String} tags
 * @param {Number} video_id The ID of the video
 */
function update_video_tags(tags, video_id)
{
	// convert the string to an array
	var tags_array = tags.split(',');

	// clean up the current tags (if any)
	ActiveRecord.execute('DELETE FROM video_tags WHERE video_id=' + video_id);
	
	// now, iterate through the tags array, checking to see if they exist, and creating 
	// as necessary.  Then add the tag relationship.
    tags_array.forEach(function(tag) {
		tag = trim(tag);
		
		// check for the tag
		var tagObject = Tag.findByTag(tag);
		
		if(!tagObject)
		{
			var tagObject = Tag.create({ 
				tag: 	tag,
				slug:	generate_slug(tag, 'tag')
			});
		}
		
		// now insert the relationship
		VideoTag.create({
			tag_id: 	tagObject.id, 
			video_id: 	video_id 
		});
    });
}

/* ---------------- PHP to JS FUNCTIONS -------------------- */
/* Just a few handy functions ported from PHP  				 */
/* http://kevin.vanzonneveld.net/techblog/article/phpjs_svn/ */
/* --------------------------------------------------------- */
/* 
 * More info at: http://kevin.vanzonneveld.net/techblog/category/php2js
 * 
 * php.js is copyright 2008 Kevin van Zonneveld.
 * 
 * Portions copyright Ates Goral (http://magnetiq.com), Legaev Andrey,
 * _argos, Jonas Raoni Soares Silva (http://www.jsfromhell.com),
 * Webtoolkit.info (http://www.webtoolkit.info/), Carlos R. L. Rodrigues, Ash
 * Searle (http://hexmen.com/blog/), Tyler Akins (http://rumkin.com), mdsjack
 * (http://www.mdsjack.bo.it), Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), Andrea Giammarchi
 * (http://webreflection.blogspot.com), Bayron Guevara, Cord, David, Karol
 * Kowalski, Leslie Hoare, Lincoln Ramsay, Mick@el, Nick Callen, Peter-Paul
 * Koch (http://www.quirksmode.org/js/beat.html), Philippe Baumann, Steve
 * Clay, booeyOH
 * 
 * Licensed under the MIT (MIT-LICENSE.txt) license.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES 
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Converts an entire string to lowercase
 * 
 * @param {String} str
 * @return {String}
 */
function strtolower(str) {
	return (str + '').toLowerCase();
}

/**
 * Converts newlines to breaks
 * 
 * @param {String} str
 * @param {Boolean} is_xhtml
 * @return Converted string
 */
function nl2br(str, is_xhtml) {
	breakTag = '<br />';
    if (typeof is_xhtml != 'undefined' && !is_xhtml) {
        breakTag = '<br>';
    }
 
    return (str + '').replace(/([^>]?)\n/g, '$1'+ breakTag +'\n');
}

/**
 * Strip whitespace (or other characters) from the beginning and end of a string
 * 
 * Optionally, the stripped characters can also be specified using the charlist parameter. 
 * Simply list all characters that you want to be stripped. With .. you can specify a range of characters. 
 * 
 * @param {String} str
 * @param {String} charlist
 * @return {String} the trimmed string
 */
function trim(str, charlist) {
	var whitespace, l = 0, i = 0;
    str += '';
    
    if (!charlist) {
        // default list
        whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
    } else {
        // preg_quote custom list
        charlist += '';
        whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    }
    
    l = str.length;
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }
    
    l = str.length;
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

/**
 * URL-encodes string
 * 
 * @param {String} str
 * @return {String} the encoded string
 */
function urlencode( str ) {
    var histogram = {}, tmp_arr = [];
    var ret = str.toString();
    
    var replacer = function(search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };
    
    // The histogram is identical to the one in urldecode.
    histogram["'"]   = '%27';
    histogram['(']   = '%28';
    histogram[')']   = '%29';
    histogram['*']   = '%2A';
    histogram['~']   = '%7E';
    histogram['!']   = '%21';
    histogram['%20'] = '+';
    
    // Begin with encodeURIComponent, which most resembles PHP's encoding functions
    ret = encodeURIComponent(ret);
    
    for (search in histogram) {
        replace = histogram[search];
        ret = replacer(search, replace, ret) // Custom replace. No regexing
    }
    
    // Uppercase for full PHP compatibility
    return ret.replace(/(\%([a-z0-9]{2}))/g, function(full, m1, m2) {
        return "%"+m2.toUpperCase();
    });
    
    return ret;
}

/**
 * Decodes URL-encoded string
 * 
 * @param {String} str
 * @return {String} the decoded string
 */
function urldecode( str ) {
    var histogram = {};
    var ret = str.toString();
    
    var replacer = function(search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };
    
    // The histogram is identical to the one in urlencode.
    histogram["'"]   = '%27';
    histogram['(']   = '%28';
    histogram[')']   = '%29';
    histogram['*']   = '%2A';
    histogram['~']   = '%7E';
    histogram['!']   = '%21';
    histogram['%20'] = '+';
	histogram['%25'] = '%';
 
    for (replace in histogram) {
        search = histogram[replace]; // Switch order when decoding
        ret = replacer(search, replace, ret) // Custom replace. No regexing   
    }
    
    // End with decodeURIComponent, which most resembles PHP's encoding functions
    ret = decodeURIComponent(ret);
 
    return ret;
}

/**
 * Strip HTML and PHP tags from a string
 * 
 * This function tries to return a string with all HTML and PHP tags stripped from a given str
 * 
 * @param {String} str
 * @param {String} allowed_tags
 * @return {String} the stripped string
 */
function strip_tags(str, allowed_tags) {
    var key = '', tag = '', allowed = false;
    var matches = allowed_array = [];
 
    var replacer = function(search, replace, str) {
        return str.split(search).join(replace);
    };
 
    // Build allowes tags associative array
    if (allowed_tags) {
        allowed_array = allowed_tags.match(/([a-zA-Z]+)/gi);
    }
  
    str += '';
 
    // Match tags
    matches = str.match(/(<\/?[^>]+>)/gi);
 
    // Go through all HTML tags
    for (key in matches) {
        if (isNaN(key)) {
            // IE7 Hack
            continue;
        }
 
        // Save HTML tag
        html = matches[key].toString();
 
        // Is tag not in allowed list? Remove from str!
        allowed = false;
 
        // Go through all allowed tags
        for (k in allowed_array) {
            // Init
            allowed_tag = allowed_array[k];
            i = -1;
 
            if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
            if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
            if (i != 0) { i = html.toLowerCase().indexOf('</'+allowed_tag)   ;}
 
            // Determine
            if (i == 0) {
                allowed = true;
                break;
            }
        }
 
        if (!allowed) {
            str = replacer(html, "", str); // Custom replace. No regexing
        }
    }
 
    return str;
}

/**
 * Convert all applicable characters to HTML entities
 * 
 * Available quote_style constants: * 
 *  -ENT_COMPAT		Will convert double-quotes and leave single-quotes alone.
 *  -ENT_QUOTES		Will convert both double and single quotes.
 *  -ENT_NOQUOTES	Will leave both double and single quotes unconverted. 
 * 
 * @param {String} string The input string. 
 * @param {String} quote_style Lets you define what will be done with 'single' and "double" quotes. It takes on one of three constants with the default being ENT_COMPAT
 * @return {String}
 */
function htmlentities (string, quote_style) {
    var histogram = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (histogram = get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }
    
    for (symbol in histogram) {
        entity = histogram[symbol];
        tmp_str = tmp_str.split(symbol).join(entity);
    }
    
    return tmp_str;
}

/**
 * Returns the translation table used by htmlspecialchars() and htmlentities()
 * 
 * There are two new constants (HTML_ENTITIES, HTML_SPECIALCHARS) that allow you to specify the table you want. Default value for table is HTML_SPECIALCHARS. 
 * 
 * Like the htmlspecialchars() and htmlentities() functions you can optionally specify the quote_style you are working with. The default is ENT_COMPAT mode. 
 * See the description of these modes in htmlspecialchars(). 
 * 
 * @param {String} table
 * @param {String} quote_style
 * @return {String}
 */
function get_html_translation_table(table, quote_style) {
    var entities = {}, histogram = {}, decimal = 0, symbol = '';
    var constMappingTable = {}, constMappingQuoteStyle = {};
    var useTable = {}, useQuoteStyle = {};
    
    useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
    useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
    
    // Translate arguments
    constMappingTable[0]      = 'HTML_SPECIALCHARS';
    constMappingTable[1]      = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';
    
    // Map numbers to strings for compatibilty with PHP constants
    if (!isNaN(useTable)) {
        useTable = constMappingTable[useTable];
    }
    if (!isNaN(useQuoteStyle)) {
        useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];
    }
    
    if (useQuoteStyle != 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
 
    if (useQuoteStyle == 'ENT_QUOTES') {
        entities['39'] = '&#039;';
    }
 
    if (useTable == 'HTML_SPECIALCHARS') {
        // ascii decimals for better compatibility
        entities['38'] = '&amp;';
        entities['60'] = '&lt;';
        entities['62'] = '&gt;';
    } else if (useTable == 'HTML_ENTITIES') {
        // ascii decimals for better compatibility
      entities['38']  = '&amp;';
      entities['60']  = '&lt;';
      entities['62']  = '&gt;';
      entities['160'] = '&nbsp;';
      entities['161'] = '&iexcl;';
      entities['162'] = '&cent;';
      entities['163'] = '&pound;';
      entities['164'] = '&curren;';
      entities['165'] = '&yen;';
      entities['166'] = '&brvbar;';
      entities['167'] = '&sect;';
      entities['168'] = '&uml;';
      entities['169'] = '&copy;';
      entities['170'] = '&ordf;';
      entities['171'] = '&laquo;';
      entities['172'] = '&not;';
      entities['173'] = '&shy;';
      entities['174'] = '&reg;';
      entities['175'] = '&macr;';
      entities['176'] = '&deg;';
      entities['177'] = '&plusmn;';
      entities['178'] = '&sup2;';
      entities['179'] = '&sup3;';
      entities['180'] = '&acute;';
      entities['181'] = '&micro;';
      entities['182'] = '&para;';
      entities['183'] = '&middot;';
      entities['184'] = '&cedil;';
      entities['185'] = '&sup1;';
      entities['186'] = '&ordm;';
      entities['187'] = '&raquo;';
      entities['188'] = '&frac14;';
      entities['189'] = '&frac12;';
      entities['190'] = '&frac34;';
      entities['191'] = '&iquest;';
      entities['192'] = '&Agrave;';
      entities['193'] = '&Aacute;';
      entities['194'] = '&Acirc;';
      entities['195'] = '&Atilde;';
      entities['196'] = '&Auml;';
      entities['197'] = '&Aring;';
      entities['198'] = '&AElig;';
      entities['199'] = '&Ccedil;';
      entities['200'] = '&Egrave;';
      entities['201'] = '&Eacute;';
      entities['202'] = '&Ecirc;';
      entities['203'] = '&Euml;';
      entities['204'] = '&Igrave;';
      entities['205'] = '&Iacute;';
      entities['206'] = '&Icirc;';
      entities['207'] = '&Iuml;';
      entities['208'] = '&ETH;';
      entities['209'] = '&Ntilde;';
      entities['210'] = '&Ograve;';
      entities['211'] = '&Oacute;';
      entities['212'] = '&Ocirc;';
      entities['213'] = '&Otilde;';
      entities['214'] = '&Ouml;';
      entities['215'] = '&times;';
      entities['216'] = '&Oslash;';
      entities['217'] = '&Ugrave;';
      entities['218'] = '&Uacute;';
      entities['219'] = '&Ucirc;';
      entities['220'] = '&Uuml;';
      entities['221'] = '&Yacute;';
      entities['222'] = '&THORN;';
      entities['223'] = '&szlig;';
      entities['224'] = '&agrave;';
      entities['225'] = '&aacute;';
      entities['226'] = '&acirc;';
      entities['227'] = '&atilde;';
      entities['228'] = '&auml;';
      entities['229'] = '&aring;';
      entities['230'] = '&aelig;';
      entities['231'] = '&ccedil;';
      entities['232'] = '&egrave;';
      entities['233'] = '&eacute;';
      entities['234'] = '&ecirc;';
      entities['235'] = '&euml;';
      entities['236'] = '&igrave;';
      entities['237'] = '&iacute;';
      entities['238'] = '&icirc;';
      entities['239'] = '&iuml;';
      entities['240'] = '&eth;';
      entities['241'] = '&ntilde;';
      entities['242'] = '&ograve;';
      entities['243'] = '&oacute;';
      entities['244'] = '&ocirc;';
      entities['245'] = '&otilde;';
      entities['246'] = '&ouml;';
      entities['247'] = '&divide;';
      entities['248'] = '&oslash;';
      entities['249'] = '&ugrave;';
      entities['250'] = '&uacute;';
      entities['251'] = '&ucirc;';
      entities['252'] = '&uuml;';
      entities['253'] = '&yacute;';
      entities['254'] = '&thorn;';
      entities['255'] = '&yuml;';
    } else {
        throw Error("Table: "+useTable+' not supported');
        return false;
    }
    
    // ascii decimals to real symbols
    for (decimal in entities) {
        symbol = String.fromCharCode(decimal)
        histogram[symbol] = entities[decimal];
    }
    
    return histogram;
}