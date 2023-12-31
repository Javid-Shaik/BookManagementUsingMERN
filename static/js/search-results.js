
document.addEventListener("DOMContentLoaded", () => {
    const resultsList = document.getElementById("results-list");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");

    const itemsPerPage = 10;
    var currentPage = 1;
    const searchResults = JSON.parse(searchData);

    const matchingBooks = searchResults.matchingBooks;

    // console.log(matchingBooks);
    
    function displayResults() {
        resultsList.innerHTML = "";

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        for (let i = startIndex; i < endIndex && i < matchingBooks.length; i++) {
            const book = matchingBooks[i];

            const resultItem = document.createElement("li");

            const description = book.description.length > 100 ? book.description.slice(0, 100) + '.....' : book.description;
            resultItem.innerHTML = `
                <h2>${book.title}</h2>
                <p>Author: ${book.author}</p>
                <p>Description: ${description}</p>
                <p>ISBN: ${book.isbn}</p>
                <img src="/images/${book.cover_image}" alt="${book.title}" class="cover-image">
                <button onclick="addToCart('${book._id}')"><i class="fas fa-cart-plus"></i> </button>
            `;
            resultsList.appendChild(resultItem);
        }
        generatePageButtons();
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = endIndex >= matchingBooks.length;
    }



    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            displayResults();
        }
    }

    function goToNextPage() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        if (startIndex + itemsPerPage < matchingBooks.length) {
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

        
        const totalPages = Math.ceil(matchingBooks.length / itemsPerPage);
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
