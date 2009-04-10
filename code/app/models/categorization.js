Categorization = ActiveRecord.create('categorizations',{
    category_id: 0,
    video_id: 0
});
Categorization.belongsTo('Category',{
    dependent: true
});
Categorization.belongsTo('Video',{
    dependent: true
});