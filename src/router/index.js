import { createRouter, createWebHistory } from 'vue-router'
import VotingView from '@/views/VotingView.vue'
import ResultsView from '@/views/ResultsView.vue'

const routes = [
	{
		path: '/',
		name: 'results',
		component: ResultsView,
	},
	{
		path: '/voting',
		name: 'voting',
		component: VotingView,
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
