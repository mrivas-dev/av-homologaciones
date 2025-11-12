# AV Homologaciones v3

Plataforma moderna de gestión de homologaciones vehiculares en Argentina, construida con Next.js 15, Supabase y TypeScript.

## 🚀 Características

- **Monorepo** con Turborepo para desarrollo escalable
- **Frontend** con Next.js 15, React + TypeScript
- **Backend** con Supabase Edge Functions
- **Autenticación** via Supabase Auth (Google OAuth + email/password)
- **Pagos** integrados con MercadoPago
- **Bilingüe** (Español/Inglés) con next-intl
- **UI moderna** con Tailwind CSS + shadcn/ui
- **Estado global** con Redux Toolkit + RTK Query
- **Base de datos** PostgreSQL con Supabase
- **Almacenamiento** de archivos con Supabase Storage
- **Actualizaciones en tiempo real** con Supabase Realtime

## 📁 Estructura del Proyecto

```
av-homologaciones/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Supabase Edge Functions
├── packages/
│   ├── ui/                  # Componentes UI compartidos
│   ├── types/               # Tipos y schemas compartidos
│   └── config/              # Configuraciones compartidas
├── .github/workflows/       # GitHub Actions
└── turbo.json              # Configuración de Turborepo
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: Redux Toolkit + RTK Query
- **Formularios**: React Hook Form + Zod
- **Internacionalización**: next-intl
- **Autenticación**: Supabase Auth
- **Pagos**: MercadoPago SDK

### Backend
- **Base de datos**: PostgreSQL (Supabase)
- **API**: Supabase Edge Functions
- **Autenticación**: Supabase Auth con RLS
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel (frontend) + Supabase (backend)

## 📋 Prerrequisitos

- Node.js 18+
- pnpm 8+
- Cuenta de Supabase
- Cuenta de MercadoPago
- Cuenta de Vercel (para deploy)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd av-homologaciones
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # MercadoPago
   MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
   MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
   ```

4. **Iniciar desarrollo**
   ```bash
   pnpm dev
   ```
   
   Esto iniciará:
   - Frontend: http://localhost:3000
   - API Functions: http://localhost:54321

## 📚 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar todos los servicios en desarrollo
pnpm dev:web          # Iniciar solo el frontend
pnpm dev:api          # Iniciar solo las Edge Functions

# Build
pnpm build            # Build de todos los paquetes
pnpm build:web        # Build del frontend
pnpm build:api        # Build de las Edge Functions

# Lint y Type Check
pnpm lint             # Lint de todo el monorepo
pnpm type-check       # Type checking de todo el monorepo

# Deploy
pnpm deploy           # Deploy de producción
```

## 🌐 Despliegue

### Frontend (Vercel)

1. Conectar el repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Deploy automático en cada push a `main`

### Backend (Supabase)

1. Configurar proyecto Supabase
2. Deploy de Edge Functions:
   ```bash
   cd apps/api
   supabase functions deploy
   ```
3. Setup de tablas y RLS via SQL o Dashboard

## 📊 Base de Datos

El esquema incluye las siguientes tablas principales:

- `profiles` - Información de usuarios
- `vehicles` - Datos de vehículos
- `homologations` - Solicitudes de homologación
- `documents` - Documentos asociados
- `payments` - Información de pagos

## 🔐 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- **Autenticación** via Supabase Auth
- **Validación** de datos con Zod schemas
- **CORS** configurado para Edge Functions
- **Variables de entorno** para credenciales

## 🌍 Internacionalización

- Soporte para Español (default) e Inglés
- Configurado con next-intl
- URLs amigables: `/es/homologar`, `/en/homologate`

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@avhomologaciones.com
- Issues: [GitHub Issues](https://github.com/your-org/av-homologaciones/issues)
