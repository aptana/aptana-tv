LearnController = ActiveController.create({
	/**
	 * Learn pages use the default layout
	 */
	layout: {
		file: 'layouts/layout_default.html'
	},
	
	/**
	 * Main learn page, simply lists the learning paths
	 */
	index: function index()
	{
		this.set('learning_paths', LearningPath.find({
			all: 	true,
			order: 	'name',
			where: {
				is_active: 1
			}
		}));
		
		this.render({
			file: 'learn/learn.html'
		});
	},
	
	/**
	 * Shows the videos for a particular learning path
	 */
	show: function show()
	{
		var path = LearningPath.findBySlug(this.params.slug);
		
		if(!path)
		{
			show_404();
			return;
		}
		
		this.set('path', path);
		this.set('videos', path.getVideoList({ order: 'play_order', where: 'date_published <= NOW() AND is_active = 1' }));
		
		this.render({
			file: 'learn/learn.html'
		});
		
	},
	
	/**
	 * Edit a learning path
	 * 
	 * This page requires authentication, and allows a user to edit a learning path
	 */
	edit: function edit() 
	{
		// load the path
		var path = LearningPath.findBySlug(this.params.slug);
		
		// changes have been submitted
		if (typeof(this.params.doSave) != 'undefined' && this.params.doSave == 1) 
		{
			// turn the playlist param into an array
			var playlist = this.params.playlist.split(',');
			
			// clear the learning path
			ActiveRecord.execute('DELETE FROM learning_path_items WHERE learning_path_id=' + path.id);
			
			// process all the current playlist items
			for(var i=0; i<playlist.length; i++)
			{
				var video_id = playlist[i].replace('video-', '');
				LearningPathItem.create({
					video_id: 			video_id,
					play_order: 		(i+1),
					learning_path_id: 	path.id
				});
			}
			
			// set the appropriate template vars
			this.set('submit', true);
			this.set('playlist', this.params.playlist);
		}
		// no changes were submitted, set the submit flag to false
		else
		{
			this.set('submit', false);
		}
		
		// load the unused videos
		var videos_unused = ActiveRecord.execute('SELECT id FROM videos WHERE id NOT IN (SELECT video_id FROM learning_path_items WHERE learning_path_id=' + path.id + ') AND is_active=1 AND date_published <= NOW() ORDER BY videos.name ASC');
		// load the used videos
		var videos_used = ActiveRecord.execute('SELECT video_id AS id FROM learning_path_items JOIN videos on learning_path_items.video_id = videos.id WHERE learning_path_id=' + path.id + ' ORDER BY play_order ASC');
		
		// set the rest of the template cars, and render
		this.set('videos_unused', videos_unused.rows);
		this.set('videos_used', videos_used.rows);
		this.set('path', path);
		
		this.render({
			file: 'learn/learning_path_edit.html'
		});
	}
});