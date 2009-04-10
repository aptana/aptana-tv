var video_source_valid 	= false;
var video_source 		= '';

/**
 * Validates the create new video form
 * 
 */
function validate_create_form()
{
	var error_messages = [];
	var error_elements = [];
	var valid = true;
	
	// make sure the video source is correct
	if(!video_source_valid)
	{
		valid = false;
		error_messages.push('The video source file does not exist.');
	}
	
	// validate the name
	if($('name').value.clean() == '')
	{
		valid = false;
		error_messages.push('Name cannot be blank');
		error_elements.push('name');
	}
	
	// validate the description
	if($('description').value.clean() == '')
	{
		valid = false;
		error_messages.push('Description cannot be blank');
		error_elements.push('description');
	}
	
	// validate the source url
	if($('source_url').value.clean() == '' || $('source_url').value.clean().indexOf('.flv') == -1)
	{
		valid = false;
		error_messages.push('Video source cannot be blank and must contain ".flv"');
		error_elements.push('source_url');
	}
	
	// validate the tags
	if($('tags').value.clean() == '')
	{
		valid = false;
		error_messages.push('Please enter at least one tag');
		error_elements.push('tags');
	}
	
	// validate the product
	if($('product_id').value == '---')
	{
		valid = false;
		error_messages.push('Please choose a relevant product');
		error_elements.push('product_id');
	}
	
	// validate the publish date
	if(!$('date_published').value.test(/20[0-1]\d-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d/))
	{
		valid = false;
		error_messages.push('Please enter a valid publish date');
		error_elements.push('date_published');
	}
	
	// make sure at least one category is checked
	var num_checked_cats = 0;
	$$('input.video-category').forEach(function(element) {
		if($(element).checked == true)
		{
			num_checked_cats ++;
		}
	});
	
	if(num_checked_cats == 0)
	{
		valid = false;
		error_messages.push('Please choose at least one category for this video');
	}
	
	
	// validate the image file
	if($('image_file').value.clean() == '' || ($('image_file').value.clean().indexOf('.jpg') == -1 && $('image_file').value.clean().indexOf('.png') == -1))
	{
		valid = false;
		error_messages.push('Please choose a valid image file for this video (jpg or png only)');
		error_elements.push('image_file');
	}
	
	if(!valid)
	{
		error_html = '<strong>Please correct the following errors:</strong><ul class="errors">';
		error_messages.forEach(function(message){
			error_html += '<li>' + message + '</li>';
		});
		error_html += '</ul>';
		
		new Fx.Scroll(window).toTop().chain(function() {
			
			// highlight the error element's label, and add blur observer
			error_elements.forEach(function(element){
				$(element).getPrevious('label').addClass('error');
				
				$(element).addEvent('blur', function(event) {
					$(element).getPrevious('label').removeClass('error');
					$(element).removeEvents('blur');
				});
			});
			
			// focus on the first error element
			$(error_elements[0]).focus();
			
			// open the error dialog
			new MochaUI.Window({
				id:			'errorWindow',
				title:		'Error creating video',
				content:	error_html,
				type:		'modal',
				width:		400
			});	
		});
		
		return false;
	}
	
	new Fx.Scroll(window).toTop().chain(function() {
		new MochaUI.Window({
			id:					'createWindow',
			title:				'Creating Video',
			content:			'<div align="center" style="line-height: 18px;">Please wait, the images (and any attachments) are being uploaded and processed.</div>',
			type:				'modal',
			closable:			false,
			overlayClosable:	false,
			width: 				300
		});	
	});
	
	return valid;
}

/**
 * Validates the edit video form
 * 
 */
