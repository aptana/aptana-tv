Tag = ActiveRecord.create('tags',{
    tag: '',
	slug: '',
    count: 0,
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});

Tag.hasMany('VideoTag');
Tag.hasMany('videos', {
	through: 'VideoTag'
});
