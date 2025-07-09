// Gestión de exportación a PDF
import html2canvas from "html2canvas" // Import html2canvas

class PDFExporter {
  constructor() {
    this.exportBtn = document.getElementById("exportBtn")
    this.initializeEvents()
  }

  initializeEvents() {
    this.exportBtn.addEventListener("click", () => {
      this.exportToPDF()
    })
  }

  async exportToPDF() {
    try {
      this.showLoadingState()

      const cvContainer = document.getElementById("cvContainer")
      const originalStyle = cvContainer.style.cssText

      // Preparar el contenedor para la captura
      this.prepareForCapture(cvContainer)

      // Configuración de html2canvas
      const canvas = await html2canvas(cvContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: cvContainer.scrollWidth,
        height: cvContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      })

      // Restaurar estilos originales
      cvContainer.style.cssText = originalStyle

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
      this.showErrorMessage()
    } finally {
      this.hideLoadingState()
    }
  }

  prepareForCapture(container) {
    // Asegurar que todos los elementos sean visibles
    container.style.width = "auto"
    container.style.height = "auto"
    container.style.overflow = "visible"

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
    const name = document.getElementById("fullName").textContent.trim() || "CV"
    const date = new Date().toISOString().split("T")[0]
    return `${name.replace(/\s+/g, "_")}_CV_${date}.pdf`
  }

  showLoadingState() {
    this.exportBtn.disabled = true
    this.exportBtn.innerHTML = "⏳ Generando PDF..."
  }

  hideLoadingState() {
    this.exportBtn.disabled = false
    this.exportBtn.innerHTML = "📄 Exportar PDF"
  }

  showSuccessMessage() {
    const message = document.createElement("div")
    message.className = "success-message"
    message.innerHTML = "✅ PDF generado exitosamente"
    message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `

    document.body.appendChild(message)

    setTimeout(() => {
      message.remove()
    }, 3000)
  }

  showErrorMessage() {
    const message = document.createElement("div")
    message.className = "error-message"
    message.innerHTML = "❌ Error al generar PDF"
    message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `

    document.body.appendChild(message)

    setTimeout(() => {
      message.remove()
    }, 5000)
  }
}

// Agregar animación CSS para los mensajes
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
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

// Instancia global
window.pdfExporter = new PDFExporter()
