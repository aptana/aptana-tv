InstallController = ActiveController.create({
	// default action
	index: function index()
    {
		// ActiveRecord.execute('DROP TABLE users');
		// ActiveRecord.execute('DROP TABLE categories');
		// ActiveRecord.execute('DROP TABLE learning_paths');
		// ActiveRecord.execute('DROP TABLE videos');
		
		// set up the users
		ActiveRecord.execute('truncate users');
		User.create({ username: 'iselby', password: '68307d33bf48bd4e23e66c4e6673a2d3', first_name: 'Ian', last_name: 'Selby', email: 'ian@aptana.com', website: 'http://www.aptana.com' });
		
		// set up the categories
		ActiveRecord.execute('truncate categories');
		Category.create({ name: 'Aptana Studio', slug: 'aptana-studio' });
		Category.create({ name: 'Aptana Jaxer', slug: 'aptana-jaxer' });
		Category.create({ name: 'Aptana RadRails', slug: 'aptana-radrails' });
		Category.create({ name: 'Aptana Pydev', slug: 'aptana-pydev' });
		Category.create({ name: 'Aptana Cloud', slug: 'aptana-cloud' });
		Category.create({ name: 'Aptana PHP Support', slug: 'aptana-php-support' });
		Category.create({ name: 'Mobile Ajax', slug: 'mobile-ajax' });
		Category.create({ name: 'Desktop Ajax', slug: 'desktop-ajax' });
		
		// set up the learning paths
		ActiveRecord.execute('truncate learning_paths');
		LearningPath.create({ name: 'Getting Started with Studio', slug: 'getting-started-with-studio' });
		LearningPath.create({ name: 'Working with Aptana PHP Support', slug: 'working-with-aptana-php-support' });
		LearningPath.create({ name: 'Aptana Jaxer 101', slug: 'aptana-jaxer-101' });
		LearningPath.create({ name: 'Getting Started with Aptana Cloud', slug: 'getting-started-with-aptana-cloud' });
		LearningPath.create({ name: 'Working with Adobe AIR', slug: 'working-with-adobe-air' });
		
		// set up the products
		ActiveRecord.execute('truncate products');
		ActiveRecord.execute('truncate versions');
		Product.create({ name: 'Aptana Studio', url: 'http://www.aptana.com/studio' });
			var prod = Product.findByName('Aptana Studio');
			prod.createVersion({ name: '1.2' });
			prod.createVersion({ name: '1.3' });
		Product.create({ name: 'Aptana PHP Support', url: 'http://www.aptana.com/php' });
			prod = Product.findByName('Aptana PHP Support');
			prod.createVersion({ name: '1.0' });
		Product.create({ name: 'Aptana RadRails', url: 'http://www.aptana.com/rails'});
			prod = Product.findByName('Aptana RadRails');
			prod.createVersion({ name: '1.1' });
		Product.create({ name: 'Aptana Pydev', url: 'http://www.aptana.com/pydev'});
			prod = Product.findByName('Aptana Pydev');
			prod.createVersion({ name: '1.4.2' });
		Product.create({ name: 'Aptana AIR', url: 'http://www.aptana.com/air'});
			prod = Product.findByName('Aptana AIR');
			prod.createVersion({ name: '1.2.1' });
		
    }
})

