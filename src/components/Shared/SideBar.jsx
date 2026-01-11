import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Bars3Icon, 
    ChevronDownIcon, 
    ArrowRightOnRectangleIcon,
    // ICONOS
    UserGroupIcon, 
    UsersIcon, 
    ListBulletIcon,
    UserIcon, 
    ChartBarIcon, 
    ClipboardDocumentCheckIcon, 
    DocumentTextIcon ,
    ShoppingCartIcon
} from '@heroicons/react/24/outline'; 
import jwtUtils from 'utilities/Token/jwtUtils';
import { logout } from 'js/logout';
import logoImg from 'assets/img/logo_TU_BODEGA.png'; 
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { Home, Settings, ShoppingBasket, UserCircle2Icon } from 'lucide-react';

const menus = {
    admin: [
        { 
            section: 'Home', 
            icon: Home, 
            link: '/admin'
        },
        { 
            section: 'Roles', 
            icon: UserGroupIcon, 
            subs: [{ name: 'Listar Roles', link: '/admin/listar-roles' }] 
        },
        {
            section: 'Clientes',
            icon: UsersIcon,
            subs: [
                { name: 'Agregar Cliente', link: '/admin/agregar-cliente' },
                { name: 'Listar Clientes', link: '/admin/listar-clientes' },
            ]
        },
        {
            section: 'Cajeros',
            icon: UserCircle2Icon,
            subs: [
                { name: 'Agregar Cajero', link: '/admin/agregar-cajero' },
                { name: 'Listar Cajeros', link: '/admin/listar-cajeros' },
            ]
        },
        {
            section: 'Categorías',
            icon: ListBulletIcon,
            subs: [
                { name: 'Agregar Categoría', link: '/admin/agregar-categoria' },
                { name: 'Listar Categorías', link: '/admin/listar-categorias' },
            ]
        },
        {
            section: 'Proveedores',
            icon: UserIcon,
            subs: [
                { name: 'Agregar Proveedor', link: '/admin/agregar-proveedor' },
                { name: 'Listar Proveedores', link: '/admin/listar-proveedores' },
            ]
        },
       {
            section: 'Productos',
            icon: DocumentTextIcon,
            subs: [
                { name: 'Agregar Producto', link: '/admin/agregar-producto' },
                { name: 'Listar Productos', link: '/admin/listar-productos' },
            ]
        },
        {
            section: 'Compras',
            icon: ShoppingBasket,
            subs: [
                { name: 'Agregar Compra', link: '/admin/agregar-compra' },
                { name: 'Listar Compras', link: '/admin/listar-compras' },
            ]
        },
        {
            section: 'Reposiciones',
            icon: ChartBarIcon,
            subs: [
                { name: 'Agregar Reposición', link: '/admin/agregar-reposicion' },
                { name: 'Listar Reposiciones', link: '/admin/listar-reposiciones' },
            ]
        },
        {
            section: 'Kardex',
            icon: ClipboardDocumentCheckIcon,
            subs: [
                { name: 'Reporte Kardex', link: '/admin/reporte-kardex' },
            ]
        },
        {
            section: 'Configuración Negocio',
            icon: Settings,
            link: '/admin/configuracion-negocio'
        },
    ],
    cajero: [
        { 
            section: 'Home', 
            icon: Home, 
            link: '/cajero'
        },
        {
            section: 'Ventas',
            icon: ShoppingCartIcon,
            subs: [
                { name: 'Agregar Venta', link: '/cajero/agregar-venta' },
                { name: 'Listar Ventas', link: '/cajero/listar-ventas' },
            ]
        },
        {
            section: 'Comprobantes',
            icon: ListBulletIcon,
            subs: [
                { name: 'Listar Comprobantes', link: '/cajero/listar-comprobantes' },
            ]
        },
    ],
};

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [openSection, setOpenSection] = useState(null); 
    const [showConfirm, setShowConfirm] = useState(false);
    
    const location = useLocation();
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    const rol = refresh_token ? jwtUtils.getUserRole(refresh_token) : null;

    const roleMenu = useMemo(() => rol && menus[rol] ? menus[rol] : [], [rol]);

    const handleLogout = () => {
        logout();
        setShowConfirm(false);
    };

    const toggleSection = (section) => {
        if (!isHovered && window.innerWidth >= 768) setIsHovered(true);
        setOpenSection(prev => prev === section ? null : section);
    };

    const handleMouseEnter = () => {
        if (window.innerWidth >= 768) setIsHovered(true);
    };

    const handleMouseLeave = () => {
        if (window.innerWidth >= 768) setIsHovered(false);
    };

    const isSectionActive = useCallback((item) => {
        // 1. Prioridad a Submenús: Si tiene hijos, buscamos si alguno coincide
        if (item.subs) {
            return item.subs.some(sub => location.pathname.startsWith(sub.link));
        }

        // 2. Enlaces directos
        if (item.link) {
            // Para home, usamos igualdad exacta
            if (item.link === '/admin' || item.link === '/cajero') {
                return location.pathname === item.link;
            }

            // Para cualquier otro link directo que no sea home, mantenemos startsWith
            return location.pathname.startsWith(item.link);
        }

        return false;
    }, [location.pathname]);
    
    useEffect(() => {
        if (openSection === null) {
            const activeItem = roleMenu.find(item => isSectionActive(item));
            if (activeItem && activeItem.subs) setOpenSection(activeItem.section);
        }
    }, [location.pathname, roleMenu, isSectionActive, openSection]); 

    const sidebarWidth = isHovered ? 'md:w-64' : 'md:w-20';

    return (
        <>
            {/* Botón Hamburguesa (Móvil) - Negro para que resalte sobre tu contenido */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-md shadow-lg hover:bg-zinc-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Sidebar Container - FONDO BLANCO (bg-white) */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`fixed left-0 top-0 h-screen bg-white shadow-xl z-40 transition-all duration-300 ease-out flex flex-col
                    ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full'} 
                    ${sidebarWidth} md:translate-x-0 border-r border-gray-200`}
            >
                {/* 1. HEADER (Logo) - MODIFICADO */}
                <div className={`bg-white border-b border-gray-100 transition-all duration-300 flex items-center justify-center flex-shrink-0 relative z-10
                    /* Altura: En móvil 24 (96px), en Desktop cambia según hover */
                    h-24 ${isHovered ? 'md:h-40' : 'md:h-24'}`}>
                    
                    <img
                        src={logoImg}
                        alt="Logo"
                        className={`transition-all duration-300 object-contain
                            /* 1. MÓVIL (Clase base): Siempre grande cuando el menú está abierto */
                            w-40 h-auto
                            
                            /* 2. DESKTOP (md:): Lógica condicional */
                            ${isHovered 
                                ? 'md:w-48'      
                                : 'md:w-16 md:h-16' 
                            }
                        `}
                    />
                </div>

                {/* 2. BODY (Menú) */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {roleMenu.map((item, index) => {
                        const isActive = isSectionActive(item); 
                        const isSubOpen = item.subs && openSection === item.section; 
                        const IconComponent = item.icon || DocumentTextIcon;

                        const activeClasses = "bg-black text-white shadow-lg shadow-gray-400/40 font-medium"; 
                        const inactiveClasses = "text-gray-500 hover:text-black hover:bg-gray-100"; 

                        return (
                            <div key={index}>
                                {item.subs ? (
                                    <>
                                        {/* --- MENÚ CON SUBMENÚS --- */}
                                        <button
                                            onClick={() => toggleSection(item.section)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                                                ${isActive ? activeClasses : inactiveClasses}`}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <IconComponent className="h-6 w-6 min-w-[24px] flex-shrink-0" /> 
                                                <span className={`whitespace-nowrap transition-opacity duration-200 text-sm tracking-wide font-medium
                                                    ${!isHovered ? 'md:hidden md:opacity-0' : 'opacity-100'}`}>
                                                    {item.section}
                                                </span>
                                            </div>
                                            
                                            {(isHovered || window.innerWidth < 768) && (
                                                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isSubOpen ? 'rotate-180' : ''}`}/>
                                            )}
                                        </button>

                                        {/* Subitems */}
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                            {(isHovered || window.innerWidth < 768) && (
                                                <ul className="ml-4 pl-3 border-l-2 border-gray-100 space-y-1 my-1">
                                                    {item.subs.map((sub, idx) => (
                                                        <li key={idx}>
                                                            <Link
                                                                to={sub.link}
                                                                onClick={() => setIsOpen(false)}
                                                                className={`block py-2 px-3 rounded-lg text-sm transition-colors
                                                                    ${location.pathname.startsWith(sub.link) 
                                                                        ? 'text-black font-bold bg-gray-50' // Subitem activo
                                                                        : 'text-gray-400 hover:text-black hover:bg-gray-50'}`} // Subitem inactivo
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    /* --- MENÚ SIMPLE --- */
                                    <Link
                                        to={item.link}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200
                                            ${isActive ? activeClasses : inactiveClasses}`}
                                    >
                                        <IconComponent className="h-6 w-6 min-w-[24px] flex-shrink-0" />
                                        <span className={`whitespace-nowrap transition-opacity duration-200 text-sm tracking-wide font-medium
                                            ${!isHovered ? 'md:hidden md:opacity-0' : 'opacity-100'}`}>
                                            {item.section}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 3. FOOTER (Logout) */}
                <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:bg-black hover:text-white transition-all duration-200
                            ${!isHovered ? 'md:justify-center' : ''}`}
                        title="Cerrar Sesión"
                    >
                        <ArrowRightOnRectangleIcon className="h-6 w-6 min-w-[24px] flex-shrink-0" />
                        <span className={`whitespace-nowrap transition-opacity duration-200 text-sm font-medium
                            ${!isHovered ? 'md:hidden md:opacity-0' : 'opacity-100'}`}>
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            </div>

            {showConfirm && (
                <ConfirmModal
                    message="¿Deseas cerrar sesión?"
                    onConfirm={handleLogout}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default Sidebar;