function validate_edit_form()
{
	var error_messages = [];
	var error_elements = [];
	var valid = true;
	
	// make sure the video source is correct
	if(!video_source_valid)
	{
		valid = false;
		error_messages.push('The video source file does not exist.');
	}
	
	// validate the name
	if($('name').value.clean() == '')
	{
		valid = false;
		error_messages.push('Name cannot be blank');
		error_elements.push('name');
	}
	
	// validate the description
	if($('description').value.clean() == '')
	{
		valid = false;
		error_messages.push('Description cannot be blank');
		error_elements.push('description');
	}
	
	// validate the source url
	if($('source_url').value.clean() == '' || $('source_url').value.clean().indexOf('.flv') == -1)
	{
		valid = false;
		error_messages.push('Video source cannot be blank and must contain ".flv"');
		error_elements.push('source_url');
	}
	
	// validate the tags
	if($('tags').value.clean() == '')
	{
		valid = false;
		error_messages.push('Please enter at least one tag');
		error_elements.push('tags');
	}
	
	// validate the product
	if($('product_id').value == '---')
	{
		valid = false;
		error_messages.push('Please choose a relevant product');
		error_elements.push('product_id');
	}
	
	// validate the publish date
	if(!$('date_published').value.test(/20[0-1]\d-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d/))
	{
		valid = false;
		error_messages.push('Please enter a valid publish date');
		error_elements.push('date_published');
	}
	
	// make sure at least one category is checked
	var num_checked_cats = 0;
	$$('input.video-category').forEach(function(element) {
		if($(element).checked == true)
		{
			num_checked_cats ++;
		}
	});
	
	if(num_checked_cats == 0)
	{
		valid = false;
		error_messages.push('Please choose at least one category for this video');
	}
			
	if(!valid)
	{
		error_html = '<strong>Please correct the following errors:</strong><ul class="errors">';
		error_messages.forEach(function(message){
			error_html += '<li>' + message + '</li>';
		});
		error_html += '</ul>';
		
		new Fx.Scroll(window).toTop().chain(function() {
			
			// highlight the error element's label, and add blur observer
			error_elements.forEach(function(element){
				$(element).getPrevious('label').addClass('error');
				
				$(element).addEvent('blur', function(event) {
					$(element).getPrevious('label').removeClass('error');
					$(element).removeEvents('blur');
				});
			});
			
			// focus on the first error element
			$(error_elements[0]).focus();
			
			// open the error dialog
			new MochaUI.Window({
				id:			'errorWindow',
				title:		'Error creating video',
				content:	error_html,
				type:		'modal',
				width:		400
			});	
		});
		
		return false;
	}
	
	new Fx.Scroll(window).toTop().chain(function() {
		new MochaUI.Window({
			id:					'createWindow',
			title:				'Creating Video',
			content:			'<div align="center" style="line-height: 18px;">Please wait, the images (and any attachments) are being uploaded and processed.</div>',
			type:				'modal',
			closable:			false,
			overlayClosable:	false,
			width: 				300
		});	
	});
	
	return valid;
}

/**
 * Makes sure that the supplied video exists on S3
 * 
 * @param {String} video
 */
function check_video_exists(video)
{
	// don't run the check if we don't need to
	if($('source_url').value == '' || video_source_valid && video_source == $('source_url').value)
	{
		return;
	}
	
	var atl 		= new AptanaTvLib;
	video_source 	= $('source_url').value;
	
	// show the activity indicator
	$('source_url_info').set('html', '<img src="' + atl.baseUrl + 'images_global/img_activity.gif" />');
	
    var result = new Request.JSON({
        url: atl.baseUrl + 'video/create/validate',
        onComplete: function(result){
			if(result.exists)
			{
				$('source_url_info').set('html', '<img src="' + atl.baseUrl + 'images_global/img_icon_ok.png" />');
				video_source_valid = true;
			}
			else
			{
				$('source_url_info').set('html', '<a href="javascript: explain_exists_error();" title="What does this mean?"><img src="' + atl.baseUrl + 'images_global/img_icon_error.png" /></a>');
				video_source_valid = false;
			}
        }
    }).post({
        video: video
    });
}



/**
 * Shows a modal dialog explaining the invalid S3 URL error
 */
function explain_exists_error()
{
	new MochaUI.Window({
		id:			'errorWindow',
		title:		'Invalid Video File',
		content:	'<p style="line-height: 18px;">The video you entered does not exist on S3.  This will prevent you from creating the video.</p>',
		type:		'modal',
		width:		300
	});	
}

window.addEvent('domready', function(){
	$('source_url').addEvent('blur', function(){
		check_video_exists($('source_url').value);
	});
});