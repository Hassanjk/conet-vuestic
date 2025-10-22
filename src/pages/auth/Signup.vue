<template>
  <VaForm ref="form" @submit.prevent="submit">
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
      @update:model-value="checkEmail"
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
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { useAuth } from '../../composables/useAuth'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const { signup, isLoading, error, checkEmailAvailability } = useAuth()

const formData = reactive({
  email: '',
  password: '',
  repeatPassword: '',
  fullName: '',
})

const isSubmitting = ref(false)
const emailAvailable = ref<boolean | null>(null)
const emailChecking = ref(false)

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
  if (!validate()) return

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

    // Small delay to ensure auth state is properly set, then redirect
    setTimeout(() => {
      push({ name: 'dashboard' })
    }, 1000)
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
