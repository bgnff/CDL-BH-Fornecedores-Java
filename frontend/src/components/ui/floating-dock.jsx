import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  Handshake,
  PanelBottomOpen,
  X
} from 'lucide-react';

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function FloatingDockMobile({ items, className }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className={cn('relative block md:hidden', className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full mb-3 inset-x-0 flex flex-col gap-2 items-center"
          >
            {items.map((item, idx) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      delay: idx * 0.05,
                    },
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'h-11 w-11 rounded-full flex items-center justify-center border shadow-lg transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:bg-accent'
                    )}
                    title={item.title}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl border border-primary/20 active:scale-95 transition-transform"
        aria-label="Menu Rápido"
      >
        {open ? <X className="h-5 w-5" /> : <PanelBottomOpen className="h-5 w-5" />}
      </button>
    </div>
  );
}

function FloatingDockDesktop({ items, className }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto hidden md:flex h-16 gap-3 items-end rounded-2xl bg-card/85 backdrop-blur-md px-3.5 pb-2.5 border border-border/80 shadow-2xl transition-all',
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
}

function IconContainer({ mouseX, title, icon: Icon, href }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const active = pathname === href;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [42, 68, 42]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [42, 68, 42]);
  const iconSizeTransform = useTransform(distance, [-150, 0, 150], [20, 32, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const iconSize = useSpring(iconSizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link to={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'relative rounded-xl flex items-center justify-center border transition-colors',
          active
            ? 'bg-primary text-primary-foreground border-primary shadow-md'
            : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border-border/60'
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 2, x: '-50%' }}
              className="px-2.5 py-1 whitespace-pre rounded-md bg-popover text-popover-foreground border border-border absolute left-1/2 -top-9 -translate-x-1/2 text-[11px] font-semibold shadow-lg pointer-events-none z-50"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
          <Icon className="w-full h-full" />
        </motion.div>
      </motion.div>
    </Link>
  );
}

/**
 * Atalhos pré-configurados do sistema para o FloatingDock
 */
export const defaultDockItems = [
  { title: 'Painel', icon: LayoutDashboard, href: '/' },
  { title: 'Fornecedores', icon: Users, href: '/fornecedores' },
  { title: 'Prestadores', icon: Briefcase, href: '/prestadores' },
  { title: 'Parceiros', icon: Handshake, href: '/parceiros' },
  { title: 'Beneficiários', icon: HeartHandshake, href: '/beneficiarios' },
  { title: 'Projetos', icon: FolderKanban, href: '/projetos' },
  { title: 'Auditoria', icon: ShieldCheck, href: '/auditoria' },
];

export default FloatingDock;
