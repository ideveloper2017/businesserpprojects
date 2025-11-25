/**
 * Вспомогательные функции для отладки
 */

/**
 * Логирует содержимое объекта FormData
 */
export function logFormData(formData: FormData, label: string = 'FormData'): void {
  console.log(`--- ${label} Content ---`);
  for (const pair of (formData as any).entries()) {
    console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File/Object' : pair[1]}`);
  }
  console.log('----------------------');
}

/**
 * Проверяет совместимость объекта с бэкенд-моделью
 */
export function validateBackendCompatibility(data: any, modelName: string): void {
  console.log(`Validating ${modelName} compatibility with backend:`, data);

  if (modelName === 'CreateCategoryRequest') {
    if (!data.name || typeof data.name !== 'string') {
      console.warn('name field is missing or invalid type');
    }

    if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
      console.warn('description field has invalid type');
    }

    if (data.parentCategoryId !== undefined && data.parentCategoryId !== null && 
        typeof data.parentCategoryId !== 'number') {
      console.warn('parentCategoryId field has invalid type');
    }
  }

  if (modelName === 'CreateProductRequest') {
    // Добавьте здесь валидацию для продуктов
  }
}

/**
 * Глубокое клонирование объекта с преобразованием типов для совместимости с бэкендом
 */
export function sanitizeForBackend<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForBackend(item));
  }

  if (data instanceof File) {
    return data;
  }

  const result: any = {};

  Object.entries(data as any).forEach(([key, value]) => {
    // Пропускаем служебные поля, которые не нужны бэкенду
    if (key.startsWith('_') || key === 'id' && !value) {
      return;
    }

    // Преобразуем undefined в null для совместимости с JSON
    if (value === undefined) {
      result[key] = null;
      return;
    }

    // Рекурсивно обрабатываем вложенные объекты
    if (typeof value === 'object' && value !== null && !(value instanceof File)) {
      result[key] = sanitizeForBackend(value);
      return;
    }

    result[key] = value;
  });

  return result;
}
