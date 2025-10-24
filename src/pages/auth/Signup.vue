<template>
  <div>
    <VaForm v-if="!showOnboarding" ref="form" @submit.prevent="submit">
      <h1 class="font-semibold text-4xl mb-4">Sign up</h1>
      <p class="text-base mb-4 leading-5">
        Have an account?
        <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary">Login</RouterLink>
      </p>
      <VaInput
        v-model="formData.fullName"
        :rules="[]"
        class="mb-4"
        label="Full Name (Optional)"
        placeholder="Enter your full name"
      />
      <VaInput
        v-model="formData.email"
        :rules="emailRules"
        :loading="emailChecking"
        class="mb-4"
        label="Email"
        type="email"
        placeholder="Enter your email address"
        @update:modelValue="checkEmail"
      >
        <template #appendInner>
          <VaIcon v-if="emailAvailable === true" name="check_circle" color="success" size="small" />
          <VaIcon v-else-if="emailAvailable === false" name="error" color="danger" size="small" />
        </template>
      </VaInput>
      <VaValue v-slot="isPasswordVisible" :default-value="false">
        <VaInput
          ref="password1"
          v-model="formData.password"
          :rules="passwordRules"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="mb-4"
          label="Password"
          messages="Password should be 8+ characters: letters, numbers, and special characters."
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
        >
          <template #appendInner>
            <VaIcon
              :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
            />
          </template>
        </VaInput>
        <VaInput
          ref="password2"
          v-model="formData.repeatPassword"
          :rules="[
            (v) => !!v || 'Repeat Password field is required',
            (v) => v === formData.password || 'Passwords don\'t match',
          ]"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="mb-4"
          label="Repeat Password"
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
        >
          <template #appendInner>
            <VaIcon
              :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
            />
          </template>
        </VaInput>
      </VaValue>

      <div class="flex justify-center mt-4">
        <VaButton
          class="w-full"
          :loading="isSubmitting || isLoading"
          :disabled="isSubmitting || isLoading || emailAvailable === false"
          @click="submit"
        >
          Create account
        </VaButton>
      </div>

      <!-- Error Display -->
      <VaAlert v-if="error" class="mt-4" color="danger" variant="outline" :model-value="true">
        {{ error }}
      </VaAlert>
    </VaForm>

    <!-- Progressive 3-step Onboarding card -->
    <VaCard v-if="showOnboarding" class="mt-8 max-w-2xl mx-auto">
      <VaCardTitle class="flex items-center justify-between px-8 py-6">
        <span class="text-2xl font-semibold flex items-center gap-3">
          <VaIcon name="account_circle" size="large" color="primary" class="text-[2.5rem]" />
          <span>Welcome</span>
        </span>
        <span class="text-base text-muted flex items-center gap-2">
          <VaIcon name="flag" size="large" />
          <span>Step {{ step }} of 3</span>
        </span>
      </VaCardTitle>

      <VaCardContent class="px-8 pb-8">
        <div class="mb-6">
          <div class="w-full h-3 bg-[rgba(0,0,0,0.08)] rounded-full overflow-hidden">
            <div class="h-full bg-primary" :style="{ width: `${Math.round((step / 3) * 100)}%` }"></div>
          </div>
        </div>

        <VaForm ref="onboard" @submit.prevent="nextStep">
          <!-- Step 1: Basic profile -->
          <div v-show="step === 1">
            <p class="mb-6 text-lg text-muted flex items-center gap-2">Tell us how you'd like others to see you.</p>
            <VaInput
              id="onboard-fullname"
              v-model="onboarding.full_name"
              label="Full name"
              placeholder="Full name"
              class="mb-6 text-lg"
              size="large"
            />
            <VaInput
              id="onboard-username"
              v-model="onboarding.username"
              label="Username"
              placeholder="Preferred username (e.g. jane_doe)"
              class="mb-6 text-lg"
              size="large"
            />
          </div>

          <!-- Step 2: Skills -->
          <div v-show="step === 2">
            <p class="mb-6 text-lg text-muted flex items-center gap-2">
              <VaIcon name="stars" /> Share 2–4 top skills — keep it short.
            </p>
            <VaInput
              id="onboard-skills"
              v-model="onboarding.skills"
              label="Top skills"
              placeholder="e.g. Python, Vue"
              class="mb-6 text-lg"
              size="large"
            />
            <VaCheckbox
              v-model="onboarding.available_for_collaboration"
              label="Available for collaboration"
              class="text-lg"
              size="large"
            />
          </div>

          <!-- Step 3: Finish -->
          <div v-show="step === 3">
            <p class="mb-6 text-lg text-muted flex items-center gap-2">
              <VaIcon name="task_alt" /> Almost done — review and finish.
            </p>
            <div class="mb-6 p-6 bg-gray-50 rounded-lg">
              <div class="text-lg mb-4 flex items-center gap-2">
                <VaIcon name="person" />
                <strong>Name:</strong> {{ onboarding.full_name || '(not set)' }}
              </div>
              <div class="text-lg mb-4 flex items-center gap-2">
                <VaIcon name="alternate_email" />
                <strong>Username:</strong> {{ onboarding.username || '(not set)' }}
              </div>
              <div class="text-lg mb-4 flex items-center gap-2">
                <VaIcon name="stars" />
                <strong>Skills:</strong> {{ onboarding.skills || '(not set)' }}
              </div>
              <div class="text-lg flex items-center gap-2">
                <VaIcon name="group" />
                <strong>Available:</strong>
                {{ onboarding.available_for_collaboration ? 'Yes' : 'No' }}
                <VaIcon
                  :name="onboarding.available_for_collaboration ? 'check_circle' : 'cancel'"
                  :color="onboarding.available_for_collaboration ? 'success' : 'danger'"
                  size="small"
                />
              </div>
            </div>
            <p class="text-sm text-muted">You can complete more details later from your profile settings.</p>
          </div>

          <div class="flex justify-between items-center mt-8">
            <div>
              <VaButton variant="flat" color="secondary" :disabled="step === 1" size="large" @click="prevStep">
                <VaIcon name="arrow_back" /> Back
              </VaButton>
            </div>
            <div class="flex gap-4">
              <VaButton color="secondary" variant="flat" size="large" @click="skipOnboarding">
                <VaIcon name="fast_forward" /> Skip
              </VaButton>
              <VaButton color="primary" :loading="isSaving" size="large" @click="handleNextClick">
                <span class="flex items-center gap-1">
                  {{ step === 3 ? 'Finish' : 'Next' }}
                  <VaIcon :name="step === 3 ? 'done_all' : 'arrow_forward'" />
                </span>
              </VaButton>
            </div>
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { useAuth } from '../../composables/useAuth'

