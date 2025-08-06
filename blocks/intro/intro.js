export default function decorate(block) {
  const intro = document.createElement('div');
  intro.classList.add('intro');
  intro.innerHTML = block.innerHTML;
}
