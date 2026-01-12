import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Bars3Icon, 
    ChevronDownIcon, 
    ArrowRightOnRectangleIcon,
    UserGroupIcon, 
    UsersIcon, 
    ListBulletIcon,
    UserIcon, 
    ChartBarIcon, 
    ClipboardDocumentCheckIcon, 
    DocumentTextIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline'; 
import { Building, Home, Settings, ShoppingBasket, UserCircle2Icon } from 'lucide-react';

import jwtUtils from 'utilities/Token/jwtUtils';
import { logout } from 'js/logout';
import logoImg from 'assets/img/logo_TU_BODEGA.png'; 
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

const menus = { 
    admin: [
        { section: 'Home', icon: Home, link: '/admin' },
        { section: 'Roles', icon: UserGroupIcon, subs: [{ name: 'Listar Roles', link: '/admin/listar-roles' }] },
        { section: 'Sedes', icon: Building, subs: [{ name: 'Agregar Sede', link: '/admin/agregar-sede' }, { name: 'Listar Sedes', link: '/admin/listar-sedes' }] },
        { section: 'Clientes', icon: UsersIcon, subs: [{ name: 'Agregar Cliente', link: '/admin/agregar-cliente' }, { name: 'Listar Clientes', link: '/admin/listar-clientes' }] },
        { section: 'Cajeros', icon: UserCircle2Icon, subs: [{ name: 'Agregar Cajero', link: '/admin/agregar-cajero' }, { name: 'Listar Cajeros', link: '/admin/listar-cajeros' }] },
        { section: 'Categorías', icon: ListBulletIcon, subs: [{ name: 'Agregar Categoría', link: '/admin/agregar-categoria' }, { name: 'Listar Categorías', link: '/admin/listar-categorias' }] },
        { section: 'Proveedores', icon: UserIcon, subs: [{ name: 'Agregar Proveedor', link: '/admin/agregar-proveedor' }, { name: 'Listar Proveedores', link: '/admin/listar-proveedores' }] },
        { section: 'Productos', icon: DocumentTextIcon, subs: [{ name: 'Agregar Producto', link: '/admin/agregar-producto' }, { name: 'Listar Productos', link: '/admin/listar-productos' }] },
        { section: 'Compras', icon: ShoppingBasket, subs: [{ name: 'Agregar Compra', link: '/admin/agregar-compra' }, { name: 'Listar Compras', link: '/admin/listar-compras' }] },
        { section: 'Ventas', icon: ShoppingCartIcon, subs: [{ name: 'Listar Ventas', link: '/admin/listar-ventas' }] },
        { section: 'Comprobantes', icon: ListBulletIcon, subs: [{ name: 'Listar Comprobantes', link: '/admin/listar-comprobantes' }] },
        { section: 'Reposiciones', icon: ChartBarIcon, subs: [{ name: 'Agregar Reposición', link: '/admin/agregar-reposicion' }, { name: 'Listar Reposiciones', link: '/admin/listar-reposiciones' }] },
        { section: 'Kardex', icon: ClipboardDocumentCheckIcon, subs: [{ name: 'Reporte Kardex', link: '/admin/reporte-kardex' }] },
        { section: 'Configuración', icon: Settings, link: '/admin/configuracion-negocio' },
    ],
    cajero: [
        { section: 'Home', icon: Home, link: '/cajero' },
        { section: 'Ventas', icon: ShoppingCartIcon, subs: [{ name: 'Agregar Venta', link: '/cajero/agregar-venta' }, { name: 'Listar Ventas', link: '/cajero/listar-ventas' }] },
        { section: 'Comprobantes', icon: ListBulletIcon, subs: [{ name: 'Listar Comprobantes', link: '/cajero/listar-comprobantes' }] },
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

    const handleLogout = () => { logout(); setShowConfirm(false); };
    
    const toggleSection = (section) => { 
        if (!isHovered && window.innerWidth >= 768) setIsHovered(true); 
        setOpenSection(prev => prev === section ? null : section); 
    };

    const handleMouseEnter = () => { if (window.innerWidth >= 768) setIsHovered(true); };
    const handleMouseLeave = () => { if (window.innerWidth >= 768) setIsHovered(false); };

    const isSectionActive = useCallback((item) => {
        if (item.subs) return item.subs.some(sub => location.pathname.startsWith(sub.link));
        if (item.link) {
            if (item.link === '/admin' || item.link === '/cajero') return location.pathname === item.link;
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

    const sidebarWidth = isHovered ? 'md:w-72' : 'md:w-[5.5rem]';

    return (
        <>
            {/* Botón Móvil */}
            <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-md shadow-lg hover:bg-zinc-800 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Sidebar Container */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`fixed left-0 top-0 h-screen bg-white shadow-xl z-40 transition-all duration-300 ease-out flex flex-col border-r border-gray-200
                    ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full'} 
                    ${sidebarWidth} md:translate-x-0`}
            >
                {/* 1. HEADER (Logo) */}
                <div className={`bg-white border-b border-gray-100 transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 relative z-10 overflow-hidden
                    ${isHovered ? 'md:h-32 py-4' : 'md:h-24 py-2'}`}>
                    
                    <img
                        src={logoImg}
                        alt="Logo"
                        className={`transition-all duration-300 object-contain
                            /* LOGO MÁS GRANDE CUANDO ESTÁ COLAPSADO */
                            ${isHovered ? 'w-32 md:w-40 h-auto' : 'w-12 h-12'}
                        `}
                    />
                </div>

                {/* 2. BODY (Menú) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {roleMenu.map((item, index) => {
                        const isActive = isSectionActive(item); 
                        const isSubOpen = item.subs && openSection === item.section; 
                        const IconComponent = item.icon || DocumentTextIcon;
                        
                        const itemBaseClasses = "flex items-center w-full p-3 mx-2 rounded-xl transition-all duration-200 group relative";
                        const activeClasses = "bg-black text-white shadow-md shadow-gray-300 font-medium"; 
                        const inactiveClasses = "text-gray-600 hover:text-black hover:bg-gray-100"; 
                        const contentWidth = isHovered ? "w-[calc(100%-16px)]" : "w-auto justify-center";

                        return (
                            <div key={index} className="px-1">
                                {item.subs ? (
                                    <>
                                        <button 
                                            onClick={() => toggleSection(item.section)} 
                                            className={`${itemBaseClasses} ${isActive ? activeClasses : inactiveClasses} ${contentWidth}`}
                                            title={!isHovered ? item.section : ''}
                                        >
                                            <IconComponent className={`h-6 w-6 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'}`} /> 
                                            
                                            <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 text-sm tracking-wide 
                                                ${!isHovered ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                                {item.section}
                                            </span>

                                            {(isHovered || window.innerWidth < 768) && (
                                                <ChevronDownIcon className={`ml-auto h-3.5 w-3.5 transition-transform duration-300 ${isSubOpen ? 'rotate-180' : ''}`}/>
                                            )}
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                            {(isHovered || window.innerWidth < 768) && (
                                                <ul className="ml-9 border-l-2 border-gray-100 space-y-1 my-1 mr-4">
                                                    {item.subs.map((sub, idx) => (
                                                        <li key={idx}>
                                                            <Link to={sub.link} onClick={() => setIsOpen(false)} 
                                                                className={`block py-2 px-3 rounded-lg text-xs font-medium transition-colors truncate
                                                                ${location.pathname.startsWith(sub.link) ? 'text-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
                                                                {sub.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <Link to={item.link} onClick={() => setIsOpen(false)} 
                                        className={`${itemBaseClasses} ${isActive ? activeClasses : inactiveClasses} ${contentWidth}`}
                                        title={!isHovered ? item.section : ''}
                                    >
                                        {/* ICONOS MÁS GRANDES (h-6 w-6) */}
                                        <IconComponent className={`h-6 w-6 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'}`} />
                                        <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 text-sm tracking-wide 
                                            ${!isHovered ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
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
                    <button onClick={() => setShowConfirm(true)} 
                        className={`flex items-center w-full p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group
                        ${!isHovered ? 'justify-center' : ''}`} 
                        title="Cerrar Sesión">
                        
                        <ArrowRightOnRectangleIcon className="h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        
                        <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 text-sm font-medium 
                            ${!isHovered ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            </div>

            {showConfirm && (
                <ConfirmModal message="¿Deseas cerrar sesión?" onConfirm={handleLogout} onCancel={() => setShowConfirm(false)} />
            )}
        </>
    );
};

export default Sidebar;