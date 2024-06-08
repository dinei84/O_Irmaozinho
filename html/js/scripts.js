document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');

    menuToggle.addEventListener('click', () => {
        const ul = navbar.querySelector('ul');
        ul.classList.toggle('active');
        
        if (ul.classList.contains('active')) {
            ul.style.maxHeight = ul.scrollHeight + "px";
        } else {
            ul.style.maxHeight = "0px";
        }
    });
});