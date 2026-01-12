/**
 * Procesa la respuesta de fetch y la ESTANDARIZA.
 * Siempre devuelve o lanza un objeto con un formato predecible.
 */
export const handleResponse = async (response) => {
    const result = await response.json();

    if (!response.ok) {
        const error = {
            type: 'error',
            message: result.message || 'Ocurrió un error inesperado.',
            details: result.errors ? Object.values(result.errors).flat() : undefined,
        };
        throw error;
    }

    if (result.current_page !== undefined) {
        return result; 
    }

    const success = {
        type: 'success',
        message: result.message || 'Operación realizada con éxito.',
        data: result.data || result,
    };
    return success;
};