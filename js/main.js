// Archivo principal - Inicialización y eventos generales
class EdufolioApp {
  constructor() {
    this.initializeApp()
    this.setupEventListeners()
    this.loadSavedData()
    this.setupAutoSave()
  }

  initializeApp() {
    console.log("🚀 Iniciando Edufolio...")

    // Verificar que todas las dependencias estén cargadas
    if (!window.storageManager || !window.modalManager || !window.galleryManager || !window.pdfExporter) {
      console.error("Error: No se pudieron cargar todas las dependencias")
      return
    }

    console.log("✅ Todas las dependencias cargadas correctamente")
  }

  setupEventListeners() {
    // Botón limpiar todo
    const clearBtn = document.getElementById("clearBtn")
    clearBtn.addEventListener("click", () => {
      this.clearAllData()
    })

    // Foto de perfil
    this.setupProfilePhotoEvents()

    // Botones para agregar secciones
    this.setupSectionButtons()

    // Auto-guardado en campos editables
    this.setupEditableFields()

    // Eventos de teclado globales
    this.setupKeyboardEvents()
  }

  setupProfilePhotoEvents() {
    const uploadBtn = document.getElementById("uploadPhotoBtn")
    const deleteBtn = document.getElementById("deletePhotoBtn")
    const photoInput = document.getElementById("profilePhotoInput")
    const photoDisplay = document.getElementById("profilePhotoDisplay")

    uploadBtn.addEventListener("click", () => {
      photoInput.click()
    })

    photoInput.addEventListener("change", (e) => {
      this.handleProfilePhotoUpload(e.target.files[0])
    })

    deleteBtn.addEventListener("click", () => {
      this.deleteProfilePhoto()
    })

    // Click en foto para ver en modal
    photoDisplay.addEventListener("click", (e) => {
      const img = photoDisplay.querySelector("img")
      if (img) {
        window.modalManager.openModal(img.src)
      }
    })
  }

  setupSectionButtons() {
    // Agregar experiencia
    const addExperienceBtn = document.getElementById("addExperienceBtn")
    addExperienceBtn.addEventListener("click", () => {
      this.addExperienceItem()
    })

    // Agregar educación
    const addEducationBtn = document.getElementById("addEducationBtn")
    addEducationBtn.addEventListener("click", () => {
      this.addEducationItem()
    })
  }

  setupEditableFields() {
    const editableElements = document.querySelectorAll(".editable")

    editableElements.forEach((element) => {
      // Auto-guardado al perder el foco
      element.addEventListener("blur", () => {
        this.scheduleAutoSave()
      })

      // Auto-guardado al escribir (con debounce)
      element.addEventListener("input", () => {
        this.scheduleAutoSave()
      })

      // Mejorar UX de placeholders
      this.setupPlaceholderBehavior(element)
    })
  }

  setupPlaceholderBehavior(element) {
    element.addEventListener("focus", () => {
      if (element.textContent.trim() === "") {
        element.classList.add("focused")
      }
    })

    element.addEventListener("blur", () => {
      element.classList.remove("focused")
    })
  }

  setupKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+S para guardar manualmente
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        this.saveData()
        this.showSaveConfirmation()
      }

      // Ctrl+E para exportar PDF
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault()
        window.pdfExporter.exportToPDF()
      }
    })
  }

  handleProfilePhotoUpload(file) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB límite
      alert("La imagen es demasiado grande. Máximo 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      this.setProfilePhoto(e.target.result)
      this.scheduleAutoSave()
    }
    reader.readAsDataURL(file)
  }

  setProfilePhoto(imageData) {
    const photoDisplay = document.getElementById("profilePhotoDisplay")
    const deleteBtn = document.getElementById("deletePhotoBtn")

    // Limpiar contenido anterior
    photoDisplay.innerHTML = ""

    // Crear imagen
    const img = document.createElement("img")
    img.src = imageData
    img.alt = "Foto de perfil"
    img.onclick = () => window.modalManager.openModal(imageData)

    photoDisplay.appendChild(img)
    deleteBtn.style.display = "inline-block"
  }

  deleteProfilePhoto() {
    if (!confirm("¿Estás seguro de que quieres eliminar la foto de perfil?")) {
      return
    }

    const photoDisplay = document.getElementById("profilePhotoDisplay")
    const deleteBtn = document.getElementById("deletePhotoBtn")

    photoDisplay.innerHTML = '<span class="photo-placeholder">📷 Foto</span>'
    deleteBtn.style.display = "none"

    this.scheduleAutoSave()
  }

  addExperienceItem() {
    const container = document.getElementById("experienceContainer")
    const newItem = window.storageManager.createExperienceItem()

    container.appendChild(newItem)

    // Enfocar el primer campo editable
    const firstEditable = newItem.querySelector(".editable")
    if (firstEditable) {
      firstEditable.focus()
    }

    // Configurar eventos para los nuevos elementos
    this.setupEditableFieldsForElement(newItem)
    this.scheduleAutoSave()
  }

  addEducationItem() {
    const container = document.getElementById("educationContainer")
    const newItem = window.storageManager.createEducationItem()

    container.appendChild(newItem)

    // Enfocar el primer campo editable
    const firstEditable = newItem.querySelector(".editable")
    if (firstEditable) {
      firstEditable.focus()
    }

    // Configurar eventos para los nuevos elementos
    this.setupEditableFieldsForElement(newItem)
    this.scheduleAutoSave()
  }

  setupEditableFieldsForElement(element) {
    const editableElements = element.querySelectorAll(".editable")

    editableElements.forEach((editable) => {
      editable.addEventListener("blur", () => {
        this.scheduleAutoSave()
      })

      editable.addEventListener("input", () => {
        this.scheduleAutoSave()
      })

      this.setupPlaceholderBehavior(editable)
    })
  }

  clearAllData() {
    const confirmMessage = `
            ¿Estás seguro de que quieres limpiar todos los datos?
            
            Esto eliminará:
            • Toda la información personal
            • Experiencia laboral
            • Educación
            • Habilidades
            • Foto de perfil
            • Todos los certificados
            
            Esta acción no se puede deshacer.
        `

    if (!confirm(confirmMessage)) {
      return
    }

    // Limpiar localStorage
    window.storageManager.clearData()

    // Recargar la página para restaurar el estado inicial
    location.reload()
  }

  loadSavedData() {
    const savedData = window.storageManager.loadData()
    if (savedData) {
      console.log("📂 Cargando datos guardados...")
      window.storageManager.loadDataToForm(savedData)
      console.log("✅ Datos cargados correctamente")
    } else {
      console.log("ℹ️ No hay datos guardados previamente")
    }
  }

  saveData() {
    try {
      const data = window.storageManager.getCurrentData()
      const success = window.storageManager.saveData(data)
      if (success) {
        console.log("💾 Datos guardados automáticamente")
      }
    } catch (error) {
      console.error("Error al guardar datos:", error)
    }
  }

  scheduleAutoSave() {
    // Auto-guardado cada 30 segundos
    setInterval(() => {
      this.saveData()
    }, 30000)

    // Auto-guardado al cambiar de pestaña o cerrar
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.saveData()
      }
    })
  }

  showSaveConfirmation() {
    const message = document.createElement("div")
    message.innerHTML = "💾 Datos guardados"
    message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--success-color);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `

    document.body.appendChild(message)

    setTimeout(() => {
      message.remove()
    }, 2000)
  }

  // Método para mostrar estadísticas de la aplicación
  showStats() {
    const data = window.storageManager.getCurrentData()
    const stats = {
      experienceItems: data.experience ? data.experience.length : 0,
      educationItems: data.education ? data.education.length : 0,
      certificates: data.certificates ? data.certificates.length : 0,
      hasProfilePhoto: !!data.profilePhoto,
      lastUpdated: data.lastUpdated,
    }

    console.log("📊 Estadísticas de Edufolio:", stats)
    return stats
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.edufolioApp = new EdufolioApp()
  console.log("🎉 Edufolio iniciado correctamente")
})

// Guardar datos antes de cerrar la página
window.addEventListener("beforeunload", () => {
  if (window.edufolioApp) {
    window.edufolioApp.saveData()
  }
})

// Manejar errores globales
window.addEventListener("error", (e) => {
  console.error("Error en Edufolio:", e.error)
})

// Exportar funciones útiles para debugging
window.edufolioDebug = {
  showStats: () => window.edufolioApp?.showStats(),
  clearData: () => window.storageManager?.clearData(),
  exportData: () => window.storageManager?.getCurrentData(),
  importData: (data) => window.storageManager?.loadDataToForm(data),
}
