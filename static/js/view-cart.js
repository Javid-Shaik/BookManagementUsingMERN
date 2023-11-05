document.addEventListener("DOMContentLoaded", () => {
    const cartList = document.getElementById("cart-list");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageNumContainer = document.getElementById("page-num-container");

    const itemsPerPage = 10;
    let currentPage = 1;
    const cartData = JSON.parse(cart); // Replace with your cart data JSON.
    const cartBooks = cartData.items; 

    function displayCartItems() {
        cartList.innerHTML = "";
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        for (let i = startIndex; i < endIndex && i<cartBooks.length; i++) {
            const item = cartBooks[i];
            // console.log(item);
            const cartItems = document.createElement("li");

            // Create and append the item's content (e.g., title, author, image, etc.)

            const itemHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <img src="/cart/cover-image/${item.bookId._id}" alt="${item.bookId.title}" class="img-fluid">
                    </div>
                    <div class="col-md-6">
                        <h5>${item.bookId?.title ?? 'N/A'}</h5>
                        <h5>${item.title}</h5>
                        <p>Author: ${item.bookId?.author ?? 'N/A'}</p>
                        <p>ISBN: ${item.bookId?.isbn ?? 'N/A'}</p>
                    </div>
                    <div class="col-md-3">
                        <p>Quantity: ${item.quantity}</p>
                        <button onclick="removeFromCart('${item._id}')" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;

            cartItems.innerHTML = itemHTML;
            cartList.appendChild(cartItems);
        }

        generatePageButtons();
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = endIndex >= cartBooks.length;
    }

    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            displayCartItems();
        }
    }

    function goToNextPage() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        if (startIndex + itemsPerPage < cartBooks.length) {
            currentPage++;
            displayCartItems();
        }
    }

    function goToPage(pageNumber) {
        currentPage = pageNumber;
        displayCartItems();
    }

    function generatePageButtons() {
        pageNumContainer.innerHTML = "";

        const totalPages = Math.ceil(cartBooks.length / itemsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const pageNumberButton = document.createElement("button");
            pageNumberButton.textContent = i;
            pageNumberButton.classList.add('page-num');

            let page = i;
            pageNumberButton.addEventListener("click", () => {
                goToPage(page);
            });
            if(i === currentPage ) {
                pageNumberButton.classList.add('disabled');
            }

            pageNumContainer.appendChild(pageNumberButton);
        }
    }

    prevPageButton.addEventListener("click", goToPrevPage);
    nextPageButton.addEventListener("click", goToNextPage);

    displayCartItems();
});
