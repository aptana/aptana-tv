OembedController = ActiveController.create({
	/**
	 * Controller for the Oembed API
	 */
	index: function index()
	{
		// get the request extension (JSON / XML)
		var extension = (ActiveController.Server.Request.getExtension() == '') ? 'json' : ActiveController.Server.Request.getExtension();
		
		// see if the requested video exists
		var slug = urldecode(this.params.url).replace('http://' + Jaxer.request.env.HTTP_HOST + site_info('base') + 'videos/', '');
		var video = Video.findBySlug(slug);
		
		// no video, send a 404
		if(!video)
		{
			this.render({
				status: 404
			});
			
			return;
		}
		
		var oembed = this.getOembedData(video);
		
		// render the XML
		if(extension == 'xml')
		{
			this.set('oembed', oembed);
			this.set('url', slug);
			
			this.render({
				file: 'oembed/oembed.xml',
				status: 200
			});
			
			ActiveController.Server.Response.setHeader('Content-Type','application/xml');
			
			return;
		}
		
		// render the JSON
		this.render({
			json: oembed,
			status: 200
		});
	}
}, {
	/**
	 * Loads related videos for the provided video
	 *
	 * This function first checks for related videos by tag, and if none are found,
	 * then loads other videos from the video's category
	 *
	 * @param {Video} video
	 * @return {Array} the array of related videos
	 */
	getRelatedVideos: function getRelatedVideos(video){
		var tags = [];
		var videos = [];
		
		video.getTagList().forEach(function(tag){
			tags.push("'" + tag.tag + "'");
		});
		
		var result = ActiveRecord.execute('SELECT DISTINCT(video_id) FROM video_tags JOIN videos ON video_id=videos.id WHERE tag_id IN (SELECT id FROM tags WHERE tag IN(' + tags.join(',') + ')) AND video_id != ' + video.id + ' AND videos.is_active=1 AND date_published <= NOW() ORDER BY RAND() LIMIT 5');
		
		// nothing matched by tags, try to grab them by category
		if (result.rows.length == 0) {
			result = ActiveRecord.execute('SELECT video_id FROM categorizations JOIN videos ON video_id=videos.id WHERE video_id != ' + video.id + ' AND category_id IN (SELECT category_id FROM categorizations WHERE video_id=' + video.id + ') AND videos.is_active=1 AND date_published <= NOW() ORDER BY RAND() LIMIT 5');
		}
		
		result.rows.forEach(function(row){
			videos.push(Video.findById(row.video_id));
		});
		
		return videos;
	},
	
	getOembedData: function getOembedData(video)
	{
		// set up the base return object
		var oembed = {
			type:				'video',
			version: 			'1.0',
			provider_name:		'Aptana TV',
			provider_url: 		'http://' + Jaxer.request.env.HTTP_HOST + site_info('base'),
			title: 				'',
			author_name: 		'',
			author_image_url:	'',
			html: 				'',
			width: 				'600',
			height: 			'375',
			thumbnail_url: 		'',
			video_id: 			'',
			video_name:			'',
			related_videos: 	[]
		};
		
		// load the user as well
		var user = User.findById(video.user_id);
		
		// assign some data to the object
		oembed.title 			= video.name;
		oembed.thumbnail_url 	= oembed.provider_url + 'images_videos_original/' + video.image_file;
		oembed.author_name		= user.first_name;
		oembed.author_image_url	= oembed.provider_url + 'images_avatars/thumb_small_' + user.avatar_file;
		oembed.video_id			= video.id;
		oembed.video_name		= video.source_url;
		
		// build the embed html
		oembed.html = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="600" height="375" id="player_600" align="middle">';
		oembed.html += '<param name="allowScriptAccess" value="always" />';
		oembed.html += '<param name="allowFullScreen" value="true" />';
		oembed.html += '<param name="FlashVars" value="context=embed&base=' + oembed.provider_url + '&movie=' + urldecode(this.params.url) + '" />';
		oembed.html += '<param name="movie" value="' + oembed.provider_url + 'images_flash/player_600.swf" />';
		oembed.html += '<param name="quality" value="high" />';
		oembed.html += '<param name="bgcolor" value="#000000" />';
		oembed.html += '<embed src="' + oembed.provider_url + 'images_flash/player_600.swf" FlashVars="context=embed&base=' + oembed.provider_url + '&movie=' + urldecode(this.params.url) + '" quality="high" bgcolor="#000000"'
		oembed.html += ' width="600" height="375" name="player_600" align="middle" allowScriptAccess="sameDomain" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
		oembed.html += '</object>';
				
		// fetch some related videos
		var related_videos = this.getRelatedVideos(video);
		
		related_videos.forEach(function(video){
			oembed.related_videos.push({
				title: 			video.name,
				url: 			oembed.provider_url + 'videos/' + video.slug,
				thumbnail_url:	oembed.provider_url + 'images_videos_thumbs/thumb_small_' + video.image_file	
			});
		});
		
		return oembed;
	}
});
