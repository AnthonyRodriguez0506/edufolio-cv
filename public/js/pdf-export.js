// Gestión de exportación a PDF
class PDFExporter {
  constructor() {
    this.exportBtn = document.getElementById("exportBtn")
    this.initializeEvents()
  }

  initializeEvents() {
    if (this.exportBtn) {
      this.exportBtn.addEventListener("click", () => {
        this.exportToPDF()
      })
    }
  }

  async exportToPDF() {
    // Verificar que las librerías estén disponibles
    if (!window.html2canvas) {
      alert("Error: html2canvas no está disponible. Verifica que la librería esté cargada.")
      return
    }

    if (!window.jspdf) {
      alert("Error: jsPDF no está disponible. Verifica que la librería esté cargada.")
      return
    }

    try {
      this.showLoadingState()

      const cvContainer = document.getElementById("cvContainer")
      if (!cvContainer) {
        throw new Error("No se encontró el contenedor del CV")
      }

      const originalStyle = cvContainer.style.cssText

      // Preparar el contenedor para la captura
      this.prepareForCapture(cvContainer)

      // Esperar un momento para que se apliquen los estilos
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Configuración de html2canvas
      const canvas = await window.html2canvas(cvContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: cvContainer.scrollWidth,
        height: cvContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc) => {
          // Asegurar que las imágenes se muestren en el clon
          const clonedContainer = clonedDoc.getElementById("cvContainer")
          if (clonedContainer) {
            const controlButtons = clonedContainer.querySelectorAll(".delete-cert, .gallery-nav")
            controlButtons.forEach((btn) => {
              btn.style.display = "none"
            })
          }
        },
      })

      // Restaurar estilos originales
      cvContainer.style.cssText = originalStyle
      this.restoreAfterCapture(cvContainer)

      // Crear PDF
      const { jsPDF } = window.jspdf
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calcular dimensiones
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Si la imagen es más alta que una página, dividirla
      if (imgHeight > 297) {
        // A4 height in mm
        await this.addMultiPagePDF(pdf, canvas, imgWidth)
      } else {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight)
      }

      // Generar nombre del archivo
      const fileName = this.generateFileName()

      // Descargar PDF
      pdf.save(fileName)

      this.showSuccessMessage()
    } catch (error) {
      console.error("Error al exportar PDF:", error)
      this.showErrorMessage(error.message)
    } finally {
      this.hideLoadingState()
    }
  }

  prepareForCapture(container) {
    // Asegurar que todos los elementos sean visibles
    container.style.width = "auto"
    container.style.height = "auto"
    container.style.overflow = "visible"
    container.style.transform = "none"

    // Ocultar botones de control temporalmente
    const controlButtons = container.querySelectorAll(".delete-cert, .gallery-nav")
    controlButtons.forEach((btn) => {
      btn.style.display = "none"
    })

    // Asegurar que las imágenes estén cargadas
    const images = container.querySelectorAll("img")
    images.forEach((img) => {
      if (img.src.startsWith("data:")) {
        img.crossOrigin = "anonymous"
      }
      // Asegurar que la imagen tenga dimensiones
      if (!img.style.width && !img.style.height) {
        img.style.maxWidth = "100%"
        img.style.height = "auto"
      }
    })

    // Forzar el renderizado de elementos contenteditable
    const editableElements = container.querySelectorAll("[contenteditable]")
    editableElements.forEach((element) => {
      element.setAttribute("contenteditable", "false")
    })
  }

  restoreAfterCapture(container) {
    // Restaurar botones de control
    const controlButtons = container.querySelectorAll(".delete-cert")
    controlButtons.forEach((btn) => {
      btn.style.display = ""
    })

    const navButtons = container.querySelectorAll(".gallery-nav")
    navButtons.forEach((btn) => {
      btn.style.display = ""
    })

    // Restaurar contenteditable
    const editableElements = container.querySelectorAll(".editable")
    editableElements.forEach((element) => {
      element.setAttribute("contenteditable", "true")
    })
  }

  async addMultiPagePDF(pdf, canvas, imgWidth) {
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const totalPages = Math.ceil(imgHeight / pageHeight)

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage()
      }

      const yOffset = -(i * pageHeight * canvas.width) / imgWidth
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, yOffset, imgWidth, imgHeight)
    }
  }

  generateFileName() {
    const nameElement = document.getElementById("fullName")
    const name = nameElement ? nameElement.textContent.trim() : "CV"
    const date = new Date().toISOString().split("T")[0]
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    return `${cleanName || "CV"}_${date}.pdf`
  }

  showLoadingState() {
    if (this.exportBtn) {
      this.exportBtn.disabled = true
      this.exportBtn.innerHTML = "⏳ Generando PDF..."
    }
  }

  hideLoadingState() {
    if (this.exportBtn) {
      this.exportBtn.disabled = false
      this.exportBtn.innerHTML = "📄 Exportar PDF"
    }
  }

  showSuccessMessage() {
    this.showMessage("✅ PDF generado exitosamente", "var(--success-color)", 3000)
  }

  showErrorMessage(errorMsg = "Error desconocido") {
    this.showMessage(`❌ Error al generar PDF: ${errorMsg}`, "var(--danger-color)", 5000)
  }

  showMessage(text, backgroundColor, duration) {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector(".pdf-message")
    if (existingMessage) {
      existingMessage.remove()
    }

    const message = document.createElement("div")
    message.className = "pdf-message"
    message.innerHTML = text
    message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `

    document.body.appendChild(message)

    setTimeout(() => {
      if (message.parentNode) {
        message.remove()
      }
    }, duration)
  }
}

// Agregar animación CSS para los mensajes
if (!document.querySelector("#pdf-animations")) {
  const style = document.createElement("style")
  style.id = "pdf-animations"
  style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `
  document.head.appendChild(style)
}

// Instancia global
window.pdfExporter = new PDFExporter()
