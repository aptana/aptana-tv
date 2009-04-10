FeedController = ActiveController.create({
	/**
	 * The feeds use the feed layout
	 */
	layout: {
		file: 'layouts/layout_feed.xml'
	},
	/**
	 * Only one action here, the default :)
	 */
	index: function index()
	{
		var video_sql = 'SELECT videos.* FROM videos WHERE is_active=1 AND date_published <= NOW() ORDER BY date_published DESC';
		
		// figure out what videos we need to load
		if(this.params.category_slug)
		{
			var video_sql = 'SELECT videos.* FROM videos JOIN categorizations ON videos.id=categorizations.video_id JOIN categories ON categorizations.category_id=categories.id WHERE categories.slug="' + this.params.category_slug + '" AND videos.is_active=1 AND videos.date_published <= NOW() ORDER BY videos.date_published DESC';
		}
		
		var videos = Video.find(video_sql);
		var pubDate = (videos[0]) ? videos[0].date_published : new Date();
		
		this.set('pubDate', pubDate);
		this.set('category', Category.findBySlug(this.params.category_slug));
		this.set('videos', videos);
		this.set('host', 'http://' + Jaxer.request.env.HTTP_HOST);
		
		this.render({
			file: 'feed/feed.xml'
		});
		
		ActiveController.Server.Response.setHeader('Content-Type','application/xml');
	}
});