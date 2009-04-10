VideosController = ActiveController.create({
	/**
	 * Video pages use the video layout
	 */
	layout: {
		file: 'layouts/layout_video.html'
	},
	
	/**
	 * Displays a video page
	 */
	index: function index() 
	{
		var video_id = Jaxer.DB.execute('SELECT id FROM videos WHERE slug=? AND date_published <= NOW() AND is_active=1', this.params.slug).singleResult;
		
		var video = Video.findById(video_id);
		
		if(!video)
		{
			show_404();
			return;
		}
		
		var user 			= User.findById(video.user_id);
		var learningPath	= false;
		var relatedVideos 	= [];
		
		// update the view count for the video
		video.set('view_count', video.get('view_count') + 1);
		video.save();
		
		// deal with the learning path ref stuff
		if(typeof(this.params.ref) != 'undefined' && this.params.ref == 'learn')
		{
			learningPath = LearningPath.findById(this.params.refId);
		}
		
		// if no learning path, get some related videos
		if(!learningPath)
		{
			// fetch some related videos
			this.set('relatedVideos', this.getRelatedVideos(video));
			
			// we can also find out if this video belongs to any learning paths
			var result = ActiveRecord.execute('SELECT learning_path_id, learning_paths.name, learning_paths.slug FROM learning_path_items JOIN learning_paths ON learning_paths.id=learning_path_items.learning_path_id WHERE video_id=' + video.id + ' GROUP BY learning_path_id ORDER BY learning_paths.name');
			this.set('learningPaths', result.rows);
		}	
		
		// set the learning path
		this.set('learningPath', learningPath);
		
		// set the ref and refId info
		this.set('ref', (typeof(this.params.ref) != 'undefined') ? this.params.ref : '');
		this.set('refId', (typeof(this.params.refId) != 'undefined') ? this.params.refId : '');
		
		// set the video and user that we loaded
		this.set('video', video);
		this.set('user', user);
		
		// fetch and set the video's comments
		this.set('comments', this.getComments(video));
		
		this.render({
			file: 'videos/videos.html'
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
	getRelatedVideos: function getRelatedVideos(video)
	{
		var tags 	= [];
		var videos 	= [];
		
		video.getTagList().forEach(function(tag) {
			tags.push("'" + tag.tag + "'");
		});
		
		var result = ActiveRecord.execute('SELECT DISTINCT(video_id) FROM video_tags JOIN videos ON video_id=videos.id WHERE tag_id IN (SELECT id FROM tags WHERE tag IN(' + tags.join(',') + ')) AND video_id != ' + video.id + ' AND videos.is_active=1 AND date_published <= NOW() ORDER BY RAND() LIMIT 5');
		
		// nothing matched by tags, try to grab them by category
		if(result.rows.length == 0)
		{
			result = ActiveRecord.execute('SELECT video_id FROM categorizations JOIN videos ON video_id=videos.id WHERE video_id != ' + video.id + ' AND category_id IN (SELECT category_id FROM categorizations WHERE video_id=' + video.id + ') AND videos.is_active=1 AND date_published <= NOW() ORDER BY RAND() LIMIT 5');
		}
		
		result.rows.forEach(function(row) {
			videos.push(Video.findById(row.video_id));
		});
		
		return videos;		
	},
	
	/**
	 * Loads the comments for this video from the database
	 * 
	 * This function performs some fun logic to figure out which comments should be loaded:
	 *  - If the user is logged in, fetch all active comments, regardless of approved status
	 *  - If the user is not logged in, but has a comment_moderation session, load all approved comments 
	 *    and those that the user has submitted that are waiting for moderation
	 *  - Otherwise, just load the active, approved comments
	 *  
	 * @param {Video} the video to get comments for
	 * @return {Array} array of comments
	 */
	getComments: function getComments(video)
	{
		// if the user's logged in, get all the comments regardless of approved
		if (is_logged_in())
		{
			var comments = Comment.find('SELECT * FROM comments WHERE video_id=' + video.id + ' AND is_active=1 ORDER BY created ASC');
		}
		// if there's a session for comments awaiting moderation, so get approved comments, plus the current user's comments awaiting moderation
		else if (!is_logged_in() && typeof(Jaxer.session['waiting_comments']) != 'undefined') 
		{
			var comments = Comment.find('SELECT * FROM comments WHERE video_id=' + video.id + ' AND is_active=1 AND (approved=1 OR id IN ("' + Jaxer.session['waiting_comments'].split(',').join('","') + '")) ORDER BY created ASC');
		}
		// just get the approved comments
		else
		{
			var comments = Comment.find('SELECT * FROM comments WHERE video_id=' + video.id + ' AND is_active=1 AND approved=1 ORDER BY created ASC');
		}
		
		return comments;
	}
});