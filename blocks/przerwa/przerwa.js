export default function decorate(block) {
  const przerwa = document.createElement('div');
  przerwa.classList.add('przerwa');
  przerwa.innerHTML = block.innerHTML;
}