// Signup form validator
const { validate: validateSignup } = useForm('form')
const { push } = useRouter()
const { init } = useToast()

const { signup, isLoading, error, checkEmailAvailability, updateProfile, user } = useAuth()

const formData = reactive({
  email: '',
  password: '',
  repeatPassword: '',
  fullName: '',
})

const isSubmitting = ref(false)
const emailAvailable = ref<boolean | null>(null)
const emailChecking = ref(false)

// Onboarding state
const showOnboarding = ref(false)
const isSaving = ref(false)
const step = ref(1)

const onboarding = reactive({
  full_name: '',
  username: '',
  title: '',
  bio: '',
  institution: '',
  department: '',
  orcid_id: '',
  linkedin_url: '',
  website_url: '',
  expertise_areas: '', // comma separated
  skills: '', // comma separated
  location: '',
  available_for_collaboration: false,
})

// Check email availability with debounce
let emailCheckTimeout: NodeJS.Timeout
const checkEmail = async () => {
  if (!formData.email || formData.email.length < 5) {
    emailAvailable.value = null
    return
  }

  emailChecking.value = true
  clearTimeout(emailCheckTimeout)

  emailCheckTimeout = setTimeout(async () => {
    try {
      emailAvailable.value = await checkEmailAvailability(formData.email)
    } catch (error) {
      emailAvailable.value = null
    } finally {
      emailChecking.value = false
    }
  }, 500)
}

