<template>
  <div class="w-full max-w-[420px]">
    <VaForm ref="form" class="w-full" @submit.prevent="submit">
      <h1 class="font-semibold text-4xl mb-4">Log in</h1>
      <p class="text-base mb-4 leading-5">
        New to Vuestic?
        <RouterLink :to="{ name: 'signup' }" class="font-semibold text-primary">Sign up</RouterLink>
      </p>
      <VaInput
        v-model="formData.email"
        :rules="[validators.required, validators.email]"
        class="mb-4"
        label="Email"
        type="email"
      />
      <VaValue v-slot="isPasswordVisible" :default-value="false">
        <VaInput
          v-model="formData.password"
          :rules="[validators.required]"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="mb-4"
          label="Password"
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

      <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <VaCheckbox v-model="formData.keepLoggedIn" class="mb-2 sm:mb-0" label="Keep me signed in on this device" />
        <RouterLink :to="{ name: 'recover-password' }" class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary">
          Forgot password?
        </RouterLink>
      </div>

      <div class="flex justify-center mt-4">
        <VaButton
          class="w-full"
          :loading="isSubmitting || isLoading"
          :disabled="isSubmitting || isLoading"
          @click="submit"
        >
          Login
        </VaButton>
      </div>

      <!-- Error Display -->
      <VaAlert v-if="error" class="mt-4" color="danger" variant="outline" :model-value="true">
        {{ error }}
      </VaAlert>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import { useAuth } from '../../composables/useAuth'

const { validate } = useForm('form')
const { push } = useRouter()
const $route = useRoute()
const { init } = useToast()
const { login, isLoading, error } = useAuth()

const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false,
})

const isSubmitting = ref(false)

const submit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    await login({
      email: formData.email,
      password: formData.password,
    })

    init({
      message: "You've successfully logged in",
      color: 'success',
    })

    // Redirect to intended route or dashboard
    const redirectTo = $route.query.redirect as string
    if (redirectTo) {
      push(redirectTo)
    } else {
      push({ name: 'dashboard' })
    }
  } catch (err: any) {
    init({
      message: err.message || 'Login failed. Please try again.',
      color: 'danger',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
