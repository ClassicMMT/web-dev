const navigationContainer = document.querySelector(".navigation_container");
const menu = document.querySelector(".navigation_menu");
const border = document.querySelector(".navigation_bar_border");
const button = document.querySelector(".navigation_menu_button");
const navigationLogo = document.querySelector(".navigation_logo");

button.addEventListener("click", () => {
  //adds expanded if not exists, otherwise removes
  menu.classList.toggle("expanded");
  border.classList.toggle("expanded");
  document
    .querySelector("#navigation_toggle_bars")
    .classList.toggle("expanded");

  if (border.classList.contains("expanded")) {
    const rightXOfButton = button.getBoundingClientRect().right;
    const navLink = document.querySelector(".navigation_item");
    const leftOfAbout = navLink.getBoundingClientRect().left;
    border.style.width = rightXOfButton - leftOfAbout + "px";
  } else {
    border.style.width = "80px";
  }
});
