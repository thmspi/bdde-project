document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.querySelector('.searchicon1');
    const searchInput = document.querySelector('.search input[type="text"]');

    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', () => {
            // Wait a bit to make sure UI elements like `.search` are visible if toggled
            setTimeout(() => {
                searchInput.focus();
                searchInput.select();
            }, 100); // adjust delay if needed
        });
    }
});