import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'
import { Gauge } from 'k6/metrics'
import { Rate } from 'k6/metrics'
import { Trend } from 'k6/metrics'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"


// Fase: Configuração
export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    checks: ['rate > 0.99'],
    http_req_failed: ['rate < 0.01'],
    http_req_duration: ['p(95) < 500']
  }
}

const chamadas = new Counter('- Quantidade de chamadas')
const myGauge = new Gauge('- Tempo bloqueado')
const myRate = new Rate('- Taxa de requisição status 200')
const myRate2 = new Rate('- Taxa de requisição com falha')
const myTrend = new Trend('- Taxa de espera')

// Fase: Execução
export default function(){
  const BASE_URL = 'https://test-api.k6.io/public/crocodiles'

  const response = http.get(BASE_URL)

  chamadas.add(1) // Contador

  myGauge.add(response.timings.blocked) // Medidor

  myRate.add(response.status === 200) // Taxa
  
  myRate2.add(response.status === 0 || response.status > 399) // Taxa

  myTrend.add(response.timings.waiting) // Tendência

  check(response, {
    'Status code 200': (response) => response.status === 200
  })
}

export function handleSummary(data) {
  return {
    "index.html": htmlReport(data), // Para gerar o report o nome do arquivo deve ser index.html.
  }
}