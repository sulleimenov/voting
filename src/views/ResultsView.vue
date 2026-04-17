<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import QrcodeVue from 'qrcode.vue'

const stats = ref({ use: 0, try: 0, none: 0 })
const recentVotes = ref([]) // Новый массив для списка голосов
const voteUrl = window.location.origin
let pollingTimer = null

// Маппинг для отображения статусов в списке
const statusMap = {
	1: {
		label: 'Уже применяет',
		color: 'text-emerald-400',
		bg: 'bg-emerald-400/10',
	},
	2: { label: 'Пробует', color: 'text-amber-400', bg: 'bg-amber-400/10' },
	3: { label: 'Не применяет', color: 'text-rose-400', bg: 'bg-rose-400/10' },
}

const processApiData = (data) => {
	const newStats = { use: 0, try: 0, none: 0 }

	data.forEach((item) => {
		if (item.voice === 1) newStats.use++
		else if (item.voice === 2) newStats.try++
		else if (item.voice === 3) newStats.none++
	})

	// Сортируем последние голоса по дате (свежие сверху)
	const sorted = [...data].sort(
		(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
	)
	recentVotes.value = sorted.slice(0, 10) // Ограничим список 10-ю записями

	return newStats
}

const fetchVotes = async () => {
	try {
		const response = await fetch(
			'https://69c60516f272266f3eabc8e6.mockapi.io/voting',
		)
		const data = await response.json()
		stats.value = processApiData(data)
	} catch (error) {
		console.error('Ошибка при загрузке голосов:', error)
	}
}

const formatDate = (dateStr) => {
	const d = new Date(dateStr)
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
	fetchVotes()
	pollingTimer = setInterval(fetchVotes, 3000)
})

onUnmounted(() => {
	if (pollingTimer) clearInterval(pollingTimer)
})

const total = computed(
	() => stats.value.use + stats.value.try + stats.value.none,
)

const trafficLight = computed(() => [
	{
		id: 'use',
		label: 'Уже применяю',
		val: stats.value.use,
		color: 'from-emerald-400 to-green-600',
		shadow: 'shadow-green-500/40',
	},
	{
		id: 'try',
		label: 'Пробую',
		val: stats.value.try,
		color: 'from-orange-300 to-amber-500',
		shadow: 'shadow-amber-500/40',
	},
	{
		id: 'none',
		label: 'Не применяю',
		val: stats.value.none,
		color: 'from-rose-400 to-red-600',
		shadow: 'shadow-red-500/40',
	},
])
</script>

<template>
	<div
		class="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 lg:p-8 overflow-hidden"
	>
		<div
			class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"
		></div>

		<div
			class="relative z-10 flex flex-col xl:flex-row items-stretch gap-8 max-w-[95vw]"
		>
			<div
				class="flex flex-col gap-8 bg-white/5 backdrop-blur-xl p-10 lg:p-14 rounded-[3rem] border border-white/10 shadow-2xl justify-center"
			>
				<div
					v-for="item in trafficLight"
					:key="item.id"
					class="flex items-center gap-6 group"
				>
					<div
						:class="[
							item.color,
							item.shadow,
							'w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br shadow-[0_0_30px_-5px] relative overflow-hidden transition-transform duration-500 group-hover:scale-110',
						]"
					>
						<span class="text-white text-3xl font-black">{{ item.val }}</span>
					</div>
					<div class="flex flex-col">
						<span class="text-xl font-bold text-white/90">{{
							item.label
						}}</span>
						<div
							class="h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r"
							:class="item.color"
						></div>
					</div>
				</div>

				<div
					class="mt-4 pt-6 border-t border-white/10 flex items-center justify-between"
				>
					<span
						class="text-white/40 font-bold uppercase tracking-widest text-sm"
						>Всего голосов</span
					>
					<span class="text-white text-4xl font-black">{{ total }}</span>
				</div>
			</div>

			<div
				class="flex flex-col w-full xl:w-[450px] bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl"
			>
				<h3
					class="text-white/60 font-black text-xl mb-6 uppercase tracking-wider px-2"
				>
					Лента событий
				</h3>

				<div
					class="flex flex-col gap-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2"
				>
					<div
						v-for="vote in recentVotes"
						:key="vote.id"
						class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 animate-fade-in"
					>
						<div class="flex flex-col">
							<span class="text-xs text-white/30 font-mono mb-1"
								>ID: {{ vote.id }}</span
							>
							<span
								:class="['font-bold text-sm', statusMap[vote.voice]?.color]"
							>
								{{ statusMap[vote.voice]?.label }}
							</span>
						</div>
						<div class="text-right">
							<span class="text-white/50 text-xs block">{{
								formatDate(vote.createdAt)
							}}</span>
						</div>
					</div>

					<div
						v-if="recentVotes.length === 0"
						class="text-white/20 text-center py-10 italic"
					>
						Ожидание первых голосов...
					</div>
				</div>
			</div>

			<div
				class="flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl p-10 lg:p-14 rounded-[3rem] border border-white/10 shadow-2xl"
			>
				<div class="relative group">
					<div
						class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-1000"
					></div>
					<div class="relative bg-white p-4 rounded-2xl">
						<qrcode-vue
							:value="voteUrl + '/voting'"
							:size="220"
							level="H"
							render-as="svg"
							foreground="#0f172a"
						/>
					</div>
				</div>
				<div class="mt-8 text-center">
					<h3 class="text-white text-xl font-black uppercase tracking-tighter">
						Голосуй сейчас
					</h3>
					<p class="text-white/30 text-[10px] mt-2 font-mono break-all">
						{{ voteUrl }}/voting
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

body {
	font-family: 'Inter', sans-serif;
	margin: 0;
	color-scheme: dark;
}

.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 10px;
}

@keyframes fade-in {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
.animate-fade-in {
	animation: fade-in 0.5s ease-out forwards;
}
</style>
