const userForm = document.getElementById('user-form')
const exerciseForm = document.getElementById('exercise-form')
const usersForm = document.getElementById('users-form')
const logsForm = document.getElementById('logs-form')
const output = document.getElementById('api-output')

userForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const result = await requestJson('/api/users', {
    method: 'POST',
    body: new URLSearchParams(new FormData(userForm)),
  })

  if (result.body.id) {
    document.getElementById('uid').value = result.body.id
    document.getElementById('log-user-id').value = result.body.id
  }

  showResponse(result)
})

exerciseForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const userId = document.getElementById('uid').value
  exerciseForm.action = `/api/users/${userId}/exercises`

  const result = await requestJson(exerciseForm.action, {
    method: 'POST',
    body: new URLSearchParams(new FormData(exerciseForm)),
  })

  showResponse(result)
})

usersForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  showResponse(await requestJson('/api/users'))
})

logsForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const userId = document.getElementById('log-user-id').value
  const query = new URLSearchParams()

  addQueryParam(query, 'from', document.getElementById('from').value)
  addQueryParam(query, 'to', document.getElementById('to').value)
  addQueryParam(query, 'limit', document.getElementById('limit').value)

  const queryString = query.toString()
  const url = `/api/users/${userId}/logs${queryString ? `?${queryString}` : ''}`

  logsForm.action = `/api/users/${userId}/logs`
  showResponse(await requestJson(url))
})

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const body = await response.json()

  return {
    status: response.status,
    body,
  }
}

function addQueryParam(query, name, value) {
  if (value.trim() !== '') {
    query.set(name, value.trim())
  }
}

function showResponse(result) {
  output.textContent = JSON.stringify(result, null, 2)
}
