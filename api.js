// "Будим" backend на бесплатном тарифе Render — первый запрос после простоя долгий.
async function wakeBackend() {
  try {
    await fetch(`${API_BASE_URL}/health`);
  } catch (e) {
    // не критично на этом этапе — просто не разбудили заранее
  }
}

async function fetchModels() {
  const res = await fetch(`${API_BASE_URL}/models`);
  if (!res.ok) {
    throw new Error("Не удалось загрузить список моделей");
  }
  return res.json();
}

async function calculate(payload) {
  const res = await fetch(`${API_BASE_URL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 400) {
      throw new Error(data.detail);
    }
    if (res.status === 422) {
      throw new Error("Проверьте введённые данные");
    }
    throw new Error("Ошибка сервера, попробуйте позже");
  }

  return data;
}
