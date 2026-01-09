import React from 'react';

const DOTS = '...';

/**
 * Función de utilidad para generar el rango de paginación.
 * No es un Hook, por eso no empieza con "use".
 */
const getPaginationRange = ({ totalPages, currentPage, siblingCount = 1 }) => {
  const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const totalPageNumbers = siblingCount + 5;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = range(1, leftItemCount);
    return [...leftRange, DOTS, totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = range(totalPages - rightItemCount + 1, totalPages);
    return [firstPageIndex, DOTS, ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  // Se añade un return por defecto para todos los casos posibles
  return range(1, totalPages);
};


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Ahora la llamada a la función está antes del "if", pero ya no es un Hook
  // por lo que no hay problema. La lógica sigue siendo la misma.
  const paginationRange = getPaginationRange({ currentPage, totalPages });

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8">
      <button
          onClick={() => onPageChange(currentPage - 1)}
          // Si currentPage es 1, se deshabilita
          disabled={currentPage === 1} 
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
          Anterior
      </button>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return <span key={`${pageNumber}-${index}`} className="px-4 py-2 text-sm font-medium text-gray-700">...</span>;
        }
        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`px-4 py-2 text-sm font-medium border rounded-md ${
              currentPage === pageNumber
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </button> 
        );
      })}

      <button
          onClick={() => onPageChange(currentPage + 1)}
          // Si currentPage es igual a totalPages, se deshabilita
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
          Siguiente
      </button>
    </nav>
  );
};

export default Pagination;