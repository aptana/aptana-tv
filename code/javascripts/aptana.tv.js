var AptanaTvLib = new Class({
	/**
	 * Class constructor
	 */
	initialize: function initialize() {
		this.defaultSearchElement	= 'searchFor';
		this.defaultSearchText		= 'Search Videos...';
		this.baseUrl				= '';
		var js 						= /aptana\.tv\.js(\?.*)?$/;
		
		var that = this;

		// get the base from the include statement		
		$$('head script[src]').forEach(function(s){
			if(s.src.match(js))
			{
				var path = s.src.replace(js, ''), includes = s.src.match(/\?.*base=([a-zA-z\/~,\.]*)/);
				this.baseUrl = (includes[1]) ? includes[1] : '';
			}
		}.bind(this));
		
		// init our modal windows (if needed)
		if(typeof(MochaUI) != 'undefined')
		{
			try 
			{
				MochaUI.Modal = new MochaUI.Modal();
			}
			catch (e)
			{
				// do nothing, this sometimes fires too early
			}
		}
		
		// inject the version drop-down behavior if there's a product_id element on the page
		if ($('product_id') && ($('version_id') || $('version_id_cage')))
		{
			this.injectVersionBehavior('showVersionDropDown');
		}
		
		// add the sortables if needed
		if($('available-videos'))
		{
			this.addLearningPathSortables();
		}
		
		// add the click behavior for opening profile, if needed
		if ($('my_profile_link'))
		{
			$('my_profile_link').addEvent('click', function(event){
				this.openProfileWindow()
			}.bind(this));
		}
	},
	
	/**
	 * Injects the focus and blur behavior into the search box in the header
	 * 
	 */
	injectSearchBehavior: function injectSearchBehavior() {
		// so we don't type this.... over and over again ;)
		var element = this.defaultSearchElement;
		
		// modal windows won't have this
		if(!$(element))
		{
			return;
		}
		
		// set the default text
		$(element).value = this.defaultSearchText;
		
		// save that pesky binding
		var that = this;
		
		// add the focus and blur event observers
		$(element).addEvents({
			'focus': function(event) {
				$(element).value = ($(element).value == that.defaultSearchText) ? '' : $(element).value;
			},
			'blur': function(event) {
				$(element).value = ($(element).value == '') ? that.defaultSearchText : $(element).value;
			}
		});
	},
	
	/**
	 * Injects the "show version drop-down" behavior on the product_id select element
	 * 
	 * @param {Function} cb The callback function to call after the update completes
	 */
	injectVersionBehavior: function injectVersionBehavior(cb)
	{
		var api_url = this.baseUrl + 'api/product/';
		
		// make sure the element is present
		if(!$('product_id'))
		{
			return;
		}
		
		// add the event
		$('product_id').addEvent('change', function(event) {
			// if the user hasn't selected a valid product...
			if($('product_id').value == '---')
			{
				// replace the drop-down with text
				if($('version_id'))
				{
					var newDiv = new Element('div', {
						'id': 		'version_id_cage',
						'class':	'info',
						'html':		'Choose a product...'
					});
					
					$(newDiv).replaces($('version_id'));
				}
				// update the text
				else if ($('version_id_cage'))
				{
					$('version_id_cage').set('text', 'Choose a product...');
				}
				
				return;
			}
			
			// create the element we'll inject the new drop-down in
			if(!$('version_id_cage'))
			{
				var newDiv = new Element('div', {
					'id':		'version_id_cage',
					'class':	'info'
				});
				
				$(newDiv).replaces($('version_id'));
			}
			
			// add the activity indicator
			$('version_id_cage').set('html', '<img src="' + this.baseUrl + 'images_global/img_activity.gif" align="baseline" />&nbsp;<em>Loading versions...</em>')
			
			// execute the XHR
			var jsonRequest = new Request.JSON({
				url: 		api_url + $('product_id').value,
				onComplete: function (response) {
					this[cb].call(this, response);
				}.bind(this)
			}).get();
		}.bind(this));
	},
	
	/**
	 * Shows the actual version_id drop-down
	 * 
	 * @param {Object} versions
	 */
	showVersionDropDown: function showVersionDropDown(versions)
	{
		var newHtml = '';
		
		versions.versions.forEach(function(version) {
			newHtml += '<option value="' + version.id + '">' + version.name + '</option>';
		});
		
		var select = new Element('select', {
			'name':	'version_id',
			'id': 	'version_id',
			'html': newHtml
		});
			
		$(select).replaces($('version_id_cage'));
	},
	
	/**
	 * Validates the a product and version have been selected before the user 
	 * browses to that page
	 * 
	 */
	validateBrowseProduct: function validateBrowseProduct()
	{
		if($('product_id').value == '---')
		{
			alert('Please choose a product');
			return false;
		}
		
		if(!$('version_id'))
		{
			alert('Please choose a product version');
			return false;
		}
	},
	
	/**
	 * Validates the comment form
	 * 
	 */
	validateCommentForm: function validateCommentForm()
	{
		if($('name').value.clean() == '')
		{
			alert('Please provide your name');
			return false;
		}
		
		if($('email').value.clean() == '' || !$('email').value.test(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/))
		{
			alert('Please provide a valid email address');
			return false;
		}
		
		if($('website').value.clean() != '' && !$('website').value.test(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/))
		{
			alert('Please enter a valid url');
			return false;
		}
		
		if($('comment').value.clean() == '')
		{
			alert('Please enter a comment');
			return false;
		}
	},
	
	/**
	 * Creates the sortables for the edit learning path page
	 * 
	 */
	addLearningPathSortables: function addLearningPathSortables()
	{
		var sortables = new Sortables('#available-videos, #playlist-videos', {
			clone: false,
			opacity: 0.5,
			onComplete: function(el)
			{
				$('playlist').set('value', sortables.serialize(1));
			}
		});
		
		$('playlist').set('value', sortables.serialize(1));
	},
	
	/**
	 * Opens the "edit profile" modal window
	 */
	openProfileWindow: function openProfileWindow()
	{
		// open the modal dialog
		new MochaUI.Window({
			id:			'profileWindow',
			title:		'My Profile',
			loadMethod:	'iframe',
			contentURL:	this.baseUrl + "profile",
			type:		'modal',
			width:		550,
			height:		450,
			overlayClosable: false
		});	
	},
	
	/**
	 * Opens the "suggest a video" modal window
	 */
	openSuggestWindow: function openSuggestWindow()
	{
		// hide the flash
		if($('player_cage'))
		{
			$('player_cage').setStyle('display', 'none');
		}
		
		// open the modal dialog
		new MochaUI.Window({
			id:			'suggestWindow',
			title:		'Suggest a Video',
			loadMethod:	'iframe',
			contentURL:	this.baseUrl + "suggest",
			type:		'modal',
			width:		550,
			height:		365,
			overlayClosable: false,
			onClose: function() {
				// show the flash again
				if($('player_cage'))
				{
					$('player_cage').setStyle('display', 'block');
				}
			}
		});	
	},
	
	showShareWindow: function showShareWindow()
	{
		if($('player_cage'))
		{
			$('player_cage').setStyle('display', 'none');
		}
		
		// open the modal dialog
		new MochaUI.Window({
			id: 'shareWindow',
			title: 'Share this Video',
			loadMethod: 'iframe',
			contentURL: this.baseUrl + "share/" + window.location.href.split('/').pop(),
			type: 'modal',
			width: 550,
			height: 385,
			overlayClosable: true,
			onClose: function() {
				// show the flash again
				if($('player_cage'))
				{
					$('player_cage').setStyle('display', 'block');
				}
			}
		});
	},
	
	showEmbedWindow: function showEmbedWindow()
	{
		if($('player_cage'))
		{
			$('player_cage').setStyle('display', 'none');
		}
		
		// open the modal dialog
		new MochaUI.Window({
			id: 'embedWindow',
			title: 'Embed this Video',
			loadMethod: 'iframe',
			contentURL: this.baseUrl + "embed/" + window.location.href.split('/').pop(),
			type: 'modal',
			width: 550,
			height: 365,
			overlayClosable: true,
			onClose: function() {
				// show the flash again
				if($('player_cage'))
				{
					$('player_cage').setStyle('display', 'block');
				}
			}
		});
	}
});

// get this var in the global namespace
var atl;

// set everything up when the page is loaded
window.addEvent('domready', function(){
	atl = new AptanaTvLib();
	atl.injectSearchBehavior();
});