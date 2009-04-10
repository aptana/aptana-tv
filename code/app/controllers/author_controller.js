AuthorController = ActiveController.create({
	layout: {
		file: 'layouts/layout_default.html'
	},
	
	index: function index() 
	{
		var user = User.findById(this.params.user_id);
		
		if(!user)
		{
			show_404();
			return;
		}
		
		var videos_sql = 'SELECT * FROM videos WHERE user_id=' + user.id + ' AND date_published <= NOW() AND is_active=1 ORDER BY date_published DESC';
		
		this.set('user', user);
		this.set('videos', Video.find(videos_sql));
		
		this.render({
			file: 'author/author.html'
		});
	}
});
