ExploreController = ActiveController.create({
	/*
	 * Explore page uses the default layout
	 */
	layout: {
		file: 'layouts/layout_default.html'
	},
	
	/**
	 * Default explore page
	 * 
	 * Finds the most viewed videos and retrieves a tag cloud
	 */
    index: function index() 
	{
		// get the most viewed videos
        var most_viewed = Video.find({
            all: 	true,
            order: 	'view_count DESC, name ASC',
            limit: 	5,
            where: 'is_active=1 AND date_published <= NOW()'
        });
		
		// get the tag cloud data
		var result = ActiveRecord.execute('SELECT COUNT(tag_id) AS `count`, tags.tag, tags.slug FROM video_tags JOIN tags on tags.id=video_tags.tag_id JOIN videos on video_tags.video_id=videos.id WHERE videos.is_active=1 AND videos.date_published <= NOW() GROUP BY (tag_id) ORDER BY tag');
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
		this.set('mostViewed', most_viewed);
		this.render({
			file: 'explore/explore.html'
		})
    },
	
	/**
	 * Performs a search
	 */
    search: function search() 
	{
		// see if the search is set
		if(this.params.searchFor && this.params.searchFor.match(/[^\s]+/))
		{
			// init some vars
			var videos 			= [];
            var terms 			= (urldecode(this.params.searchFor) || '').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
			var terms_as_array 	= terms.split(/\s+/);
			
			// build the tags section of the SQL statement
			var tag_clause = terms_as_array.map(function(term) {
				return 'tags.tag LIKE "%' + term + '%"';
			}).join(' OR ');
            
			// build the query
			var sql = 'SELECT videos.* FROM videos JOIN video_tags ON videos.id=video_tags.video_id JOIN tags ON video_tags.tag_id=tags.id WHERE (videos.name LIKE "%' + terms + '%" OR ' + tag_clause + ') AND videos.is_active=1 AND date_published <= NOW() GROUP BY videos.id ORDER BY videos.name';
			// and fetch the matching videos
			this.set('videos',Video.find(sql));
			
			// if the URL contains a ".json" in it (i.e. /explore/search.json?searchFor=...)
			// then output the results as JSON
			if(ActiveController.Server.Request.getExtension() == 'json')
			{
				this.render({
	                json: {
	                    videos: this.get('videos') || []
	                }
	            });
			}
			// otherwise (the most likely case), simply show the results page
			else
			{
				this.set('isSearch', true);
				this.set('searchFor', this.params.searchFor);
				
				this.render({
					file: 'explore/explore.html'
				});
			}
		}
    },
	
	/**
	 * Browse videos by tag
	 * 
	 */
	tag: function tag() 
	{
		var tag 	= Tag.findBySlug(this.params.slug);
		var videos 	= (!tag) ? [] : Video.find('SELECT videos.* FROM videos JOIN video_tags ON video_tags.video_id=videos.id WHERE tag_id=' + tag.id + ' AND videos.date_published <= NOW() AND videos.is_active=1 ORDER BY videos.name ASC');
		
		this.set('videos', videos);
		this.set('tag', (!tag) ? { tag: this.params.slug } : tag);
		
		this.render({
			file: 'explore/tags.html'
		})
	},
	
	/**
	 * Browse by product and version
	 */
	product: function product() 
	{
		
		// if we don't have both a product_id and a version_id, we need to show the default explore page
		if(typeof(this.params.product_id) == 'undefined')
		{
			this.render({
				file: 'explore/explore.html'
			});
			
			return;
		}
		
		// load everything up
		var product = Product.findById(this.params.product_id);
		
		if(!product)
		{
			this.index();
			return;
		}
		
        var videos = Video.find({
            all: 	true,
            order: 	'name',
            where: 'is_active=1 AND date_published <= NOW() AND product_id=' + this.params.product_id
        });
		
		// and set the variables, then render
		this.set('product', product);
		this.set('videos', videos);
		
		this.render({
			file: 'explore/products.html'
		})
	}
});