<script setup>
import { ref, onMounted } from 'vue'

const voted = ref(false)
const loading = ref(false)

const options = [
  { id: 1, label: 'Использую', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/40', emoji: '✅' },
  { id: 2, label: 'Пробую', color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/40', emoji: '🚧' },
  { id: 3, label: 'Не использую', color: 'from-rose-500 to-rose-700', shadow: 'shadow-rose-500/40', emoji: '❌' }
]

onMounted(() => {
  if (localStorage.getItem('voted')) voted.value = true
})

const sendVote = async (id) => {
  if (loading.value) return
  loading.value = true
  
  try {
    await fetch('https://6822ee1fb342dce8004fe766.mockapi.io/api/v1/voting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice: id, createdAt: new Date().toISOString() })
    })
    localStorage.setItem('voted', 'true')
    voted.value = true
  } catch (e) {
    alert("Ошибка связи с сервером. Проверьте интернет.")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-[100dvh] bg-[#020617] p-4 flex flex-col items-center justify-center overflow-hidden relative">
    
    <div class="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
    <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full"></div>

    <div class="relative z-10 w-full max-w-sm">
      <div v-if="!voted" class="space-y-6">
        <header class="text-center space-y-2 mb-8">
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">Ваш выбор</h1>
          <div class="h-1 w-12 bg-white/20 mx-auto rounded-full"></div>
        </header>

        <div class="grid gap-4">
          <button v-for="opt in options" :key="opt.id" 
            @click="sendVote(opt.id)"
            :disabled="loading"
            class="relative w-full h-24 rounded-[2rem] bg-gradient-to-r text-white shadow-2xl transition-all duration-200 
                   active:scale-95 active:brightness-110 disabled:opacity-50 overflow-hidden"
            :class="[opt.color, opt.shadow]">
            
            <div class="flex items-center justify-between px-8">
              <span class="text-2xl font-black tracking-tight">{{ opt.label }}</span>
            </div>

            <div class="absolute top-0 left-0 w-full h-[1px] bg-white/30"></div>
          </button>
        </div>
        
        <p class="text-center text-white/30 text-[10px] uppercase tracking-[0.2em] pt-4">
          Нажмите на один из вариантов
        </p>
      </div>

      <div v-else class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl animate-scale-in">
        <div class="text-7xl mb-6 flex justify-center">
          <span class="animate-bounce">✨</span>
        </div>
        <h2 class="text-3xl font-black text-white uppercase tracking-tighter">Готово!</h2>
        <p class="text-white/50 mt-4 font-medium leading-tight">
          Ваш голос принят.<br>Результат обновится на экране.
        </p>
        <button @click="voted = false" class="mt-8 text-white/20 text-xs underline uppercase tracking-widest">
          Голосовать снова (тест)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Плавная анимация появления контента */
.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Отключаем выделение текста при тапах (важно для мобилок) */
button {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
</style>