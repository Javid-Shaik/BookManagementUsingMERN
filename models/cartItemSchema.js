const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    // Other cart item properties like price per unit, etc.
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
