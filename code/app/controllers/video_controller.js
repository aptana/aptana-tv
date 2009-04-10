var VideoController = ActiveController.create({
	/**
	 * These pages use the video admin layout
	 */
	layout: {
		file: 'layouts/layout_video_admin.html'	
	},
	
	/**
	 * Shows the successful create page
	 */
	created: function created()
	{
		if(typeof(this.params.id) == 'undefined')
		{
			this.create();
			return;	
		}
		
		this.set('newVideo', Video.findById(this.params.id));
		
		this.render({
			file: 'video/created.html'
		});
	},
	
	/**
	 * Shows the create page, and processes create requests
	 */
	create: function create() 
	{
		// force auth for this page
		if(require_login('VideoController', 'create'))
		{
			return;
		}
		
		// the user submitted a create request
		if(this.params.doCreate && this.params.doCreate == 1)
		{
			// create the new video
			var new_video = Video.create({
				user_id:		Jaxer.session['user_id'],
				product_id:		this.params.product_id,
				version_id:		this.params.version_id,
				name: 			this.params.name,
				slug:			generate_slug(this.params.name),
				source_url:		this.params.source_url,
				related_url:	this.params.related_url,
				description: 	this.params.description,
				date_published: this.params.date_published
			});
			
			// we'll use this to bass the scope along
			var that = this;
			
			// loop through all uploaded files
			Jaxer.request.files.forEach(function (file)
			{
				// process the image
				if(file.elementName == 'image_file')
				{
					// init the imagick lib
					JsImagick.init();
					
					var filename 		= generate_file_name(file.fileName);
					var original_file 	= JsImagick.sourceDirectory + filename;
					var small_file		= JsImagick.thumbDirectory + 'thumb_small_' + filename;		// 115x72
					var wide_file		= JsImagick.thumbDirectory + 'thumb_wide_' + filename;		// 292x107
					var medium_file		= JsImagick.thumbDirectory + 'thumb_medium_' + filename;	// 160x100
					
					// save the original file
					file.save(original_file);
					
					// generate our thumbnails & resize the original file
					JsImagick.adaptiveResize(original_file, '115x72', small_file);
					JsImagick.adaptiveResize(original_file, '292x107', wide_file);
					JsImagick.adaptiveResize(original_file, '160x100', medium_file);
					JsImagick.adaptiveResize(original_file, '600x375', original_file); // default size of the player
					
					// update the new video
					new_video.set('image_file', filename);
					new_video.save();
					
					that.set('fileName', filename);
				}
				// process an attachment
				else if (file.elementName == 'attachment_file' && that.params.attachment_name != '' && file.originalFileName != '')
				{
					// save the file to the filesystem
					var attachment_root = Application.Config.root + 'video_attachments/';
					var filename 		= generate_file_name(file.fileName); 
					
					file.save(attachment_root + filename);
					
					// create the new attachment
					new_video.createVideoAttachment({
						name: 			that.params.attachment_name,
						description: 	that.params.attachment_description,
						size: 			file.fileSize,
						file_name: 		filename
					});
				}
			});
			
			var video_id = new_video.get('id');
			
			// add the categorizations
			this.params.category.forEach(function(category) {
				Categorization.create({
					video_id: 		video_id,
					category_id: 	category
				});
			});
			
			// add the tags
			update_video_tags(this.params.tags, video_id);
			
			// render the page (which will redirect)
			this.set('create', true);
			this.set('video_id', video_id);
			
			this.render({
				file: 'video/create.html'
			});
		}
		// nothing's been submitted, so we need to load up a few things
		else
		{
			this.set('categories', Category.find({
			all: 	true,
			order: 	'name',
			where: {
					is_active: 1
				}
			}));
			
			this.set('products', Product.find({
				all: 	true,
				order: 	'name',
				where: {
					is_active: 1
				}
			}));
			
			this.set('create', false);
			
			this.render({
				file: 'video/create.html'
			});
		}
	},
	
	/**
	 * Shows the edit page, and updates videos as needed
	 */
	edit: function edit()
	{
		// force auth for this page
		if(require_login())
		{
			return;
		}
		
		var video = Video.findById(this.params.id);
		
		if(typeof(this.params.doUpdate) && this.params.doUpdate == 1)
		{
			video.set('product_id', this.params.product_id);
			video.set('version_id', this.params.version_id);
			video.set('source_url', this.params.source_url);
			video.set('related_url', this.params.related_url);
			video.set('description', this.params.description);
			video.set('date_published', this.params.date_published);
			
			var that=this;
			
			// loop through all uploaded files
			Jaxer.request.files.forEach(function (file)
			{
				// process the image if a new one was uploaded
				if(file.elementName == 'image_file' && file.originalFileName != '')
				{
					// init the imagick lib
					JsImagick.init();
					
					var filename 		= generate_file_name(file.fileName);
					var original_file 	= JsImagick.sourceDirectory + filename;
					var small_file		= JsImagick.thumbDirectory + 'thumb_small_' + filename;		// 115x72
					var wide_file		= JsImagick.thumbDirectory + 'thumb_wide_' + filename;		// 292x107
					var medium_file		= JsImagick.thumbDirectory + 'thumb_medium_' + filename;	// 160x100
					
					// save the original file
					file.save(original_file);
					
					// generate our thumbnails & resize the original file
					JsImagick.adaptiveResize(original_file, '115x72', small_file);
					JsImagick.adaptiveResize(original_file, '292x107', wide_file);
					JsImagick.adaptiveResize(original_file, '160x100', medium_file);
					JsImagick.adaptiveResize(original_file, '600x375', original_file); // default size of the player
					
					// update the new video
					video.set('image_file', filename);
					video.save();
					
					that.set('fileName', filename);
				}
				// process an attachment
				else if (file.elementName == 'attachment_file' && that.params.attachment_name != '' && file.originalFileName != '')
				{
					// save the file to the filesystem
					var attachment_root = Application.Config.root + 'video_attachments/';
					var filename 		= generate_file_name(file.fileName); 
					
					file.save(attachment_root + filename);
					
					// if it already exists, update
					if(video.video_attachment_id != 0)
					{
						var attachment = VideoAttachment.findById(video.video_attachment_id);
						
						attachment.set('name', that.params.attachment_name);
						attachment.set('description', that.params.attachment_description);
						attachment.set('size', file.fileSize);
						attachment.set('file_name', filename);
						
						attachment.save();
					}
					// otherwise, create
					else
					{
						// create the new attachment
						video.createVideoAttachment({
							name: 			that.params.attachment_name,
							description: 	that.params.attachment_description,
							size: 			file.fileSize,
							file_name: 		filename
						});
					}
				}
			});
			
			video.save();
			this.set('edit', true);
			this.set('video', video);
		}
		else
		{
			this.set('edit', false);
			
			this.set('categories', Category.find({
			all: 	true,
			order: 	'name',
			where: {
					is_active: 1
				}
			}));
			
			this.set('products', Product.find({
				all: 	true,
				order: 	'name',
				where: {
					is_active: 1
				}
			}));
			
			var cat_list = video.getCategoryList();
			var currentCategories = [];
			
            cat_list.forEach(function(cat){
				currentCategories.push(cat.id);
            });
			
			var tagsList = video.getTagList();
			var tags = [];
			tagsList.forEach(function (tag) {
				tags.push(tag.get('tag'));
			});
			
			this.set('attachment', VideoAttachment.findById(video.video_attachment_id));
			this.set('versions',  Product.findById(video.product_id).getVersionList());
			this.set('currentCategories', currentCategories);
			this.set('tags', tags.join(', '));
			this.set('edit', false);
			this.set('video', video);
		}		
		
		this.render({
			file: 'video/edit.html'
		});
	},
	
	/**
	 * Validates the existence of a file on S3
	 * 
	 * This action should only be triggered by an XHR POST
	 */
	validateUrl: function validateUrl()
	{
		// init some vars
		var base	= 'http://s3.amazonaws.com/com.aptana.screencasts/';
		var video 	= this.params.video;
		var exists	= true;
		
		// validate the URL, invalid ones will throw an exception
		try 
		{
			Jaxer.Web.head(base + video);
		}
		catch (e)
		{
			exists = false;
		}
		
		// send up the response
		this.render({
			json: {
				exists: exists
			}
		});
	}
});