const menuButton = document.querySelector('.menu-button')
const siteNav = document.querySelector('.site-nav')
const searchForm = document.querySelector('#trip-search-form')
const searchMessage = document.querySelector('#search-message')
const destinationCards = Array.from(document.querySelectorAll('.destination-card'))
const resultCount = document.querySelector('#result-count')
const savedFilter = document.querySelector('.saved-filter')
const savedCount = document.querySelector('.saved-count')
const emptyState = document.querySelector('.empty-state')
const clearFilters = document.querySelector('.clear-filters')
const slides = Array.from(document.querySelectorAll('.slide'))
const form = document.querySelector('.contact-form')
const formMessage = document.querySelector('.form-message')
const lightbox = document.querySelector('.lightbox')
let currentSlide = 0
let showSavedOnly = false
let selectedDestination = ''
let savedDestinations = []

try {
  savedDestinations = JSON.parse(localStorage.getItem('aurora-saved-destinations') || '[]')
  if (!Array.isArray(savedDestinations)) savedDestinations = []
} catch {
  savedDestinations = []
}

function closeMenu() {
  siteNav.classList.remove('is-open')
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.setAttribute('aria-label', 'Abrir menú')
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') !== 'true'
  siteNav.classList.toggle('is-open', isOpen)
  menuButton.setAttribute('aria-expanded', String(isOpen))
  menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú')
})

siteNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu()
})

const dateInput = searchForm.elements.date
const today = new Date()
dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function updateDestinations() {
  let visibleCount = 0

  destinationCards.forEach((card) => {
    const matchesDestination = !selectedDestination || card.dataset.destination === selectedDestination
    const matchesSaved = !showSavedOnly || savedDestinations.includes(card.dataset.destination)
    const isVisible = matchesDestination && matchesSaved
    card.hidden = !isVisible
    if (isVisible) visibleCount += 1
  })

  resultCount.textContent = String(visibleCount)
  savedCount.textContent = String(savedDestinations.length)
  emptyState.hidden = visibleCount > 0
}

function persistFavorites() {
  try {
    localStorage.setItem('aurora-saved-destinations', JSON.stringify(savedDestinations))
  } catch {
    searchMessage.textContent = 'No fue posible guardar favoritos en este navegador.'
  }
}

function renderFavorites() {
  destinationCards.forEach((card) => {
    const button = card.querySelector('.favorite-button')
    const isSaved = savedDestinations.includes(card.dataset.destination)
    button.setAttribute('aria-pressed', String(isSaved))
    button.setAttribute('aria-label', `${isSaved ? 'Quitar' : 'Guardar'} ${card.dataset.name} ${isSaved ? 'de' : 'en'} favoritos`)
    button.textContent = isSaved ? '♥' : '♡'
  })
  updateDestinations()
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  selectedDestination = searchForm.elements.destination.value
  const chosenDate = searchForm.elements.date.value
  const guests = searchForm.elements.guests.selectedOptions[0].textContent
  updateDestinations()
  searchMessage.textContent = selectedDestination
    ? `Mostrando ${resultCount.textContent} destino para tu búsqueda. ${chosenDate ? `Salida: ${chosenDate}.` : ''} ${guests}.`
    : `Explora ${resultCount.textContent} destinos. ${chosenDate ? `Salida: ${chosenDate}.` : ''} ${guests}.`

  const contactDestination = form.elements.destination
  const chosenLabel = searchForm.elements.destination.selectedOptions[0].textContent
  if (selectedDestination) contactDestination.value = chosenLabel
  if (chosenDate || guests) {
    const tripDetails = [chosenDate ? `Fecha estimada: ${chosenDate}` : '', `Viajeros: ${guests}`].filter(Boolean).join('\n')
    form.elements.message.value = tripDetails
  }

  document.querySelector('#destinos').scrollIntoView({ behavior: 'smooth', block: 'start' })
})

savedFilter.addEventListener('click', () => {
  showSavedOnly = !showSavedOnly
  savedFilter.setAttribute('aria-pressed', String(showSavedOnly))
  savedFilter.firstChild.textContent = showSavedOnly ? '♥ ' : '♡ '
  updateDestinations()
  searchMessage.textContent = showSavedOnly ? `Mostrando ${resultCount.textContent} destinos guardados.` : ''
})

destinationCards.forEach((card) => {
  card.querySelector('.favorite-button').addEventListener('click', () => {
    const destination = card.dataset.destination
    savedDestinations = savedDestinations.includes(destination)
      ? savedDestinations.filter((item) => item !== destination)
      : [...savedDestinations, destination]
    persistFavorites()
    renderFavorites()
  })

  card.querySelector('.destination-card__image').addEventListener('click', () => {
    form.elements.destination.value = card.dataset.name
  })
})

clearFilters.addEventListener('click', () => {
  selectedDestination = ''
  showSavedOnly = false
  searchForm.reset()
  savedFilter.setAttribute('aria-pressed', 'false')
  savedFilter.firstChild.textContent = '♡ '
  searchMessage.textContent = ''
  updateDestinations()
})

function renderSlide(index) {
  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === index
    slide.hidden = !isActive
    slide.classList.toggle('is-active', isActive)
  })
  document.querySelector('[data-current-slide]').textContent = String(index + 1).padStart(2, '0')
}

document.querySelector('[data-prev]').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length
  renderSlide(currentSlide)
})

document.querySelector('[data-next]').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length
  renderSlide(currentSlide)
})

document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    const image = lightbox.querySelector('img')
    const thumbnail = item.querySelector('img')
    image.src = item.dataset.full
    image.alt = thumbnail.alt
    lightbox.showModal()
  })
})

lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close())
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close()
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  formMessage.classList.remove('is-error')

  if (!form.checkValidity()) {
    form.reportValidity()
    formMessage.textContent = 'Revisa tu nombre, correo, destino y mensaje antes de continuar.'
    formMessage.classList.add('is-error')
    return
  }

  formMessage.textContent = 'Tu solicitud está completa. Esta demostración no envía datos; conecta un servicio de contacto para recibirla.'
})

renderFavorites()
renderSlide(currentSlide)