
document.addEventListener("DOMContentLoaded", () => {
    const resultsList = document.getElementById("books-list");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");

    const itemsPerPage = 3;
    var currentPage = 1;
    const bookList = JSON.parse(books);
    const user = JSON.parse(sessionUser);

    // console.log(bookList);
    
    function displayResults() {
        resultsList.innerHTML = "";

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        for (let i = startIndex; i < endIndex && i < bookList.length; i++) {
            const book = bookList[i];

            const resultItem = document.createElement("li");

            const description = book.description.length > 100 ? book.description.slice(0, 100) + '.....' : book.description;
            resultItem.innerHTML = `
                <li>
                    <h2>${ book.title }</h2>
                    <p>Author: ${ book.author }</p>
                    <p>ISBN: ${ book.isbn }</p>
                    <button onclick="showDetails('${ book._id }')" id="show-details-btn-${ book._id }"><i class="fas fa-info-circle"></i></button>
                    <button onclick="addToCart('${ book._id }','${ user.user_id }')"><i class="fas fa-cart-plus"></i> </button>
                    <div class="modal" id="myModal${ book._id }">
                        <div class="modal-content">
                            <span class="close" id="closeModal${book._id}">&times;</span>
                            <h2>Description</h2>
                            <p>${ description }</p>
                            <button id="closeModalBtn${book._id}">Close</button>
                        </div>
                    </div>

                    
                </li>`;
            resultsList.appendChild(resultItem);
        }
        generatePageButtons();
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = endIndex >= bookList.length;
    }


    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            displayResults();
        }
    }

    function goToNextPage() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        if (startIndex + itemsPerPage < bookList.length) {
            currentPage++;
            displayResults();
        }
    }
    function goToPage(pageNumber) {
        currentPage = pageNumber;
        displayResults();
    }


    // Function to generate page number buttons
    function generatePageButtons() {
        const pageNumContainer = document.getElementById("page-num-container");
        pageNumContainer.innerHTML = ""; // Clear existing buttons

        
        const totalPages = Math.ceil(bookList.length / itemsPerPage);
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

    // Initial display
    displayResults();

    
});



