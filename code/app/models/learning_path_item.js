LearningPathItem = ActiveRecord.create('learning_path_items', {
    learning_path_id: 0,
    video_id: 0,
	play_order: {
		type: 'TINYINT(1)',
		value: 0	
	}
});
LearningPathItem.belongsTo('LearningPath', {
    dependent: true
});
LearningPathItem.belongsTo('Video', {
    dependent: true
});