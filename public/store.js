$(function () {
    $('.btn-remove').on('click', removeCartItem); //remove item 
    $('.cart-quantity-input').on('change', quantityChange); //update quantity
    $('.shopbtn').on('click', addCartItem); //add item
    $('.btn-purchase').on('click', purchase); //purchase
});

function removeCartItem(event) {
    var btnClicked = event.target;
    btnClicked.parentElement.parentElement.parentElement.remove();
    updateCartTotal();
}

function quantityChange(event) {
    var inputChanged = event.target;
    if (isNaN(inputChanged.value) || inputChanged.value <= 0) { //is number or <= 0
        inputChanged.value = 1;
    }
    updateCartTotal();
}

function addCartItem(event) {
    var btnClicked = event.target;
    var item = btnClicked.parentElement.parentElement;
    var title = item.getElementsByClassName('desc')[0].innerText;
    var price = item.getElementsByClassName('price')[0].innerText.replace('$', '');
    var imgSrc = item.getElementsByClassName('shop-img')[0].src;
    addItemToCart(title, price, imgSrc);
    updateCartTotal();
}

function purchase() {
    alert('Thank you for your purchase.');
    var cartItems = $('.cart-items');
    cartItems.empty();
    updateCartTotal();
}

function addItemToCart(title, price, imgSrc) {
    var cartRow = document.createElement('div');
    var cartItems = $('.cart-items')[0];
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title');
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart');
            return;
        }
    }
    var cartRowContent = `<div class="row cart-row">
                                <div class="col">
                                    <img class="cart-item-image" src="${imgSrc}" width="50" height="auto">
                                    <span class="cart-item-title">${title}</span>
                                </div>
                                <span class="col cart-price">$${price}</span>
                                <div class="col">
                                    <input class="cart-quantity-input" type="number" value="1">
                                    <button class="btn-remove"><i class="bi bi-x"></i></button>
                                </div>
                            </div>`
    cartRow.innerHTML = cartRowContent;
    cartItems.append(cartRow);
    cartRow.getElementsByClassName('btn-remove')[0].addEventListener('click', removeCartItem);
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChange);
}

function updateCartTotal() {
    var cartContainer = document.getElementsByClassName('cart-items')[0];
    var cartRows = cartContainer.getElementsByClassName('cart-row');
    var total = 0;

    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i];
        var price = parseFloat(cartRow.getElementsByClassName('cart-price')[0].innerText.replace('$', ''));
        var quantity = cartRow.getElementsByClassName('cart-quantity-input')[0].value;
        total += price * quantity;
    }


    total = (Math.round(total * 100) / 100).toFixed(2);
    $('.cart-total-price')[0].innerText = '$' + total;
}