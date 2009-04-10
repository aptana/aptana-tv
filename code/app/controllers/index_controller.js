IndexController = ActiveController.create({
	/**
	 * The homepage uses the default layout
	 */
	layout: {
		file: 'layouts/layout_default.html'
	},
	/**
	 * Shows the home page (nice and easy)
	 */
	index: function index()
    {
		// fetch the categories
        this.set('categories', Category.find({
            all: 	true,
            order: 	'id',
            limit: 	8,
            where: {
                is_active: 1
            }
        }));
		// fetch the learning paths
		this.set('learning_paths', LearningPath.find({
			all: 	true,
			order: 	'RAND()',
			limit: 	4,
			where: {
				is_active: 1
			}
		}));
		// render!
		this.render({
			file: 'home/index.html'	
		});
    },
	
	/**
	 * The 404 page
	 */
	not_found: function not_found()
	{
		// get the tag cloud data
		var result = ActiveRecord.execute('SELECT COUNT(tag_id) AS `count`, tags.tag, tags.slug FROM video_tags JOIN tags on tags.id=video_tags.tag_id GROUP BY (tag_id) ORDER BY tag');
		var max = 0;
		
		// figure out what the max count is in our tags
		result.rows.forEach(function(row) {
			if(row.count > max)
			{
				max = row.count;	
			}
		});
		
		// finally, get the products
		this.set('products', Product.find({
			all: 	true,
			order: 	'name',
			where: {
				is_active: 1
			}
		}));
		
		// set the rest of the template vars, and render
		this.set('tags', result.rows);
		this.set('tagMax', max);
		
		this.render({
			file: 'home/404.html'
		});
	}
});