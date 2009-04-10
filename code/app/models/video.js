Video = ActiveRecord.create('videos',{
    video_attachment_id: 0,
    user_id: 0,
    product_id: 0,
    version_id: 0,
    name: '',
    slug: '',
    source_url: '',
    related_url: '',
    description: {
        type: 'TEXT'
    },
	image_file: '',
    date_published: {
        type: 'DATETIME'
    },
	view_count: 0,
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});
Video.actsAsMeta();
Video.belongsTo('Version');
Video.belongsTo('Product');
Video.belongsTo('User');
Video.belongsTo('VideoAttachment');
Video.hasMany('Categorization');
Video.hasMany('categories',{
    through: 'categorizations'
});
Video.hasMany('VideoTag');
Video.hasMany('tags', {
	through: 'VideoTag'
});
Video.hasMany('Comment');

Video.prototype.toSerializableObject = function toSerializableObject()
{
    var version = this.getVersion();
    var product = this.getProduct();
    var user = this.getUser();
    var video_attachment = this.getVideoAttachment();
    var categories = this.getCategoryList().map(function category_iterator(category){
        return category.toObject();
    });
    return ActiveSupport.extend(this.toObject(),{
        meta: this.meta.toObject(),
        version: version ? version.toObject() : version,
        product: product ? product.toObject() : product,
        user: user ? user.toObject() : user,
        video_attachment: video_attachment ? video_attachment.toObject() : video_attachment,
        categories: categories
    });
};