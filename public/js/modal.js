// Gestión del modal para ver imágenes
class ModalManager {
  constructor() {
    this.modal = document.getElementById("imageModal")
    this.modalImage = document.getElementById("modalImage")
    this.closeBtn = document.querySelector(".close")

    this.initializeEvents()
  }

  initializeEvents() {
    // Cerrar modal con X
    this.closeBtn.addEventListener("click", () => {
      this.closeModal()
    })

    // Cerrar modal haciendo clic fuera de la imagen
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal()
      }
    })

    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("show")) {
        this.closeModal()
      }
    })

    // Prevenir scroll del body cuando el modal está abierto
    this.modal.addEventListener("wheel", (e) => {
      e.preventDefault()
    })
  }

  openModal(imageSrc) {
    if (!imageSrc) return

    this.modalImage.src = imageSrc
    this.modal.classList.add("show")
    document.body.style.overflow = "hidden"

    // Enfocar el modal para navegación con teclado
    this.modal.focus()
  }

  closeModal() {
    this.modal.classList.remove("show")
    document.body.style.overflow = "auto"
    this.modalImage.src = ""
  }

  // Método para abrir modal con animación suave
  openModalWithAnimation(imageSrc) {
    this.openModal(imageSrc)

    // Agregar clase de animación
    this.modalImage.style.transform = "scale(0.8)"
    this.modalImage.style.opacity = "0"

    setTimeout(() => {
      this.modalImage.style.transform = "scale(1)"
      this.modalImage.style.opacity = "1"
      this.modalImage.style.transition = "all 0.3s ease"
    }, 10)
  }
}

// Instancia global
window.modalManager = new ModalManager()
