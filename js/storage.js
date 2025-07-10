// Gestión de localStorage
class StorageManager {
  constructor() {
    this.storageKey = "edufolio_data"
    this.autoSaveDelay = 1000 // 1 segundo
    this.autoSaveTimer = null
  }

  // Guardar datos
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      console.log("Datos guardados correctamente")
      return true
    } catch (error) {
      console.error("Error al guardar datos:", error)
      alert("Error al guardar los datos. El almacenamiento local puede estar lleno.")
      return false
    }
  }

  // Cargar datos
  loadData() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error al cargar datos:", error)
      return null
    }
  }

  // Limpiar todos los datos
  clearData() {
    try {
      localStorage.removeItem(this.storageKey)
      console.log("Datos eliminados correctamente")
      return true
    } catch (error) {
      console.error("Error al eliminar datos:", error)
      return false
    }
  }

  // Auto-guardado con debounce
  scheduleAutoSave(callback) {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
    }

    this.autoSaveTimer = setTimeout(() => {
      callback()
    }, this.autoSaveDelay)
  }

  // Obtener datos actuales del formulario
  getCurrentData() {
    const data = {
      // Información personal
      fullName: this.getTextContent("fullName"),
      profession: this.getTextContent("profession"),
      email: this.getTextContent("email"),
      phone: this.getTextContent("phone"),
      location: this.getTextContent("location"),
      website: this.getTextContent("website"),
      summary: this.getTextContent("summary"),
      skills: this.getTextContent("skills"),

      // Foto de perfil
      profilePhoto: this.getProfilePhotoData(),

      // Experiencia laboral
      experience: this.getExperienceData(),

      // Educación
      education: this.getEducationData(),

      // Certificados
      certificates: this.getCertificatesData(),

      // Timestamp
      lastUpdated: new Date().toISOString(),
    }

    return data
  }

  // Helper para obtener contenido de texto
  getTextContent(id) {
    const element = document.getElementById(id)
    return element ? element.textContent.trim() : ""
  }

  // Obtener datos de la foto de perfil
  getProfilePhotoData() {
    const photoDisplay = document.getElementById("profilePhotoDisplay")
    const img = photoDisplay ? photoDisplay.querySelector("img") : null
    return img ? img.src : null
  }

  // Obtener datos de experiencia
  getExperienceData() {
    const experiences = []
    const experienceItems = document.querySelectorAll(".experience-item")

    experienceItems.forEach((item) => {
      const jobTitle = item.querySelector(".job-title")?.textContent.trim() || ""
      const jobPeriod = item.querySelector(".job-period")?.textContent.trim() || ""
      const companyName = item.querySelector(".company-name")?.textContent.trim() || ""
      const jobDescription = item.querySelector(".job-description")?.innerHTML || ""

      if (jobTitle || companyName) {
        experiences.push({
          jobTitle,
          jobPeriod,
          companyName,
          jobDescription,
        })
      }
    })

    return experiences
  }

  // Obtener datos de educación
  getEducationData() {
    const educations = []
    const educationItems = document.querySelectorAll(".education-item")

    educationItems.forEach((item) => {
      const degreeTitle = item.querySelector(".degree-title")?.textContent.trim() || ""
      const educationPeriod = item.querySelector(".education-period")?.textContent.trim() || ""
      const institutionName = item.querySelector(".institution-name")?.textContent.trim() || ""

      if (degreeTitle || institutionName) {
        educations.push({
          degreeTitle,
          educationPeriod,
          institutionName,
        })
      }
    })

    return educations
  }

  // Obtener datos de certificados
  getCertificatesData() {
    return window.galleryManager ? window.galleryManager.certificates : []
  }

  // Cargar datos en el formulario
  loadDataToForm(data) {
    if (!data) return

    // Información personal
    this.setElementContent("fullName", data.fullName)
    this.setElementContent("profession", data.profession)
    this.setElementContent("email", data.email)
    this.setElementContent("phone", data.phone)
    this.setElementContent("location", data.location)
    this.setElementContent("website", data.website)
    this.setElementContent("summary", data.summary)
    this.setElementContent("skills", data.skills)

    // Foto de perfil
    if (data.profilePhoto) {
      this.loadProfilePhoto(data.profilePhoto)
    }

    // Experiencia
    if (data.experience && data.experience.length > 0) {
      this.loadExperienceData(data.experience)
    }

    // Educación
    if (data.education && data.education.length > 0) {
      this.loadEducationData(data.education)
    }

    // Certificados
    if (data.certificates && data.certificates.length > 0) {
      this.loadCertificatesData(data.certificates)
    }
  }

  // Establecer contenido de elemento
  setElementContent(id, content) {
    const element = document.getElementById(id)
    if (element && content) {
      element.textContent = content
    }
  }

  // Cargar foto de perfil
  loadProfilePhoto(photoData) {
    const photoDisplay = document.getElementById("profilePhotoDisplay")
    const deleteBtn = document.getElementById("deletePhotoBtn")

    if (!photoDisplay || !deleteBtn) return

    const placeholder = photoDisplay.querySelector(".photo-placeholder")
    if (placeholder) {
      placeholder.remove()
    }

    const img = document.createElement("img")
    img.src = photoData
    img.alt = "Foto de perfil"
    img.onclick = () => {
      if (window.modalManager) {
        window.modalManager.openModal(photoData)
      }
    }

    photoDisplay.innerHTML = ""
    photoDisplay.appendChild(img)
    deleteBtn.style.display = "inline-block"
  }

  // Cargar datos de experiencia
  loadExperienceData(experiences) {
    const container = document.getElementById("experienceContainer")
    if (!container) return

    container.innerHTML = ""

    experiences.forEach((exp) => {
      const experienceItem = this.createExperienceItem(exp)
      container.appendChild(experienceItem)
    })
  }

  // Cargar datos de educación
  loadEducationData(educations) {
    const container = document.getElementById("educationContainer")
    if (!container) return

    container.innerHTML = ""

    educations.forEach((edu) => {
      const educationItem = this.createEducationItem(edu)
      container.appendChild(educationItem)
    })
  }

  // Cargar certificados
  loadCertificatesData(certificates) {
    if (window.galleryManager) {
      window.galleryManager.certificates = certificates
      window.galleryManager.updateDisplay()
    }
  }

  // Crear elemento de experiencia
  createExperienceItem(data = {}) {
    const div = document.createElement("div")
    div.className = "experience-item"
    div.innerHTML = `
            <div class="experience-header">
                <h4 contenteditable="true" class="editable job-title" placeholder="Título del Puesto">${data.jobTitle || ""}</h4>
                <span contenteditable="true" class="editable job-period" placeholder="2020 - Presente">${data.jobPeriod || ""}</span>
            </div>
            <h5 contenteditable="true" class="editable company-name" placeholder="Nombre de la Empresa">${data.companyName || ""}</h5>
            <ul contenteditable="true" class="editable job-description" placeholder="• Describe tus responsabilidades y logros...">${data.jobDescription || "<li>Nueva responsabilidad</li>"}</ul>
        `
    return div
  }

  // Crear elemento de educación
  createEducationItem(data = {}) {
    const div = document.createElement("div")
    div.className = "education-item"
    div.innerHTML = `
            <div class="education-header">
                <h4 contenteditable="true" class="editable degree-title" placeholder="Título/Grado">${data.degreeTitle || ""}</h4>
                <span contenteditable="true" class="editable education-period" placeholder="2015 - 2019">${data.educationPeriod || ""}</span>
            </div>
            <h5 contenteditable="true" class="editable institution-name" placeholder="Institución">${data.institutionName || ""}</h5>
        `
    return div
  }
}

// Instancia global
window.storageManager = new StorageManager()
