document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector(".menu");
    const logo = document.querySelector(".logo");

    logo.addEventListener("click", function () {
        menu.classList.toggle("ativo");
    });
});