Application.Config = {
    rest_prefix: '/api',
    root: Jaxer.request.app.configPath + '/',
    web_root: Jaxer.request.app.webRoot,
    routes: [
		// default route
		['/', { object: 'Index', method: 'index' }],
		
		// topics routes
		['topic', '/topics/:slug', { object: 'Topics', method: 'show'}],
		['topicPage', '/topics/:slug/:page', { object: 'Topics', method: 'show' }],
		['topics', '/topics', { object: 'Topics', method: 'index' }],
		
		// explore routes
		['exploreSearch', '/explore/search', { object: 'Explore', method: 'search' }],
		['exploreTags', '/explore/tags/:slug', { object: 'Explore', method: 'tag' }],
		['exploreProducts', '/explore/products/:product_id', { object: 'Explore', method: 'product' }],
		['explore', '/explore/*', { object: 'Explore', method: 'index'}],
		
		// learn routes
		['learn', '/learn/:slug', { object: 'Learn', method: 'show' }],
		['learningPaths', '/learn', { object: 'Learn', method: 'index' }],
		['learningPathEdit', '/learn/:slug/edit', { object: 'Learn', method: 'edit' }],
		
		// video routes
		['video', '/videos/:slug', { object: 'Videos', method: 'index' }],
		['videoCreate', '/video/create', { object: 'Video', method: 'create' }],
		['videoCreateValidator', '/video/create/validate', { object: 'Video', method: 'validateUrl' }],
		['videoCreated', '/video/created/:id', { object: 'Video', method: 'created' }],
		['videoEdit', '/video/edit/:id', { object: 'Video', method: 'edit' }],
		
		// comment routes
		['comment', '/comments', { object: 'Comments', method: 'comment' }],
		['commentModerate', '/comments/moderate/:id/:action', { object: 'Comments', method: 'moderate' }],
		['commentModeration', '/comments/moderation', { object: 'Comments', method: 'queue' }],
		
		// login routes
		['login', '/login', { object: 'Login', method: 'index' }],
		['loginSuccess', '/login/success', { object: 'Login', method: 'success' }],
		['logout', '/logout', { object: 'Login', method: 'logout' }],
		
		// profile routes
		['profile', '/profile', { object: 'Profile', method: 'index' }],
		
		// author routes
		['author', '/author/:user_id', { object: 'Author', method: 'index' }],
		
		// feed routes
		['feed', '/feed/:category_slug', { object: 'Feed', method: 'index' }],
		['feedFull', '/feed', { object: 'Feed', method: 'index' }],
		
		// modal content routes
		['suggest', '/suggest', { object: 'Modal', method: 'suggest' }],
		['embed', '/embed/:slug', { object: 'Modal', method: 'embed' }],
		['share', '/share/:slug', { object: 'Modal', method: 'share' }],
		
		// oembed route
		['oembed', '/api/oembed', { object: 'Oembed', method: 'index' }],
		
		// default routes
		['default', '/*', { object: 'Index', method: 'not_found' }],
		
        ['/:object/:method/:id']
    ]
};

ActiveController.logging	= true;
ActiveRoutes.logging 		= true;
ActiveRecord.logging 		= false;
