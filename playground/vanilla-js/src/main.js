let count = 0

const countElement = document.getElementById('count')
const incrementBtn = document.getElementById('increment')
const decrementBtn = document.getElementById('decrement')

function updateCount() {
  countElement.textContent = String(count)
  console.log('Count updated:', count)
}

incrementBtn.addEventListener('click', () => {
  count++
  updateCount()
})

decrementBtn.addEventListener('click', () => {
  count--
  updateCount()
})

console.log('Counter app initialized!')