const submit = async () => {
  if (!validateSignup()) return

  isSubmitting.value = true

  try {
    const result = await signup({
      email: formData.email,
      password: formData.password,
      data: {
        full_name: formData.fullName || undefined,
      },
    })

    console.log('Signup successful:', result)

    init({
      message: "You've successfully signed up! Welcome aboard!",
      color: 'success',
    })

    // Prefill onboarding with any available data
    onboarding.full_name = formData.fullName || (result.user?.full_name ?? '')
    if (result.user?.username) {
      onboarding.username = result.user.username as string
    } else if (!onboarding.username && formData.email) {
      onboarding.username = generateUsernameFromEmail(formData.email)
    }

    // Decide whether to show onboarding: show only when user lacks basic profile fields
    const hasProfileFields = !!(
      result.user?.full_name ||
      result.user?.username ||
      (result.user?.skills && result.user.skills.length > 0)
    )

    if (hasProfileFields) {
      // Profile already contains meaningful info — go straight to dashboard
      push({ name: 'dashboard' })
    } else {
      // No profile info — show lightweight onboarding
      showOnboarding.value = true
    }
  } catch (err: any) {
    console.error('Signup error:', err)
    init({
      message: err.message || 'Signup failed. Please try again.',
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}

// Generate a reasonable username from email local part
function generateUsernameFromEmail(email: string) {
  const local = email.split('@')[0] || ''
  return local
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30)
}

const validateCurrentStep = () => {
  if (step.value === 1) {
    if (!onboarding.full_name && !onboarding.username) {
      init({ message: 'Please add a name or username to continue.', color: 'danger' })
      return false
    }
  } else if (step.value === 2) {
    if (!onboarding.skills) {
      init({ message: 'Please add at least one skill to continue.', color: 'danger' })
      return false
    }
  }
  return true
}

const nextStep = async () => {
  console.log('nextStep called, current step:', step.value)

  if (!validateCurrentStep()) return

  if (step.value < 3) {
    step.value++
    console.log('Moving to step:', step.value)

    // Focus the skills input on step 2 for smooth UX
    if (step.value === 2) {
      await nextTick()
      const el = document.getElementById('onboard-skills') as HTMLInputElement | null
      el?.focus()
    }
  }
}

const handleNextClick = async () => {
  console.log('handleNextClick called, current step:', step.value)
  if (step.value === 3) {
    await finishOnboarding()
  } else {
    await nextStep()
  }
}

const prevStep = () => {
  console.log('prevStep called, current step:', step.value)
  if (step.value > 1) {
    step.value--
    console.log('Moving to step:', step.value)
  }
}

const finishOnboarding = async () => {
  if (!user.value?.id) {
    init({ message: 'No authenticated user found to update profile.', color: 'danger' })
    return
  }

  isSaving.value = true
  try {
    const payload: any = {
      full_name: onboarding.full_name || undefined,
      username: onboarding.username || undefined,
      available_for_collaboration: onboarding.available_for_collaboration,
    }

    if (onboarding.skills && onboarding.skills.trim().length > 0) {
      payload.skills = onboarding.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }

    await updateProfile(payload)
    init({ message: 'Profile saved — redirecting to dashboard', color: 'success' })
    push({ name: 'dashboard' })
  } catch (err: any) {
    console.error('Finish onboarding error:', err)
    init({ message: err.message || 'Could not save profile', color: 'danger' })
  } finally {
    isSaving.value = false
  }
}

const skipOnboarding = () => {
  push({ name: 'dashboard' })
}

const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'Password field is required',
  (v) => (v && v.length >= 8) || 'Password must be at least 8 characters long',
  (v) => (v && /[A-Za-z]/.test(v)) || 'Password must contain at least one letter',
  (v) => (v && /\d/.test(v)) || 'Password must contain at least one number',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'Password must contain at least one special character',
]

const emailRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'Email field is required',
  (v) => /.+@.+\..+/.test(v) || 'Email should be valid',
  () => emailAvailable.value !== false || 'Email is already taken',
]
</script>
