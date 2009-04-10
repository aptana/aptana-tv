TopicsController = ActiveController.create({
	/**
	 * Topics use the default layout
	 */
	layout: {
		file: 'layouts/layout_default.html'
	},
	
	/**
	 * Main page, simply lists the categories
	 */
	index: function index()
	{
		this.set('categories', Category.find({
            all: 	true,
            order: 	'name',
            where: {
                is_active: 1
            }
        }));
		
		this.render({
			file: 'topics/topics.html'
		})
	},
	
	/**
	 * Shows the videos for a particular category
	 */
	show: function show()
	{
		var category = Category.findBySlug(this.params.slug);
		
		if(!category)
		{
			show_404();
			return;
		}
		
		this.set('category', category);
        this.set('videos', category.getVideoList({
            order: 'created DESC',
			where: 'date_published <= NOW() AND is_active = 1'
        }));
		
		this.render({
			file: 'topics/topics.html'
		});
	}
});