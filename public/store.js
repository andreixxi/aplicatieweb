if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}
function ready() {
    //remove item
    var removeCartItemButtons = document.getElementsByClassName('btn-remove');
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    //update quantity
    var quantityInputs = document.getElementsByClassName('cart-quantity-input');
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener('change', quantityChange);
    }

    //add item
    var addToCartButtons = document.getElementsByClassName('shopbtn');
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i];
        button.addEventListener('click', addCartItem);
    }

    //purchase
    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchase)
    
    $('.shop-form').hide();
}

function removeCartItem(event) {
    var btnClicked = event.target;
    btnClicked.parentElement.parentElement.parentElement.remove();
    updateCartTotal();
}

function quantityChange(event) {
    var inputChanged = event.target;
    if (isNaN(inputChanged.value) || inputChanged.value <= 0) { // input is not number or <= 0
        inputChanged.value = 1;
    }
    updateCartTotal();
}

function addCartItem(event) {
    var btnClicked = event.target;
    var item = btnClicked.parentElement.parentElement;
    var title = item.getElementsByClassName('desc')[0].innerText;
    var price = item.getElementsByClassName('price')[0].innerText;
    var imgSrc = item.getElementsByClassName('shop-img')[0].src;
    var id = item.dataset.itemId;
    addItemToCart(title, price, imgSrc, id);
    updateCartTotal();
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    closed: function () {
        $('.shop-form').hide(500);
        $('.shop-container').show(500);
    },
    token: function (token) {
        var items = [];
        var customer = {};

        var name = $(".shop-form input[name='name']").val();
        var email = $(".shop-form input[name='email']").val();

        customer.name = name;
        customer.email = email;

        var cartItemContainer = document.getElementsByClassName('cart-items')[0];
        var cartRows = cartItemContainer.getElementsByClassName('cart-row');

        for (var i = 0; i < cartRows.length; i++) {
            var cartRow = cartRows[i];
            var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
            var quantity = quantityElement.value;
            var id = cartRow.dataset.itemId;
            items.push({
                id: id,
                quantity: quantity
            });
        }

        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items,
                customer: customer
            })
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            alert(data.message);

            //empty cart
            var cartItems = $('.cart-items');
            cartItems.empty();

            //show shop again
            $('.shop-container').show(500);
            // cartRow.getElementsByClassName('btn-remove')[0].addEventListener('click', removeCartItem);
            // cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChange);
            updateCartTotal();
        }).catch(function (error) {
            console.error(error);
            alert('There has been an error, please try again later.');
        });
    }
});

function purchase() {
    var price = parseFloat(document.getElementsByClassName('cart-total-price')[0].innerText.replace('$', '')) * 100;
    if (price) {
        $('.shop-form').show(500);
        $('.shop-container').hide(500);
        $('#shop-confirm').on('click', function (event) {
            event.preventDefault();
            var valid = true; //check if values have been completed
            $('.shop-form input').each(function () {
                if ($(this).val() == "") {
                    valid = false;
                }
            });
            if (valid) {
                $('.shop-form').hide(500);
                stripeHandler.open({
                    amount: price,
                });
            }
        });
        $('.shop-form input').each(function () {
            $(this).val(''); //empty for future purchases 
        });
        // go back
        $('#shop-back').on('click', function (event) {
            event.preventDefault();
            $('.shop-form').hide(500);
            $('.shop-container').show(500);
        });
    } else {
        alert('EMPTY CART');
    }
}

function addItemToCart(title, price, imgSrc, id) {
    var cartRow = document.createElement('div');
    cartRow.classList.add('cart-row');
    cartRow.dataset.itemId = id;
    var cartItems = document.getElementsByClassName('cart-items')[0];
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title');
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart');
            return;
        }
    }
    var cartRowContent = `
        <div class="cart-item col">
            <img class="cart-item-image" src="${imgSrc}" width="50" height="auto">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="col cart-price">${price}</span>
        <div class="col">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn-remove"><i class="bi bi-x"></i></button>
        </div>
        `
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
        total = total + price * quantity;
    }
    total = (Math.round(total * 100) / 100).toFixed(2);
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total;
}