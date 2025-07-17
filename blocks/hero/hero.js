export default function decorate(block) {
  const elemant = block.querySelectorAll('p');
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image');

  const title = document.createElement('h1');
  title.innerHTML = elemant[1].innerHTML;
  elemant[1].parentNode.replaceChild(title, elemant[1]);
}
