// Gestión de la galería de certificados
class GalleryManager {
  constructor() {
    this.certificates = []
    this.currentIndex = 0
    this.itemsPerPage = 3

    this.certificateInput = document.getElementById("certificateInput")
    this.uploadBtn = document.getElementById("uploadCertBtn")
    this.display = document.getElementById("certificatesDisplay")
    this.prevBtn = document.getElementById("prevCertBtn")
    this.nextBtn = document.getElementById("nextCertBtn")
    this.counter = document.getElementById("certCounter")

    this.initializeEvents()
  }

  initializeEvents() {
    // Subir certificados
    this.uploadBtn.addEventListener("click", () => {
      this.certificateInput.click()
    })

    this.certificateInput.addEventListener("change", (e) => {
      this.handleFileUpload(e.target.files)
    })

    // Navegación
    this.prevBtn.addEventListener("click", () => {
      this.previousPage()
    })

    this.nextBtn.addEventListener("click", () => {
      this.nextPage()
    })

    // Drag and drop
    this.setupDragAndDrop()
  }

  setupDragAndDrop() {
    const gallery = document.querySelector(".certificates-gallery")

    gallery.addEventListener("dragover", (e) => {
      e.preventDefault()
      gallery.style.borderColor = "var(--primary-color)"
      gallery.style.backgroundColor = "#f1f5f9"
    })

    gallery.addEventListener("dragleave", (e) => {
      e.preventDefault()
      gallery.style.borderColor = "var(--border-color)"
      gallery.style.backgroundColor = "var(--background-color)"
    })

    gallery.addEventListener("drop", (e) => {
      e.preventDefault()
      gallery.style.borderColor = "var(--border-color)"
      gallery.style.backgroundColor = "var(--background-color)"

      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

      if (files.length > 0) {
        this.handleFileUpload(files)
      }
    })
  }

  handleFileUpload(files) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      alert("Por favor selecciona solo archivos de imagen.")
      return
    }

    imageFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB límite
        alert(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        this.addCertificate(e.target.result, file.name)
      }
      reader.readAsDataURL(file)
    })

    // Limpiar input
    this.certificateInput.value = ""
  }

  addCertificate(imageData, fileName) {
    const certificate = {
      id: Date.now() + Math.random(),
      data: imageData,
      name: fileName,
      uploadDate: new Date().toISOString(),
    }

    this.certificates.push(certificate)
    this.updateDisplay()
    this.scheduleAutoSave()
  }

  removeCertificate(certificateId) {
    this.certificates = this.certificates.filter((cert) => cert.id !== certificateId)

    // Ajustar índice si es necesario
    const maxIndex = Math.max(0, Math.ceil(this.certificates.length / this.itemsPerPage) - 1)
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex
    }

    this.updateDisplay()
    this.scheduleAutoSave()
  }

  updateDisplay() {
    if (this.certificates.length === 0) {
      this.showEmptyState()
      return
    }

    this.showCertificates()
    this.updateNavigation()
    this.updateCounter()
  }

  showEmptyState() {
    this.display.innerHTML = `
            <div class="certificate-placeholder">
                <span>📜 Sube tus certificados</span>
            </div>
        `
    this.display.className = "certificates-display empty"
    this.prevBtn.style.display = "none"
    this.nextBtn.style.display = "none"
    this.counter.textContent = ""
  }

  showCertificates() {
    const startIndex = this.currentIndex * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const currentCertificates = this.certificates.slice(startIndex, endIndex)

    this.display.innerHTML = ""
    this.display.className = "certificates-display has-items"

    currentCertificates.forEach((certificate) => {
      const certElement = this.createCertificateElement(certificate)
      this.display.appendChild(certElement)
    })
  }

  createCertificateElement(certificate) {
    const div = document.createElement("div")
    div.className = "certificate-item"

    const img = document.createElement("img")
    img.src = certificate.data
    img.alt = certificate.name
    img.onclick = () => window.modalManager.openModal(certificate.data)

    const deleteBtn = document.createElement("button")
    deleteBtn.className = "delete-cert"
    deleteBtn.innerHTML = "🗑️"
    deleteBtn.title = "Eliminar certificado"
    deleteBtn.onclick = (e) => {
      e.stopPropagation()
      if (confirm("¿Estás seguro de que quieres eliminar este certificado?")) {
        this.removeCertificate(certificate.id)
      }
    }

    div.appendChild(img)
    div.appendChild(deleteBtn)

    return div
  }

  updateNavigation() {
    const totalPages = Math.ceil(this.certificates.length / this.itemsPerPage)

    if (totalPages <= 1) {
      this.prevBtn.style.display = "none"
      this.nextBtn.style.display = "none"
    } else {
      this.prevBtn.style.display = "flex"
      this.nextBtn.style.display = "flex"

      this.prevBtn.disabled = this.currentIndex === 0
      this.nextBtn.disabled = this.currentIndex >= totalPages - 1
    }
  }

  updateCounter() {
    if (this.certificates.length > 0) {
      const totalPages = Math.ceil(this.certificates.length / this.itemsPerPage)
      this.counter.textContent = `${this.currentIndex + 1} de ${totalPages} (${this.certificates.length} certificados)`
    } else {
      this.counter.textContent = ""
    }
  }

  previousPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--
      this.updateDisplay()
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.certificates.length / this.itemsPerPage)
    if (this.currentIndex < totalPages - 1) {
      this.currentIndex++
      this.updateDisplay()
    }
  }

  scheduleAutoSave() {
    window.storageManager.scheduleAutoSave(() => {
      const data = window.storageManager.getCurrentData()
      window.storageManager.saveData(data)
    })
  }

  // Limpiar todos los certificados
  clearAll() {
    this.certificates = []
    this.currentIndex = 0
    this.updateDisplay()
  }
}

// Instancia global
window.galleryManager = new GalleryManager()
