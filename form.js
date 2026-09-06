function setLoading(isLoading) {
  const btn = document.getElementById("calculate-btn");
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Считаем..." : "Рассчитать";
}

function showError(message) {
  const el = document.getElementById("error");
  el.textContent = message || "";
  el.hidden = !message;
}

function readFormValues() {
  const num = (id) => parseFloat(document.getElementById(id).value);
  return {
    diameter: num("diameter"),
    roughness: num("roughness"),
    angle: num("angle"),
    density_liquid: num("density_liquid"),
    density_gas: num("density_gas"),
    viscosity_liquid: num("viscosity_liquid"),
    viscosity_gas: num("viscosity_gas"),
    surface_tension: num("surface_tension"),
    vl_min: num("vl_min"),
    vl_max: num("vl_max"),
    vg_min: num("vg_min"),
    vg_max: num("vg_max"),
    resolution: parseInt(document.getElementById("resolution").value, 10),
    log_scale: document.getElementById("log_scale").checked,
    model: document.getElementById("model").value || null,
  };
}

function validateForm(values) {
  const requiredFields = [
    "diameter", "roughness", "angle",
    "density_liquid", "density_gas",
    "viscosity_liquid", "viscosity_gas", "surface_tension",
    "vl_min", "vl_max", "vg_min", "vg_max", "resolution",
  ];

  for (const field of requiredFields) {
    if (Number.isNaN(values[field])) {
      return "Заполните все поля";
    }
  }

  const positiveFields = [
    "diameter", "density_liquid", "density_gas",
    "viscosity_liquid", "viscosity_gas", "surface_tension",
    "vl_min", "vl_max", "vg_min", "vg_max",
  ];
  for (const field of positiveFields) {
    if (values[field] <= 0) {
      return "Значения должны быть положительными";
    }
  }

  if (values.resolution < 2 || values.resolution > 150) {
    return "Resolution должен быть от 2 до 150";
  }

  if (values.vl_min >= values.vl_max) {
    return "Минимум скорости жидкости должен быть меньше максимума";
  }

  if (values.vg_min >= values.vg_max) {
    return "Минимум скорости газа должен быть меньше максимума";
  }

  return null;
}

function buildPayload(values) {
  return {
    pipe: { diameter: values.diameter, roughness: values.roughness, angle: values.angle },
    fluid: {
      density_liquid: values.density_liquid,
      density_gas: values.density_gas,
      viscosity_liquid: values.viscosity_liquid,
      viscosity_gas: values.viscosity_gas,
      surface_tension: values.surface_tension,
    },
    velocity_liquid: { min: values.vl_min, max: values.vl_max },
    velocity_gas: { min: values.vg_min, max: values.vg_max },
    resolution: values.resolution,
    log_scale: values.log_scale,
    model: values.model,
  };
}

async function populateModels() {
  const select = document.getElementById("model");

  const autoOption = document.createElement("option");
  autoOption.value = "";
  autoOption.textContent = "Автоматически";
  select.appendChild(autoOption);

  try {
    const { models, pattern_legend } = await fetchModels();
    for (const model of models) {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      select.appendChild(option);
    }
    renderLegend(pattern_legend);
  } catch (e) {
    showError("Не удалось загрузить список моделей с сервера");
  }
}

async function handleCalculate() {
  showError(null);
  const values = readFormValues();
  const validationError = validateForm(values);
  if (validationError) {
    showError(validationError);
    return;
  }

  setLoading(true);
  try {
    const payload = buildPayload(values);
    const result = await calculate(payload);
    renderHeatmap(result.grid, result.code_matrix);
    renderLegend(result.pattern_legend);
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wakeBackend();
  populateModels();
  document.getElementById("calculate-btn").addEventListener("click", handleCalculate);
});
