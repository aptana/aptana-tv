Comment = ActiveRecord.create('comments', {
	video_id: 0,
	user_id: 0,
	name: '',
	email: '',
	website: '',
	ip: '',
	body: '',
	approved: false,
	created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true	
});

Comment.belongsTo('Video');
