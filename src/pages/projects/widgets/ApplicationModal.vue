<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import { applicationsService } from '../../../services/api/applications.service'
import type { PublicProjectDisplay } from '../../../types/projects.types'

const props = defineProps<{
  project: PublicProjectDisplay
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'application-submitted': []
}>()

const { init: notify } = useToast()

const formData = ref({
  message: '',
  cv_link: '',
  relevant_skills: [] as string[],
})

const newSkill = ref('')
const isSubmitting = ref(false)

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const addSkill = () => {
  const skill = newSkill.value.trim()
  if (skill && !formData.value.relevant_skills.includes(skill)) {
    formData.value.relevant_skills.push(skill)
    newSkill.value = ''
  }
}

const removeSkill = (skill: string) => {
  formData.value.relevant_skills = formData.value.relevant_skills.filter((s) => s !== skill)
}

const isFormValid = computed(() => {
  return formData.value.message.trim().length >= 50
})

const submitApplication = async () => {
  if (!isFormValid.value) {
    notify({
      message: 'Lütfen en az 50 karakter uzunluğunda bir mesaj yazın',
      color: 'warning',
    })
    return
  }

  isSubmitting.value = true

  try {
    await applicationsService.createApplication({
      p_project_id: props.project.id,
      p_message: formData.value.message,
      p_cv_link: formData.value.cv_link || null,
      p_relevant_skills: formData.value.relevant_skills,
    })

    notify({
      message: 'Başvurunuz başarıyla gönderildi!',
      color: 'success',
    })

    emit('application-submitted')
    closeModal()
  } catch (error: any) {
    notify({
      message: error.message || 'Başvuru gönderilirken hata oluştu',
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  formData.value = {
    message: '',
    cv_link: '',
    relevant_skills: [],
  }
  newSkill.value = ''
  showModal.value = false
}
</script>

<template>
  <VaModal v-model="showModal" size="large" :before-close="closeModal">
    <template #header>
      <h2 class="va-h4">Ortaklık Başvurusu</h2>
    </template>

    <div class="application-modal-content">
      <!-- Project Info -->
      <VaCard class="mb-4" color="background-element">
        <VaCardContent>
          <div class="flex items-start gap-3">
            <VaIcon name="folder_shared" size="large" color="primary" />
            <div class="flex-1">
              <h3 class="va-h6 mb-1">{{ project.title }}</h3>
              <div class="flex items-center gap-2 text-sm text-secondary mb-2">
                <VaBadge :text="project.field_type" />
                <span>•</span>
                <span>{{ project.owner.full_name }}</span>
              </div>
              <p class="text-sm line-clamp-2">{{ project.description }}</p>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Required Skills Match -->
      <div v-if="project.required_skills.length > 0" class="mb-4">
        <label class="va-text-bold mb-2 block">Aranan Yetenekler</label>
        <div class="flex flex-wrap gap-2">
          <VaChip
            v-for="skill in project.required_skills"
            :key="skill"
            size="small"
            color="primary"
            outline
          >
            {{ skill }}
          </VaChip>
        </div>
      </div>

      <!-- Application Form -->
      <VaDivider class="my-4" />

      <!-- Message -->
      <div class="mb-4">
        <VaTextarea
          v-model="formData.message"
          label="Başvuru Mesajı *"
          placeholder="Neden bu projeye katılmak istiyorsunuz? Projede nasıl katkı sağlayabilirsiniz? (En az 50 karakter)"
          :min-rows="5"
          :max-rows="10"
          counter
          :max-length="1000"
          :error="formData.message.length > 0 && formData.message.length < 50"
          :error-messages="
            formData.message.length > 0 && formData.message.length < 50
              ? ['Mesaj en az 50 karakter olmalıdır']
              : []
          "
        />
        <p class="text-xs text-secondary mt-1">
          {{ formData.message.length }}/1000 karakter (minimum 50)
        </p>
      </div>

      <!-- CV/Portfolio Link -->
      <div class="mb-4">
        <VaInput
          v-model="formData.cv_link"
          label="CV veya Portfolio Linki (İsteğe bağlı)"
          placeholder="https://..."
          type="url"
        >
          <template #prependInner>
            <VaIcon name="link" size="small" />
          </template>
        </VaInput>
      </div>

      <!-- Relevant Skills -->
      <div class="mb-4">
        <label class="va-text-bold mb-2 block">İlgili Yetenekleriniz</label>
        <div class="flex gap-2 mb-2">
          <VaInput
            v-model="newSkill"
            placeholder="Yetenek ekleyin (örn: Python, Araştırma)"
            class="flex-1"
            @keyup.enter="addSkill"
          >
            <template #prependInner>
              <VaIcon name="add_circle" size="small" />
            </template>
          </VaInput>
          <VaButton @click="addSkill" :disabled="!newSkill.trim()"> Ekle </VaButton>
        </div>

        <div v-if="formData.relevant_skills.length > 0" class="flex flex-wrap gap-2">
          <VaChip
            v-for="skill in formData.relevant_skills"
            :key="skill"
            closeable
            color="success"
            @update:model-value="() => removeSkill(skill)"
          >
            {{ skill }}
          </VaChip>
        </div>
        <p v-else class="text-sm text-secondary">Henüz yetenek eklenmedi</p>
      </div>

      <!-- Info Alert -->
      <VaAlert color="info" border="left" class="mb-4">
        <template #icon>
          <VaIcon name="info" />
        </template>
        <div class="text-sm">
          <p class="font-semibold mb-1">Başvuru Sonrası</p>
          <ul class="list-disc list-inside">
            <li>Proje sahibi başvurunuzu inceleyecektir</li>
            <li>Durum değişikliklerinden bildirim alacaksınız</li>
            <li>Başvurunuzu "Başvurularım" sayfasından takip edebilirsiniz</li>
          </ul>
        </div>
      </VaAlert>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton preset="secondary" @click="closeModal" :disabled="isSubmitting">
          İptal
        </VaButton>
        <VaButton
          @click="submitApplication"
          :loading="isSubmitting"
          :disabled="!isFormValid || isSubmitting"
        >
          <VaIcon name="send" class="mr-1" />
          Başvuru Gönder
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<style scoped>
.application-modal-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.5rem;
}
</style>
