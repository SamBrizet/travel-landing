const menuButton = document.querySelector('.menu-button')
const siteNav = document.querySelector('.site-nav')
const reveals = document.querySelectorAll('.reveal')
const slides = Array.from(document.querySelectorAll('.slide'))
const form = document.querySelector('.contact-form')
const formMessage = document.querySelector('.form-message')
let currentSlide = 0

menuButton.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open')
  menuButton.setAttribute('aria-expanded', String(isOpen))
})

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible')
    }
  })
}, { threshold: 0.2 })

reveals.forEach((element) => observer.observe(element))

function renderSlide(index) {
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === index)
  })
}

document.querySelector('[data-prev]').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length
  renderSlide(currentSlide)
})

document.querySelector('[data-next]').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length
  renderSlide(currentSlide)
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(form)
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const destination = String(formData.get('destination') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!name || !email.includes('@') || !destination || message.length < 10) {
    formMessage.textContent = 'Completa todos los campos y agrega un mensaje de al menos 10 caracteres.'
    return
  }

  formMessage.textContent = 'Solicitud enviada. Te contactaremos con una propuesta personalizada.'
  form.reset()
})

renderSlide(currentSlide)