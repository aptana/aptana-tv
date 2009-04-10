Version = ActiveRecord.create('versions',{
    name: '',
    product_id: 0,
    created: {
        type: 'DATETIME'
    },
    updated: {
        type: 'DATETIME'
    },
    is_active: true
});
Version.belongsTo('Product');