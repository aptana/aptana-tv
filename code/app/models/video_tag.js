VideoTag = ActiveRecord.create('video_tags', {
	video_id: 0,
	tag_id: 0
});
VideoTag.belongsTo('Tag',{
    dependent: true
});
VideoTag.belongsTo('Video',{
    dependent: true
});
